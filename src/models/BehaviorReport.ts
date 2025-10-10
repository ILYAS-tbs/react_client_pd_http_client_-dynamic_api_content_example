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
  school: School;
  teacher: Teacher;
  student: Student;
  created_at: Date;
}

export interface School {
  school_id: string;
  school_name: string;
  email: string;
}

export interface Student {
  student_id: string;
  full_name: string;
  date_of_birth: Date;
  class_group: ClassGroup;
}

export interface ClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string;
  time_table: string;
  academic_year: string;
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
