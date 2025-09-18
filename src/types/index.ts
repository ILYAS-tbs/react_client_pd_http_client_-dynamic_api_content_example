import React from "react";
import { AbsenceReport } from "../models/AbsenceReports";
import { BehaviourReport } from "../models/BehaviorReport";
import { ClassGroup } from "../models/ClassGroups";
import { Event } from "../models/Event";
import { ExamSchedule } from "../models/ExamSchedule";
import { Parent } from "../models/ParenAndStudent";
import { SchoolStat } from "../models/SchoolStat";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";
import { TeacherAbsence } from "../models/TeacherAbsence";
import { TeacherModuleClassGroup } from "../models/TeacherModuleClassGroup";

import { TeacherModuleClassGrp } from "../models/TeacherModuleClassGrp";
import { Mark } from "../models/Mark";
import { StudentGrade } from "../models/StudentGrade";
import { TeacherUpload } from "../models/TeacherUpload";
import { StudentPerformance } from "../models/StudentPerformance";
import { ParentStudentEvent } from "../models/ParentStudentEvent";
import { Module } from "../models/Module";

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
// export interface Student {
//   id: string;
//   name: string;
//   class?: string;
//   age: number;
//   parent?: string;
//   phone?: string;
//   average?: string;
//   attendance: string;
// }
// Frontend Teacher model : in TeacherManagement

// export interface Teacher {
//   id: number;
//   name: string;
//   subject: string;
//   classes: string[];
//   phone: string;
//   email: string;
//   status: string;
//   experience: string | number;
//   profile_picture?: string | null;
// }
// Frontend Parent :

export interface StudentManagementProps {
  studentsList: Student[];
  setStudentsList: any;
  class_groups_list: ClassGroup[];
}

export interface TeacherManagementProps {
  teachersList: Teacher[];
  setTeacherList: any; // setState
  modules: Module[];
  SetModules: React.Dispatch<React.SetStateAction<Module[]>>;
  class_groups_list: ClassGroup[];
}

export interface ParentManagementProps {
  parentsList: Parent[];
  setParentList: React.Dispatch<React.SetStateAction<Parent[]>>;
  class_groups_list: ClassGroup[];
  studentsList: Student[];
  //? Re-Sync with the server functions
  RefetchStudents: () => void;
}

export interface ClassesManagementProps {
  class_groups_list: ClassGroup[];
  setClassGroupList: any; // setState
}

export interface ScheduleManagementProps {
  class_groups_list: ClassGroup[];
  setClassGroupList: React.Dispatch<React.SetStateAction<ClassGroup[]>>; // setState
}

export interface ActivitiesManagementProps {
  events_list: Event[];
  school_id: number;
  RefetchEvents: () => void;
}

export interface AbsenceReviewsProps {
  absence_reports_list: AbsenceReport[];
  RefetchReports: () => void;
}

export interface BehaviorReportsProps {
  behaviour_reports_list: BehaviourReport[];
  students_list: Student[];
}

export interface ExamScheduleManagementProps {
  exam_schedules: ExamSchedule[];
  setExamSchedules: React.Dispatch<React.SetStateAction<ExamSchedule[]>>;
  school_id: number;
  class_groups: ClassGroup[];
  //? Re-Sync with the server functions:
  RefetchExams: () => void;
}

export interface GradeOverviewProps {
  school_stat: SchoolStat | null;
  setSchoolStat: React.Dispatch<React.SetStateAction<SchoolStat | null>>;
  class_groups: ClassGroup[];
}

// ! Teacher Dashboard :
export interface ClassManagementProps {
  students_list: Student[];
  setStudentsList: React.Dispatch<React.SetStateAction<Student[]>>;
  modules_class_groups: TeacherModuleClassGroup[];
  setAbsences: React.Dispatch<React.SetStateAction<TeacherAbsence[]>>;
  teacher_id: number;
}

export interface TeacherAbsenceManagerProps {
  absences: TeacherAbsence[];
  setAbsences: React.Dispatch<React.SetStateAction<TeacherAbsence[]>>;
  students_list: Student[];
  teacher_id: number;
  behaviour_reports: BehaviourReport[];
  setBehaviourReports: React.Dispatch<React.SetStateAction<BehaviourReport[]>>;
}

export interface GradeManagerProps {
  modules: TeacherModuleClassGrp[];
  modules_class_groups: TeacherModuleClassGroup[];
  students_grades: StudentGrade[];
  setStudentsGrades: React.Dispatch<React.SetStateAction<StudentGrade[]>>;
  teacher_id: number;
}

export interface ResourceManagerProps {
  modules_class_groups: TeacherModuleClassGroup[];
  teacher_uploads: TeacherUpload[];
  setTeacherUploads: React.Dispatch<React.SetStateAction<TeacherUpload[]>>;
}

//! Parent Dashboard :
export interface ChildrenOverviewProps {
  students: Student[];
  one_student_absences: (s: Student) => number | undefined;
}

export interface GradeReportsProps {
  students: Student[];
  studentPerformances: StudentPerformance[];
}

export interface AbsenceManagerProps {
  students: Student[];
  absence_reports: AbsenceReport[];
  setAbsenceReports: React.Dispatch<React.SetStateAction<AbsenceReport[]>>;
  behaviour_reports: BehaviourReport[];
  setBehabiourReports: React.Dispatch<React.SetStateAction<BehaviourReport[]>>;
}

export interface ActivitiesViewProps {
  parentStudentsEvents: ParentStudentEvent[];
}

export interface ResourceLibraryProps {
  uploads: TeacherUpload[];
}
export interface ScheduleManagementParentProps {
  students: Student[];
  class_groups_list: ClassGroup[];
  setClassGroupList: React.Dispatch<React.SetStateAction<ClassGroup[]>>;
}
