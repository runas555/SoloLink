import { NextResponse } from 'next/server';
import { parse } from 'cookie';
import { verifyToken } from '@/lib/auth';
import { client } from '@/db';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.auth_token;

  if (!token) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Невалидный токен' }, { status: 401 });
  }

  try {
    const userResult = await client.execute({
      sql: 'SELECT id, email, name, business_name, timezone FROM users WHERE id = ?',
      args: [payload.userId],
    });

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json(userResult.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Ошибка получения профиля' }, { status: 500 });
  }
}