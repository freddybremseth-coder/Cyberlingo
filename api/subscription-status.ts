import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireSupabaseUser } from '../server/supabaseAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authUser = await requireSupabaseUser(req);
    const { subscriptionId } = req.query;
    if (!subscriptionId || typeof subscriptionId !== 'string') {
      return res.status(400).json({ error: 'Missing subscriptionId' });
    }

    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const metadataUserId = sub.metadata?.cyberlingo_user_id;

    if (metadataUserId) {
      if (metadataUserId !== authUser.id) {
        return res.status(403).json({ error: 'Subscription does not belong to this user' });
      }
    } else if (typeof sub.customer === 'string') {
      const customer = await stripe.customers.retrieve(sub.customer);
      if ('deleted' in customer || (customer.email || '').toLowerCase() !== authUser.email) {
        return res.status(403).json({ error: 'Subscription does not belong to this user' });
      }
    }

    res.json({
      status: sub.status,
      currentPeriodEnd: sub.current_period_end * 1000,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    });
  } catch (err: any) {
    const status = Number(err?.statusCode) || 500;
    console.error('Stripe subscription-status error:', err);
    res.status(status).json({ error: status === 401 ? 'Authentication required' : 'Could not load subscription' });
  }
}
