import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, SOCIAL_LINKS } from '../lib/platformContacts.ts';

function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14 3c.18 1.54 1.05 3.04 2.32 4.08A6.3 6.3 0 0 0 20 8.48v3.08a9.26 9.26 0 0 1-3.12-.54 9.53 9.53 0 0 1-1.88-.92v5.67a5.77 5.77 0 0 1-1.62 4.01A5.98 5.98 0 0 1 9 21.5a6 6 0 0 1-4.24-1.74A5.77 5.77 0 0 1 3 15.75a5.77 5.77 0 0 1 1.76-4.01A6 6 0 0 1 9 10c.34 0 .68.03 1 .09v3.15A2.78 2.78 0 0 0 9 13.05c-1.66 0-3 1.22-3 2.7s1.34 2.7 3 2.7 3-1.22 3-2.7V3h2Z" />
    </svg>
  );
}

export function Footer() {
  const { language, isRTL } = useLanguage();

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: getTranslation('home', language), href: '#home' },
    { label: getTranslation('about', language), href: '#about' },
    { label: getTranslation('services', language), href: '#services' },
    { label: getTranslation('pricing', language), href: '#pricing' },
    { label: getTranslation('contact', language), href: '#contact' },
  ];

  const legalLinks = [
    {
      label: language === 'ar' ? 'سياسة الخصوصية' : language === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy',
      href: '/privacy'
    },
    {
      label: language === 'ar' ? 'شروط الخدمة' : language === 'fr' ? 'Conditions d\'Utilisation' : 'Terms of Service',
      href: '/terms'
    },
    {
      label: language === 'ar' ? 'ملفات تعريف الارتباط' : language === 'fr' ? 'Politique de Cookies' : 'Cookie Policy',
      href: '/cookies'
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: SOCIAL_LINKS.facebook, label: 'Facebook' },
    { icon: Instagram, href: SOCIAL_LINKS.instagram, label: 'Instagram' },
    { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: 'LinkedIn' },
    { icon: TiktokIcon, href: SOCIAL_LINKS.tiktok, label: 'TikTok' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className={`lg:col-span-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <div className="w-16 h-16 flex items-center justify-center">
                <img
                  src="/assets/pedaconnect-removebg.png"
                  alt="PedaConnect Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">PedaConnect</h3>
                <p className="text-sm text-primary-400">تعليم متابع نجاح مؤكد</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {getTranslation('footerDescription', language)}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <h4 className="text-lg font-bold mb-6">
              {getTranslation('quickLinks', language)}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-300 hover:bg-primary-500 transition-colors duration-200 hover:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <h4 className="text-lg font-bold mb-6">
              {language === 'ar' ? 'الشروط القانونية' : language === 'fr' ? 'Mentions Légales' : 'Legal'}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:bg-primary-500 transition-colors duration-200 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <h4 className="text-lg font-bold mb-6">
              {getTranslation('contactInfo', language)}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <MapPin className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">
                    {language === 'ar' ? 'الجزائر العاصمة، الجزائر' :
                      language === 'fr' ? 'Alger, Algérie' :
                        'Algiers, Algeria'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {language === 'ar' ? 'شارع الاستقلال، المركز' :
                      language === 'fr' ? 'Rue de l\'Indépendance, Centre' :
                        'Independence Street, Center'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div>
                  <a
                    href={`tel:${CONTACT_PHONE_HREF}`}
                    className="text-gray-300 hover:text-primary-400"
                  >
                    {CONTACT_PHONE_DISPLAY}
                  </a>
                  <p className="text-gray-400 text-sm">
                    {language === 'ar' ? 'الأحد - الخميس، 8:00 - 17:00' :
                      language === 'fr' ? 'Dim - Jeu, 8:00 - 17:00' :
                        'Sun - Thu, 8:00 AM - 5:00 PM'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-gray-300 hover:text-primary-400"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <p className="text-gray-400 text-sm">
                    {language === 'ar' ? 'دعم العملاء' :
                      language === 'fr' ? 'Support Client' :
                        'Customer Support'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-800">
          <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
            <h4 className="text-lg font-bold mb-4">
              {language === 'ar' ? 'اشترك في نشرتنا الإخبارية' :
                language === 'fr' ? 'Abonnez-vous à notre newsletter' :
                  'Subscribe to our Newsletter'}
            </h4>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              {language === 'ar' ? 'احصل على آخر الأخبار والتحديثات حول منصة PedaConnect' :
                language === 'fr' ? 'Recevez les dernières nouvelles et mises à jour sur PedaConnect' :
                  'Get the latest news and updates about PedaConnect platform'}
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' :
                  language === 'fr' ? 'Entrez votre email' :
                    'Enter your email'}
                className={`flex-1 px-4 py-3 bg-gray-800 text-white rounded-l-xl ${isRTL ? 'rounded-l-none rounded-r-xl' : ''} focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-700`}
              />
              <button className="px-6 py-3 bg-primary-500 hover:bg-primary-700 text-white rounded-r-xl rtl:rounded-r-none rtl:rounded-l-xl font-semibold transition-colors duration-200">
                {language === 'ar' ? 'اشتراك' : language === 'fr' ? 'S\'abonner' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-800">
          <div className={`flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-gray-400 text-sm">
              © {currentYear} PedaConnect. {getTranslation('allRightsReserved', language)}
            </p>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
