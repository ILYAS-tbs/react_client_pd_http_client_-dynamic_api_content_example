export interface MonthlyEvaluation {
  id: number;
  month: string;
  title?: string | null;
  description?: string | null;
  attachment?: string | null;
  mark_of_participation_in_class?: number | null;
  homeworks_mark?: number | null;
  remarks?: string | null;
  student: MonthlyEvaluationStudent;
  teacher?: MonthlyEvaluationTeacher;
  module?: MonthlyEvaluationModule | null;
  class_group?: MonthlyEvaluationClassGroup | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyEvaluationGridRow {
  student_id: string;
  student_name: string;
  class_group_id: string;
  class_name: string;
  module_id: string;
  module_name: string;
  evaluation_id: number | null;
  mark_of_participation_in_class: number | null;
  homeworks_mark: number | null;
  remarks: string | null;
  updated_at: string | null;
}

export interface TeacherMonthlyEvaluationGridResponse {
  month: string;
  class_group: {
    id: string;
    name: string;
  };
  module: {
    id: string;
    name: string;
  };
  rows: MonthlyEvaluationGridRow[];
}

export interface MonthlyEvaluationStudent {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  phone?: string;
  academic_state?: string;
  date_of_birth?: string;
  trimester_grade?: number;
}

export interface MonthlyEvaluationTeacher {
  user?: number;
  full_name?: string;
}

export interface MonthlyEvaluationModule {
  module_id: string;
  module_name: string;
}

export interface MonthlyEvaluationClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string | null;
  academic_year: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  return String(value);
}

function normalizeNullableNumber(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  return String(value);
}

function sanitizeGridHeader(value: unknown): { id: string; name: string } {
  if (!isRecord(value)) {
    return { id: "", name: "" };
  }

  return {
    id: normalizeString(value.id),
    name: normalizeString(value.name),
  };
}

function sanitizeGridRow(value: unknown): MonthlyEvaluationGridRow | null {
  if (!isRecord(value)) {
    return null;
  }

  const studentId = normalizeString(value.student_id);
  if (!studentId) {
    return null;
  }

  return {
    student_id: studentId,
    student_name: normalizeString(value.student_name),
    class_group_id: normalizeString(value.class_group_id),
    class_name: normalizeString(value.class_name),
    module_id: normalizeString(value.module_id),
    module_name: normalizeString(value.module_name),
    evaluation_id: normalizeNullableNumber(value.evaluation_id),
    mark_of_participation_in_class: normalizeNullableNumber(
      value.mark_of_participation_in_class
    ),
    homeworks_mark: normalizeNullableNumber(value.homeworks_mark),
    remarks: normalizeNullableString(value.remarks),
    updated_at:
      typeof value.updated_at === "string" && value.updated_at.trim()
        ? value.updated_at
        : null,
  };
}

export function sanitizeTeacherMonthlyEvaluationGridResponse(
  value: unknown
): TeacherMonthlyEvaluationGridResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    month: normalizeString(value.month),
    class_group: sanitizeGridHeader(value.class_group),
    module: sanitizeGridHeader(value.module),
    rows: Array.isArray(value.rows)
      ? value.rows
          .map(sanitizeGridRow)
          .filter((row): row is MonthlyEvaluationGridRow => row !== null)
      : [],
  };
}