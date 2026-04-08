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
  created_at: string;
  updated_at: string;
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
  created_at: string;
}

export interface StudentHomeworkGroup {
  student_id: string;
  student_name: string;
  homeworks: StudentHomework[];
}

