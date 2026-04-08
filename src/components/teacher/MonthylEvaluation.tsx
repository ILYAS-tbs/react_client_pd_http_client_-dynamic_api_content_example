import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  Filter,
  Loader2,
  MessageSquareText,
  Save,
} from "lucide-react";
import { MonthylEvaluationProps } from "../../types";
import {
  MonthlyEvaluation,
  MonthlyEvaluationGridRow,
  TeacherMonthlyEvaluationGridResponse,
} from "../../models/MonthlyEvaluation";
import {
  BatchMonthlyEvaluationUpdate,
  TeacherMonthlyEvaluationFilters,
} from "../../services/http_api/payloads_types/teacher_client_payload_types";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { useNotifications } from "../../contexts/NotificationContext";

type SectionKey = "participation" | "homeworks" | "remarks";

type MonthlyEvaluationFilterState = {
  class_group_id: string;
  month: string;
  module_id: string;
};

type SectionDraftState = Record<SectionKey, Record<string, string>>;
type SectionErrorState = Record<SectionKey, Record<string, string>>;
type SectionSavingState = Record<SectionKey, boolean>;
type SectionFeedbackState = Record<
  SectionKey,
  { tone: "success" | "error"; message: string } | null
>;

type SectionConfig = {
  key: SectionKey;
  titleKey: string;
  subtitleKey: string;
  field: "mark_of_participation_in_class" | "homeworks_mark" | "remarks";
  inputType: "number" | "text";
  inputLabelKey: string;
  icon: typeof ClipboardCheck;
  accentClasses: {
    icon: string;
    badge: string;
    row: string;
    focus: string;
    button: string;
  };
};

type SpreadsheetSectionProps = {
  config: SectionConfig;
  rows: MonthlyEvaluationGridRow[];
  loading: boolean;
  language: string;
  dirtyIds: Set<string>;
  values: Record<string, string>;
  errors: Record<string, string>;
  feedback: { tone: "success" | "error"; message: string } | null;
  saving: boolean;
  onValueChange: (section: SectionKey, studentId: string, value: string) => void;
  onKeyDown: (
    event: React.KeyboardEvent<HTMLInputElement>,
    section: SectionKey,
    rowIndex: number
  ) => void;
  onSave: (section: SectionKey) => void;
};

const currentMonthValue = new Date().toISOString().slice(0, 7);

const createEmptySectionDraftState = (): SectionDraftState => ({
  participation: {},
  homeworks: {},
  remarks: {},
});

const createEmptySectionErrorState = (): SectionErrorState => ({
  participation: {},
  homeworks: {},
  remarks: {},
});

const createEmptySectionSavingState = (): SectionSavingState => ({
  participation: false,
  homeworks: false,
  remarks: false,
});

const createEmptySectionFeedbackState = (): SectionFeedbackState => ({
  participation: null,
  homeworks: null,
  remarks: null,
});

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "participation",
    titleKey: "classParticipationSection",
    subtitleKey: "monthlyEvaluationParticipationHint",
    field: "mark_of_participation_in_class",
    inputType: "number",
    inputLabelKey: "participationMark",
    icon: ClipboardCheck,
    accentClasses: {
      icon: "bg-sky-100 text-sky-700",
      badge: "bg-sky-50 text-sky-700",
      row: "bg-sky-50/70",
      focus: "focus:ring-sky-500",
      button: "bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300",
    },
  },
  {
    key: "homeworks",
    titleKey: "homeworkMarksSectionTitle",
    subtitleKey: "monthlyEvaluationHomeworkHint",
    field: "homeworks_mark",
    inputType: "number",
    inputLabelKey: "homeworksMark",
    icon: BookOpen,
    accentClasses: {
      icon: "bg-amber-100 text-amber-700",
      badge: "bg-amber-50 text-amber-700",
      row: "bg-amber-50/70",
      focus: "focus:ring-amber-500",
      button: "bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300",
    },
  },
  {
    key: "remarks",
    titleKey: "remarksAndNotes",
    subtitleKey: "monthlyEvaluationRemarksHint",
    field: "remarks",
    inputType: "text",
    inputLabelKey: "remarks",
    icon: MessageSquareText,
    accentClasses: {
      icon: "bg-emerald-100 text-emerald-700",
      badge: "bg-emerald-50 text-emerald-700",
      row: "bg-emerald-50/70",
      focus: "focus:ring-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300",
    },
  },
];

