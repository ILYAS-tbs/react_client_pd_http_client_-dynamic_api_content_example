import { ResponseStudent } from "../services/http_api/http_types";

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
export interface Student {
  id: string;
  name: string;
  class?: string;
  age: number;
  parent?: string;
  phone?: string;
  average?: string;
  attendance: string;
}
export interface StudentManagementProps {
  studentsList: ResponseStudent[];
}
