export interface ParentDashboardStats {
  totalKids: number;
  absences: number;
  homeworks: number;
  messages: number;
}

export interface ParentStudentSummary {
  studentId: string;
  name: string;
  className: string;
  status: "excellent" | "good" | "needs_improvement";
}