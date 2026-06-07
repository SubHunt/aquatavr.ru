from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, Brand
from .serializers import (
    CategorySerializer, 
    ProductListSerializer, 
    ProductDetailSerializer, 
    BrandSerializer
)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    pagination_class = None

class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    lookup_field = 'slug'

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand__slug']
    # Поиск теперь ищет только по названию (более точно)
    search_fields = ['name']
    ordering_fields = ['created_at', 'variants__price']

    def get_queryset(self):
        from django.db.models import Case, When, IntegerField, Max
        
        # Аннотируем товары максимальным остатком среди всех их вариантов
        queryset = Product.objects.filter(is_active=True).annotate(
            max_stock=Max('variants__stock')
        ).prefetch_related('images', 'variants', 'brand', 'category').distinct()
        
        # Сортировка: сначала те, у кого max_stock > 0, затем по дате создания
        queryset = queryset.order_by(
            Case(
                When(max_stock__gt=0, then=0),
                default=1,
                output_field=IntegerField(),
            ),
            '-created_at'
        )
        
        category_slug = self.request.query_params.get('category__slug')
        if category_slug:
            try:
                category = Category.objects.get(slug=category_slug)
                descendants = category.get_descendants(include_self=True)
                queryset = queryset.filter(category__in=descendants)
            except Category.DoesNotExist:
                pass

        # Фильтрация по брендам (несколько значений)
        brands = self.request.query_params.getlist('brand')
        if brands:
            queryset = queryset.filter(brand__slug__in=brands)

        # Фильтрация по характеристикам вариантов
        sizes = self.request.query_params.getlist('size')
        if sizes:
            queryset = queryset.filter(variants__size__in=sizes)

        thicknesses = self.request.query_params.getlist('thickness')
        if thicknesses:
            queryset = queryset.filter(variants__thickness__in=thicknesses)

        # Фильтрация по цене
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(variants__price__gte=min_price)
        if max_price:
            queryset = queryset.filter(variants__price__lte=max_price)
        
        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
