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
// Students
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

// Teachers.ModulesAndClassGroups
export interface ModulesAndClassGroups {
  teacher: number;
  module: {
    module_id: string;
    module_name: string;
  };
  class_group: {
    class_group_id: string;
    name: string;
    school: string;
    academic_year: string;
  };
}
// Teacher
export interface ResponseTeacher {
  user: {
    id: number;
    username: string;
    email: string;
  };
  school: {
    school_id: string;
    school_name: string;
    email: string;
  };
  full_name: string;
  phone_number: string;
  address: string;
  profile_picture: null;
  hire_date: null;
  specialization: null;
  qualifications: null;
  years_of_experience: string | number;
  status: string;
  modulesAndClassGroups?: ModulesAndClassGroups[];
}
// Parents :
export interface ResponseParent {
  user: {
    id: number;
    username: string;
    email: string;
  };
  full_name: string;
  phone_number: string;
  address: string;
  relationship_to_student: string;
  profile_picture: null;
  emergency_contact: null;
  emergency_phone: null;
  students: [
    {
      student_id: string;
      full_name: string;
      date_of_birth: string;
    }
  ];
}
