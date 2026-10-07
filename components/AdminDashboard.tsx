import React, { useEffect, useMemo, useState } from 'react';
import { SourceLang, UserProfile } from '../types';
import {
  grantAdminAccess,
  loadAdminSnapshot,
  revokeAdminAccess,
  sendMagicLink,
} from '../services/platformClient';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onApiKeySave: (key: string) => void;
  onLangChange: (lang: SourceLang) => void;
}

type AccessKind = 'manual' | 'family' | 'partner' | 'promo' | 'lifetime';
type Period = '7' | '30' | '90' | '365' | 'custom' | 'lifetime';

type AdminUser = {
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  status: string | null;
  provider: string | null;
  access_status: string | null;
  access_kind: string | null;
  billing_cycle: string | null;
  ends_at: string | null;
  usage?: {
    ai_requests?: number | string;
    estimated_cost_usd?: number | string;
  };
};

type Invitation = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  access_kind: string;
  ends_at: string | null;
  status: string;
};

type Snapshot = {
  stats: {
    users: number;
    active: number;
    paid: number;
    pending_invitations: number;
    estimated_ai_cost_usd?: number | string;
  };
  users: AdminUser[];
  invitations: Invitation[];
};

const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('nb-NO') : 'Ubegrenset';

function calculateEnd(period: Period, customDate: string) {
  if (period === 'lifetime') return null;
  if (period === 'custom') {
    if (!customDate) throw new Error('Velg sluttdato.');
    const date = new Date(customDate + 'T23:59:59');
    if (date.getTime() <= Date.now()) throw new Error('Sluttdato må være i fremtiden.');
    return date.toISOString();
  }
  return new Date(Date.now() + Number(period) * 86400_000).toISOString();
}

