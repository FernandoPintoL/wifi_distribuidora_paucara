import { createHash, pbkdf2Sync, randomBytes } from 'crypto';
import { query } from './db';

export const SESSION_COOKIE_NAME = 'paucara_session';
const SESSION_TTL_DAYS = 7;

export type AuthUserRecord = {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
  last_login_at: string | null;
  created_at: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const derived = pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, digest] = storedHash.split(':');

  if (!salt || !digest) {
    return false;
  }

  const derived = pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return derived === digest;
}

export async function createUser(input: { fullName: string; email: string; password: string }) {
  const passwordHash = hashPassword(input.password);
  const result = await query<AuthUserRecord>(
    `
      insert into users (full_name, email, password_hash)
      values ($1, $2, $3)
      returning *
    `,
    [input.fullName.trim(), normalizeEmail(input.email), passwordHash]
  );

  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const result = await query<AuthUserRecord>('select * from users where email = $1 limit 1', [normalizeEmail(email)]);
  return result.rows[0] ?? null;
}

export async function getUserBySessionToken(token: string) {
  const result = await query<Pick<AuthUserRecord, 'id' | 'full_name' | 'email' | 'role' | 'last_login_at' | 'created_at'>>(
    `
      select
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.last_login_at,
        u.created_at
      from auth_sessions s
      inner join users u on u.id = s.user_id
      where s.token_hash = $1
        and s.expires_at > now()
      limit 1
    `,
    [hashToken(token)]
  );

  return result.rows[0] ?? null;
}

export async function registerAndStartSession(input: { fullName: string; email: string; password: string }) {
  const existingUser = await getUserByEmail(input.email);

  if (existingUser) {
    return { ok: false as const, message: 'Ese correo ya está registrado.' };
  }

  const user = await createUser(input);
  const token = await createSession(user.id);

  return {
    ok: true as const,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    },
    token
  };
}

export async function loginAndStartSession(input: { email: string; password: string }) {
  const user = await getUserByEmail(input.email);

  if (!user) {
    return { ok: false as const, message: 'No encontramos una cuenta con ese correo.' };
  }

  const passwordOk = verifyPassword(input.password, user.password_hash);

  if (!passwordOk) {
    return { ok: false as const, message: 'La contraseña no es correcta.' };
  }

  const token = await createSession(user.id);

  await query('update users set last_login_at = now() where id = $1', [user.id]);

  return {
    ok: true as const,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    },
    token
  };
}

async function createSession(userId: number) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `
      insert into auth_sessions (user_id, token_hash, expires_at)
      values ($1, $2, $3)
    `,
    [userId, tokenHash, expiresAt]
  );

  return token;
}

export async function revokeSession(token: string) {
  await query('delete from auth_sessions where token_hash = $1', [hashToken(token)]);
}
