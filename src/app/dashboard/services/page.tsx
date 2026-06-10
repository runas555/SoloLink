"use client";

import React, { useEffect, useState } from 'react';
import { Tag, Clock, AlertTriangle } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

export default function ServicesPage() {
  const { t } = useLanguage();
  const [services, setServices] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadServices() {
    const res = await fetch('/api/services');
    if (res.ok) {
      setServices(await res.json());
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          duration_minutes: Number(duration),
          price: Number(price),
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('addServiceHeader'));
      }

      setName('');
      setPrice('');
      setDescription('');
      loadServices();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadServices();
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('servicesTitle')}</h1>
        <p className="text-sm text-gray-500">{t('servicesSub')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('addServiceHeader')}</h2>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleAddService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">{t('serviceNameLabel')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pilates / Haircut"
                className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">{t('serviceDurationLabel')}</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 bg-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">{t('servicePriceLabel')}</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2000"
                  className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">{t('serviceDescLabel')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="..."
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? t('addingBtn') : t('addServiceBtn')}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          {services.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-500">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-medium">{t('noServicesCreated')}</p>
            </div>
          ) : (
            services.map((item) => (
              <div key={item.id} className="bg-white border border-gray-150 p-5 rounded-2xl flex justify-between items-start shadow-sm hover:shadow transition">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <div className="flex items-center space-x-4 mt-1.5 text-xs font-semibold text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(item.duration_minutes)}</span>
                    </span>
                    <span>{t('price')}: {formatPrice(item.price)}</span>
                  </div>
                  {item.description && <p className="text-sm text-gray-600 mt-2 italic">"{item.description}"</p>}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}