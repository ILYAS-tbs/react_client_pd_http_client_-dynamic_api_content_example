export interface ParentDashboardStats {
  totalKids: number;
  absences: number;
  homeworks: number;
  messages: number;
}

export type ParentPerformanceStatus =
  | "excellent"
  | "good"
  | "needs_improvement"
  | "pending";

export interface ParentStudentSummary {
  studentId: string;
  name: string;
  className: string;
  schoolId?: string;
  schoolName?: string;
  status: ParentPerformanceStatus;
}