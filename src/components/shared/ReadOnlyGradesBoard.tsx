import React from "react";
import {
  AlertCircle,
  ClipboardCheck,
  FileText,
  Filter,
  Loader2,
} from "lucide-react";
import {
  ReadOnlyGradeSectionKey,
  ReadOnlyGradeSectionRow,
  ReadOnlyGradeSections,
} from "../../models/StudentGrade";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

type ColumnKey =
  | "student_name"
  | "class_name"
  | "module_name"
  | "teacher_name"
  | "mark";

type ColumnConfig = {
  key: ColumnKey;
  labelKey: string;
};

type SectionConfig = {
  key: ReadOnlyGradeSectionKey;
  titleKey: string;
  iconClasses: string;
  badgeClasses: string;
};

type ReadOnlyGradesBoardProps = {
  title: string;
  description: string;
  filterHint: string;
  filters: React.ReactNode;
  summaryBadges?: string[];
  loading: boolean;
  error?: string;
  isReady: boolean;
  sections: ReadOnlyGradeSections | null;
  columns: ColumnConfig[];
  notReadyTitle: string;
  notReadyDescription: string;
  emptyTitle: string;
  emptyDescription: string;
};

type FilterSelectProps = {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "evaluation",
    titleKey: "gradeEvaluationSectionTitle",
    iconClasses: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200",
    badgeClasses: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200",
  },
  {
    key: "devoir_1",
    titleKey: "gradeDevoirOneSectionTitle",
    iconClasses: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
    badgeClasses: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
  },
  {
    key: "devoir_2",
    titleKey: "gradeDevoirTwoSectionTitle",
    iconClasses: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200",
    badgeClasses: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200",
  },
  {
    key: "exam",
    titleKey: "gradeExamSectionTitle",
    iconClasses: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200",
    badgeClasses: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200",
  },
];

export const ReadOnlyGradesFilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
}) => {
  return (
    <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-11 w-full rounded-2xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-400 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

const ReadOnlyGradesBoard: React.FC<ReadOnlyGradesBoardProps> = ({
  title,
  description,
  filterHint,
  filters,
  summaryBadges = [],
  loading,
  error,
  isReady,
  sections,
  columns,
  notReadyTitle,
  notReadyDescription,
  emptyTitle,
  emptyDescription,
}) => {
  const { language } = useLanguage();
  const hasRows = Boolean(
    sections && Object.values(sections).some((rows) => rows.length > 0)
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </div>
              </div>

              <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                <Filter className="h-4 w-4" />
                <span>{filterHint}</span>
              </div>

              {summaryBadges.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  {summaryBadges.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid w-full gap-3 md:grid-cols-3 lg:max-w-4xl">
              {filters}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {!isReady ? (
            <StateCard tone="muted" title={notReadyTitle} description={notReadyDescription} />
          ) : null}

          {isReady && error ? (
            <StateCard
              tone="error"
              title={error}
              description={getTranslation("gradesLoadRetryHint", language)}
            />
          ) : null}

          {isReady && !loading && !error && !hasRows ? (
            <StateCard tone="muted" title={emptyTitle} description={emptyDescription} />
          ) : null}
        </div>
      </section>

      {isReady && !error ? (
        loading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white px-6 py-16 text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{getTranslation("loading", language)}</span>
          </div>
        ) : hasRows && sections ? (
          <div className="space-y-6">
            {SECTION_CONFIGS.map((sectionConfig) => (
              <SectionTable
                key={sectionConfig.key}
                config={sectionConfig}
                rows={sections[sectionConfig.key] ?? []}
                columns={columns}
              />
            ))}
          </div>
        ) : null
      ) : null}
    </div>
  );
};

const SectionTable: React.FC<{
  config: SectionConfig;
  rows: ReadOnlyGradeSectionRow[];
  columns: ColumnConfig[];
}> = ({ config, rows, columns }) => {
  const { language } = useLanguage();

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl p-3 ${config.iconClasses}`}>
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {getTranslation(config.titleKey, language)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getTranslation("gradesReadOnlySectionHint", language)}
              </p>
            </div>
          </div>

          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClasses}`}>
            {rows.length} {getTranslation("records", language)}
          </span>
        </div>
      </div>

      <div className="max-h-[360px] overflow-auto">
        <table
          dir={language === "ar" ? "rtl" : "ltr"}
          className="min-w-full border-separate border-spacing-0"
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={`${config.key}-${column.key}`}
                  className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 text-left rtl:text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  {getTranslation(column.labelKey, language)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${config.key}-${row.student_id}-${row.module_id}-${row.teacher_name ?? "no-teacher"}-${row.grade_record_id ?? "empty"}`}
              >
                {columns.map((column) => (
                  <td
                    key={`${config.key}-${row.student_id}-${column.key}`}
                    className="border-b border-gray-100 px-4 py-3 text-left rtl:text-right text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    {renderCellValue(row, column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const StateCard: React.FC<{
  tone: "muted" | "error";
  title: string;
  description: string;
}> = ({ tone, title, description }) => {
  return (
    <div
      className={`rounded-2xl border px-5 py-4 ${
        tone === "error"
          ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
          : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
};

function renderCellValue(row: ReadOnlyGradeSectionRow, key: ColumnKey) {
  if (key === "mark") {
    return row.mark == null ? "—" : row.mark.toFixed(2);
  }

  const value = row[key];
  if (value == null || value === "") {
    return "—";
  }

  return value;
}

export default ReadOnlyGradesBoard;