const AdminDashboard: React.FC<Props> = ({ user, onLogout, onApiKeySave, onLangChange }) => {
  const [data, setData] = useState<Snapshot | null>(null);
  const [tab, setTab] = useState<'users' | 'add' | 'invitations' | 'system'>('users');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accessKind, setAccessKind] = useState<AccessKind>('family');
  const [period, setPeriod] = useState<Period>('90');
  const [customDate, setCustomDate] = useState('');
  const [note, setNote] = useState('');

  const [lunaKey, setLunaKey] = useState('');
  const [lunaSaved, setLunaSaved] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await loadAdminSnapshot());
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke hente Admin 2.0.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const users = data?.users || [];
  const invitations = data?.invitations || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(item =>
      item.email.toLowerCase().includes(q) ||
      (item.full_name || '').toLowerCase().includes(q) ||
      (item.phone || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const quickGrant = async (target: AdminUser, days: 30 | 90 | 365 | null) => {
    setWorking(target.user_id);
    setError('');
    setNotice('');
    try {
      await grantAdminAccess({
        email: target.email,
        full_name: target.full_name || target.email.split('@')[0],
        phone: target.phone || undefined,
        access_kind: days === null ? 'lifetime' : 'manual',
        ends_at: days === null ? null : new Date(Date.now() + days * 86400_000).toISOString(),
        note: 'Hurtigtilgang fra Spanish Admin 2.0',
      });
      setNotice('Tilgangen til ' + target.email + ' er oppdatert.');
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke oppdatere tilgang.');
    } finally {
      setWorking('');
    }
  };

  const revoke = async (target: AdminUser) => {
    setWorking(target.user_id);
    setError('');
    setNotice('');
    try {
      await revokeAdminAccess(target.user_id);
      setNotice('Tilgangen til ' + target.email + ' er stengt.');
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke stenge tilgang.');
    } finally {
      setWorking('');
    }
  };

  const addUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setWorking('add');
    setError('');
    setNotice('');
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail.includes('@')) throw new Error('Skriv inn en gyldig e-post.');
      if (fullName.trim().length < 2) throw new Error('Skriv inn navn.');

      const actualKind: AccessKind = period === 'lifetime' ? 'lifetime' : accessKind;
      const endsAt = calculateEnd(period, customDate);

      await grantAdminAccess({
        email: cleanEmail,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        access_kind: actualKind,
        ends_at: endsAt,
        note: note.trim() || undefined,
      });

      await sendMagicLink(cleanEmail, fullName.trim(), 'no', phone.trim() || undefined);

      setNotice('Tilgang opprettet og innloggingslenke sendt til ' + cleanEmail + '.');
      setFullName('');
      setEmail('');
      setPhone('');
      setNote('');
      setPeriod('90');
      await refresh();
      setTab('users');
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke legge til bruker.');
    } finally {
      setWorking('');
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
              👑 Spanish · Admin 2.0
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
          ['👥', 'Brukere', String(data?.stats.users || 0)],
          ['✅', 'Aktive', String(data?.stats.active || 0)],
          ['💳', 'Betalende', String(data?.stats.paid || 0)],
          ['🤖', 'AI-kostnad USD', '$' + Number(data?.stats.estimated_ai_cost_usd || 0).toFixed(4)],
        ].map(item => (
          <div
            key={item[1]}
            className="p-4 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xl">{item[0]}</p>
            <p className="text-2xl font-black mt-1">{item[2]}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item[1]}</p>
          </div>
        ))}
      </div>

      {(error || notice) && (
        <div
          className="p-4 rounded-2xl text-sm"
          style={{
            background: error ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
            color: error ? 'var(--danger)' : 'var(--success)',
            border: '1px solid ' + (error ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'),
          }}
        >
          {error || notice}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {([
          ['users', '👥 Brukere'],
          ['add', '➕ Legg til'],
          ['invitations', '✉️ Invitasjoner'],
          ['system', '⚙️ System'],
        ] as const).map(item => (
          <button
            key={item[0]}
            onClick={() => setTab(item[0])}
            className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
            style={{
              background: tab === item[0] ? 'var(--primary)' : 'var(--bg-card)',
              color: tab === item[0] ? 'white' : 'var(--text-muted)',
              border: '1px solid ' + (tab === item[0] ? 'transparent' : 'var(--border)'),
            }}
          >
            {item[1]}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-3">
          <input
            className="app-input"
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk navn, e-post eller telefon..."
          />

          {filtered.map(target => {
            const owner = target.email.toLowerCase() === 'freddy.bremseth@gmail.com';
            const paid = target.provider === 'stripe';
            const active = target.access_status === 'active' || target.access_status === 'grace';

            return (
              <div
                key={target.user_id}
                className="p-4 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{target.full_name || target.email}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{target.email}</p>
                    {target.phone && (
                      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{target.phone}</p>
                    )}
                  </div>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{
                      background: active ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.10)',
                      color: active ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {paid
                      ? 'Betalt · ' + (target.billing_cycle === 'yearly' ? 'årlig' : 'månedlig')
                      : target.access_kind || target.status || 'ukjent'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-xl" style={{ background: 'var(--bg)' }}>
                    <span style={{ color: 'var(--text-faint)' }}>Tilgang til</span>
                    <p className="font-semibold mt-0.5">{fmtDate(target.ends_at)}</p>
                  </div>
                  <div className="p-2 rounded-xl" style={{ background: 'var(--bg)' }}>
                    <span style={{ color: 'var(--text-faint)' }}>AI-oppgaver</span>
                    <p className="font-semibold mt-0.5">{Number(target.usage?.ai_requests || 0)}</p>
                  </div>
                  <div className="p-2 rounded-xl" style={{ background: 'var(--bg)' }}>
                    <span style={{ color: 'var(--text-faint)' }}>AI-kostnad</span>
                    <p className="font-semibold mt-0.5">
                      {'$' + Number(target.usage?.estimated_cost_usd || 0).toFixed(4)}
                    </p>
                  </div>
                </div>

                {!owner && !paid && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button disabled={working === target.user_id} onClick={() => quickGrant(target, 30)} className="btn-secondary px-3 py-1.5 text-xs">30 dager</button>
                    <button disabled={working === target.user_id} onClick={() => quickGrant(target, 90)} className="btn-secondary px-3 py-1.5 text-xs">90 dager</button>
                    <button disabled={working === target.user_id} onClick={() => quickGrant(target, 365)} className="btn-secondary px-3 py-1.5 text-xs">1 år</button>
                    <button disabled={working === target.user_id} onClick={() => quickGrant(target, null)} className="btn-secondary px-3 py-1.5 text-xs">Lifetime</button>
                    <button
                      disabled={working === target.user_id}
                      onClick={() => revoke(target)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{
                        background: 'rgba(248,113,113,.08)',
                        color: 'var(--danger)',
                        border: '1px solid rgba(248,113,113,.2)',
                      }}
                    >
                      Steng tilgang
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
              Ingen Spanish-brukere funnet.
            </p>
          )}
        </div>
      )}

      {tab === 'add' && (
        <form
          onSubmit={addUser}
          className="p-4 rounded-2xl space-y-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-black text-lg">Legg til bruker</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Opprett tilgang i RealtyFlow og send sikker ChatGenius-innloggingslenke.
          </p>

          <input className="app-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Navn" />
          <input className="app-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-post" />
          <input className="app-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefonnummer (valgfritt)" />

          <div className="grid grid-cols-2 gap-3">
            <select className="app-input" value={accessKind} onChange={e => setAccessKind(e.target.value as AccessKind)}>
              <option value="family">Familie</option>
              <option value="manual">Manuell</option>
              <option value="partner">Partner</option>
              <option value="promo">Promo</option>
            </select>
            <select className="app-input" value={period} onChange={e => setPeriod(e.target.value as Period)}>
              <option value="7">7 dager</option>
              <option value="30">30 dager</option>
              <option value="90">90 dager</option>
              <option value="365">1 år</option>
              <option value="custom">Egendefinert</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>

          {period === 'custom' && (
            <input className="app-input" type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} />
          )}

          <textarea
            className="app-input min-h-20"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Notat"
          />

          <button type="submit" disabled={working === 'add'} className="btn-primary w-full py-3.5">
            {working === 'add' ? 'Oppretter...' : 'Opprett tilgang og send lenke'}
          </button>
        </form>
      )}

      {tab === 'invitations' && (
        <div className="space-y-2">
          {invitations.map(inv => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-bold">{inv.full_name || inv.email}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{inv.email}</p>
                  {inv.phone && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{inv.phone}</p>}
                </div>
                <span className="text-xs font-bold">{inv.status}</span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {inv.access_kind} · til {fmtDate(inv.ends_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === 'system' && (
        <div className="space-y-3">
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="font-bold mb-1">🏗️ RealtyFlow Platform Core</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Felles Auth, abonnement, Finance og AI-usage. Læringsdata ligger isolert i chatgenius-schemaet.
            </p>
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="font-bold mb-1">🎙️ Luna Live · eierkonto</p>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              Nøkkelen lagres bare lokalt på denne enheten og brukes kun av Luna.
            </p>
            <div className="flex gap-2">
              <input
                className="app-input flex-1"
                type="password"
                value={lunaKey}
                onChange={e => { setLunaKey(e.target.value); setLunaSaved(false); }}
                placeholder="Gemini-nøkkel for Luna"
              />
              <button
                className="btn-secondary px-4 text-sm"
                onClick={() => {
                  const key = lunaKey.trim();
                  if (!key) return;
                  onApiKeySave(key);
                  setLunaKey('');
                  setLunaSaved(true);
                }}
              >
                Lagre
              </button>
            </div>
            {lunaSaved && (
              <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>
                ✓ Luna-nøkkel lagret lokalt.
              </p>
            )}
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="font-bold mb-2">Forklaringsspråk</p>
            <div className="flex flex-wrap gap-2">
              {([
                ['no', '🇳🇴 Norsk'],
                ['en', '🇬🇧 English'],
                ['de', '🇩🇪 Deutsch'],
                ['ru', '🇷🇺 Русский'],
              ] as [SourceLang, string][]).map(item => (
                <button
                  key={item[0]}
                  onClick={() => onLangChange(item[0])}
                  className="px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: user.sourceLang === item[0] ? 'var(--primary)' : 'var(--bg)',
                    color: user.sourceLang === item[0] ? 'white' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {item[1]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onLogout}
        className="w-full py-3 rounded-2xl text-sm font-bold"
        style={{
          background: 'rgba(248,113,113,.08)',
          color: 'var(--danger)',
          border: '1px solid rgba(248,113,113,.2)',
        }}
      >
        Logg ut
      </button>
    </div>
  );
};

export default AdminDashboard;
