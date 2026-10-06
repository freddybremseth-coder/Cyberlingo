import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import {
  SourceLang,
  UserProfile,
  todayString,
  getLevelFromXp,
  isLifetimeEmail,
  createLifetimeSubscription,
} from '../types';

export type AccessKind = 'trial' | 'paid' | 'manual' | 'family' | 'partner' | 'promo' | 'lifetime';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  source_lang: SourceLang;
  role: 'user' | 'admin';
  created_at: string;
  entitlements: AdminEntitlement[];
  subscription?: {
    plan: 'monthly' | 'yearly' | null;
    status: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  } | null;
  aiCostEur?: number;
}

export interface AdminEntitlement {
  id: string;
  user_id: string;
  kind: AccessKind;
  status: 'active' | 'paused' | 'revoked';
  starts_at: string;
  ends_at: string | null;
  note: string | null;
  created_at: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  access_kind: Exclude<AccessKind, 'trial' | 'paid'>;
  starts_at: string;
  ends_at: string | null;
  status: 'pending' | 'claimed' | 'revoked';
  note: string | null;
  created_at: string;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const localUserForEmail = (email: string): UserProfile | null => {
  try {
    const users = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}') as Record<string, UserProfile>;
    const normalized = normalizeEmail(email);
    return Object.values(users).find(u => normalizeEmail(u.email || '') === normalized) || null;
  } catch {
    return null;
  }
};

const defaultUser = (authUser: User, sourceLang: SourceLang = 'no'): UserProfile => ({
  username:
    (authUser.user_metadata?.full_name as string | undefined)?.trim() ||
    authUser.email?.split('@')[0] ||
    'bruker',
  email: normalizeEmail(authUser.email || ''),
  sourceLang,
  completedLessonIds: [],
  masteredVocab: [],
  masteredPhrases: [],
  lastActive: Date.now(),
  streak: 0,
  lastStreakDate: '',
  xp: 0,
  level: 1,
  subscription: {
    plan: 'trial',
    trialStartDate: Date.now(),
    subscribedDate: null,
    expiresAt: Date.now() + 7 * 86400_000,
  },
  apiKey: '',
  achievements: [],
  dailyGoalXp: 50,
  todayXp: 0,
  lastGoalDate: todayString(),
  conversationsCompleted: 0,
  freeTasksUsed: 0,
});

const activeEntitlement = (rows: any[]): any | null => {
  const now = Date.now();
  return (rows || [])
    .filter(row =>
      row.status === 'active' &&
      new Date(row.starts_at).getTime() <= now &&
      (!row.ends_at || new Date(row.ends_at).getTime() > now)
    )
    .sort((a, b) => {
      const priority: Record<string, number> = {
        lifetime: 100,
        family: 90,
        partner: 80,
        manual: 70,
        promo: 60,
        paid: 50,
        trial: 10,
      };
      return (priority[b.kind] || 0) - (priority[a.kind] || 0);
    })[0] || null;
};

const subscriptionFromCloud = (
  entitlement: any | null,
  stripe: any | null,
  existing: UserProfile['subscription'],
): UserProfile['subscription'] => {
  if (stripe && ['active', 'trialing'].includes(stripe.status)) {
    return {
      ...existing,
      plan: stripe.plan === 'yearly' ? 'yearly' : 'monthly',
      stripeCustomerId: stripe.stripe_customer_id || existing.stripeCustomerId,
      stripeSubscriptionId: stripe.stripe_subscription_id || existing.stripeSubscriptionId,
      stripeStatus: stripe.status,
      currentPeriodEnd: stripe.current_period_end ? new Date(stripe.current_period_end).getTime() : undefined,
      cancelAtPeriodEnd: Boolean(stripe.cancel_at_period_end),
      subscribedDate: existing.subscribedDate || Date.now(),
      expiresAt: stripe.current_period_end ? new Date(stripe.current_period_end).getTime() : null,
    };
  }

  if (!entitlement) {
    return { ...existing, plan: 'none', expiresAt: Date.now() - 1 };
  }

  if (entitlement.kind === 'lifetime') {
    return { ...createLifetimeSubscription(existing), accessKind: 'lifetime' } as any;
  }

  const start = new Date(entitlement.starts_at).getTime();
  const end = entitlement.ends_at ? new Date(entitlement.ends_at).getTime() : null;

  if (entitlement.kind === 'trial') {
    return {
      ...existing,
      plan: 'trial',
      trialStartDate: start,
      subscribedDate: null,
      expiresAt: end,
      accessKind: 'trial',
    } as any;
  }

  return {
    ...existing,
    plan: 'monthly',
    trialStartDate: existing.trialStartDate || start,
    subscribedDate: start,
    expiresAt: end,
    currentPeriodEnd: end || undefined,
    stripeStatus: 'active',
    accessKind: entitlement.kind,
  } as any;
};

export const sendMagicLink = async (
  email: string,
  fullName: string,
  sourceLang: SourceLang,
  phone?: string,
) => {
  const cleanEmail = normalizeEmail(email);
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: window.location.origin,
      data: {
        full_name: fullName.trim(),
        source_lang: sourceLang,
        phone: phone?.trim() || null,
      },
    },
  });
  if (error) throw error;
};

