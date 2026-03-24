// To parse this data:
//
//   import { Convert, ParentSchoolChat } from "./file";
//
//   const parentSchoolChat = Convert.toParentSchoolChat(json);

export interface ParentSchoolChat {
  school_id: string;
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
export class ParentSchoolChatConvert {
  public static toParentSchoolChat(json: string): ParentSchoolChat {
    return JSON.parse(json);
  }

  public static parentSchoolChatToJson(value: ParentSchoolChat): string {
    return JSON.stringify(value);
  }
}
