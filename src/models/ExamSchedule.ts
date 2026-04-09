export interface ExamScheduleClassGroupInfo {
  class_group_id: string;
  name: string;
  school: number;
  academic_year: string | null;
  teacher_list?: string | null;
}

export interface ExamSchedule {
  class_group_id: string;
  class_group_name: string;
  class_group_info: ExamScheduleClassGroupInfo;
  exam_schedule_id: string | null;
  pdf_file: string | null;
  view_url: string | null;
  download_url: string | null;
  uploaded_by: number | null;
  uploaded_at: string | null;
  updated_at: string | null;
  has_pdf: boolean;
}
