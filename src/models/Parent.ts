interface User {
  id: number;
  username: string;
  email: string;
}
interface Student {
  student_id: string;
  full_name: string;
  date_of_birth: string;
}
export interface ParentJson {
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

// export interface Parent {
//   id: number;
//   name: string;
//   phone: string;
//   email: string;
//   students?: string[];
//   address: string;
//   classes: string[];
// }
interface ParentParams {
  id: number;
  name: string;
  phone: string;
  email: string;
  students?: Student[];
  address: string;
  classes?: string[];
}
export class Parent {
  id: number;
  name: string;
  phone: string;
  email: string;
  students?: Student[];
  address: string;
  classes?: string[];
  constructor({
    id,
    name,
    phone,
    email,
    students,
    address,
    classes,
  }: ParentParams) {
    (this.id = id), (this.name = name), (this.email = email);
    (this.phone = phone),
      (this.students = students),
      (this.address = address),
      (this.classes = classes);
  }

  static fromJson(json: ParentJson) {
    return new Parent({
      id: json.user.id,
      name: json.full_name,
      phone: json.phone_number,
      email: json.user.email,
      students: json.students,
      address: json.address,
      classes: undefined,
    });
  }
}
