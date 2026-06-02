'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  MessageSquare, Wallet, ArrowUpCircle, LogOut, Shield
} from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_data');
    router.push('/auth');
  };

  const navItems = [
    { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard, active: pathname === '/admin' },
    { name: 'Commandes', href: '/admin/commandes', icon: ShoppingCart, active: pathname.includes('/admin/commandes') },
    { name: 'Produits', href: '/admin/produits', icon: Package, active: pathname.includes('/admin/produits') },
    { name: 'Avis', href: '/admin/avis', icon: MessageSquare, active: pathname.includes('/admin/avis') },
    { name: 'Portefeuilles', href: '/admin/portefeuilles', icon: Wallet, active: pathname.includes('/admin/portefeuilles') },
    { name: 'Retraits', href: '/admin/retraits', icon: ArrowUpCircle, active: pathname.includes('/admin/retraits') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Administration</p>
              <p className="text-gray-400 text-xs">Tissés de Waraniéné</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white text-sm transition-colors mb-1"
          >
            ← Retour au site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 text-sm transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
