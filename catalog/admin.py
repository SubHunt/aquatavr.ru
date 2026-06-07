from django.contrib import admin
from django.utils.html import format_html
from mptt.admin import DraggableMPTTAdmin
from .models import Category, Brand, Product, ProductVariant, ProductImage

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    verbose_name = "Вариант"
    verbose_name_plural = "Варианты"

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ['preview']
    fields = ['image', 'external_url', 'is_main', 'preview']
    verbose_name = "Изображение"
    verbose_name_plural = "Изображения"

    def preview(self, obj):
        url = obj.image.url if obj.image else obj.external_url
        if url:
            return format_html('<img src="{}" style="max-height: 100px;"/>', url)
        return "-"
    preview.short_description = "Предпросмотр"

@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin):
    prepopulated_fields = {'slug': ('name',)}
    mptt_level_indent = 20

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['main_image', 'name', 'category', 'brand', 'is_active']
    list_filter = ['category', 'brand', 'is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline, ProductImageInline]

    def main_image(self, obj):
        img = obj.images.filter(is_main=True).first() or obj.images.first()
        if img:
            url = img.image.url if img.image else img.external_url
            return format_html('<img src="{}" style="max-height: 50px;"/>', url)
        return "-"
    main_image.short_description = "Фото"

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['sku', 'product', 'price', 'stock', 'thickness', 'size']
    list_filter = ['thickness', 'size']
    search_fields = ['sku', 'product__name']
