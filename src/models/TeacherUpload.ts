// To parse this data:
//
//   import { Convert, TeacherUpload } from "./file";
//
//   const teacherUpload = Convert.toTeacherUpload(json);

export interface TeacherUpload {
  title: string;
  description: string;
  teacher: number;
  class_groups: string[];
  upload_file: string;
  size: number;
  created_at: Date;
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
