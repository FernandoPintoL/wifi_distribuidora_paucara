import { VoucherForm } from '@/components/voucher-form';
import { listDashboardData, type VoucherRecord } from '@/lib/vouchers';

export default async function AdminPage() {
  const { stats, vouchers } = await listDashboardData();

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Distribuidora Paucara</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Panel de vouchers</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            Desde aquí puedes generar accesos temporales para clientes, revisar el consumo y preparar el catálogo de planes para el Hotspot.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Metric label="Total vouchers" value={stats.total} />
            <Metric label="Activos" value={stats.active} />
            <Metric label="Canjeados" value={stats.redeemed} />
          </div>
        </header>

        <VoucherForm />

        <section className="rounded-3xl border border-stone-200 bg-panel p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Últimos vouchers</h2>
              <p className="mt-1 text-sm text-muted">Listado reciente sincronizado con PostgreSQL.</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
              <thead className="bg-stone-50 text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Vence</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted">
                      Todavía no hay vouchers creados.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher: VoucherRecord) => (
                    <tr key={voucher.id}>
                      <td className="px-4 py-3 font-medium text-foreground">{voucher.code}</td>
                      <td className="px-4 py-3 text-muted">{voucher.customer_name ?? voucher.company_name}</td>
                      <td className="px-4 py-3 text-muted">{voucher.plan_name}</td>
                      <td className="px-4 py-3 text-muted">{new Date(voucher.expires_at).toLocaleString('es-PE')}</td>
                      <td className="px-4 py-3">
                        <StatusBadge active={voucher.active} expiresAt={voucher.expires_at} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-panel p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ active, expiresAt }: { active: boolean; expiresAt: string }) {
  const expired = new Date(expiresAt).getTime() < Date.now();
  const label = expired ? 'Expirado' : active ? 'Activo' : 'Inactivo';
  const className = expired || !active ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}
