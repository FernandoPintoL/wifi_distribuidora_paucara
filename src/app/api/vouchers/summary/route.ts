import { NextResponse } from 'next/server';
import { listDashboardData } from '@/lib/vouchers';

export const runtime = 'nodejs';

export async function GET() {
  const data = await listDashboardData();
  return NextResponse.json(data);
}
