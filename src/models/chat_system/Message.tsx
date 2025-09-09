export interface Message {
  message_id: string;
  content: string;
  timestamp: Date;
  read: boolean;
  conversation: string;
  from_user: number;
}

// Converts JSON strings to/from your types
export class MessageConvert {
  public static toMessage(json: string): Message {
    return JSON.parse(json);
  }

  public static messageToJson(value: Message): string {
    return JSON.stringify(value);
  }
}
