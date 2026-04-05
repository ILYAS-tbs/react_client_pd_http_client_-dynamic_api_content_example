import React, { useState } from "react";
import { BarChart3, AlertCircle } from "lucide-react";
import { GradeOverviewProps } from "../../types";
import { GroupsStat, SchoolSemesterStats, SemestersStat } from "../../models/SchoolStat";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

type Semester = "s1" | "s2" | "s3";

const SEMESTER_LABELS: Record<Semester, string> = {
  s1: "الفصل الأول",
  s2: "الفصل الثاني",
  s3: "الفصل الثالث",
};

const GradeOverview: React.FC<GradeOverviewProps> = ({
  school_stat,
  setSchoolStat: _setSchoolStat,
  class_groups,
}) => {
  const { language } = useLanguage();

  const [selectedSemester, setSelectedSemester] = useState<Semester>("s1");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // ── derived data ─────────────────────────────────────────────────────────
  const semStats: SchoolSemesterStats | undefined = school_stat
    ? school_stat[`${selectedSemester}_stats`]
    : undefined;

  const subjects = [
    "all",
    ...new Set(
      school_stat?.semesters_stats.map((s) => s.module_name) ?? []
    ),
  ];

  const filteredModuleStats: SemestersStat[] = (
    school_stat?.semesters_stats ?? []
  ).filter(
    (s) =>
      s.semester === selectedSemester &&
      (selectedClass === "all" || s.class_group_id === selectedClass) &&
      (selectedSubject === "all" || s.module_name === selectedSubject)
  ).sort((a, b) => b.module_average - a.module_average);

  const determineModuleDifficulty = (avg: number) => {
    if (avg <= 10) return getTranslation("Difficult", language);
    if (avg <= 15) return getTranslation("Medium", language);
    return getTranslation("Easy", language);
  };

  const getGroupSemField = (grp: GroupsStat, field: string) =>
    (grp as unknown as Record<string, unknown>)[`${selectedSemester}_${field}`];

  // ── empty / loading states ────────────────────────────────────────────────
  if (!school_stat) {
    return (
      <div className="space-y-6">
        {/* Skeleton */}
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  const hasData = school_stat.semesters_stats.length > 0 || school_stat.groups_stats.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
          لا توجد بيانات درجات بعد
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          سيظهر المحتوى هنا بمجرد إدخال الدرجات من قِبل المعلمين.
        </p>
      </div>
    );
  }

  // ── stat cards ────────────────────────────────────────────────────────────
  const gradeStats = [
    {
      label: getTranslation("schoolAverage", language),
      value: `${semStats?.school_average ?? "—"}/20`,
      color: "bg-primary-500",
    },
    {
      label: getTranslation("highestGrade", language),
      value: `${semStats?.school_max_average ?? "—"}/20`,
      color: "bg-primary-400",
    },
    {
      label: getTranslation("lowestGrade", language),
      value: `${semStats?.school_min_average ?? "—"}/20`,
      color: "bg-primary-500",
    },
    {
      label: getTranslation("passingRate", language),
      value: semStats
        ? `${(
            ((school_stat.number_of_students - semStats.failed_students_number) /
              (school_stat.number_of_students || 1)) *
            100
          ).toFixed(1)}%`
        : "—",
      color: "bg-primary-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header + Semester Tabs ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation("gradeOverview", language)}
        </h2>

        {/* Semester tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {(["s1", "s2", "s3"] as Semester[]).map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedSemester === sem
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {SEMESTER_LABELS[sem]}
            </button>
          ))}
        </div>
      </div>

      {/* ── School-level Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gradeStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {SEMESTER_LABELS[selectedSemester]}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Class Group Breakdown ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {getTranslation("classPerformance", language)}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("class", language)}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("numberOfStudents", language)}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("average", language)}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("topStudent", language)}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  نسبة النجاح
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الراسبون
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {school_stat.groups_stats.map((grp, index) => {
                const avg = getGroupSemField(grp, "average") as number;
                const topStudent = getGroupSemField(grp, "top_student") as { full_name: string; average: number } | null;
                const successRatio = getGroupSemField(grp, "success_ratio") as number;
                const failedCount = getGroupSemField(grp, "failed_count") as number;
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200">
                        {grp.class_group}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {grp.number_of_students} {getTranslation("student", language)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {avg ?? "—"}/20
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {topStudent ? (
                        <span>
                          {topStudent.full_name}
                          <span className="ml-1 text-primary-600 dark:text-primary-400 font-medium">
                            ({topStudent.average}/20)
                          </span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 min-w-[60px]">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${((successRatio ?? 0) * 100).toFixed(0)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {successRatio != null ? `${((successRatio) * 100).toFixed(0)}%` : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                      {failedCount ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Module Stats (filterable) ──────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getTranslation("subjectPerformance", language)}
          </h3>
          <div className="flex gap-3 flex-wrap">
            {/* Class filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">كل الأفواج</option>
              {class_groups.map((cls) => (
                <option key={cls.class_group_id} value={cls.class_group_id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {/* Subject filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">كل المواد</option>
              {subjects.slice(1).map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredModuleStats.length === 0 ? (
          <p className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            لا توجد بيانات لهذه الفلترة
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModuleStats.map((mod, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {mod.module_name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                      mod.module_average <= 10
                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        : mod.module_average <= 15
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                        : "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                    }`}
                  >
                    {determineModuleDifficulty(mod.module_average)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {mod.module_average}/20
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {mod.class_group}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeOverview;

