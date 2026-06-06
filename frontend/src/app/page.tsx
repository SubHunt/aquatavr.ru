"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const TOP_BRANDS = [
  "CRESSI", "SALVIMAR", "C4", "SUBVENATOR", "DEEPREEF", 
  "SARGAN", "SCORPENA", "MARLIN", "SCALLOPS", "MVD"
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>(TOP_BRANDS.map((name, index) => ({ id: `static-${index}`, name })));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загрузка товаров
    fetch("http://localhost:8000/api/products/")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.results || data);
        setLoading(false);
      })
      .catch((err) => console.error("Products fetch error:", err));

    // Загрузка полного списка брендов
    fetch("http://localhost:8000/api/brands/")
      .then((res) => res.json())
      .then((data) => {
        const remoteBrands = data.results || data;
        const validRemote = remoteBrands.filter(
          (b: any) => b.name && b.name !== 'nan' && b.name !== 'None' && !TOP_BRANDS.includes(b.name.toUpperCase())
        );
        
        // Объединяем статические топ-бренды с остальными из базы
        setBrands([
          ...TOP_BRANDS.map((name, index) => ({ id: `top-${index}`, name })),
          ...validRemote
        ]);
      })
      .catch((err) => console.error("Brands fetch error:", err));
  }, []);

  return (
    <div>
      <Hero />
      
      {/* Brands Ticker */}
      <section className="py-16 bg-white border-b border-gray-100 overflow-hidden">
        <div className="container mx-auto px-4 mb-10">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.4em] text-center">
            Мы — крупнейший мультибрендовый магазин в России
          </h3>
        </div>
        
        <Swiper
          key={brands.length} // Пересоздаем Swiper при догрузке данных для корректного loop
          modules={[Autoplay]}
          spaceBetween={60}
          slidesPerView={2}
          loop={true}
          speed={7000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          allowTouchMove={false}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          className="brands-swiper"
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand.id}>
              <div className="flex items-center justify-center h-20 px-8 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
                <span className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter whitespace-nowrap">
                  {brand.name}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Наши новинки</h2>
              <p className="text-gray-600 max-w-lg text-lg">
                Самое свежее снаряжение, которое только что поступило к нам на склад. 
              </p>
            </motion.div>
            <button className="bg-white border-2 border-gray-100 px-8 py-4 rounded-2xl font-black text-gray-900 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm">
              Смотреть весь каталог
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[450px] bg-white border border-gray-100 rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotions Section */}
      <section className="py-12 bg-white pb-32">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between"
          >
            <div className="relative z-10 text-center md:text-left mb-10 md:mb-0">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
                Скидка 15% на <br /> первый заказ
              </h2>
              <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-8 py-4 rounded-2xl mb-10">
                <span className="text-white text-2xl font-mono font-bold tracking-widest uppercase">AQUA2026</span>
              </div>
              <br />
              <button className="bg-white text-blue-600 px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl">
                Получить скидку
              </button>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500 skew-x-12 translate-x-1/3 opacity-20" />
            <div className="relative z-10 hidden lg:block">
              <div className="w-80 h-80 border-8 border-white/10 rounded-full flex items-center justify-center animate-pulse">
                <div className="text-8xl font-black text-white">-15%</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style jsx global>{`
        .brands-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </div>
  );
}
