"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import { Search, Filter, ChevronRight, X, ChevronLeft, Loader2, ArrowRight } from "lucide-react";
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
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300000 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<{[key: string]: string[]}>({});

  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableThickness, setAvailableThickness] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setActiveCategory(categoryParam);
    setCurrentPage(1);
  }, [categoryParam]);

  // Initial metadata fetch
  useEffect(() => {
    fetch("http://localhost:8000/api/categories/")
      .then(res => res.json())
      .then(data => setCategories(data.results || data))
      .catch(err => console.error("Categories fetch error:", err));

    fetch("http://localhost:8000/api/brands/")
      .then(res => res.json())
      .then(data => setBrands(data.results || data))
      .catch(err => console.error("Brands fetch error:", err));
  }, []);

  const normalize = (val: string) => val?.replace(/\s+/g, "").toLowerCase() || "";

  const fetchProducts = useCallback(async (page: number, append: boolean = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    const params = new URLSearchParams();
    if (activeCategory) params.append("category__slug", activeCategory);
    if (searchQuery) params.append("search", searchQuery);
    params.append("min_price", priceRange.min.toString());
    params.append("max_price", priceRange.max.toString());
    params.append("page", page.toString());

    selectedBrands.forEach(b => params.append("brand", b));
    selectedAttributes.size?.forEach(s => params.append("size", s));
    selectedAttributes.thickness?.forEach(t => params.append("thickness", t));

    const url = `http://localhost:8000/api/products/?${params.toString()}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      
      const newProducts = data.results || [];
      setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
      setHasNextPage(!!data.next);
      setTotalCount(data.count || 0);

      if (!append && newProducts.length > 0) {
        const sizes = new Set<string>();
        const thicknesses = new Set<string>();
        newProducts.forEach((p: any) => {
          p.variants?.forEach((v: any) => {
            if (v.size) sizes.add(v.size);
            if (v.thickness) thicknesses.add(v.thickness);
          });
        });
        setAvailableSizes(Array.from(sizes));
        setAvailableThickness(Array.from(thicknesses));
      }
    } catch (e) {
      console.error("Fetch products error:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory, priceRange, searchQuery, selectedBrands, selectedAttributes]);

  // Handle subcategories separately whenever categories or activeCategory changes
  useEffect(() => {
    if (categories.length > 0) {
      if (activeCategory) {
        const currentCat = categories.find((c: any) => c.slug === activeCategory);
        if (currentCat) {
          const children = categories.filter((c: any) => c.parent === currentCat.id);
          setSubCategories(children);
        } else {
          setSubCategories([]);
        }
      } else {
        setSubCategories(categories.filter((c: any) => c.parent === null));
      }
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    fetchProducts(1, false);
    setCurrentPage(1);
  }, [activeCategory, priceRange, selectedBrands, selectedAttributes, searchQuery]);

  const loadMore = () => {
    if (hasNextPage && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

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
      const next = exists ? current.filter(v => normalize(v) !== normValue) : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const toggleBrand = (slug: string) => {
    setSelectedBrands(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const getDisplayAttributes = (list: string[]) => {
    const map = new Map<string, string>();
    list.forEach(item => {
      const key = normalize(item);
      if (!map.has(key)) map.set(key, item);
    });
    const sizeOrder = ["XXXS", "XXS", "XS", "S", "M", "ML", "L", "XL", "XXL", "XXXL", "XXXXL"];
    const getRank = (val: string) => {
      const upperVal = val.toUpperCase();
      const index = sizeOrder.findIndex(s => upperVal === s || upperVal.startsWith(s + " ") || upperVal.startsWith(s + "("));
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

  return (
    <div className="pt-40 pb-24 bg-gray-50/50 min-h-screen">
      <div className="container mx-auto px-4">
        
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
            {subCategories.length === 0 && (
              <div className="text-gray-400 italic text-sm">В этом разделе нет подразделов</div>
            )}
          </div>
        </div>

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

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Поиск по названию..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

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
                          isSelected ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-400"
                        }`}
                      >
                        {size.startsWith("L-") ? size.replace("L-", "") : size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {brands.length > 0 && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-base font-black text-gray-400 uppercase tracking-widest mb-8 text-blue-600">Бренды</h3>
                <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {brands.map((brand: any) => (
                    <label key={brand.id} className="flex items-center space-x-4 cursor-pointer group">
                      <input type="checkbox" checked={selectedBrands.includes(brand.slug)} onChange={() => toggleBrand(brand.slug)} className="w-6 h-6 border-2 rounded-md accent-blue-600" />
                      <span className={`text-base font-bold transition-colors ${selectedBrands.includes(brand.slug) ? "text-blue-600" : "text-gray-700"}`}>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <main className="flex-1">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-5xl font-black text-gray-900 mb-3">{activeCategory ? currentCategoryName : "Каталог товаров"}</h1>
                <p className="text-gray-500 text-base font-bold">Найдено {totalCount} позиций</p>
              </div>
            </div>

            {loading && currentPage === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[450px] bg-white border border-gray-100 rounded-[3rem] animate-pulse" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {products.map((product: any) => <ProductCard key={product.id} product={product} />)}
                </div>
                
                {hasNextPage && (
                  <div className="mt-16 flex justify-center">
                    <button 
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="group flex items-center space-x-3 px-12 py-5 bg-white border border-gray-100 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                      {loadingMore ? <Loader2 className="animate-spin text-blue-600" size={24} /> : (
                        <>
                          <span className="text-lg font-black text-gray-900">Показать еще</span>
                          <ArrowRight className="text-blue-600 group-hover:translate-x-2 transition-transform" size={24} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
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
