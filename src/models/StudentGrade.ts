// To parse this data:
//
//   import { Convert, StudentGrade } from "./file";
//
//   const studentGrade = Convert.toStudentGrade(json);

import { Mark } from "./Mark";

export interface StudentGrade {
  student_id: string;
  student_name: string;
  grades: Mark[];
  num_grades: number;
  class_group: ClassGroup;
  average: number;
}

export interface ClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: null;
  academic_year: string;
}

// export interface Grade {
//     mark_id:     string;
//     mark_type:   string;
//     mark_degree: number;
//     date:        Date;
//     topic:       string;
//     remarks:     string;
//     teacher:     number;
//     module:      Module;
//     student:     Student;
// }

export interface Module {
  module_id: string;
  module_name: string;
}

export interface Student {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  date_of_birth: Date;
  trimester_grade: number;
}

// Converts JSON strings to/from your types
export class StudentGradeConvert {
  public static toStudentGrade(json: string): StudentGrade {
    return JSON.parse(json);
  }

  public static studentGradeToJson(value: StudentGrade): string {
    return JSON.stringify(value);
  }
}
