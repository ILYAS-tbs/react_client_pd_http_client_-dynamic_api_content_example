// To parse this data:
//
//   import { Convert, Mark } from "./file";
//
//   const mark = Convert.toMark(json);

export interface Mark {
  mark_id: string;
  mark_type: string;
  mark_degree: number;
  date: Date | string;
  topic: string;
  remarks: string;
  teacher: number;
  module: Module;
  student: Student;
}

export interface Module {
  module_id: string;
  module_name: string;
}

export interface Student {
  student_id: string;
  full_name: string;
  date_of_birth: Date;
  class_group: ClassGroup;
  trimester_grade: number;
}

export interface ClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string;
  time_table: string;
  academic_year: string;
}

// Converts JSON strings to/from your types
export class MarkConvert {
  public static toMark(json: string): Mark {
    return JSON.parse(json);
  }

  public static markToJson(value: Mark): string {
    return JSON.stringify(value);
  }
}
