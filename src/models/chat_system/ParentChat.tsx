// To parse this data:
//
//   import { Convert, ParentChat } from "./file";
//
//   const parentChat = Convert.toParentChat(json);

export interface ParentChat {
  parent_id: string;
  name: string;
  lastMessage: LastMessage;
  timestamp: string;
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
export class ParentChatConvert {
  public static toParentChat(json: string): ParentChat {
    return JSON.parse(json);
  }

  public static parentChatToJson(value: ParentChat): string {
    return JSON.stringify(value);
  }
}
