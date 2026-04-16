// To parse this data:
//
//   import { Convert, ParentStudentEvent } from "./file";
//
//   const parentStudentEvent = Convert.toParentStudentEvent(json);

export interface ClassGroupNested {
  class_group_id: string;
  name: string;
}

export interface ParentStudentEvent {
  student_id: string;
  student: string;
  school_id: string;
  school: string;
  events: Event[];
}

export interface Event {
  event_id: string;
  title: string;
  category: string;
  date: Date;
  time: string;
  place: string;
  desc?: string | null;
  file?: string | null;
  event_type: "global" | "targeted";
  class_groups: ClassGroupNested[];
  created_at?: string;
  updated_at?: string;
}

// Converts JSON strings to/from your types
export class ParentStudentEventConvert {
  public static toParentStudentEvent(json: string): ParentStudentEvent {
    return JSON.parse(json);
  }

  public static parentStudentEventToJson(value: ParentStudentEvent): string {
    return JSON.stringify(value);
  }
}
