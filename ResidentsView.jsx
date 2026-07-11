// Residents: list is permission-scoped by the API; the profile shows only
// the fields the caller's role may receive (field-level filtering).
import { useApi } from '../utils/useApi.js';
import { ENDPOINTS } from '../api/apiClient.js';
import { useApp } from '../app/store.jsx';
import { TonePill } from '../components/StatusPill.jsx';
import { dayStatus } from '../utils/statusUtils.js';

function ProfileDetails({ data }) {
  return (
    <>
      {data.routines && data.routines.length > 0 && (
        <div className="step-detail">
          <strong>Routines</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {data.routines.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}
      {data.diet && <div className="step-detail"><strong>Diet</strong><div>{data.diet}</div></div>}
      {data.allergies?.length > 0 && (
        <p className="banner banner-amber"><strong>Allergies:</strong> {data.allergies.join(', ')}</p>
      )}
      {data.medications?.length > 0 && (
        <div className="step-detail">
          <strong>Medications</strong>
          {data.medications.map((m) => <div key={m.name}>{m.name} {m.dose} — {m.schedule}</div>)}
        </div>
      )}
      {data.emergencyContacts?.length > 0 && (
        <div className="step-detail">
          <strong>Emergency contacts</strong>
          {data.emergencyContacts.map((c) => <div key={c.name}>{c.name} · {c.phone}</div>)}
        </div>
      )}
      {!data.medications && (
        <p className="muted">
          Medical details are hidden for your role — use Emergency if you need them urgently.
        </p>
      )}
    </>
  );
}

function ResidentProfile({ residentId }) {
  const { loading, data, error } = useApi(ENDPOINTS.GET_RESIDENT, { residentId }, [residentId]);
  const { navigate } = useApp();

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="banner banner-red">{error}</p>;
  const ds = dayStatus(data);

  return (
    <div className="card">
      <button type="button" className="btn-quiet" onClick={() => navigate('residents')}>
        ‹ All residents
      </button>
      <div className="list-row">
        <span style={{ fontSize: '1.6rem' }} aria-hidden="true">{data.photoHint}</span>
        <h2 className="grow">{data.name}</h2>
        <TonePill tone={ds.tone}>{ds.label}</TonePill>
      </div>
      <ProfileDetails data={data} />
    </div>
  );
}

export function ResidentsView() {
  const { nav, navigate } = useApp();
  const { loading, data, error } = useApi(ENDPOINTS.LIST_RESIDENTS, {});

  if (nav.param) return <ResidentProfile residentId={nav.param} />;
  if (loading) return <p className="muted">Loading residents…</p>;
  if (error) return <p className="banner banner-red">{error}</p>;

  return (
    <div className="card">
      <h2>Your residents</h2>
      <p className="muted">You only see residents you’re assigned to or responsible for.</p>
      {data.length === 0 && (
        <p className="banner banner-amber">
          No residents in your scope right now. DSPs see residents once their shift starts.
        </p>
      )}
      {data.map((r) => {
        const ds = dayStatus(r);
        return (
          <div className="list-row" key={r.id}>
            <span aria-hidden="true">{r.photoHint}</span>
            <button type="button" className="btn-quiet grow" style={{ textAlign: 'left' }}
              onClick={() => navigate(`resident:${r.id}`)}>
              {r.name}
            </button>
            <TonePill tone={ds.tone}>{ds.label}</TonePill>
          </div>
        );
      })}
    </div>
  );
}
