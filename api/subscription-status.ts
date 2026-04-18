import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { subscriptionId } = req.query;
  if (!subscriptionId || typeof subscriptionId !== 'string') {
    return res.status(400).json({ error: 'Missing subscriptionId' });
  }

  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    res.json({
      status: sub.status,
      currentPeriodEnd: sub.current_period_end * 1000,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    });
  } catch (err: any) {
    console.error('Stripe subscription-status error:', err);
    res.status(500).json({ error: err.message });
  }
}
