import { cookies } from 'next/headers';
import { AuthPanel } from '@/components/auth-panel';
import { RedeemForm } from '@/components/redeem-form';
import { SESSION_COOKIE_NAME, getUserBySessionToken } from '@/lib/auth';

const highlights = [
  'Acceso temporal con vouchers',
  'Panel para clientes mayoristas',
  'Preparado para integrar MikroTik HotSpot'
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const currentUser = sessionToken ? await getUserBySessionToken(sessionToken) : null;

  return (
    <main className="min-h-screen bg-background bg-grain text-foreground">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:flex-row lg:items-center lg:gap-16 lg:py-20">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex rounded-full border border-accent/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Distribuidora Paucara
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-7xl">
            Vouchers para clientes mayoristas con identidad de marca propia.
          </h1>
          <p className="text-lg leading-8 text-muted sm:text-xl">
            Una web dedicada para distribuir accesos temporales, permitir registro de usuarios sin voucher, mostrar la marca de Distribuidora Paucara y conectar con un Hotspot MikroTik sin depender del router para la lógica de negocio.
          </p>

          <div className="flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span key={item} className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm text-foreground shadow-sm">
                {item}
              </span>
            ))}
          </div>

          <div className="grid gap-4 pt-2 sm:grid-cols-3">
            <Stat title="Control" value="PostgreSQL" />
            <Stat title="Entrega" value="Vouchers" />
            <Stat title="Diseño" value="Responsive" />
          </div>
        </div>

        <div className="w-full max-w-xl space-y-6">
          <RedeemForm />
          <AuthPanel currentUser={currentUser ? { fullName: currentUser.full_name, email: currentUser.email } : null} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft backdrop-blur">
          <h2 className="text-2xl font-semibold">Cómo funcionará el flujo</h2>
          <ol className="mt-6 space-y-4 text-sm text-muted">
            <li>1. El cliente se conecta al WiFi y ve el portal de Paucara.</li>
            <li>2. Ingresa el voucher o crea una cuenta si no tienes uno.</li>
            <li>3. La plataforma valida el código contra PostgreSQL.</li>
            <li>4. MikroTik habilita la sesión de navegación según el plan asignado.</li>
          </ol>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-panel p-8 shadow-soft">
          <h2 className="text-2xl font-semibold">Pensado para crecer</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Este arranque deja listo el espacio para agregar pagos, reportes por cliente, impresión de tickets, expiración automática y autenticación con MikroTik o RADIUS más adelante.
          </p>
        </div>
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/80 p-5 shadow-soft">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
