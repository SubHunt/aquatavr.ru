"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check, ShieldCheck, Truck, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  // CLEANUP UTILITY: Same as in ProductCard
  const cleanLabel = (val: string | null) => {
    if (!val) return "";
    const sizeCodes = ["XXXS", "XXS", "XS", "S", "M", "ML", "L", "XL", "XXL", "XXXL", "XXXXL"];
    const upper = val.toUpperCase().trim();
    for (const code of sizeCodes) {
      if (upper === code || upper.startsWith(code + " ") || upper.startsWith(code + "(") || upper.startsWith(code + "-")) {
        return code;
      }
    }
    const lengthMatch = val.match(/L-(\d+)/);
    if (lengthMatch) return lengthMatch[1] + " см";
    return val.split(/[ (]/)[0];
  };

  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${slug}/`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        const mainImg = data.images?.find((img: any) => img.is_main)?.image || data.images?.[0]?.image;
        setActiveImage(mainImg);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [slug]);

  // Sort variants professionally
  const sortedVariants = useMemo(() => {
    if (!product?.variants) return [];
    const sizeOrder = ["XXXS", "XXS", "XS", "S", "M", "ML", "L", "XL", "XXL", "XXXL", "XXXXL"];
    const normalize = (val: string | null) => val?.replace(/\s+/g, "").toUpperCase() || "";
    
    const getRank = (v: any) => {
      const val = normalize(v.size || v.thickness || "");
      if (!val) return 999;
      const index = sizeOrder.findIndex(s => val === s || val.startsWith(s + "(") || val.startsWith(s + "/"));
      return index !== -1 ? index : 900 + (parseInt(val) || 0);
    };

    return [...product.variants].sort((a, b) => getRank(a) - getRank(b));
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Set initial selected variant once loaded
  useEffect(() => {
    if (sortedVariants.length > 0 && !selectedVariant) {
      const firstAvailable = sortedVariants.find((v: any) => v.stock > 0);
      setSelectedVariant(firstAvailable || sortedVariants[0]);
    }
  }, [sortedVariants]);

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock === 0) return;
    setIsAdding(true);
    try {
      await addItem(selectedVariant.id, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="pt-40 text-center text-xl font-bold animate-pulse">Загрузка данных о товаре...</div>;
  if (!product) return <div className="pt-40 text-center text-xl">Товар не найден.</div>;

  const getImageUrl = (path: string) => path?.startsWith("http") ? path : `http://localhost:8000${path}`;

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container mx-auto px-4">
        <Link href="/catalog" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors font-bold">
          <ArrowLeft size={16} className="mr-2" />
          Назад в каталог
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 flex items-center justify-center p-8">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={getImageUrl(activeImage)} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              {product.images?.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img.image)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-gray-50 ${
                    activeImage === img.image ? "border-blue-600 scale-95 shadow-lg" : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <img src={getImageUrl(img.image)} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-4 py-2 rounded-full">
                {product.brand?.name || "Aquatavr"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">
              {product.name}
            </h1>

            <div className="flex items-center space-x-8 mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Стоимость</span>
                <div className="text-5xl font-black text-gray-900 tracking-tighter">
                  {selectedVariant ? `${Math.round(parseFloat(selectedVariant.price)).toLocaleString()} ₽` : "---"}
                </div>
              </div>
              <div className="self-end pb-1">
                {selectedVariant?.stock > 0 ? (
                  <div className="flex items-center text-green-500 bg-green-50 px-4 py-2 rounded-2xl text-sm font-black">
                    <Check size={18} className="mr-2" /> В наличии
                  </div>
                ) : (
                  <div className="text-red-400 bg-red-50 px-4 py-2 rounded-2xl text-sm font-black">
                    Нет в наличии
                  </div>
                )}
              </div>
            </div>

            {/* Variants */}
            {sortedVariants.length > 1 && (
              <div className="mb-10 p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Выберите размер / параметры:</h4>
                <div className="flex flex-wrap gap-3">
                  {sortedVariants.map((v: any) => {
                    const isOutOfStock = v.stock === 0;
                    const label = cleanLabel(v.size) || cleanLabel(v.thickness) || v.sku;
                    
                    return (
                      <button
                        key={v.id}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedVariant(v)}
                        className={`min-w-[60px] px-6 py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                          selectedVariant?.id === v.id
                            ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-105"
                            : isOutOfStock
                              ? "bg-white border-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                              : "bg-white border-white text-gray-700 hover:border-blue-200 shadow-sm"
                        }`}
                        title={isOutOfStock ? "Нет в наличии" : (v.size || v.thickness || "")}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding || !selectedVariant || selectedVariant.stock === 0}
                className={`flex-[2] ${isAdded ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"} text-white px-10 py-6 rounded-[1.5rem] font-black text-xl transition-all shadow-2xl shadow-blue-200 flex items-center justify-center space-x-4 active:scale-95 disabled:opacity-50 disabled:shadow-none`}
              >
                {isAdding ? <Loader2 size={28} className="animate-spin" /> : isAdded ? <Check size={28} /> : <ShoppingCart size={28} />}
                <span>{isAdded ? "Добавлено!" : "В корзину"}</span>
              </button>
              <button className="flex-1 px-10 py-6 rounded-[1.5rem] font-black text-lg border-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-95">
                В 1 клик
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-sm tracking-tight">Гарантия качества</div>
                  <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Оригинальный товар</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <Truck size={24} />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-sm tracking-tight">Быстрая доставка</div>
                  <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">По всей России</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-24">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-4 mb-10">
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Описание товара</h3>
              <div className="h-1 flex-grow bg-gray-50 rounded-full" />
            </div>
            <div 
              className="prose prose-blue max-w-none text-gray-600 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
