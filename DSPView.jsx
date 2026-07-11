// The DSP home: one guided checklist, beginning to end. Answers "where am I,
// what step am I on, what's done, what's next" without a dashboard.
import { useApi } from '../utils/useApi.js';
import { ENDPOINTS } from '../api/apiClient.js';
import { GuidedChecklist } from '../components/GuidedChecklist.jsx';
import { greeting, fmtDayLong, fmtShiftWindow } from '../utils/dateUtils.js';
import { firstName } from '../utils/textUtils.js';
import { useApp } from '../app/store.jsx';

function NoShiftCard({ name }) {
  return (
    <div className="card">
      <h2>{greeting()}, {firstName(name)}</h2>
      <p>No shift is scheduled for you today. If that looks wrong, tell your team lead.</p>
    </div>
  );
}

function ShiftCompleteCard({ name }) {
  return (
    <div className="card completion-card">
      <div className="big-check" aria-hidden="true">✓</div>
      <h2>Shift complete</h2>
      <p>
        Clocked out. Your notes are saved. Handoff was sent.
        Anything unfinished was sent to your supervisor.
      </p>
      <p className="muted">See you next shift, {firstName(name)}.</p>
    </div>
  );
}

export function DSPView() {
  const { user } = useApp();
  const shiftQ = useApi(ENDPOINTS.GET_MY_SHIFT, {});
  const shift = shiftQ.data;
  const planQ = useApi(ENDPOINTS.GET_SHIFT_PLAN,
    { shiftId: shift?.id }, [shift?.id]);

  if (shiftQ.loading) return <p className="muted">Loading your day…</p>;
  if (!shift) return <NoShiftCard name={user.name} />;
  if (shift.status === 'complete') return <ShiftCompleteCard name={user.name} />;

  const residents = planQ.data?.residents ?? [];
  const plan = {
    houseName: shift.houseName ?? 'Your house',
    residentNames: residents.map((r) => r.preferredName),
    residents,
  };

  return (
    <>
      <div className="card" style={{ paddingBottom: 12 }}>
        <h1 style={{ fontSize: '1.2rem' }}>{greeting()}, {firstName(user.name)}</h1>
        <p className="muted">{fmtDayLong()} · {fmtShiftWindow(shift)}</p>
      </div>
      {planQ.loading
        ? <p className="muted">Loading your plan…</p>
        : <GuidedChecklist shift={shift} plan={plan} onShiftChanged={shiftQ.refetch} />}
    </>
  );
}
