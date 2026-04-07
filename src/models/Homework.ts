export interface HomeworkSubmission {
  id: string;
  homework: string;
  student: string;
  student_name: string;
  student_id: string;
  submission_text: string | null;
  submission_file: string | null;
  submitted_at: string;
  mark: number | null;
  remarks: string | null;
  is_graded: boolean;
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
}

export interface StudentHomeworkGroup {
  student_id: string;
  student_name: string;
  homeworks: StudentHomework[];
  stats: {
    total: number;
    submitted: number;
    not_submitted: number;
    graded: number;
    average_mark: number | null;
  };
}

export interface HomeworkStats {
  total_students: number;
  submitted: number;
  not_submitted: number;
  graded: number;
  average_mark: number | null;
}
