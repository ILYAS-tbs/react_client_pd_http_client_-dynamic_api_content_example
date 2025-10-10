// To parse this data:
//
//   import { Convert, BehaviourReport } from "./file";
//
//   const behaviourReport = Convert.toBehaviourReport(json);

export interface BehaviourReport {
  behaviour_report_id: string;
  date: Date;
  type: string;
  description: string;
  conclusion: string;
  created_at: Date;
  school: School;
  teacher: Teacher;
  student: Student;
}

export interface School {
  school_id: string;
  school_name: string;
  email: string;
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
  hire_date: Date;
  specialization: string;
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
export class BehaviourReportConvert {
  public static toBehaviourReport(json: string): BehaviourReport {
    return JSON.parse(json);
  }

  public static behaviourReportToJson(value: BehaviourReport): string {
    return JSON.stringify(value);
  }
}
