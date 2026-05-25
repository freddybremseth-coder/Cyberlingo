import React, { useState, useEffect } from 'react';
import { UserProfile, SourceLang } from '../types';
import { setStoredApiKey, clearStoredApiKey, validateApiKey, detectProvider } from '../services/geminiService';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onApiKeySave: (key: string) => void;
  onLangChange: (lang: SourceLang) => void;
}

interface Stats {
  totalCustomers: number;
  activeSubscriptions: number;
  monthlySubscribers: number;
  yearlySubscribers: number;
  canceledSubscriptions: number;
  mrr: number;
  arr: number;
  totalRevenue: number;
  last30DaysRevenue: number;
  churnRate: number;
}

interface Customer {
  id: string;
  email: string | null;
  name: string | null;
  created: number;
  subscription: {
    id: string;
    status: string;
    plan: 'monthly' | 'yearly';
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  } | null;
}

interface Charge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  email: string | null;
  created: number;
  description: string | null;
}

const StatCard: React.FC<{ icon: string; label: string; value: string; sub?: string; color?: string }> = ({ icon, label, value, sub, color }) => (
  <div
    className="p-5 rounded-2xl"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-xl">{icon}</span>
    </div>
    <p className="text-3xl font-black" style={{ color: color || 'var(--text)' }}>{value}</p>
    {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{sub}</p>}
  </div>
);

