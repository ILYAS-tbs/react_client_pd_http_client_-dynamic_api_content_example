export interface HomeworkSubmission {
  id: string;
  homework: string;
  student: string;
  student_name: string;
  student_id: string;
  teacher: number | null;
  teacher_name: string | null;
  mark: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Homework {
  id: string;
  class_group: string;
  class_group_name: string;
  teacher: number;
  teacher_name: string;
  module: number | null;
  module_name: string | null;
  title: string;
  description: string | null;
  attachment: string | null;
  date_assigned: string;
  last_submission_date: string;
  max_mark: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  submissions: HomeworkSubmission[];
  submissions_count: number;
}

export interface StudentHomework {
  id: string;
  class_group: string;
  class_group_name: string;
  teacher_name: string;
  module: number | null;
  module_name: string | null;
  title: string;
  description: string | null;
  attachment: string | null;
  date_assigned: string;
  last_submission_date: string;
  max_mark: number;
  remarks: string | null;
  created_at: string;
  submission: HomeworkSubmission | null;
  submission_status: "graded" | "submitted" | "missed" | "pending";
}

export interface StudentHomeworkGroup {
  student_id: string;
  student_name: string;
  homeworks: StudentHomework[];
  stats: {
    total: number;
    submitted: number;
    graded: number;
    awaiting_grade: number;
    not_submitted: number;
    average_mark: number | null;
  };
}

export interface HomeworkStats {
  total_students: number;
  submitted: number;
  not_submitted: number;
  average_mark: number | null;
}

