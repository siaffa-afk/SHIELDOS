// Demo sign-in: pick a person. Stands in for real auth (individual accounts,
// MFA for elevated roles, lockout on repeated failures — see docs/SECURITY.md).
import { useState } from 'react';
import { useApp } from '../app/store.jsx';
import { mockUsers } from '../data/mockUsers.js';
import { ROLE_LABELS } from '../services/roleService.js';
import { initials } from '../utils/textUtils.js';

export function LoginView() {
  const { signIn } = useApp();
  const [error, setError] = useState(null);

  function handle(account) {
    const result = signIn(account);
    if (!result.ok) {
      setError(result.error === 'mfa_required'
        ? 'This role requires MFA — not enrolled in the demo.'
        : 'That account is not active.');
    }
  }

  return (
    <main className="work-area" style={{ paddingTop: 40 }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.4rem' }}>
          <span className="pill pill-navy" style={{ marginRight: 8 }}>S</span>
          ShieldOS
        </h1>
        <p className="muted">Our Support Care · demo build with fictional data</p>
      </div>
      <div className="card">
        <h2>Sign in as…</h2>
        {error && <p className="banner banner-amber">{error}</p>}
        {mockUsers.map((account) => (
          <div className="list-row" key={account.id}>
            <span className="avatar" aria-hidden="true">{initials(account.name)}</span>
            <div className="grow">
              <strong>{account.name}</strong>
              <div className="muted">{ROLE_LABELS[account.role] ?? account.role}</div>
            </div>
            <button type="button" className="btn-quiet" onClick={() => handle(account)}>
              Sign in ›
            </button>
          </div>
        ))}
        <p className="muted">
          Production: individual accounts, MFA for elevated roles, session
          timeout, login audit, rate-limited failures. No shared logins.
        </p>
      </div>
    </main>
  );
}
