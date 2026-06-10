"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, Settings, Clock, LogOut } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '@/lib/i18n';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500 font-semibold">{t('loadingProfile')}</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: t('sidebarCalendar'), href: '/dashboard', icon: Calendar },
    { name: t('sidebarServices'), href: '/dashboard/services', icon: Clock },
    { name: t('sidebarSchedule'), href: '/dashboard/schedule', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Боковая панель */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-150 flex-shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-indigo-600" />
              <span className="font-extrabold text-lg text-gray-900">{t('brand')}</span>
            </div>
          </div>

          {/* Профиль специалиста */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.business_name}</p>
              </div>
            </div>
          </div>

          {/* Навигация */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>{t('logoutBtn')}</span>
            </button>
          </nav>
        </div>

        {/* Переключатель локали в самом низу меню */}
        <div className="p-4 border-t border-gray-100 flex justify-center">
          <LanguageSwitcher />
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}