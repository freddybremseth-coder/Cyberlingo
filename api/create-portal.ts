import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireSupabaseUser } from '../server/supabaseAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const APP_URL = process.env.APP_URL || 'https://spanish.chatgenius.pro';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authUser = await requireSupabaseUser(req);
    const { sessionId } = req.body as { sessionId?: string };
    if (!sessionId) return res.status(400).json({ error: 'Missing checkout session' });

    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkout.status !== 'complete' || typeof checkout.customer !== 'string') {
      return res.status(403).json({ error: 'Checkout session is not valid for portal access' });
    }

    const sessionUserId = checkout.client_reference_id || checkout.metadata?.cyberlingo_user_id || null;
    const checkoutEmail = (checkout.customer_details?.email || checkout.customer_email || '').toLowerCase();

    if (sessionUserId) {
      if (sessionUserId !== authUser.id) {
        return res.status(403).json({ error: 'Checkout session does not belong to this user' });
      }
    } else if (!checkoutEmail || checkoutEmail !== authUser.email) {
      const customer = await stripe.customers.retrieve(checkout.customer);
      if ('deleted' in customer || (customer.email || '').toLowerCase() !== authUser.email) {
        return res.status(403).json({ error: 'Customer does not belong to this user' });
      }
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: checkout.customer,
      return_url: APP_URL,
    });

    res.json({ url: portal.url });
  } catch (err: any) {
    const status = Number(err?.statusCode) || 500;
    console.error('Stripe portal error:', err);
    res.status(status).json({ error: status === 401 ? 'Authentication required' : 'Could not open billing portal' });
  }
}
