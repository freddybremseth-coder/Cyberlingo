import type { User } from '@supabase/supabase-js';
import {
  SourceLang,
  UserProfile,
  createLifetimeSubscription,
  getLevelFromXp,
  todayString,
} from '../types';
import { supabase } from './supabaseClient';

const API_BASE =
  import.meta.env.VITE_REALTYFLOW_SPANISH_API ||
  'https://realtyflow.chatgenius.pro/api/public/spanish';

type PlatformAccountResponse = {
  account: any;
  usage?: {
    ai_requests?: number | string;
    input_tokens?: number | string;
    output_tokens?: number | string;
    estimated_cost_usd?: number | string;
  };
};

const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase();

function localUserForEmail(email: string): UserProfile | null {
  try {
    const users = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}') as Record<string, UserProfile>;
    const normalized = normalizeEmail(email);
    return Object.values(users).find(user => normalizeEmail(user.email) === normalized) || null;
  } catch {
    return null;
  }
}

function defaultUser(authUser: User): UserProfile {
  const email = normalizeEmail(authUser.email);
  const sourceLang = ((authUser.user_metadata?.source_lang || 'no') as SourceLang);
  return {
    username:
      String(authUser.user_metadata?.full_name || '').trim() ||
      email.split('@')[0] ||
      'bruker',
    email,
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
      accessKind: 'trial',
      accessStatus: 'active',
    },
    apiKey: '',
    achievements: [],
    dailyGoalXp: 50,
    todayXp: 0,
    lastGoalDate: todayString(),
    conversationsCompleted: 0,
    freeTasksUsed: 0,
  };
}

function platformSubscription(remote: any, existing: UserProfile['subscription']): UserProfile['subscription'] {
  const sub = remote?.subscription || {};
  const kind = String(sub.access_kind || '');
  const accessStatus = String(sub.access_status || 'suspended') as UserProfile['subscription']['accessStatus'];
  const endIso = sub.current_period_ends_at || sub.trial_ends_at || null;
  const endMs = endIso ? new Date(endIso).getTime() : null;

  if (kind === 'lifetime') {
    return {
      ...createLifetimeSubscription(existing),
      accessKind: 'lifetime',
      accessStatus: 'active',
    };
  }

  if (sub.provider === 'stripe') {
    const rawStatus = String(sub.status || 'active');
    const stripeStatus =
      rawStatus === 'cancelled' ? 'canceled' :
      rawStatus === 'past_due' ? 'past_due' :
      rawStatus === 'trialing' ? 'trialing' :
      rawStatus === 'active' ? 'active' :
      'incomplete';

    return {
      ...existing,
      plan: sub.billing_cycle === 'yearly' ? 'yearly' : 'monthly',
      trialStartDate: existing.trialStartDate || Date.now(),
      subscribedDate: existing.subscribedDate || Date.now(),
      expiresAt: endMs,
      stripeCustomerId: sub.external_customer_id || undefined,
      stripeSubscriptionId: sub.external_subscription_id || undefined,
      currentPeriodEnd: endMs || undefined,
      stripeStatus,
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      accessKind: 'paid',
      accessStatus,
    };
  }

  if (String(sub.status || '') === 'trialing' || kind === 'trial') {
    const trialEndMs = sub.trial_ends_at ? new Date(sub.trial_ends_at).getTime() : endMs;
    return {
      ...existing,
      plan: 'trial',
      trialStartDate: trialEndMs ? trialEndMs - 7 * 86400_000 : Date.now(),
      subscribedDate: null,
      expiresAt: trialEndMs,
      accessKind: 'trial',
      accessStatus,
    };
  }

  if (['manual', 'family', 'partner', 'promo'].includes(kind)) {
    return {
      ...existing,
      plan: 'complimentary',
      trialStartDate: existing.trialStartDate || Date.now(),
      subscribedDate: existing.subscribedDate || Date.now(),
      expiresAt: endMs,
      accessKind: kind as 'manual' | 'family' | 'partner' | 'promo',
      accessStatus,
    };
  }

  return {
    ...existing,
    plan: 'none',
    expiresAt: Date.now() - 1,
    accessStatus: 'suspended',
  };
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Du må være logget inn.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = await authHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'RealtyFlow API-feil') as Error & { status?: number; code?: string };
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export async function sendMagicLink(
  email: string,
  fullName: string,
  sourceLang: SourceLang,
  phone?: string,
) {
  const cleanEmail = normalizeEmail(email);
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: 'https://spanish.chatgenius.pro',
      data: {
        app_origin: 'spanish',
        full_name: fullName.trim(),
        source_lang: sourceLang,
        phone: phone?.trim() || null,
      },
    },
  });
  if (error) throw error;
}

