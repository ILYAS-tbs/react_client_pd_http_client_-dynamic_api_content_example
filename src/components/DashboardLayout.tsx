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
import { getTranslation } from "../utils/translations";

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
  const { notifications, notifications_data, unreadCount } = useNotifications();
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
      {/* Header - Stays at top but simplified */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16">
        <div className="h-full max-w-[100vw] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <img
              src="/assets/pedaconnect-removebg.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="hidden sm:block text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
            {/* Language Selector */}
            <div className="relative hidden sm:inline-flex items-center">
              <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as 'ar' | 'en' | 'fr')}
                className="appearance-none bg-transparent pl-8 pr-6 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-gray-600 dark:text-gray-400 text-sm"
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
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5 text-gray-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </button>

            {/* Notifications */}
            <NotificationsDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              timeAgoArabic={timeAgoArabic}
            />

            {/* User Profile */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse border-l rtl:border-l-0 rtl:border-r border-gray-200 dark:border-gray-700 pl-4 rtl:pl-0 rtl:pr-4">
              <div className="hidden md:block text-right rtl:text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? (user?.role === 'school' ? 'إدارة المدرسة' : 'مستخدم') : user?.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title={getTranslation('logout', language)}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16 h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className={`hidden lg:block w-64 bg-white dark:bg-gray-800 border-r rtl:border-r-0 rtl:border-l border-gray-200 dark:border-gray-700 overflow-y-auto`}>
          <div className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-500 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-primary-500" : ""}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sidebar Footer Info (Optional) */}
          {user?.role === "parent" && (
            <div className="m-4 p-4 bg-primary-500/5 dark:bg-primary-500/10 rounded-2xl border border-primary-500/10">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                <Star className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                  {getTranslation('accountStatus', language)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {getTranslation('accountActive', language)}
              </p>
              <button
                onClick={() => navigate("/", { state: { scrollTo: "pricing" } })}
                className="mt-3 w-full py-2 bg-primary-500 text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              >
                {getTranslation('upgradeNow', language) || "Upgrade Now"}
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={toggleMobileMenu}
            />
            <aside className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-72 bg-white dark:bg-gray-800 z-50 lg:hidden shadow-2xl`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <img src="/assets/pedaconnect-removebg.png" alt="Logo" className="w-8 h-8" />
                  <span className="font-bold text-gray-900 dark:text-white">PedaConnect</span>
                </div>
                <button onClick={toggleMobileMenu} className="p-2"><X className="h-6 w-6" /></button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-500"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}

                {/* Mobile Extra Controls */}
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm text-gray-500">{getTranslation('changeLanguage', language) || 'Language'}</span>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value as any)}
                      className="bg-transparent text-sm font-medium"
                    >
                      {languageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