const MonthylEvaluation: React.FC<MonthylEvaluationProps> = ({
  modules_class_groups,
}) => {
  const { language } = useLanguage();
  const { addNotification } = useNotifications();
  const [filters, setFilters] = useState<MonthlyEvaluationFilterState>({
    class_group_id: "",
    month: currentMonthValue,
    module_id: "",
  });
  const [gridData, setGridData] = useState<TeacherMonthlyEvaluationGridResponse | null>(
    null
  );
  const [rows, setRows] = useState<MonthlyEvaluationGridRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [drafts, setDrafts] = useState<SectionDraftState>(
    createEmptySectionDraftState()
  );
  const [errors, setErrors] = useState<SectionErrorState>(
    createEmptySectionErrorState()
  );
  const [saving, setSaving] = useState<SectionSavingState>(
    createEmptySectionSavingState()
  );
  const [feedback, setFeedback] = useState<SectionFeedbackState>(
    createEmptySectionFeedbackState()
  );

  const locale = useMemo(() => {
    if (language === "ar") return "ar-DZ";
    if (language === "fr") return "fr-FR";
    return "en-US";
  }, [language]);

  const classOptions = useMemo(() => {
    const uniqueClasses = new Map<string, { value: string; label: string }>();
    modules_class_groups.forEach((assignment) => {
      const classGroupId = assignment.class_group.class_group_id;
      if (!uniqueClasses.has(classGroupId)) {
        uniqueClasses.set(classGroupId, {
          value: classGroupId,
          label: assignment.class_group.name,
        });
      }
    });

    return Array.from(uniqueClasses.values()).sort((left, right) =>
      left.label.localeCompare(right.label)
    );
  }, [modules_class_groups]);

  const moduleOptions = useMemo(() => {
    if (!filters.class_group_id) {
      return [];
    }

    const uniqueModules = new Map<string, { value: string; label: string }>();
    modules_class_groups
      .filter((assignment) => assignment.class_group.class_group_id === filters.class_group_id)
      .forEach((assignment) => {
        const moduleId = assignment.module.module_id;
        if (!uniqueModules.has(moduleId)) {
          uniqueModules.set(moduleId, {
            value: moduleId,
            label: assignment.module.module_name,
          });
        }
      });

    return Array.from(uniqueModules.values()).sort((left, right) =>
      left.label.localeCompare(right.label)
    );
  }, [filters.class_group_id, modules_class_groups]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 18 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - 5 + index);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(date);

      return { value, label };
    });
  }, [locale]);

  const allRequiredFiltersSelected = Boolean(
    filters.class_group_id && filters.module_id && filters.month
  );

  useEffect(() => {
    if (!filters.class_group_id) {
      if (filters.module_id) {
        setFilters((previous) => ({ ...previous, module_id: "" }));
      }
      return;
    }

    const hasSelectedModule = moduleOptions.some(
      (option) => option.value === filters.module_id
    );
    if (!hasSelectedModule) {
      setFilters((previous) => ({
        ...previous,
        module_id: moduleOptions[0]?.value ?? "",
      }));
    }
  }, [filters.class_group_id, filters.module_id, moduleOptions]);

  useEffect(() => {
    if (!allRequiredFiltersSelected) {
      setGridData(null);
      setRows([]);
      setLoadError("");
      setDrafts(createEmptySectionDraftState());
      setErrors(createEmptySectionErrorState());
      setFeedback(createEmptySectionFeedbackState());
      return;
    }

    const requestFilters: TeacherMonthlyEvaluationFilters = {
      class_group_id: filters.class_group_id,
      module_id: filters.module_id,
      month: filters.month,
    };
    let cancelled = false;

    const loadRows = async () => {
      setLoading(true);
      setLoadError("");

      const response = await teacher_dashboard_client.get_filtered_monthly_evaluations(
        requestFilters
      );

      if (cancelled) {
        return;
      }

      if (response.ok) {
        const nextGridData = response.data as TeacherMonthlyEvaluationGridResponse;
        setGridData(nextGridData);
        setRows(nextGridData.rows ?? []);
        setDrafts(createEmptySectionDraftState());
        setErrors(createEmptySectionErrorState());
        setFeedback(createEmptySectionFeedbackState());
      } else {
        setGridData(null);
        setRows([]);
        setLoadError(getTranslation("evaluationLoadFailed", language));
      }

      setLoading(false);
    };

    void loadRows();

    return () => {
      cancelled = true;
    };
  }, [allRequiredFiltersSelected, filters, language]);

  const dirtyIdsBySection = useMemo(() => {
    return SECTION_CONFIGS.reduce<Record<SectionKey, Set<string>>>((accumulator, config) => {
      const dirtyIds = new Set<string>();
      Object.entries(drafts[config.key]).forEach(([studentId, value]) => {
        const row = rows.find((item) => item.student_id === studentId);
        if (!row) {
          return;
        }

        const normalizedDraft = normalizeDraftValue(config.key, value);
        const normalizedBase = normalizeRowValue(config.key, row);
        if (normalizedDraft !== normalizedBase) {
          dirtyIds.add(studentId);
        }
      });

      accumulator[config.key] = dirtyIds;
      return accumulator;
    }, {
      participation: new Set<string>(),
      homeworks: new Set<string>(),
      remarks: new Set<string>(),
    });
  }, [drafts, rows]);

  const hasAssignments = classOptions.length > 0;
  const showEmptySelectionState = !allRequiredFiltersSelected && hasAssignments;
  const showNoStudentState =
    allRequiredFiltersSelected && !loading && !loadError && rows.length === 0;

  const selectedMonthLabel = useMemo(() => {
    const activeOption = monthOptions.find((option) => option.value === filters.month);
    return activeOption?.label ?? filters.month;
  }, [filters.month, monthOptions]);

  const activeSummary = useMemo(() => {
    if (!gridData) {
      return null;
    }

    return [gridData.class_group.name, gridData.module.name, selectedMonthLabel].filter(Boolean);
  }, [gridData, selectedMonthLabel]);

  const updateFilter = (
    key: keyof MonthlyEvaluationFilterState,
    value: string
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      class_group_id: "",
      month: currentMonthValue,
      module_id: "",
    });
  };

  const setSectionFeedback = (
    section: SectionKey,
    nextValue: { tone: "success" | "error"; message: string } | null
  ) => {
    setFeedback((previous) => ({
      ...previous,
      [section]: nextValue,
    }));
  };

  const handleSectionValueChange = (
    section: SectionKey,
    studentId: string,
    value: string
  ) => {
    const row = rows.find((item) => item.student_id === studentId);
    if (!row) {
      return;
    }

    const nextError = validateDraftValue(section, value, language);
    const normalizedValue = normalizeDraftValue(section, value);
    const normalizedBase = normalizeRowValue(section, row);
    const shouldPersistDraft = normalizedValue !== normalizedBase;

    setDrafts((previous) => {
      const nextSection = { ...previous[section] };
      if (shouldPersistDraft) {
        nextSection[studentId] = value;
      } else {
        delete nextSection[studentId];
      }

      return {
        ...previous,
        [section]: nextSection,
      };
    });

    setErrors((previous) => {
      const nextSection = { ...previous[section] };
      if (nextError) {
        nextSection[studentId] = nextError;
      } else {
        delete nextSection[studentId];
      }

      return {
        ...previous,
        [section]: nextSection,
      };
    });

    if (feedback[section]) {
      setSectionFeedback(section, null);
    }
  };

  const handleCellKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    section: SectionKey,
    rowIndex: number
  ) => {
    if (event.key !== "Enter" && event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();

    const direction = event.key === "ArrowUp" ? -1 : 1;
    const nextIndex = rowIndex + direction;
    const nextCell = document.querySelector<HTMLInputElement>(
      `[data-grid-section="${section}"][data-grid-row="${nextIndex}"]`
    );
    if (nextCell) {
      nextCell.focus();
      nextCell.select();
    }
  };

  const handleSectionSave = async (section: SectionKey) => {
    if (!allRequiredFiltersSelected) {
      return;
    }

    if (Object.keys(errors[section]).length > 0) {
      setSectionFeedback(section, {
        tone: "error",
        message: getTranslation("monthlyEvaluationFixErrors", language),
      });
      return;
    }

    const sectionConfig = SECTION_CONFIGS.find((config) => config.key === section);
    if (!sectionConfig) {
      return;
    }

    const updates: BatchMonthlyEvaluationUpdate[] = Array.from(
      dirtyIdsBySection[section]
    ).map((studentId) => {
      const rawValue = drafts[section][studentId] ?? "";
      const normalizedValue = normalizeDraftValue(section, rawValue);
      return {
        student_id: studentId,
        [sectionConfig.field]: normalizedValue,
      };
    });

    if (!updates.length) {
      return;
    }

    const csrfToken = getCSRFToken() ?? "";
    setSaving((previous) => ({ ...previous, [section]: true }));
    setSectionFeedback(section, null);

    const response = await teacher_dashboard_client.batch_patch_monthly_evaluations(
      {
        class_group_id: filters.class_group_id,
        module_id: filters.module_id,
        month: filters.month,
        updates,
      },
      csrfToken
    );

    if (response.ok) {
      const updatedRecords = ((response.data as { updated_records?: MonthlyEvaluation[] })
        ?.updated_records ?? []) as MonthlyEvaluation[];
      const updatesByStudentId = new Map(
        updatedRecords.map((record) => [record.student.student_id, record])
      );

      setRows((previous) =>
        previous.map((row) => {
          const updated = updatesByStudentId.get(row.student_id);
          if (!updated) {
            return row;
          }

          return {
            ...row,
            evaluation_id: updated.id,
            mark_of_participation_in_class:
              updated.mark_of_participation_in_class ?? null,
            homeworks_mark: updated.homeworks_mark ?? null,
            remarks: updated.remarks ?? null,
            updated_at: updated.updated_at,
          };
        })
      );

      setDrafts((previous) => ({
        ...previous,
        [section]: {},
      }));
      setErrors((previous) => ({
        ...previous,
        [section]: {},
      }));

      const successMessage = getTranslation("monthlyEvaluationSectionSaved", language);
      setSectionFeedback(section, {
        tone: "success",
        message: successMessage,
      });
      addNotification({
        id: "",
        title: getTranslation(sectionConfig.titleKey, language),
        message: successMessage,
        type: "success",
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else {
      const errorMessage = getTranslation("monthlyEvaluationSectionSaveFailed", language);
      setSectionFeedback(section, {
        tone: "error",
        message: errorMessage,
      });
      addNotification({
        id: "",
        title: getTranslation(sectionConfig.titleKey, language),
        message: errorMessage,
        type: "error",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    setSaving((previous) => ({ ...previous, [section]: false }));
  };

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
                    {getTranslation("monthlyEvaluation", language)}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getTranslation("monthlyEvaluationSpreadsheetDescription", language)}
                  </p>
                </div>
              </div>

              <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                <Filter className="h-4 w-4" />
                <span>{getTranslation("monthlyEvaluationFilterHint", language)}</span>
              </div>

              {activeSummary?.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  {activeSummary.map((summaryItem) => (
                    <span
                      key={summaryItem}
                      className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200"
                    >
                      {summaryItem}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid w-full gap-3 md:grid-cols-4 lg:max-w-4xl">
              <FilterSelect
                label={getTranslation("classesFilter", language)}
                value={filters.class_group_id}
                onChange={(value) => updateFilter("class_group_id", value)}
                options={classOptions}
                placeholder={getTranslation("selectClassPlaceholder", language)}
              />
              <FilterSelect
                label={getTranslation("evaluationMonth", language)}
                value={filters.month}
                onChange={(value) => updateFilter("month", value)}
                options={monthOptions}
                placeholder={getTranslation("evaluationMonth", language)}
              />
              <FilterSelect
                label={getTranslation("module", language)}
                value={filters.module_id}
                onChange={(value) => updateFilter("module_id", value)}
                options={moduleOptions}
                placeholder={getTranslation("monthlyEvaluationSelectModule", language)}
                disabled={!filters.class_group_id || moduleOptions.length === 0}
              />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-11 w-full rounded-2xl border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:border-primary-300 hover:text-primary-700 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-500 dark:hover:text-primary-200"
                >
                  {getTranslation("clearFilters", language)}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {!hasAssignments ? (
            <StateCard
              tone="muted"
              title={getTranslation("noMonthlyEvaluationAssignments", language)}
              description={getTranslation("monthlyEvaluationAssignmentsHint", language)}
            />
          ) : null}

          {showEmptySelectionState ? (
            <StateCard
              tone="muted"
              title={getTranslation("monthlyEvaluationSelectFilters", language)}
              description={getTranslation("monthlyEvaluationSelectFiltersHint", language)}
            />
          ) : null}

          {loadError ? (
            <StateCard
              tone="error"
              title={loadError}
              description={getTranslation("monthlyEvaluationLoadRetryHint", language)}
            />
          ) : null}

          {showNoStudentState ? (
            <StateCard
              tone="muted"
              title={getTranslation("monthlyEvaluationNoStudentsForFilters", language)}
              description={getTranslation("monthlyEvaluationNoStudentsForFiltersHint", language)}
            />
          ) : null}
        </div>
      </section>

      {allRequiredFiltersSelected && !loadError && (loading || rows.length > 0) ? (
        <div className="space-y-6">
          {SECTION_CONFIGS.map((config) => (
            <SpreadsheetSection
              key={config.key}
              config={config}
              rows={rows}
              loading={loading}
              language={language}
              dirtyIds={dirtyIdsBySection[config.key]}
              values={drafts[config.key]}
              errors={errors[config.key]}
              feedback={feedback[config.key]}
              saving={saving[config.key]}
              onValueChange={handleSectionValueChange}
              onKeyDown={handleCellKeyDown}
              onSave={handleSectionSave}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const SpreadsheetSection: React.FC<SpreadsheetSectionProps> = ({
  config,
  rows,
  loading,
  language,
  dirtyIds,
  values,
  errors,
  feedback,
  saving,
  onValueChange,
  onKeyDown,
  onSave,
}) => {
  const Icon = config.icon;
  const disableSave = dirtyIds.size === 0 || Object.keys(errors).length > 0 || saving;

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`rounded-2xl p-3 ${config.accentClasses.icon}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getTranslation(config.titleKey, language)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation(config.subtitleKey, language)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-3 py-1 font-semibold ${config.accentClasses.badge}`}>
                {dirtyIds.size} {getTranslation("monthlyEvaluationUnsavedRows", language)}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                {getTranslation("monthlyEvaluationKeyboardHint", language)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 lg:items-end">
            <button
              type="button"
              onClick={() => onSave(config.key)}
              disabled={disableSave}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition ${config.accentClasses.button}`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{getTranslation("monthlyEvaluationSaveChanges", language)}</span>
            </button>

            {feedback ? (
              <p
                className={`text-sm ${
                  feedback.tone === "success"
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-rose-600 dark:text-rose-300"
                }`}
              >
                {feedback.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 px-6 py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{getTranslation("loading", language)}</span>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  {getTranslation("studentName", language)}
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  {getTranslation("monthlyEvaluationClassColumn", language)}
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  {getTranslation("module", language)}
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  {getTranslation(config.inputLabelKey, language)}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const dirty = dirtyIds.has(row.student_id);
                const value = values[row.student_id] ?? getInputValue(config.key, row);
                const error = errors[row.student_id];

                return (
                  <tr
                    key={`${config.key}-${row.student_id}`}
                    className={dirty ? config.accentClasses.row : ""}
                  >
                    <td className="border-b border-gray-100 px-4 py-3 align-top text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{row.student_name}</span>
                        {dirty ? (
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                        ) : null}
                      </div>
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 align-top text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
                      {row.class_name}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 align-top text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
                      {row.module_name}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 align-top dark:border-gray-700">
                      <input
                        type={config.inputType}
                        inputMode={config.inputType === "number" ? "decimal" : undefined}
                        step={config.inputType === "number" ? "0.25" : undefined}
                        min={config.inputType === "number" ? "0" : undefined}
                        max={config.inputType === "number" ? "20" : undefined}
                        value={value}
                        onChange={(event) =>
                          onValueChange(config.key, row.student_id, event.target.value)
                        }
                        onKeyDown={(event) => onKeyDown(event, config.key, rowIndex)}
                        data-grid-section={config.key}
                        data-grid-row={rowIndex}
                        placeholder={
                          config.inputType === "number"
                            ? "0 - 20"
                            : getTranslation("monthlyEvaluationRemarksPlaceholder", language)
                        }
                        className={`w-full rounded-2xl border px-3 py-2.5 text-sm text-gray-900 outline-none transition dark:bg-gray-900 dark:text-white ${
                          error
                            ? "border-rose-300 focus:ring-rose-500 dark:border-rose-500"
                            : `border-gray-300 dark:border-gray-600 ${config.accentClasses.focus}`
                        } focus:ring-2`}
                      />
                      {error ? (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{error}</p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

type FilterSelectProps = {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const FilterSelect: React.FC<FilterSelectProps> = ({
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

type StateCardProps = {
  tone: "muted" | "error";
  title: string;
  description: string;
};

const StateCard: React.FC<StateCardProps> = ({ tone, title, description }) => {
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

function getInputValue(section: SectionKey, row: MonthlyEvaluationGridRow) {
  if (section === "remarks") {
    return row.remarks ?? "";
  }

  if (section === "participation") {
    return row.mark_of_participation_in_class == null
      ? ""
      : String(row.mark_of_participation_in_class);
  }

  return row.homeworks_mark == null ? "" : String(row.homeworks_mark);
}

function normalizeDraftValue(section: SectionKey, value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (section === "remarks") {
    return trimmed;
  }

  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? trimmed : parsed;
}

function normalizeRowValue(section: SectionKey, row: MonthlyEvaluationGridRow) {
  if (section === "remarks") {
    return row.remarks?.trim() || null;
  }

  if (section === "participation") {
    return row.mark_of_participation_in_class ?? null;
  }

  return row.homeworks_mark ?? null;
}

function validateDraftValue(section: SectionKey, value: string, language: string) {
  if (section === "remarks") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return getTranslation("monthlyEvaluationNumericValueError", language);
  }

  if (parsed < 0 || parsed > 20) {
    return getTranslation("monthlyEvaluationMarkRangeError", language);
  }

  return "";
}

export default MonthylEvaluation;