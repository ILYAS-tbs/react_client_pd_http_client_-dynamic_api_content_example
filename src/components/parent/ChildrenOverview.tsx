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
      {/* Header and Child Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation("childrenOverview", language)}
        </h2>
        {students.length > 0 && (
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getTranslation("selectChild", language)}:
            </span>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          {getTranslation("noStudentsFound", language)}
        </div>
      ) : currentChild ? (
        <>
          {/* Child Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <div className="bg-primary-100 dark:bg-primary-900/20 p-4 rounded-full">
                <User className="h-8 w-8 text-primary-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentChild.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentChild.class} - {currentChild.school}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getTranslation("mainTeacher", language)} :{" "}
                  {currentChild.teacher}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {currentChild.overallGrade}/20
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation("overallGrade", language)}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getTranslation("TotalAbsences", language)}
                  </p>
                  <p className="text-2xl font-bold text-primary-500">
                    {currentChild.attendance}
                  </p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary-500" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getTranslation("behavior", language)}
                  </p>

                  {currentChild.behavior == "excellent" ? (
                    <p className="text-2xl font-bold text-primary-600">
                      {mapBehaviour(currentChild.behavior)}
                    </p>
                  ) : currentChild.behavior == "very_good" ? (
                    <p className="text-2xl font-bold text-primary-600">
                      {mapBehaviour(currentChild.behavior)}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-red-600">
                      {currentChild.behavior &&
                        mapBehaviour(currentChild.behavior)}
                    </p>
                  )}
                </div>

                {/* acedemic performance  */}
                {currentChild.behavior == "excellent" ? (
                  <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary-600" />
                  </div>
                ) : currentChild.behavior == "very_good" ? (
                  <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary-600" />
                  </div>
                ) : (
                  <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getTranslation("numberOfSubjects", language)}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentChild.subjects?.length}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Subjects and Recent Activities */}
          <div className="min-h-80 grid md:grid-cols-2 gap-6">
            {/* Subjects Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation("subjectPerformance", language)}
              </h3>
              <div className="space-y-4">
                {currentChild.subjects?.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {subject.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subject.teacher}
                      </p>
                      {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                        آخر تحديث: {subject.lastUpdate}
                      </p> */}
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${getGradeColor(
                          subject.grade
                        )}`}
                      >
                        {subject.grade}/20
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation("recentActivities", language)}
              </h3>
              <div className="space-y-4">
                {currentChild.recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-600">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {activity.subject && `${activity.subject}: `}
                          {activity.description}
                        </p>
                        {activity.grade && (
                          <span className="text-sm font-semibold text-primary-600">
                            {activity.grade}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {getTranslation("quickActions", language)}
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab("grades")}
                className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-medium">{getTranslation("viewGrades", language)}</span>
              </button>
              {/* <button className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-800 transition-colors">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">{getTranslation('attendanceRecord',language)}</span>
              </button> */}
              <button
                onClick={() => setActiveTab("absences")}
                className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {getTranslation("justifyAbsence", language)}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {getTranslation("contactTeacher", language)}
                </span>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChildrenOverview;
