export interface PatchStudentPayload {
  full_name?: string;
  is_absent?: boolean;
  date_of_birth?: Date;
  gender?: string;
  address?: string;
  status?: "active" | "inactive" | "graduated";
  module_grade?: string;
  notes?: undefined;
  trimester_grade?: number;
  class_group_id?: string;
}

export interface PostAbsencePayload {
  student_id: string;
  teacher_id: number;
}

export interface PostBehaviourReportPayload {
  date: string;
  type: "excellent" | "good" | "bad";
  description: string;
  conclusion: string;
  teacher_id: number;
  student_id: string;
}

export interface PostMarkPayload {
  mark_type: string;
  mark_degree: number;
  date: string;
  topic: string;
  remarks: string;
  student_id: string;
  teacher_id: number;
}

// Will be "FormData"
// export interface PostTeacherUploadPayload {
//   title: string;
//   description: string;
//   upload_file: File | null;
// }
