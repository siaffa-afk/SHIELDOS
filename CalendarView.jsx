// Calendar module: today's appointments and outings for houses in scope.
// (The full Care Calendar port — month grid, transport, coverage — follows
// the migration plan in docs/MIGRATION.md; this view keeps the concept live.)
import { useApi } from '../utils/useApi.js';
import { fmtDayLong } from '../utils/dateUtils.js';

export function CalendarView() {
  const { loading, data, error } = useApi({ path: 'calendar.today' }, {});

  return (
    <div className="card">
      <h2>Calendar · {fmtDayLong()}</h2>
      <p className="muted">Appointments and outings for your houses.</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="banner banner-red">{error}</p>}
      {data && data.length === 0 && (
        <p className="banner banner-green">Nothing scheduled today.</p>
      )}
      {data && data.map((a) => (
        <div className="list-row" key={a.id}>
          <span className="num" style={{ minWidth: 72 }}>{a.time}</span>
          <div className="grow">
            <strong>{a.label}</strong>
            {a.transport && <div className="muted">Transport: {a.transport}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
