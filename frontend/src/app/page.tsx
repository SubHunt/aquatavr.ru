"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/products/")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.results || data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Hero />
      
      {/* Featured Products */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Наши новинки</h2>
              <p className="text-gray-600 max-w-lg">
                Самое свежее снаряжение, которое только что поступило к нам на склад. 
                Будьте первыми, кто оценит качество!
              </p>
            </motion.div>
            <button className="bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm">
              Смотреть весь каталог
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[450px] bg-gray-200 animate-pulse rounded-3xl" />
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between"
          >
            <div className="relative z-10 text-center md:text-left mb-10 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Скидка 15% на первый заказ <br /> по промокоду AQUA2026
              </h2>
              <button className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl">
                Получить скидку
              </button>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-500 skew-x-12 translate-x-1/2 opacity-20" />
            <div className="relative z-10 hidden lg:block">
              <div className="w-64 h-64 border-4 border-white/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="text-6xl font-black text-white">-15%</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
