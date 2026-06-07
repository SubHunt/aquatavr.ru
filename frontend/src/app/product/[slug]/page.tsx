"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${slug}/`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        // По умолчанию выбираем первый вариант
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants.find((v: any) => v.is_default) || data.variants[0]);
        }
        // Устанавливаем главное фото
        const mainImg = data.images?.find((img: any) => img.is_main)?.image || data.images?.[0]?.image;
        setActiveImage(mainImg);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [slug]);

  if (loading) return <div className="pt-40 text-center text-xl font-bold animate-pulse">Загрузка данных о товаре...</div>;
  if (!product) return <div className="pt-40 text-center text-xl">Товар не найден.</div>;

  const getImageUrl = (path: string) => path?.startsWith("http") ? path : `http://localhost:8000${path}`;

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs / Back */}
        <Link href="/catalog" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Назад в каталог
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Gallery */}
          <div className="space-y-6">
            <motion.div 
              layoutId="product-image"
              className="aspect-square bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 flex items-center justify-center p-8"
            >
              <img 
                src={getImageUrl(activeImage)} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            </motion.div>
            <div className="grid grid-cols-5 gap-4">
              {product.images?.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img.image)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all p-2 bg-gray-50 ${
                    activeImage === img.image ? "border-blue-600 scale-95" : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <img src={getImageUrl(img.image)} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                {product.brand?.name}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center space-x-6 mb-8">
              <div className="text-4xl font-black text-blue-600">
                {selectedVariant ? `${parseFloat(selectedVariant.price).toLocaleString()} ₽` : "Цена по запросу"}
              </div>
              {selectedVariant?.stock > 0 ? (
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-bold">
                  <Check size={16} className="mr-1" /> В наличии
                </div>
              ) : (
                <div className="text-gray-400 bg-gray-50 px-3 py-1 rounded-full text-sm font-bold">
                  Под заказ
                </div>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 1 && (
              <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase mb-4">Выберите размер / параметры:</h4>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                        selectedVariant?.id === v.id
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-white border-white text-gray-700 hover:border-blue-200 shadow-sm"
                      }`}
                    >
                      {v.size && v.thickness ? `${v.size} (${v.thickness})` : v.size || v.thickness || v.sku}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button className="flex-1 bg-blue-600 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center space-x-3">
                <ShoppingCart size={24} />
                <span>Добавить в корзину</span>
              </button>
              <button className="px-8 py-5 rounded-2xl font-bold text-lg border-2 border-gray-100 hover:bg-gray-50 transition-all">
                Купить в 1 клик
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 border-t border-gray-100">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">Гарантия качества</div>
                  <div className="text-gray-500 text-xs">Только оригинальная продукция</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Truck size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">Быстрая доставка</div>
                  <div className="text-gray-500 text-xs">По всей России от 2 дней</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-24 max-w-4xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 border-b-2 border-blue-600 inline-block pb-2">Описание товара</h3>
          <div 
            className="prose prose-blue max-w-none text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      </div>
    </div>
  );
}
