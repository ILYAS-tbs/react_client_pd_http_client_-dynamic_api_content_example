
import { Target, Eye, Award, Users, BookOpen, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

export function About() {
  const { language, isRTL } = useLanguage();

  const features = [
    {
      icon: BookOpen,
      title: language === 'ar' ? 'تعليم متطور' : language === 'fr' ? 'Éducation Avancée' : 'Advanced Education',
      description: language === 'ar' ? 'منصة تعليمية حديثة تواكب أحدث التطورات التكنولوجية' : language === 'fr' ? 'Plateforme éducative moderne suivant les dernières évolutions technologiques' : 'Modern educational platform following the latest technological developments',
      image: '/assets/landing_page/family.jpeg'
    },
    {
      icon: Users,
      title: language === 'ar' ? 'تواصل فعال' : language === 'fr' ? 'Communication Efficace' : 'Effective Communication',
      description: language === 'ar' ? 'ربط مباشر بين المدارس والمعلمين وأولياء الأمور' : language === 'fr' ? 'Connexion directe entre écoles, enseignants et parents' : 'Direct connection between schools, teachers and parents',
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: BarChart3,
      title: language === 'ar' ? 'متابعة شاملة' : language === 'fr' ? 'Suivi Complet' : 'Complete Tracking',
      description: language === 'ar' ? 'متابعة شاملة ومفصلة لأداء الطلاب الأكاديمي' : language === 'fr' ? 'Suivi complet et détaillé des performances académiques des élèves' : 'Comprehensive and detailed tracking of student academic performance',
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Award,
      title: language === 'ar' ? 'نتائج مضمونة' : language === 'fr' ? 'Résultats Garantis' : 'Guaranteed Results',
      description: language === 'ar' ? 'تحسين ملحوظ في الأداء الأكاديمي ومشاركة أولياء الأمور' : language === 'fr' ? 'Amélioration notable des performances académiques et de l\'engagement des parents' : 'Notable improvement in academic performance and parent engagement',
      image: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];

  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-900 border-t-4 border-primary-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {getTranslation('aboutTitle', language)}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {getTranslation('aboutDescription', language)}
          </p>
        </div>

        {/* Mission & Vision with Dashboard Images */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className={`bg-gradient-to-br from-primary-500/5 to-secondary-200/10 rounded-2xl p-8 border border-secondary-200/20 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mr-4 rtl:mr-0 rtl:ml-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTranslation('mission', language)}
              </h3>
            </div>
            <div className="mb-6 relative rounded-xl overflow-hidden w-full aspect-[16/9]">
              <img
                src="https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Student progress tracking dashboard"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {getTranslation('missionText', language)}
            </p>
          </div>

          <div className={`bg-gradient-to-br from-secondary-200/5 to-primary-500/10 rounded-2xl p-8 border border-secondary-200/20 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mr-4 rtl:mr-0 rtl:ml-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTranslation('vision', language)}
              </h3>
            </div>
            <div className="mb-6 relative rounded-xl overflow-hidden w-full aspect-[16/9]">
              <img
                src="https://images.pexels.com/photos/5428010/pexels-photo-5428010.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Digital education analytics"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {getTranslation('visionText', language)}
            </p>
          </div>
        </div>

        {/* Features Grid with Images */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-secondary-200/20 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/30 to-transparent"></div>
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                  <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow-sm">
                    <feature.icon className="w-5 h-5 text-primary-500" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:bg-primary-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section with Academic Success Image */}
        <div className="relative rounded-3xl overflow-hidden w-full min-h-[400px] flex items-center">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/5212329/pexels-photo-5212329.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Students celebrating academic success"
              className="w-full h-full object-cover grayscale brightness-75 contrast-125"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          <div className="relative w-full p-8 md:p-16 lg:p-20">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {language === 'ar' ? 'إنجازاتنا في أرقام' : language === 'fr' ? 'Nos Réalisations en Chiffres' : 'Our Achievements in Numbers'}
              </h3>
              <p className="text-primary-100 text-lg">
                {language === 'ar' ? 'نتائج حقيقية تؤكد نجاح منصتنا' : language === 'fr' ? 'Résultats réels confirmant le succès de notre plateforme' : 'Real results confirming our platform\'s success'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-primary-100 text-sm">
                  {language === 'ar' ? 'مدرسة مسجلة' : language === 'fr' ? 'Écoles Inscrites' : 'Registered Schools'}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-primary-100 text-sm">
                  {language === 'ar' ? 'ولي أمر نشط' : language === 'fr' ? 'Parents Actifs' : 'Active Parents'}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">2K+</div>
                <div className="text-primary-100 text-sm">
                  {language === 'ar' ? 'معلم متصل' : language === 'fr' ? 'Enseignants Connectés' : 'Connected Teachers'}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">98%</div>
                <div className="text-primary-100 text-sm">
                  {language === 'ar' ? 'رضا المستخدمين' : language === 'fr' ? 'Satisfaction Utilisateurs' : 'User Satisfaction'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
