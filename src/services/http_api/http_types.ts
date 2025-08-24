export type SignupPayload = {
  email: string;
  phone: string;
  username: string;
  password: string;
};
export type RegisterSchoolPayload = {
  school_name: string;
  email: string;
  phone_number: string;
  website: string;
  address: string;
  wilaya: string;
  commun: string;
  school_type: string;
  established_year: number;
  description: string;
};

export type LoginPayload = {
  //   email: string;
  //   phone: string;
  username: string; // Temporarily we will send : email as username
  password: string;
};

export interface ResponseStudent {
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
  parent?: {
    user: number;
    full_name: string;
    phone_number: string;
  };
  class_group?: {
    class_group_id: string;
    name: string;
    school: string;
    academic_year: string;
    description: string;
  };
}
