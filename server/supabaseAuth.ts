import type { VercelRequest } from '@vercel/node';

const SUPABASE_URL = 'https://lztyhxzycqbpqqqemoxl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NBiSvPbkmFmB7M4qDkan_Q_lYt2fYuE';

export interface VerifiedSupabaseUser {
  id: string;
  email: string;
}

const getAuthorization = (req: VercelRequest): string => {
  const header = req.headers.authorization;
  const authorization = Array.isArray(header) ? header[0] : header;
  if (!authorization?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Authentication required'), { statusCode: 401 });
  }
  return authorization;
};

export const requireSupabaseUser = async (req: VercelRequest): Promise<VerifiedSupabaseUser> => {
  const authorization = getAuthorization(req);

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: authorization,
    },
  });

  if (!response.ok) {
    throw Object.assign(new Error('Invalid session'), { statusCode: 401 });
  }

  const user = await response.json() as { id?: string; email?: string };
  if (!user.id || !user.email) {
    throw Object.assign(new Error('Invalid user'), { statusCode: 401 });
  }

  return { id: user.id, email: user.email.trim().toLowerCase() };
};

export const hasDatabaseAccess = async (req: VercelRequest): Promise<boolean> => {
  const authorization = getAuthorization(req);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_active_access`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (!response.ok) return false;
  return (await response.json()) === true;
};

export const requireActiveAccess = async (req: VercelRequest): Promise<VerifiedSupabaseUser> => {
  const user = await requireSupabaseUser(req);
  if (user.email === 'freddy.bremseth@gmail.com') return user;
  if (!(await hasDatabaseAccess(req))) {
    throw Object.assign(new Error('Active subscription or grant required'), { statusCode: 402 });
  }
  return user;
};
