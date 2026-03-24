// To parse this data:
//
//   import { Convert, SchoolChat } from "./file";
//
//   const schoolChat = Convert.toSchoolChat(json);

export interface SchoolChat {
  parent_id: string;
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
export class SchoolChatConvert {
  public static toSchoolChat(json: string): SchoolChat {
    return JSON.parse(json);
  }

  public static schoolChatToJson(value: SchoolChat): string {
    return JSON.stringify(value);
  }
}
