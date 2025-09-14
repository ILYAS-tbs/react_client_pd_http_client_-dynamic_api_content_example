import React, { useState } from "react";
import {
  User,
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { ChildrenOverviewProps } from "../../types";
import { Student } from "../../models/Student";
import { getAge } from "../../lib/dateUtils";

const ChildrenOverview: React.FC<ChildrenOverviewProps> = ({
  students,
  one_student_absences,
}) => {
  const [selectedChild, setSelectedChild] = useState(students?.[0]?.student_id);

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
      return "ممتاز";
    }
    if (bahaviour == "very_good") {
      return "جيد جدا";
    }

    return "اداء ضعيف";
  }
  const children = students.map((student: Student) => ({
    id: student.student_id,
    name: student.full_name,
    class: student.class_group?.name,
    age: getAge(new Date(student.date_of_birth ?? "2000-01-01").toString()),
    school: student.school.school_name,
    teacher: "الأستاذة فاطمة حسن",
    overallGrade: student.trimester_grade || 0,
    attendance: one_student_absences(student),
    behavior: student.academic_state,
    subjects: student.module_grades?.["s1"]?.map((module_grade) => {
      const key = Object.keys(module_grade)[0]!; // e.g. "الرياضيات"

      const value = module_grade[key]!;

      const grade = {
        name: key,
        grade: value.average,
        teacher: value.teacher_name,
        // lastUpdate: "2024-01-15",
      };
      return grade;
    }),
    recentActivities: [
      {
        type: "grade",
        subject: "الرياضيات",
        description: "امتحان الفصل الأول",
        grade: "18/20",
        date: "2024-01-15",
      },
      {
        type: "attendance",
        description: "حضور ممتاز هذا الأسبوع",
        date: "2024-01-14",
      },
      {
        type: "behavior",
        description: "مشاركة فعالة في الصف",
        date: "2024-01-13",
      },
    ],
  }));

  const currentChild = children.find((child) => child.id === selectedChild);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "grade":
        return <Award className="h-4 w-4 text-green-600" />;
      case "attendance":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "behavior":
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case "achievement":
        return <Award className="h-4 w-4 text-yellow-600" />;
      case "homework":
        return <BookOpen className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return "text-green-600";
    if (grade >= 12) return "text-blue-600";
    if (grade >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header and Child Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          نظرة عامة على الأطفال
        </h2>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            اختر الطفل:
          </span>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentChild && (
        <>
          {/* Child Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentChild.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentChild.class} - {currentChild.school}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  المعلم الرئيسي: {currentChild.teacher}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {currentChild.overallGrade}/20
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  المعدل العام
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
                    عدد الغيابات
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentChild.attendance}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    السلوك
                  </p>

                  {currentChild.behavior == "excellent" ? (
                    <p className="text-2xl font-bold text-green-600">
                      {mapBehaviour(currentChild.behavior)}
                    </p>
                  ) : currentChild.behavior == "very_good" ? (
                    <p className="text-2xl font-bold text-green-600">
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
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                ) : currentChild.behavior == "very_good" ? (
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
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
                    عدد المواد
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Subjects Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                أداء المواد
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                النشاطات الأخيرة
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
                          <span className="text-sm font-semibold text-green-600">
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
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إجراءات سريعة
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <button className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-medium">عرض الدرجات</span>
              </button>
              <button className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">سجل الحضور</span>
              </button>
              <button className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">تبرير غياب</span>
              </button>
              <button className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">تواصل مع المعلم</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChildrenOverview;
