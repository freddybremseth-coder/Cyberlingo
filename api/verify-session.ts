import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireSupabaseUser } from '../server/supabaseAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authUser = await requireSupabaseUser(req);
    const { session_id } = req.query;
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'Missing session_id' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });

    if (session.status !== 'complete') {
      return res.status(400).json({ error: 'Session not completed' });
    }

    const sessionUserId = session.client_reference_id || session.metadata?.cyberlingo_user_id || null;
    const checkoutEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase();

    if (sessionUserId) {
      if (sessionUserId !== authUser.id) {
        return res.status(403).json({ error: 'Session does not belong to this user' });
      }
    } else if (!checkoutEmail || checkoutEmail !== authUser.email) {
      return res.status(403).json({ error: 'Session does not belong to this user' });
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
    const status = Number(err?.statusCode) || 500;
    console.error('Stripe verify-session error:', err);
    res.status(status).json({ error: status === 401 ? 'Authentication required' : 'Could not verify checkout' });
  }
}
