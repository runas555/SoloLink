"use client";

import Link from 'next/link';
import React from 'react';
import { Calendar, UserCheck, Clock, Award, ArrowRight } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="bg-white">
      {/* Шапка */}
      <header className="border-b border-gray-100 py-5">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <span className="font-extrabold text-xl tracking-tight text-gray-900">{t('brand')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link href="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition text-sm">
              {t('login')}
            </Link>
            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">
              {t('startFree')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('heroSub')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/register" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-200 transition flex items-center justify-center space-x-2">
              <span>{t('createCalendar')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-3.5 px-8 rounded-xl transition">
              {t('haveAccount')}
            </Link>
          </div>
        </div>
      </section>

      {/* Кому подходит */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">{t('whoIsItFor')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('beautyMasters')}</h3>
            <p className="text-gray-600 text-sm">{t('beautyDesc')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('tutors')}</h3>
            <p className="text-gray-600 text-sm">{t('tutorsDesc')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('coaches')}</h3>
            <p className="text-gray-600 text-sm">{t('coachesDesc')}</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 bg-gray-50 text-center">
        <p className="text-gray-500 text-sm">{t('footer')}</p>
      </footer>
    </div>
  );
}