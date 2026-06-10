import { NextResponse } from 'next/server';
import { client } from '@/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Не указан идентификатор специалиста' }, { status: 400 });
  }

  try {
    const result = await client.execute({
      sql: 'SELECT id, name, business_name, timezone FROM users WHERE id = ? OR email = ?',
      args: [username, username.toLowerCase()],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Специалист не найден' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка базы данных' }, { status: 500 });
  }
}