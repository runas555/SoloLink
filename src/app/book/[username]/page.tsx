"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatPrice, formatDuration, formatTimezone } from '@/lib/utils';
import { useLanguage, LanguageSwitcher } from '@/lib/i18n';

export default function PublicBookingPage({ params }: { params: { username: string } }) {
  const { t, language } = useLanguage();
  const [specialist, setSpecialist] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPublicData() {
      try {
        setLoading(true);
        const profileRes = await fetch(`/api/public/profile?username=${params.username}`);
        if (!profileRes.ok) throw new Error(t('specialistNotFound'));
        
        const profile = await profileRes.json();
        setSpecialist(profile);

        const servicesRes = await fetch(`/api/public/services?userId=${profile.id}`);
        if (servicesRes.ok) {
          setServices(await servicesRes.json());
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, [params.username, t]);

  useEffect(() => {
    if (!selectedService || !selectedDate) return;

    async function fetchSlots() {
      const res = await fetch(`/api/bookings/slots?username=${params.username}&date=${selectedDate}&serviceId=${selectedService.id}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    }
    fetchSlots();
  }, [selectedService, selectedDate, params.username]);

  // Абсолютно безопасная конкатенация строк без использования символа обратного апострофа в шаблоне
  const datesList = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  });

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          start_time: selectedSlot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('noSlots'));
      }

      setBookingSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <p className="text-gray-500 font-bold">{t('specialistNotFound')}</p>
        <p className="text-xs text-gray-400 mt-1">{t('checkLink')}</p>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-gray-150 shadow-lg">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-900">{t('successTitle')}</h2>
          <p className="text-gray-600 mt-2">{t('successSub')}</p>
          <div className="mt-6 border-t border-gray-100 pt-4 text-left space-y-2 text-sm text-gray-700">
            <p><strong>{t('brand')}:</strong> {selectedService.name}</p>
            <p><strong>Время:</strong> {new Date(selectedSlot).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' })}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 md:p-8 flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">{t('onlineBooking')}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-1">{specialist.name}</h1>
            <p className="text-sm text-indigo-100 mt-1">{specialist.business_name}</p>
          </div>
          <LanguageSwitcher />
        </div>

        {!selectedService ? (
          <div className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('selectService')}</h2>
            {services.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">{t('noServices')}</p>
            ) : (
              <div className="space-y-3">
                {services.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedService(item)}
                    className="w-full text-left bg-white border border-gray-200 p-5 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/20 transition flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                      <div className="flex items-center space-x-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDuration(item.duration_minutes)}</span>
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-indigo-600 text-base">{formatPrice(item.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <button
              onClick={() => { setSelectedService(null); setSelectedDate(''); setSelectedSlot(''); }}
              className="flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToServices')}</span>
            </button>

            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 mb-6 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{t('brand')}</p>
                <p className="font-bold text-gray-900 mt-0.5">{selectedService.name}</p>
              </div>
              <span className="font-bold text-indigo-600">{formatPrice(selectedService.price)}</span>
            </div>

            <h2 className="text-base font-bold text-gray-900 mb-3">{t('selectDate')}</h2>
            <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-thin">
              {datesList.map((dt) => {
                const dateObj = new Date(dt);
                const isSelected = selectedDate === dt;
                const formattedDay = dateObj.getDate();
                const formattedWeekday = dateObj.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' });

                return (
                  <button
                    key={dt}
                    onClick={() => { setSelectedDate(dt); setSelectedSlot(''); }}
                    className={`flex-shrink-0 w-14 h-16 rounded-xl border flex flex-col items-center justify-center transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-xs uppercase font-bold opacity-80">{formattedWeekday}</span>
                    <span className="text-lg font-black">{formattedDay}</span>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  {t('selectTime')} {new Date(selectedDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { dateStyle: 'long' })}
                </h2>
                
                <div className="flex items-center space-x-1.5 text-xs text-indigo-600 font-semibold mb-3">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t('timezoneNotice')} {formatTimezone(specialist.timezone)}</span>
                </div>

                {slots.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">{t('noSlots')}</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => {
                      const timeString = new Date(slot).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                      const isSelected = selectedSlot === slot;

                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-lg border text-sm font-bold transition text-center ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-400'
                          }`}
                        >
                          {timeString}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedSlot && (
              <form onSubmit={handleBook} className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                <h2 className="text-base font-bold text-gray-900">{t('enterContacts')}</h2>

                {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg">{error}</div>}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">{t('yourName')}</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John / Иван"
                    className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">{t('phone')}</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+7 / +1"
                      className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">{t('email')}</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@mail.com"
                      className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition disabled:opacity-50 text-base"
                >
                  {submitting ? '...' : t('confirmBooking')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}