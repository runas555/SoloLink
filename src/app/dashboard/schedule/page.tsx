"use client";

import React, { useEffect, useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function SchedulePage() {
  const { t, language } = useLanguage();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Динамическая локализация названий дней недели через нативный JS
  const daysOfWeekNames = Array.from({ length: 7 }, (_, i) => {
    // 2024-01-07 это Воскресенье (индекс 0)
    const date = new Date(2024, 0, 7 + i);
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long' });
  });

  useEffect(() => {
    async function loadSchedule() {
      const res = await fetch('/api/schedule');
      if (res.ok) {
        const data = await res.json();
        const fullList = Array.from({ length: 7 }, (_, i) => {
          const found = data.find((d: any) => Number(d.day_of_week) === i);
          return found || { day_of_week: i, start_time: '09:00', end_time: '18:00', is_active: 0 };
        });
        setSchedules(fullList);
      }
      setLoading(false);
    }
    loadSchedule();
  }, []);

  function handleToggle(dayIndex: number) {
    setSchedules((prev) =>
      prev.map((s) => (s.day_of_week === dayIndex ? { ...s, is_active: s.is_active === 1 ? 0 : 1 } : s))
    );
  }

  function handleTimeChange(dayIndex: number, field: 'start_time' | 'end_time', value: string) {
    setSchedules((prev) =>
      prev.map((s) => (s.day_of_week === dayIndex ? { ...s, [field]: value } : s))
    );
  }

  async function handleSave() {
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules }),
      });

      if (!res.ok) throw new Error(t('scheduleError'));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || t('scheduleError'));
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-gray-500">{t('loadingSchedule')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('scheduleTitle')}</h1>
          <p className="text-sm text-gray-500">{t('scheduleSub')}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg text-sm transition"
        >
          <Save className="w-4 h-4" />
          <span>{t('saveScheduleBtn')}</span>
        </button>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded text-sm text-emerald-800 font-medium">
          {t('scheduleSuccess')}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded text-sm text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
        {schedules.map((day) => {
          const isActive = day.is_active === 1;
          return (
            <div key={day.day_of_week} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id={`day-${day.day_of_week}`}
                  checked={isActive}
                  onChange={() => handleToggle(day.day_of_week)}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor={`day-${day.day_of_week}`} className="font-bold text-gray-800 select-none cursor-pointer capitalize">
                  {daysOfWeekNames[day.day_of_week]}
                </label>
              </div>

              {isActive ? (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase">{t('timeFrom')}</span>
                  <input
                    type="text"
                    value={day.start_time}
                    onChange={(e) => handleTimeChange(day.day_of_week, 'start_time', e.target.value)}
                    className="w-20 border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-semibold"
                  />
                  <span className="text-xs font-semibold text-gray-400 uppercase">{t('timeTo')}</span>
                  <input
                    type="text"
                    value={day.end_time}
                    onChange={(e) => handleTimeChange(day.day_of_week, 'end_time', e.target.value)}
                    className="w-20 border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-semibold"
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold text-gray-400 italic">{t('dayOff')}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}