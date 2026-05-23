'use client';

import { useState } from 'react';

type VoucherFormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export function VoucherForm() {
  const [state, setState] = useState<VoucherFormState>({ status: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: 'loading' });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      companyName: String(formData.get('companyName') ?? ''),
      customerName: String(formData.get('customerName') ?? ''),
      planName: String(formData.get('planName') ?? ''),
      minutesValid: Number(formData.get('minutesValid') ?? 0),
      dataLimitMb: Number(formData.get('dataLimitMb') ?? 0),
      maxSessions: Number(formData.get('maxSessions') ?? 1)
    };

    const response = await fetch('/api/vouchers/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { message?: string; code?: string };

    if (!response.ok) {
      setState({ status: 'error', message: result.message ?? 'No se pudo crear el voucher.' });
      return;
    }

    form.reset();
    setState({
      status: 'success',
      message: `Voucher creado: ${result.code ?? 'OK'}`
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-stone-200 bg-panel p-6 shadow-soft md:grid-cols-2">
      <div className="md:col-span-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Panel interno</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Crear voucher para cliente mayorista</h2>
        <p className="mt-1 text-sm text-muted">Usa este formulario para generar accesos temporales para clientes de Distribuidora Paucara.</p>
      </div>

      <Field label="Empresa" name="companyName" placeholder="Distribuidora Paucara" required />
      <Field label="Cliente" name="customerName" placeholder="Bodega Los Andes" />
      <Field label="Plan" name="planName" placeholder="Voucher diario" required />
      <Field label="Minutos" name="minutesValid" placeholder="1440" type="number" required />
      <Field label="Megas" name="dataLimitMb" placeholder="500" type="number" />
      <Field label="Sesiones" name="maxSessions" placeholder="1" type="number" />

      <button
        type="submit"
        className="md:col-span-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#332822] disabled:opacity-60"
        disabled={state.status === 'loading'}
      >
        {state.status === 'loading' ? 'Creando...' : 'Crear voucher'}
      </button>

      {state.status === 'error' ? <p className="md:col-span-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p> : null}
      {state.status === 'success' ? <p className="md:col-span-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.message}</p> : null}
    </form>
  );
}

function Field(props: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? 'text'}
        placeholder={props.placeholder}
        required={props.required}
        className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
      />
    </label>
  );
}
