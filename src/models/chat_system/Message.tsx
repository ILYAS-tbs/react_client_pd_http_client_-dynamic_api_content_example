// To parse this data:
//
//   import { Convert, Message } from "./file";
//
//   const message = Convert.toMessage(json);

export interface Message {
    message_id:   string;
    from_user?:    FromUser;
    content:      string | null;
    timestamp:    Date;
    read:         boolean;
    type:         string;
    file:         null;
    conversation: string;
}

export interface FromUser {
    id:       number;
    username: string;
    email:    string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toMessage(json: string): Message {
        return JSON.parse(json);
    }

    public static messageToJson(value: Message): string {
        return JSON.stringify(value);
    }
}
