// To parse this data:
//
//   import { Convert, Teacher } from "./file";
//
//   const teacher = Convert.toTeacher(json);

export interface Teacher {
  user: User;
  school: School;
  full_name: string;
  phone_number: string;
  address: string;
  profile_picture: string;
  hire_date: Date;
  specialization: string;
  qualifications: string;
  years_of_experience: number;
  status: string;
  modulesAndClassGroups?: ModulesAndClassGroup[];
}

export interface ModulesAndClassGroup {
  teacher: number;
  module: Module;
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

export interface Module {
  module_id: string;
  module_name: string;
}

export interface School {
  school_id: string;
  school_name: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

// Converts JSON strings to/from your types
export class TeacherConvert {
  public static toTeacher(json: string): Teacher {
    return JSON.parse(json);
  }

  public static teacherToJson(value: Teacher): string {
    return JSON.stringify(value);
  }
}
