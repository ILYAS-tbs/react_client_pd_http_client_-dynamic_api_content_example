// To parse this data:
//
//   import { Convert, TeacherModuleClassGroup } from "./file";
//
//   const teacherModuleClassGroup = Convert.toTeacherModuleClassGroup(json);

export interface TeacherModuleClassGroup {
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
