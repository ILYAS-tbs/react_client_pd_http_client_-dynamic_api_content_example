// To parse this data:
//
//   import { Convert, NotificationAPI } from "./file";
//
//   const notificationAPI = Convert.toNotificationAPI(json);

export interface NotificationAPI {
    id:             number;
    title:          string;
    message:        string;
    is_read:        boolean;
    created_at:     Date;
    type:           string;
    recipient:      number;
    related_school: number;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toNotificationAPI(json: string): NotificationAPI {
        return JSON.parse(json);
    }

    public static notificationAPIToJson(value: NotificationAPI): string {
        return JSON.stringify(value);
    }
}
