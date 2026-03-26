import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { GradeReportsProps } from "../../types";
import { Student } from "../../models/Student";
import { ModulesStat, StudentPerformance } from "../../models/StudentPerformance";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

type Semester = "s1" | "s2" | "s3";

const semesterLabels: Record<Semester, { ar: string; en: string; fr: string }> = {
  s1: { ar: "الفصل الأول", en: "Semester 1", fr: "Semestre 1" },
  s2: { ar: "الفصل الثاني", en: "Semester 2", fr: "Semestre 2" },
  s3: { ar: "الفصل الثالث", en: "Semester 3", fr: "Semestre 3" },
};

const gradeFieldLabels: Record<string, { ar: string; en: string; fr: string }> = {
  devoir_1:   { ar: "الفرض الأول",          en: "Exam 1",        fr: "Devoir 1" },
  devoir_2:   { ar: "الفرض الثاني",         en: "Exam 2",        fr: "Devoir 2" },
  tests:      { ar: "الاختبار",             en: "Test",          fr: "Test" },
  homeworks:  { ar: "الواجب المنزلي",       en: "Homework",      fr: "Devoir maison" },
  evaluation: { ar: "التقييم المستمر",      en: "Assessment",    fr: "Contrôle continu" },
  exam:       { ar: "الامتحان الفصلي",      en: "Final Exam",    fr: "Examen" },
};

function getGradeColor(g: number | null) {
  if (g === null) return "text-gray-400 dark:text-gray-500";
  if (g >= 16) return "text-emerald-600 dark:text-emerald-400";
  if (g >= 12) return "text-primary-600 dark:text-primary-400";
  if (g >= 10) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function fmt(v: number | null): string {
  return v !== null && v !== undefined ? v.toFixed(2) : "—";
}

// --- Loading skeleton ---
function GradeSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="flex gap-3 mb-5">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-5">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Per-module row ---
interface ModuleRowProps {
  mod: ModulesStat;
  semester: Semester;
  language: string;
}

function ModuleRow({ mod, semester, language }: ModuleRowProps) {
  const [expanded, setExpanded] = useState(false);

  const studentAvg = mod[`${semester}_average`] as number | null;
  const classAvg = mod[`class_${semester}_average`] as number | null;
  const diff = studentAvg !== null && classAvg !== null ? studentAvg - classAvg : null;

  const gradeFields = ["devoir_1", "devoir_2", "tests", "homeworks", "evaluation", "exam"] as const;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Main row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
      >
        <span className="font-medium text-gray-900 dark:text-white">{mod.module_name}</span>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`text-base font-bold ${getGradeColor(studentAvg)}`}>
              {fmt(studentAvg)}/20
            </span>
            {classAvg !== null && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({getTranslation("classAverage", language)}: {fmt(classAvg)})
              </span>
            )}
            {diff !== null && (
              <span className={`ml-2 inline-flex items-center gap-0.5 text-xs font-medium ${diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {diff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {diff >= 0 ? "+" : ""}{diff.toFixed(2)}
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded individual grades */}
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-white dark:bg-gray-800">
          {gradeFields.map((field) => {
            const key = `${semester}_${field}` as keyof ModulesStat;
            const val = mod[key] as number | null;
            const label = gradeFieldLabels[field]?.[language as "ar" | "en" | "fr"] ?? field;
            return (
              <div key={field} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{label}</p>
                <p className={`text-lg font-bold ${getGradeColor(val)}`}>
                  {fmt(val)}{val !== null ? "/20" : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Per-student card ---
interface StudentCardProps {
  student: Student;
  perf: StudentPerformance | undefined;
  language: string;
}

function StudentCard({ student, perf, language }: StudentCardProps) {
  const [semester, setSemester] = useState<Semester>("s1");

  if (!perf) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{student.full_name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getTranslation("noGradeDataAvailable", language)}
        </p>
      </div>
    );
  }

  const overallAvg = perf[`${semester}_overall`] as number | null;
  const semesters: Semester[] = ["s1", "s2", "s3"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Card header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{perf.student_name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {perf.class_group_name}
              {perf.class_group_students_number > 0 && (
                <> &mdash; {getTranslation("rank", language)}: <span className="font-medium text-primary-600">#{perf.student_rank}</span> / {perf.class_group_students_number}</>
              )}
            </p>
          </div>
          {/* Semester toggle */}
          <div className="flex gap-2">
            {semesters.map((s) => (
              <button
                key={s}
                onClick={() => setSemester(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  semester === s
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {semesterLabels[s][language as "ar" | "en" | "fr"] ?? s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Semester overview */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getTranslation("average", language)}</p>
            <p className={`text-3xl font-bold ${getGradeColor(overallAvg)}`}>{fmt(overallAvg)}<span className="text-base font-normal text-gray-400">/20</span></p>
          </div>
          {overallAvg !== null && (
            <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
              {overallAvg >= 10
                ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ {language === "ar" ? "ناجح" : language === "fr" ? "Admis" : "Passing"}</span>
                : <span className="text-red-500 font-medium">✗ {language === "ar" ? "راسب" : language === "fr" ? "Insuffisant" : "Below average"}</span>
              }
            </div>
          )}
        </div>

        {/* Module list */}
        {perf.modules_stats.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            {getTranslation("noGradeDataAvailable", language)}
          </p>
        ) : (
          <div className="space-y-2 pb-4">
            {perf.modules_stats.map((mod) => (
              <ModuleRow key={mod.module_id} mod={mod} semester={semester} language={language} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main component ---
const GradeReports: React.FC<GradeReportsProps> = ({ students, studentPerformances }) => {
  const { language } = useLanguage();
  const isLoading = students.length > 0 && studentPerformances.length === 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {getTranslation("gradeReports", language)}
      </h2>

      {isLoading ? (
        <GradeSkeleton />
      ) : students.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          {getTranslation("noStudentsFound", language)}
        </div>
      ) : (
        <div className="space-y-6">
          {students.map((student: Student) => {
            const perf = studentPerformances.find(
              (p) => String(p.student_id) === String(student.student_id)
            );
            return (
              <StudentCard
                key={student.student_id}
                student={student}
                perf={perf}
                language={language}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GradeReports;
