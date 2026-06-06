"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden bg-slate-950">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent z-10" />
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay z-10" />
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop"
          alt="Diving"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              Новая коллекция 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Снаряжение для <br />
              <span className="text-blue-400">подводной охоты</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
              Откройте для себя мир глубин с профессиональным снаряжением. 
              Только проверенные бренды и лучшие цены для ваших приключений.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#"
                className="group flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
              >
                <span>Перейти в каталог</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#"
                className="flex items-center justify-center bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                Наши акции
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats/Floating elements */}
      <div className="absolute bottom-12 right-4 md:right-12 hidden lg:flex space-x-8">
        {[
          { label: "Товаров", value: "5000+" },
          { label: "Брендов", value: "50+" },
          { label: "Лет опыта", value: "15" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl min-w-[140px]"
          >
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-blue-200 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
