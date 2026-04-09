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

export type GradeGridSectionKey =
  | "evaluation"
  | "devoir_1"
  | "devoir_2"
  | "exam"
  | "average";

export interface StudentGradeGridRow {
  grade_record_id: number;
  student_id: string;
  student_name: string;
  class_group_id: string;
  class_name: string;
  module_id: string;
  module_name: string;
  semester: "s1" | "s2" | "s3";
  evaluation_mark: number | null;
  devoir1_mark: number | null;
  devoir2_mark: number | null;
  exam_mark: number | null;
  average_mark: number | null;
}

export interface TeacherStudentGradesGridResponse {
  class_group: {
    id: string;
    name: string;
  };
  module: {
    id: string;
    name: string;
  };
  semester: "s1" | "s2" | "s3";
  rows: StudentGradeGridRow[];
}

export type ReadOnlyGradeSectionKey =
  | "evaluation"
  | "devoir_1"
  | "devoir_2"
  | "exam";

export interface ReadOnlyGradeSectionRow {
  grade_record_id: number | null;
  student_id: string;
  student_name: string;
  class_group_id: string;
  class_name: string;
  module_id: string;
  module_name: string;
  teacher_name: string | null;
  semester: "s1" | "s2" | "s3";
  mark: number | null;
}

export type ReadOnlyGradeSections = Record<
  ReadOnlyGradeSectionKey,
  ReadOnlyGradeSectionRow[]
>;

export interface SchoolReadOnlyGradesResponse {
  class_group: {
    id: string;
    name: string;
  };
  module: {
    id: string;
    name: string;
  };
  semester: "s1" | "s2" | "s3";
  sections: ReadOnlyGradeSections;
}

export interface ParentReadOnlyGradesResponse {
  student: {
    id: string;
    name: string;
  };
  module: {
    id: string;
    name: string;
  } | null;
  available_modules: Array<{
    id: string;
    name: string;
  }>;
  semester: "s1" | "s2" | "s3";
  sections: ReadOnlyGradeSections;
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
