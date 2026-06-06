import pandas as pd
import requests
import os
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from django.core.files.base import ContentFile
from catalog.models import Category, Brand, Product, ProductVariant, ProductImage
from transliterate import slugify as rus_slugify
from decimal import Decimal, InvalidOperation
from django.conf import settings
from concurrent.futures import ThreadPoolExecutor, as_completed

class Command(BaseCommand):
    help = 'Импорт товаров из Excel с SEO-именованиями изображений и исправлением атрибутов'

    def download_image_task(self, url, product_id, is_main, suffix=None):
        """Задача для одного потока: скачать и сохранить фото"""
        try:
            product = Product.objects.get(id=product_id)
            url = str(url).strip()
            if not url.startswith('http'):
                url = f"https://{url}"

            # Проверка расширения
            ext = os.path.splitext(url)[1].lower()
            if not ext or len(ext) > 5:
                ext = '.jpg'

            if not suffix:
                suffix = "main" if is_main else "extra"

            new_filename = f"{product.slug}-{suffix}{ext}"
            
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                content = ContentFile(response.content)
                img_obj = ProductImage.objects.create(
                    product=product,
                    external_url=url,
                    is_main=is_main
                )
                img_obj.image.save(new_filename, content, save=True)
                return f"OK: {new_filename}"
            return f"Error: Status {response.status_code} for {url}"
        except Exception as e:
            return f"Error: {str(e)} for {url}"

    def handle(self, *args, **options):
        file_path = 'docs/test.xlsx'
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'Файл {file_path} не найден'))
            return

        self.stdout.write("Очистка старых данных изображений...")
        ProductImage.objects.all().delete()

        df = pd.read_excel(file_path)
        df = df.astype(object).where(pd.notnull(df), None)

        self.stdout.write("Начало импорта товаров...")
        
        # Словарь для отслеживания уже запланированных загрузок: { (product_id, url): is_main }
        download_tasks_map = {}
        # Словарь для счетчиков доп. фото: { product_id: current_extra_count }
        extra_counters = {}

        with transaction.atomic():
            for index, row in df.iterrows():
                try:
                    # 1. Бренд
                    brand_name = row.get('Фильтр при выборе и Производитель')
                    brand = None
                    if brand_name:
                        brand_slug = rus_slugify(str(brand_name)) or f"brand-{index}"
                        brand, _ = Brand.objects.get_or_create(
                            name=str(brand_name),
                            defaults={'slug': brand_slug[:255]}
                        )

                    # 2. Категории
                    cat_levels = [
                        row.get('Название раздела'),
                        row.get('Название подраздела 1 уровня'),
                        row.get('Название подраздела 2 уровня')
                    ]

                    current_parent = None
                    for cat_name in cat_levels:
                        if cat_name:
                            cat_name_str = str(cat_name)
                            base_slug = rus_slugify(cat_name_str) or f"cat-{index}"
                            full_slug = f"{current_parent.slug}-{base_slug}" if current_parent else base_slug
                            
                            cat, _ = Category.objects.get_or_create(
                                name=cat_name_str,
                                parent=current_parent,
                                defaults={'slug': full_slug[:255]}
                            )
                            current_parent = cat

                    if not current_parent:
                        continue

                    # 3. Товар
                    product_id = row.get('ID элемента')
                    product_name = row.get('Наименование элемента')
                    if not product_name or not product_id:
                        continue
                    
                    product_id = int(product_id)
                    description = str(row.get('Детальное описание в формате html') or "")
                    unique_product_slug = f"{rus_slugify(str(product_name))}-{product_id}"

                    product, _ = Product.objects.update_or_create(
                        id=product_id,
                        defaults={
                            'name': str(product_name),
                            'slug': unique_product_slug[:255],
                            'category': current_parent,
                            'brand': brand,
                            'description': description
                        }
                    )

                    # 4. Вариант (SKU)
                    sku = row.get('Артикул для товара с торговыми предложениями/вариантами') or \
                          row.get('Артикул товара без торговых предложений/вариантов')
                    if not sku:
                        sku = f"SKU-{product_id}-{index}"

                    # Цены и остатки
                    price_val = row.get('Цена "Розничная цена" для товара с торговым предложением/вариантом') or \
                                row.get('Цена "Розничная цена"')
                    try: price = Decimal(str(price_val))
                    except: price = Decimal('0.00')
                    
                    stock_val = row.get('Доступное количество для конкретного торгового предложения/варианта товара') or \
                                row.get('Доступное количество')
                    try: stock = int(float(stock_val))
                    except: stock = 0

                    thickness = row.get('Фильтр при выборе и торговое предложение/вариант - Толщина:')
                    size = row.get('Фильтр при выборе и торговое предложение/вариант - Размер')
                    gun_length = row.get('Фильтр при выборе и торговое предложение/вариант - Длина ружья')
                    if gun_length and not size: size = f"L-{gun_length}"

                    ProductVariant.objects.update_or_create(
                        sku=str(sku)[:100],
                        defaults={
                            'product': product,
                            'price': price,
                            'stock': stock,
                            'thickness': str(thickness) if thickness else None,
                            'size': str(size) if size else None
                        }
                    )

                    # 5. Сбор ссылок на изображения
                    main_img_path = row.get('Детальная картинка (путь)')
                    if main_img_path:
                        url = str(main_img_path).strip()
                        key = (product_id, url)
                        if key not in download_tasks_map:
                            download_tasks_map[key] = {'is_main': True, 'suffix': 'main'}

                    extra_imgs = row.get('Картинки разделитель ;')
                    if extra_imgs:
                        img_list = str(extra_imgs).split(';')
                        for extra_path in img_list:
                            if extra_path and extra_path.strip():
                                url = extra_path.strip()
                                # Проверка на дубликат с главным фото
                                if main_img_path and url == str(main_img_path).strip():
                                    continue
                                
                                key = (product_id, url)
                                if key not in download_tasks_map:
                                    # Определяем номер суффикса
                                    count = extra_counters.get(product_id, 0) + 1
                                    extra_counters[product_id] = count
                                    download_tasks_map[key] = {'is_main': False, 'suffix': str(count)}

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Ошибка в строке {index}: {str(e)}'))

        # 6. Параллельная загрузка
        self.stdout.write(f"Запланировано загрузок: {len(download_tasks_map)}. Запуск потоков...")
        
        # Оптимальное количество потоков для I/O задач
        max_workers = 10 
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = []
            for (pid, url), info in download_tasks_map.items():
                futures.append(
                    executor.submit(self.download_image_task, url, pid, info['is_main'], info['suffix'])
                )
            
            for future in as_completed(futures):
                result = future.result()
                if result.startswith("OK"):
                    self.stdout.write(f"  - {result}")
                else:
                    self.stdout.write(self.style.WARNING(f"  - {result}"))

        self.stdout.write(self.style.SUCCESS('Импорт завершен!'))

