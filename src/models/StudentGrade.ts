// To parse this data:
//
//   import { Convert, StudentGrade } from "./file";
//
//   const studentGrade = Convert.toStudentGrade(json);

export interface StudentGrade {
  id: number;
  student: Student;
  class_group: ClassGroup;

  s1_devoir_1: number | null;
  s1_devoir_2: number | null;
  s1_tests: number | null;
  s1_homeworks: number | null;
  s1_evaluation: number | null;
  s1_exam: number | null;
  s1_average: number | null;
  s2_devoir_1: number | null;
  s2_devoir_2: number | null;
  s2_tests: number | null;
  s2_homeworks: number | null;
  s2_evaluation: number | null;
  s2_exam: number | null;
  s2_average: number | null;

  // -------- Semester 3 --------
  s3_devoir_1: number | null;
  s3_devoir_2: number | null;
  s3_tests: number | null;
  s3_homeworks: number | null;
  s3_evaluation: number | null;
  s3_exam: number | null;
  s3_average: number | null;
  
  year: number | null;
  teacher: number | null;
  module: string;
}

export interface ClassGroup {
  class_group_id: string;
  name: string;
  school: number;
  teacher_list: null;
  academic_year: string;
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

// Converts JSON strings to/from your types
export class StudentGradeConvert {
  public static toStudentGrade(json: string): StudentGrade {
    return JSON.parse(json);
  }

  public static studentGradeToJson(value: StudentGrade): string {
    return JSON.stringify(value);
  }
}
