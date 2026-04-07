import { Translations } from "../types";

/**
 * Builds a correct media URL from a value returned by the backend.
 * DRF FileField with request context returns a full absolute URL
 * (e.g. "http://127.0.0.1:8000/media/...").  If somehow only a
 * relative path is returned, serverBaseUrl is prepended so the link
 * still works.
 */
export function getMediaUrl(
  path: string | null | undefined,
  serverBaseUrl: string
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = serverBaseUrl.replace(/\/$/, "");
  const rel  = path.startsWith("/") ? path : "/" + path;
  return base + rel;
}

export const translations: Translations = {
  // Navigation
  home: {
    ar: "الرئيسية",
    en: "Home",
    fr: "Accueil",
  },
  about: {
    ar: "من نحن",
    en: "About Us",
    fr: "À Propos",
  },
  services: {
    ar: "خدماتنا",
    en: "Our Services",
    fr: "Nos Services",
  },
  pricing: {
    ar: "الأسعار",
    en: "Pricing",
    fr: "Tarifs",
  },
  contact: {
    ar: "اتصل بنا",
    en: "Contact",
    fr: "Contact",
  },
  login: {
    ar: "تسجيل الدخول",
    en: "Login",
    fr: "Connexion",
  },
  register: {
    ar: "إنشاء حساب",
    en: "Sign Up",
    fr: "S'inscrire",
  },

  // Hero Section
  heroSlogan: {
    ar: "تعليم متابع نجاح مؤكد",
    en: "Continuous Education, Assured Success",
    fr: "Éducation Continue, Succès Assuré",
  },
  heroDescription: {
    ar: "منصة رقمية متقدمة تربط المدارس الجزائرية والمعلمين وأولياء الأمور في نظام تعليمي موحد يضمن التواصل الفعال والشفافية الكاملة",
    en: "An advanced digital platform connecting Algerian schools, teachers, and parents in a unified educational ecosystem ensuring effective communication and complete transparency",
    fr: "Une plateforme numérique avancée reliant les écoles algériennes, les enseignants et les parents dans un écosystème éducatif unifié garantissant une communication efficace et une transparence totale",
  },
  getStarted: {
    ar: "ابدأ الآن",
    en: "Get Started",
    fr: "Commencer",
  },
  learnMore: {
    ar: "اعرف أكثر",
    en: "Learn More",
    fr: "En Savoir Plus",
  },

  // About Section
  aboutTitle: {
    ar: "من نحن",
    en: "About Us",
    fr: "À Propos de Nous",
  },
  aboutDescription: {
    ar: "PedaConnect هي منصة رائدة مصممة خصيصاً للنظام التعليمي الجزائري، تهدف إلى ربط المدارس العامة والخاصة مع المعلمين وأولياء الأمور لضمان بيئة تعليمية متكاملة وشفافة",
    en: "PedaConnect is a leading platform designed specifically for the Algerian educational system, aiming to connect public and private schools with teachers and parents to ensure an integrated and transparent educational environment",
    fr: "PedaConnect est une plateforme leader conçue spécifiquement pour le système éducatif algérien, visant à connecter les écoles publiques et privées avec les enseignants et les parents pour assurer un environnement éducatif intégré et transparent",
  },
  mission: {
    ar: "مهمتنا",
    en: "Our Mission",
    fr: "Notre Mission",
  },
  missionText: {
    ar: "تحسين جودة التعليم في الجزائر من خلال التكنولوجيا المتقدمة والتواصل الفعال",
    en: "Improving education quality in Algeria through advanced technology and effective communication",
    fr: "Améliorer la qualité de l'éducation en Algérie grâce à une technologie avancée et une communication efficace",
  },
  vision: {
    ar: "رؤيتنا",
    en: "Our Vision",
    fr: "Notre Vision",
  },
  visionText: {
    ar: "أن نكون المنصة الرائدة في إدارة المدارس الجزائرية رقمياً",
    en: "To be the leading platform in digital management of Algerian schools",
    fr: "Être la plateforme leader dans la gestion numérique des écoles algériennes",
  },

  // Services Section
  servicesTitle: {
    ar: "خدماتنا",
    en: "Our Services",
    fr: "Nos Services",
  },
  schoolManagement: {
    ar: "إدارة المدرسة",
    en: "School Management",
    fr: "Gestion Scolaire",
  },
  schoolManagementDesc: {
    ar: "أدوات إدارية شاملة للمدراء والمعلمين لإدارة الطلاب والدرجات والحضور",
    en: "Comprehensive administrative tools for principals and teachers to manage students, grades, and attendance",
    fr: "Outils administratifs complets pour les directeurs et enseignants pour gérer les élèves, notes et présence",
  },
  parentAccess: {
    ar: "وصول أولياء الأمور",
    en: "Parent Access",
    fr: "Accès Parents",
  },
  parentAccessDesc: {
    ar: "متابعة مستمرة لأداء الأطفال الأكاديمي والتواصل المباشر مع المعلمين",
    en: "Continuous monitoring of children's academic performance and direct communication with teachers",
    fr: "Suivi continu des performances académiques des enfants et communication directe avec les enseignants",
  },
  teacherTools: {
    ar: "أدوات المعلمين",
    en: "Teacher Tools",
    fr: "Outils Enseignants",
  },
  teacherToolsDesc: {
    ar: "منصة متكاملة لإدارة المواد التعليمية والدرجات والتواصل مع الطلاب وأولياء الأمور",
    en: "Integrated platform for managing educational materials, grades, and communicating with students and parents",
    fr: "Plateforme intégrée pour gérer le matériel pédagogique, les notes et communiquer avec les élèves et parents",
  },
  communication: {
    ar: "التواصل الآمن",
    en: "Secure Communication",
    fr: "Communication Sécurisée",
  },
  communicationDesc: {
    ar: "نظام رسائل آمن ومباشر بين جميع أطراف العملية التعليمية مع إشعارات فورية",
    en: "Secure and direct messaging system between all educational stakeholders with instant notifications",
    fr: "Système de messagerie sécurisé et direct entre tous les acteurs éducatifs avec notifications instantanées",
  },

  // Pricing Section
  pricingTitle: {
    ar: "خطط الأسعار",
    en: "Pricing Plans",
    fr: "Plans Tarifaires",
  },
  pricingSubtitle: {
    ar: "اختر الخطة المناسبة لاحتياجاتك",
    en: "Choose the plan that fits your needs",
    fr: "Choisissez le plan qui correspond à vos besoins",
  },
  monthly: {
    ar: "شهرياً",
    en: "Monthly",
    fr: "Mensuel",
  },
  quarterly: {
    ar: "فصلياً",
    en: "Quarterly",
    fr: "Trimestriel",
  },
  popular: {
    ar: "الأكثر شعبية",
    en: "Most Popular",
    fr: "Le Plus Populaire",
  },
  choosePlan: {
    ar: "اختر هذه الخطة",
    en: "Choose Plan",
    fr: "Choisir le Plan",
  },

  // Authentication
  signIn: {
    ar: "تسجيل الدخول",
    en: "Sign In",
    fr: "Se Connecter",
  },
  signUp: {
    ar: "إنشاء حساب",
    en: "Sign Up",
    fr: "S'inscrire",
  },
  email: {
    ar: "البريد الإلكتروني",
    en: "Email",
    fr: "Email",
  },
  password: {
    ar: "كلمة المرور",
    en: "Password",
    fr: "Mot de passe",
  },
  confirmPassword: {
    ar: "تأكيد كلمة المرور",
    en: "Confirm Password",
    fr: "Confirmer le mot de passe",
  },
  fullName: {
    ar: "الاسم الكامل",
    en: "Full Name",
    fr: "Nom Complet",
  },
  phoneNumber: {
    ar: "رقم الهاتف",
    en: "Phone Number",
    fr: "Numéro de Téléphone",
  },
  selectRole: {
    ar: "اختر نوع الحساب",
    en: "Select Account Type",
    fr: "Sélectionner le Type de Compte",
  },
  parent: {
    ar: "ولي أمر",
    en: "Parent",
    fr: "Parent",
  },
  schoolAdmin: {
    ar: "إدارة مدرسة",
    en: "School Admin",
    fr: "Administration Scolaire",
  },
  teacher: {
    ar: "معلم",
    en: "Teacher",
    fr: "Enseignant",
  },
  schoolName: {
    ar: "اسم المدرسة",
    en: "School Name",
    fr: "Nom de l'École",
  },
  schoolNamePlaceholder: {
    ar: "مثل: مدرسة الأمل الابتدائية",
    en: "e.g., Al Amal Primary School",
    fr: "ex. : École Primaire Al Amal",
  },
  fullNamePlaceholder: {
    ar: "مثل: محمد علي",
    en: "e.g., Mohammed Ali",
    fr: "ex. : Mohammed Ali",
  },
  emailPlaceholder: {
    ar: "مثل: example@email.dz",
    en: "e.g., example@email.dz",
    fr: "ex. : example@email.dz",
  },
  schoolType: {
    ar: "نوع المدرسة",
    en: "School Type",
    fr: "Type d'École",
  },
  publicSchool: {
    ar: "مدرسة حكومية",
    en: "Public School",
    fr: "École Publique",
  },
  privateSchool: {
    ar: "مدرسة خاصة",
    en: "Private School",
    fr: "École Privée",
  },
  numberOfChildren: {
    ar: "عدد الأطفال",
    en: "Number of Children",
    fr: "Nombre d'Enfants",
  },
  childFullName: {
    ar: "الاسم الكامل للطفل",
    en: "Child's Full Name",
    fr: "Nom Complet de l'Enfant",
  },
  dateOfBirth: {
    ar: "تاريخ الميلاد",
    en: "Date of Birth",
    fr: "Date de Naissance",
  },
  selectSchool: {
    ar: "اختر المدرسة",
    en: "Select School",
    fr: "Sélectionner l'École",
  },
  selectGrade: {
    ar: "اختر الصف",
    en: "Select Grade",
    fr: "Sélectionner le Niveau",
  },
  alreadyHaveAccount: {
    ar: "لديك حساب بالفعل؟",
    en: "Already have an account?",
    fr: "Vous avez déjà un compte?",
  },
  dontHaveAccount: {
    ar: "ليس لديك حساب؟",
    en: "Don't have an account?",
    fr: "Vous n'avez pas de compte?",
  },
  forgotPassword: {
    ar: "نسيت كلمة المرور؟",
    en: "Forgot Password?",
    fr: "Mot de passe oublié?",
  },
  rememberMe: {
    ar: "تذكرني",
    en: "Remember Me",
    fr: "Se souvenir de moi",
  },
  dataLoadError: {
    ar: "فشل تحميل البيانات",
    en: "Failed to load data",
    fr: "Échec du chargement des données",
  },
  grade1: {
    ar: "السنة الأولى ابتدائي",
    en: "1st Grade Primary",
    fr: "1ère Année Primaire",
  },
  grade2: {
    ar: "السنة الثانية ابتدائي",
    en: "2nd Grade Primary",
    fr: "2ème Année Primaire",
  },
  grade3: {
    ar: "السنة الثالثة ابتدائي",
    en: "3rd Grade Primary",
    fr: "3ème Année Primaire",
  },
  grade4: {
    ar: "السنة الرابعة ابتدائي",
    en: "4th Grade Primary",
    fr: "4ème Année Primaire",
  },
  grade5: {
    ar: "السنة الخامسة ابتدائي",
    en: "5th Grade Primary",
    fr: "5ème Année Primaire",
  },
  middle1: {
    ar: "السنة الأولى متوسط",
    en: "1st Year Middle",
    fr: "1ère Année Collège",
  },
  middle2: {
    ar: "السنة الثانية متوسط",
    en: "2nd Year Middle",
    fr: "2ème Année Collège",
  },
  middle3: {
    ar: "السنة الثالثة متوسط",
    en: "3rd Year Middle",
    fr: "3ème Année Collège",
  },
  middle4: {
    ar: "السنة الرابعة متوسط",
    en: "4th Year Middle",
    fr: "4ème Année Collège",
  },
  high1: {
    ar: "السنة الأولى ثانوي",
    en: "1st Year High",
    fr: "1ère Année Lycée",
  },
  high2: {
    ar: "السنة الثانية ثانوي",
    en: "2nd Year High",
    fr: "2ème Année Lycée",
  },
  high3: {
    ar: "السنة الثالثة ثانوي",
    en: "3rd Year High",
    fr: "3ème Année Lycée",
  },
  passwordMismatch: {
    ar: "كلمات المرور غير متطابقة",
    en: "Passwords do not match",
    fr: "Les mots de passe ne correspondent pas",
  },
  invalidPhone: {
    ar: "رقم الهاتف غير صالح",
    en: "Invalid phone number",
    fr: "Numéro de téléphone invalide",
  },
  incompleteChildData: {
    ar: "بيانات الطفل غير مكتملة",
    en: "Incomplete child data",
    fr: "Données de l'enfant incomplètes",
  },
  username: {
    ar: "اسم المستخدم",
    en: "Username",
    fr: "Nom d'utilisateur",
  },
  wilaya: {
    ar: "الولاية",
    en: "Wilaya",
    fr: "Wilaya",
  },
  selectWilaya: {
    ar: "اختر الولاية",
    en: "Select Wilaya",
    fr: "Sélectionner la Wilaya",
  },
  commune: {
    ar: "البلدية",
    en: "Commune",
    fr: "Commune",
  },
  selectCommune: {
    ar: "اختر البلدية",
    en: "Select Commune",
    fr: "Sélectionner la Commune",
  },
  schoolLevel: {
    ar: "المستوى الدراسي",
    en: "School Level",
    fr: "Niveau Scolaire",
  },
  primarySchool: {
    ar: "المدرسة الابتدائية",
    en: "Primary School",
    fr: "École Primaire",
  },
  middleSchool: {
    ar: "المدرسة المتوسطة",
    en: "Middle School",
    fr: "Collège",
  },
  highSchool: {
    ar: "المدرسة الثانوية",
    en: "High School",
    fr: "Lycée",
  },
  registrationSuccess: {
    ar: "تم التسجيل بنجاح!",
    en: "Successfully signed up!",
    fr: "Inscription réussie !",
  },
  registrationFailed: {
    ar: "فشل التسجيل",
    en: "Registration failed",
    fr: "Échec de l'inscription",
  },
  loading: {
    ar: "جار التحميل...",
    en: "Loading...",
    fr: "Chargement...",
  },

  // School Dashboard
  dashboard: {
    ar: "لوحة التحكم",
    en: "Dashboard",
    fr: "Tableau de Bord",
  },
  welcome: {
    ar: "مرحباً بك",
    en: "Welcome",
    fr: "Bienvenue",
  },
  totalStudents: {
    ar: "إجمالي الطلاب",
    en: "Total Students",
    fr: "Total des Élèves",
  },
  teachers: {
    ar: "المعلمون",
    en: "Teachers",
    fr: "Enseignants",
  },
  classCount: {
    ar: "الفصول",
    en: "Classes",
    fr: "Classes",
  },
  attendance: {
    ar: "الحضور اليومي",
    en: "Daily Attendance",
    fr: "Présence Quotidienne",
  },
  recentActivity: {
    ar: "الأنشطة الأخيرة",
    en: "Recent Activity",
    fr: "Activité Récente",
  },
  monthlyStats: {
    ar: "الإحصائيات الشهرية",
    en: "Monthly Statistics",
    fr: "Statistiques Mensuelles",
  },
  newStudents: {
    ar: "طلاب جدد",
    en: "New Students",
    fr: "Nouveaux Élèves",
  },
  attendanceRate: {
    ar: "معدل الحضور",
    en: "Attendance Rate",
    fr: "Taux de Présence",
  },
  announcements: {
    ar: "الإعلانات المنشورة",
    en: "Announcements Posted",
    fr: "Annonces Publiées",
  },
  absenceRequests: {
    ar: "طلبات الغياب المراجعة",
    en: "Absence Requests Reviewed",
    fr: "Demandes d'Absence Examinées",
  },
  users: {
    ar: "إدارة المستخدمين",
    en: "User Management",
    fr: "Gestion des Utilisateurs",
  },
  levels: {
    ar: "إدارة الصفوف",
    en: "Class Management",
    fr: "Gestion des Classes",
  },
  schedules: {
    ar: "جداول توقيت",
    en: "Schedules",
    fr: "Horaires",
  },
  exams: {
    ar: "رزنامة الامتحانات",
    en: "Exam Schedule",
    fr: "Calendrier des Examens",
  },
  reports: {
    ar: "تقارير",
    en: "Reports",
    fr: "Rapports",
  },
  grades: {
    ar: "المعدل الفصلي",
    en: "Semester Grades",
    fr: "Notes Semestrielles",
  },
  activities: {
    ar: "فعاليات",
    en: "Activities",
    fr: "Activités",
  },
  behaviorReports: {
    ar: "تقارير السلوك",
    en: "Behavior Reports",
    fr: "Rapports de Comportement",
  },
  underDevelopment: {
    ar: "هذه الصفحة قيد التطوير",
    en: "This page is under development",
    fr: "Cette page est en cours de développement",
  },

  // Schedule Management
  scheduleManagement: {
    ar: "إدارة الجداول",
    en: "Schedule Management",
    fr: "Gestion des Horaires",
  },
  addSchedule: {
    ar: "إضافة جدول",
    en: "Add Schedule",
    fr: "Ajouter un Horaire",
  },
  editSchedule: {
    ar: "تعديل الجدول",
    en: "Edit Schedule",
    fr: "Modifier l'Horaire",
  },
  updateSchedule: {
    ar: "تحديث",
    en: "Update",
    fr: "Mettre à Jour",
  },
  deleteSchedule: {
    ar: "حذف",
    en: "Delete",
    fr: "Supprimer",
  },
  searchSchedule: {
    ar: "البحث عن الفصل أو المعلم أو المادة...",
    en: "Search for class, teacher, or subject...",
    fr: "Rechercher une classe, un enseignant ou une matière...",
  },
  all: {
    ar: "الكل",
    en: "All",
    fr: "Tous",
  },
  classesFilter: {
    ar: "الفصول",
    en: "Classes",
    fr: "Classes",
  },
  teachersFilter: {
    ar: "المعلمون",
    en: "Teachers",
    fr: "Enseignants",
  },
  className: {
    ar: "اسم الفصل",
    en: "Class Name",
    fr: "Nom de la Classe",
  },
  uploadStatus: {
    ar: "حالة الرفع",
    en: "Upload Status",
    fr: "Statut du Téléchargement",
  },
  uploaded: {
    ar: "تم الرفع",
    en: "Uploaded",
    fr: "Téléchargé",
  },
  notUploaded: {
    ar: "لم يتم الرفع",
    en: "Not Uploaded",
    fr: "Non Téléchargé",
  },
  uploadDate: {
    ar: "تاريخ الرفع",
    en: "Upload Date",
    fr: "Date de Téléchargement",
  },
  actions: {
    ar: "الإجراءات",
    en: "Actions",
    fr: "Actions",
  },
  view: {
    ar: "عرض",
    en: "View",
    fr: "Voir",
  },
  upload: {
    ar: "رفع",
    en: "Upload",
    fr: "Télécharger",
  },
  cancel: {
    ar: "إلغاء",
    en: "Cancel",
    fr: "Annuler",
  },

  // Missing Pricing Keys
  dzdPrices: {
    ar: "أسعار بالدينار الجزائري (DZD)",
    en: "Prices in Algerian Dinar (DZD)",
    fr: "Prix en Dinar Algérien (DZD)",
  },
  noHiddenFees: {
    ar: "بدون رسوم خفية",
    en: "No Hidden Fees",
    fr: "Aucun frais caché",
  },
  whatYouSee: {
    ar: "ما تراه هو ما تدفعه",
    en: "What you see is what you pay",
    fr: "Ce que vous voyez est ce que vous payez",
  },
  qualityGuarantee: {
    ar: "ضمان الجودة",
    en: "Quality Guarantee",
    fr: "Garantie qualité",
  },
  thirtyDayMoneyBack: {
    ar: "30 يوماً ضمان استرداد المال",
    en: "30-day money-back guarantee",
    fr: "30 jours de garantie de remboursement",
  },
  easyCancellation: {
    ar: "سهولة الإلغاء",
    en: "Easy Cancellation",
    fr: "Annulation facile",
  },
  cancelAnytime: {
    ar: "يمكنك الإلغاء في أي وقت",
    en: "Cancel anytime",
    fr: "Annulez à tout moment",
  },

  // Missing Services Keys
  readyToStart: {
    ar: "جاهز للبدء؟",
    en: "Ready to Get Started?",
    fr: "Prêt à Commencer ?",
  },
  joinThousands: {
    ar: "انضم إلى آلاف المدارس وأولياء الأمور الذين يثقون في بيداكونيكت لتحقيق النجاح المؤكد",
    en: "Join thousands of schools and parents who trust PedaConnect for assured success",
    fr: "Rejoignez des milliers d'écoles et de parents qui font confiance à PedaConnect pour un succès assuré",
  },
  achievementsInNumbers: {
    ar: "إنجازاتنا في أرقام",
    en: "Our Achievements in Numbers",
    fr: "Nos Réalisations en Chiffres",
  },
  realResults: {
    ar: "نتائج حقيقية تؤكد نجاح منصتنا",
    en: "Real results confirming our platform's success",
    fr: "Résultats réels confirmant le succès de notre plateforme",
  },
  registeredSchools: {
    ar: "مدرسة مسجلة",
    en: "Registered Schools",
    fr: "Écoles Inscrites",
  },
  activeParents: {
    ar: "ولي أمر نشط",
    en: "Active Parents",
    fr: "Parents Actifs",
  },
  connectedTeachers: {
    ar: "معلم متصل",
    en: "Connected Teachers",
    fr: "Enseignants Connectés",
  },
  userSatisfaction: {
    ar: "رضا المستخدمين",
    en: "User Satisfaction",
    fr: "Satisfaction Utilisateurs",
  },
  advancedAnalytics: {
    ar: "تحليلات متقدمة",
    en: "Advanced Analytics",
    fr: "Analyses Avancées",
  },
  advancedAnalyticsDesc: {
    ar: "تقارير شاملة وإحصائيات مفصلة لتتبع الأداء",
    en: "Comprehensive reports and detailed statistics to track performance",
    fr: "Rapports complets et statistiques détaillées pour suivre les performances",
  },
  documentManagement: {
    ar: "إدارة الوثائق",
    en: "Document Management",
    fr: "Gestion des Documents",
  },
  documentManagementDesc: {
    ar: "تنظيم وأرشفة جميع الوثائق الأكاديمية والإدارية",
    en: "Organization and archiving of all academic and administrative documents",
    fr: "Organisation et archivage de tous les documents académiques et administratifs",
  },
  smartScheduling: {
    ar: "جدولة ذكية",
    en: "Smart Scheduling",
    fr: "Planification Intelligente",
  },
  smartSchedulingDesc: {
    ar: "نظام جدولة متطور للحصص والأنشطة المدرسية",
    en: "Advanced scheduling system for classes and school activities",
    fr: "Système de planification avancé pour les cours et activités scolaires",
  },
  advancedSecurity: {
    ar: "أمان متقدم",
    en: "Advanced Security",
    fr: "Sécurité Avancée",
  },
  advancedSecurityDesc: {
    ar: "حماية شاملة للبيانات مع أعلى معايير الأمان",
    en: "Comprehensive data protection with highest security standards",
    fr: "Protection complète des données avec les plus hauts standards de sécurité",
  },

  // Missing About Keys
  advancedEducation: {
    ar: "تعليم متطور",
    en: "Advanced Education",
    fr: "Éducation Avancée",
  },
  advancedEducationDesc: {
    ar: "منصة تعليمية حديثة تواكب أحدث التطورات التكنولوجية",
    en: "Modern educational platform following the latest technological developments",
    fr: "Plateforme éducative moderne suivant les dernières évolutions technologiques",
  },
  effectiveCommunication: {
    ar: "تواصل فعال",
    en: "Effective Communication",
    fr: "Communication Efficace",
  },
  effectiveCommunicationDesc: {
    ar: "ربط مباشر بين المدارس والمعلمين وأولياء الأمور",
    en: "Direct connection between schools, teachers and parents",
    fr: "Connexion directe entre écoles, enseignants et parents",
  },
  completeTracking: {
    ar: "متابعة شاملة",
    en: "Complete Tracking",
    fr: "Suivi Complet",
  },
  completeTrackingDesc: {
    ar: "متابعة شاملة ومفصلة لأداء الطلاب الأكاديمي",
    en: "Comprehensive and detailed tracking of student academic performance",
    fr: "Suivi complet et détaillé des performances académiques des élèves",
  },
  guaranteedResults: {
    ar: "نتائج مضمونة",
    en: "Guaranteed Results",
    fr: "Résultats Garantis",
  },
  guaranteedResultsDesc: {
    ar: "تحسين ملحوظ في الأداء الأكاديمي ومشاركة أولياء الأمور",
    en: "Notable improvement in academic performance and parent engagement",
    fr: "Amélioration notable des performances académiques et de l'engagement des parents",
  },
  time: {
    ar: "الوقت",
    en: "Time",
    fr: "Heure",
  },

  // Footer
  footerDescription: {
    ar: "منصة PedaConnect - نحو تعليم رقمي متطور في الجزائر",
    en: "PedaConnect Platform - Towards Advanced Digital Education in Algeria",
    fr: "Plateforme PedaConnect - Vers une Éducation Numérique Avancée en Algérie",
  },
  quickLinks: {
    ar: "روابط سريعة",
    en: "Quick Links",
    fr: "Liens Rapides",
  },
  contactInfo: {
    ar: "معلومات الاتصال",
    en: "Contact Information",
    fr: "Informations de Contact",
  },
  followUs: {
    ar: "تابعنا",
    en: "Follow Us",
    fr: "Suivez-nous",
  },
  allRightsReserved: {
    ar: "جميع الحقوق محفوظة",
    en: "All rights reserved",
    fr: "Tous droits réservés",
  },
  incompleteCode: {
    ar: "يرجى إدخال الرمز المكون من 6 أرقام كاملاً",
    en: "Please enter the complete 6-digit code",
    fr: "Veuillez entrer le code complet à 6 chiffres",
  },
  emailConfirmed: {
    ar: "تم تأكيد البريد الإلكتروني بنجاح!",
    en: "Email confirmed successfully!",
    fr: "Email confirmé avec succès !",
  },
  invalidCode: {
    ar: "رمز غير صحيح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.",
    en: "Invalid or expired code. Please try again.",
    fr: "Code invalide ou expiré. Veuillez réessayer.",
  },
  codeResent: {
    ar: "تم إرسال رمز تأكيد جديد إلى بريدك الإلكتروني",
    en: "A new confirmation code has been sent to your email",
    fr: "Un nouveau code de confirmation a été envoyé à votre email",
  },
  resendFailed: {
    ar: "فشل إرسال الرمز. يرجى المحاولة مرة أخرى.",
    en: "Failed to resend code. Please try again.",
    fr: "Échec de l'envoi du code. Veuillez réessayer.",
  },
  confirmEmail: {
    ar: "تأكيد البريد الإلكتروني",
    en: "Confirm Email",
    fr: "Confirmer l'email",
  },
  confirmEmailSlogan: {
    ar: "تحقق من حسابك",
    en: "Verify your account",
    fr: "Vérifiez votre compte",
  },
  checkYourEmail: {
    ar: "تحقق من بريدك الإلكتروني",
    en: "Check your email",
    fr: "Vérifiez votre boîte de réception",
  },
  confirmationCodeSent: {
    ar: "لقد أرسلنا رمز تأكيد مكون من 6 أرقام إلى",
    en: "We have sent a 6-digit confirmation code to",
    fr: "Nous avons envoyé un code de confirmation à 6 chiffres à",
  },
  enterConfirmationCode: {
    ar: "أدخل رمز التأكيد",
    en: "Enter confirmation code",
    fr: "Entrez le code de confirmation",
  },
  resendCodeIn: {
    ar: "إعادة إرسال الرمز خلال",
    en: "Resend code in",
    fr: "Renvoyer le code dans",
  },
  resending: {
    ar: "جاري الإرسال...",
    en: "Resending...",
    fr: "Envoi en cours...",
  },
  resendCode: {
    ar: "إعادة إرسال الرمز",
    en: "Resend code",
    fr: "Renvoyer le code",
  },
  verifying: {
    ar: "جاري التحقق...",
    en: "Verifying...",
    fr: "Vérification en cours...",
  },
  verifyCode: {
    ar: "تأكيد الرمز",
    en: "Verify code",
    fr: "Vérifier le code",
  },
  wrongEmail: {
    ar: "بريد إلكتروني خاطئ؟",
    en: "Wrong email?",
    fr: "Mauvais email ?",
  },
  //?: My translations :

  //! SchoolDashboard :
  // General / Layout
  UnderDevelopment: {
    ar: "هذه الصفحة قيد التطوير.",
    en: "This page is under development.",
    fr: "Cette page est en cours de développement.",
  },
  SchoolDashboard: {
    ar: "لوحة تحكم المدرسة",
    en: "School Dashboard",
    fr: "Tableau de bord de l'école",
  },
  WelcomeSubtitle: {
    ar: "مرحباً بك في نظام إدارة مدرسة  ",
    en: "Welcome to  School Management System",
    fr: "Bienvenue dans le système de gestion de l'école",
  },
  PageNotFound: {
    ar: "صفحة غير موجودة",
    en: "Page not found",
    fr: "Page non trouvée",
  },

  // Stats
  TotalStudents: {
    ar: "إجمالي الطلاب",
    en: "Total Students",
    fr: "Nombre total d'élèves",
  },
  Teachers: { ar: "المعلمون", en: "Teachers", fr: "Enseignants" },
  Classes: { ar: "الفصول", en: "Classes", fr: "Classes" },
  TotalAbsences: {
    ar: "اجمالي الغيابات",
    en: "Total Absences",
    fr: "Total des absences",
  },
  NewStudents: { ar: "طلاب جدد", en: "New Students", fr: "Nouveaux élèves" },
  AttendanceRate: {
    ar: "معدل الحضور",
    en: "Attendance Rate",
    fr: "Taux de présence",
  },
  PublishedAnnouncements: {
    ar: "الإعلانات المنشورة",
    en: "Published Announcements",
    fr: "Annonces publiées",
  },
  ReviewedAbsenceRequests: {
    ar: "طلبات الغياب المراجعة",
    en: "Reviewed Absence Requests",
    fr: "Demandes d'absence examinées",
  },

  // Tabs / Menu
  Home: { ar: "الرئيسية", en: "Home", fr: "Accueil" },
  UserManagement: {
    ar: "إدارة المستخدمين",
    en: "User Management",
    fr: "Gestion des utilisateurs",
  },
  ClassManagement: {
    ar: "إدارة الصفوف",
    en: "Class Management",
    fr: "Gestion des classes",
  },
  ScheduleManagement: {
    ar: "جداول توقيت",
    en: "Time Schedules",
    fr: "Emplois du temps",
  },
  ExamSchedule: {
    ar: "رزنامة الامتحانات",
    en: "Exam Schedule",
    fr: "Calendrier des examens",
  },
  Reports: { ar: "تقارير", en: "Reports", fr: "Rapports" },
  GradeOverview: {
    ar: "المعدل الفصلي",
    en: "Grade Overview",
    fr: "Vue des notes",
  },
  Activities: { ar: "فعاليات", en: "Activities", fr: "Activités" },
  // Notifications (examples, dynamic keys can be added)
  NewStudentRegistered: {
    ar: "تم تسجيل طالب جديد",
    en: "New student registered",
    fr: "Nouvel élève inscrit",
  },
  LeaveRequestSent: {
    ar: "طلب إجازة مرسل",
    en: "Leave request sent",
    fr: "Demande de congé envoyée",
  },
  NewAnnouncement: {
    ar: "إعلان جديد",
    en: "New announcement",
    fr: "Nouvelle annonce",
  },

  // Difficulty example (already exists in your format)
  Easy: { ar: "سهل", en: "Easy", fr: "Facile" },
  Medium: { ar: "متوسط", en: "Medium", fr: "Moyen" },
  Difficult: { ar: "صعب", en: "Difficult", fr: "Difficile" },

  //*: StudentManagement.tsx
  studentManagement: {
    ar: "إدارة الطلاب",
    en: "Student Management",
    fr: "Gestion des élèves",
  },
  addStudent: {
    ar: "إضافة طالب",
    en: "Add Student",
    fr: "Ajouter un élève",
  },
  searchStudentsOrParents: {
    ar: "البحث عن الطلاب أو الأولياء...",
    en: "Search for students or parents...",
    fr: "Rechercher des élèves ou des parents...",
  },
  updateStudent: {
    ar: "تحديث معلومات الطالب",
    en: "Update Student Information",
    fr: "Mettre à jour les informations de l’élève",
  },
  studentName: {
    ar: "اسم الطالب",
    en: "Student Name",
    fr: "Nom de l’élève",
  },
  class: {
    ar: "الصف",
    en: "Class",
    fr: "Classe",
  },
  parentName: {
    ar: "اسم ولي الأمر",
    en: "Parent Name",
    fr: "Nom du parent",
  },
  selectClassPlaceholder: {
    ar: "اختر الصف",
    en: "Select Class",
    fr: "Sélectionner la classe",
  },

  add: {
    ar: "إضافة",
    en: "Add",
    fr: "Ajouter",
  },
  update: {
    ar: "تحديث",
    en: "Update",
    fr: "Mettre à jour",
  },
  trimesterGrade: {
    ar: "معدل الفصل الدراسي",
    en: "Trimester Grade",
    fr: "Moyenne du trimestre",
  },
  student: {
    ar: "الطالب",
    en: "Student",
    fr: "Élève",
  },
  age: {
    ar: "العمر",
    en: "Age",
    fr: "Âge",
  },

  grade: {
    ar: "المعدل",
    en: "Grade",
    fr: "Moyenne",
  },
  absences: {
    ar: "عدد الغيابات",
    en: "Absences",
    fr: "Absences",
  },

  years: {
    ar: "سنة",
    en: "years",
    fr: "ans",
  },
  errorSelectClass: {
    ar: "يرجى اختيار فصل للطالب",
    en: "Please select a class for the student",
    fr: "Veuillez sélectionner une classe pour l’élève",
  },
  errorUnexpected: {
    ar: "حدث خطأ متوقع، يرجى التحقق من البيانات التي أدخلتها ثم المحاولة لاحقًا أو التواصل معنا",
    en: "An unexpected error occurred. Please check the data you entered and try again later, or contact us.",
    fr: "Une erreur inattendue s’est produite. Veuillez vérifier les données saisies et réessayer plus tard, ou nous contacter.",
  },
  addNewStudent: {
    ar: "إضافة طالب جديد",
    en: "Add New Student",
    fr: "Ajouter un nouvel élève",
  },

  //?: TeacherManagement.tsx
  teacherManagement: {
    ar: "إدارة المعلمين",
    en: "Teacher Management",
    fr: "Gestion des enseignants",
  },
  addTeacher: {
    ar: "إضافة معلم",
    en: "Add Teacher",
    fr: "Ajouter un enseignant",
  },
  searchTeachers: {
    ar: "البحث عن المعلمين...",
    en: "Search for teachers...",
    fr: "Rechercher des enseignants...",
  },
  active: {
    ar: "نشط",
    en: "Active",
    fr: "Actif",
  },
  inactive: {
    ar: "معطل",
    en: "Inactive",
    fr: "Inactif",
  },
  experience: {
    ar: "الخبرة",
    en: "Experience",
    fr: "Expérience",
  },
  suspend: {
    ar: "تعليق",
    en: "Suspend",
    fr: "Suspendre",
  },
  activate: {
    ar: "تفعيل",
    en: "Activate",
    fr: "Activer",
  },
  //? ParentManagement :
  parentManagement: {
    ar: "إدارة أولياء الأمور",
    en: "Parent Management",
    fr: "Gestion des parents",
  },
  addParent: {
    ar: "إضافة ولي أمر",
    en: "Add Parent",
    fr: "Ajouter un parent",
  },
  searchParentsStudentsOrEmail: {
    ar: "البحث عن أولياء الأمور أو الطلاب أو البريد الإلكتروني...",
    en: "Search for parents, students, or email...",
    fr: "Rechercher des parents, des élèves ou un e-mail...",
  },
  children: {
    ar: "الأبناء",
    en: "Children",
    fr: "Enfants",
  },
  //?: ClassesManagement ::
  classManagement: {
    ar: "إدارة الصفوف",
    en: "Class Management",
    fr: "Gestion des classes",
  },
  attendanceStatus: {
    ar: "حالة الحضور",
    en: "Attendance Status",
    fr: "Statut de présence",
  },
  addClass: {
    ar: "إضافة صف",
    en: "Add Class",
    fr: "Ajouter une classe",
  },
  searchClassesOrStudentsCount: {
    ar: "البحث عن الصفوف أو عدد الطلاب...",
    en: "Search for classes or number of students...",
    fr: "Rechercher des classes ou le nombre d’élèves...",
  },
  name: {
    ar: "الاسم",
    en: "Name",
    fr: "Nom",
  },
  studentsCount: {
    ar: "عدد الطلاب",
    en: "Number of Students",
    fr: "Nombre d’élèves",
  },
  teachersList: {
    ar: "قائمة المعلمين",
    en: "Teachers List",
    fr: "Liste des enseignants",
  },
  //? : ScheduleManagement ::
  schedulesManagement: {
    ar: "إدارة الجداول",
    en: "Schedule Management",
    fr: "Gestion des emplois du temps",
  },
  searchClass: {
    ar: "البحث عن الفصل...",
    en: "Search for class...",
    fr: "Rechercher une classe...",
  },
  classSchedule: {
    ar: "جدول الفصول",
    en: "Class Schedule",
    fr: "Emploi du temps des classes",
  },
  lessonSchedule: {
    ar: "جدول الحصص",
    en: "Lesson Schedule",
    fr: "Emploi du temps des cours",
  },
  //?: ExamScheduleManagemen::
  examCalendar: {
    ar: "رزنامة الامتحانات",
    en: "Exam Calendar",
    fr: "Calendrier des examens",
  },
  TimeView: {
    ar: "عرض زمني",
    en: "Time View",
    fr: "Vue Chronologique",
  },
  ViewSchedule: {
    ar: "عرض جدول",
    en: "View Schedule",
    fr: "Afficher l'emploi du temps",
  },
  AddExam: {
    ar: "إضافة امتحان",
    en: "Add Exam",
    fr: "Ajouter un examen",
  },
  SearchSubjectClassOrRoom: {
    ar: "البحث عن المادة أو الصف أو القاعة...",
    en: "Search for subject, class, or room...",
    fr: "Rechercher une matière, une classe ou une salle...",
  },
  ExamTimeline: {
    ar: "عرض زمني للامتحانات",
    en: "Exam Timeline",
    fr: "Vue chronologique des examens",
  },
  Subject: {
    ar: "المادة",
    en: "Subject",
    fr: "Matière",
  },
  Date: {
    ar: "التاريخ",
    en: "Date",
    fr: "Date",
  },
  Time: {
    ar: "الوقت",
    en: "Time",
    fr: "Heure",
  },
  DurationMinutes: {
    ar: "المدة (دقيقة)",
    en: "Duration (minutes)",
    fr: "Durée (minutes)",
  },
  Room: {
    ar: "القاعة",
    en: "Room",
    fr: "Salle",
  },
  //?: AbsenceReviews ::
  ReviewAbsenceRequests: {
    ar: "مراجعة طلبات الغياب",
    en: "Review Absence Requests",
    fr: "Examiner les demandes d'absence",
  },
  Filtering: {
    ar: "الفلترة",
    en: "Filtering",
    fr: "Filtrage",
  },
  TotalRequests: {
    ar: "إجمالي الطلبات",
    en: "Total Requests",
    fr: "Nombre total de demandes",
  },
  UnderReview: {
    ar: "قيد المراجعة",
    en: "Under Review",
    fr: "En cours d'examen",
  },
  Accepted: {
    ar: "مقبول",
    en: "Accepted",
    fr: "Accepté",
  },
  Rejected: {
    ar: "مرفوض",
    en: "Rejected",
    fr: "Refusé",
  },
  AbsenceDate: {
    ar: "تاريخ الغياب:",
    en: "Absence Date",
    fr: "Date d'absence",
  },
  SubmissionDate: {
    ar: "تاريخ التقديم",
    en: "Submission Date",
    fr: "Date de soumission",
  },
  AbsenceReason: {
    ar: "سبب الغياب",
    en: "Reason for Absence",
    fr: "Raison de l'absence",
  },
  Documents: {
    ar: "مستندات:",
    en: "Documents",
    fr: "Documents",
  },
  Available: {
    ar: "متوفرة",
    en: "Available",
    fr: "Disponible",
  },
  NotAvailable: {
    ar: "غير متوفرة",
    en: "Not Available",
    fr: "Indisponible",
  },
  Accept: {
    ar: "قبول",
    en: "Accept",
    fr: "Accepter",
  },
  Reject: {
    ar: "رفض",
    en: "Reject",
    fr: "Refuser",
  },
  Details: {
    ar: "تفاصيل",
    en: "Details",
    fr: "Détails",
  },
  NoDetailsOrDocuments: {
    ar: "لا توجد أي تفاصيل أو مستند إثبات",
    en: "No details or supporting documents available",
    fr: "Aucun détail ou document justificatif disponible",
  },
  //?: BehaviorReports.tsx ::
  BehaviorReports: {
    ar: "تقارير السلوك",
    en: "Behavior Reports",
    fr: "Rapports de comportement",
  },
  PositiveBehavior: {
    ar: "سلوك إيجابي",
    en: "Positive Behavior",
    fr: "Comportement positif",
  },
  NegativeBehavior: {
    ar: "سلوك سلبي",
    en: "Negative Behavior",
    fr: "Comportement négatif",
  },
  ViewList: {
    ar: "عرض قائمة",
    en: "View List",
    fr: "Afficher la liste",
  },
  ViewSummary: {
    ar: "عرض ملخص",
    en: "View Summary",
    fr: "Afficher le résumé",
  },
  searchStudentOrDescriptionOrAction: {
    ar: "البحث عن الطالب أو الوصف أو الإجراء...",
    en: "Search for student, description, or action...",
    fr: "Rechercher un élève, une description ou une action...",
  },
  behaviorReportsSummary: {
    ar: "ملخص تقارير السلوك",
    en: "Behavior Reports Summary",
    fr: "Résumé des rapports de comportement",
  },
  totalReports: {
    ar: "إجمالي التقارير",
    en: "Total Reports",
    fr: "Nombre total de rapports",
  },
  category: {
    ar: "الفئة",
    en: "Category",
    fr: "Catégorie",
  },
  description: {
    ar: "الوصف",
    en: "Description",
    fr: "Description",
  },
  action: {
    ar: "الإجراء",
    en: "Action",
    fr: "Action",
  },
  //? GradeOverview ::
  schoolAverage: {
    ar: "متوسط المدرسة",
    en: "School Average",
    fr: "Moyenne de l'école",
  },
  highestGrade: {
    ar: "أعلى معدل",
    en: "Highest Grade",
    fr: "Note la plus élevée",
  },
  lowestGrade: {
    ar: "أقل معدل",
    en: "Lowest Grade",
    fr: "Note la plus basse",
  },
  passingRate: {
    ar: "معدل النجاح",
    en: "Passing Rate",
    fr: "Taux de réussite",
  },
  gradeOverview: {
    ar: "نظرة عامة على الدرجات",
    en: "Grade Overview",
    fr: "Vue d'ensemble des notes",
  },
  classPerformance: {
    ar: "أداء الفصول",
    en: "Class Performance",
    fr: "Performance des classes",
  },
  average: {
    ar: "المتوسط",
    en: "Average",
    fr: "Moyenne",
  },
  numberOfStudents: {
    ar: "عدد الطلاب",
    en: "Number of Students",
    fr: "Nombre d'élèves",
  },
  topStudent: {
    ar: "أفضل طالب",
    en: "Top Student",
    fr: "Meilleur Élève",
  },
  subjectPerformance: {
    ar: "أداء المواد",
    en: "Subject Performance",
    fr: "Performance des Matières",
  },
  //? ActivitiesManagement ::
  eventManagement: {
    ar: "إدارة الفعاليات",
    en: "Event Management",
    fr: "Gestion des Événements",
  },
  sports: { ar: "رياضية", en: "Sports", fr: "Sportives" },
  science: { ar: "علمية", en: "Science", fr: "Scientifiques" },
  cultural: { ar: "ثقافية", en: "Cultural", fr: "Culturelles" },
  viewCalendar: {
    ar: "عرض تقويم",
    en: "View Calendar",
    fr: "Voir le Calendrier",
  },
  addActivity: {
    ar: "إضافة فعالية",
    en: "Add Activity",
    fr: "Ajouter une activité",
  },
  searchActivity: {
    ar: "البحث عن العنوان أو الوصف أو الموقع...",
    en: "Search by title, description, or location...",
    fr: "Rechercher par titre, description ou lieu...",
  },
  eventsCalendar: {
    ar: "تقويم الفعاليات",
    en: "Events Calendar",
    fr: "Calendrier des Événements",
  },

  titleColumn: { ar: "العنوان", en: "Title", fr: "Titre" },
  categoryColumn: { ar: "الفئة", en: "Category", fr: "Catégorie" },
  dateColumn: { ar: "التاريخ", en: "Date", fr: "Date" },
  timeColumn: { ar: "الوقت", en: "Time", fr: "Heure" },
  locationColumn: { ar: "الموقع", en: "Location", fr: "Emplacement" },
  actionsColumn: { ar: "الإجراءات", en: "Actions", fr: "Actions" },

  //! ParentDashoard :
  myChildren: { ar: "أطفالي", en: "My Children", fr: "Mes Enfants" },
  totalAbsences: {
    ar: "إجمالي عدد الغيابات",
    en: "Total Absences",
    fr: "Total des Absences",
  },
  newMessages: {
    ar: "رسائل جديدة",
    en: "New Messages",
    fr: "Nouveaux Messages",
  },
  notifications: { ar: "إشعارات", en: "Notifications", fr: "Notifications" },

  overview: { ar: "نظرة عامة", en: "Overview", fr: "Aperçu" },
  absencesAndReports: {
    ar: "تقارير وغيابات",
    en: "Reports & Absences",
    fr: "Rapports & Absences",
  },
  chat: { ar: "دردشة", en: "Chat", fr: "Discussion" },
  notificationsAndAlarms: {
    ar: "إشعارات وتنبيهات",
    en: "Notifications & Alerts",
    fr: "Notifications & Alertes",
  },
  timetable: { ar: "جدول التوقيت", en: "Timetable", fr: "Emploi du Temps" },
  homeworks: { ar: "الواجبات", en: "Homework", fr: "Devoirs" },
  digitalLibrary: {
    ar: "مكتبة رقمية",
    en: "Digital Library",
    fr: "Bibliothèque Numérique",
  },
  events: { ar: "فعاليات", en: "Events", fr: "Événements" },

  parentDashboard: {
    ar: "لوحة تحكم ولي الأمر",
    en: "Parent Dashboard",
    fr: "Tableau de Bord Parent",
  },
  welcomeMessage: {
    ar: "مرحباً بك، هنا يمكنك متابعة تقدم أطفالك الأكاديمي",
    en: "Welcome, here you can track your children's academic progress",
    fr: "Bienvenue, ici vous pouvez suivre les progrès académiques de vos enfants",
  },

  //? Dashboard Layout :
  accountStatus: {
    ar: "حالة الحساب",
    en: "Account Status",
    fr: "État du Compte",
  },
  accountActive: { ar: "مفعّل", en: "Active", fr: "Actif" },

  //? Overview (default) ::
  academicStatus: {
    ar: "الحالة الأكاديمية",
    en: "Academic Status",
    fr: "Statut Académique",
  },
  latestUpdates: {
    ar: "آخر التحديثات",
    en: "Latest Updates",
    fr: "Dernières Mises à Jour",
  },
  requiredTasks: {
    ar: "المهام المطلوبة",
    en: "Required Tasks",
    fr: "Tâches Requises",
  },

  //? ChildrenOverview ::
  excellent: { ar: "ممتاز", en: "Excellent", fr: "Excellent" },
  veryGood: { ar: "جيد جداً", en: "Very Good", fr: "Très Bien" },
  good: { ar: "جيد", en: "Good", fr: "Bien" },
  poorPerformance: {
    ar: "أداء ضعيف",
    en: "Poor Performance",
    fr: "Performance Faible",
  },
  childrenOverview: {
    ar: "نظرة عامة على الأطفال",
    en: "Children Overview",
    fr: "Vue d'ensemble des enfants",
  },
  selectChild: {
    ar: "اختر الطفل",
    en: "Select Child",
    fr: "Sélectionner l'enfant",
  },
  mainTeacher: {
    ar: "المعلم الرئيسي",
    en: "Main Teacher",
    fr: "Enseignant Principal ",
  },
  overallGrade: {
    ar: "المعدل العام",
    en: "Overall Grade",
    fr: "Moyenne Générale",
  },
  behavior: { ar: "السلوك", en: "Behavior", fr: "Comportement" },
  numberOfSubjects: {
    ar: "عدد المواد",
    en: "Number of Subjects",
    fr: "Nombre de matières",
  },
  recentActivities: {
    ar: "النشاطات الأخيرة",
    en: "Recent Activities",
    fr: "Activités Récentes",
  },
  quickActions: {
    ar: "إجراءات سريعة",
    en: "Quick Actions",
    fr: "Actions Rapides",
  },
  viewGrades: {
    ar: "عرض الدرجات",
    en: "View Grades",
    fr: "Afficher les Notes",
  },
  attendanceRecord: {
    ar: "سجل الحضور",
    en: "Attendance Record",
    fr: "Registre de Présence",
  },
  day: {
    ar: "يوم",
    en: "day",
    fr: "jour",
  },
  record: {
    ar: "سجل",
    en: "record",
    fr: "record",
  },
  justifyAbsence: {
    ar: "تبرير غياب",
    en: "Justify Absence",
    fr: "Justifier l'Absence",
  },
  contactTeacher: {
    ar: "تواصل مع المعلم",
    en: "Contact Teacher",
    fr: "Contacter l'Enseignant",
  },

  //? GradeReports.tsx ::
  currentSemester: {
    ar: "الفصل الحالي",
    en: "Current Semester",
    fr: "Semestre Actuel",
  },
  firstSemester: {
    ar: "الفصل الأول",
    en: "First Semester",
    fr: "1er Semestre",
  },
  secondSemester: {
    ar: "الفصل الثاني",
    en: "Second Semester",
    fr: "2ème Semestre",
  },
  thirdSemester: {
    ar: "الفصل الثالث",
    en: "Third Semester",
    fr: "3ème Semestre",
  },

  academicYear: {
    ar: "السنة الدراسية",
    en: "Academic Year",
    fr: "Année Scolaire",
  },
  gradeReports: {
    ar: "تقارير الدرجات",
    en: "Grade Reports",
    fr: "Rapports de Notes",
  },
  noGradeDataAvailable: {
    ar: "لا توجد بيانات درجات متاحة بعد لهذا الطالب",
    en: "No grade data available yet for this student",
    fr: "Aucune note disponible pour cet élève",
  },
  noStudentsFound: {
    ar: "لا يوجد طلاب مرتبطون بهذا الحساب",
    en: "No students linked to this account",
    fr: "Aucun élève lié à ce compte",
  },
  exportReport: {
    ar: "تصدير التقرير",
    en: "Export Report",
    fr: "Exporter le Rapport",
  },
  child: { ar: "الطفل", en: "Child", fr: "Enfant" },
  allSubjects: {
    ar: "جميع المواد",
    en: "All Subjects",
    fr: "Toutes les matières",
  },
  apply: { ar: "تطبيق", en: "Apply", fr: "Appliquer" },
  rank: { ar: "الترتيب", en: "Rank", fr: "Rang" },
  outOf: { ar: "من أصل", en: "Out of", fr: "Sur" },
  subjects: { ar: "مواد دراسية", en: "Subjects", fr: "Matières" },
  highestScore: { ar: "أعلى درجة", en: "Highest Score", fr: "Meilleure Note" },
  in: { ar: "في", en: "In", fr: "Dans" },
  currentGrade: {
    ar: "الدرجة الحالية",
    en: "Current Grade",
    fr: "Note Actuelle",
  },
  classAverage: {
    ar: "متوسط الصف",
    en: "Class Average",
    fr: "Moyenne de la Classe",
  },
  gradeReviewRequests: {
    ar: "طلبات مراجعة الدرجات",
    en: "Grade Review Requests",
    fr: "Demandes de Révision des Notes",
  },
  submitReviewRequest: {
    ar: "تقديم طلب مراجعة",
    en: "Submit Review Request",
    fr: "Soumettre une Demande de Révision",
  },
  noGradeReviewRequests: {
    ar: "لا توجد طلبات مراجعة درجات حالياً",
    en: "No grade review requests at the moment",
    fr: "Aucune demande de révision de notes pour le moment",
  },
  gradeReviewInstruction: {
    ar: "يمكنك تقديم طلب مراجعة إذا كنت تعتقد أن هناك خطأ في التقييم",
    en: "You can submit a review request if you believe there is an error in the assessment",
    fr: "Vous pouvez soumettre une demande de révision si vous pensez qu'il y a une erreur dans l'évaluation",
  },

  //? AbsenceManager ::
  totalRequests: {
    ar: "إجمالي الطلبات",
    en: "Total Requests",
    fr: "Nombre total de demandes",
  },
  noLeaveRequests: {
    ar: "لا توجد طلبات غياب",
    en: "No leave requests",
    fr: "Aucune demande d'absence",
  },
  noLeaveJustificationRequests: {
    ar: "لم تقم بتقديم أي طلبات تبرير غياب بعد",
    en: "You haven't submitted any leave justification requests yet",
    fr: "Vous n'avez encore soumis aucune demande de justification d'absence",
  },
  submitNewRequest: {
    ar: "تقديم طلب جديد",
    en: "Submit New Request",
    fr: "Soumettre une nouvelle demande",
  },
  supportingDocuments: {
    ar: "مستندات داعمة",
    en: "Supporting Documents",
    fr: "Documents justificatifs",
  },
  reviewDate: {
    ar: "تاريخ المراجعة",
    en: "Review Date",
    fr: "Date de révision",
  },
  adminComment: {
    ar: "تعليق الإدارة",
    en: "Admin Comment",
    fr: "Commentaire de l'administration",
  },
  requestUnderReview: {
    ar: "الطلب قيد المراجعة من قبل الإدارة",
    en: "Request under review by administration",
    fr: "Demande en cours de révision par l'administration",
  },
  excellentBehavior: {
    ar: "سلوك ممتاز",
    en: "Excellent Behavior",
    fr: "Comportement Excellent",
  },
  goodBehavior: { ar: "سلوك جيد", en: "Good Behavior", fr: "Bon Comportement" },
  noBehaviorReports: {
    ar: "لا توجد تقارير سلوك",
    en: "No Behavior Reports",
    fr: "Aucun rapport de comportement",
  },
  noBehaviorReportsForChild: {
    ar: "لا توجد تقارير سلوك متاحة لهذا الطفل حالياً",
    en: "No behavior reports available for this child currently",
    fr: "Aucun rapport de comportement disponible pour cet enfant actuellement",
  },
  reportDate: { ar: "تاريخ التقرير", en: "Report Date", fr: "Date du Rapport" },
  classParticipation: {
    ar: "المشاركة الصفية",
    en: "Class Participation",
    fr: "Participation en Classe",
  },
  teacherComment: {
    ar: "تعليق المعلم",
    en: "Teacher Comment",
    fr: "Commentaire de l'Enseignant",
  },
  submittedBy: { ar: "مقدم من", en: "Submitted By", fr: "Soumis Par" },
  leaveRequest: {
    ar: "طلب تبرير غياب",
    en: "Leave Request",
    fr: "Demande de Congé",
  },
  absenceManagement: {
    ar: "إدارة الغياب",
    en: "Absence Management",
    fr: "Gestion des Absences",
  },
  absenceReasonPlaceholder: {
    ar: "اختر السبب",
    en: "Select Reason",
    fr: "Choisir la raison",
  },
  illness: { ar: "مرض", en: "Illness", fr: "Maladie" },
  medicalAppointment: {
    ar: "موعد طبي",
    en: "Medical Appointment",
    fr: "Rendez-vous médical",
  },
  familyCircumstances: {
    ar: "ظروف عائلية",
    en: "Family Circumstances",
    fr: "Circonstances familiales",
  },
  emergency: { ar: "طوارئ", en: "Emergency", fr: "Urgence" },
  travel: { ar: "سفر", en: "Travel", fr: "Voyage" },
  other: { ar: "أخرى", en: "Other", fr: "Autre" },

  additionalDetails: {
    ar: "تفاصيل إضافية",
    en: "Additional Details",
    fr: "Détails supplémentaires",
  },
  additionalDetailsPlaceholder: {
    ar: "اكتب تفاصيل إضافية عن سبب الغياب...",
    en: "Write additional details about the absence reason...",
    fr: "Écrivez des détails supplémentaires sur la raison de l'absence...",
  },
  uploadSupportingDocuments: {
    ar: "رفع مستندات داعمة (اختياري)",
    en: "Upload supporting documents (optional)",
    fr: "Télécharger des documents justificatifs (optionnel)",
  },
  clickToSelect: {
    ar: "انقر للاختيار",
    en: "Click to select",
    fr: "Cliquez pour sélectionner",
  },
  selectedFiles: {
    ar: "ملفات مختارة",
    en: "Selected files",
    fr: "Fichiers sélectionnés",
  },
  urgentRequest: {
    ar: "طلب عاجل (يتطلب مراجعة فورية)",
    en: "Urgent request (requires immediate review)",
    fr: "Demande urgente (nécessite un examen immédiat)",
  },
  submitRequest: {
    ar: "تقديم الطلب",
    en: "Submit Request",
    fr: "Soumettre la demande",
  },

  //? ParentChat.tsx ::
  parents: { ar: "أولياء الأمور", en: "Parents", fr: "Parents" },
  search: { ar: "البحث...", en: "Search...", fr: "Recherche..." },
  selectChatToStart: {
    ar: "اختر محادثة للبدء",
    en: "Select a chat to start",
    fr: "Sélectionnez une conversation pour commencer",
  },

  //? SchoolAnnouncements.tsx :
  holiday: { ar: "إجازة", en: "Holiday", fr: "Vacances" },
  meeting: { ar: "اجتماع", en: "Meeting", fr: "Réunion" },
  activity: { ar: "نشاط", en: "Activity", fr: "Activité" },
  unreadAnnouncement: {
    ar: "إعلان غير مقروء",
    en: "Unread announcement",
    fr: "Annonce non lue",
  },
  youHave: { ar: "لديك", en: "You have", fr: "Vous avez" },
  enableNotifications: {
    ar: "تفعيل الإشعارات",
    en: "Enable notifications",
    fr: "Activer les notifications",
  },
  searchAnnouncements: {
    ar: "البحث في الإعلانات...",
    en: "Search announcements...",
    fr: "Rechercher dans les annonces...",
  },
  schoolAnnouncements: {
    ar: "إعلانات المدرسة",
    en: "School Announcements",
    fr: "Annonces de l'école",
  },
  totalAnnouncements: {
    ar: "إجمالي الإعلانات",
    en: "Total Announcements",
    fr: "Total des annonces",
  },
  unread: { ar: "غير مقروء", en: "Unread", fr: "Non lu" },
  pinned: { ar: "مثبت", en: "Pinned", fr: "Épinglé" },
  highPriority: {
    ar: "عالي الأولوية",
    en: "High Priority",
    fr: "Haute priorité",
  },
  pinnedAnnouncements: {
    ar: "الإعلانات المثبتة",
    en: "Pinned Announcements",
    fr: "Annonces épinglées",
  },
  attachmentsCount: { ar: "مرفق", en: "attachment", fr: "pièce jointe" },
  allAnnouncements: {
    ar: "جميع الإعلانات",
    en: "All Announcements",
    fr: "Toutes les annonces",
  },
  noAnnouncements: {
    ar: "لا توجد إعلانات",
    en: "No Announcements",
    fr: "Aucune annonce",
  },
  noAnnouncementsMatch: {
    ar: "لا توجد إعلانات تطابق معايير البحث المحددة",
    en: "No announcements match the specified search criteria",
    fr: "Aucune annonce ne correspond aux critères de recherche spécifiés",
  },

  //? ScheduleManagement ::
  searchChildOrClass: {
    ar: "البحث عن الطفل أو الفصل...",
    en: "Search for child or class...",
    fr: "Rechercher un enfant ou une classe...",
  },
  childrenTimetables: {
    ar: "جداول الأطفال",
    en: "Children’s Timetables",
    fr: "Emplois du temps des enfants",
  },
  noTimetablesAvailable: {
    ar: "لا توجد جداول متاحة. يرجى إضافة جدول جديد.",
    en: "No timetables available. Please add a new one.",
    fr: "Aucun emploi du temps disponible. Veuillez en ajouter un nouveau.",
  },
  childName: { ar: "اسم الطفل", en: "Child Name", fr: "Nom de l’enfant" },

  //? HomeWorkManagement.tsx ::
  noTimetables: {
    ar: "لا توجد جداول متاحة.",
    en: "No timetables available.",
    fr: "Aucun emploi du temps disponible.",
  },
  homework: { ar: "واجب منزلي", en: "Homework", fr: "Devoir à la maison" },
  exam: { ar: "اختبار", en: "Exam", fr: "Examen" },
  homeworkAndExamsSchedule: {
    ar: "جدول الواجبات والاختبارات",
    en: "Homework and Exams Schedule",
    fr: "Emploi du temps des devoirs et examens",
  },
  childrenSchedules: {
    ar: "جداول الأطفال",
    en: "Children’s Schedules",
    fr: "Emplois du temps des enfants",
  },
  type: { ar: "النوع", en: "Type", fr: "Type" },

  subject: { ar: "المادة", en: "Subject", fr: "Matière" },
  dueDate: { ar: "تاريخ التسليم", en: "Due Date", fr: "Date de remise" },
  download: { ar: "تحميل", en: "Download", fr: "Télécharger" },

  //? ResourceLibrary.tsx
  documents: { ar: "مستندات", en: "Documents", fr: "Documents" },
  videoCourses: { ar: "دورات فيديو", en: "Video Courses", fr: "Cours vidéo" },
  books: { ar: "كتب", en: "Books", fr: "Livres" },
  educationalLibrary: {
    ar: "المكتبة التعليمية",
    en: "Educational Library",
    fr: "Bibliothèque éducative",
  },
  searchTitleDescriptionClass: {
    ar: "البحث عن عنوان، وصف، أو فصل...",
    en: "Search by title, description, or class...",
    fr: "Rechercher par titre, description ou classe...",
  },
  noEducationalMaterials: {
    ar: "لا توجد مواد تعليمية",
    en: "No educational materials",
    fr: "Aucun matériel éducatif",
  },
  noMaterialsMatch: {
    ar: "لم يتم العثور على مواد تطابق معايير البحث",
    en: "No materials found matching the search criteria",
    fr: "Aucun matériel ne correspond aux critères de recherche",
  },
  price: { ar: "السعر", en: "Price", fr: "Prix" },
  free: { ar: "مجاني", en: "Free", fr: "Gratuit" },
  dzd: { ar: "دج", en: "DZD", fr: "DZD" },
  materialDetails: {
    ar: "تفاصيل المادة",
    en: "Material Details",
    fr: "Détails du matériel",
  },
  title: { ar: "العنوان", en: "Title", fr: "Titre" },
  format: { ar: "الصيغة", en: "Format", fr: "Format" },
  size: { ar: "الحجم", en: "Size", fr: "Taille" },
  close: { ar: "إغلاق", en: "Close", fr: "Fermer" },
  purchase: { ar: "شراء", en: "Purchase", fr: "Acheter" },

  //? ActivitiesManagement.tsx
  schoolEvents: {
    ar: "الفعاليات المدرسية",
    en: "School Events",
    fr: "Événements scolaires",
  },
  searchPlaceholder: {
    ar: "البحث عن العنوان أو الوصف أو الموقع...",
    en: "Search by title, description, or location...",
    fr: "Rechercher par titre, description ou lieu...",
  },
  noEventsAvailable: {
    ar: "لا توجد فعاليات متاحة حالياً.",
    en: "No events available currently.",
    fr: "Aucun événement disponible pour le moment.",
  },
  school: { ar: "المدرسة", en: "School", fr: "École" },
  location: { ar: "الموقع", en: "Location", fr: "Emplacement" },
  eventDetails: {
    ar: "تفاصيل الفعالية",
    en: "Event Details",
    fr: "Détails de l'événement",
  },

  //! Teacher Dashboard :
  teacherDashboardTitle: {
    ar: "لوحة تحكم المعلم",
    en: "Teacher Dashboard",
    fr: "Tableau de bord de l'enseignant",
  },
  teacherDashboardSubtitle: {
    ar: "مرحباً أستاذ ، إليك ملخص أنشطتك اليومية",
    en: "Hello Professor, here’s a summary of your daily activities",
    fr: "Bonjour M/Mde, voici un résumé de vos activités quotidiennes",
  },
  myStudents: { ar: "طلابي", en: "My Students", fr: "Mes élèves" },
  monthlyEvaluation: {
    ar: "الأداء الأكاديمي",
    en: "Academic Performance",
    fr: "Performance académique",
  },
  addMonthlyEvaluation: {
    ar: "إضافة تقييم شهري",
    en: "Add Monthly Evaluation",
    fr: "Ajouter une évaluation mensuelle",
  },
  monthlyEvaluationDescription: {
    ar: "سجل شهري لمتابعة مشاركة الطالب وواجباته وملاحظات الأستاذ دون التأثير على المعدلات.",
    en: "A monthly record for classroom participation, homework, and teacher remarks without affecting averages.",
    fr: "Un relevé mensuel de la participation en classe, des devoirs et des remarques de l'enseignant sans impact sur les moyennes.",
  },
  participationMark: {
    ar: "علامة المشاركة الصفية",
    en: "Class Participation Mark",
    fr: "Note de participation en classe",
  },
  homeworksMark: {
    ar: "علامة الواجبات",
    en: "Homework Mark",
    fr: "Note des devoirs",
  },
  addEvaluation: {
    ar: "إضافة التقييم",
    en: "Add Evaluation",
    fr: "Ajouter l'évaluation",
  },
  updateEvaluation: {
    ar: "تحديث التقييم",
    en: "Update Evaluation",
    fr: "Mettre à jour l'évaluation",
  },
  saveEvaluation: {
    ar: "حفظ التقييم",
    en: "Save Evaluation",
    fr: "Enregistrer l'évaluation",
  },
  savingEvaluation: {
    ar: "جارٍ الحفظ...",
    en: "Saving...",
    fr: "Enregistrement...",
  },
  evaluationSaved: {
    ar: "تم حفظ التقييم بنجاح",
    en: "Evaluation saved successfully",
    fr: "Évaluation enregistrée avec succès",
  },
  evaluationSaveFailed: {
    ar: "تعذر حفظ التقييم",
    en: "Failed to save evaluation",
    fr: "Échec de l'enregistrement de l'évaluation",
  },
  evaluationDeleted: {
    ar: "تم حذف التقييم بنجاح",
    en: "Evaluation deleted successfully",
    fr: "Évaluation supprimée avec succès",
  },
  evaluationDeleteFailed: {
    ar: "تعذر حذف التقييم",
    en: "Failed to delete evaluation",
    fr: "Échec de la suppression de l'évaluation",
  },
  deletingEvaluation: {
    ar: "جارٍ الحذف...",
    en: "Deleting...",
    fr: "Suppression...",
  },
  confirmDeleteMonthlyEvaluation: {
    ar: "هل أنت متأكد من حذف هذا التقييم الشهري؟",
    en: "Are you sure you want to delete this monthly evaluation?",
    fr: "Voulez-vous vraiment supprimer cette évaluation mensuelle ?",
  },
  monthlyEvaluationRemarksPlaceholder: {
    ar: "اكتب ملاحظات الأستاذ حول أداء الطالب داخل القسم...",
    en: "Write the teacher's remarks about the student's classroom performance...",
    fr: "Rédigez les remarques de l'enseignant sur la performance de l'élève en classe...",
  },
  existingMonthlyEvaluation: {
    ar: "يوجد تقييم محفوظ لهذا الشهر",
    en: "An evaluation already exists for this month",
    fr: "Une évaluation existe déjà pour ce mois",
  },
  newMonthlyEvaluation: {
    ar: "تقييم جديد لهذا الشهر",
    en: "New evaluation for this month",
    fr: "Nouvelle évaluation pour ce mois",
  },
  noMonthlyEvaluations: {
    ar: "لا توجد تقييمات شهرية متاحة حالياً",
    en: "No monthly evaluations available right now",
    fr: "Aucune évaluation mensuelle disponible pour le moment",
  },
  monthlyEvaluationForSchool: {
    ar: "التقييمات الشهرية لطلاب المدرسة",
    en: "Monthly Evaluations For School Students",
    fr: "Évaluations mensuelles des élèves de l'école",
  },
  monthlyEvaluationForParents: {
    ar: "التقييمات الشهرية لأطفالك",
    en: "Monthly Evaluations For Your Children",
    fr: "Évaluations mensuelles de vos enfants",
  },
  monthlyEvaluationTeacherHint: {
    ar: "اختر الطالب ثم أضف أو حدّث أو احذف تقييمه الشهري مع المرفقات.",
    en: "Select a student, then add, update, or delete their monthly evaluations with attachments.",
    fr: "Sélectionnez un élève, puis ajoutez, mettez à jour ou supprimez ses évaluations mensuelles avec pièces jointes.",
  },
  allClasses: {
    ar: "جميع الفصول",
    en: "All Classes",
    fr: "Toutes les classes",
  },
  allMonths: {
    ar: "جميع الأشهر",
    en: "All Months",
    fr: "Tous les mois",
  },
  clearFilters: {
    ar: "مسح الفلاتر",
    en: "Clear Filters",
    fr: "Effacer les filtres",
  },
  classParticipationSection: {
    ar: "المشاركة الصفية",
    en: "Class Participation",
    fr: "Participation en classe",
  },
  homeworkMarksSectionTitle: {
    ar: "علامات الواجبات",
    en: "Homework Marks",
    fr: "Notes des devoirs",
  },
  remarksAndNotes: {
    ar: "الملاحظات والتعليقات",
    en: "Remarks & Notes",
    fr: "Remarques et notes",
  },
  module: {
    ar: "المادة",
    en: "Module",
    fr: "Module",
  },
  evaluationTitle: {
    ar: "عنوان التقييم",
    en: "Evaluation Title",
    fr: "Titre de l'évaluation",
  },
  evaluationRemark: {
    ar: "ملاحظة",
    en: "Remark",
    fr: "Remarque",
  },
  evaluationDescription: {
    ar: "وصف التقييم",
    en: "Evaluation Description",
    fr: "Description de l'évaluation",
  },
  evaluationAttachment: {
    ar: "مرفق (PDF/صورة)",
    en: "Attachment (PDF/Image)",
    fr: "Pièce jointe (PDF/Image)",
  },
  homeworkAttachmentHint: {
    ar: "ارفع صورة أو ملف PDF للواجب المنزلي (JPG، PNG، PDF فقط).",
    en: "Upload a scan or photo of the homework (PDF, JPG, PNG only).",
    fr: "Téléversez un scan ou une photo du devoir (PDF, JPG, PNG uniquement).",
  },
  evaluationMonth: {
    ar: "شهر التقييم",
    en: "Evaluation Month",
    fr: "Mois d'évaluation",
  },
  selectStudentPrompt: {
    ar: "اختر طالبا لبدء إضافة التقييمات الشهرية.",
    en: "Select a student to start managing monthly evaluations.",
    fr: "Sélectionnez un élève pour commencer à gérer les évaluations mensuelles.",
  },
  noMonthlyEvaluationsForStudent: {
    ar: "لا توجد تقييمات شهرية لهذا الطالب حاليا.",
    en: "No monthly evaluations found for this student yet.",
    fr: "Aucune évaluation mensuelle pour cet élève pour le moment.",
  },
  viewAttachment: {
    ar: "عرض المرفق",
    en: "View Attachment",
    fr: "Voir la pièce jointe",
  },
  evaluationLoadFailed: {
    ar: "تعذر تحميل التقييمات الشهرية.",
    en: "Failed to load monthly evaluations.",
    fr: "Échec du chargement des évaluations mensuelles.",
  },
  savedEvaluationsCount: {
    ar: "عدد التقييمات المحفوظة",
    en: "Saved Evaluations",
    fr: "Évaluations enregistrées",
  },
  noMonthlyEvaluationAssignments: {
    ar: "لا توجد أقسام أو مواد مرتبطة بحساب الأستاذ حالياً، لذلك لا يمكن إضافة تقييمات شهرية بعد.",
    en: "No class or module assignments are linked to this teacher account yet, so monthly evaluations cannot be added right now.",
    fr: "Aucune classe ni aucun module n'est encore lié à ce compte enseignant, donc les évaluations mensuelles ne peuvent pas être ajoutées pour le moment.",
  },
  noModulesForSelectedClass: {
    ar: "لا توجد مادة مرتبطة بالقسم المحدد لهذا الأستاذ.",
    en: "No module is assigned to the selected class for this teacher.",
    fr: "Aucun module n'est affecté à la classe sélectionnée pour cet enseignant.",
  },
  selectModuleToManageEvaluation: {
    ar: "اختر المادة أولاً لتفعيل إضافة أو تحديث التقييم.",
    en: "Select a module first to enable adding or updating the evaluation.",
    fr: "Sélectionnez d'abord un module pour activer l'ajout ou la mise à jour de l'évaluation.",
  },
  uploadedMaterials: {
    ar: "المواد المرفوعة",
    en: "Uploaded Materials",
    fr: "Matériaux téléchargés",
  },
  myClasses: { ar: "فصولي", en: "My Classes", fr: "Mes classes" },
  marks: { ar: "الدرجات", en: "Marks", fr: "Notes" },
  educationalMaterials: {
    ar: "المواد التعليمية",
    en: "Educational Materials",
    fr: "Matériaux éducatifs",
  },
  communication_teacher: {
    ar: "التواصل",
    en: "Communication",
    fr: "Communication",
  },
  unexcusedAbsencesAndBehaviorReports: {
    ar: "الغيابات غير المبررة وتقارير السلوك",
    en: "Unjustified absences and behavior reports",
    fr: "Absences non justifiées et rapports de comportement",
  },
  students: { ar: "طلاب", en: "Students", fr: "Élèves" },

  //? default :
  enterNewGrades: {
    ar: "إدخال درجات جديدة",
    en: "Enter New Grades",
    fr: "Saisir de nouvelles notes",
  },
  uploadEducationalMaterial: {
    ar: "رفع مادة تعليمية",
    en: "Upload Educational Material",
    fr: "Téléverser du matériel pédagogique",
  },
  sendNotificationToParents: {
    ar: "إرسال إشعار للأولياء",
    en: "Send Notification to Parents",
    fr: "Envoyer une notification aux parents",
  },
  averageGrades: {
    ar: "متوسط الدرجات:",
    en: "Average Grades:",
    fr: "Moyenne des notes:",
  },
  weeklySchedule: {
    ar: "الجدول الأسبوعي",
    en: "Weekly Schedule",
    fr: "Emploi du temps hebdomadaire",
  },
  addGrade: { ar: "إضافة درجة", en: "Add Grade", fr: "Ajouter une note" },
  recordAttendance: {
    ar: "تسجيل الغيابات",
    en: "Record Attendance",
    fr: "Enregistrer les absences",
  },
  viewReports: {
    ar: "عرض التقارير",
    en: "View Reports",
    fr: "Afficher les rapports",
  },
  lastGrade: { ar: "آخر درجة", en: "Last Grade", fr: "Dernière note" },
  status: { ar: "الحالة", en: "Status", fr: "Statut" },
  recordAbsences: {
    ar: "تسجيل الغيابات",
    en: "Record Absences",
    fr: "Enregistrer les absences",
  },
  studentsGeneralInformation: {
    ar: "معلومات الطلاب العامة",
    en: "Students General Information",
    fr: "Informations Générales sur les Élèves",
  },
  overallPerformance: {
    ar: "الأداء العام",
    en: "Overall Performance",
    fr: "Performance Globale",
  },
  searchStudents: {
    ar: "البحث عن الطلاب...",
    en: "Search for students...",
    fr: "Rechercher des élèves...",
  },
  absent: { ar: "غائب", en: "Absent", fr: "Absent" },
  present: { ar: "حاضر", en: "Present", fr: "Présent" },

  //? GradeManger :
  gradesManagement: {
    ar: "إدارة الدرجات",
    en: "Grades Management",
    fr: "Gestion des notes",
  },
  export: { ar: "تصدير", en: "Export", fr: "Exporter" },

  firstSemesterAssessment: {
    ar: "تقويم الفصل الأول",
    en: "First Semester Assessment",
    fr: "Évaluation du premier semestre",
  },
  firstSemesterExam1: {
    ar: "فرض الفصل الأول 1",
    en: "First Semester Exam 1",
    fr: "Examen du premier semestre 1",
  },
  firstSemesterExam2: {
    ar: "فرض الفصل الأول 2",
    en: "First Semester Exam 2",
    fr: "Examen du premier semestre 2",
  },
  firstSemesterHomework: {
    ar: "واجبات الفصل الأول",
    en: "First Semester Homework",
    fr: "Devoirs du premier semestre",
  },
  firstSemesterTest: {
    ar: "امتحان الفصل الأول",
    en: "First Semester Test",
    fr: "Test du premier semestre",
  },
  firstSemesterAverage: {
    ar: "معدل الفصل الأول",
    en: "First Semester Average",
    fr: "Moyenne du premier semestre",
  },
  secondSemesterAssessment: {
    ar: "تقويم الفصل الثاني",
    en: "Second Semester Assessment",
    fr: "Évaluation du deuxième semestre",
  },
  secondSemesterExam1: {
    ar: "فرض الفصل الثاني 1",
    en: "Second Semester Exam 1",
    fr: "Examen du deuxième semestre 1",
  },
  secondSemesterExam2: {
    ar: "فرض الفصل الثاني 2",
    en: "Second Semester Exam 2",
    fr: "Examen du deuxième semestre 2",
  },
  secondSemesterHomework: {
    ar: "واجبات الفصل الثاني",
    en: "Second Semester Homework",
    fr: "Devoirs du deuxième semestre",
  },
  secondSemesterTest: {
    ar: "امتحان الفصل الثاني",
    en: "Second Semester Test",
    fr: "Test du deuxième semestre",
  },
  secondSemesterAverage: {
    ar: "معدل الفصل الثاني",
    en: "Second Semester Average",
    fr: "Moyenne du deuxième semestre",
  },
  // Third semester translations
  thirdSemesterAssessment: {
    ar: "تقويم الفصل الثالث",
    en: "Third Semester Assessment",
    fr: "Évaluation du troisième semestre",
  },
  thirdSemesterExam1: {
    ar: "فرض الفصل الثالث 1",
    en: "Third Semester Exam 1",
    fr: "Examen du troisième semestre 1",
  },
  thirdSemesterExam2: {
    ar: "فرض الفصل الثالث 2",
    en: "Third Semester Exam 2",
    fr: "Examen du troisième semestre 2",
  },
  thirdSemesterHomework: {
    ar: "واجبات الفصل الثالث",
    en: "Third Semester Homework",
    fr: "Devoirs du troisième semestre",
  },
  thirdSemesterTest: {
    ar: "امتحان الفصل الثالث",
    en: "Third Semester Test",
    fr: "Test du troisième semestre",
  },
  thirdSemesterAverage: {
    ar: "معدل الفصل الثالث",
    en: "Third Semester Average",
    fr: "Moyenne du troisième semestre",
  },
  addNewGrade: {
    ar: "إضافة درجة جديدة",
    en: "Add New Grade",
    fr: "Ajouter une nouvelle note",
  },
  selectStudent: {
    ar: "اختر الطالب",
    en: "Select Student",
    fr: "Choisir un élève",
  },
  selectSubject: {
    ar: "اختر المادة",
    en: "Select Subject",
    fr: "Choisir une matière",
  },
  save: { ar: "حفظ", en: "Save", fr: "Enregistrer" },
  semester: { ar: "الفصل", en: "Semester", fr: "Semestre" },

  //? ResourceManager.tsx :
  videos: { ar: "فيديوهات", en: "Videos", fr: "Vidéos" },
  uploadNewMaterial: {
    ar: "رفع مادة جديدة",
    en: "Upload New Material",
    fr: "Ajouter un nouveau cours",
  },
  downloads: { ar: "التحميلات", en: "Downloads", fr: "Téléchargements" },
  materialTitle: {
    ar: "عنوان المادة",
    en: "Material title",
    fr: "Titre du matériel",
  },
  educationalMaterialTitle: {
    ar: "عنوان المادة التعليمية",
    en: "Educational material title",
    fr: "Titre du matériel pédagogique",
  },
  materialType: {
    ar: "نوع المادة",
    en: "Material type",
    fr: "Type de matériel",
  },
  document: { ar: "مستند", en: "Document", fr: "Document" },
  video: { ar: "فيديو", en: "Video", fr: "Vidéo" },
  book: { ar: "كتاب", en: "Book", fr: "Livre" },
  targetedClasses: {
    ar: "الفصول المستهدفة",
    en: "Targeted classes",
    fr: "Classes ciblées",
  },
  materialDescription: {
    ar: "وصف المادة",
    en: "Material description",
    fr: "Description du matériel",
  },
  shortMaterialDescription: {
    ar: "وصف مختصر للمادة التعليمية...",
    en: "Short description of the educational material...",
    fr: "Brève description du matériel pédagogique...",
  },
  uploadFile: {
    ar: "رفع الملف",
    en: "Upload file",
    fr: "Téléverser le fichier",
  },
  dragOrClickToSelect: {
    ar: "اسحب الملف هنا أو انقر للاختيار",
    en: "Drag the file here or click to select",
    fr: "Glissez le fichier ici ou cliquez pour sélectionner",
  },

  //? TeacherChat.tsx :
  onlineNow: { ar: "متصل الآن", en: "Online now", fr: "En ligne maintenant" },
  lastSeenAnHourAgo: {
    ar: "آخر ظهور منذ ساعة",
    en: "Last seen an hour ago",
    fr: "Dernière connexion il y a une heure",
  },
  selectConversationToStart: {
    ar: "اختر محادثة للبدء",
    en: "Select a conversation to start",
    fr: "Sélectionnez une conversation pour commencer",
  },
  noAbsenceRequests: {
    ar: "لا توجد طلبات غياب",
    en: "No absence requests",
    fr: "Aucune demande d'absence",
  },
  noJustificationRequests: {
    ar: "لم تقم بتقديم أي طلبات تبرير غياب بعد",
    en: "You haven't submitted any absence justification requests yet",
    fr: "Vous n'avez encore soumis aucune demande de justification d'absence",
  },
  addBehaviorReport: {
    ar: "إضافة تقرير سلوك",
    en: "Add behavior report",
    fr: "Ajouter un rapport de comportement",
  },
  behaviorType: {
    ar: "نوع السلوك",
    en: "Behavior type",
    fr: "Type de comportement",
  },
  selectBehaviorType: {
    ar: "اختر نوع السلوك",
    en: "Select behavior type",
    fr: "Choisir le type de comportement",
  },
  writeAdditionalDetails: {
    ar: "اكتب تفاصيل إضافية عن حالة المشاركة الصفية للطالب...",
    en: "Write additional details about the student's class participation...",
    fr: "Écrivez des détails supplémentaires sur la participation en classe de l'élève...",
  },
  addStudentNotes: {
    ar: "أضف ملاحظاتك حول الطالب هنا...",
    en: "Add your notes about the student here...",
    fr: "Ajoutez vos notes sur l'élève ici...",
  },
  submitReport: {
    ar: "تقديم التقرير",
    en: "Submit report",
    fr: "Soumettre le rapport",
  },

  schools: { ar: "المدارس", en: "Schools", fr: "Écoles" },

  // Admin Dashboard :: 
  admin: {
    platformAdmin: {
    ar: "مسؤول المنصة",
    en: "Platform Admin",
    fr: "Administrateur de Plateforme",
  },
  overview: {
    ar: "نظرة عامة",
    en: "Overview",
    fr: "Aperçu",
  },
  schools: {
    ar: "المدارس",
    en: "Schools",
    fr: "Écoles",
  },
  reports: {
    ar: "التقارير",
    en: "Reports",
    fr: "Rapports",
  },
  announcements: {
    ar: "الإعلانات",
    en: "Announcements",
    fr: "Annonces",
  },
  subscriptions: {
    ar: "الاشتراكات",
    en: "Subscriptions",
    fr: "Abonnements",
  },
  totalSchools: {
    ar: "إجمالي المدارس",
    en: "Total Schools",
    fr: "Nombre Total d'Écoles",
  },
  totalTeachers: {
    ar: "إجمالي المعلمين",
    en: "Total Teachers",
    fr: "Nombre Total d'Enseignants",
  },
  totalParents: {
    ar: "إجمالي أولياء الأمور",
    en: "Total Parents",
    fr: "Nombre Total de Parents",
  },
  activeSubscriptions: {
    ar: "الاشتراكات النشطة",
    en: "Active Subscriptions",
    fr: "Abonnements Actifs",
  },
  pendingReports: {
    ar: "التقارير المعلقة",
    en: "Pending Reports",
    fr: "Rapports en Attente",
  },
  activeAdmins: {
    ar: "المسؤولون النشطون",
    en: "Active Admins",
    fr: "Administrateurs Actifs",
  },
  
  // School Management
  schoolManagement: {
    ar: "إدارة المدارس",
    en: "School Management",
    fr: "Gestion des Écoles",
  },
  searchSchools: {
    ar: "ابحث عن المدارس...",
    en: "Search schools...",
    fr: "Rechercher des écoles...",
  },
  schoolLevel: {
    ar: "المستوى التعليمي",
    en: "School Level",
    fr: "Niveau Scolaire",
  },
  allLevels: {
    ar: "جميع المستويات",
    en: "All Levels",
    fr: "Tous les Niveaux",
  },
  primary: {
    ar: "ابتدائي",
    en: "Primary",
    fr: "Primaire",
  },
  middle: {
    ar: "متوسط",
    en: "Middle",
    fr: "Moyen",
  },
  high: {
    ar: "ثانوي",
    en: "High",
    fr: "Secondaire",
  },
  primarySchool: {
    ar: "مدرسة ابتدائية",
    en: "Primary School",
    fr: "École Primaire",
  },
  middleSchool: {
    ar: "مدرسة متوسطة",
    en: "Middle School",
    fr: "École Moyenne",
  },
  highSchool: {
    ar: "مدرسة ثانوية",
    en: "High School",
    fr: "École Secondaire",
  },
  schoolType: {
    ar: "نوع المدرسة",
    en: "School Type",
    fr: "Type d'École",
  },
  allTypes: {
    ar: "جميع الأنواع",
    en: "All Types",
    fr: "Tous les Types",
  },
  public: {
    ar: "حكومية",
    en: "Public",
    fr: "Public",
  },
  private: {
    ar: "خاصة",
    en: "Private",
    fr: "Privée",
  },
  schoolName: {
    ar: "اسم المدرسة",
    en: "School Name",
    fr: "Nom de l'École",
  },
  email: {
    ar: "البريد الإلكتروني",
    en: "Email",
    fr: "E-mail",
  },
  level: {
    ar: "المستوى",
    en: "Level",
    fr: "Niveau",
  },
  type: {
    ar: "النوع",
    en: "Type",
    fr: "Type",
  },
  students: {
    ar: "الطلاب",
    en: "Students",
    fr: "Élèves",
  },
  status: {
    ar: "الحالة",
    en: "Status",
    fr: "Statut",
  },
  active: {
    ar: "نشط",
    en: "Active",
    fr: "Actif",
  },
  suspended: {
    ar: "موقوف",
    en: "Suspended",
    fr: "Suspendu",
  },
  actions: {
    ar: "الإجراءات",
    en: "Actions",
    fr: "Actions",
  },
  viewDetails: {
    ar: "عرض التفاصيل",
    en: "View Details",
    fr: "Voir les Détails",
  },
  suspend: {
    ar: "إيقاف",
    en: "Suspend",
    fr: "Suspendre",
  },
  activate: {
    ar: "تفعيل",
    en: "Activate",
    fr: "Activer",
  },

  // User Management
  userManagement: {
    ar: "إدارة المستخدمين",
    en: "User Management",
    fr: "Gestion des Utilisateurs",
  },
  searchUsers: {
    ar: "ابحث عن المستخدمين...",
    en: "Search users...",
    fr: "Rechercher des utilisateurs...",
  },
  allRoles: {
    ar: "جميع الأدوار",
    en: "All Roles",
    fr: "Tous les Rôles",
  },
  schoolAdmin: {
    ar: "إدارة مدرسة",
    en: "School Admin",
    fr: "Administration Scolaire",
  },
  allStatus: {
    ar: "جميع الحالات",
    en: "All Status",
    fr: "Tous les Statuts",
  },
  inactive: {
    ar: "غير نشط",
    en: "Inactive",
    fr: "Inactif",
  },
  username: {
    ar: "اسم المستخدم",
    en: "Username",
    fr: "Nom d'Utilisateur",
  },
  userType: {
    ar: "نوع المستخدم",
    en: "User Type",
    fr: "Type d'Utilisateur",
  },
  joined: {
    ar: "تاريخ الانضمام",
    en: "Joined",
    fr: "Date d'Adhésion",
  },
  deactivate: {
    ar: "إلغاء التفعيل",
    en: "Deactivate",
    fr: "Désactiver",
  },
  reactivate: {
    ar: "إعادة التفعيل",
    en: "Reactivate",
    fr: "Réactiver",
  },

  // Report Management
  absenceReports: {
    ar: "تقارير الغياب",
    en: "Absence Reports",
    fr: "Rapports d'Absence",
  },
  behaviourReports: {
    ar: "تقارير السلوك",
    en: "Behaviour Reports",
    fr: "Rapports de Comportement",
  },
  searchReports: {
    ar: "ابحث عن التقارير...",
    en: "Search reports...",
    fr: "Rechercher des rapports...",
  },
  pending: {
    ar: "معلق",
    en: "Pending",
    fr: "En Attente",
  },
  approved: {
    ar: "موافق عليه",
    en: "Approved",
    fr: "Approuvé",
  },
  rejected: {
    ar: "مرفوض",
    en: "Rejected",
    fr: "Rejeté",
  },
  student: {
    ar: "الطالب",
    en: "Student",
    fr: "Élève",
  },
  parent: {
    ar: "ولي الأمر",
    en: "Parent",
    fr: "Parent",
  },
  teacher: {
    ar: "المعلم",
    en: "Teacher",
    fr: "Enseignant",
  },
  absenceDate: {
    ar: "تاريخ الغياب",
    en: "Absence Date",
    fr: "Date d'Absence",
  },
  reason: {
    ar: "السبب",
    en: "Reason",
    fr: "Raison",
  },
  submitted: {
    ar: "مرسل في",
    en: "Submitted",
    fr: "Soumis",
  },
  approve: {
    ar: "الموافقة",
    en: "Approve",
    fr: "Approuver",
  },
  reject: {
    ar: "الرفض",
    en: "Reject",
    fr: "Rejeter",
  },
  approveReport: {
    ar: "الموافقة على التقرير",
    en: "Approve Report",
    fr: "Approuver le Rapport",
  },
  rejectReport: {
    ar: "رفض التقرير",
    en: "Reject Report",
    fr: "Rejeter le Rapport",
  },
  comment: {
    ar: "ملاحظة",
    en: "Comment",
    fr: "Commentaire",
  },
  rejectionReason: {
    ar: "سبب الرفض",
    en: "Rejection Reason",
    fr: "Raison du Rejet",
  },

  // Announcement Management
  announcementsManagement: {
    ar: "إدارة الإعلانات",
    en: "Announcements Management",
    fr: "Gestion des Annonces",
  },
  searchAnnouncements: {
    ar: "ابحث عن الإعلانات...",
    en: "Search announcements...",
    fr: "Rechercher des annonces...",
  },
  allAudiences: {
    ar: "جميع الجماهير",
    en: "All Audiences",
    fr: "Tous les Publics",
  },
  createNew: {
    ar: "إنشاء جديد",
    en: "New",
    fr: "Nouveau",
  },
  createAnnouncement: {
    ar: "إنشاء إعلان جديد",
    en: "Create New Announcement",
    fr: "Créer une Nouvelle Annonce",
  },
  title: {
    ar: "العنوان",
    en: "Title",
    fr: "Titre",
  },
  content: {
    ar: "المحتوى",
    en: "Content",
    fr: "Contenu",
  },
  priority: {
    ar: "الأولوية",
    en: "Priority",
    fr: "Priorité",
  },
  low: {
    ar: "منخفضة",
    en: "Low",
    fr: "Basse",
  },
  medium: {
    ar: "متوسطة",
    en: "Medium",
    fr: "Moyenne",
  },
  targetGroup: {
    ar: "المجموعة المستهدفة",
    en: "Target Group",
    fr: "Groupe Cible",
  },
  everyone: {
    ar: "الجميع",
    en: "Everyone",
    fr: "Tout le Monde",
  },
  publish: {
    ar: "نشر",
    en: "Publish",
    fr: "Publier",
  },
  archive: {
    ar: "أرشيف",
    en: "Archive",
    fr: "Archiver",
  },
  pinned: {
    ar: "مثبت",
    en: "Pinned",
    fr: "Épinglé",
  },
  published: {
    ar: "منشور",
    en: "Published",
    fr: "Publié",
  },
  draft: {
    ar: "مسودة",
    en: "Draft",
    fr: "Brouillon",
  },

  // Subscription Management
  subscriptionManagement: {
    ar: "إدارة الاشتراكات",
    en: "Subscriptions Management",
    fr: "Gestion des Abonnements",
  },
  searchSubscriptions: {
    ar: "ابحث عن الاشتراكات...",
    en: "Search subscriptions...",
    fr: "Rechercher des abonnements...",
  },
  free: {
    ar: "مجاني",
    en: "Free",
    fr: "Gratuit",
  },
  startDate: {
    ar: "تاريخ البداية",
    en: "Start Date",
    fr: "Date de Début",
  },
  expiryDate: {
    ar: "تاريخ الانتهاء",
    en: "Expiry Date",
    fr: "Date d'Expiration",
  },
  expiringS: {
    ar: "ينتهي قريباً",
    en: "Expiring Soon",
    fr: "Expire Bientôt",
  },
  expired: {
    ar: "منتهي الصلاحية",
    en: "Expired",
    fr: "Expiré",
  },
  extend: {
    ar: "التمديد",
    en: "Extend",
    fr: "Prolonger",
  },
  extendSubscription: {
    ar: "تمديد الاشتراك",
    en: "Extend Subscription",
    fr: "Prolonger l'Abonnement",
  },
  duration: {
    ar: "المدة",
    en: "Duration",
    fr: "Durée",
  },
  months: {
    ar: "شهور",
    en: "Months",
    fr: "Mois",
  },

  // Common Admin Actions
  page: {
    ar: "الصفحة",
    en: "Page",
    fr: "Page",
  },
  of: {
    ar: "من",
    en: "of",
    fr: "de",
  },
  loading: {
    ar: "جاري التحميل...",
    en: "Loading...",
    fr: "Chargement...",
  },
  loadingUsers: {
    ar: "جاري تحميل المستخدمين...",
    en: "Loading users...",
    fr: "Chargement des utilisateurs...",
  },
  loadingSchools: {
    ar: "جاري تحميل المدارس...",
    en: "Loading schools...",
    fr: "Chargement des écoles...",
  },
  loadingReports: {
    ar: "جاري تحميل التقارير...",
    en: "Loading reports...",
    fr: "Chargement des rapports...",
  },
  loadingAnnouncements: {
    ar: "جاري تحميل الإعلانات...",
    en: "Loading announcements...",
    fr: "Chargement des annonces...",
  },
  loadingSubscriptions: {
    ar: "جاري تحميل الاشتراكات...",
    en: "Loading subscriptions...",
    fr: "Chargement des abonnements...",
  },
  create: {
    ar: "إنشاء",
    en: "Create",
    fr: "Créer",
  },
  save: {
    ar: "حفظ",
    en: "Save",
    fr: "Enregistrer",
  },
  update: {
    ar: "تحديث",
    en: "Update",
    fr: "Mettre à Jour",
  },
  delete: {
    ar: "حذف",
    en: "Delete",
    fr: "Supprimer",
  },
  successMessage: {
    ar: "تمت العملية بنجاح",
    en: "Operation successful",
    fr: "Opération réussie",
  },
  errorMessage: {
    ar: "حدث خطأ ما",
    en: "An error occurred",
    fr: "Une erreur s'est produite",
  },
  // Missing Keys for OverviewTab and other components
  refresh: {
    ar: "تحديث",
    en: "Refresh",
    fr: "Actualiser",
  },
  hoursAgo: {
    ar: "منذ 2 ساعة",
    en: "2 hours ago",
    fr: "il y a 2 heures",
  },
  recentActivity: {
    ar: "النشاط الأخير",
    en: "Recent Activity",
    fr: "Activité récente",
  },
  schoolRegistrationApproved: {
    ar: "تم الموافقة على تسجيل المدرسة",
    en: "School registration approved",
    fr: "Enregistrement de l'école approuvé",
  },
  pendingActions: {
    ar: "الإجراءات المعلقة",
    en: "Pending Actions",
    fr: "Actions en attente",
  },
  absenceReportsAwaitingReview: {
    ar: "تقارير الغياب بانتظار المراجعة",
    en: "Absence reports awaiting review",
    fr: "Rapports d'absence en attente de révision",
  },
  pendingSchools: {
    ar: "المدارس المعلقة",
    en: "Pending Schools",
    fr: "Écoles en attente",
  },
  schoolsAwaitingApproval: {
    ar: "المدارس بانتظار الموافقة",
    en: "Schools awaiting approval",
    fr: "Écoles en attente d'approbation",
  },
  expiringSoon: {
    ar: "ينتهي قريباً",
    en: "Expiring Soon",
    fr: "Expire bientôt",
  },
  subscriptionsExpiringIn30Days: {
    ar: "الاشتراكات التي تنتهي خلال 30 يوماً",
    en: "Subscriptions expiring in 30 days",
    fr: "Abonnements expirant dans 30 jours",
  },
  platformGrowth: {
    ar: "نمو المنصة",
    en: "Platform Growth",
    fr: "Croissance de la plateforme",
  },
  registrations: {
    ar: "التسجيلات",
    en: "Registrations",
    fr: "Inscriptions",
  },
  // Month names
  jan: {
    ar: "يناير",
    en: "Jan",
    fr: "Jan",
  },
  feb: {
    ar: "فبراير",
    en: "Feb",
    fr: "Fév",
  },
  mar: {
    ar: "مارس",
    en: "Mar",
    fr: "Mar",
  },
  apr: {
    ar: "أبريل",
    en: "Apr",
    fr: "Avr",
  },
  may: {
    ar: "مايو",
    en: "May",
    fr: "Mai",
  },
  jun: {
    ar: "يونيو",
    en: "Jun",
    fr: "Juin",
  },
  jul: {
    ar: "يوليو",
    en: "Jul",
    fr: "Juil",
  },
  aug: {
    ar: "أغسطس",
    en: "Aug",
    fr: "Aoû",
  },
  sep: {
    ar: "سبتمبر",
    en: "Sep",
    fr: "Sep",
  },
  oct: {
    ar: "أكتوبر",
    en: "Oct",
    fr: "Oct",
  },
  nov: {
    ar: "نوفمبر",
    en: "Nov",
    fr: "Nov",
  },
  dec: {
    ar: "ديسمبر",
    en: "Dec",
    fr: "Déc",
  },
  // Performance metrics
  platformHealth: {
    ar: "صحة المنصة",
    en: "Platform Health",
    fr: "Santé de la plateforme",
  },
  avgResponseTime: {
    ar: "متوسط وقت الاستجابة",
    en: "Avg Response Time",
    fr: "Temps de réponse moyen",
  },
  milliseconds: {
    ar: "ميلي ثانية",
    en: "Milliseconds",
    fr: "Millisecondes",
  },
  activeUsers: {
    ar: "المستخدمون النشطون",
    en: "Active Users",
    fr: "Utilisateurs actifs",
  },
  uptimeThisMonth: {
    ar: "وقت التشغيل هذا الشهر",
    en: "Uptime this month",
    fr: "Disponibilité ce mois-ci",
  },
  currentlyOnline: {
    ar: "متصل الآن",
    en: "Currently online",
    fr: "En ligne actuellement",
  },
  // Confirmation and status messages
  created: {
    ar: "تاريخ الإنشاء",
    en: "Created",
    fr: "Créé",
  },
  target: {
    ar: "الهدف",
    en: "Target",
    fr: "Cible",
  },
  new: {
    ar: "جديد",
    en: "New",
    fr: "Nouveau",
  },
  announcementTitle: {
    ar: "عنوان الإعلان",
    en: "Announcement title",
    fr: "Titre de l'annonce",
  },
  announcementContent: {
    ar: "محتوى الإعلان",
    en: "Announcement content",
    fr: "Contenu de l'annonce",
  },
  createNewAnnouncement: {
    ar: "إنشاء إعلان جديد",
    en: "Create New Announcement",
    fr: "Créer une nouvelle annonce",
  },
  titleAndContentRequired: {
    ar: "العنوان والمحتوى مطلوبان",
    en: "Title and content are required",
    fr: "Le titre et le contenu sont requis",
  },
  announcementCreatedSuccessfully: {
    ar: "تم إنشاء الإعلان بنجاح",
    en: "Announcement created successfully",
    fr: "Annonce créée avec succès",
  },
  failedCreateAnnouncement: {
    ar: "فشل إنشاء الإعلان",
    en: "Failed to create announcement",
    fr: "Échec de la création de l'annonce",
  },
  announcementPublishedSuccessfully: {
    ar: "تم نشر الإعلان بنجاح",
    en: "Announcement published successfully",
    fr: "Annonce publiée avec succès",
  },
  failedPublishAnnouncement: {
    ar: "فشل نشر الإعلان",
    en: "Failed to publish announcement",
    fr: "Échec de la publication de l'annonce",
  },
  announcementArchivedSuccessfully: {
    ar: "تم أرشفة الإعلان بنجاح",
    en: "Announcement archived successfully",
    fr: "Annonce archivée avec succès",
  },
  failedArchiveAnnouncement: {
    ar: "فشل أرشفة الإعلان",
    en: "Failed to archive announcement",
    fr: "Échec de l'archivage de l'annonce",
  },
  // Report-specific keys
  addCommentOptional: {
    ar: "إضافة تعليق (اختياري)...",
    en: "Add comment (optional)...",
    fr: "Ajouter un commentaire (optionnel)...",
  },
  addRejectionReason: {
    ar: "إضافة سبب الرفض...",
    en: "Add rejection reason...",
    fr: "Ajouter la raison du rejet...",
  },
  rejectionReasonRequired: {
    ar: "سبب الرفض مطلوب",
    en: "Rejection reason is required",
    fr: "La raison du rejet est requise",
  },
  // Membership-specific keys
  subscriptionsManagement: {
    ar: "إدارة الاشتراكات",
    en: "Subscriptions Management",
    fr: "Gestion des abonnements",
  },
  sub200: {
    ar: "اشتراك 200",
    en: "Sub 200",
    fr: "Abonnement 200",
  },
  sub500: {
    ar: "اشتراك 500",
    en: "Sub 500",
    fr: "Abonnement 500",
  },
  durationMonths: {
    ar: "المدة (بالأشهر)",
    en: "Duration (months)",
    fr: "Durée (mois)",
  },
  reasonOptional: {
    ar: "السبب (اختياري)",
    en: "Reason (optional)",
    fr: "Raison (optionnel)",
  },
  reasonForExtensionPlaceholder: {
    ar: "سبب التمديد (مثل: دعم العملاء، عرض ترويجي)...",
    en: "Reason for extension (e.g., customer support, promotion)...",
    fr: "Raison de la prolongation (p. ex., support client, promotion)...",
  },
  extendDurationMinimum: {
    ar: "مدة التمديد يجب أن تكون على الأقل 1 شهر",
    en: "Extend duration must be at least 1 month",
    fr: "La durée d'extension doit être d'au moins 1 mois",
  },
  membershipExtendedSuccessfully: {
    ar: "تم تمديد الاشتراك بنجاح",
    en: "Membership extended successfully",
    fr: "Abonnement prolongé avec succès",
  },
  failedExtendMembership: {
    ar: "فشل تمديد الاشتراك",
    en: "Failed to extend membership",
    fr: "Échec de la prolongation de l'abonnement",
  },
  },
  noActivity: { ar: "لا يوجد نشاط حديث", en: "No recent activity", fr: "Aucune activité récente" },
  activeSchoolAccounts: { ar: "حسابات المدارس النشطة", en: "Active school accounts", fr: "Comptes écoles actifs" },
  noSchools: { ar: "لا توجد مدارس", en: "No schools found", fr: "Aucune école trouvée" },
  noUsers: { ar: "لا يوجد مستخدمون", en: "No users found", fr: "Aucun utilisateur trouvé" },
  noReports: { ar: "لا توجد تقارير", en: "No reports found", fr: "Aucun rapport trouvé" },
  noMemberships: { ar: "لا توجد اشتراكات", en: "No memberships found", fr: "Aucun abonnement trouvé" },
  date: { ar: "التاريخ", en: "Date", fr: "Date" },
  severity: { ar: "الخطورة", en: "Severity", fr: "Gravité" },
  categoryPlaceholder: { ar: "مثل: امتحانات، إجازة...", en: "e.g., Exam, Holiday...", fr: "p.ex., Examen, Vacances..." },
  confirmActionTitle: { ar: "تأكيد الإجراء", en: "Confirm Action", fr: "Confirmer l'action" },
  thisActionCannotBeUndone: { ar: "هذا الإجراء لا يمكن التراجع عنه.", en: "This action cannot be undone.", fr: "Cette action est irréversible." },
  confirmSuspend: { ar: "هل أنت متأكد من إيقاف هذه المدرسة؟", en: "Are you sure you want to suspend this school?", fr: "Êtes-vous sûr de vouloir suspendre cette école ?" },
  confirmActivate: { ar: "هل أنت متأكد من تفعيل هذه المدرسة؟", en: "Are you sure you want to activate this school?", fr: "Êtes-vous sûr de vouloir activer cette école ?" },
  confirmDeactivate: { ar: "هل أنت متأكد من تعطيل هذا المستخدم؟", en: "Are you sure you want to deactivate this user?", fr: "Êtes-vous sûr de vouloir désactiver cet utilisateur ?" },
  confirmReactivate: { ar: "هل أنت متأكد من إعادة تفعيل هذا المستخدم؟", en: "Are you sure you want to reactivate this user?", fr: "Êtes-vous sûr de vouloir réactiver cet utilisateur ?" },
  cancelSubscription: { ar: "إلغاء الاشتراك", en: "Cancel Subscription", fr: "Annuler l'abonnement" },
  confirmCancelSubscription: { ar: "هل أنت متأكد من إلغاء هذا الاشتراك؟", en: "Are you sure you want to cancel this subscription?", fr: "Êtes-vous sûr de vouloir annuler cet abonnement ?" },
  deleteAnnouncement: { ar: "حذف الإعلان", en: "Delete Announcement", fr: "Supprimer l'annonce" },
  confirmDeleteAnnouncement: { ar: "هل أنت متأكد من حذف هذا الإعلان؟", en: "Are you sure you want to delete this announcement?", fr: "Êtes-vous sûر de vouloir supprimer cette annonce ?" },
  totalUsers: { ar: "إجمالي المستخدمين", en: "Total Users", fr: "Total des utilisateurs" },
  activeUserAccounts: { ar: "حسابات المستخدمين النشطة", en: "Active user accounts", fr: "Comptes utilisateurs actifs" },
  activeUsersRatio: { ar: "نسبة المستخدمين النشطين", en: "Active users ratio", fr: "Ratio des utilisateurs actifs" },
  totalRegistrations: { ar: "إجمالي التسجيلات", en: "Total Registrations", fr: "Total des inscriptions" },
  currentlyActive: { ar: "نشط حالياً", en: "Currently active", fr: "Actuellement actif" },
  selectSchoolForAnnouncement: { ar: "اختر المدرسة للإعلان", en: "Select school for announcement", fr: "Sélectionner l'école pour l'annonce" },
  schoolActivatedSuccessfully: { ar: "تم تفعيل المدرسة بنجاح", en: "School activated successfully", fr: "École activée avec succès" },
  schoolSuspendedSuccessfully: { ar: "تم إيقاف المدرسة بنجاح", en: "School suspended successfully", fr: "École suspendue avec succès" },
  userDeactivatedSuccessfully: { ar: "تم تعطيل المستخدم بنجاح", en: "User deactivated successfully", fr: "Utilisateur désactivé avec succès" },
  userReactivatedSuccessfully: { ar: "تم إعادة تفعيل المستخدم بنجاح", en: "User reactivated successfully", fr: "Utilisateur réactivé avec succès" },
  classes: { ar: "الفصول", en: "Classes", fr: "Classes" },
  // ─── Homework feature ────────────────────────────────────────────
  // Note: Most homework translations already defined earlier in this file
  // Only add new/unique homework-related keys here to avoid duplicates
  homeworksTab: { ar: "الواجبات", en: "Homeworks", fr: "Devoirs" },
  homeworkTabs: { ar: "الواجبات", en: "Homeworks", fr: "Devoirs" },
  addHomework: { ar: "إضافة واجب", en: "Add Homework", fr: "Ajouter un devoir" },
  editHomework: { ar: "تعديل الواجب", en: "Edit Homework", fr: "Modifier le devoir" },
  homeworkTitle: { ar: "عنوان الواجب", en: "Homework Title", fr: "Titre du devoir" },
  dateAssigned: { ar: "تاريخ الإعطاء", en: "Date Assigned", fr: "Date d'attribution" },
  deadline: { ar: "الموعد النهائي", en: "Deadline", fr: "Date limite" },
  assigned: { ar: "تاريخ الإسناد", en: "Assigned", fr: "Attribue" },
  maxMark: { ar: "العلامة القصوى", en: "Max Mark", fr: "Note maximale" },
  mark: { ar: "العلامة", en: "Mark", fr: "Note" },
  remarks: { ar: "ملاحظات", en: "Remarks", fr: "Remarques" },
  teacherNote: { ar: "ملاحظة المعلم", en: "Teacher Note", fr: "Note de l'enseignant" },
  attachment: { ar: "المرفق", en: "Attachment", fr: "Pièce jointe" },
  downloadAttachment: { ar: "تنزيل المرفق", en: "Download Attachment", fr: "Télécharger la pièce jointe" },
  downloadSubmission: { ar: "تنزيل التسليم", en: "Download Submission", fr: "Télécharger la soumission" },
  viewSubmissions: { ar: "عرض التسليمات", en: "View Submissions", fr: "Voir les soumissions" },
  submissionsOverview: { ar: "نظرة عامة على التسليمات", en: "Submissions Overview", fr: "Aperçu des soumissions" },
  noSubmissionsYet: { ar: "لا توجد تسليمات بعد", en: "No submissions yet", fr: "Aucune soumission pour l'instant" },
  noHomeworksYet: { ar: "لا توجد واجبات بعد", en: "No homeworks yet", fr: "Aucun devoir pour l'instant" },
  graded: { ar: "تم التصحيح", en: "Graded", fr: "Corrige" },
  missed: { ar: "فائت", en: "Missed", fr: "Manque" },
  submissions: { ar: "تسليمات", en: "Submissions", fr: "Soumissions" },
  notSubmitted: { ar: "لم يتم التسليم", en: "Not Submitted", fr: "Non soumis" },
  pendingGrade: { ar: "في انتظار التصحيح", en: "Pending Grade", fr: "En attente de note" },
  averageMark: { ar: "المعدل", en: "Average Mark", fr: "Moyenne" },
  totalHomeworks: { ar: "إجمالي الواجبات", en: "Total Homeworks", fr: "Total devoirs" },
  submissionRate: { ar: "معدل التسليم", en: "Submission Rate", fr: "Taux de soumission" },
  submittedAwaitingGrade: { ar: "تم التسليم - في انتظار التصحيح", en: "Submitted – awaiting grade", fr: "Soumis – en attente de note" },
  confirmDelete: { ar: "هل أنت متأكد من الحذف؟", en: "Are you sure you want to delete this item?", fr: "Êtes-vous sûr de vouloir supprimer cet élément ?" },
  saving: { ar: "جارٍ الحفظ...", en: "Saving...", fr: "Enregistrement..." },
};

export function getTranslation(key: string, language: string): string {
  // Handle nested keys (e.g., "admin.overview")
  if (key.includes('.')) {
    const keys = key.split('.');
    let entry = translations;
    for (const k of keys) {
      entry = entry?.[k];
      if (!entry) return key;
    }
    return entry[language] || entry.ar || key;
  }

  const entry = translations[key];

  // Return key if translation doesn't exist
  if (!entry) return key;

  // Try requested language → Arabic → fallback to key
  return entry[language] || entry.ar || key;
}
