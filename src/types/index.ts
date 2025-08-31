import { ClassGroup } from "../models/ClassGroups";
import { Student } from "../models/Student";
import {
  ResponseParent,
  ResponseStudent,
  ResponseTeacher,
} from "../services/http_api/http_reponse_types";

export type Language = "ar" | "en" | "fr";

export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [key: string]: Translation;
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "teacher" | "parent";
  schoolId?: string;
}

export interface School {
  id: string;
  name: string;
  type: "public" | "private";
  adminId: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

// Frontend Student shape in : StudentManagement
// export interface Student {
//   id: string;
//   name: string;
//   class?: string;
//   age: number;
//   parent?: string;
//   phone?: string;
//   average?: string;
//   attendance: string;
// }
// Frontend Teacher model : in TeacherManagement
export interface Teacher {
  id: number;
  name: string;
  subject: string;
  classes: string[];
  phone: string;
  email: string;
  status: string;
  experience: string | number;
  profile_picture?: string | null;
}
// Frontend Parent :
export interface Parent {
  id: number;
  name: string;
  phone: string;
  email: string;
  students?: string[];
  address: string;
  classes: string[];
}

export interface StudentManagementProps {
  studentsList: Student[];
  setStudentsList: any;
}

export interface TeacherManagementProps {
  teachersList: ResponseTeacher[];
  setTeacherList: any;
}

export interface ParentManagementProps {
  parentsList: ResponseParent[];
}

export interface ClassesManagementProps {
  class_groups_list: ClassGroup[];
}
