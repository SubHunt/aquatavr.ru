"use client";

import { useEffect, useState, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import { Search, Filter, SlidersHorizontal, ChevronRight, X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300000 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<{[key: string]: string[]}>({});

  const [availableBrands, setAvailableBrands] = useState<any[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableThickness, setAvailableThickness] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/categories/").then(res => res.json()),
      fetch("http://localhost:8000/api/brands/").then(res => res.json())
    ]).then(([categoriesData, brandsData]) => {
      setCategories(categoriesData.results || categoriesData);
      setBrands(brandsData.results || brandsData);
    }).catch(err => console.error("Metadata fetch error:", err));
  }, []);

  // Функция для нормализации строк (удаление лишних пробелов)
  const normalize = (val: string) => val?.replace(/\s+/g, "").toLowerCase() || "";

  // Эффект для подгрузки базовых данных категории
  useEffect(() => {
    const fetchBaseData = async () => {
      setLoading(true);
      const url = activeCategory 
        ? `http://localhost:8000/api/products/?category__slug=${activeCategory}`
        : "http://localhost:8000/api/products/";
      
      try {
        const res = await fetch(url);
        const data = await res.json();
        const rawProducts = data.results || data;

        // Бренды
        const brandIds = new Set(rawProducts.map((p: any) => p.brand?.id).filter(Boolean));
        setAvailableBrands(brands.filter(b => brandIds.has(b.id)));

        // Характеристики
        const sizes = new Set<string>();
        const thicknesses = new Set<string>();
        
        rawProducts.forEach((p: any) => {
          p.variants?.forEach((v: any) => {
            if (v.size) sizes.add(v.size);
            if (v.thickness) thicknesses.add(v.thickness);
          });
        });

        setAvailableSizes(Array.from(sizes));
        setAvailableThickness(Array.from(thicknesses));

        // Подкатегории
        if (activeCategory && categories.length > 0) {
          const currentCat = categories.find((c: any) => c.slug === activeCategory);
          if (currentCat) {
            setSubCategories(categories.filter((c: any) => c.parent === currentCat.id));
          } else {
            setSubCategories([]);
          }
        } else if (!activeCategory && categories.length > 0) {
          setSubCategories(categories.filter((c: any) => c.parent === null));
        }

        // Фильтрация товаров
        const filtered = rawProducts.filter((p: any) => {
          const price = parseFloat(p.min_price || 0);
          const matchesPrice = price >= priceRange.min && price <= priceRange.max;
          const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesBrands = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand.slug));
          
          let matchesAttrs = true;
          if (selectedAttributes.size?.length > 0) {
            matchesAttrs = matchesAttrs && p.variants.some((v: any) => 
              selectedAttributes.size.some(sel => normalize(sel) === normalize(v.size))
            );
          }
          if (selectedAttributes.thickness?.length > 0) {
            matchesAttrs = matchesAttrs && p.variants.some((v: any) => 
              selectedAttributes.thickness.some(sel => normalize(sel) === normalize(v.thickness))
            );
          }

          return matchesPrice && matchesSearch && matchesBrands && matchesAttrs;
        });

        setProducts(filtered);
      } catch (e) {
        console.error("Fetch products error:", e);
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchBaseData();
    }
  }, [activeCategory, brands, categories, priceRange, searchQuery, selectedBrands, selectedAttributes]);

  const handleCategoryClick = (slug: string | null) => {
    setSelectedAttributes({});
    setSelectedBrands([]);
    if (slug) router.push(`/catalog?category=${slug}`);
    else router.push('/catalog');
  };

  const toggleAttribute = (key: string, value: string) => {
    setSelectedAttributes(prev => {
      const current = prev[key] || [];
      const normValue = normalize(value);
      const exists = current.some(v => normalize(v) === normValue);
      const next = exists 
        ? current.filter(v => normalize(v) !== normValue) 
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const toggleBrand = (slug: string) => {
    setSelectedBrands(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  // Утилита для дедупликации и профессиональной сортировки размеров
  const getDisplayAttributes = (list: string[]) => {
    const map = new Map<string, string>();
    list.forEach(item => {
      const key = normalize(item);
      if (!map.has(key)) map.set(key, item);
    });

    const sizeOrder = ["XXXS", "XXS", "XS", "S", "M", "ML", "L", "XL", "XXL", "XXXL", "XXXXL"];
    
    const getRank = (val: string) => {
      const upperVal = val.toUpperCase();
      const index = sizeOrder.findIndex(s => 
        upperVal === s || upperVal.startsWith(s + " ") || upperVal.startsWith(s + "(")
      );
      return index !== -1 ? index : 999;
    };

    return Array.from(map.values()).sort((a, b) => {
      const rankA = getRank(a);
      const rankB = getRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  const currentCategoryName = categories.find((c: any) => c.slug === activeCategory)?.name;
  const displaySizes = getDisplayAttributes(availableSizes);
  const displayThickness = getDisplayAttributes(availableThickness);

  return (
    <div className="pt-40 pb-24 bg-gray-50/50 min-h-screen">
      <div className="container mx-auto px-4">
        
        {subCategories.length > 0 && (
          <div className="mb-12">
            <h3 className="text-base font-black text-gray-400 uppercase tracking-widest mb-6">
              {activeCategory ? `Разделы в: ${currentCategoryName}` : "Основные разделы"}
            </h3>
            <div className="flex flex-wrap gap-4">
              {subCategories.map((sc: any) => (
                <button
                  key={sc.id}
                  onClick={() => handleCategoryClick(sc.slug)}
                  className="bg-white border border-gray-100 px-8 py-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center space-x-4 group text-left min-w-[240px]"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ChevronRight size={22} />
                  </div>
                  <span className="text-lg font-bold text-gray-900">{sc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-80 space-y-10">
            {activeCategory && (
              <button 
                onClick={() => {
                  const current = categories.find((c: any) => c.slug === activeCategory);
                  const parent = categories.find((c: any) => c.id === current?.parent);
                  handleCategoryClick(parent?.slug || null);
                }}
                className="w-full flex items-center space-x-3 text-blue-600 font-bold hover:bg-blue-50 p-5 rounded-2xl transition-all mb-4 text-base"
              >
                <ChevronLeft size={20} />
                <span>Вернуться назад</span>
              </button>
            )}

            {/* Price Filter */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-base font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center">Цена (₽)</h3>
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <input type="number" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})} className="w-1/2 p-4 bg-gray-50 border border-gray-100 rounded-xl text-base font-bold focus:outline-none" />
                  <span className="text-gray-300">—</span>
                  <input type="number" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 0})} className="w-1/2 p-4 bg-gray-50 border border-gray-100 rounded-xl text-base font-bold focus:outline-none" />
                </div>
                <div className="relative h-2 w-full bg-gray-100 rounded-full">
                  <div className="absolute h-full bg-blue-600 rounded-full" style={{ left: `${(priceRange.min / 300000) * 100}%`, right: `${100 - (priceRange.max / 300000) * 100}%` }} />
                  <input type="range" min="0" max="300000" step="500" value={priceRange.min} onChange={(e) => { const val = parseInt(e.target.value); if (val <= priceRange.max) setPriceRange({...priceRange, min: val}); }} className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:rounded-full" />
                  <input type="range" min="0" max="300000" step="500" value={priceRange.max} onChange={(e) => { const val = parseInt(e.target.value); if (val >= priceRange.min) setPriceRange({...priceRange, max: val}); }} className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:rounded-full" />
                </div>
              </div>
            </div>

            {/* Brands Filter */}
            {availableBrands.length > 0 && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-base font-black text-gray-400 uppercase tracking-widest mb-8 text-blue-600">Бренды</h3>
                <div className="grid grid-cols-1 gap-4">
                  {availableBrands.map((brand: any) => (
                    <label key={brand.id} className="flex items-center space-x-4 cursor-pointer group">
                      <input type="checkbox" checked={selectedBrands.includes(brand.slug)} onChange={() => toggleBrand(brand.slug)} className="w-6 h-6 border-2 rounded-md accent-blue-600" />
                      <span className={`text-base font-bold transition-colors ${selectedBrands.includes(brand.slug) ? "text-blue-600" : "text-gray-700"}`}>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Size / Gun Length Filter */}
            {displaySizes.length > 0 && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 border-l-4 border-l-blue-600">
                <h3 className="text-base font-black text-blue-600 uppercase tracking-widest mb-8">
                  {activeCategory?.toLowerCase().includes("ruzhja") ? "Длина ружья" : "Размер"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {displaySizes.map((size) => {
                    const isSelected = selectedAttributes.size?.some(s => normalize(s) === normalize(size));
                    return (
                      <button
                        key={size}
                        onClick={() => toggleAttribute("size", size)}
                        className={`h-14 flex items-center justify-center rounded-xl text-sm font-black transition-all border-2 ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                            : "bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-400"
                        }`}
                      >
                        {size.startsWith("L-") ? size.replace("L-", "") : size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Thickness Filter */}
            {displayThickness.length > 0 && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-base font-black text-gray-400 uppercase tracking-widest mb-8 text-gray-900">Толщина</h3>
                <div className="grid grid-cols-2 gap-3">
                  {displayThickness.map((t) => {
                    const isSelected = selectedAttributes.thickness?.some(v => normalize(v) === normalize(t));
                    return (
                      <button
                        key={t}
                        onClick={() => toggleAttribute("thickness", t)}
                        className={`h-14 flex items-center justify-center rounded-xl text-sm font-black transition-all border-2 ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                            : "bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-200"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          <main className="flex-1">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-5xl font-black text-gray-900 mb-3">{activeCategory ? currentCategoryName : "Каталог товаров"}</h1>
                <p className="text-gray-500 text-base font-bold">Найдено {products.length} позиций</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCategory && <Tag label={currentCategoryName || ""} onClear={() => handleCategoryClick(null)} />}
                {selectedBrands.map(s => <Tag key={s} label={brands.find((b: any) => b.slug === s)?.name || s} onClear={() => toggleBrand(s)} />)}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3].map(i => <div key={i} className="h-[500px] bg-white border border-gray-100 rounded-[3rem] animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {products.map((product: any) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center text-xl font-bold">Загрузка каталога...</div>}>
      <CatalogContent />
    </Suspense>
  );
}

function CheckIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Tag({ label, onClear }: { label: string, onClear: () => void }) {
  return (
    <div className="flex items-center space-x-3 bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl text-sm font-black border border-blue-100 shadow-sm">
      <span>{label}</span>
      <button onClick={onClear} className="hover:text-blue-900 transition-colors"><X size={16} /></button>
    </div>
  );
}
