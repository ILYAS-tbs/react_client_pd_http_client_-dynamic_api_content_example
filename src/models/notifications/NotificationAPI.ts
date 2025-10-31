
export interface NotificationAPI {
    id:             number;
    title:          string;
    message:        string;
    is_read:        boolean;
    created_at:     Date;
    recipient:      number;
    related_school: number;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toNotification(json: string): NotificationAPI {
        return JSON.parse(json);
    }

    public static notificationToJson(value: NotificationAPI): string {
        return JSON.stringify(value);
    }
}
