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
      sql: 'SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId],
    });
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка базы данных' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserIdFromReq(request);
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  try {
    const { name, duration_minutes, price, description } = await request.json();

    if (!name || !duration_minutes || price === undefined) {
      return NextResponse.json({ error: 'Заполните обязательные поля услуги' }, { status: 400 });
    }

    const id = randomUUID();
    await client.execute({
      sql: 'INSERT INTO services (id, user_id, name, duration_minutes, price, description) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, userId, name, Number(duration_minutes), Number(price), description || ''],
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения услуги' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserIdFromReq(request);
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Укажите ID услуги для удаления' }, { status: 400 });
    }

    await client.execute({
      sql: 'DELETE FROM services WHERE id = ? AND user_id = ?',
      args: [id, userId],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления услуги' }, { status: 500 });
  }
}