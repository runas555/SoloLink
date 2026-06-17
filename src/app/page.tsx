"use client";

import Link from 'next/link';
import React from 'react';
import { UserCheck, Clock, Award, ArrowRight, Globe } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col justify-between pb-12">
      {/* Шапка */}
      <header className="py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Логотип */}
          <div className="flex items-center space-x-2 text-[#2d2722]">
            <span className="font-serif text-2xl font-bold tracking-tight">{t('brand')}</span>
            <svg className="w-6 h-6 text-[#2d2722] opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <line x1="16" y1="2" x2="16" y2="5" />
              <line x1="8" y1="2" x2="8" y2="5" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <circle cx="12" cy="15" r="1.5" fill="currentColor" />
            </svg>
          </div>

          {/* Навигация */}
          <div className="flex items-center space-x-6">
            {/* Стилизованная капсула языка */}
            <div className="flex items-center space-x-1.5 bg-white/70 border border-gray-300/60 py-1 px-3.5 rounded-full shadow-sm text-[#2d2722] hover:bg-white transition duration-200">
              <Globe className="w-4 h-4 stroke-[1.5] text-gray-600" />
              <LanguageSwitcher />
            </div>
            
            <Link href="/login" className="text-[#2d2722] hover:opacity-80 font-medium transition text-sm">
              {t('login')}
            </Link>
            
            {/* Кнопка в хедере в виде мягкого асимметричного камушка */}
            <Link 
              href="/register" 
              className="stone-shadow-slate bg-[#5f6d7a] hover:bg-[#525f6b] text-white py-2.5 px-6 rounded-[30px_16px_24px_18px_/_18px_24px_16px_30px] transition duration-300 text-sm font-medium"
            >
              {t('startFree')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Секция */}
      <section className="py-8 md:py-16 flex-grow flex items-center">
        <div className="max-w-4xl mx-auto px-4 text-center w-full">
          <h1 className="font-serif text-4xl md:text-5xl text-[#2d2722] leading-[1.25] tracking-normal mb-6 font-normal">
            {t('heroTitle')}
          </h1>
          <p className="text-[#5a524c] text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {t('heroSub')}
          </p>
          
          {/* Интерактивные 3D-кнопки */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link 
              href="/register" 
              className="stone-shadow-beige w-full sm:w-auto bg-[#c7beaf] text-[#2d2722] font-semibold py-3.5 px-8 rounded-[40px_25px_45px_28px_/_28px_45px_25px_40px] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 border border-[#bfae9e] border-opacity-30"
            >
              <span>{t('createCalendar')}</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </Link>
            
            <Link 
              href="/login" 
              className="stone-shadow-terracotta w-full sm:w-auto bg-[#b9745d] text-white font-semibold py-3.5 px-8 rounded-[25px_40px_28px_45px_/_45px_28px_40px_25px] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center border border-[#a85945] border-opacity-30"
            >
              {t('haveAccount')}
            </Link>
          </div>
        </div>
      </section>

      {/* Кому помогает наша CRM (3D-камни на виду) */}
      <section className="py-12 max-w-5xl mx-auto px-4 w-full">
        <h2 className="font-serif text-2xl md:text-3xl text-center text-[#2d2722] mb-12 font-normal">
          {t('whoIsItFor')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
          {/* Бьюти-мастера */}
          <div className="flex flex-col items-center text-center max-w-[240px]">
            <div className="stone-shadow-moss w-44 h-36 bg-[#b7c2b0] rounded-[65%_35%_60%_40%_/_50%_60%_40%_50%] flex items-center justify-center text-[#2d2722] hover:scale-105 transition-all duration-300">
              <UserCheck className="w-12 h-12 stroke-[1.2] text-[#2d2722] opacity-80" />
            </div>
            <h3 className="font-serif text-[#2d2722] text-lg font-medium mt-4 mb-2">
              {t('beautyMasters')}
            </h3>
            <p className="text-xs text-[#5a524c] leading-relaxed font-light">
              {t('beautyDesc')}
            </p>
          </div>

          {/* Репетиторы */}
          <div className="flex flex-col items-center text-center max-w-[240px]">
            <div className="stone-shadow-beige w-44 h-36 bg-[#d9d0c1] rounded-[45%_55%_50%_50%_/_60%_40%_60%_40%] flex items-center justify-center text-[#2d2722] hover:scale-105 transition-all duration-300">
              <Clock className="w-12 h-12 stroke-[1.2] text-[#2d2722] opacity-80" />
            </div>
            <h3 className="font-serif text-[#2d2722] text-lg font-medium mt-4 mb-2">
              {t('tutors')}
            </h3>
            <p className="text-xs text-[#5a524c] leading-relaxed font-light">
              {t('tutorsDesc')}
            </p>
          </div>

          {/* Коучи */}
          <div className="flex flex-col items-center text-center max-w-[240px]">
            <div className="stone-shadow-slate w-44 h-36 bg-[#5f6d7a] rounded-[50%_50%_65%_35%_/_45%_55%_45%_55%] flex items-center justify-center text-white hover:scale-105 transition-all duration-300">
              <Award className="w-12 h-12 stroke-[1.2] text-white opacity-90" />
            </div>
            <h3 className="font-serif text-[#2d2722] text-lg font-medium mt-4 mb-2">
              {t('coaches')}
            </h3>
            <p className="text-xs text-[#5a524c] leading-relaxed font-light">
              {t('coachesDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}