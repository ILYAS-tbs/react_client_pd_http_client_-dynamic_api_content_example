// To parse this data:
//
//   import { Convert, Welcome } from "./file";
//
//   const welcome = Convert.toWelcome(json);

//! generation site : https://app.quicktype.io/
export interface AbsenceReport {
  absence_report_id: string;
  absence_date: Date;
  submit_date: Date;
  absence_reason: string;
  proof_document: string;
  status: "pending" | "accepted" | "rejected";
  adminComment?: string;
  reviewDate?: Date;

  class_group: ClassGroup;
  student: Student;
  parent: Parent;
}

export interface ClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string;
  time_table: string;
  academic_year: string;
}

export interface Parent {
  user: number;
  full_name: string;
  phone_number: string;
  address: string;
  relationship_to_student: string;
  profile_picture: string;
  emergency_contact: string;
  emergency_phone: string;
}

export interface Student {
  student_id: string;
  full_name: string;
  date_of_birth: Date;
  class_group: ClassGroup;
}

// Converts JSON strings to/from your types
export class AbsenceReportConvert {
  public static fromJson(json: string): AbsenceReport {
    return JSON.parse(json);
  }

  public static toJson(value: AbsenceReport): string {
    return JSON.stringify(value);
  }
}
