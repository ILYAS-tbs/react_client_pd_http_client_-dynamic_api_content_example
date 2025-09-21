// To parse this data:
//
//   import { Convert, TeacherChat } from "./file";
//
//   const teacherChat = Convert.toTeacherChat(json);

export interface TeacherChat {
  teacher_id: string;
  name: string;
  lastMessage: LastMessage;
  timestamp: string | null;
  unread: number;
  online: boolean;
  avatar: string | null;
}

export interface LastMessage {
  content: string;
  read: boolean;
  type: null;
  file: null;
  conversation: null;
  from_user: null;
}

// Converts JSON strings to/from your types
export class TeacherChatConvert {
  public static toTeacherChat(json: string): TeacherChat {
    return JSON.parse(json);
  }

  public static teacherChatToJson(value: TeacherChat): string {
    return JSON.stringify(value);
  }
}
