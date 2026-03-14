import { AppIconKey } from '../../shared/icons/app-icons';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';

export type Gd1Role = AppRole;

export interface Specialization {
  id: string;
  name: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
  icon: AppIconKey;
  accentIcon: AppIconKey;
  description: string;
}

export interface LecturerAssignment {
  name: string;
  faculty: string;
  subjectCode: string;
  quota: string;
  color: 'blue' | 'purple';
  icon: AppIconKey;
}
