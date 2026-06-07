'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Профиль</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
            <div className="text-lg text-gray-900 font-medium">{user.email}</div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Имя</label>
            <div className="text-lg text-gray-900 font-medium">{user.first_name}</div>
          </div>
          
          {user.phone && (
            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Телефон</label>
              <div className="text-lg text-gray-900 font-medium">{user.phone}</div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
          >
            Выйти из аккаунта
          </button>
          
          <button
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Редактировать
          </button>
        </div>
      </div>
    </div>
  );
}
