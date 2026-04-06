export type PdtTab = 'time' | 'topics' | 'allocation' | 'report';
export type ReportKey = 'topic01' | 'topic02';

export interface TopicItem {
  title: string;
  code: string;
  faculty: string;
  facultyClass: string;
  lecturers: string[];
}

export interface UnassignedStudent {
  name: string;
  studentId: string;
  faculty: string;
}

export interface AvailableGroup {
  title: string;
  slots: string;
  slotsClass: string;
  lecturers: string;
  members: string[];
  progressClass: string;
  progress: number;
  memberCount: string;
}

export interface ReportRow {
  teamId?: string;
  group: string;
  title: string;
  ids: string[];
  students: string[];
  advisor: string;
  status: string;
  statusClass: string;
  rowClass: string;
  finalScore?: number | null;
  grade?: string | null;
  isPassed?: boolean | null;
}

export interface ReportSection {
  key: ReportKey;
  badgeClass: string;
  title: string;
  lecturers: string[];
  groupCount: string;
  rows: ReportRow[];
}
