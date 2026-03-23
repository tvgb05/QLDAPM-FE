export type AppRole = 'student' | 'lecturer';

export interface TimelineSubStep {
  title: string;
  muted?: boolean;
  emphasis?: boolean;
  outlined?: boolean;
}

export interface TimelineStep {
  step: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeClass?: string;
  textClass: string;
  subtitleClass?: string;
  stepNumberClass?: string;
  active: boolean;
  completed?: boolean;
  time?: string;
  children?: TimelineSubStep[];
}

export interface NotificationItem {
  message: string;
}
