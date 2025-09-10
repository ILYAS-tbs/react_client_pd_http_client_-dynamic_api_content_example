// To parse this data:
//
//   import { Convert, Student } from "./file";
//
//   const student = Convert.toStudent(json);

export interface Student {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  phone?: string;
  number_of_absences?: number;

  age?: number | string; // not from the backend - calculated here
  attendance?: number | string; // not from the backend - calculated here

  academic_state?: string;
  date_of_birth?: Date;
  gender?: null;
  address?: string;
  enrollment_date?: Date;
  status?: string;
  module_grades?: ModuleGrades;
  notes?: Notes;
  trimester_grade?: number;
  parent: Parent;
  school: School;
  class_group?: ClassGroup;
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

export interface ModuleGrades {
  s1: { [key: string]: S1 }[];
  s2: any[];
}

export interface S1 {
  average: number;
  teacher_name: string;
}

export interface Notes {}

export interface Parent {
  user: number;
  full_name: string;
  phone_number: string;
  address: string;
  relationship_to_student: string;
  profile_picture: null;
  emergency_contact: null;
  emergency_phone: null;
}

export interface School {
  school_id: string;
  school_name: string;
  email: string;
  school_level: string;
}

// Converts JSON strings to/from your types
export class StudentConvert {
  public static toStudent(json: string): Student {
    return JSON.parse(json);
  }

  public static studentToJson(value: Student): string {
    return JSON.stringify(value);
  }
}
