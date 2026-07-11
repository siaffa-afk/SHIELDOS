// Document tab: what's been filed this shift + the next thing to do.
import { useApi } from '../utils/useApi.js';
import { ENDPOINTS } from '../api/apiClient.js';
import { useApp } from '../app/store.jsx';
import { StatusPill } from '../components/StatusPill.jsx';
import { fmtTime } from '../utils/dateUtils.js';

const DOC_STATUS_PILL = {
  draft: { status: 'blocked', label: 'Not signed' },
  submitted: { status: 'done', label: 'Signed' },
  approved: { status: 'done', label: 'Approved' },
  returned: { status: 'blocked', label: 'Sent back' },
  needs_review: { status: 'current', label: 'In review' },
};

function NoShiftCard({ role, onGo }) {
  return (
    <div className="card">
      <h2>Documentation</h2>
      <p className="muted">
        {['dsp', 'driver'].includes(role)
          ? 'Documentation lives inside your shift. Start your shift from Today.'
          : 'Documentation you need to act on appears in your queues on Today.'}
      </p>
      <button type="button" className="btn btn-primary" onClick={onGo}>Go to Today</button>
    </div>
  );
}

function DocRow({ doc }) {
  const pill = DOC_STATUS_PILL[doc.status] ?? DOC_STATUS_PILL.draft;
  return (
    <div className="list-row">
      <div className="grow">
        <strong>{doc.title}</strong>
        <div className="muted">
          {doc.signature ? `Signed ${fmtTime(doc.signature.at)}` : 'Waiting on you'}
        </div>
      </div>
      <StatusPill status={pill.status} label={pill.label} />
    </div>
  );
}

export function DocumentationView() {
  const { user, navigate } = useApp();
  const shiftQ = useApi(ENDPOINTS.GET_MY_SHIFT, {});
  const shift = shiftQ.data;
  const docsQ = useApi(ENDPOINTS.LIST_SHIFT_DOCS, { shiftId: shift?.id }, [shift?.id]);

  if (shiftQ.loading) return <p className="muted">Loading…</p>;
  if (!shift) return <NoShiftCard role={user.role} onGo={() => navigate('today')} />;

  const docs = docsQ.data ?? [];
  return (
    <div className="card">
      <h2>This shift’s documentation</h2>
      <p className="muted">
        Everything you log files itself to the right place — nothing to re-enter.
      </p>
      {docsQ.loading && <p className="muted">Loading…</p>}
      {docs.map((d) => <DocRow doc={d} key={d.id} />)}
      {docs.length === 0 && !docsQ.loading && (
        <p className="muted">Nothing filed yet — log care from Today and it lands here.</p>
      )}
      <button type="button" className="btn btn-primary" onClick={() => navigate('today')}>
        Continue my checklist
      </button>
    </div>
  );
}
