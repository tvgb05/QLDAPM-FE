export type AppRole = 'student' | 'lecturer' | 'pdt';

export interface NotificationItem {
  message: string;
}

export interface TimelineChild {
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
  textClass?: string;
  subtitleClass?: string;
  stepNumberClass?: string;
  active?: boolean;
  completed?: boolean;
  time?: string;
  children?: TimelineChild[];
}
