import { NextResponse } from 'next/server';
import { redeemVoucher } from '@/lib/vouchers';
import { runCommand, type MikroTikResult } from '@/lib/mikrotik';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const { code, mac, ip } = body as { code?: string; mac?: string; ip?: string };

  if (!code) {
    return NextResponse.json({ message: 'Missing voucher code.' }, { status: 400 });
  }

  const redeemed = await redeemVoucher(code, { remoteIp: ip, userAgent: 'mikrotik-external' });

  if (!redeemed.ok) {
    return NextResponse.json({ message: redeemed.message }, { status: 400 });
  }

  // Create hotspot user with the voucher code as name and a random password
  const userName = `pau_${code}`;
  const userPassword = code + Math.random().toString(36).slice(2, 8);

  const resUser: MikroTikResult = await runCommand('/ip/hotspot/user/add', { name: userName, password: userPassword, comment: 'voucher' });

  if (!resUser.ok) {
    return NextResponse.json({ message: 'Voucher redeemed but MikroTik user creation failed.', detail: resUser.message }, { status: 500 });
  }

  let resBind: MikroTikResult = { ok: true, data: null };

  if (mac && ip) {
    // try to bind ip/mac so session is allowed
    resBind = await runCommand('/ip/hotspot/ip-binding/add', { address: ip, 'mac-address': mac, comment: 'voucher-binding' });
    if (!resBind.ok) {
      // non-fatal: continue but notify
    }
  }

  return NextResponse.json({
    message: 'Voucher redeemed and MikroTik user created.',
    mikrotik: { user: resUser.ok ? resUser.data : null, binding: resBind.ok ? resBind.data : null },
    credentials: { userName, userPassword }
  });
}
