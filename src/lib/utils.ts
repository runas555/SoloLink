export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getDaysOfWeekRu(): string[] {
  return ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
}

// Новый хелпер для форматирования длительности
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
}

// Хелпер для форматирования системных таймзон в читаемый вид
export function formatTimezone(tz: string): string {
  const mapping: { [key: string]: string } = {
    'Europe/Moscow': 'Москва (UTC+3)',
    'Asia/Yekaterinburg': 'Екатеринбург (UTC+5)',
    'Asia/Novosibirsk': 'Новосибирск (UTC+7)',
    'Asia/Krasnoyarsk': 'Красноярск (UTC+7)',
    'Asia/Vladivostok': 'Владивосток (UTC+10)',
    'UTC': 'UTC (Гринвич)'
  };
  return mapping[tz] || tz;
}