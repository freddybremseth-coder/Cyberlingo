import type { VercelRequest } from '@vercel/node';

const SUPABASE_URL = 'https://lztyhxzycqbpqqqemoxl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NBiSvPbkmFmB7M4qDkan_Q_lYt2fYuE';

export interface VerifiedSupabaseUser {
  id: string;
  email: string;
}

export const requireSupabaseUser = async (req: VercelRequest): Promise<VerifiedSupabaseUser> => {
  const header = req.headers.authorization;
  const authorization = Array.isArray(header) ? header[0] : header;

  if (!authorization?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Authentication required'), { statusCode: 401 });
  }

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
