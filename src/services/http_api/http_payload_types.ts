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
