export interface ScheduleClassGroupInfo {
  class_group_id: string;
  name: string;
  school: number;
  academic_year: string | null;
  teacher_list?: string | null;
}

export type ScheduleType = "timetable" | "devoir" | "exam";

export interface Schedule {
  schedule_id: string;
  title: string;
  schedule_type: ScheduleType;
  class_group_name: string;
  upload_status: "UPLOADED" | "NOT_UPLOADED";
  upload_date: string;
  school: number;
  class_group_info: ScheduleClassGroupInfo | null;
  schedule_file: string | null;
  uploaded_by: number | null;
  file_name: string | null;
  file_kind: "pdf" | "image" | null;
  has_file: boolean;
  view_url: string | null;
  download_url: string | null;
  created_at: string;
  updated_at: string;
}
