"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const BANNERS = [
  {
    id: 1,
    title: "Снаряжение для",
    subtitle: "подводной охоты",
    description: "Откройте для себя мир глубин с профессиональным снаряжением. Лучшие ружья, костюмы и аксессуары для успешной охоты.",
    image: "/images/main_banner_spearhunter.jpg",
    link: "/catalog?category=podvodnaja-ohota"
  },
  {
    id: 2,
    title: "Снаряжение для",
    subtitle: "дайвинга",
    description: "Исследуйте подводные красоты с максимальным комфортом и безопасностью. Полный спектр оборудования для погружений.",
    image: "/images/main_banner_diver.jpg",
    link: "/catalog?category=dajving"
  }
];

export default function Hero() {
  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-slate-950">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: '.custom-pagination' }}
        className="h-full w-full"
      >
        {BANNERS.map((banner) => (
          <SwiperSlide key={banner.id} className="relative h-full w-full">
            <Link href={banner.link} className="absolute inset-0 z-30 cursor-pointer" aria-label={banner.subtitle} />
            
            {/* Background with overlay */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/40 to-transparent z-10" />
              <img
                src={banner.image}
                alt={banner.subtitle}
                className="w-full h-full object-cover transition-transform duration-[10000ms] scale-100 swiper-slide-active:scale-110"
              />
            </div>

            <div className="container mx-auto px-4 h-full flex items-center relative z-20 pointer-events-none">
              <div className="max-w-4xl w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col justify-center min-h-[400px]"
                >
                  <h2 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[0.9]">
                    {banner.title} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                      {banner.subtitle}
                    </span>
                  </h2>
                  <p className="text-xl md:text-2xl text-blue-100 max-w-2xl leading-relaxed opacity-90">
                    {banner.description}
                  </p>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Stats/Floating elements - Static for both slides */}
      <div className="absolute bottom-16 right-4 md:right-12 hidden lg:flex space-x-8 z-40">
        {[
          { label: "Товаров", value: "5000+" },
          { label: "Брендов", value: "50+" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] min-w-[160px] shadow-2xl"
          >
            <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-blue-300 text-sm font-bold uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Custom Pagination Container */}
      <div className="custom-pagination absolute bottom-10 left-0 w-full flex justify-center z-40 !gap-3" />

      <style jsx global>{`
        .custom-pagination .swiper-pagination-bullet {
          width: 40px;
          height: 6px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
          transition: all 0.3s;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          background: #2563eb;
          width: 80px;
        }
      `}</style>
    </section>
  );
}
