import React, { useEffect } from 'react';
import { Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';
import { auth_http_client } from '../services/http_api/auth/auth_http_client';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function Header({ activeSection, setActiveSection }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'home', label: getTranslation('home', language) },
    { id: 'about', label: getTranslation('about', language) },
    { id: 'services', label: getTranslation('services', language) },
    { id: 'pricing', label: getTranslation('pricing', language) },
    { id: 'contact', label: getTranslation('contact', language) },
  ];

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇩🇿' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoutAndNavigate = async (url: string) => {
  try {
    // await auth_http_client.handleDeleteSession(); // wait for server to delete session
    navigate(url); // only navigate after deletion
  } catch (err) {
    console.error("Failed to delete session:", err);
  }
};


  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="assets/logo.jpg" 
                alt="PedaConnect Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#39789b] dark:text-blue-300">PedaConnect</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {getTranslation('heroSlogan', language)}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-[#39789b] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-[#edeff3] dark:hover:bg-gray-700 hover:text-[#39789b] dark:hover:text-blue-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center dark:text-gray-300 space-x-4 rtl:space-x-reverse">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg hover:bg-[#edeff3] dark:hover:bg-gray-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm m-4">{languages.find(lang => lang.code === language)?.flag}</span>
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[140px] z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code as any);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-[#edeff3] dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 rtl:space-x-reverse ${
                        language === lang.code ? 'bg-[#edeff3] dark:bg-gray-700 text-[#39789b] dark:text-blue-300' : ''
                      } first:rounded-t-lg last:rounded-b-lg`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[#edeff3] dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button 
                onClick={() => handleLogoutAndNavigate("/login")}
                className="px-4 py-2 text-sm font-medium text-sky-500 hover:text-[#2d5f7d] transition-colors"
              >
                {getTranslation('login', language)}
              </button>
              <button 
                onClick={() => handleLogoutAndNavigate('/register')}
                className="px-6 py-2 bg-sky-600 hover:bg-[#2d5f7d] text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {getTranslation('register', language)}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#edeff3] dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4 space-y-3">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full px-4 py-3 rounded-lg text-left rtl:text-right font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-[#39789b] text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-[#edeff3] dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={toggleTheme}
                  className="flex items-center dark:text-gray-200 space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg hover:bg-[#edeff3] dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="block w-full px-4 py-3 text-center font-medium text-[#39789b] hover:bg-[#edeff3] dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {getTranslation('login', language)}
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="block w-full px-4 py-3 bg-[#39789b] hover:bg-[#2d5f7d] text-white text-center font-medium rounded-lg transition-colors"
                >
                  {getTranslation('register', language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}