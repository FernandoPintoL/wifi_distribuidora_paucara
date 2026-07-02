/**
 * Lightweight MikroTik helper (stubbed).
 *
 * This module provides a small abstraction for calling the MikroTik API.
 * Right now it returns a clear error when MikroTik credentials are not provided.
 * Later we can implement the real client (node-routeros or similar) here.
 */

export async function isConfigured() {
  return !!process.env.MIKROTIK_HOST && !!process.env.MIKROTIK_USER && !!process.env.MIKROTIK_PASSWORD;
}

export type MikroTikResult = { ok: true; data?: unknown } | { ok: false; message: string };

function paramsToArray(params?: Record<string, unknown>) {
  if (!params) return [];
  return Object.entries(params).map(([k, v]) => `=${k}=${String(v ?? '')}`);
}

export async function runCommand(command: string, params?: Record<string, unknown>): Promise<MikroTikResult> {
  if (!(await isConfigured())) {
    return { ok: false, message: 'MIKROTIK_NOT_CONFIGURED' };
  }

  try {

    const mod = await import('node-routeros');
    const RouterOSAPI = (mod as any).RouterOSAPI ?? (mod as any).default;

    const host = process.env.MIKROTIK_HOST as string;
    const user = process.env.MIKROTIK_USER as string;
    const password = process.env.MIKROTIK_PASSWORD as string;
    const port = process.env.MIKROTIK_PORT ? Number(process.env.MIKROTIK_PORT) : 8728;

    const client = new RouterOSAPI({ host, user, password, port });
    await client.connect();

    const args = paramsToArray(params);
    const res = await client.write(command, args);

    await client.close();

    return { ok: true, data: res };
  } catch (err: any) {
    return { ok: false, message: err?.message ?? String(err) };
  }
}
