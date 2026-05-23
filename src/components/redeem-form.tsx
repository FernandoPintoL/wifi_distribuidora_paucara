'use client';

import { useState } from 'react';

type RedeemState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export function RedeemForm() {
  const [code, setCode] = useState('');
  const [state, setState] = useState<RedeemState>({ status: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: 'loading' });

    const response = await fetch('/api/vouchers/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState({ status: 'error', message: payload.message ?? 'No se pudo validar el voucher.' });
      return;
    }

    setState({ status: 'success', message: payload.message ?? 'Voucher validado correctamente.' });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Acceso Hotspot</p>
        <h2 className="text-2xl font-semibold text-foreground">Ingresa tu voucher</h2>
        <p className="text-sm text-muted">Canjea el código entregado por Distribuidora Paucara para habilitar tu conexión.</p>
      </div>

      <label className="mt-6 block text-sm font-medium text-foreground" htmlFor="voucher-code">
        Código de voucher
      </label>
      <input
        id="voucher-code"
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        placeholder="PAU-8F2C1A"
        className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-lg tracking-[0.2em] text-foreground outline-none transition focus:border-accent"
      />

      <button
        type="submit"
        className="mt-4 w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={state.status === 'loading'}
      >
        {state.status === 'loading' ? 'Validando...' : 'Validar voucher'}
      </button>

      {state.status === 'error' ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p>
      ) : null}
      {state.status === 'success' ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.message}</p>
      ) : null}
    </form>
  );
}
