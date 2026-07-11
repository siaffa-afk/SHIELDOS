// Named role views, all powered by the same engine ("one dashboard,
// configured N ways" — docs/09). Kept as separate exports so each role can
// diverge later without touching the others.
import { RoleQueueView } from './RoleQueueView.jsx';

export const TeamLeadView = () => <RoleQueueView />;
export const NurseView = () => <RoleQueueView />;
export const CareCoordinatorView = () => <RoleQueueView />;
export const HRTrainingView = () => <RoleQueueView />;
export const BillingAdminView = () => <RoleQueueView />;
export const AuditComplianceView = () => <RoleQueueView />;
export const OwnerView = () => <RoleQueueView />;
