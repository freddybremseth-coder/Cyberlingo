import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Stripe-wide admin analytics are intentionally disabled until Cyberlingo
 * has server-verified admin authentication. The previous endpoint trusted
 * an email query parameter from the browser, which is not authentication.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  return res.status(503).json({
    error: 'Stripe admin analytics are temporarily disabled pending secure admin authentication.',
    code: 'SECURE_ADMIN_AUTH_REQUIRED',
  });
}
