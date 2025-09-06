import { getAge } from "../lib/dateUtils";

export interface ClassGroupJson {
  class_group_id: string;
  name: string;
  school: string;
  academic_year: string;
  description: string;
}

// private for inside this module .. detailed Parent will be a model class
interface ParentJson {
  user: number;
  full_name: string;
  phone_number: string;
}

export interface StudentJson {
  student_id: string;
  full_name: string;
  is_absent:boolean;
  date_of_birth: string;
  gender: string;
  address: string;
  enrollment_date: string;
  status: string;
  module_grade: {};
  notes: {};
  trimester_grade?: string;
  parent?: ParentJson;
  class_group?: ClassGroupJson;
}
// Frontend Student shape in : StudentManagement
interface StudentParams {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  age: number;
  date_of_birth: string;
  attendance?: string;
  class_group?: ClassGroupJson;
  parent?: ParentJson;
  phone?: string;
  trimester_grade?: number;
}
export class Student {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  age: number;
  date_of_birth: string;
  attendance?: string;
  class_group?: ClassGroupJson;
  parent?: ParentJson;
  phone?: string;
  trimester_grade?: number;
  constructor({
    student_id,
    full_name,
    is_absent,
    age,
    date_of_birth,
    attendance,
    class_group,
    parent,
    phone,
    trimester_grade,
  }: StudentParams) {
    this.student_id = student_id;
    this.full_name = full_name;
    this.is_absent = is_absent;
    this.age = age;
    this.date_of_birth = date_of_birth;
    this.attendance = attendance;
    this.class_group = class_group;
    this.parent = parent;
    this.phone = phone;
    this.trimester_grade = trimester_grade;
  }

  static fromJson(json: StudentJson) {
    return new Student({
      student_id: json.student_id,
      full_name: json.full_name,
      is_absent:json.is_absent,
      date_of_birth: json.date_of_birth,
      age: getAge(json.date_of_birth),
      attendance: undefined,
      class_group: json.class_group,
      parent: json.parent,
      trimester_grade:
        json.trimester_grade !== undefined && json.trimester_grade !== null
          ? Number(json.trimester_grade)
          : 0, // fallback
    });
  }
}
