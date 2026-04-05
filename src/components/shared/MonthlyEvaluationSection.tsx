import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Calendar,
  FileText,
  Filter,
  Paperclip,
  Search,
  User,
} from "lucide-react";
import { MonthlyEvaluation } from "../../models/MonthlyEvaluation";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface MonthlyEvaluationSectionProps {
  evaluations: MonthlyEvaluation[];
}

function formatMonth(yearMonth: string, locale: string) {
  const date = new Date(yearMonth + "-01");
  if (Number.isNaN(date.getTime())) return yearMonth;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(date);
}

const MonthlyEvaluationSection: React.FC<MonthlyEvaluationSectionProps> = ({
  evaluations,
}) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [classGroupFilter, setClassGroupFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const locale =
    language === "fr" ? "fr-FR" : language === "en" ? "en-US" : "ar-DZ";

  const uniqueClassGroups = useMemo(() => {
    const map = new Map<string, string>();
    evaluations.forEach((e) => {
      if (e.class_group?.class_group_id) {
        map.set(e.class_group.class_group_id, e.class_group.name);
      }
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [evaluations]);

  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    evaluations.forEach((e) => set.add(e.month.slice(0, 7)));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [evaluations]);

  const filteredEvaluations = useMemo(() => {
    const q = searchTerm.trim().toLocaleLowerCase();
    return evaluations.filter((e) => {
      if (
        classGroupFilter &&
        e.class_group?.class_group_id !== classGroupFilter
      )
        return false;
      if (monthFilter && !e.month.startsWith(monthFilter)) return false;
      if (!q) return true;
      return [
        e.student.full_name,
        e.title ?? "",
        e.module?.module_name ?? "",
        e.class_group?.name ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(q);
    });
  }, [evaluations, searchTerm, classGroupFilter, monthFilter]);

  const withParticipation = useMemo(
    () =>
      filteredEvaluations.filter(
        (e) => e.mark_of_participation_in_class != null
      ),
    [filteredEvaluations]
  );

  const withHomeworks = useMemo(
    () => filteredEvaluations.filter((e) => e.homeworks_mark != null),
    [filteredEvaluations]
  );

  const withRemarks = useMemo(
    () =>
      filteredEvaluations.filter(
        (e) => e.description?.trim() || e.remarks?.trim() || e.attachment
      ),
    [filteredEvaluations]
  );

  const thCls =
    "px-4 py-3 text-left rtl:text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";
  const tdCls = "px-4 py-3 text-sm text-gray-900 dark:text-white";

  return (
    <div className="space-y-8">
      {/* ── Header + Filters ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getTranslation("monthlyEvaluation", language)}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getTranslation("monthlyEvaluationDescription", language)}
            </p>
          </div>
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={getTranslation("searchStudents", language)}
              className="pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
        </div>

        {(uniqueClassGroups.length > 0 || uniqueMonths.length > 0) && (
          <div className="flex flex-wrap gap-3 items-center mt-4">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {uniqueClassGroups.length > 0 && (
              <select
                value={classGroupFilter}
                onChange={(e) => setClassGroupFilter(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">
                  {getTranslation("allClasses", language)}
                </option>
                {uniqueClassGroups.map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name}
                  </option>
                ))}
              </select>
            )}
            {uniqueMonths.length > 0 && (
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">
                  {getTranslation("allMonths", language)}
                </option>
                {uniqueMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {formatMonth(ym, locale)}
                  </option>
                ))}
              </select>
            )}
            {(classGroupFilter || monthFilter) && (
              <button
                onClick={() => {
                  setClassGroupFilter("");
                  setMonthFilter("");
                }}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                {getTranslation("clearFilters", language)}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Section 1 : Participation in Class ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getTranslation("classParticipationSection", language)}
          </h3>
        </div>

        {withParticipation.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getTranslation("noMonthlyEvaluations", language)}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/30">
                <tr>
                  <th className={thCls}>#</th>
                  <th className={thCls}>
                    {getTranslation("studentName", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("class", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("module", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("evaluationMonth", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("participationMark", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("teacher", language)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {withParticipation.map((e, i) => (
                  <tr
                    key={e.id}
                    className={
                      i % 2 === 1 ? "bg-gray-50 dark:bg-gray-900/20" : ""
                    }
                  >
                    <td className={`${tdCls} text-gray-400 dark:text-gray-500`}>
                      {i + 1}
                    </td>
                    <td className={`${tdCls} font-medium`}>
                      {e.student.full_name}
                    </td>
                    <td className={`${tdCls} text-gray-600 dark:text-gray-400`}>
                      {e.class_group?.name ?? "—"}
                    </td>
                    <td className={`${tdCls} text-gray-600 dark:text-gray-400`}>
                      {e.module?.module_name ?? "—"}
                    </td>
                    <td className={`${tdCls} text-gray-600 dark:text-gray-400`}>
                      {formatMonth(e.month.slice(0, 7), locale)}
                    </td>
                    <td className={tdCls}>
                      <span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1 text-sm font-semibold text-primary-700 dark:text-primary-300">
                        {e.mark_of_participation_in_class}/20
                      </span>
                    </td>
                    <td className={`${tdCls} text-gray-600 dark:text-gray-400`}>
                      {e.teacher?.full_name ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section 2 : Homework Marks ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-lg">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getTranslation("homeworkMarksSectionTitle", language)}
          </h3>
        </div>

        {withHomeworks.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getTranslation("noMonthlyEvaluations", language)}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/30">
                <tr>
                  <th className={thCls}>#</th>
                  <th className={thCls}>
                    {getTranslation("studentName", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("class", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("module", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("evaluationMonth", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("homeworksMark", language)}
                  </th>
                  <th className={thCls}>
                    {getTranslation("teacher", language)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {withHomeworks.map((e, i) => (
                  <tr
                    key={e.id}
                    className={
                      i % 2 === 1 ? "bg-gray-50 dark:bg-gray-900/20" : ""
                    }
                  >
                    <td className={`${tdCls} text-gray-400 dark:text-gray-500`}>
                      {i + 1}
                    </td>
                    <td className={`${tdCls} font-medium`}>
                      {e.student.full_name}
                    </td>
                    <td className={`${tdCls} text-gray-600 dark:text-gray-400`}>
                      {e.class_group?.name ?? "—"}
                    </td>
                    <td className={`${tdCls} text-gray-600 dark:text-gray-400`}>
                      {e.module?.module_name ?? "—"}
                    </td>
                    <td className={`${tdCls} text-gray-600 dark:text-gray-400`}>
                      {formatMonth(e.month.slice(0, 7), locale)}
                    </td>
                    <td className={tdCls}>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {e.homeworks_mark}/20
                      </span>
                    </td>
                    <td className={`${tdCls} text-gray-600 dark:text-gray-400`}>
                      {e.teacher?.full_name ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section 3 : Remarks & Notes (cards) ── */}
      {withRemarks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTranslation("remarksAndNotes", language)}
            </h3>
          </div>

          <div className="p-6 grid gap-4">
            {withRemarks.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {e.student.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {[e.class_group?.name, e.module?.module_name]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1 text-xs text-primary-700 dark:text-primary-300">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatMonth(e.month.slice(0, 7), locale)}
                  </span>
                </div>

                {(e.description?.trim() || e.remarks?.trim()) && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-6">
                    {e.description?.trim() || e.remarks?.trim()}
                  </p>
                )}

                {e.attachment && (
                  <a
                    href={e.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary-600 hover:underline dark:text-primary-400"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    {getTranslation("viewAttachment", language)}
                  </a>
                )}

                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  {getTranslation("submittedBy", language)}:{" "}
                  {e.teacher?.full_name ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyEvaluationSection;
