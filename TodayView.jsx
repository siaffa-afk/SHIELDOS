// "Today" dispatches to the right home for the signed-in role. Frontline
// roles get the guided shift; elevated roles get guided queues.
import { useApp } from '../app/store.jsx';
import { ROLES } from '../models/user.model.js';
import { DSPView } from './DSPView.jsx';
import {
  TeamLeadView, NurseView, CareCoordinatorView, HRTrainingView,
  BillingAdminView, AuditComplianceView, OwnerView,
} from './roleViews.jsx';

const HOME_BY_ROLE = {
  [ROLES.DSP]: DSPView,
  [ROLES.DRIVER]: DSPView, // drivers follow the same guided shift, fewer tasks
  [ROLES.TEAM_LEAD]: TeamLeadView,
  [ROLES.NURSE]: NurseView,
  [ROLES.CARE_COORDINATOR]: CareCoordinatorView,
  [ROLES.HR_TRAINING]: HRTrainingView,
  [ROLES.BILLING_ADMIN]: BillingAdminView,
  [ROLES.AUDITOR]: AuditComplianceView,
  [ROLES.OWNER]: OwnerView,
  [ROLES.EXTERNAL_SC]: AuditComplianceView, // window-scoped queue view
};

export function TodayView() {
  const { user } = useApp();
  const Home = HOME_BY_ROLE[user.role] ?? DSPView;
  return <Home />;
}
