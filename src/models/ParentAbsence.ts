//! models the absences of the parent's all students
//! 1 ParentAbsence -> shows the absences for 1 student of that parent
export interface ParentAbsence {
  student_id: string;
  student_name: string;
  abscences: Abscence[];
}

export interface Abscence {
  id: number;
  student: Student;
  created_at: Date;
  teacher: number;
}

export interface Student {
  student_id: string;
  full_name: string;
  is_absent: boolean;
  academic_state: string;
  date_of_birth: Date;
  trimester_grade: number;
}

// Converts JSON strings to/from your types
export class ParentAbsencesConvert {
  public static toParentAbsences(json: string): ParentAbsence {
    return JSON.parse(json);
  }

  public static parentAbsencesToJson(value: ParentAbsence): string {
    return JSON.stringify(value);
  }
}
