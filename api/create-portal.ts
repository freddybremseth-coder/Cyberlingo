import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const APP_URL = process.env.APP_URL || 'https://spanish.chatgenius.pro';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId } = req.body as { sessionId?: string };
  if (!sessionId) return res.status(400).json({ error: 'Missing checkout session' });

  try {
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkout.status !== 'complete' || typeof checkout.customer !== 'string') {
      return res.status(403).json({ error: 'Checkout session is not valid for portal access' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: checkout.customer,
      return_url: APP_URL,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: 'Could not open billing portal' });
  }
}
