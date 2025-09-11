import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  Award,
} from "lucide-react";
import { GradeReportsProps } from "../../types";
import { Student } from "../../models/Student";
import { Mark } from "../../models/StudentPerformance";

// locally needed types
interface Subject {
  name: string;
  current: number;
  previous: number;
  average: number;
  assessments: Assessment[];
}
interface Assessment {
  name: string;
  grade: number;
  max: number;
  date: Date;
  weight: number;
}

interface ChildPerformance {
  overall: number;
  trend: string;
  position: number;
  totalStudents: number;
  subjects: Subject[];
}

const translateMarkType = (type: string): string => {
  const parts = type.split("_");
  if (parts.length !== 2) return type || "غير محدد";

  const base = parts[0].toLowerCase();
  const numStr = parts[1];
  const num = parseInt(numStr);

  if (isNaN(num)) return type || "غير محدد";

  let baseAr: string;
  switch (base) {
    case "devoir":
      baseAr = "الفرض";
      break;
    case "exam":
      baseAr = "امتحان الفصل";
      break;
    case "test":
      baseAr = "استجواب";
      break;
    case "homework":
      baseAr = "عمل منزلي";
      break;
    // Add more cases as needed, e.g.:
    // case 'quiz': baseAr = 'اختبار قصير'; break;
    default:
      return type || "غير محدد";
  }

  const numbersAr = [
    "", // index 0 unused
    "الأول",
    "الثاني",
    "الثالث",
    "الرابع",
    "الخامس",
    "السادس",
    "السابع",
    "الثامن",
    "التاسع",
    "العاشر",
  ];

  if (num < 1 || num >= numbersAr.length) {
    return `${baseAr} ${num}`;
  }

  return `${baseAr} ${numbersAr[num]}`;
};

const GradeReports: React.FC<GradeReportsProps> = ({
  students,
  studentPerformances,
}) => {
  const children = students.map((s: Student) => ({
    id: s.student_id,
    name: s.full_name,
  }));

  const [selectedChild, setSelectedChild] = useState(children[0]?.id || "");
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const periods = [
    { id: "current", label: "الفصل الحالي" },
    { id: "semester1", label: "الفصل الأول" },
    { id: "semester2", label: "الفصل الثاني" },
    { id: "year", label: "السنة الدراسية" },
  ];

  const gradeData: Record<string, ChildPerformance> = students.reduce(
    (acc, student, index) => {
      const perf = studentPerformances[index];
      if (!perf) return acc;

      const mapped_subjects: Subject[] = perf.modules_stats.map(
        (module_stat) => {
          // Flatten all Mark[] from all ModuleMark entries
          const allMarks: Mark[] = module_stat.module_marks
            ? module_stat.module_marks.flatMap((mm) =>
                Object.values(mm.module_marks || {}).flat()
              )
            : [];

          const assessments: Assessment[] = allMarks.map((mark) => ({
            name: translateMarkType(mark.mark_type || "غير محدد"),
            grade: mark.mark_degree,
            max: 20, // replace if backend provides max
            date: new Date(mark.date),
            weight: mark.mark_weight,
          }));

          // Take averages from the first ModuleMark (or compute an average if you prefer)
          const firstMark = module_stat.module_marks[0];
          console.log("first mark :");
          console.log(module_stat);

          const subject: Subject = {
            name: module_stat.module_name,
            current: module_stat.student_average,
            previous: 0, // TODO: compute from older periods
            average: module_stat.class_average,
            assessments,
          };

          return subject;
        }
      );

      acc[student.student_id] = {
        overall: perf.student_overall_avg,
        trend: "+0.8",
        position: perf.student_rank,
        totalStudents: perf.class_group_students_number,
        subjects: mapped_subjects,
      };

      return acc;
    },
    {} as Record<string, any>
  );

  const currentData: ChildPerformance | undefined = gradeData[selectedChild];
  const filteredSubjects =
    selectedSubject === "all"
      ? currentData?.subjects
      : currentData?.subjects.filter(
          (s: Subject) => s.name === selectedSubject
        );

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return "text-green-600";
    if (grade >= 12) return "text-blue-600";
    if (grade >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeBgColor = (grade: number) => {
    if (grade >= 16) return "bg-green-100 dark:bg-green-900";
    if (grade >= 12) return "bg-blue-100 dark:bg-blue-900";
    if (grade >= 10) return "bg-yellow-100 dark:bg-yellow-900";
    return "bg-red-100 dark:bg-red-900";
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous)
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous)
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4"></div>;
  };

  const maxGrade = Math.max(
    ...(currentData?.subjects?.map((s: Subject) => s.current) ?? [])
  );
  const maxSubject =
    currentData?.subjects?.find((s: Subject) => s.current === maxGrade)?.name ||
    "";

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          تقارير الدرجات
        </h2>
        <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Download className="h-4 w-4" />
          <span>تصدير التقرير</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الطفل
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الفترة
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المادة
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">جميع المواد</option>
              {currentData?.subjects.map((subject: Subject) => (
                <option key={subject.name} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Filter className="h-4 w-4" />
              <span>تطبيق</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overall Performance */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                المعدل العام
              </p>
              <p className="text-2xl font-bold text-green-600">
                {currentData?.overall ?? "0"}/20
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">{currentData?.trend}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                الترتيب
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {currentData?.position}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            من أصل {currentData?.totalStudents} طالب
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                عدد المواد
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {currentData?.subjects?.length}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            مواد دراسية
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                أعلى درجة
              </p>
              <p className="text-2xl font-bold text-green-600">{maxGrade}/20</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            في {maxSubject}
          </p>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          أداء المواد
        </h3>
        <div className="space-y-4">
          {filteredSubjects?.map((subject: Subject, index: number) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {subject.name}
                  </h4>
                  {getTrendIcon(subject.current, subject.previous)}
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="text-center">
                    <div
                      className={`text-lg font-bold ${getGradeColor(
                        subject.current
                      )}`}
                    >
                      {subject.current}/20
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      الدرجة الحالية
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {subject.average}/20
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      متوسط الصف
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {subject.assessments.map(
                  (assessment: Assessment, assessmentIndex: number) => (
                    <div
                      key={assessmentIndex}
                      className={`p-3 rounded-lg ${getGradeBgColor(
                        assessment.grade
                      )}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {assessment.name}
                        </h5>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {assessment.weight}%
                        </span>
                      </div>
                      <div
                        className={`text-lg font-bold ${getGradeColor(
                          assessment.grade
                        )}`}
                      >
                        {assessment.grade}/{assessment.max}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {assessment.date.toLocaleDateString()}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Appeals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            طلبات مراجعة الدرجات
          </h3>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            تقديم طلب مراجعة
          </button>
        </div>

        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>لا توجد طلبات مراجعة درجات حالياً</p>
          <p className="text-sm mt-1">
            يمكنك تقديم طلب مراجعة إذا كنت تعتقد أن هناك خطأ في التقييم
          </p>
        </div>
      </div>
    </div>
  );
};

export default GradeReports;
