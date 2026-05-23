import { NextResponse } from 'next/server';
import { z } from 'zod';
import { redeemVoucher } from '@/lib/vouchers';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  code: z.string().min(3)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Ingresa un voucher válido.' }, { status: 400 });
  }

  const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const userAgent = request.headers.get('user-agent') ?? null;
  const result = await redeemVoucher(parsed.data.code, { remoteIp: remoteIp ?? undefined, userAgent: userAgent ?? undefined });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({
    message: `Voucher ${result.voucher.code} validado para ${result.voucher.companyName}.`,
    voucher: result.voucher
  });
}
