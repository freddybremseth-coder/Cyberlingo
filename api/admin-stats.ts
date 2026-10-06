import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireSupabaseUser } from '../server/supabaseAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const ADMIN_EMAIL = 'freddy.bremseth@gmail.com';

const listAll = async <T>(
  fetchPage: (startingAfter?: string) => Promise<{ data: T[]; has_more: boolean }>,
  getId: (item: T) => string,
): Promise<T[]> => {
  const all: T[] = [];
  let startingAfter: string | undefined;
  for (;;) {
    const page = await fetchPage(startingAfter);
    all.push(...page.data);
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = getId(page.data[page.data.length - 1]);
  }
  return all;
};

const monthlyEquivalent = (sub: Stripe.Subscription): number => {
  const item = sub.items.data[0];
  const unit = (item?.price.unit_amount || 0) / 100;
  const recurring = item?.price.recurring;
  if (!recurring) return 0;
  const quantity = item.quantity || 1;
  const total = unit * quantity;

  if (recurring.interval === 'month') {
    return total / Math.max(1, recurring.interval_count || 1);
  }
  if (recurring.interval === 'year') {
    return total / (12 * Math.max(1, recurring.interval_count || 1));
  }
  if (recurring.interval === 'week') {
    return total * 52 / 12 / Math.max(1, recurring.interval_count || 1);
  }
  if (recurring.interval === 'day') {
    return total * 365 / 12 / Math.max(1, recurring.interval_count || 1);
  }
  return 0;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authUser = await requireSupabaseUser(req);
    if (authUser.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [customers, subscriptions, charges] = await Promise.all([
      listAll(
        async startingAfter => stripe.customers.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) }),
        c => (c as Stripe.Customer).id,
      ),
      listAll(
        async startingAfter => stripe.subscriptions.list({ limit: 100, status: 'all', ...(startingAfter ? { starting_after: startingAfter } : {}) }),
        s => (s as Stripe.Subscription).id,
      ),
      listAll(
        async startingAfter => stripe.charges.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) }),
        c => (c as Stripe.Charge).id,
      ),
    ]);

    const customerRows = customers as Stripe.Customer[];
    const subscriptionRows = subscriptions as Stripe.Subscription[];
    const chargeRows = charges as Stripe.Charge[];

    const activeSubs = subscriptionRows.filter(s => s.status === 'active' || s.status === 'trialing');
    const canceledSubs = subscriptionRows.filter(s => s.status === 'canceled');
    const mrr = activeSubs.reduce((sum, sub) => sum + monthlyEquivalent(sub), 0);
    const totalRevenue = chargeRows
      .filter(c => c.status === 'succeeded')
      .reduce((sum, c) => sum + c.amount, 0) / 100;
    const cutoff = Date.now() - 30 * 86400_000;
    const last30DaysRevenue = chargeRows
      .filter(c => c.status === 'succeeded' && c.created * 1000 > cutoff)
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    const customersOut = customerRows.map(c => {
      const subs = subscriptionRows
        .filter(s => s.customer === c.id)
        .sort((a, b) => b.created - a.created);
      const sub = subs[0] || null;
      const item = sub?.items.data[0];
      return {
        id: c.id,
        email: c.email,
        name: c.name,
        created: c.created * 1000,
        subscription: sub ? {
          id: sub.id,
          status: sub.status,
          interval: item?.price.recurring?.interval || null,
          unitAmount: (item?.price.unit_amount || 0) / 100,
          currency: item?.price.currency || 'eur',
          currentPeriodEnd: sub.current_period_end * 1000,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        } : null,
      };
    });

    res.json({
      stats: {
        totalCustomers: customerRows.length,
        activeSubscriptions: activeSubs.length,
        canceledSubscriptions: canceledSubs.length,
        mrr: Number(mrr.toFixed(2)),
        arr: Number((mrr * 12).toFixed(2)),
        totalRevenue: Number(totalRevenue.toFixed(2)),
        last30DaysRevenue: Number(last30DaysRevenue.toFixed(2)),
      },
      customers: customersOut,
    });
  } catch (err: any) {
    const status = Number(err?.statusCode) || 500;
    console.error('Secure admin stats error:', err);
    res.status(status).json({ error: status === 401 ? 'Authentication required' : 'Could not load admin stats' });
  }
}
