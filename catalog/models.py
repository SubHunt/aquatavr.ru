from django.db import models
from mptt.models import MPTTModel, TreeForeignKey

class Category(MPTTModel):
    name = models.CharField(max_length=255, verbose_name="Название")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="Слаг (URL)")
    parent = TreeForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name="Родительская категория")
    description = models.TextField(blank=True, verbose_name="Описание")
    image = models.ImageField(upload_to='categories/', blank=True, verbose_name="Изображение")

    class MPTTMeta:
        order_insertion_by = ['name']

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self):
        return self.name

class Brand(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="Слаг (URL)")
    logo = models.ImageField(upload_to='brands/', blank=True, verbose_name="Логотип")

    class Meta:
        verbose_name = "Бренд"
        verbose_name_plural = "Бренды"

    def __str__(self):
        return self.name

class Product(models.Model):
    category = TreeForeignKey(Category, on_delete=models.PROTECT, related_name='products', verbose_name="Категория")
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name="Бренд")
    name = models.CharField(max_length=255, verbose_name="Наименование")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="Слаг (URL)")
    description = models.TextField(verbose_name="Описание (HTML)")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"

    def __str__(self):
        return self.name

    @property
    def main_image(self):
        main_img = self.images.filter(is_main=True).first()
        if not main_img:
            main_img = self.images.first()
        return main_img.image if main_img else None

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', verbose_name="Товар")
    sku = models.CharField(max_length=100, unique=True, verbose_name="Артикул (SKU)")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    stock = models.PositiveIntegerField(default=0, verbose_name="Остаток")
    
    # Attributes
    thickness = models.CharField(max_length=50, blank=True, null=True, verbose_name="Толщина", help_text="Толщина неопрена (например, 5 мм)")
    size = models.CharField(max_length=50, blank=True, null=True, verbose_name="Размер", help_text="Размер (например, XL, 43-44)")
    color = models.CharField(max_length=50, blank=True, null=True, verbose_name="Цвет")
    
    is_default = models.BooleanField(default=False, verbose_name="Основной вариант")

    class Meta:
        verbose_name = "Вариант товара"
        verbose_name_plural = "Варианты товаров"

    def __str__(self):
        return f"{self.product.name} - {self.sku}"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', verbose_name="Товар")
    image = models.ImageField(upload_to='products/', verbose_name="Изображение")
    external_url = models.URLField(blank=True, null=True, verbose_name="Внешняя ссылка (Bitrix)")
    is_main = models.BooleanField(default=False, verbose_name="Главное фото")

    class Meta:
        verbose_name = "Изображение товара"
        verbose_name_plural = "Изображения товаров"
