// local here , mini version of USER model
interface User {
  id: number;
  username: string;
  email: string;
}
interface School {
  school_id: string;
  school_name: string;
  email: string;
}
interface ClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  academic_year: string;
}
interface ModulesAndClassGroups {
  teacher: number;
  module: {
    module_id: string;
    module_name: string;
  };
  class_group: ClassGroup;
}
export interface TeacherJson {
  user: User;
  school: School;
  full_name: string;
  phone_number: string;
  address: string;
  profile_picture?: string;
  hire_date: null;
  specialization: null;
  qualifications: null;
  years_of_experience: string | number;
  status: string;
  modulesAndClassGroups?: ModulesAndClassGroups[];
}
const map_subjects = (modulesAndClassGroupsList: ModulesAndClassGroups[]) => {
  if (!modulesAndClassGroupsList) return [];

  const subject_list = modulesAndClassGroupsList.map(
    (modulesAndClassGroups) => modulesAndClassGroups.class_group.name
  );
  return subject_list;
};

//  Named params interface
interface TeacherParams {
  id: number;
  name: string;
  classes: string[];
  phone: string;
  email: string;
  experience: string | number;
  status: string;
  profile_picture?: string | null;
  subject?: string;
}
export class Teacher {
  id: number;
  name: string;
  classes: string[];
  phone: string;
  email: string;
  experience: string | number;
  status: string;
  profile_picture?: string | null;
  subject?: string;

  constructor({
    id,
    name,
    classes,
    phone,
    email,
    experience,
    status,
    profile_picture,
    subject,
  }: TeacherParams) {
    this.id = id;
    this.name = name;
    this.classes = classes;
    this.phone = phone;
    this.email = email;
    this.experience = experience;
    this.status = status;
    this.profile_picture = profile_picture;
    this.subject = subject;
  }

  static fromJson(json: TeacherJson) {
    return new Teacher({
      id: json.user.id,
      name: json.full_name,
      classes: map_subjects(json.modulesAndClassGroups || []),
      phone: json.phone_number,
      email: json.user.email,
      experience: json.years_of_experience,
      status: json.status === "pending" ? "معلق" : "نشط",
      profile_picture: json.profile_picture,
      subject: json.modulesAndClassGroups?.[0]?.module.module_name,
    });
  }
}
//? Note : all the repetition in the Teacher just to have named-paramtres works in FromJSon

//! main model to be exported : Teacher,TeacherJson ..
// ! all others will be local here only used to help describe it from the response
