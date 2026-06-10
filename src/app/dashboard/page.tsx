"use client";

import React, { useEffect, useState } from 'react';
import { Clipboard, RefreshCw, User, ExternalLink } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const bookRes = await fetch('/api/bookings');

      if (userRes.ok && bookRes.ok) {
        setUser(await userRes.json());
        setBookings(await bookRes.json());
      }
    } catch (err) {
      console.error('Ошибка загрузки записей', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const bookingUrl = user ? `${window.location.origin}/book/${user.id}` : '';

  function copyBookingLink() {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const upcomingBookings = bookings.filter(b => new Date(b.start_time) >= new Date() && b.status !== 'cancelled');

  const groupedBookings: { [key: string]: any[] } = {};
  upcomingBookings.forEach((b) => {
    const dateStr = new Date(b.start_time).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (!groupedBookings[dateStr]) {
      groupedBookings[dateStr] = [];
    }
    groupedBookings[dateStr].push(b);
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboardTitle')}</h1>
          <p className="text-sm text-gray-500">{t('dashboardSub')}</p>
        </div>
      </div>

      {user && (
        <div className="bg-indigo-50 border border-indigo-150 p-5 rounded-2xl mb-8">
          <h3 className="text-sm font-bold text-indigo-900 mb-2">{t('personalPage')}</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={bookingUrl}
              className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none"
            />
            <button
              onClick={copyBookingLink}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
            >
              {copied ? t('copiedLink') : t('copyLinkBtn')}
            </button>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-indigo-200 p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase">{t('statsUpcoming')}</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">{upcomingBookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase">{t('statsTotal')}</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{bookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase">{t('statsRevenue')}</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            {formatPrice(bookings.reduce((acc, curr) => acc + (curr.price || 0), 0))}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900">{t('upcomingSessionsHeader')}</h2>
          <button onClick={loadData} className="text-gray-500 hover:text-indigo-600 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">...</div>
        ) : Object.keys(groupedBookings).length === 0 ? (
          <div className="py-20 text-center px-4">
            <Clipboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t('noUpcoming')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('noUpcomingSub')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-150">
            {Object.keys(groupedBookings).map((dateHeader) => (
              <div key={dateHeader} className="bg-white">
                <div className="bg-gray-50/80 px-5 py-2.5 text-xs font-bold text-gray-500 uppercase border-y border-gray-100">
                  {dateHeader}
                </div>
                <div className="divide-y divide-gray-100">
                  {groupedBookings[dateHeader].map((b) => {
                    const timeString = new Date(b.start_time).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'UTC'
                    });
                    return (
                      <div key={b.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50/50 transition">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-2">
                            {b.service_name} — {formatDuration(b.duration_minutes)}
                          </span>
                          <h3 className="text-base font-bold text-gray-900 flex items-center space-x-1.5">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{b.client_name}</span>
                          </h3>
                          <div className="mt-1 text-xs text-gray-500 space-x-3">
                            <span>{t('clientPhone')} {b.client_phone}</span>
                            {b.client_email && <span>{t('clientEmail')} {b.client_email}</span>}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-base font-black text-indigo-600">{timeString}</p>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">{formatPrice(b.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}