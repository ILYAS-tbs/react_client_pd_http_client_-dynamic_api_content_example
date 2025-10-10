import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';

export function Contact() {
  const { language, isRTL } = useLanguage();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: 'parent'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formState);
    // Reset form
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
      primary: '+213 21 123 456',
      secondary: language === 'ar' ? 'الأحد - الخميس، 8:00 - 17:00' : 
                language === 'fr' ? 'Dim - Jeu, 8:00 - 17:00' : 
                'Sun - Thu, 8:00 AM - 5:00 PM'
    },
    {
      icon: Mail,
      title: language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'Email' : 'Email',
      primary: 'info@pedaconnect.dz',
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
    <section id="contact" className="py-20 bg-[#edeff3] dark:bg-gray-800">
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
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
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
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
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
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
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
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
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
                    className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 
                                language === 'fr' ? 'Écrivez votre message ici...' : 
                                'Write your message here...'}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#39789b] hover:bg-[#2d5f7d] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <Send className="w-5 h-5" />
                  <span>
                    {language === 'ar' ? 'إرسال الرسالة' : 
                     language === 'fr' ? 'Envoyer le message' : 
                     'Send Message'}
                  </span>
                </button>
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
                    <div className="w-12 h-12 bg-[#39789b]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-[#39789b]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {info.title}
                      </h4>
                      <p className="text-[#39789b] font-medium">
                        {info.primary}
                      </p>
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
                      <MessageCircle className="w-4 h-4 text-[#39789b] mt-1 flex-shrink-0" />
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