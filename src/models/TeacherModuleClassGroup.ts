// To parse this data:
//
//   import { Convert, TeacherModuleClassGroup } from "./file";
//
//   const teacherModuleClassGroup = Convert.toTeacherModuleClassGroup(json);

export interface TeacherModuleClassGroup {
  id: number;
  students_count: number;
  average_grade: number;
  teacher: number;
  module: Module;
  class_group: ClassGroup;
}

export interface ClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: null;
  time_table: null;
  academic_year: string;
  schedule: Schedule[];
}

export interface Schedule {
  day: string;
  time: string;
}

export interface Module {
  module_id: string;
  module_name: string;
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

function normalizeNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  return String(value);
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeSchedule(value: unknown): Schedule | null {
  if (!isRecord(value)) {
    return null;
  }

  const day = normalizeString(value.day);
  const time = normalizeString(value.time);
  if (!day && !time) {
    return null;
  }

  return { day, time };
}

function sanitizeTeacherModuleClassGroup(
  value: unknown
): TeacherModuleClassGroup | null {
  if (!isRecord(value) || !isRecord(value.module) || !isRecord(value.class_group)) {
    return null;
  }

  const moduleId = normalizeString(value.module.module_id);
  const moduleName = normalizeString(value.module.module_name);
  const classGroupId = normalizeString(value.class_group.class_group_id);
  const classGroupName = normalizeString(value.class_group.name);

  if (!moduleId || !moduleName || !classGroupId || !classGroupName) {
    return null;
  }

  return {
    id: normalizeNumber(value.id),
    students_count: normalizeNumber(value.students_count),
    average_grade: normalizeNumber(value.average_grade),
    teacher: normalizeNumber(value.teacher),
    module: {
      module_id: moduleId,
      module_name: moduleName,
    },
    class_group: {
      class_group_id: classGroupId,
      name: classGroupName,
      school: normalizeString(value.class_group.school),
      teacher_list: normalizeNullableString(value.class_group.teacher_list),
      time_table: null,
      academic_year: normalizeString(value.class_group.academic_year),
      schedule: Array.isArray(value.class_group.schedule)
        ? value.class_group.schedule
            .map(sanitizeSchedule)
            .filter((schedule): schedule is Schedule => schedule !== null)
        : [],
    },
  };
}

export function sanitizeTeacherModuleClassGroups(
  value: unknown
): TeacherModuleClassGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(sanitizeTeacherModuleClassGroup)
    .filter((assignment): assignment is TeacherModuleClassGroup => assignment !== null);
}

// Converts JSON strings to/from your types
export class TeacherModuleClassGroupConvert {
  public static toTeacherModuleClassGroup(
    json: string
  ): TeacherModuleClassGroup {
    return JSON.parse(json);
  }

  public static teacherModuleClassGroupToJson(
    value: TeacherModuleClassGroup
  ): string {
    return JSON.stringify(value);
  }
}
