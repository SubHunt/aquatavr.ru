'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ChevronRight, Plus, Minus, Trash2, Info, X, ZoomIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Корзина пуста</h1>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          Кажется, вы еще ничего не добавили в корзину. В нашем каталоге много интересного!
        </p>
        <Link 
          href="/catalog"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          <span>Перейти в каталог</span>
          <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Корзина</h1>
              <p className="text-gray-500">{cart.items.length} товара в списке</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="col-span-6">Товар</div>
                <div className="col-span-2 text-center">Цена</div>
                <div className="col-span-2 text-center">Количество</div>
                <div className="col-span-2 text-right">Сумма</div>
              </div>

              <div className="divide-y divide-gray-50">
                {cart.items.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                  >
                    {/* Product Info */}
                    <div className="lg:col-span-6 flex items-center space-x-6">
                      <div className="relative group cursor-zoom-in" onClick={() => setZoomedImage(item.product_image)}>
                        <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 p-2 flex-shrink-0 transition-transform group-hover:scale-105">
                          <img 
                            src={item.product_image || '/placeholder-product.png'} 
                            alt={item.product_name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-2xl">
                          <ZoomIn size={24} className="text-blue-600" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                          Арт: {item.variant.sku}
                        </div>
                        <Link 
                          href={`/product/${item.product_slug}`}
                          target="_blank"
                          className="text-lg font-bold text-gray-900 leading-tight mb-1 hover:text-blue-600 transition-colors"
                        >
                          {item.product_name}
                        </Link>
                        {item.variant_details && (
                          <div className="text-xs text-gray-500 font-medium mb-4">
                            {item.variant_details}
                          </div>
                        )}
                        <button 
                          onClick={() => setDeletingItemId(item.id)}
                          className="flex items-center space-x-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors w-fit"
                        >
                          <Trash2 size={14} />
                          <span>Удалить из корзины</span>
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="lg:col-span-2 text-center">
                      <div className="lg:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Цена</div>
                      <div className="text-base font-bold text-gray-900">
                        {Math.round(parseFloat(item.variant.price)).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="lg:col-span-2 flex justify-center">
                      <div className="lg:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center w-full">Количество</div>
                      <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100 scale-110">
                        <button 
                          onClick={() => {
                            if (item.quantity === 1) setDeletingItemId(item.id);
                            else updateQuantity(item.id, item.quantity - 1);
                          }}
                          className="p-2 hover:bg-white hover:text-blue-600 rounded-xl transition-all text-gray-400 shadow-sm hover:shadow-md"
                        >
                          <Minus size={18} strokeWidth={3} />
                        </button>
                        <span className="w-10 text-center text-base font-black text-gray-900">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-white hover:text-blue-600 rounded-xl transition-all text-gray-400 shadow-sm hover:shadow-md"
                        >
                          <Plus size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="lg:col-span-2 text-right">
                      <div className="lg:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Сумма</div>
                      <div className="text-xl font-black text-blue-600">
                        {Math.round(parseFloat(item.subtotal)).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 sticky top-28">
              <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Ваш заказ</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Товары ({cart.items.length})</span>
                  <span>{Math.round(parseFloat(cart.total_price)).toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Доставка</span>
                  <span className="text-green-500 font-bold uppercase text-[10px] mt-1">Рассчитается далее</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Итого</span>
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">
                    {Math.round(parseFloat(cart.total_price)).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              <button 
                onClick={() => router.push('/checkout')}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] flex items-center justify-center space-x-3"
              >
                <span>Оформить заказ</span>
                <ChevronRight size={20} />
              </button>

              <div className="mt-6 flex items-start space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 leading-relaxed italic">
                <Info size={16} className="flex-shrink-0 text-blue-400" />
                <p>Цены и наличие товаров будут подтверждены менеджером после оформления.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingItemId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingItemId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter">Удалить товар?</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Вы действительно хотите удалить эту позицию из корзины?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeletingItemId(null)}
                  className="py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Отмена
                </button>
                <button
                  onClick={() => removeItem(deletingItemId)}
                  className="py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-full max-h-full aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10"
              >
                <X size={24} className="text-gray-800" />
              </button>
              <img 
                src={zoomedImage} 
                alt="Увеличенное изображение" 
                className="w-full h-full object-contain p-8"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
