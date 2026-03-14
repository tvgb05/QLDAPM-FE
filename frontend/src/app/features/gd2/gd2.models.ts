import { AppRole, TimelineStep } from '../../shared/models/ui.models';

export type Gd2Role = AppRole;
export type Gd2Tab = 'pending' | 'accepted';
export type LecturerCardTone = 'blue' | 'purple' | 'slate';
export type RequestDecision = 'none' | 'approved' | 'rejected';

export interface RegistrationItem {
  initials: string;
  lecturer: string;
  tag: string;
  specialty: string;
  quotaLabel: string;
  quotaValue: string;
  progress: number;
  progressClass: string;
  tone: LecturerCardTone;
  full: boolean;
  registered: boolean;
}

export interface GroupItem {
  name: string;
  studentId: string;
  specialization: string;
  initials: string;
  tone: LecturerCardTone;
  decision: RequestDecision;
}

export interface Gd2ViewState {
  role: Gd2Role;
  userName: string;
  userBadge: string;
  timeline: TimelineStep[];
}
