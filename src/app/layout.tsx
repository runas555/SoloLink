import './globals.css';
import React from 'react';
import { LanguageProvider } from '@/lib/i18n';

export const metadata = {
  title: 'Сессия365 — Микро-CRM',
  description: 'Минималистичный календарь-планировщик записи клиентов',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <LanguageProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}