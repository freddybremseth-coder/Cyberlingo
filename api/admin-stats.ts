import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const ADMIN_EMAIL = 'freddy.bremseth@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminEmail = req.query.email as string;
  if (adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const customers = await stripe.customers.list({ limit: 100 });
    const subscriptions = await stripe.subscriptions.list({ limit: 100, status: 'all' });
    const charges = await stripe.charges.list({ limit: 100 });

    const activeSubs = subscriptions.data.filter(s => s.status === 'active' || s.status === 'trialing');
    const canceledSubs = subscriptions.data.filter(s => s.status === 'canceled');
    const monthlySubs = activeSubs.filter(s =>
      s.items.data[0]?.price.id === process.env.STRIPE_PRICE_MONTHLY
    );
    const yearlySubs = activeSubs.filter(s =>
      s.items.data[0]?.price.id === process.env.STRIPE_PRICE_YEARLY
    );

    const mrr = monthlySubs.length * 7.99 + yearlySubs.length * (71.91 / 12);
    const arr = mrr * 12;

    const totalRevenue = charges.data
      .filter(c => c.status === 'succeeded')
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    const last30DaysRevenue = charges.data
      .filter(c => c.status === 'succeeded' && c.created * 1000 > Date.now() - 30 * 86400000)
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    const churnRate = canceledSubs.length > 0
      ? (canceledSubs.length / (activeSubs.length + canceledSubs.length)) * 100
      : 0;

    const customerList = customers.data.map(c => {
      const sub = subscriptions.data.find(s => s.customer === c.id);
      return {
        id: c.id,
        email: c.email,
        name: c.name,
        created: c.created * 1000,
        subscription: sub ? {
          id: sub.id,
          status: sub.status,
          plan: sub.items.data[0]?.price.id === process.env.STRIPE_PRICE_YEARLY ? 'yearly' : 'monthly',
          currentPeriodEnd: sub.current_period_end * 1000,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        } : null,
      };
    });

    const recentCharges = charges.data.slice(0, 20).map(c => ({
      id: c.id,
      amount: c.amount / 100,
      currency: c.currency,
      status: c.status,
      email: c.billing_details?.email,
      created: c.created * 1000,
      description: c.description,
    }));

    res.json({
      stats: {
        totalCustomers: customers.data.length,
        activeSubscriptions: activeSubs.length,
        monthlySubscribers: monthlySubs.length,
        yearlySubscribers: yearlySubs.length,
        canceledSubscriptions: canceledSubs.length,
        mrr: Number(mrr.toFixed(2)),
        arr: Number(arr.toFixed(2)),
        totalRevenue: Number(totalRevenue.toFixed(2)),
        last30DaysRevenue: Number(last30DaysRevenue.toFixed(2)),
        churnRate: Number(churnRate.toFixed(1)),
      },
      customers: customerList,
      recentCharges,
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: err.message });
  }
}
