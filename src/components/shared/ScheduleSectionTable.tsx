import { Calendar, Download, Eye, Pencil, Plus, Trash2 } from "lucide-react";

import { useLanguage } from "../../contexts/LanguageContext";
import type { Schedule } from "../../models/Schedule";
import { getTranslation } from "../../utils/translations";
import { FilePreview } from "./file_preview";

type ClassOption = {
  id: string;
  name: string;
};

type ScheduleSectionTableProps = {
  title: string;
  schedules: Schedule[];
  loading?: boolean;
  emptyMessage: string;
  classFilterValue?: string;
  classOptions?: ClassOption[];
  onClassFilterChange?: (value: string) => void;
  onCreateClick?: () => void;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (schedule: Schedule) => void;
};

function formatScheduleDate(value?: string | null, language?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const locale = language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

const ScheduleSectionTable: React.FC<ScheduleSectionTableProps> = ({
  title,
  schedules,
  loading = false,
  emptyMessage,
  classFilterValue = "",
  classOptions = [],
  onClassFilterChange,
  onCreateClick,
  onEdit,
  onDelete,
}) => {
  const { language } = useLanguage();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {getTranslation("pdfImagePreviewHint", language)}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {onClassFilterChange ? (
            <select
              value={classFilterValue}
              onChange={(event) => onClassFilterChange(event.target.value)}
              className="min-w-52 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-primary-900"
            >
              <option value="">{getTranslation("allClasses", language)}</option>
              {classOptions.map((classOption) => (
                <option key={classOption.id} value={classOption.id}>
                  {classOption.name}
                </option>
              ))}
            </select>
          ) : null}

          {onCreateClick ? (
            <button
              type="button"
              onClick={onCreateClick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              {getTranslation("upload", language)}
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-slate-500 dark:text-slate-400">
            <Calendar className="mb-3 h-12 w-12 animate-pulse text-slate-300 dark:text-slate-600" />
            <p>{getTranslation("loading", language)}</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-slate-500 dark:text-slate-400">
            <Calendar className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {getTranslation("className", language)}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {getTranslation("title", language)}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {getTranslation("fileColumn", language)}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {getTranslation("createdAt", language)}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {getTranslation("actions", language)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
              {schedules.map((schedule) => {
                const previewUrl = schedule.view_url ?? schedule.download_url;
                const displayTitle = schedule.title || getTranslation(schedule.schedule_type, language);

                return (
                  <tr key={schedule.schedule_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {schedule.class_group_info?.name ?? schedule.class_group_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">{displayTitle}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">
                      {schedule.has_file && previewUrl ? (
                        <FilePreview url={previewUrl} filename={schedule.file_name ?? schedule.schedule_file} compact />
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatScheduleDate(schedule.created_at, language)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(schedule)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-900 dark:hover:bg-primary-950/40 dark:hover:text-primary-300"
                            title={getTranslation("edit", language)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        ) : null}

                        {schedule.view_url ? (
                          <a
                            href={schedule.view_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-900 dark:hover:bg-primary-950/40 dark:hover:text-primary-300"
                            title={getTranslation("open", language)}
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600"
                            title={getTranslation("open", language)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        {schedule.download_url ? (
                          <a
                            href={schedule.download_url}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-900 dark:hover:bg-primary-950/40 dark:hover:text-primary-300"
                            title={getTranslation("download", language)}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600"
                            title={getTranslation("download", language)}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}

                        {onDelete ? (
                          <button
                            type="button"
                            onClick={() => onDelete(schedule)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                            title={getTranslation("delete", language)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default ScheduleSectionTable;