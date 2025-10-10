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
//! MARKS & GRADES
export interface PostMarkPayload {
  mark_type: string;
  mark_degree: number;
  date: string;
  topic: string;
  remarks: string;
  student_id: string;
  teacher_id: number;
  semester?: "s1" | "s2";
}
export interface PostStudentGradesPayload {
  student_id: string;
  module_id: string;
  teacher_id: number;
  class_group_id: string;

  s1_devoir_1?: number | null;
  s1_devoir_2?: number | null;
  s1_tests?: number | null;
  s1_homeworks?: number | null;
  s1_exam?: number | null;

  s1_average?: number | null;
  s2_devoir_1?: number | null;
  s2_devoir_2?: number | null;
  s2_tests?: number | null;
  s2_homeworks?: number | null;
  s2_exam?: number | null;
  s2_average?: number | null;
}
export interface PatchStudentGradesPayload {
  student_id?: string;
  module_id?: string;
  teacher_id?: number;
  class_group_id?: string;

  s1_devoir_1?: number | null;
  s1_devoir_2?: number | null;
  s1_tests?: number | null;
  s1_homeworks?: number | null;
  s1_exam?: number | null;

  s1_average?: number | null;
  s2_devoir_1?: number | null;
  s2_devoir_2?: number | null;
  s2_tests?: number | null;
  s2_homeworks?: number | null;
  s2_exam?: number | null;
  s2_average?: number | null;
}
// Will be "FormData"
// export interface PostTeacherUploadPayload {
//   title: string;
//   description: string;
//   upload_file: File | null;
// }
