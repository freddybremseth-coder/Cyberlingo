import React, { useEffect, useMemo, useState } from 'react';
import { SourceLang, UserProfile } from '../types';
import {
  AccessKind,
  AdminInvitation,
  AdminProfile,
  grantAccess,
  inviteUser,
  listAdminInvitations,
  listAdminUsers,
  revokeAccess,
} from '../services/accountService';
import { supabase } from '../services/supabaseClient';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onApiKeySave: (key: string) => void;
  onLangChange: (lang: SourceLang) => void;
}

type GrantKind = Exclude<AccessKind, 'trial' | 'paid'>;
type PeriodChoice = '7' | '30' | '90' | '365' | 'custom' | 'lifetime';

interface StripeCustomerRow {
  id: string;
  email: string | null;
  name: string | null;
  created: number;
  subscription: {
    id: string;
    status: string;
    interval: string | null;
    unitAmount: number;
    currency: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  } | null;
}

interface StripeAdminStats {
  totalCustomers: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  mrr: number;
  arr: number;
  totalRevenue: number;
  last30DaysRevenue: number;
}

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Ubegrenset';

const endsFromChoice = (choice: PeriodChoice, customDate?: string): string | null => {
  if (choice === 'lifetime') return null;
  if (choice === 'custom') {
    if (!customDate) throw new Error('Velg sluttdato');
    const d = new Date(`${customDate}T23:59:59`);
    if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) throw new Error('Sluttdato må være i fremtiden');
    return d.toISOString();
  }
  const days = Number(choice);
  return new Date(Date.now() + days * 86400_000).toISOString();
};

const activeEntitlement = (profile: AdminProfile) => {
  const now = Date.now();
  return profile.entitlements
    .filter(e =>
      e.status === 'active' &&
      new Date(e.starts_at).getTime() <= now &&
      (!e.ends_at || new Date(e.ends_at).getTime() > now)
    )
    .sort((a, b) => {
      const rank: Record<string, number> = { lifetime: 100, family: 90, partner: 80, manual: 70, promo: 60, paid: 50, trial: 10 };
      return (rank[b.kind] || 0) - (rank[a.kind] || 0);
    })[0] || null;
};

const kindLabel: Record<string, string> = {
  trial: 'Prøve',
  paid: 'Betalt',
  manual: 'Manuell',
  family: 'Familie',
  partner: 'Partner',
  promo: 'Promo',
  lifetime: 'Lifetime',
};

