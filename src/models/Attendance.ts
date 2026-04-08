export interface AttendanceLinkedClassGroup {
  class_group_id: string;
  name: string;
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

export interface AttendanceLinkedTeacher {
  user: number;
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
  teacher: AttendanceLinkedTeacher;
  module?: AttendanceLinkedModule | null;
  class_group?: AttendanceLinkedClassGroup | null;
  date: string;
  hour: number;
  created_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
  is_deleted: boolean;
  status: string;
  can_teacher_undo: boolean;
  undo_deadline?: string | null;
  justification?: AttendanceJustification | null;
}

export interface MarkAttendancePayload {
  student_id: string;
  module_id: string;
  class_group_id?: string;
  date: string;
  hour: number;
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
  date_from?: string;
  date_to?: string;
  status?: string;
  include_deleted?: boolean;
}