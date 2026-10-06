import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import { hasDatabaseAccess, requireSupabaseUser } from '../server/supabaseAuth';

const ALLOWED_MODEL = 'gemini-3.6-flash';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authUser = await requireSupabaseUser(req);

    let allowed = authUser.email === 'freddy.bremseth@gmail.com' || await hasDatabaseAccess(req);
    if (!allowed) {
      const customers = await stripe.customers.list({ email: authUser.email, limit: 10 });
      for (const customer of customers.data) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 20,
        });
        if (subscriptions.data.some(sub => sub.status === 'active' || sub.status === 'trialing')) {
          allowed = true;
          break;
        }
      }
    }

    if (!allowed) {
      return res.status(402).json({ error: 'Active access required' });
    }

    const providerKey = process.env.AI_PROVIDER_KEY || process.env.GEMINI_API_KEY;
    if (!providerKey) {
      return res.status(503).json({ error: 'Server AI is not configured' });
    }

    const { model, contents, config } = req.body || {};
    if (model !== ALLOWED_MODEL) {
      return res.status(400).json({ error: 'Model not allowed' });
    }

    const ai = new GoogleGenAI({ apiKey: providerKey });
    const response = await ai.models.generateContent({
      model: ALLOWED_MODEL,
      contents,
      config,
    });

    res.json({
      text: response.text || '',
      candidates: response.candidates || [],
      usageMetadata: response.usageMetadata || null,
    });
  } catch (err: any) {
    const status = Number(err?.statusCode) || 500;
    console.error('AI proxy error:', err);
    res.status(status).json({
      error: status === 401 ? 'Authentication required' : status === 402 ? 'Active access required' : 'AI request failed',
    });
  }
}
