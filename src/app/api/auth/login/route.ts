import { NextResponse } from 'next/server';
import { client } from '@/db';
import { comparePassword, generateToken } from '@/lib/auth';
import { serialize } from 'cookie';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Укажите почту и пароль' }, { status: 400 });
    }

    const result = await client.execute({
      sql: 'SELECT id, email, password_hash FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Неверная почта или пароль' }, { status: 400 });
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePassword(password, user.password_hash as string);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Неверная почта или пароль' }, { status: 400 });
    }

    const token = generateToken({ userId: user.id as string, email: user.email as string });
    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Системная ошибка авторизации' }, { status: 500 });
  }
}