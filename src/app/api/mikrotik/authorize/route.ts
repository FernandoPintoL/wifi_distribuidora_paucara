import { NextResponse } from 'next/server';
import { runCommand, isConfigured } from '@/lib/mikrotik';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // For safety, require an env flag to allow real execution
  if (process.env.MIKROTIK_ALLOW_API !== 'true') {
    return NextResponse.json({ message: 'MikroTik API calls are disabled. Set MIKROTIK_ALLOW_API=true to enable.' }, { status: 403 });
  }

  const body = await request.json();
  const { command, params } = body as { command?: string; params?: Record<string, unknown> };

  if (!command) {
    return NextResponse.json({ message: 'Missing command.' }, { status: 400 });
  }

  if (!(await isConfigured())) {
    return NextResponse.json({ message: 'MIKROTIK not configured in environment.' }, { status: 500 });
  }

  try {
    const result = await runCommand(command, params ?? {});
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 });
  }
}
