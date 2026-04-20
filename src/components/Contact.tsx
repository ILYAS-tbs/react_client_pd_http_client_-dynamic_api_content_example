import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '../lib/platformContacts.ts';

type SubmissionNotice = {
  type: 'success' | 'error';
  message: string;
};

export function Contact() {
  const { language, isRTL } = useLanguage();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: 'parent'
  });
  const [submissionNotice, setSubmissionNotice] = useState<SubmissionNotice | null>(null);

  useEffect(() => {
    if (!submissionNotice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSubmissionNotice(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [submissionNotice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userTypeLabel =
      formState.userType === 'school'
        ? language === 'ar'
          ? 'مدرسة'
          : language === 'fr'
            ? 'École'
            : 'School'
        : formState.userType === 'teacher'
          ? language === 'ar'
            ? 'معلم'
            : language === 'fr'
              ? 'Enseignant'
              : 'Teacher'
          : language === 'ar'
            ? 'ولي أمر'
            : language === 'fr'
              ? 'Parent'
              : 'Parent';

    const subjectText = `[PedaConnect Contact] ${formState.subject}`;
    const bodyText = [
      `${language === 'ar' ? 'الاسم' : language === 'fr' ? 'Nom' : 'Name'}: ${formState.name}`,
      `${language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'Email' : 'Email'}: ${formState.email}`,
      `${language === 'ar' ? 'نوع المستخدم' : language === 'fr' ? 'Type d\'utilisateur' : 'User Type'}: ${userTypeLabel}`,
      '',
      `${language === 'ar' ? 'الرسالة' : language === 'fr' ? 'Message' : 'Message'}:`,
      formState.message,
    ].join('\n');

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
    const openedWindow = window.open(gmailUrl, '_blank', 'noopener,noreferrer');

    if (!openedWindow) {
      setSubmissionNotice({
        type: 'error',
        message:
          language === 'ar'
            ? 'تم حظر فتح Gmail. اسمح بالنوافذ المنبثقة ثم أعد المحاولة.'
            : language === 'fr'
              ? 'L\'ouverture de Gmail a été bloquée. Autorisez les pop-ups puis réessayez.'
              : 'Gmail was blocked from opening. Allow pop-ups and try again.'
      });
      return;
    }

    setSubmissionNotice({
      type: 'success',
      message:
        language === 'ar'
          ? 'تم فتح Gmail في تبويب جديد مع رسالتك الجاهزة.'
          : language === 'fr'
            ? 'Gmail a été ouvert dans un nouvel onglet avec votre message prêt.'
            : 'Gmail opened in a new tab with your message ready.'
    });
    setFormState({
      name: '',
      email: '',
      subject: '',
      message: '',
      userType: 'parent'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: language === 'ar' ? 'الهاتف' : language === 'fr' ? 'Téléphone' : 'Phone',
      primary: CONTACT_PHONE_DISPLAY,
      secondary: language === 'ar' ? 'الأحد - الخميس، 8:00 - 17:00' :
        language === 'fr' ? 'Dim - Jeu, 8:00 - 17:00' :
          'Sun - Thu, 8:00 AM - 5:00 PM'
    },
    {
      icon: Mail,
      title: language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'Email' : 'Email',
      primary: CONTACT_EMAIL,
      secondary: language === 'ar' ? 'نرد خلال 24 ساعة' :
        language === 'fr' ? 'Réponse sous 24h' :
          'We respond within 24 hours'
    },
    {
      icon: MapPin,
      title: language === 'ar' ? 'العنوان' : language === 'fr' ? 'Adresse' : 'Address',
      primary: language === 'ar' ? 'الجزائر العاصمة، الجزائر' :
        language === 'fr' ? 'Alger, Algérie' :
          'Algiers, Algeria',
      secondary: language === 'ar' ? 'شارع الاستقلال، المركز' :
        language === 'fr' ? 'Rue de l\'Indépendance, Centre' :
          'Independence Street, Center'
    }
  ];

  const faqs = [
    {
      question: language === 'ar' ? 'كيف يمكنني إنشاء حساب؟' :
        language === 'fr' ? 'Comment créer un compte?' :
          'How can I create an account?',
      answer: language === 'ar' ? 'أولياء الأمور يمكنهم التسجيل مباشرة. المدارس والمعلمون يحتاجون موافقة إدارية.' :
        language === 'fr' ? 'Les parents peuvent s\'inscrire directement. Les écoles et enseignants nécessitent une approbation administrative.' :
          'Parents can register directly. Schools and teachers need administrative approval.'
    },
    {
      question: language === 'ar' ? 'هل البيانات آمنة؟' :
        language === 'fr' ? 'Les données sont-elles sécurisées?' :
          'Is my data secure?',
      answer: language === 'ar' ? 'نعم، نستخدم أعلى معايير الأمان والتشفير لحماية بياناتكم.' :
        language === 'fr' ? 'Oui, nous utilisons les plus hauts standards de sécurité et de cryptage pour protéger vos données.' :
          'Yes, we use the highest security and encryption standards to protect your data.'
    },
    {
      question: language === 'ar' ? 'ما هي طرق الدفع المقبولة؟' :
        language === 'fr' ? 'Quels sont les modes de paiement acceptés?' :
          'What payment methods are accepted?',
      answer: language === 'ar' ? 'نقبل البطاقات البنكية، الدفع الإلكتروني، والتحويل البنكي.' :
        language === 'fr' ? 'Nous acceptons les cartes bancaires, paiement électronique, et virement bancaire.' :
          'We accept bank cards, electronic payment, and bank transfer.'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-secondary-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {getTranslation('contact', language)}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {language === 'ar' ? 'نحن هنا لمساعدتك. تواصل معنا في أي وقت' :
              language === 'fr' ? 'Nous sommes là pour vous aider. Contactez-nous à tout moment' :
                'We\'re here to help you. Contact us anytime'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
              <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'أرسل لنا رسالة' :
                    language === 'fr' ? 'Envoyez-nous un message' :
                      'Send us a message'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {language === 'ar' ? 'سنرد عليك في أقرب وقت ممكن' :
                    language === 'fr' ? 'Nous vous répondrons dès que possible' :
                      'We\'ll get back to you as soon as possible'}
                </p>
              </div>

              {submissionNotice && (
                <div
                  className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
                    submissionNotice.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                  role="status"
                  aria-live="polite"
                >
                  {submissionNotice.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'الاسم الكامل' :
                        language === 'fr' ? 'Nom complet' :
                          'Full Name'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={language === 'ar' ? 'أدخل اسمك الكامل' :
                        language === 'fr' ? 'Entrez votre nom complet' :
                          'Enter your full name'}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'البريد الإلكتروني' :
                        language === 'fr' ? 'Email' :
                          'Email'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formState.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' :
                        language === 'fr' ? 'Entrez votre email' :
                          'Enter your email'}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'نوع المستخدم' :
                        language === 'fr' ? 'Type d\'utilisateur' :
                          'User Type'}
                    </label>
                    <select
                      name="userType"
                      value={formState.userType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <option value="parent">
                        {language === 'ar' ? 'ولي أمر' : language === 'fr' ? 'Parent' : 'Parent'}
                      </option>
                      <option value="school">
                        {language === 'ar' ? 'مدرسة' : language === 'fr' ? 'École' : 'School'}
                      </option>
                      <option value="teacher">
                        {language === 'ar' ? 'معلم' : language === 'fr' ? 'Enseignant' : 'Teacher'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'الموضوع' :
                        language === 'fr' ? 'Sujet' :
                          'Subject'}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formState.subject}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={language === 'ar' ? 'موضوع رسالتك' :
                        language === 'fr' ? 'Sujet de votre message' :
                          'Subject of your message'}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? 'الرسالة' :
                      language === 'fr' ? 'Message' :
                        'Message'}
                  </label>
                  <textarea
                    name="message"
                    value={formState.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' :
                      language === 'fr' ? 'Écrivez votre message ici...' :
                        'Write your message here...'}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <Send className="w-5 h-5" />
                  <span>
                    {language === 'ar' ? 'إرسال الرسالة' :
                      language === 'fr' ? 'Envoyer le message' :
                        'Send Message'}
                  </span>
                </button>

                <p className={`text-sm text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'أو راسلنا مباشرة على ' : language === 'fr' ? 'Ou écrivez-nous directement à ' : 'Or email us directly at '}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-semibold text-primary-500 hover:text-primary-600"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </form>
            </div>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
              <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                {getTranslation('contactInfo', language)}
              </h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className={`flex items-start space-x-4 rtl:space-x-reverse ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {info.title}
                      </h4>
                      {info.icon === Mail ? (
                        <a
                          href={`mailto:${CONTACT_EMAIL}`}
                          className="text-primary-500 font-medium hover:text-primary-600"
                        >
                          {info.primary}
                        </a>
                      ) : info.icon === Phone ? (
                        <a
                          href={`tel:${CONTACT_PHONE_HREF}`}
                          className="text-primary-500 font-medium hover:text-primary-600"
                        >
                          {info.primary}
                        </a>
                      ) : (
                        <p className="text-primary-500 font-medium">
                          {info.primary}
                        </p>
                      )}
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {info.secondary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
              <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'الأسئلة الشائعة' :
                  language === 'fr' ? 'Questions Fréquentes' :
                    'Frequently Asked Questions'}
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className={`border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-start space-x-2 rtl:space-x-reverse">
                      <MessageCircle className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-6 rtl:pl-0 rtl:pr-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
