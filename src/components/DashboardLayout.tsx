import React, { useState } from 'react';
import { LogOut, Bell, Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

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
  children
}) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const { language, isRTL, changeLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languageOptions = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' }
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value as 'ar' | 'en' | 'fr')}
                  className="appearance-none bg-transparent border-none p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse cursor-pointer text-gray-600 dark:text-gray-400 text-xs sm:text-sm"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 absolute top-1/2 -translate-y-1/2 pointer-events-none right-1 sm:right-2 rtl:right-auto rtl:left-1 sm:rtl:left-2 text-gray-600 dark:text-gray-400" />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isRTL ? 'تبديل الثيم' : 'Toggle theme'}
              >
                {isDark ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
                <div className="text-right rtl:text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    {language === 'ar' 
                      ? user?.role === 'school' ? 'إدارة المدرسة' : 
                        user?.role === 'teacher' ? 'معلم' : 'ولي أمر'
                      : user?.role === 'school' ? 'School Admin' : 
                        user?.role === 'teacher' ? 'Teacher' : 'Parent'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={isRTL ? 'تسجيل الخروج' : 'Logout'}
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
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
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
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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