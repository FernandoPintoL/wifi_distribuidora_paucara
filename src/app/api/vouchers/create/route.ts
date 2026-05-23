import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createVoucher } from '@/lib/vouchers';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  companyName: z.string().min(1),
  customerName: z.string().optional().nullable(),
  planName: z.string().min(1),
  minutesValid: z.number().int().positive(),
  dataLimitMb: z.number().int().positive().optional().nullable(),
  maxSessions: z.number().int().positive().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Revisa los datos del voucher.' }, { status: 400 });
  }

  const voucher = await createVoucher(parsed.data);

  return NextResponse.json({
    message: 'Voucher creado correctamente.',
    code: voucher.code,
    voucher
  });
}
