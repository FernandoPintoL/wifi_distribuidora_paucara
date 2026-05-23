import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, loginAndStartSession } from '@/lib/auth';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Ingresa un correo y contraseña válidos.' }, { status: 400 });
  }

  const result = await loginAndStartSession(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  const response = NextResponse.json({
    message: `Sesión iniciada para ${result.user.fullName}.`,
    user: result.user
  });

  response.cookies.set(SESSION_COOKIE_NAME, result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
