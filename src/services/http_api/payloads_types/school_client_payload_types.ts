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
  school_level: string;
  website: string;
  address: string;
  wilaya: string;
  commun: string;
  school_type: string;
  established_year: number;
  description: string;
};

export type RegisterParentPayload = {
  full_name: string;
  phone_number: string;
  address: string;
  relationship_to_student: string;
  //* : below will be discussed if creating student same time as parent or later
  //number_of_students: 1;
  // students: [
  //   {
  //     full_name: "student_01_parent_01_test";
  //     date_of_birth: "2007-06-12";
  //     school_name: "school_1";
  //     class_group_name: "a1";
  //   }
  // ];
};
export type RegisterTeacherPayload = {
  full_name: string;
  username: string;
  phone_number: string;
};
export type LoginPayload = {
  email: string;
  //   phone: string;
  username: string; // Temporarily we will send : email as username
  password: string;
};

// updated _teacher payload :
export interface TeacherPayload {
  full_name: string;
  phone_number: string;
  address: string;
  profile_picture: File | null;
  hire_date: string;
  specialization: string;
  qualifications: string;
  years_of_experience: number;
  status: "active" | "pending";
}

// ClassGroup :
export interface PostPutClassGroupPayload {
  name: string;
  teacher_list?: File | null;
}

// post student
export interface PostStudentPayload {
  full_name: string;
  date_of_birth: string;
  trimester_grade?: number;
  class_group_id?: string;
  phone: string;
}

// post getParentById
export interface FindParentByIdPayload {
  email: string;
}

export interface AddorRemoveParentToSchoolPayload {
  parent_pk: number;
}

export interface AddCurrectSchoolStudentsToParent {
  parent_pk: string;
  students: string[];
}

export interface PostPutTeacherModuleClassGrpPayload {
  teacher_id: string;
  class_group_id: string;
  module_id: string;
}
