'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Dashboard acheteur supprimé - redirection vers profil utilisateur
    router.push('/profil');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirection vers votre profil...</p>
        </div>
      </div>
    </div>
  );
}