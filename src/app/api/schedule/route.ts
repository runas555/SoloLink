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

export async function GET(request: Request) {
  const userId = await getUserIdFromReq(request);
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  try {
    const res = await client.execute({
      sql: 'SELECT * FROM schedules WHERE user_id = ? ORDER BY day_of_week ASC',
      args: [userId],
    });
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка чтения расписания' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserIdFromReq(request);
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  try {
    const { schedules } = await request.json(); // Ожидаем массив расписания на 7 дней

    if (!Array.isArray(schedules)) {
      return NextResponse.json({ error: 'Неверный формат данных' }, { status: 400 });
    }

    for (const dayData of schedules) {
      const { day_of_week, start_time, end_time, is_active } = dayData;

      // Используем REPLACE (или UPSERT) синтаксис для безопасного обновления
      const existing = await client.execute({
        sql: 'SELECT id FROM schedules WHERE user_id = ? AND day_of_week = ?',
        args: [userId, Number(day_of_week)],
      });

      if (existing.rows.length > 0) {
        await client.execute({
          sql: 'UPDATE schedules SET start_time = ?, end_time = ?, is_active = ? WHERE user_id = ? AND day_of_week = ?',
          args: [start_time, end_time, is_active ? 1 : 0, userId, Number(day_of_week)],
        });
      } else {
        await client.execute({
          sql: 'INSERT INTO schedules (id, user_id, day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          args: [randomUUID(), userId, Number(day_of_week), start_time, end_time, is_active ? 1 : 0],
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ошибка сохранения: ' + error.message }, { status: 500 });
  }
}