import { NextResponse } from 'next/server';
import { client } from '@/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username'); // Почта или ID специалиста
    const date = searchParams.get('date'); // YYYY-MM-DD
    const serviceId = searchParams.get('serviceId');

    if (!username || !date || !serviceId) {
      return NextResponse.json({ error: 'Недостаточно параметров для подбора слотов' }, { status: 400 });
    }

    // Находим специалиста
    const userRes = await client.execute({
      sql: 'SELECT id, timezone FROM users WHERE id = ? OR email = ?',
      args: [username, username.toLowerCase()],
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Специалист не найден' }, { status: 404 });
    }

    const user = userRes.rows[0];
    const userId = user.id as string;

    // Находим выбранную услугу
    const serviceRes = await client.execute({
      sql: 'SELECT duration_minutes FROM services WHERE id = ? AND user_id = ?',
      args: [serviceId, userId],
    });

    if (serviceRes.rows.length === 0) {
      return NextResponse.json({ error: 'Услуга мастера не найдена' }, { status: 404 });
    }

    const duration = Number(serviceRes.rows[0].duration_minutes);

    // Определяем день недели по дате (0 - Вс, 1 - Пн ...)
    const parsedDate = new Date(date);
    const dayOfWeek = parsedDate.getUTCDay();

    // Загружаем рабочее расписание на этот день недели
    const scheduleRes = await client.execute({
      sql: 'SELECT start_time, end_time, is_active FROM schedules WHERE user_id = ? AND day_of_week = ?',
      args: [userId, dayOfWeek],
    });

    if (scheduleRes.rows.length === 0 || scheduleRes.rows[0].is_active === 0) {
      return NextResponse.json({ slots: [] }); // Мастер не работает в этот день
    }

    const { start_time, end_time } = scheduleRes.rows[0];

    // Парсим рабочие часы "HH:MM"
    const [startHour, startMin] = (start_time as string).split(':').map(Number);
    const [endHour, endMin] = (end_time as string).split(':').map(Number);

    // Загружаем занятые интервалы бронирования на указанную дату
    const dateStart = `${date}T00:00:00.000Z`;
    const dateEnd = `${date}T23:59:59.999Z`;

    const bookingsRes = await client.execute({
      sql: `
        SELECT start_time, end_time FROM bookings 
        WHERE user_id = ? 
          AND status != 'cancelled'
          AND start_time >= ? 
          AND start_time <= ?
      `,
      args: [userId, dateStart, dateEnd],
    });

    const activeBookings = bookingsRes.rows.map((b) => ({
      start: new Date(b.start_time as string).getTime(),
      end: new Date(b.end_time as string).getTime(),
    }));

    // Генерируем временную сетку слотов
    const slots: string[] = [];
    const currentSlotTime = new Date(parsedDate);
    currentSlotTime.setUTCHours(startHour, startMin, 0, 0);

    const dayLimitTime = new Date(parsedDate);
    dayLimitTime.setUTCHours(endHour, endMin, 0, 0);

    while (currentSlotTime.getTime() + duration * 60000 <= dayLimitTime.getTime()) {
      const slotStart = currentSlotTime.getTime();
      const slotEnd = slotStart + duration * 60000;

      // Проверяем, пересекается ли этот слот со всеми текущими записями
      const isOverlapping = activeBookings.some((booking) => {
        return (slotStart < booking.end && slotEnd > booking.start);
      });

      if (!isOverlapping) {
        slots.push(currentSlotTime.toISOString());
      }

      // Сдвигаем шаг генерации на 30 минут (интервал дискретности)
      currentSlotTime.setTime(currentSlotTime.getTime() + 30 * 60000);
    }

    return NextResponse.json({ slots });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ошибка генерации свободного времени: ' + error.message }, { status: 500 });
  }
}