import React, { useState } from "react";
import {
  User,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { ChildrenOverviewProps } from "../../types";
import { Student } from "../../models/Student";
import { StudentPerformance } from "../../models/StudentPerformance";
import { getAge } from "../../lib/dateUtils";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

const ChildrenOverview: React.FC<ChildrenOverviewProps> = ({
  students,
  one_student_absences,
  setActiveTab,
  studentPerformances,
}) => {
  const [selectedChild, setSelectedChild] = useState<string | number | undefined>(
    students && students.length > 0 ? students[0]?.student_id : undefined
  );

  //! Translations :
  const { language } = useLanguage();

  //! MOCK DATA :
  // const children = [
  //   {
  //     id: "child1",
  //     name: "أحمد محمد علي",
  //     class: "الصف الخامس أ",
  //     age: 11,
  //     school: "مدرسة الأمل الابتدائية",
  //     teacher: "الأستاذة فاطمة حسن",
  //     overallGrade: 16.5,
  //     attendance: 95,
  //     behavior: "ممتاز",
  //     subjects: [
  //       {
  //         name: "الرياضيات",
  //         grade: 18,
  //         teacher: "أ. أحمد بن علي",
  //         lastUpdate: "2024-01-15",
  //       },
  //       {
  //         name: "اللغة العربية",
  //         grade: 16,
  //         teacher: "أ. فاطمة حسن",
  //         lastUpdate: "2024-01-14",
  //       },
  //       {
  //         name: "العلوم",
  //         grade: 17,
  //         teacher: "أ. محمد السعيد",
  //         lastUpdate: "2024-01-13",
  //       },
  //       {
  //         name: "التاريخ",
  //         grade: 15,
  //         teacher: "أ. زينب العلي",
  //         lastUpdate: "2024-01-12",
  //       },
  //     ],
  //     recentActivities: [
  //       {
  //         type: "grade",
  //         subject: "الرياضيات",
  //         description: "امتحان الفصل الأول",
  //         grade: "18/20",
  //         date: "2024-01-15",
  //       },
  //       {
  //         type: "attendance",
  //         description: "حضور ممتاز هذا الأسبوع",
  //         date: "2024-01-14",
  //       },
  //       {
  //         type: "behavior",
  //         description: "مشاركة فعالة في الصف",
  //         date: "2024-01-13",
  //       },
  //     ],
  //   },
  //   {
  //     id: "child2",
  //     name: "فاطمة محمد علي",
  //     class: "الصف الثالث ب",
  //     age: 9,
  //     school: "مدرسة الأمل الابتدائية",
  //     teacher: "الأستاذة سارة أحمد",
  //     overallGrade: 17.2,
  //     attendance: 97,
  //     behavior: "ممتاز",
  //     subjects: [
  //       {
  //         name: "الرياضيات",
  //         grade: 17,
  //         teacher: "أ. أحمد بن علي",
  //         lastUpdate: "2024-01-15",
  //       },
  //       {
  //         name: "اللغة العربية",
  //         grade: 18,
  //         teacher: "أ. سارة أحمد",
  //         lastUpdate: "2024-01-14",
  //       },
  //       {
  //         name: "العلوم",
  //         grade: 16,
  //         teacher: "أ. محمد السعيد",
  //         lastUpdate: "2024-01-13",
  //       },
  //       {
  //         name: "التربية الإسلامية",
  //         grade: 19,
  //         teacher: "أ. علي حسن",
  //         lastUpdate: "2024-01-12",
  //       },
  //     ],
  //     recentActivities: [
  //       {
  //         type: "grade",
  //         subject: "اللغة العربية",
  //         description: "تقييم الكتابة",
  //         grade: "18/20",
  //         date: "2024-01-15",
  //       },
  //       {
  //         type: "achievement",
  //         description: "طالبة الأسبوع",
  //         date: "2024-01-14",
  //       },
  //       {
  //         type: "homework",
  //         description: "واجب منزلي في الرياضيات",
  //         date: "2024-01-13",
  //       },
  //     ],
  //   },
  // ];

  function mapBehaviour(bahaviour: string) {
    if (bahaviour == "excellent") {
      return getTranslation("excellent", language);
    }
    if (bahaviour == "very_good") {
      return getTranslation("veryGood", language);
    }

    return getTranslation("poorPerformance", language);
  }
  const children = students.map((student: Student) => {
    const perf: StudentPerformance | undefined = studentPerformances.find(
      (p) => String(p.student_id) === String(student.student_id)
    );
    const overallScore = perf?.s1_overall ?? perf?.s2_overall ?? perf?.s3_overall ?? null;
    const absences = one_student_absences(student) ?? 0;
    return {
      id: student.student_id,
      name: student.full_name,
      class: student.class_group?.name,
      age: getAge(new Date(student.date_of_birth ?? "2000-01-01").toString()),
      school: student.school?.school_name ?? "—",
      teacher: "...",
      overallGrade: overallScore ?? student.trimester_grade ?? 0,
      attendance: absences,
      behavior: student.academic_state,
      subjects: perf?.modules_stats?.map((mod) => ({
        name: mod.module_name,
        grade: mod.s1_average ?? 0,
        teacher: "",
      })) ?? student.module_grades?.["s1"]?.map((module_grade) => {
        const key = Object.keys(module_grade)[0]!;
        const value = module_grade[key]!;
        return { name: key, grade: value.average, teacher: value.teacher_name };
      }),
      recentActivities: [],
    };
  });

  const currentChild = children.find((child) => child.id === selectedChild) || children[0];


  const getGradeColor = (grade: number) => {
    if (grade >= 16) return "text-primary-600";
    if (grade >= 12) return "text-primary-500";
    if (grade >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {getTranslation("childrenOverview", language)}
        </h2>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          {getTranslation("noStudentsFound", language)}
        </div>
      ) : currentChild ? (
        <>
          {/* Enhanced Profile Card */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl shadow-xl p-8 border border-primary-200 dark:border-primary-700">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 rtl:md:space-x-reverse">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-6 rounded-full shadow-lg">
                  <User className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Student Info Section */}
              <div className="flex-1 text-center md:text-start">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {currentChild.name}
                </h3>
                <div className="space-y-2">
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">
                    {currentChild.class}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentChild.school}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getTranslation("age", language)}: {currentChild.age} {getTranslation("years", language)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Absences Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-3">
                    {getTranslation("TotalAbsences", language)}
                  </p>
                  <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {currentChild.attendance}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {getTranslation("days", language)}
                  </p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-lg">
                  <Calendar className="h-8 w-8 text-primary-500" />
                </div>
              </div>
            </div>

            {/* Subjects Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-3">
                    {getTranslation("numberOfSubjects", language)}
                  </p>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {currentChild.subjects?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {getTranslation("subjects", language)}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg">
                  <BookOpen className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChildrenOverview;
