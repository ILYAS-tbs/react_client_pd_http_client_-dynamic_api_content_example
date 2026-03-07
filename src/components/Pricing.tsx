
import { Check, Star, Zap } from "lucide-react";
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from "../utils/translations";
import { payment_http_client } from "../services/payment/payment_http_client";

export function Pricing() {
  const { language, isRTL } = useLanguage();

  //! Payment Function ::
  const user = (() => {
    try {
      const raw = localStorage.getItem("schoolParentOrTeacherManagementUser");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
      return null;
    }
  })();
  const user_id = user?.id;

  const pay_func = async (amount: number) => {
    const res = await payment_http_client.chargily_pay(user_id, amount);
    if (res.ok) {
      const data = res.data;
      window.location = data?.checkout_url;
    }
  };

  const plans = [
    {
      id: "monthly",
      name: getTranslation("monthly", language),
      price: "2000",
      period:
        language === "ar"
          ? "شهرياً"
          : language === "fr"
            ? "par mois"
            : "per month",
      description:
        language === "ar"
          ? "للعائلات النشطة - وصول كامل"
          : language === "fr"
            ? "Pour familles actives - accès complet"
            : "For active families - full access",
      features: [
        language === "ar" ? "حتى 5 أطفال" : language === "fr" ? "Jusqu'à 5 enfants" : "Up to 5 children",
        language === "ar" ? "متابعة شاملة وفورية" : language === "fr" ? "Suivi complet et instantané" : "Complete & instant tracking",
        language === "ar" ? "رسائل غير محدودة" : language === "fr" ? "Messages illimités" : "Unlimited messages",
        language === "ar" ? "إشعارات فورية للجوال" : language === "fr" ? "Notifications mobiles instantanées" : "Instant mobile notifications",
        language === "ar" ? "تبرير الغياب إلكترونياً" : language === "fr" ? "Justification d'absence en ligne" : "Online absence justification",
        language === "ar" ? "دعم فني سريع" : language === "fr" ? "Support technique rapide" : "Fast technical support",
      ],
      buttonText: getTranslation("choosePlan", language),
      popular: false,
    },
    {
      id: "quarterly",
      name: getTranslation("quarterly", language),
      price: "4999",
      originalPrice: "6000",
      period:
        language === "ar"
          ? "كل 3 أشهر"
          : language === "fr"
            ? "tous les 3 mois"
            : "every 3 months",
      description:
        language === "ar"
          ? "توفير 17% - الخيار الأمثل"
          : language === "fr"
            ? "Économie 17% - Le meilleur choix"
            : "Save 17% - The best choice",
      features: [
        language === "ar" ? "جميع ميزات الخطة الشهرية" : language === "fr" ? "Toutes les fonctionnalités mensuelles" : "All monthly features",
        language === "ar" ? "تقارير أداء تفصيلية" : language === "fr" ? "Rapports de performance détaillés" : "Detailed performance reports",
        language === "ar" ? "تحليلات أكاديمية متقدمة" : language === "fr" ? "Analyses académiques avancées" : "Advanced academic analytics",
        language === "ar" ? "دعم متقدم 24/7" : language === "fr" ? "Support avancé 24/7" : "Advanced 24/7 support",
        language === "ar" ? "توفير مالي معتبر" : language === "fr" ? "Économies significatives" : "Significant savings",
      ],
      buttonText: getTranslation("choosePlan", language),
      popular: true,
      badge:
        language === "ar" ? "الأكثر توفيراً" : language === "fr" ? "Meilleure Économie" : "Best Value",
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 ${isRTL ? "text-right" : "text-left"}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {getTranslation("pricingTitle", language)}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {getTranslation("pricingSubtitle", language)}
          </p>
          <div className="mt-6 inline-flex items-center bg-secondary-50 dark:bg-gray-800 rounded-full p-1">
            <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === "ar"
                ? "أسعار بالدينار الجزائري (DZD)"
                : language === "fr"
                  ? "Prix en Dinar Algérien (DZD)"
                  : "Prices in Algerian Dinar (DZD)"}
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${plan.popular ? "ring-2 ring-primary-500 scale-105" : ""
                  } ${isRTL ? "text-right" : "text-left"}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-1 rtl:space-x-reverse shadow-lg">
                      <Star className="w-4 h-4" />
                      <span>{getTranslation("popular", language)}</span>
                    </div>
                  </div>
                )}

                {/* Save Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 -right-3 rtl:-right-auto rtl:-left-3">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse">
                      <Zap className="w-3 h-3" />
                      <span>{plan.badge}</span>
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
                      <span className="text-4xl font-bold text-primary-500 dark:text-primary-300">
                        {plan.price}
                      </span>
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        DZD
                      </span>
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          {plan.originalPrice} DZD
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {plan.period}
                    </p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start space-x-3 rtl:space-x-reverse"
                      >
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => pay_func(1000)}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${plan.popular
                      ? "bg-primary-500 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                      }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <div className="bg-secondary-50 dark:bg-gray-800 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {language === "ar"
                    ? "بدون رسوم خفية"
                    : language === "fr"
                      ? "Aucun frais caché"
                      : "No Hidden Fees"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {language === "ar"
                    ? "ما تراه هو ما تدفعه"
                    : language === "fr"
                      ? "Ce que vous voyez est ce que vous payez"
                      : "What you see is what you pay"}
                </p>
              </div>

              <div>
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {language === "ar"
                    ? "ضمان الجودة"
                    : language === "fr"
                      ? "Garantie qualité"
                      : "Quality Guarantee"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {language === "ar"
                    ? "30 يوماً ضمان استرداد المال"
                    : language === "fr"
                      ? "30 jours de garantie de remboursement"
                      : "30-day money-back guarantee"}
                </p>
              </div>

              <div>
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {language === "ar"
                    ? "سهولة الإلغاء"
                    : language === "fr"
                      ? "Annulation facile"
                      : "Easy Cancellation"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {language === "ar"
                    ? "يمكنك الإلغاء في أي وقت"
                    : language === "fr"
                      ? "Annulez à tout moment"
                      : "Cancel anytime"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
