'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Проверка ссылки...');

  useEffect(() => {
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    if (uid && token) {
      api.post('/auth/verify-email/', { uid, token })
        .then(() => {
          setStatus('success');
          setMessage('Email успешно подтвержден! Теперь вы можете войти.');
        })
        .catch(() => {
          setStatus('error');
          setMessage('Ссылка недействительна или срок её действия истек.');
        });
    } else {
      setStatus('error');
      setMessage('Неверные параметры подтверждения.');
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Подтверждение Email</h1>
        
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        )}
        
        <p className={`mb-6 ${status === 'error' ? 'text-red-500' : 'text-gray-600'}`}>
          {message}
        </p>

        {status !== 'loading' && (
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
          >
            Перейти к входу
          </Link>
        )}
      </div>
    </div>
  );
}
