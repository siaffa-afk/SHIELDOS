// The config-driven engine behind every elevated role view: a mission line
// and guided queues — deeper language than the DSP view, but still guided
// work, never a wall of stat cards.
import { useApi, call } from '../utils/useApi.js';
import { ENDPOINTS } from '../api/apiClient.js';
import { ROLE_VIEW_CONFIG } from '../services/roleViewConfig.js';
import { greeting, fmtDayLong } from '../utils/dateUtils.js';
import { firstName, pluralize } from '../utils/textUtils.js';
import { useApp } from '../app/store.jsx';
import { announce } from '../utils/accessibilityUtils.js';

function Queue({ queue }) {
  const { loading, data, error } = useApi(ENDPOINTS[queue.endpoint], {});

  return (
    <div className="card">
      <h2>{queue.title}</h2>
      <p className="muted">{queue.intro}</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="banner banner-red">{error}</p>}
      {data && data.length === 0 && (
        <p className="banner banner-green">Nothing waiting here right now.</p>
      )}
      {data && data.slice(0, 8).map((item) => (
        <div className="list-row" key={item.id}>
          <div className="grow">
            <strong>{item.message}</strong>
            <div className="muted">{item.detail}</div>
          </div>
          {item.holdReason && <span className="pill pill-amber">On hold</span>}
        </div>
      ))}
      {data && data.length > 8 && (
        <p className="muted">{pluralize(data.length - 8, 'more item')} in this queue.</p>
      )}
    </div>
  );
}

export function RoleQueueView() {
  const { user } = useApp();
  const config = ROLE_VIEW_CONFIG[user.role];

  if (!config) {
    return (
      <div className="card">
        <h2>{greeting()}, {firstName(user.name)}</h2>
        <p>Your view is scoped to what you’re assigned. Use Search to find what you need.</p>
      </div>
    );
  }

  async function exportPacket() {
    const result = await call(ENDPOINTS.EXPORT_AUDIT_PACKET, { purpose: 'scoped review' });
    announce(result.ok ? 'Audit packet export started. It will appear in your queue.' : result.error);
  }

  return (
    <>
      <div className="card" style={{ paddingBottom: 12 }}>
        <h1 style={{ fontSize: '1.2rem' }}>{greeting()}, {firstName(user.name)}</h1>
        <p className="muted">{fmtDayLong()} · {config.mission}</p>
      </div>
      {config.queues.map((q) => <Queue key={q.key} queue={q} />)}
      {config.canExport && (
        <div className="card">
          <h2>Audit packet</h2>
          <p className="muted">
            Exports only your approved scope; every export is logged.
          </p>
          <button type="button" className="btn btn-primary" onClick={exportPacket}>
            Export audit packet
          </button>
        </div>
      )}
    </>
  );
}
