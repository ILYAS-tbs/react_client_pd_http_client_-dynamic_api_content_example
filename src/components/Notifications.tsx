import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { notifications_client } from "../services/http_api/notifications/notifications_client";
import { useNotifications } from "../contexts/NotificationContext";

const NotificationsDropdown = ({
  notifications,
  unreadCount,
  timeAgoArabic,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const {markAsRead}=useNotifications()
  
  const mark_notifs_as_read = async()=>{
    const res = await notifications_client.mark_notifs_as_read()
    if (res.ok) {
    // ✅ Update frontend state too
    notifications.forEach((n) => markAsRead(n.id));
  }
  }

  // Decide dropdown alignment BEFORE showing
  const toggleDropdown = () => {
    if (!isNotifOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - buttonRect.right;
      const spaceOnLeft = buttonRect.left;

      // Prefer right unless there's not enough space
      if (spaceOnRight < 280 && spaceOnLeft > spaceOnRight) {
        setAlignRight(false);
      } else {
        setAlignRight(true);
      }

      //! API CALL - Mark all notifs as read :
      mark_notifs_as_read()
    }
    setIsNotifOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        title="الإشعارات"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isNotifOpen && (
        <div
          ref={dropdownRef}
          className={`absolute mt-3 w-72 sm:w-80 max-h-[70vh] overflow-y-auto
            bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 
            shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl z-50 transition-all duration-200 
            origin-top animate-[fadeSlide_0.2s_ease-out]
            ${alignRight ? "right-0 md:right-4" : "left-0 md:left-4"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              الإشعارات
            </h3>
            <button
              onClick={() => setIsNotifOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Notifications */}
          {notifications?.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex flex-col gap-1"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {notif.title}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {timeAgoArabic(notif.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405M19 13a8 8 0 10-16 0 8 8 0 0016 0z"
                />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                لا توجد إشعارات جديدة
              </p>
            </div>
          )}
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationsDropdown;
