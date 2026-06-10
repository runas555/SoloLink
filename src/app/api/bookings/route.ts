import { NextResponse } from 'next/server';
import { client } from '@/db';
import { parse } from 'cookie';
import { verifyToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

async function getUserIdFromReq(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.auth_token;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
}

// Получить все бронирования для панели мастера
export async function GET(request: Request) {
  const userId = await getUserIdFromReq(request);
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  try {
    const res = await client.execute({
      sql: `
        SELECT b.*, s.name as service_name, s.duration_minutes, s.price 
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.user_id = ?
        ORDER BY b.start_time ASC
      `,
      args: [userId],
    });
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка БД' }, { status: 500 });
  }
}

// Создание бронирования со стороны внешнего клиента
export async function POST(request: Request) {
  try {
    const { service_id, client_name, client_email, client_phone, start_time } = await request.json();

    if (!service_id || !client_name || !client_phone || !start_time) {
      return NextResponse.json({ error: 'Не заполнены обязательные поля' }, { status: 400 });
    }

    // Ищем услугу, чтобы взять длительность и связать с пользователем
    const serviceRes = await client.execute({
      sql: 'SELECT user_id, duration_minutes FROM services WHERE id = ?',
      args: [service_id],
    });

    if (serviceRes.rows.length === 0) {
      return NextResponse.json({ error: 'Выбранная услуга не найдена' }, { status: 404 });
    }

    const service = serviceRes.rows[0];
    const user_id = service.user_id as string;
    const duration_minutes = Number(service.duration_minutes);

    // Рассчитываем время окончания записи
    const startObj = new Date(start_time);
    const endObj = new Date(startObj.getTime() + duration_minutes * 60000);
    const end_time = endObj.toISOString();

    // Проверяем конкурентный овербукинг на данное время
    const overlapRes = await client.execute({
      sql: 'SELECT id FROM bookings WHERE user_id = ? AND status != \'cancelled\' AND start_time < ? AND end_time > ?',
      args: [user_id, end_time, start_time],
    });

    if (overlapRes.rows.length > 0) {
      return NextResponse.json({ error: 'Извините, этот временной интервал только что был забронирован другим клиентом. Пожалуйста, выберите другое время.' }, { status: 409 });
    }

    const id = randomUUID();
    await client.execute({
      sql: `
        INSERT INTO bookings (id, user_id, service_id, client_name, client_email, client_phone, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      args: [id, user_id, service_id, client_name, client_email || '', client_phone, start_time, end_time],
    });

    return NextResponse.json({ success: true, bookingId: id });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ошибка записи: ' + error.message }, { status: 500 });
  }
}