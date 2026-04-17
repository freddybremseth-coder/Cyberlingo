import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });

    if (session.status !== 'complete') {
      return res.status(400).json({ error: 'Session not completed' });
    }

    const sub = session.subscription as Stripe.Subscription;
    const priceId = sub.items.data[0]?.price.id;
    const plan = priceId === process.env.STRIPE_PRICE_YEARLY ? 'yearly' : 'monthly';

    res.json({
      customerId: session.customer as string,
      subscriptionId: sub.id,
      status: sub.status,
      plan,
      currentPeriodEnd: sub.current_period_end * 1000,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    });
  } catch (err: any) {
    console.error('Stripe verify-session error:', err);
    res.status(500).json({ error: err.message });
  }
}
