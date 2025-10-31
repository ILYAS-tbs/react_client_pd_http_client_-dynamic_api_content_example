import React, { useState } from "react";
import { LogOut, Bell, Moon, Sun, Globe, Menu, X, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router-dom";
import myScrollTo from "../lib/scroll_to_section";
import { timeAgoArabic } from "../lib/timeAgoArabic";
import NotificationsDropdown from "./Notifications";
import { useLanguage } from "../contexts/LanguageContext";

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  const { user, logout } = useAuth();
  const { notifications,notifications_data, unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const { language, isRTL, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languageOptions = [
    { value: "ar", label: "العربية" },
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navigate = useNavigate();

  //! Notifications
  const [isNotifOpen, setIsNotifOpen] = useState(false);


   const handleLanguageChange = (newLang: 'ar' | 'en' | 'fr') => {
    console.log('🌍 Changing language to:', newLang);
    setLanguage(newLang);
    // localStorage.setItem('language', newLang); // ✅ Save to localStorage
    // setIsLanguageMenuOpen(false);
  };
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center min-h-16 max-h-32 ">
            <div>
              <h1 className="text-sm sm:text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="truncate text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
              {/* Language Selector */}
              <div className="relative inline-flex items-center">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 absolute left-1.5 sm:left-2 text-gray-600 dark:text-gray-400 pointer-events-none" />
                <select
                  value={language}
                  onChange={(e) =>
                    // changeLanguage(e.target.value as "ar" | "en" | "fr")
                    handleLanguageChange(e.target.value as "ar" | "en" | "fr")
                  }
                  className="appearance-none bg-transparent border-none pl-6 sm:pl-8 pr-6 sm:pr-8 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-gray-600 dark:text-gray-400 text-xs sm:text-sm"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isRTL ? "تبديل الثيم" : "Toggle theme"}
              >
                {isDark ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <NotificationsDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  timeAgoArabic={timeAgoArabic}
                />
              </div>

              {/* Account Subscribtion (parent) */}
              {user?.role === "parent" && (
                <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
                  <div className="text-right rtl:text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      حالة الحساب
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      مفعّل
                    </p>
                  </div>
                  <button
                    onClick={() => {}}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={isRTL ? "الاشتراك" : "subscribe"}
                  >
                    <Star
                      onClick={() => {
                        navigate("/", { state: { scrollTo: "pricing" } });
                      }}
                      className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400"
                    />
                  </button>
                </div>
              )}

              {/* User Menu */}
              <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
                <div className="text-right rtl:text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    {language === "ar"
                      ? user?.role === "school"
                        ? "إدارة المدرسة"
                        : user?.role === "teacher"
                        ? "معلم"
                        : "ولي أمر"
                      : user?.role === "school"
                      ? "School Admin"
                      : user?.role === "teacher"
                      ? "Teacher"
                      : "Parent"}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={isRTL ? "تسجيل الخروج" : "Logout"}
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Desktop Tabs */}
          <div className="hidden sm:flex space-x-6 sm:space-x-8 rtl:space-x-reverse">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center py-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white mr-2 rtl:mr-0 rtl:ml-2">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </span>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full space-x-2 rtl:space-x-reverse py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
