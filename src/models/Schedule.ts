export interface ScheduleClassGroupInfo {
  class_group_id: string;
  name: string;
  school: number;
  academic_year: string | null;
  teacher_list: string | null;
}

export interface Schedule {
  schedule_id: string;
  class_group_name: string;
  upload_status: "UPLOADED" | "NOT_UPLOADED";
  upload_date: string;
  school: number;
  class_group_info: ScheduleClassGroupInfo | null;
  schedule_file: string | null; // relative URL from backend
  created_at: string;
  updated_at: string;
}
