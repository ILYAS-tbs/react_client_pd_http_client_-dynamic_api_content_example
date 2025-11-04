import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { notifications_client } from "../services/http_api/notifications/notifications_client";
import { NotificationAPI } from "../models/notifications/NotificationAPI";
import { timeAgoArabic } from "../lib/timeAgoArabic";

interface Notification {
  id: string;
  title: string;
  message: string;
  type:string;
  timestamp: string;
  read: boolean;
  pinned?:boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Notification
  ) => void;
  markAsRead: (id: string) => void;
  unreadCount: number;

  notifications_data:NotificationAPI[] | null
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "مرحباً بك",
      message: "تم تسجيل دخولك بنجاح إلى المنصة",
      type: "success",
      timestamp: new Date(),
      read: false,
      pinned:true
    },
  ]);

const addNotification = (notification: Notification) => {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: notification.timestamp || new Date().toISOString(),
    read: notification.read ?? false,
    pinned: notification.pinned ?? false,
  };

  setNotifications((prev) => {
    const updated = [newNotification, ...prev];

    //  🎀  only move pinned to top, preserve the order of others
    const pinned = updated.filter((n) => n.pinned);
    const unpinned = updated.filter((n) => !n.pinned).sort(
        (a, b) =>
          new Date( b.timestamp).getTime() -
          new Date( a.timestamp).getTime()
      );;

    return [...pinned, ...unpinned]; // keeps original order intact
  });
};


  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };


  //?: BACKEND API NOTIFICATION SYSTEM WITH LONG POOLING ::
  const [notifications_data, setNotificationsData] = useState<
    NotificationAPI[] | null
  >([]);

  const get_notifications_by_recipient = async () => {
    const res = await notifications_client.get_notifications_by_recipient();
    if (res.ok) {
      const notifications_list: NotificationAPI[] = res.data;
      setNotificationsData(notifications_list);
    }
  };
  //?: SYNC BACKEND NOTIFICATION WITH FRONTNED :
  useEffect(() => {
    if (!notifications_data?.length) return;

    // 🔥 Sync backend notifications into the context
    // Only add to context if not already present
    notifications_data?.forEach((not) => {
      const alreadyExists = notifications.some(
        (n) => n.title === not.title && n.message === not.message
      );
      if (!alreadyExists) {
        addNotification({
          id:String(not.id),
          title: not.title,
          message: not.message,
          type: not?.type  ,
          timestamp:not.created_at.toString(),
          read:not.is_read
        });
      }
    });
  }, [notifications_data]); // 👈 only run when backend data changes

  //? LONG POOL (Notificatios) ::
  useEffect(() => {
    //!  ✨ Initial notifications data :: 
    get_notifications_by_recipient()

    //! ✨ Intervale for constant re-fetching ::
    const interval = setInterval(() => {
      console.info("Long Pooling Schooldashboard notifications");
      get_notifications_by_recipient();
    }, 60_000); // refresh every 1 minute

    return () => clearInterval(interval);
  }, []);


  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, unreadCount,notifications_data }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
