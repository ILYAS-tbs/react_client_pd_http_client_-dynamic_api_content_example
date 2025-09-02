export interface ExamSchedule {
  exam_schedule_id: string;
  module_name: string;
  class_group_name: string;
  date: Date;
  time: string;
  duration: number;
  school: string;
}

// Converts JSON strings to/from your types
export class ExamScheduleConvert {
  public static toExamSchedule(json: string): ExamSchedule {
    return JSON.parse(json);
  }

  public static examScheduleToJson(value: ExamSchedule): string {
    return JSON.stringify(value);
  }
}