const AdminDashboard: React.FC<Props> = ({ user, onLogout, onApiKeySave, onLangChange }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'customers' | 'payments' | 'local'>('overview');
  const [search, setSearch] = useState('');

  // Local users (from localStorage) - registered but not necessarily paying
  const [localUsers, setLocalUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetchStats();
    loadLocalUsers();
  }, []);

  const loadLocalUsers = () => {
    const users = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
    setLocalUsers(Object.values(users));
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin-stats?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setStats(data.stats);
      setCustomers(data.customers);
      setCharges(data.recentCharges);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' });

  const filteredCustomers = customers.filter(c =>
    !search ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLocal = localUsers.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const rows = [
      ['Email', 'Name', 'Created', 'Plan', 'Status', 'Period End'],
      ...customers.map(c => [
        c.email || '',
        c.name || '',
        fmtDate(c.created),
        c.subscription?.plan || '',
        c.subscription?.status || '',
        c.subscription ? fmtDate(c.subscription.currentPeriodEnd) : '',
      ]),
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberlingo-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div
        className="p-5 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(56,189,248,0.06))',
          border: '1px solid rgba(249,115,22,0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
              👑 Admin – Livstidsabonnement
            </p>
            <h2 className="text-2xl font-black mt-1">SaaS Kontrollpanel</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {user.email}
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {loading ? '↻ Laster...' : '↻ Oppdater'}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>⚠️ {error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: 'overview', label: '📊 Oversikt' },
          { id: 'customers', label: '👥 Kunder' },
          { id: 'payments', label: '💳 Betalinger' },
          { id: 'local', label: '📱 Registrerte' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              background: tab === t.id ? 'var(--primary)' : 'var(--bg-card)',
              color: tab === t.id ? 'white' : 'var(--text-muted)',
              border: `1px solid ${tab === t.id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="💰" label="MRR" value={`€${fmt(stats.mrr)}`} sub="Månedlig inntekt" color="var(--success)" />
            <StatCard icon="📈" label="ARR" value={`€${fmt(stats.arr)}`} sub="Årlig inntekt" color="var(--secondary)" />
            <StatCard icon="💵" label="Total inntekt" value={`€${fmt(stats.totalRevenue)}`} sub="All tid" />
            <StatCard icon="📅" label="Siste 30 dager" value={`€${fmt(stats.last30DaysRevenue)}`} sub="Inntekt" color="var(--primary)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="👥" label="Kunder" value={String(stats.totalCustomers)} sub="Totalt registrert" />
            <StatCard icon="✅" label="Aktive" value={String(stats.activeSubscriptions)} sub="Betalende" color="var(--success)" />
            <StatCard icon="📆" label="Månedlig" value={String(stats.monthlySubscribers)} sub="€7.99/mnd" />
            <StatCard icon="🎯" label="Årlig" value={String(stats.yearlySubscribers)} sub="€71.91/år" color="var(--primary)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="❌" label="Kansellerte" value={String(stats.canceledSubscriptions)} color="var(--danger)" />
            <StatCard icon="📉" label="Churn" value={`${stats.churnRate}%`} sub="Kanselleringsrate" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              📥 Eksporter CSV
            </button>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--secondary)' }}
            >
              🔗 Åpne Stripe Dashboard
            </a>
          </div>
        </>
      )}

      {/* Customers tab */}
      {tab === 'customers' && (
        <>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk etter e-post eller navn..."
            className="app-input"
          />
          <div className="space-y-2">
            {filteredCustomers.length === 0 && (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                {loading ? 'Laster...' : 'Ingen kunder funnet'}
              </p>
            )}
            {filteredCustomers.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{c.name || c.email || 'Uten navn'}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.email}</p>
                  </div>
                  {c.subscription && (
                    <span
                      className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2"
                      style={{
                        background: c.subscription.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.15)',
                        color: c.subscription.status === 'active' ? 'var(--success)' : 'var(--warning)',
                      }}
                    >
                      {c.subscription.status}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Opprettet {fmtDate(c.created)}</span>
                  {c.subscription && (
                    <span>
                      {c.subscription.plan === 'yearly' ? '🎯 Årlig' : '📆 Månedlig'} · fornyes {fmtDate(c.subscription.currentPeriodEnd)}
                      {c.subscription.cancelAtPeriodEnd && ' · kansellerer'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Payments tab */}
      {tab === 'payments' && (
        <div className="space-y-2">
          {charges.length === 0 && (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              {loading ? 'Laster...' : 'Ingen betalinger enda'}
            </p>
          )}
          {charges.map(ch => (
            <div
              key={ch.id}
              className="p-4 rounded-2xl flex items-center justify-between"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold">€{fmt(ch.amount)} {ch.currency.toUpperCase()}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {ch.email} · {fmtDate(ch.created)}
                </p>
              </div>
              <span
                className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2"
                style={{
                  background: ch.status === 'succeeded' ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)',
                  color: ch.status === 'succeeded' ? 'var(--success)' : 'var(--danger)',
                }}
              >
                {ch.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Local users tab */}
      {tab === 'local' && (
        <>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk etter brukernavn eller e-post..."
            className="app-input"
          />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {filteredLocal.length} registrerte brukere på denne enheten · inkluderer gratis-prøver
          </p>
          <div className="space-y-2">
            {filteredLocal.map(u => (
              <div
                key={u.username}
                className="p-4 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold">{u.username}</p>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: u.subscription.plan === 'trial' ? 'rgba(251,191,36,0.15)' :
                        u.subscription.plan === 'monthly' || u.subscription.plan === 'yearly' || u.subscription.plan === 'lifetime' ? 'rgba(16,185,129,0.15)' :
                          'rgba(148,163,184,0.15)',
                      color: u.subscription.plan === 'trial' ? 'var(--warning)' :
                        u.subscription.plan === 'monthly' || u.subscription.plan === 'yearly' || u.subscription.plan === 'lifetime' ? 'var(--success)' :
                          'var(--text-muted)',
                    }}
                  >
                    {u.subscription.plan === 'lifetime' ? 'livstid' : u.subscription.plan}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email || '(ingen e-post)'}</p>
                <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                  <span>⚡ {u.xp} XP</span>
                  <span>🔥 {u.streak} dager</span>
                  <span>📚 {u.completedLessonIds?.length || 0} leksjoner</span>
                  <span>💬 {u.conversationsCompleted || 0} samtaler</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Logout */}
      <div className="pt-6">
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--danger)' }}
        >
          Logg ut
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
