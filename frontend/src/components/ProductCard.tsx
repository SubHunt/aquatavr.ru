"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";

interface ProductProps {
  product: {
    id: number;
    name: string;
    slug: string;
    min_price: string;
    images: { image: string; is_main: boolean }[];
    brand?: { name: string };
  };
}

export default function ProductCard({ product }: ProductProps) {
  const mainImage = product.images.find((img) => img.is_main)?.image || product.images[0]?.image;
  const imageUrl = mainImage?.startsWith("http") ? mainImage : `http://localhost:8000${mainImage}`;

  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full"
      >
        <div className="relative h-72 overflow-hidden bg-gray-50">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:bottom-6 transition-all duration-300">
            <div className="bg-white text-gray-900 p-3 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-colors">
              <Eye size={20} />
            </div>
            <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors">
              <ShoppingCart size={20} />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            {product.brand?.name || "Aquatavr"}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 h-14 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-gray-900">
              {product.min_price ? `${parseFloat(product.min_price).toLocaleString()} ₽` : "Цена по запросу"}
            </div>
            <div className="text-xs text-gray-400 font-medium">В наличии</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
