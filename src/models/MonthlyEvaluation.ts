export interface MonthlyEvaluation {
  id: number;
  month: string;
  title?: string | null;
  description?: string | null;
  attachment?: string | null;
  mark_of_participation_in_class?: number | null;
  homeworks_mark?: number | null;
  remarks?: string | null;
  student: MonthlyEvaluationStudent;
  teacher?: MonthlyEvaluationTeacher;
  module?: MonthlyEvaluationModule | null;
  class_group?: MonthlyEvaluationClassGroup | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyEvaluationGridRow {
  student_id: string;
  student_name: string;
  class_group_id: string;
  class_name: string;
  module_id: string;
  module_name: string;
  evaluation_id: number | null;
  mark_of_participation_in_class: number | null;
  homeworks_mark: number | null;
  remarks: string | null;
  updated_at: string | null;
}

export interface TeacherMonthlyEvaluationGridResponse {
  month: string;
  class_group: {
    id: string;
    name: string;
  };
  module: {
    id: string;
    name: string;
  };
  rows: MonthlyEvaluationGridRow[];
}

export interface MonthlyEvaluationStudent {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  phone?: string;
  academic_state?: string;
  date_of_birth?: string;
  trimester_grade?: number;
}

export interface MonthlyEvaluationTeacher {
  user?: number;
  full_name?: string;
}

export interface MonthlyEvaluationModule {
  module_id: string;
  module_name: string;
}

export interface MonthlyEvaluationClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string | null;
  academic_year: string;
}