// To parse this data:
//
//   import { Convert, TeacherUpload } from "./file";
//
//   const teacherUpload = Convert.toTeacherUpload(json);

export interface TeacherUpload {
  pk: number;
  title: string;
  description: string;
  teacher: number;
  class_groups: ClassGroup[];
  upload_file: string;
  size: number;
  size_unit: string;
  created_at: Date;
}

export interface ClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string;
  academic_year: string;
}

// Converts JSON strings to/from your types
export class TeacherUploadConvert {
  public static toTeacherUpload(json: string): TeacherUpload {
    return JSON.parse(json);
  }

  public static teacherUploadToJson(value: TeacherUpload): string {
    return JSON.stringify(value);
  }
}
