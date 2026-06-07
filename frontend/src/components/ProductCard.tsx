"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Eye, Check, Loader2, ZoomIn } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface Variant {
  id: number;
  sku: string;
  price: string;
  stock: number;
  thickness: string | null;
  size: string | null;
  color: string | null;
  is_default: boolean;
}

interface ProductProps {
  product: {
    id: number;
    name: string;
    slug: string;
    min_price: string;
    images: { image: string; is_main: boolean }[];
    brand?: { name: string };
    variants: Variant[];
  };
}

export default function ProductCard({ product }: ProductProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { addItem } = useCart();
  const router = useRouter();

  // CLEANUP UTILITY
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

  // 1. Professional Size Sorting Utility
  const sortedVariants = useMemo(() => {
    const sizeOrder = ["XXXS", "XXS", "XS", "S", "M", "ML", "L", "XL", "XXL", "XXXL", "XXXXL"];
    const normalize = (val: string | null) => val?.replace(/\s+/g, "").toUpperCase() || "";
    
    const getRank = (variant: Variant) => {
      const val = normalize(variant.size || variant.thickness || "");
      if (!val) return 999;
      const index = sizeOrder.findIndex(s => val === s || val.startsWith(s + "(") || val.startsWith(s + "/"));
      return index !== -1 ? index : 900 + (parseInt(val) || 0);
    };

    return [...product.variants].sort((a, b) => getRank(a) - getRank(b));
  }, [product.variants]);

  // 2. Select first available variant by default (from sorted list)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    const firstAvailable = sortedVariants.find(v => v.stock > 0);
    return firstAvailable || sortedVariants[0] || null;
  });

  const images = product.images.length > 0 
    ? product.images.sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0)).map(img => 
        img.image?.startsWith("http") ? img.image : `http://localhost:8000${img.image}`
      )
    : ["/placeholder-product.png"];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant || selectedVariant.stock === 0) return;
    setIsAdding(true);
    try {
      await addItem(selectedVariant.id, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleVariantClick = (e: React.MouseEvent, variant: Variant) => {
    e.preventDefault();
    e.stopPropagation();
    if (variant.stock > 0) setSelectedVariant(variant);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const index = Math.floor((x / width) * images.length);
    if (index >= 0 && index < images.length && index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  return (
    <div className="h-full">
      <Link href={`/product/${product.slug}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col"
        >
          <div 
            className="relative h-72 overflow-hidden bg-gray-50/50 cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setCurrentImageIndex(0)}
          >
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain p-6 transition-all duration-500"
            />
            
            {images.length > 1 && (
              <div className="absolute bottom-3 left-4 right-3 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                {images.map((_, idx) => (
                  <div key={idx} className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "bg-blue-600 shadow-sm" : "bg-gray-200"}`} />
                ))}
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 opacity-0 group-hover:opacity-100 group-hover:bottom-10 transition-all duration-300 z-20">
              <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 active:scale-95">
                <Eye size={22} />
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={isAdding || !selectedVariant || selectedVariant.stock === 0}
                className={`${
                  isAdded ? "bg-green-500" : (selectedVariant?.stock === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600")
                } text-white p-4 rounded-2xl shadow-xl hover:shadow-blue-200 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center min-w-[56px]`}
              >
                {isAdding ? <Loader2 size={22} className="animate-spin" /> : isAdded ? <Check size={22} /> : <ShoppingCart size={22} />}
              </button>
            </div>
          </div>

          <div className="p-7 flex flex-col flex-grow">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
              {product.brand?.name || "Aquatavr"}
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>

            {sortedVariants.length > 1 && (
              <div className="mb-6">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 text-left">Выберите вариант:</div>
                <div className="flex flex-wrap gap-1.5">
                  {sortedVariants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isOutOfStock = v.stock === 0;
                    const label = cleanLabel(v.size) || cleanLabel(v.thickness) || v.sku;

                    return (
                      <button
                        key={v.id}
                        onClick={(e) => handleVariantClick(e, v)}
                        disabled={isOutOfStock}
                        className={`
                          min-w-[42px] px-2 py-2 rounded-lg text-[10px] font-black transition-all border-2
                          ${isSelected 
                            ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                            : isOutOfStock 
                              ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50" 
                              : "bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:text-blue-600"
                          }
                        `}
                        title={isOutOfStock ? "Нет в наличии" : (v.size || v.thickness || "")}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">
                  {selectedVariant?.stock === 0 ? "Ожидается" : "Цена"}
                </span>
                <div className={`text-2xl font-black tracking-tighter ${selectedVariant?.stock === 0 ? "text-gray-400" : "text-gray-900"}`}>
                  {selectedVariant ? `${Math.round(parseFloat(selectedVariant.price)).toLocaleString()} ₽` : "---"}
                </div>
              </div>
              
              <div className={`flex items-center space-x-2 font-bold text-[10px] px-3 py-1.5 rounded-full ${
                selectedVariant && selectedVariant.stock > 0 
                  ? "text-green-500 bg-green-50" 
                  : "text-red-400 bg-red-50"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  selectedVariant && selectedVariant.stock > 0 ? "bg-green-500 animate-pulse" : "bg-red-400"
                }`} />
                <span>{selectedVariant && selectedVariant.stock > 0 ? "В наличии" : "Нет в наличии"}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
