'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle, RefreshCcw, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_name: string;
  product_slug: string;
  product_image: string;
  variant_details: string;
  quantity: number;
  price: string;
  variant: {
    sku: string;
  };
}

interface Order {
  id: number;
  status: string;
  status_display: string;
  total_price: string;
  created_at: string;
  items: OrderItem[];
}

const statusIcons: Record<string, any> = {
  new: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
  pending: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
  confirmed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  shipped: { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50' },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/');
      setOrders(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchOrders();
  }, [user, authLoading, router]);

  const repeatOrder = async (orderId: number) => {
    try {
      await api.post(`/orders/${orderId}/repeat/`);
      router.push('/cart');
    } catch (err) {
      alert('Не удалось повторить заказ');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-4 mb-12">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">История заказов</h1>
            <p className="text-gray-500">Ваши прошлые покупки в Aquatavr</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Заказов пока нет</h2>
            <Link href="/catalog" className="text-blue-600 font-bold hover:underline">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const statusInfo = statusIcons[order.status] || statusIcons.new;
              const StatusIcon = statusInfo.icon;

              return (
                <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 p-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-black text-gray-900">Заказ #{order.id}</span>
                      <div className={`px-4 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color} flex items-center space-x-2 text-xs font-bold`}>
                        <StatusIcon size={14} />
                        <span>{order.status_display}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-6 flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                          <img src={item.product_image || '/placeholder-product.png'} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow">
                          <Link 
                            href={`/product/${item.product_slug}`} 
                            target="_blank"
                            className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            {item.product_name} <ExternalLink size={14} className="text-gray-300" />
                          </Link>
                          <div className="text-xs text-gray-500 font-medium">
                            {item.variant_details} • {item.quantity} шт.
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-gray-900">
                            {Math.round(parseFloat(item.price) * item.quantity).toLocaleString('ru-RU')} ₽
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-white border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-8">
                      <div className="text-left">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Сумма заказа</div>
                        <div className="text-2xl font-black text-gray-900">
                          {Math.round(parseFloat(order.total_price)).toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => repeatOrder(order.id)}
                      className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center space-x-2 active:scale-95 shadow-lg"
                    >
                      <RefreshCcw size={18} />
                      <span>Повторить заказ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
