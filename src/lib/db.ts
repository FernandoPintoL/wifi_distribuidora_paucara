import { Pool, type QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? { connectionString }
  : {
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_DATABASE ?? 'control',
      user: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '1234'
    };

const globalForPool = globalThis as unknown as {
  pool?: Pool;
};

export const pool = globalForPool.pool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForPool.pool = pool;
}

let schemaReady: Promise<void> | null = null;

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool
      .query(`
        create table if not exists users (
          id serial primary key,
          full_name text not null,
          email text not null unique,
          password_hash text not null,
          role text not null default 'customer',
          last_login_at timestamptz,
          created_at timestamptz not null default now()
        );

        create table if not exists auth_sessions (
          id serial primary key,
          user_id integer not null references users(id) on delete cascade,
          token_hash text not null unique,
          expires_at timestamptz not null,
          created_at timestamptz not null default now()
        );

        create table if not exists vouchers (
          id serial primary key,
          code text not null unique,
          company_name text not null,
          customer_name text,
          plan_name text not null,
          minutes_valid integer not null,
          data_limit_mb integer,
          max_sessions integer not null default 1,
          active boolean not null default true,
          redeemed_count integer not null default 0,
          last_redeemed_at timestamptz,
          expires_at timestamptz not null,
          created_at timestamptz not null default now()
        );

        create table if not exists voucher_redemptions (
          id serial primary key,
          voucher_id integer not null references vouchers(id) on delete cascade,
          remote_ip text,
          user_agent text,
          redeemed_at timestamptz not null default now()
        );
      `)
      .then(() => undefined);
  }

  return schemaReady;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  await ensureSchema();
  return pool.query<T>(text, values);
}
