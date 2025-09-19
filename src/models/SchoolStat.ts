// To parse this data:
//
//   import { Convert, SchoolStat } from "./file";
//
//   const schoolStat = Convert.toSchoolStat(json);

export interface SchoolStat {
  school_average: number;
  school_max_average: number;
  school_min_average: number;
  number_of_students: number;
  failed_students_number: number;
  groups_stats: GroupsStat[];
  semesters_stats: SemestersStat[];
}

export interface GroupsStat {
  class_group: string;
  students: Student[];
  number_of_students: number;
  students_average: number;
  max_average: number;
  top_student: Student;
  failed_student_number: number;
  success_ratio: number;
}

export interface Student {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  phone: string;
  academic_state: string;
  date_of_birth: Date;
  trimester_grade: number;
}

export interface SemestersStat {
  semester: string;
  module_id: string;
  module_name: string;
  class_group: string[];
  module_average: number;
}

// Converts JSON strings to/from your types
export class SchoolStatConvert {
  public static toSchoolStat(json: string): SchoolStat {
    return JSON.parse(json);
  }

  public static schoolStatToJson(value: SchoolStat): string {
    return JSON.stringify(value);
  }
}