export async function loadPlatformUser(authUser: User): Promise<UserProfile> {
  const email = normalizeEmail(authUser.email);
  const cached = localUserForEmail(email);
  const fallback = cached || defaultUser(authUser);

  const payload = await apiFetch('/account') as PlatformAccountResponse;
  const remote = payload.account || {};
  const cloudState = remote.learning_state && typeof remote.learning_state === 'object'
    ? remote.learning_state as Partial<UserProfile>
    : {};

  let user: UserProfile = {
    ...fallback,
    ...cloudState,
    username: remote.profile?.full_name || cloudState.username || fallback.username,
    email,
    sourceLang: (remote.settings?.source_lang || cloudState.sourceLang || fallback.sourceLang) as SourceLang,
    subscription: platformSubscription(remote, fallback.subscription),
    apiKey: localStorage.getItem('cyberlingo_api_key') || fallback.apiKey || '',
    freeTasksUsed: Number(payload.usage?.ai_requests || 0),
  };

  user.level = getLevelFromXp(user.xp || 0);

  const cloudEmpty = !remote.learning_state || Object.keys(remote.learning_state).length === 0;
  if (cloudEmpty && cached) {
    user = {
      ...cached,
      email,
      sourceLang: user.sourceLang,
      subscription: user.subscription,
      apiKey: localStorage.getItem('cyberlingo_api_key') || cached.apiKey || '',
      freeTasksUsed: Number(payload.usage?.ai_requests || 0),
      level: getLevelFromXp(cached.xp || 0),
    };
    await savePlatformUser(user);
  }

  return user;
}

export async function savePlatformUser(user: UserProfile) {
  const { apiKey: _apiKey, subscription: _subscription, ...learning } = user;
  await apiFetch('/account', {
    method: 'PUT',
    body: JSON.stringify({
      state: { ...learning, apiKey: '' },
      source_lang: user.sourceLang,
      full_name: user.username,
    }),
  });
}

export async function signOutPlatform() {
  await supabase.auth.signOut();
}

export async function startSubscription(plan: 'monthly' | 'yearly') {
  return apiFetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  }) as Promise<{ url: string; session_id?: string }>;
}

export async function verifyCheckout(sessionId: string) {
  return apiFetch(`/checkout?session_id=${encodeURIComponent(sessionId)}`);
}

export async function openBillingPortal() {
  return apiFetch('/portal', { method: 'POST', body: '{}' }) as Promise<{ url: string }>;
}

export async function loadAdminSnapshot() {
  const data = await apiFetch('/admin');
  return data.admin;
}

export async function grantAdminAccess(input: {
  email: string;
  full_name: string;
  phone?: string;
  access_kind: 'manual' | 'family' | 'partner' | 'promo' | 'lifetime';
  ends_at: string | null;
  note?: string;
}) {
  return apiFetch('/admin', {
    method: 'POST',
    body: JSON.stringify({ action: 'grant', ...input }),
  });
}

export async function revokeAdminAccess(userId: string) {
  return apiFetch('/admin', {
    method: 'POST',
    body: JSON.stringify({ action: 'revoke', user_id: userId }),
  });
}

export async function generateWithPlatformAI(payload: Record<string, unknown>) {
  return apiFetch('/ai', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export { API_BASE as REALTYFLOW_SPANISH_API };
