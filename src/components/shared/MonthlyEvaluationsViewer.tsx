import React, { useMemo, useState } from "react";
import { Calendar, ChevronDown, ChevronUp, FileText, Filter, Paperclip, Search, User } from "lucide-react";
import { MonthlyEvaluation } from "../../models/MonthlyEvaluation";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface MonthlyEvaluationsViewerProps {
  evaluations: MonthlyEvaluation[];
  title?: string;
  /** When true, evaluations are grouped under a collapsible section per student */
  groupByStudent?: boolean;
}

function formatMonth(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(date);
}

const MonthlyEvaluationsViewer: React.FC<MonthlyEvaluationsViewerProps> = ({
  evaluations,
  title,
  groupByStudent = false,
}) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [classGroupFilter, setClassGroupFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [collapsedStudents, setCollapsedStudents] = useState<Set<string>>(new Set());

  // Unique class groups derived from evaluations
  const uniqueClassGroups = useMemo(() => {
    const map = new Map<string, string>();
    evaluations.forEach((e) => {
      if (e.class_group?.class_group_id) {
        map.set(e.class_group.class_group_id, e.class_group.name);
      }
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [evaluations]);

  // Unique months derived from evaluations (YYYY-MM)
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    evaluations.forEach((e) => {
      const ym = e.month.slice(0, 7);
      set.add(ym);
    });
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [evaluations]);

  const filteredEvaluations = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLocaleLowerCase();
    return evaluations.filter((evaluation) => {
      if (classGroupFilter && evaluation.class_group?.class_group_id !== classGroupFilter) return false;
      if (monthFilter && !evaluation.month.startsWith(monthFilter)) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        evaluation.student.full_name,
        evaluation.title ?? "",
        evaluation.module?.module_name ?? "",
        evaluation.class_group?.name ?? "",
        evaluation.teacher?.full_name ?? "",
        evaluation.description ?? evaluation.remarks ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [evaluations, searchTerm, classGroupFilter, monthFilter]);

  const locale = language === "fr" ? "fr-FR" : language === "en" ? "en-US" : "ar-DZ";

  const toggleStudent = (studentId: string) => {
    setCollapsedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Group filtered evaluations by student when requested
  const studentGroups = useMemo(() => {
    if (!groupByStudent) return null;
    const map = new Map<string, { name: string; evals: MonthlyEvaluation[] }>();
    filteredEvaluations.forEach((e) => {
      const sid = e.student.student_id ?? String(e.student.full_name);
      if (!map.has(sid)) {
        map.set(sid, { name: e.student.full_name, evals: [] });
      }
      map.get(sid)!.evals.push(e);
    });
    return [...map.entries()];
  }, [filteredEvaluations, groupByStudent]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title ?? getTranslation("monthlyEvaluation", language)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getTranslation("monthlyEvaluationDescription", language)}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={getTranslation("searchReports", language)}
            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Filters row */}
      {(uniqueClassGroups.length > 0 || uniqueMonths.length > 0) && (
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />

          {uniqueClassGroups.length > 0 && (
            <select
              value={classGroupFilter}
              onChange={(e) => setClassGroupFilter(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{getTranslation("allClasses", language)}</option>
              {uniqueClassGroups.map((cg) => (
                <option key={cg.id} value={cg.id}>{cg.name}</option>
              ))}
            </select>
          )}

          {uniqueMonths.length > 0 && (
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{getTranslation("allMonths", language)}</option>
              {uniqueMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {formatMonth(ym + "-01", locale)}
                </option>
              ))}
            </select>
          )}

          {(classGroupFilter || monthFilter) && (
            <button
              onClick={() => { setClassGroupFilter(""); setMonthFilter(""); }}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              {getTranslation("clearFilters", language)}
            </button>
          )}
        </div>
      )}

      {!filteredEvaluations.length ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-10 text-center text-gray-500 dark:text-gray-400">
          {getTranslation("noMonthlyEvaluations", language)}
        </div>
      ) : groupByStudent && studentGroups ? (
        /* Grouped by student */
        <div className="space-y-4">
          {studentGroups.map(([studentId, group]) => {
            const isCollapsed = collapsedStudents.has(studentId);
            return (
              <div key={studentId} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleStudent(studentId)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">{group.name}</span>
                    <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                      {group.evals.length}
                    </span>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {group.evals.map((evaluation) => (
                      <EvaluationCard key={evaluation.id} evaluation={evaluation} locale={locale} language={language} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat list */
        <div className="grid gap-4">
          {filteredEvaluations.map((evaluation) => (
            <EvaluationCard key={evaluation.id} evaluation={evaluation} locale={locale} language={language} />
          ))}
        </div>
      )}
    </div>
  );
};

interface EvaluationCardProps {
  evaluation: MonthlyEvaluation;
  locale: string;
  language: string;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ evaluation, locale, language }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 p-5">
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
      <div>
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-lg">
          <User className="h-5 w-5 text-primary-500" />
          <span>{evaluation.student.full_name}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {evaluation.class_group?.name ?? ""}
          {evaluation.module?.module_name ? ` • ${evaluation.module.module_name}` : ""}
        </p>
        {evaluation.title && (
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
            {evaluation.title}
          </p>
        )}
      </div>

      <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 text-sm text-primary-700 dark:text-primary-300 shrink-0">
        <Calendar className="h-4 w-4" />
        <span>{formatMonth(evaluation.month, locale)}</span>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {getTranslation("participationMark", language)}
        </p>
        <p className="text-2xl font-bold text-primary-600 dark:text-primary-300">
          {evaluation.mark_of_participation_in_class ?? "—"}
        </p>
      </div>

      <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {getTranslation("homeworksMark", language)}
        </p>
        <p className="text-2xl font-bold text-primary-500 dark:text-primary-300">
          {evaluation.homeworks_mark ?? "—"}
        </p>
      </div>
    </div>

    <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 mb-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <FileText className="h-4 w-4 text-primary-500" />
        <span>{getTranslation("teacherComment", language)}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-6 whitespace-pre-wrap">
        {evaluation.description?.trim() || evaluation.remarks?.trim() || "—"}
      </p>
    </div>

    {evaluation.attachment && (
      <a
        href={evaluation.attachment}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-xs text-primary-600 hover:underline dark:text-primary-300 mb-3"
      >
        <Paperclip className="h-4 w-4" />
        {getTranslation("viewAttachment", language)}
      </a>
    )}

    <p className="text-xs text-gray-500 dark:text-gray-400">
      {getTranslation("submittedBy", language)}: {evaluation.teacher?.full_name ?? "—"}
    </p>
  </div>
);

export default MonthlyEvaluationsViewer;