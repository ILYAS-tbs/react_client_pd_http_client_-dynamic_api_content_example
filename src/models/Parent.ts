// To parse this data:
//
//   import { Convert, Parent } from "./file";
//
//   const parent = Convert.toParent(json);

export interface Parent {
  user: User;
  full_name: string;
  phone_number: string;
  address: string;
  relationship_to_student: string;
  profile_picture: null;
  emergency_contact: null;
  emergency_phone: null;
  students: Student[];
}

export interface Student {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  academic_state: string;
  date_of_birth: Date;
  trimester_grade: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

// Converts JSON strings to/from your types
export class ParentConvert {
  public static toParent(json: string): Parent {
    return JSON.parse(json);
  }

  public static parentToJson(value: Parent): string {
    return JSON.stringify(value);
  }
}
