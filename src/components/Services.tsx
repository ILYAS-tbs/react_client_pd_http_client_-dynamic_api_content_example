import React from 'react';
import { School, Users, GraduationCap, MessageSquare, BarChart3, FileText, Clock, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

interface HeroProps {
  onGetStarted: () => void;
}

export function Services({ onGetStarted }: HeroProps) {
  const { language, isRTL } = useLanguage();

  const services = [
    {
      icon: School,
      title: getTranslation('schoolManagement', language),
      description: getTranslation('schoolManagementDesc', language),
      features: [
        language === 'ar' ? 'إدارة الطلاب والمعلمين' : language === 'fr' ? 'Gestion des élèves et enseignants' : 'Student and teacher management',
        language === 'ar' ? 'نظام الدرجات المرن' : language === 'fr' ? 'Système de notation flexible' : 'Flexible grading system',
        language === 'ar' ? 'تتبع الحضور' : language === 'fr' ? 'Suivi de présence' : 'Attendance tracking',
        language === 'ar' ? 'التقارير التفصيلية' : language === 'fr' ? 'Rapports détaillés' : 'Detailed reports'
      ],
      color: 'from-primary-500 to-primary-700'
    },
    {
      icon: Users,
      title: getTranslation('parentAccess', language),
      description: getTranslation('parentAccessDesc', language),
      features: [
        language === 'ar' ? 'متابعة الدرجات الفورية' : language === 'fr' ? 'Suivi des notes en temps réel' : 'Real-time grade tracking',
        language === 'ar' ? 'جدول الحصص المحدث' : language === 'fr' ? 'Emploi du temps actualisé' : 'Updated class schedule',
        language === 'ar' ? 'تبرير الغياب' : language === 'fr' ? 'Justification d\'absence' : 'Absence justification',
        language === 'ar' ? 'الاستعلام عن الدرجات' : language === 'fr' ? 'Demandes de révision de notes' : 'Grade appeals'
      ],
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      icon: GraduationCap,
      title: getTranslation('teacherTools', language),
      description: getTranslation('teacherToolsDesc', language),
      features: [
        language === 'ar' ? 'رفع المواد التعليمية' : language === 'fr' ? 'Téléchargement de matériel pédagogique' : 'Educational material upload',
        language === 'ar' ? 'إدارة الدرجات' : language === 'fr' ? 'Gestion des notes' : 'Grade management',
        language === 'ar' ? 'التواصل مع أولياء الأمور' : language === 'fr' ? 'Communication avec les parents' : 'Parent communication',
        language === 'ar' ? 'مكتبة الموارد' : language === 'fr' ? 'Bibliothèque de ressources' : 'Resource library'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MessageSquare,
      title: getTranslation('communication', language),
      description: getTranslation('communicationDesc', language),
      features: [
        language === 'ar' ? 'رسائل آمنة ومشفرة' : language === 'fr' ? 'Messages sécurisés et cryptés' : 'Secure encrypted messages',
        language === 'ar' ? 'إشعارات فورية' : language === 'fr' ? 'Notifications instantanées' : 'Instant notifications',
        language === 'ar' ? 'مشاركة الملفات' : language === 'fr' ? 'Partage de fichiers' : 'File sharing',
        language === 'ar' ? 'سجل المحادثات' : language === 'fr' ? 'Historique des conversations' : 'Chat history'
      ],
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const additionalFeatures = [
    {
      icon: BarChart3,
      title: language === 'ar' ? 'تحليلات متقدمة' : language === 'fr' ? 'Analyses Avancées' : 'Advanced Analytics',
      description: language === 'ar' ? 'تقارير شاملة وإحصائيات مفصلة لتتبع الأداء' : language === 'fr' ? 'Rapports complets et statistiques détaillées pour suivre les performances' : 'Comprehensive reports and detailed statistics to track performance',
      image: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: FileText,
      title: language === 'ar' ? 'إدارة الوثائق' : language === 'fr' ? 'Gestion des Documents' : 'Document Management',
      description: language === 'ar' ? 'تنظيم وأرشفة جميع الوثائق الأكاديمية والإدارية' : language === 'fr' ? 'Organisation et archivage de tous les documents académiques et administratifs' : 'Organization and archiving of all academic and administrative documents',
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Clock,
      title: language === 'ar' ? 'جدولة ذكية' : language === 'fr' ? 'Planification Intelligente' : 'Smart Scheduling',
      description: language === 'ar' ? 'نظام جدولة متطور للحصص والأنشطة المدرسية' : language === 'fr' ? 'Système de planification avancé pour les cours et activités scolaires' : 'Advanced scheduling system for classes and school activities',
      image: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Shield,
      title: language === 'ar' ? 'أمان متقدم' : language === 'fr' ? 'Sécurité Avancée' : 'Advanced Security',
      description: language === 'ar' ? 'حماية شاملة للبيانات مع أعلى معايير الأمان' : language === 'fr' ? 'Protection complète des données avec les plus hauts standards de sécurité' : 'Comprehensive data protection with highest security standards',
      image: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];

  return (
    <section id="services" className="py-16 sm:py-20 lg:py-24 bg-secondary-50 dark:bg-gray-800 border-t-4 border-primary-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {getTranslation('servicesTitle', language)}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {language === 'ar' ? 'نقدم مجموعة شاملة من الخدمات المتطورة لتلبية احتياجات جميع أطراف العملية التعليمية' :
              language === 'fr' ? 'Nous offrons une gamme complète de services avancés pour répondre aux besoins de tous les acteurs du processus éducatif' :
                'We offer a comprehensive range of advanced services to meet the needs of all educational stakeholders'}
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-2 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
                <service.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:bg-primary-500 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm">
                {service.description}
              </p>
              <div className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-primary-500 rounded-full shadow-sm shadow-primary-500/40"></div>
                    <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features with Images */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {additionalFeatures.map((feature, index) => (
            <div
              key={index}
              className={`group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/30 to-transparent"></div>
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                  <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow-md">
                    <feature.icon className="w-5 h-5 text-primary-500" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:bg-primary-500 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section with Success Image */}
        <div className="text-center">
          <div className="relative rounded-3xl overflow-hidden w-full aspect-[21/9] max-h-[400px] flex items-center justify-center">
            <div className="absolute inset-0">
              <img
                src="https://images.pexels.com/photos/5212329/pexels-photo-5212329.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Students achieving academic success"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/90 to-primary-700/90 backdrop-blur-[2px]"></div>
            </div>
            <div className="relative p-8 md:p-12 z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {language === 'ar' ? 'جاهز للبدء؟' : language === 'fr' ? 'Prêt à Commencer?' : 'Ready to Get Started?'}
              </h3>
              <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto opacity-90">
                {language === 'ar' ? 'انضم إلى آلاف المدارس وأولياء الأمور الذين يثقون في بيداكونيكت لتحقيق النجاح المؤكد' :
                  language === 'fr' ? 'Rejoignez des milliers d\'écoles et de parents qui font confiance à PedaConnect pour un succès assuré' :
                    'Join thousands of schools and parents who trust PedaConnect for assured success'}
              </p>
              <button
                onClick={onGetStarted}
                className="bg-white text-primary-500 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                {getTranslation('getStarted', language)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
