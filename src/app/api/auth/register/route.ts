import { NextResponse } from 'next/server';
import { client } from '@/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { serialize } from 'cookie';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password, name, businessName, timezone } = await request.json();

    if (!email || !password || !name || !businessName) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 });
    }

    const checkResult = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (checkResult.rows.length > 0) {
      return NextResponse.json({ error: 'Пользователь с такой почтой уже существует' }, { status: 400 });
    }

    const userId = randomUUID();
    const pwHash = await hashPassword(password);

    await client.execute({
      sql: 'INSERT INTO users (id, email, password_hash, name, business_name, timezone) VALUES (?, ?, ?, ?, ?, ?)',
      args: [userId, email.toLowerCase(), pwHash, name, businessName, timezone || 'UTC'],
    });

    // Инициализируем стандартное расписание (пн-пт с 09:00 до 18:00)
    for (let day = 1; day <= 5; day++) {
      await client.execute({
        sql: 'INSERT INTO schedules (id, user_id, day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        args: [randomUUID(), userId, day, '09:00', '18:00'],
      });
    }

    const token = generateToken({ userId, email });
    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: '/',
    });

    const response = NextResponse.json({ success: true, userId });
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Системная ошибка регистрации: ' + error.message }, { status: 500 });
  }
}