export const loadCloudUser = async (authUser: User): Promise<UserProfile> => {
  const email = normalizeEmail(authUser.email || '');
  const cached = localUserForEmail(email);
  const fallback = cached || defaultUser(authUser, (authUser.user_metadata?.source_lang as SourceLang) || 'no');

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (!profile) {
    const payload = {
      id: authUser.id,
      email,
      full_name: (authUser.user_metadata?.full_name as string | undefined) || fallback.username,
      phone: (authUser.user_metadata?.phone as string | undefined) || null,
      source_lang: fallback.sourceLang,
    };
    const { data, error } = await supabase.from('profiles').insert(payload).select('*').single();
    if (error) throw error;
    profile = data;
  }

  const [entitlementResult, subscriptionResult, stateResult] = await Promise.all([
    supabase.from('entitlements').select('*').eq('user_id', authUser.id),
    supabase.from('subscriptions').select('*').eq('user_id', authUser.id).maybeSingle(),
    supabase.from('learning_state').select('state').eq('user_id', authUser.id).maybeSingle(),
  ]);

  const cloudState = (stateResult.data?.state || {}) as Partial<UserProfile>;
  const base: UserProfile = {
    ...fallback,
    ...cloudState,
    username: profile.full_name || cloudState.username || fallback.username,
    email,
    sourceLang: (profile.source_lang as SourceLang) || cloudState.sourceLang || fallback.sourceLang,
    apiKey: localStorage.getItem('cyberlingo_api_key') || fallback.apiKey || '',
  };

  if (isLifetimeEmail(email)) {
    base.username = 'freddy';
    base.subscription = createLifetimeSubscription(base.subscription);
    base.freeTasksUsed = 0;
  } else {
    base.subscription = subscriptionFromCloud(
      activeEntitlement(entitlementResult.data || []),
      subscriptionResult.data,
      base.subscription,
    );
  }

  base.level = getLevelFromXp(base.xp || 0);

  if ((!stateResult.data?.state || Object.keys(stateResult.data.state).length === 0) && cached) {
    await saveCloudUser(base, authUser.id);
  }

  return base;
};

export const saveCloudUser = async (user: UserProfile, knownUserId?: string) => {
  const session = await supabase.auth.getSession();
  const userId = knownUserId || session.data.session?.user.id;
  if (!userId) return;

  const { apiKey: _apiKey, ...safeState } = user;
  const { error } = await supabase.from('learning_state').upsert({
    user_id: userId,
    state: { ...safeState, apiKey: '' },
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('Cloud progress sync failed:', error.message);

  await supabase
    .from('profiles')
    .update({
      full_name: user.username,
      source_lang: user.sourceLang,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
};

export const signOutCloud = async () => {
  await supabase.auth.signOut();
};

export const listAdminUsers = async (): Promise<AdminProfile[]> => {
  const [profiles, entitlements, subscriptions, usage] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('entitlements').select('*').order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('*'),
    supabase.from('ai_usage_monthly').select('*'),
  ]);

  if (profiles.error) throw profiles.error;
  if (entitlements.error) throw entitlements.error;

  const entitlementRows = (entitlements.data || []) as AdminEntitlement[];
  const subRows = subscriptions.data || [];
  const usageRows = usage.data || [];

  return (profiles.data || []).map((p: any) => ({
    ...p,
    entitlements: entitlementRows.filter(e => e.user_id === p.id),
    subscription: subRows.find((s: any) => s.user_id === p.id) || null,
    aiCostEur: usageRows
      .filter((u: any) => u.user_id === p.id)
      .reduce((sum: number, u: any) => sum + Number(u.estimated_cost_eur || 0), 0),
  }));
};

export const listAdminInvitations = async (): Promise<AdminInvitation[]> => {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as AdminInvitation[];
};

export const grantAccess = async (
  userId: string,
  kind: Exclude<AccessKind, 'trial' | 'paid'>,
  endsAt: string | null,
  note?: string,
) => {
  const session = await supabase.auth.getSession();
  const { error } = await supabase.from('entitlements').insert({
    user_id: userId,
    kind,
    status: 'active',
    starts_at: new Date().toISOString(),
    ends_at: endsAt,
    note: note || 'Admin grant',
    created_by: session.data.session?.user.id || null,
  });
  if (error) throw error;
};

export const revokeAccess = async (userId: string) => {
  const { error } = await supabase
    .from('entitlements')
    .update({ status: 'revoked' })
    .eq('user_id', userId)
    .eq('status', 'active')
    .neq('kind', 'lifetime');
  if (error) throw error;
};

export const inviteUser = async (input: {
  email: string;
  fullName: string;
  phone?: string;
  accessKind: Exclude<AccessKind, 'trial' | 'paid'>;
  endsAt: string | null;
  note?: string;
}) => {
  const email = normalizeEmail(input.email);
  const session = await supabase.auth.getSession();

  const { data: existing, error: lookupError } = await supabase
    .from('profiles')
    .select('id,email')
    .eq('email', email)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing) {
    await grantAccess(existing.id, input.accessKind, input.endsAt, input.note);
    await supabase
      .from('profiles')
      .update({
        full_name: input.fullName.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    const { error } = await supabase.from('invitations').insert({
      email,
      full_name: input.fullName.trim(),
      phone: input.phone?.trim() || null,
      access_kind: input.accessKind,
      starts_at: new Date().toISOString(),
      ends_at: input.endsAt,
      note: input.note || 'Admin invitation',
      created_by: session.data.session?.user.id || null,
    });
    if (error) throw error;
  }

  await sendMagicLink(email, input.fullName, 'no', input.phone);
};
