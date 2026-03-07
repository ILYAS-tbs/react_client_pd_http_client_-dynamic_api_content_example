import { ArrowRight, ArrowLeft, Play, BookOpen, Users, Trophy, BarChart3, GraduationCap } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const { language, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-secondary-50 to-secondary-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary-500/15 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-10 w-16 h-16 bg-secondary-200/25 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

          {/* Content */}
          <div className={`${isRTL ? 'lg:order-2' : 'lg:order-1'} space-y-8`}>
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-primary-500/10 dark:bg-primary-500/20 rounded-full">
                <Trophy className="w-4 h-4 text-primary-500 mr-2 rtl:mr-0 rtl:ml-2" />
                <span className="text-sm font-medium text-primary-500 dark:text-primary-300">
                  {getTranslation('heroSlogan', language)}
                </span>
              </div>

              {/* Main Title */}
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-gray-900 dark:text-white">
                  PedaConnect
                </span>
                <br />
                <span className="text-primary-500 dark:text-primary-400">
                  {getTranslation('heroSlogan', language)}
                </span>
              </h1>

              {/* Description */}
              <p className={`text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl ${isRTL ? 'text-right' : 'text-left'}`}>
                {getTranslation('heroDescription', language)}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:justify-end' : 'sm:justify-start'}`}>
              <button
                onClick={onGetStarted}
                className="group flex items-center justify-center px-8 py-4 bg-primary-500 hover:bg-primary-700 text-white rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="mr-2 rtl:mr-0 rtl:ml-2">{getTranslation('getStarted', language)}</span>
                <ArrowIcon className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollTo("about")}
                className="group flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-[#bcc6d2] dark:border-gray-700 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">

                <Play className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2 text-primary-500 group-hover:scale-110 transition-transform" />
                <span>{getTranslation('learnMore', language)}</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="text-2xl md:text-3xl font-bold text-primary-500 dark:text-primary-300">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'مدرسة' : language === 'fr' ? 'Écoles' : 'Schools'}
                </div>
              </div>
              <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="text-2xl md:text-3xl font-bold text-primary-500 dark:text-primary-300">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'ولي أمر' : language === 'fr' ? 'Parents' : 'Parents'}
                </div>
              </div>
              <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="text-2xl md:text-3xl font-bold text-primary-500 dark:text-primary-300">2K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'معلم' : language === 'fr' ? 'Enseignants' : 'Teachers'}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Mockup Visual */}
          <div className={`${isRTL ? 'lg:order-1' : 'lg:order-2'} relative`}>
            <div className="relative">
              {/* Main Dashboard Interface */}
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'لوحة التحكم' : language === 'fr' ? 'Tableau de Bord' : 'Dashboard'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'متابعة الأداء الأكاديمي' : language === 'fr' ? 'Suivi Performance' : 'Academic Tracking'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Grade Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700 opacity-80 grayscale-[30%] hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {language === 'ar' ? 'الرياضيات' : language === 'fr' ? 'Mathématiques' : 'Mathematics'}
                      </span>
                      <BarChart3 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">18/20</div>
                    <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-4 rounded-xl border border-primary-200 dark:border-primary-700 opacity-80 grayscale-[30%] hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                        {language === 'ar' ? 'العلوم' : language === 'fr' ? 'Sciences' : 'Sciences'}
                      </span>
                      <BookOpen className="w-4 h-4 text-primary-500" />
                    </div>
                    <div className="text-2xl font-bold text-primary-800 dark:text-primary-200">16/20</div>
                    <div className="w-full bg-primary-200 dark:bg-primary-700 rounded-full h-2 mt-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Attendance & Communication */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Users className="w-5 h-5 text-primary-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {language === 'ar' ? 'الحضور اليوم' : language === 'fr' ? 'Présence Aujourd\'hui' : 'Today\'s Attendance'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {language === 'ar' ? 'حاضر' : language === 'fr' ? 'Présent' : 'Present'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Trophy className="w-5 h-5 text-primary-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {language === 'ar' ? 'المعدل العام' : language === 'fr' ? 'Moyenne Générale' : 'Overall Average'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary-500">17.2/20</span>
                  </div>
                </div>
              </div>

              {/* Floating Achievement Cards */}
              <div className="absolute -top-4 -right-4 rtl:-right-auto rtl:-left-4 w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">A+</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 rtl:-left-auto rtl:-right-4 w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-300 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-1" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">98%</span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="absolute top-1/2 -left-8 rtl:-left-auto rtl:-right-8 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">95%</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {language === 'ar' ? 'التقدم' : language === 'fr' ? 'Progrès' : 'Progress'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'ar' ? 'هذا الشهر' : language === 'fr' ? 'Ce mois' : 'This month'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Notification */}
              <div className="absolute top-8 right-8 rtl:right-auto rtl:left-8 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse">
                {language === 'ar' ? 'نجاح مؤكد!' : language === 'fr' ? 'Succès Assuré!' : 'Success Assured!'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
