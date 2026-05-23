import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, registerAndStartSession } from '@/lib/auth';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Completa tu nombre, correo y contraseña.' }, { status: 400 });
  }

  const result = await registerAndStartSession(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  const response = NextResponse.json({
    message: `Bienvenido, ${result.user.fullName}. Tu cuenta fue creada.`,
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
