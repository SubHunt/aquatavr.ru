from django.contrib import admin
from .models import Order, OrderItem, Cart, CartItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    raw_id_fields = ('variant',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'status', 'total_price', 'created_at', 'is_one_click')
    list_filter = ('status', 'is_one_click', 'created_at')
    search_fields = ('id', 'full_name', 'email', 'phone')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'status', 'total_price')
        }),
        ('Контактные данные', {
            'fields': ('full_name', 'email', 'phone')
        }),
        ('Доставка', {
            'fields': ('address', 'sdek_pvz_code')
        }),
        ('Метаданные', {
            'fields': ('is_one_click', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    raw_id_fields = ('variant',)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_key', 'updated_at')
    inlines = [CartItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'variant', 'quantity', 'price')
    list_filter = ('order__status',)
    search_fields = ('order__id', 'variant__product__name')
