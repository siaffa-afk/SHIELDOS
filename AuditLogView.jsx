// Audit log viewer (permitted roles only — the API refuses everyone else).
// Append-only + hash-chained; the viewer also verifies the chain.
import { useEffect, useState } from 'react';
import { useApi } from '../utils/useApi.js';
import { ENDPOINTS } from '../api/apiClient.js';
import { verifyChain } from '../security/auditLogService.js';
import { fmtTime } from '../utils/dateUtils.js';
import { titleCase } from '../utils/textUtils.js';

export function AuditLogView() {
  const { loading, data, error } = useApi(ENDPOINTS.GET_AUDIT_LOG, { limit: 50 });
  const [chain, setChain] = useState(null);

  useEffect(() => {
    verifyChain().then(setChain);
  }, [data]);

  return (
    <div className="card">
      <h2>Audit log</h2>
      {chain && (
        <p className={`banner ${chain.ok ? 'banner-green' : 'banner-red'}`}>
          {chain.ok
            ? `Integrity chain verified (${chain.count} events, SHA-256 chained).`
            : `Chain broken at ${chain.brokenAt} — records were altered.`}
        </p>
      )}
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="banner banner-red">{error}</p>}
      {data && data.map((e) => (
        <div className="list-row" key={e.id}>
          <span className="num muted" style={{ minWidth: 70 }}>{fmtTime(e.at)}</span>
          <div className="grow">
            <strong>{titleCase(e.action)}</strong>
            <div className="muted">
              {e.userId} · {e.userRole}
              {e.recordId ? ` · ${e.recordType} ${e.recordId}` : ''}
              {e.reason ? ` · reason: ${e.reason}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
