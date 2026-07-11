// "More": profile, demo role switcher, audit access for permitted roles,
// sign out. Kept deliberately small — this is not a junk drawer.
import { useApp } from '../app/store.jsx';
import { RoleSwitcher } from '../components/RoleSwitcher.jsx';
import { ROLE_LABELS } from '../services/roleService.js';
import { canViewBilling } from '../security/accessControl.js';
import { ROLE_GRANTS } from '../models/permission.model.js';

export function SettingsView() {
  const { user, navigate, signOut } = useApp();
  const canSeeAudit = !!ROLE_GRANTS[user.role]?.view_audit_log;

  return (
    <>
      <div className="card">
        <h2>{user.name}</h2>
        <p className="muted">{ROLE_LABELS[user.role]} · Our Support Care</p>
        <button type="button" className="btn-quiet" onClick={signOut}>
          Sign out
        </button>
      </div>

      <div className="card">
        <h2>Shortcuts</h2>
        <div className="list-row">
          <span className="grow">Calendar — appointments & outings</span>
          <button type="button" className="btn-quiet" onClick={() => navigate('calendar')}>
            Open ›
          </button>
        </div>
        {canSeeAudit && (
          <div className="list-row">
            <span className="grow">Audit log (leadership/compliance)</span>
            <button type="button" className="btn-quiet" onClick={() => navigate('audit')}>
              Open ›
            </button>
          </div>
        )}
        {canViewBilling(user) && (
          <div className="list-row">
            <span className="grow">Billing readiness queue</span>
            <button type="button" className="btn-quiet" onClick={() => navigate('today')}>
              Open ›
            </button>
          </div>
        )}
      </div>

      <RoleSwitcher />
    </>
  );
}
