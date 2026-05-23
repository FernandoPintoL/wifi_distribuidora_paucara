import { randomBytes } from 'crypto';
import { query } from './db';

export type VoucherRecord = {
  id: number;
  code: string;
  company_name: string;
  customer_name: string | null;
  plan_name: string;
  minutes_valid: number;
  data_limit_mb: number | null;
  max_sessions: number;
  active: boolean;
  redeemed_count: number;
  last_redeemed_at: string | null;
  expires_at: string;
  created_at: string;
};

export function generateVoucherCode() {
  return randomBytes(3).toString('hex').toUpperCase();
}

export async function createVoucher(input: {
  companyName: string;
  customerName?: string | null;
  planName: string;
  minutesValid: number;
  dataLimitMb?: number | null;
  maxSessions?: number;
}) {
  const code = generateVoucherCode();
  const expiresAt = new Date(Date.now() + input.minutesValid * 60_000);

  const result = await query<VoucherRecord>(
    `
      insert into vouchers (
        code,
        company_name,
        customer_name,
        plan_name,
        minutes_valid,
        data_limit_mb,
        max_sessions,
        expires_at
      ) values ($1, $2, $3, $4, $5, $6, $7, $8)
      returning *
    `,
    [
      code,
      input.companyName,
      input.customerName ?? null,
      input.planName,
      input.minutesValid,
      input.dataLimitMb ?? null,
      input.maxSessions ?? 1,
      expiresAt
    ]
  );

  return result.rows[0];
}

export async function redeemVoucher(code: string, meta?: { remoteIp?: string; userAgent?: string }) {
  const voucherResult = await query<VoucherRecord>(
    'select * from vouchers where upper(code) = upper($1) limit 1',
    [code.trim()]
  );

  const voucher = voucherResult.rows[0];

  if (!voucher) {
    return { ok: false as const, message: 'El voucher no existe.' };
  }

  if (!voucher.active) {
    return { ok: false as const, message: 'El voucher está desactivado.' };
  }

  if (new Date(voucher.expires_at).getTime() < Date.now()) {
    return { ok: false as const, message: 'El voucher ya expiró.' };
  }

  if (voucher.redeemed_count >= voucher.max_sessions) {
    return { ok: false as const, message: 'El voucher ya alcanzó su límite de uso.' };
  }

  await query(
    `
      update vouchers
      set redeemed_count = redeemed_count + 1,
          last_redeemed_at = now()
      where id = $1
    `,
    [voucher.id]
  );

  await query(
    `
      insert into voucher_redemptions (voucher_id, remote_ip, user_agent)
      values ($1, $2, $3)
    `,
    [voucher.id, meta?.remoteIp ?? null, meta?.userAgent ?? null]
  );

  return {
    ok: true as const,
    voucher: {
      code: voucher.code,
      planName: voucher.plan_name,
      minutesValid: voucher.minutes_valid,
      dataLimitMb: voucher.data_limit_mb,
      expiresAt: voucher.expires_at,
      customerName: voucher.customer_name,
      companyName: voucher.company_name
    }
  };
}

export async function listDashboardData() {
  const vouchersResult = await query<VoucherRecord>(
    'select * from vouchers order by created_at desc limit 12'
  );

  const statsResult = await query<{ total: string; active: string; redeemed: string }>(
    `
      select
        count(*)::text as total,
        count(*) filter (where active = true and expires_at > now())::text as active,
        count(*) filter (where redeemed_count > 0)::text as redeemed
      from vouchers
    `
  );

  return {
    vouchers: vouchersResult.rows,
    stats: statsResult.rows[0] ?? { total: '0', active: '0', redeemed: '0' }
  };
}
