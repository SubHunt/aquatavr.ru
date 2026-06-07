from rest_framework import serializers
from .models import Order, OrderItem, Cart, CartItem
from catalog.serializers import ProductVariantSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer(read_only=True)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    product_image = serializers.SerializerMethodField()
    variant_details = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'variant', 'product_name', 'product_slug', 'product_image', 'variant_details', 'quantity', 'price')

    def get_product_image(self, obj):
        image = obj.variant.product.main_image
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.url)
            return image.url
        return None

    def get_variant_details(self, obj):
        v = obj.variant
        details = []
        if v.size: details.append(f"Размер: {v.size}")
        if v.thickness: details.append(f"Толщина: {v.thickness}")
        if v.color: details.append(f"Цвет: {v.color}")
        return ", ".join(details)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'full_name', 'email', 'phone', 'address', 'status', 'status_display', 
                  'total_price', 'created_at', 'items')

class CartItemSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer(read_only=True)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    product_image = serializers.SerializerMethodField()
    variant_details = serializers.SerializerMethodField()
    subtotal = serializers.DecimalField(source='total_price', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'variant', 'product_name', 'product_slug', 'product_image', 'variant_details', 'quantity', 'subtotal')

    def get_product_image(self, obj):
        image = obj.variant.product.main_image
        if image:
            request = self.context.get('request')
            if request: return request.build_absolute_uri(image.url)
            return image.url
        return None

    def get_variant_details(self, obj):
        v = obj.variant
        details = []
        if v.size: details.append(f"Размер: {v.size}")
        if v.thickness: details.append(f"Толщина: {v.thickness}")
        if v.color: details.append(f"Цвет: {v.color}")
        return ", ".join(details)

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total_price')
