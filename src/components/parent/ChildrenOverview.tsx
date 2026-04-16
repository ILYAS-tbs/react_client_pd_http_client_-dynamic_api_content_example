import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { ChildrenOverviewProps } from "../../types";
import { Student } from "../../models/Student";
import { StudentPerformance } from "../../models/StudentPerformance";
import { getAge } from "../../lib/dateUtils";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

type Semester = "s1" | "s2" | "s3";
type ModuleGradeValue = { average: number; teacher_name: string };
type StudentModuleGradesBySemester = Partial<
  Record<Semester, Array<Record<string, ModuleGradeValue>>>
>;

const ChildrenOverview: React.FC<ChildrenOverviewProps> = ({
  students,
  one_student_absences,
  studentPerformances,
}) => {
  const [selectedChild, setSelectedChild] = useState<string | number | undefined>(
    students && students.length > 0 ? students[0]?.student_id : undefined
  );
  const [selectedSemester, setSelectedSemester] = useState<Semester>("s1");

  //! Translations :
  const { language } = useLanguage();

  useEffect(() => {
    if (students.length === 0) {
      setSelectedChild(undefined);
      return;
    }

    const hasSelectedChild = students.some(
      (student) => String(student.student_id) === String(selectedChild)
    );

    if (!hasSelectedChild) {
      setSelectedChild(students[0]?.student_id);
    }
  }, [selectedChild, students]);

  const semesterOptions: Array<{ value: Semester; label: string }> = [
    { value: "s1", label: getTranslation("firstSemester", language) },
    { value: "s2", label: getTranslation("secondSemester", language) },
    { value: "s3", label: getTranslation("thirdSemester", language) },
  ];

  const getSemesterAverage = (
    performance: StudentPerformance | undefined,
    semester: Semester,
    fallbackAverage: number | null
  ) => {
    if (semester === "s1") {
      return performance?.s1_overall ?? performance?.performance_average ?? fallbackAverage;
    }
    if (semester === "s2") {
      return performance?.s2_overall ?? null;
    }
    return performance?.s3_overall ?? null;
  };

  const getSemesterModuleAverage = (
    performance: StudentPerformance["modules_stats"][number],
    semester: Semester
  ) => {
    if (semester === "s1") {
      return performance.s1_average;
    }
    if (semester === "s2") {
      return performance.s2_average;
    }
    return performance.s3_average;
  };

  const getPerformanceStatusLabel = (status: StudentPerformance["performance_status"]) => {
    if (status === "excellent") {
      return getTranslation("excellent", language);
    }
    if (status === "good") {
      return getTranslation("good", language);
    }
    if (status === "pending") {
      return getTranslation("pendingEvaluation", language);
    }
    return getTranslation("needsImprovement", language);
  };

  const getPerformanceStatusBadge = (status: StudentPerformance["performance_status"]) => {
    if (status === "excellent") {
      return "bg-emerald-100 text-emerald-700 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200";
    }
    if (status === "good") {
      return "bg-blue-100 text-blue-700 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-200";
    }
    if (status === "pending") {
      return "bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-800/80 dark:text-slate-200";
    }
    return "bg-rose-100 text-rose-700 ring-rose-300 dark:bg-rose-900/30 dark:text-rose-200";
  };

  const getStatusFromAverage = (average: number | null) => {
    if (average === null) {
      return "pending" as const;
    }
    if (average >= 15) {
      return "excellent" as const;
    }
    if (average >= 10) {
      return "good" as const;
    }
    return "needs_improvement" as const;
  };

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
  const children = students.map((student: Student) => {
    const perf: StudentPerformance | undefined = studentPerformances.find(
      (p) => String(p.student_id) === String(student.student_id)
    );
    const fallbackTrimesterGrade =
      student.trimester_grade !== null && student.trimester_grade !== undefined && student.trimester_grade !== 0
        ? student.trimester_grade
        : null;
    const overallScore = getSemesterAverage(
      perf,
      selectedSemester,
      fallbackTrimesterGrade
    );
    const absences = one_student_absences(student) ?? 0;
    const semesterModuleGrades =
      (student.module_grades as StudentModuleGradesBySemester | undefined)?.[
        selectedSemester
      ] ?? [];

    return {
      id: student.student_id,
      name: student.full_name,
      class: student.class_group?.name,
      age: getAge(new Date(student.date_of_birth ?? "2000-01-01").toString()),
      school: student.school?.school_name ?? "—",
      teacher: "...",
      overallGrade: overallScore,
      performanceStatus:
        selectedSemester === "s1" && perf?.s1_overall === null && perf?.performance_average !== null
          ? perf.performance_status
          : getStatusFromAverage(overallScore),
      attendance: absences,
      behavior: student.academic_state,
      subjects:
        perf?.modules_stats?.map((mod) => ({
          name: mod.module_name,
          grade: getSemesterModuleAverage(mod, selectedSemester),
          teacher: "",
        })) ??
        semesterModuleGrades.map((module_grade) => {
        const key = Object.keys(module_grade)[0]!;
        const value = module_grade[key]!;
        return { name: key, grade: value.average, teacher: value.teacher_name };
      }),
      recentActivities: [],
    };
  });

  const currentChild = children.find((child) => child.id === selectedChild) || children[0];
  const currentSemesterLabel =
    semesterOptions.find((option) => option.value === selectedSemester)?.label ??
    selectedSemester.toUpperCase();
  const visibleSubjects = currentChild?.subjects ?? [];


  const getGradeColor = (grade: number) => {
    if (grade >= 16) return "text-primary-600";
    if (grade >= 12) return "text-primary-500";
    if (grade >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const formatAverage = (grade: number | null | undefined) => {
    if (grade === null || grade === undefined) {
      return getTranslation("pendingEvaluation", language);
    }
    return `${grade.toFixed(2)}/20`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {getTranslation("childrenOverview", language)}
        </h2>
        <div className="flex flex-wrap gap-2">
          {semesterOptions.map((option) => {
            const isActive = option.value === selectedSemester;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedSemester(option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-primary-600 bg-primary-600 text-white shadow-md dark:border-primary-400 dark:bg-primary-500"
                    : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-primary-500 dark:hover:text-primary-300"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
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
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {currentSemesterLabel}
                  </p>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${getPerformanceStatusBadge(
                      currentChild.performanceStatus
                    )}`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
                    {getPerformanceStatusLabel(currentChild.performanceStatus)}
                  </div>
                  {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getTranslation("age", language)}: {currentChild.age} {getTranslation("years", language)}
                  </p> */}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-3">
                    {getTranslation(
                      selectedSemester === "s1"
                        ? "firstSemesterAverage"
                        : selectedSemester === "s2"
                          ? "secondSemesterAverage"
                          : "thirdSemesterAverage",
                      language
                    )}
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      currentChild.overallGrade !== null && currentChild.overallGrade !== undefined
                        ? getGradeColor(currentChild.overallGrade)
                        : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    {formatAverage(currentChild.overallGrade)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {getTranslation("average", language)}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary-100 px-4 py-3 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
                  {currentSemesterLabel}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-3">
                    {getTranslation("numberOfSubjects", language)}
                  </p>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {visibleSubjects.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {getTranslation("subjects", language)}
                  </p>
                </div>
                <div className="rounded-2xl bg-purple-100 px-4 py-3 text-sm font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">
                  {currentSemesterLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-200 dark:border-gray-700">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getTranslation("subjects", language)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentSemesterLabel}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-700/60 dark:text-slate-200">
                {visibleSubjects.length} {getTranslation("subjects", language)}
              </div>
            </div>

            {visibleSubjects.length > 0 ? (
              <div className="space-y-3">
                {visibleSubjects.map((subject) => {
                  const hasGrade = subject.grade !== null && subject.grade !== undefined;
                  return (
                    <div
                      key={subject.name}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/60"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {subject.name}
                        </p>
                        {subject.teacher ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subject.teacher}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`text-lg font-bold ${
                          hasGrade ? getGradeColor(subject.grade as number) : "text-slate-500 dark:text-slate-300"
                        }`}
                      >
                        {formatAverage(subject.grade)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {getTranslation("pendingEvaluation", language)}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChildrenOverview;
