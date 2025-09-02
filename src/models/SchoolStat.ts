export interface SchoolStat {
  school_average: number;
  school_max_average: number;
  school_min_average: number;
  number_of_students: number;
  failed_students_number: number;
  groups_stats: GroupsStat[];
}

export interface GroupsStat {
  class_group: string;
  students?: Student[];
  number_of_students: number;
  students_average: number;
  max_average: number;
  top_student?: Student;
  failed_student_number: number;
  success_ratio: number;
}

export interface Student {
  student_id: null | string;
  full_name: string;
  date_of_birth: Date | null;
  class_group?: ClassGroup;
  trimester_grade: number | null;
}

export interface ClassGroup {
  class_group_id: string;
  name: Name;
  school: string;
  teacher_list: null | string;
  time_table: null | string;
  academic_year: string;
}

export enum Name {
  A13 = "A1-3",
  S5 = "S5",
  الفصلالثاني = "الفصل الثاني",
}

// Converts JSON strings to/from your types
export class SchoolStatConvert {
  public static toStat(json: string): SchoolStat {
    return JSON.parse(json);
  }

  public static statToJson(value: SchoolStat): string {
    return JSON.stringify(value);
  }
}
