// To parse this data:
//
//   import { Convert, TeacherAbsence } from "./file";
//
//   const teacherAbsence = Convert.toTeacherAbsence(json);

export interface TeacherAbsence {
  id: number;
  student: Student;
  teacher: Teacher;
  created_at: Date;
}

export interface Student {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  date_of_birth: Date;
  trimester_grade: number;
}

export interface Teacher {
  user: User;
  full_name: string;
  phone_number: string;
  address: string;
  profile_picture: string;
  hire_date: null;
  specialization: null;
  qualifications: string;
  years_of_experience: number;
  status: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

// Converts JSON strings to/from your types
export class TeacherAbsenceConvert {
  public static toTeacherAbsence(json: string): TeacherAbsence {
    return JSON.parse(json);
  }

  public static teacherAbsenceToJson(value: TeacherAbsence): string {
    return JSON.stringify(value);
  }
}
