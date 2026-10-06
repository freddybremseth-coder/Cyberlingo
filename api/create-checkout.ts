import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireSupabaseUser } from '../server/supabaseAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const APP_URL = process.env.APP_URL || 'https://spanish.chatgenius.pro';

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_YEARLY!,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authUser = await requireSupabaseUser(req);
    const { plan } = req.body as { plan: 'monthly' | 'yearly' };
    if (!plan || !PRICES[plan]) return res.status(400).json({ error: 'Invalid plan' });

    const existingCustomers = await stripe.customers.list({ email: authUser.email, limit: 1 });
    const existingCustomer = existingCustomers.data[0];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      ...(existingCustomer ? { customer: existingCustomer.id } : { customer_email: authUser.email }),
      client_reference_id: authUser.id,
      metadata: { cyberlingo_user_id: authUser.id },
      success_url: `${APP_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}?cancelled=true`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { plan, cyberlingo_user_id: authUser.id },
      },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    const status = Number(err?.statusCode) || 500;
    console.error('Stripe checkout error:', err);
    res.status(status).json({ error: status === 401 ? 'Authentication required' : 'Checkout failed' });
  }
}
