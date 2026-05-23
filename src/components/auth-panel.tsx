'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'register';

type AuthPanelProps = {
  currentUser: {
    fullName: string;
    email: string;
  } | null;
};

type FormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export function AuthPanel({ currentUser }: AuthPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [state, setState] = useState<FormState>({ status: 'idle' });

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: 'loading' });

    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? '')
      })
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState({ status: 'error', message: payload.message ?? 'No se pudo iniciar sesión.' });
      return;
    }

    setState({ status: 'success', message: payload.message ?? 'Sesión iniciada.' });
    router.refresh();
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: 'loading' });

    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: String(formData.get('fullName') ?? ''),
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? '')
      })
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState({ status: 'error', message: payload.message ?? 'No se pudo registrar la cuenta.' });
      return;
    }

    setState({ status: 'success', message: payload.message ?? 'Cuenta creada.' });
    router.refresh();
  }

  async function handleLogout() {
    setState({ status: 'loading' });
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    setState({ status: 'idle' });
  }

  if (currentUser) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Cuenta activa</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">{currentUser.fullName}</h2>
        <p className="mt-1 text-sm text-muted">{currentUser.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Cerrar sesión
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex gap-2 rounded-full bg-stone-100 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'login' ? 'bg-white text-foreground shadow-sm' : 'text-muted'}`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'register' ? 'bg-white text-foreground shadow-sm' : 'text-muted'}`}
        >
          Registrarme
        </button>
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Acceso de usuario</p>
        <h2 className="text-2xl font-semibold text-foreground">
          {mode === 'login' ? 'Entra con tu cuenta' : 'Crea una cuenta si no tienes voucher'}
        </h2>
        <p className="text-sm text-muted">
          {mode === 'login'
            ? 'Si ya te registraste, accede con tu correo y contraseña.'
            : 'Regístrate para entrar sin voucher y dejar tu cuenta lista para futuras conexiones.'}
        </p>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Field label="Correo" name="email" type="email" placeholder="cliente@correo.com" />
          <Field label="Contraseña" name="password" type="password" placeholder="Tu contraseña" />
          <button
            type="submit"
            className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            disabled={state.status === 'loading'}
          >
            {state.status === 'loading' ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <Field label="Nombre completo" name="fullName" placeholder="Juan Pérez" />
          <Field label="Correo" name="email" type="email" placeholder="cliente@correo.com" />
          <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" />
          <button
            type="submit"
            className="w-full rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#332822] disabled:opacity-60"
            disabled={state.status === 'loading'}
          >
            {state.status === 'loading' ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>
      )}

      {state.status === 'error' ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p> : null}
      {state.status === 'success' ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.message}</p> : null}
    </section>
  );
}

function Field(props: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? 'text'}
        placeholder={props.placeholder}
        required
        className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
      />
    </label>
  );
}
