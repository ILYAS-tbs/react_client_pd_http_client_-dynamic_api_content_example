export interface AttendanceLinkedClassGroup {
  class_group_id: string;
  name: string;
}

export interface AttendanceLinkedSchool {
  user?: number;
  school_name?: string;
}

export interface AttendanceLinkedModule {
  module_id: string;
  module_name: string;
}

export interface AttendanceLinkedStudent {
  student_id: string;
  full_name: string;
  class_group?: AttendanceLinkedClassGroup | null;
}

export interface AttendanceLinkedTeacherUser {
  id: number;
  username?: string;
}

export interface AttendanceLinkedTeacher {
  user: AttendanceLinkedTeacherUser;
  full_name: string;
}

export interface AttendanceLinkedParent {
  user: number;
  full_name: string;
}

export interface AttendanceJustification {
  id: number;
  comment: string;
  file?: string | null;
  status: "pending" | "approved" | "refused";
  review_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  parent?: AttendanceLinkedParent | null;
  reviewer_name?: string | null;
}

export interface AttendanceAbsence {
  id: string;
  student: AttendanceLinkedStudent;
  teacher?: AttendanceLinkedTeacher | null;
  module?: AttendanceLinkedModule | null;
  class_group?: AttendanceLinkedClassGroup | null;
  school?: number | AttendanceLinkedSchool | null;
  date: string;
  remark?: string | null;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
  is_deleted: boolean;
  status: string;
  justification?: AttendanceJustification | null;
}

export interface MarkAttendancePayload {
  student_id: string;
  class_group_id: string;
  date: string;
  module_id?: string;
  teacher_id?: number;
  remark?: string;
}

export interface QuickMarkAbsencePayload {
  student_id: string;
  class_group_id: string;
  date: string;
  module_id?: string;
  teacher_id?: number;
  remark?: string;
}

export interface SubmitJustificationPayload {
  absence_id: string;
  comment: string;
  file?: File | null;
}

export interface ReviewJustificationPayload {
  status: "approved" | "refused";
  review_note?: string;
}

export interface AttendanceFilters {
  student?: string;
  class?: string;
  module?: string;
  teacher?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  include_deleted?: boolean;
}