const AdminDashboard: React.FC<Props> = ({ user, onLogout, onLangChange }) => {
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [stripeCustomers, setStripeCustomers] = useState<StripeCustomerRow[]>([]);
  const [stripeStats, setStripeStats] = useState<StripeAdminStats | null>(null);
  const [tab, setTab] = useState<'users' | 'invite' | 'invitations' | 'stripe' | 'system'>('users');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  const [fullName, setFullName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accessKind, setAccessKind] = useState<GrantKind>('family');
  const [period, setPeriod] = useState<PeriodChoice>('90');
  const [customDate, setCustomDate] = useState('');
  const [note, setNote] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [userRows, inviteRows, sessionResult] = await Promise.all([
        listAdminUsers(),
        listAdminInvitations(),
        supabase.auth.getSession(),
      ]);
      setUsers(userRows);
      setInvitations(inviteRows);

      const token = sessionResult.data.session?.access_token;
      if (token) {
        const response = await fetch('/api/admin-stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const stripeData = await response.json();
        if (response.ok) {
          setStripeStats(stripeData.stats);
          setStripeCustomers(stripeData.customers || []);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke hente admin-data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const stripeByEmail = useMemo(() => {
    const map = new Map<string, StripeCustomerRow>();
    stripeCustomers.forEach(c => {
      if (c.email) map.set(c.email.trim().toLowerCase(), c);
    });
    return map;
  }, [stripeCustomers]);

  const stats = useMemo(() => {
    const active = users.filter(u => {
      const e = activeEntitlement(u);
      const stripe = stripeByEmail.get(u.email.toLowerCase());
      return Boolean(e) || ['active', 'trialing'].includes(stripe?.subscription?.status || '');
    }).length;
    const paid = stripeStats?.activeSubscriptions ?? 0;
    const pending = invitations.filter(i => i.status === 'pending').length;
    return { total: users.length, active, paid, pending };
  }, [users, invitations, stripeByEmail, stripeStats]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setWorking('invite');
    try {
      const cleanEmail = inviteEmail.trim().toLowerCase();
      if (!cleanEmail.includes('@')) throw new Error('Skriv inn gyldig e-post');
      if (fullName.trim().length < 2) throw new Error('Skriv inn navn');

      const actualKind: GrantKind = period === 'lifetime' ? 'lifetime' : accessKind;
      const endsAt = endsFromChoice(period, customDate);
      await inviteUser({
        email: cleanEmail,
        fullName,
        phone,
        accessKind: actualKind,
        endsAt,
        note: note.trim() || undefined,
      });

      setNotice(`Tilgang er opprettet og innloggingslenke er sendt til ${cleanEmail}.`);
      setFullName('');
      setInviteEmail('');
      setPhone('');
      setNote('');
      setPeriod('90');
      await refresh();
      setTab('users');
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke opprette tilgang');
    } finally {
      setWorking(null);
    }
  };

  const quickGrant = async (profile: AdminProfile, days: 30 | 90 | 365 | null) => {
    setWorking(profile.id);
    setError('');
    setNotice('');
    try {
      const endsAt = days === null ? null : new Date(Date.now() + days * 86400_000).toISOString();
      await grantAccess(profile.id, days === null ? 'lifetime' : 'manual', endsAt, 'Quick grant from Admin 2.0');
      setNotice(`${profile.full_name || profile.email}: tilgang oppdatert.`);
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke gi tilgang');
    } finally {
      setWorking(null);
    }
  };

  const handleRevoke = async (profile: AdminProfile) => {
    if (profile.email.toLowerCase() === 'freddy.bremseth@gmail.com') return;
    setWorking(profile.id);
    setError('');
    setNotice('');
    try {
      await revokeAccess(profile.id);
      setNotice(`${profile.full_name || profile.email}: gratis/manuell tilgang er stengt.`);
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke stenge tilgang');
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div
        className="p-5 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(56,189,248,0.06))',
          border: '1px solid rgba(249,115,22,0.2)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
              👑 Admin 2.0
            </p>
            <h2 className="text-2xl font-black mt-1">Brukere og tilgang</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {loading ? '↻' : '↻ Oppdater'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ['👥', 'Brukere', stats.total],
          ['✅', 'Aktiv tilgang', stats.active],
          ['💳', 'Betalende', stats.paid],
          ['✉️', 'Ventende', stats.pending],
        ].map(([icon, label, value]) => (
          <div key={String(label)} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-xl">{icon}</p>
            <p className="text-2xl font-black mt-1">{value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {(error || notice) && (
        <div
          className="p-4 rounded-2xl text-sm"
          style={{
            background: error ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
            border: `1px solid ${error ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`,
            color: error ? 'var(--danger)' : 'var(--success)',
          }}
        >
          {error || notice}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {([
          ['users', '👥 Brukere'],
          ['invite', '➕ Legg til'],
          ['invitations', '✉️ Invitasjoner'],
          ['stripe', '💳 Abonnement'],
          ['system', '⚙️ System'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
            style={{
              background: tab === id ? 'var(--primary)' : 'var(--bg-card)',
              color: tab === id ? 'white' : 'var(--text-muted)',
              border: `1px solid ${tab === id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-3">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk navn, e-post eller telefon..."
            className="app-input"
          />

          {filteredUsers.map(profile => {
            const entitlement = activeEntitlement(profile);
            const stripeCustomer = stripeByEmail.get(profile.email.toLowerCase());
            const stripeSubscription = stripeCustomer?.subscription;
            const paid = ['active', 'trialing'].includes(stripeSubscription?.status || '');
            const isOwner = profile.email.toLowerCase() === 'freddy.bremseth@gmail.com';
            return (
              <div key={profile.id} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{profile.full_name || profile.email}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
                    {profile.phone && <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{profile.phone}</p>}
                  </div>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{
                      background: (entitlement || paid) ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.10)',
                      color: (entitlement || paid) ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {paid
                      ? `Betalt · ${stripeSubscription?.interval === 'year' ? 'årlig' : 'månedlig'}`
                      : entitlement
                      ? kindLabel[entitlement.kind]
                      : 'Ingen tilgang'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-xl" style={{ background: 'var(--bg)' }}>
                    <span style={{ color: 'var(--text-faint)' }}>Tilgang til</span>
                    <p className="font-semibold mt-0.5">
                      {paid && stripeSubscription ? new Date(stripeSubscription.currentPeriodEnd).toLocaleDateString('nb-NO') : entitlement ? fmtDate(entitlement.ends_at) : '—'}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl" style={{ background: 'var(--bg)' }}>
                    <span style={{ color: 'var(--text-faint)' }}>AI-kostnad logget</span>
                    <p className="font-semibold mt-0.5">€{Number(profile.aiCostEur || 0).toFixed(2)}</p>
                  </div>
                </div>

                {!isOwner && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button disabled={working === profile.id} onClick={() => quickGrant(profile, 30)} className="btn-secondary px-3 py-1.5 text-xs">30 dager</button>
                    <button disabled={working === profile.id} onClick={() => quickGrant(profile, 90)} className="btn-secondary px-3 py-1.5 text-xs">90 dager</button>
                    <button disabled={working === profile.id} onClick={() => quickGrant(profile, 365)} className="btn-secondary px-3 py-1.5 text-xs">1 år</button>
                    <button disabled={working === profile.id} onClick={() => quickGrant(profile, null)} className="btn-secondary px-3 py-1.5 text-xs">Lifetime</button>
                    <button
                      disabled={working === profile.id}
                      onClick={() => handleRevoke(profile)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(248,113,113,0.08)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}
                    >
                      Steng gratis tilgang
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && filteredUsers.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Ingen brukere funnet.</p>
          )}
        </div>
      )}

      {tab === 'invite' && (
        <form onSubmit={handleInvite} className="p-4 rounded-2xl space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div>
            <h3 className="font-black text-lg">Legg til bruker</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Opprett gratis/manuell tilgang og send sikker innloggingslenke.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Navn" className="app-input" />
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="E-post" className="app-input" />
          </div>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefonnummer (valgfritt)" className="app-input" />

          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="text-xs font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>Tilgangstype</span>
              <select value={accessKind} onChange={e => setAccessKind(e.target.value as GrantKind)} className="app-input">
                <option value="family">Familie</option>
                <option value="manual">Manuell</option>
                <option value="partner">Partner</option>
                <option value="promo">Promo</option>
              </select>
            </label>
            <label>
              <span className="text-xs font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>Periode</span>
              <select value={period} onChange={e => setPeriod(e.target.value as PeriodChoice)} className="app-input">
                <option value="7">7 dager</option>
                <option value="30">30 dager</option>
                <option value="90">90 dager</option>
                <option value="365">1 år</option>
                <option value="custom">Egendefinert</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </label>
          </div>

          {period === 'custom' && (
            <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} className="app-input" />
          )}

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Notat, f.eks. familie / testbruker / samarbeidspartner"
            className="app-input min-h-20"
          />

          <button type="submit" disabled={working === 'invite'} className="btn-primary w-full py-3.5">
            {working === 'invite' ? 'Oppretter...' : 'Opprett tilgang og send lenke'}
          </button>
        </form>
      )}

      {tab === 'invitations' && (
        <div className="space-y-2">
          {invitations.map(inv => (
            <div key={inv.id} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-bold">{inv.full_name || inv.email}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{inv.email}</p>
                  {inv.phone && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{inv.phone}</p>}
                </div>
                <span className="text-xs font-bold">{inv.status}</span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {kindLabel[inv.access_kind]} · til {fmtDate(inv.ends_at)}
              </p>
            </div>
          ))}
          {!loading && invitations.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Ingen invitasjoner ennå.</p>
          )}
        </div>
      )}

      {tab === 'stripe' && (
        <div className="space-y-3">
          {stripeStats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>MRR</p>
                <p className="text-2xl font-black mt-1">€{stripeStats.mrr.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ARR</p>
                <p className="text-2xl font-black mt-1">€{stripeStats.arr.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aktive abonnement</p>
                <p className="text-2xl font-black mt-1">{stripeStats.activeSubscriptions}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Siste 30 dager</p>
                <p className="text-2xl font-black mt-1">€{stripeStats.last30DaysRevenue.toFixed(2)}</p>
              </div>
            </div>
          )}

          {stripeCustomers.map(customer => (
            <div key={customer.id} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold truncate">{customer.name || customer.email || 'Stripe-kunde'}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{customer.email || 'Ingen e-post'}</p>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: ['active', 'trialing'].includes(customer.subscription?.status || '')
                      ? 'rgba(74,222,128,0.12)'
                      : 'rgba(251,191,36,0.12)',
                    color: ['active', 'trialing'].includes(customer.subscription?.status || '')
                      ? 'var(--success)'
                      : 'var(--warning)',
                  }}
                >
                  {customer.subscription?.status || 'uten abonnement'}
                </span>
              </div>
              {customer.subscription && (
                <div className="flex justify-between text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  <span>
                    €{customer.subscription.unitAmount.toFixed(2)} / {customer.subscription.interval === 'year' ? 'år' : 'måned'}
                  </span>
                  <span>
                    {customer.subscription.cancelAtPeriodEnd ? 'Avsluttes ' : 'Fornyes '}
                    {new Date(customer.subscription.currentPeriodEnd).toLocaleDateString('nb-NO')}
                  </span>
                </div>
              )}
            </div>
          ))}

          {stripeCustomers.length === 0 && !loading && (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Ingen Stripe-kunder funnet.</p>
          )}

          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary block text-center w-full py-3 text-sm"
          >
            Åpne Stripe Dashboard ↗
          </a>
        </div>
      )}

      {tab === 'system' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="font-bold mb-1">☁️ Cyberlingo Cloud</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Brukere, tilgang og læringsprogresjon ligger nå i separat Supabase med RLS. LocalStorage brukes fortsatt som lokal cache.
            </p>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="font-bold mb-2">Stripe</p>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              Betalingsdata administreres fortsatt i Stripe til webhook-synk er aktivert mot den nye kontobasen.
            </p>
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-block px-4 py-2 text-sm">
              Åpne Stripe Dashboard ↗
            </a>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="font-bold mb-2">Forklaringsspråk</p>
            <div className="flex flex-wrap gap-2">
              {([
                ['no', '🇳🇴 Norsk'],
                ['en', '🇬🇧 English'],
                ['de', '🇩🇪 Deutsch'],
                ['ru', '🇷🇺 Русский'],
              ] as [SourceLang, string][]).map(([lang, label]) => (
                <button
                  key={lang}
                  onClick={() => onLangChange(lang)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: user.sourceLang === lang ? 'var(--primary)' : 'var(--bg)',
                    color: user.sourceLang === lang ? 'white' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onLogout}
        className="w-full py-3 rounded-2xl text-sm font-bold"
        style={{ background: 'rgba(248,113,113,0.08)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}
      >
        Logg ut
      </button>
    </div>
  );
};

export default AdminDashboard;
