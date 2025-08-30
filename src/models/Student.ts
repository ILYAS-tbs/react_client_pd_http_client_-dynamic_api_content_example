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
  date_of_birth: string;
  gender: string;
  address: string;
  enrollment_date: string;
  status: string;
  module_grade: {};
  notes: {};
  trimester_grade: string;
  parent?: ParentJson;
  class_group?: ClassGroupJson;
}
// Frontend Student shape in : StudentManagement
interface StudentParams {
  id: string;
  name: string;
  age: number;
  attendance?: string;
  class_group?: ClassGroupJson;
  parent?: ParentJson;
  phone?: string;
}
export class Student {
  id: string;
  name: string;
  age: number;
  attendance?: string;
  class_group?: ClassGroupJson;
  parent?: ParentJson;
  phone?: string;
  constructor({
    id,
    name,
    age,
    attendance,
    class_group,
    parent,
    phone,
  }: StudentParams) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.attendance = attendance;
    this.class_group = class_group;
    this.parent = parent;
    this.phone = phone;
  }

  static fromJson(json: StudentJson) {
    return new Student({
      id: json.student_id,
      name: json.full_name,
      age: getAge(json.date_of_birth),
      attendance: undefined,
      class_group: json.class_group,
      parent: json.parent,
    });
  }
}
