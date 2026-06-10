import { NextResponse } from 'next/server';
import { client } from '@/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Не указан ID пользователя' }, { status: 400 });
  }

  try {
    const res = await client.execute({
      sql: 'SELECT id, name, duration_minutes, price, description FROM services WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId],
    });
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения списка услуг' }, { status: 500 });
  }
}