// To parse this data:
//
//   import { Convert, StudentPerformance } from "./file";
//
//   const studentPerformance = Convert.toStudentPerformance(json);

export interface StudentPerformance {
  student_id: string;
  student_name: string;
  student_overall_avg: number;
  class_group_id: string;
  class_group_name: string;
  class_group_students_number: number;
  class_group_students_average: number;
  student_rank: number;
  modules: Module[];
  modules_stats: ModulesStat[];
}

export interface Module {
  module_id: string;
  module_name: string;
}

export interface ModulesStat {
  module_name: string;
  marks_types: string[];
  module_marks: ModuleMark[];
  student_average: number;
  class_average: number;
}

export interface ModuleMark {
  module_name: string;
  module_marks: ModuleMarks;
}

export interface ModuleMarks {
  [key: string]: Mark[];
}

export interface Mark {
  mark_id: string;
  mark_type: string;
  mark_degree: number;
  mark_weight: number;
  date: Date;
  topic: string;
  remarks: string;
  teacher: Teacher;
  module: Module;
  student: Student;
}

export interface Student {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  academic_state: string;
  date_of_birth: Date;
  trimester_grade: number;
}

export interface Teacher {
  user: User;
  full_name: string;
  phone_number: string;
  address: null;
  profile_picture: null | string;
  hire_date: null;
  specialization: null;
  qualifications: null;
  years_of_experience: number | null;
  status: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

// Converts JSON strings to/from your types
export class StudentPerformanceConvert {
  public static toStudentPerformance(json: string): StudentPerformance {
    return JSON.parse(json);
  }

  public static studentPerformanceToJson(value: StudentPerformance): string {
    return JSON.stringify(value);
  }
}
