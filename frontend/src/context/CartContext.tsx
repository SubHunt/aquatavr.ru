'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  product_name: string;
  product_slug: string;
  product_image: string;
  variant_details: string;
  quantity: number;
  subtotal: string;
  variant: {
    id: number;
    sku: string;
    price: string;
  };
}

interface Cart {
  items: CartItem[];
  total_price: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addItem: (variantId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshCart = async () => {
    try {
      const res = await api.get('/orders/cart/');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addItem = async (variantId: number, quantity: number = 1) => {
    try {
      const res = await api.post('/orders/cart/add/', { variant_id: variantId, quantity });
      setCart(res.data);
    } catch (err) {
      console.error('Failed to add item', err);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await api.patch(`/orders/cart/items/${itemId}/`, { quantity });
      await refreshCart();
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await api.delete(`/orders/cart/items/${itemId}/`);
      await refreshCart();
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateQuantity, removeItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
