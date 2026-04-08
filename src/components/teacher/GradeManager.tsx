import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ClipboardCheck,
  FileText,
  Filter,
  Loader2,
  Save,
  Search,
  Users,
} from "lucide-react";
import { GradeManagerProps } from "../../types";
import {
  GradeGridSectionKey,
  StudentGradeGridRow,
  TeacherStudentGradesGridResponse,
} from "../../models/StudentGrade";
import {
  BatchStudentGradesSectionUpdate,
  TeacherStudentGradesFilters,
} from "../../services/http_api/payloads_types/teacher_client_payload_types";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { useNotifications } from "../../contexts/NotificationContext";

type SectionKey = GradeGridSectionKey;

type GradeFilterState = {
  class_group_id: string;
  module_id: string;
  semester: "" | "s1" | "s2" | "s3";
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
  inputLabelKey: string;
  field: keyof Pick<
    StudentGradeGridRow,
    "evaluation_mark" | "devoir1_mark" | "devoir2_mark" | "exam_mark" | "average_mark"
  >;
  icon: React.ComponentType<{ className?: string }>;
  accentClasses: {
    icon: string;
    badge: string;
    row: string;
    focus: string;
    button: string;
    selected: string;
  };
};

type SpreadsheetSectionProps = {
  config: SectionConfig;
  rows: StudentGradeGridRow[];
  loading: boolean;
  language: string;
  dirtyIds: Set<string>;
  values: Record<string, string>;
  errors: Record<string, string>;
  feedback: { tone: "success" | "error"; message: string } | null;
  saving: boolean;
  activeStudentId: string;
  onValueChange: (section: SectionKey, studentId: string, value: string) => void;
  onKeyDown: (
    event: React.KeyboardEvent<HTMLInputElement>,
    section: SectionKey,
    rowIndex: number,
    studentId: string
  ) => void;
  onSave: (section: SectionKey) => void;
  onStudentFocus: (studentId: string) => void;
};

const createEmptySectionDraftState = (): SectionDraftState => ({
  evaluation: {},
  devoir_1: {},
  devoir_2: {},
  exam: {},
  average: {},
});

const createEmptySectionErrorState = (): SectionErrorState => ({
  evaluation: {},
  devoir_1: {},
  devoir_2: {},
  exam: {},
  average: {},
});

const createEmptySectionSavingState = (): SectionSavingState => ({
  evaluation: false,
  devoir_1: false,
  devoir_2: false,
  exam: false,
  average: false,
});

const createEmptySectionFeedbackState = (): SectionFeedbackState => ({
  evaluation: null,
  devoir_1: null,
  devoir_2: null,
  exam: null,
  average: null,
});

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "evaluation",
    titleKey: "gradeEvaluationSectionTitle",
    subtitleKey: "gradeEvaluationSectionHint",
    inputLabelKey: "evaluationMark",
    field: "evaluation_mark",
    icon: ClipboardCheck,
    accentClasses: {
      icon: "bg-sky-100 text-sky-700",
      badge: "bg-sky-50 text-sky-700",
      row: "bg-sky-50/70",
      focus: "focus:ring-sky-500",
      button: "bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300",
      selected: "ring-sky-300 bg-sky-50/80",
    },
  },
  {
    key: "devoir_1",
    titleKey: "gradeDevoirOneSectionTitle",
    subtitleKey: "gradeDevoirOneSectionHint",
    inputLabelKey: "devoir1Mark",
    field: "devoir1_mark",
    icon: FileText,
    accentClasses: {
      icon: "bg-amber-100 text-amber-700",
      badge: "bg-amber-50 text-amber-700",
      row: "bg-amber-50/70",
      focus: "focus:ring-amber-500",
      button: "bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300",
      selected: "ring-amber-300 bg-amber-50/80",
    },
  },
  {
    key: "devoir_2",
    titleKey: "gradeDevoirTwoSectionTitle",
    subtitleKey: "gradeDevoirTwoSectionHint",
    inputLabelKey: "devoir2Mark",
    field: "devoir2_mark",
    icon: FileText,
    accentClasses: {
      icon: "bg-rose-100 text-rose-700",
      badge: "bg-rose-50 text-rose-700",
      row: "bg-rose-50/70",
      focus: "focus:ring-rose-500",
      button: "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300",
      selected: "ring-rose-300 bg-rose-50/80",
    },
  },
  {
    key: "exam",
    titleKey: "gradeExamSectionTitle",
    subtitleKey: "gradeExamSectionHint",
    inputLabelKey: "examMark",
    field: "exam_mark",
    icon: FileText,
    accentClasses: {
      icon: "bg-violet-100 text-violet-700",
      badge: "bg-violet-50 text-violet-700",
      row: "bg-violet-50/70",
      focus: "focus:ring-violet-500",
      button: "bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300",
      selected: "ring-violet-300 bg-violet-50/80",
    },
  },
  {
    key: "average",
    titleKey: "gradeAverageSectionTitle",
    subtitleKey: "gradeAverageSectionHint",
    inputLabelKey: "averageMark",
    field: "average_mark",
    icon: ClipboardCheck,
    accentClasses: {
      icon: "bg-emerald-100 text-emerald-700",
      badge: "bg-emerald-50 text-emerald-700",
      row: "bg-emerald-50/70",
      focus: "focus:ring-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300",
      selected: "ring-emerald-300 bg-emerald-50/80",
    },
  },
];

const GradeManager: React.FC<GradeManagerProps> = ({ modules_class_groups }) => {
  const { language } = useLanguage();
  const { addNotification } = useNotifications();
  const [filters, setFilters] = useState<GradeFilterState>({
    class_group_id: "",
    module_id: "",
    semester: "",
  });
  const [gridData, setGridData] = useState<TeacherStudentGradesGridResponse | null>(null);
  const [rows, setRows] = useState<StudentGradeGridRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [activeStudentId, setActiveStudentId] = useState("");
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

  const semesterOptions = useMemo(
    () => [
      { value: "s1", label: getTranslation("firstSemester", language) },
      { value: "s2", label: getTranslation("secondSemester", language) },
      { value: "s3", label: getTranslation("thirdSemester", language) },
    ],
    [language]
  );

  const allRequiredFiltersSelected = Boolean(
    filters.class_group_id && filters.module_id && filters.semester
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
      setStudentSearch("");
      setActiveStudentId("");
      setDrafts(createEmptySectionDraftState());
      setErrors(createEmptySectionErrorState());
      setFeedback(createEmptySectionFeedbackState());
      return;
    }

    const requestFilters: TeacherStudentGradesFilters = {
      class_group_id: filters.class_group_id,
      module_id: filters.module_id,
      semester: filters.semester as "s1" | "s2" | "s3",
    };
    let cancelled = false;

    const loadRows = async () => {
      setLoading(true);
      setLoadError("");

      const response = await teacher_dashboard_client.get_grade_grid(requestFilters);
      if (cancelled) {
        return;
      }

      if (response.ok) {
        const nextGridData = response.data as TeacherStudentGradesGridResponse;
        setGridData(nextGridData);
        setRows(nextGridData.rows ?? []);
        setActiveStudentId(nextGridData.rows[0]?.student_id ?? "");
        setDrafts(createEmptySectionDraftState());
        setErrors(createEmptySectionErrorState());
        setFeedback(createEmptySectionFeedbackState());
      } else {
        setGridData(null);
        setRows([]);
        setActiveStudentId("");
        setLoadError(getTranslation("gradesLoadFailed", language));
      }

      setLoading(false);
    };

    void loadRows();

    return () => {
      cancelled = true;
    };
  }, [allRequiredFiltersSelected, filters, language]);

  const visibleRows = useMemo(() => {
    const normalizedSearch = studentSearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) => {
      const searchableValue = `${row.student_name} ${row.class_name}`.toLowerCase();
      return searchableValue.includes(normalizedSearch);
    });
  }, [rows, studentSearch]);

  useEffect(() => {
    if (!visibleRows.length) {
      return;
    }

    const hasActiveVisibleStudent = visibleRows.some(
      (row) => row.student_id === activeStudentId
    );
    if (!hasActiveVisibleStudent) {
      setActiveStudentId(visibleRows[0]?.student_id ?? "");
    }
  }, [activeStudentId, visibleRows]);

  const dirtyIdsBySection = useMemo(() => {
    return SECTION_CONFIGS.reduce<Record<SectionKey, Set<string>>>(
      (accumulator, config) => {
        const dirtyIds = new Set<string>();
        Object.entries(drafts[config.key]).forEach(([studentId, value]) => {
          const row = rows.find((item) => item.student_id === studentId);
          if (!row) {
            return;
          }

          const normalizedDraft = normalizeDraftValue(value);
          const normalizedBase = normalizeRowValue(row, config.field);
          if (normalizedDraft !== normalizedBase) {
            dirtyIds.add(studentId);
          }
        });

        accumulator[config.key] = dirtyIds;
        return accumulator;
      },
      {
        evaluation: new Set<string>(),
        devoir_1: new Set<string>(),
        devoir_2: new Set<string>(),
        exam: new Set<string>(),
        average: new Set<string>(),
      }
    );
  }, [drafts, rows]);

  const hasAssignments = classOptions.length > 0;
  const showEmptySelectionState = !allRequiredFiltersSelected && hasAssignments;
  const showNoStudentState =
    allRequiredFiltersSelected && !loading && !loadError && rows.length === 0;
  const showNoSearchResultState =
    allRequiredFiltersSelected && !loading && !loadError && rows.length > 0 && visibleRows.length === 0;

  const activeSummary = useMemo(() => {
    if (!gridData) {
      return null;
    }

    const semesterLabel = semesterOptions.find(
      (option) => option.value === gridData.semester
    )?.label;

    return [gridData.class_group.name, gridData.module.name, semesterLabel].filter(Boolean);
  }, [gridData, semesterOptions]);

  const updateFilter = (key: keyof GradeFilterState, value: string) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      class_group_id: "",
      module_id: "",
      semester: "",
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

  const focusGridCell = (section: SectionKey, studentId: string) => {
    const cell = document.querySelector<HTMLInputElement>(
      `[data-grid-section="${section}"][data-student-id="${studentId}"]`
    );
    if (cell) {
      cell.focus();
      cell.select();
    }
  };

  const handleStudentSelection = (studentId: string) => {
    setActiveStudentId(studentId);
    window.requestAnimationFrame(() => {
      focusGridCell("evaluation", studentId);
    });
  };

  const handleSectionValueChange = (
    section: SectionKey,
    studentId: string,
    value: string
  ) => {
    const config = SECTION_CONFIGS.find((item) => item.key === section);
    const row = rows.find((item) => item.student_id === studentId);
    if (!config || !row) {
      return;
    }

    const nextError = validateDraftValue(value, language);
    const normalizedValue = normalizeDraftValue(value);
    const normalizedBase = normalizeRowValue(row, config.field);
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
    rowIndex: number,
    studentId: string
  ) => {
    const allowedKeys = ["Enter", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
    if (!allowedKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const currentSectionIndex = SECTION_CONFIGS.findIndex(
        (config) => config.key === section
      );
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const nextSection = SECTION_CONFIGS[currentSectionIndex + offset]?.key;
      if (nextSection) {
        focusGridCell(nextSection, studentId);
      }
      return;
    }

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
        message: getTranslation("gradesFixErrors", language),
      });
      return;
    }

    const updates: BatchStudentGradesSectionUpdate[] = Array.from(
      dirtyIdsBySection[section]
    ).map((studentId) => ({
      student_id: studentId,
      value: normalizeDraftValue(drafts[section][studentId] ?? "") as number | null,
    }));

    if (!updates.length) {
      return;
    }

    const csrfToken = getCSRFToken() ?? "";
    setSaving((previous) => ({ ...previous, [section]: true }));
    setSectionFeedback(section, null);

    const response = await teacher_dashboard_client.batch_patch_student_grades_section(
      {
        class_group_id: filters.class_group_id,
        module_id: filters.module_id,
        semester: filters.semester as "s1" | "s2" | "s3",
        section,
        updates,
      },
      csrfToken
    );

    if (response.ok) {
      const updatedRows = ((response.data as { updated_rows?: StudentGradeGridRow[] })
        ?.updated_rows ?? []) as StudentGradeGridRow[];
      const updatesByStudentId = new Map(
        updatedRows.map((row) => [row.student_id, row])
      );

      setRows((previous) =>
        previous.map((row) => updatesByStudentId.get(row.student_id) ?? row)
      );
      setDrafts((previous) => ({
        ...previous,
        [section]: {},
      }));
      setErrors((previous) => ({
        ...previous,
        [section]: {},
      }));

      const successMessage = getTranslation("gradesSectionSaved", language);
      const config = SECTION_CONFIGS.find((item) => item.key === section);
      setSectionFeedback(section, {
        tone: "success",
        message: successMessage,
      });
      addNotification({
        id: "",
        title: config ? getTranslation(config.titleKey, language) : getTranslation("marks", language),
        message: successMessage,
        type: "success",
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else {
      const errorMessage = getTranslation("gradesSectionSaveFailed", language);
      const config = SECTION_CONFIGS.find((item) => item.key === section);
      setSectionFeedback(section, {
        tone: "error",
        message: errorMessage,
      });
      addNotification({
        id: "",
        title: config ? getTranslation(config.titleKey, language) : getTranslation("marks", language),
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
                    {getTranslation("marks", language)}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getTranslation("gradesSpreadsheetDescription", language)}
                  </p>
                </div>
              </div>

              <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                <Filter className="h-4 w-4" />
                <span>{getTranslation("gradesFilterHint", language)}</span>
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
                label={getTranslation("module", language)}
                value={filters.module_id}
                onChange={(value) => updateFilter("module_id", value)}
                options={moduleOptions}
                placeholder={getTranslation("monthlyEvaluationSelectModule", language)}
                disabled={!filters.class_group_id || moduleOptions.length === 0}
              />
              <FilterSelect
                label={getTranslation("semester", language)}
                value={filters.semester}
                onChange={(value) => updateFilter("semester", value)}
                options={semesterOptions}
                placeholder={getTranslation("selectSemesterPlaceholder", language)}
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
              title={getTranslation("noGradeAssignments", language)}
              description={getTranslation("gradeAssignmentsHint", language)}
            />
          ) : null}

          {showEmptySelectionState ? (
            <StateCard
              tone="muted"
              title={getTranslation("gradesSelectFilters", language)}
              description={getTranslation("gradesSelectFiltersHint", language)}
            />
          ) : null}

          {loadError ? (
            <StateCard
              tone="error"
              title={loadError}
              description={getTranslation("gradesLoadRetryHint", language)}
            />
          ) : null}

          {showNoStudentState ? (
            <StateCard
              tone="muted"
              title={getTranslation("gradesNoStudentsForFilters", language)}
              description={getTranslation("gradesNoStudentsForFiltersHint", language)}
            />
          ) : null}

          {showNoSearchResultState ? (
            <StateCard
              tone="muted"
              title={getTranslation("gradesNoSearchResults", language)}
              description={getTranslation("gradesNoSearchResultsHint", language)}
            />
          ) : null}
        </div>
      </section>

      {allRequiredFiltersSelected && !loadError && (loading || rows.length > 0) ? (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {getTranslation("gradesStudentListTitle", language)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getTranslation("gradesStudentListHint", language)}
                  </p>
                </div>
              </div>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder={getTranslation("gradesSearchPlaceholder", language)}
                  className="h-11 w-full rounded-2xl border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-400 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <span>{getTranslation("studentName", language)}</span>
              <span>{visibleRows.length}/{rows.length}</span>
            </div>

            <div className="max-h-[540px] overflow-auto px-3 py-3">
              {loading ? (
                <div className="flex items-center justify-center gap-3 px-4 py-10 text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{getTranslation("loading", language)}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleRows.map((row) => {
                    const isActive = row.student_id === activeStudentId;
                    return (
                      <button
                        key={row.student_id}
                        type="button"
                        onClick={() => handleStudentSelection(row.student_id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-primary-300 bg-primary-50 shadow-sm dark:border-primary-500 dark:bg-primary-900/20"
                            : "border-gray-200 bg-gray-50 hover:border-primary-200 hover:bg-white dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-primary-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {row.student_name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {row.class_name}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                            {getFilledValuesCount(row)}/5
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <div className="space-y-6">
            {SECTION_CONFIGS.map((config) => (
              <SpreadsheetSection
                key={config.key}
                config={config}
                rows={visibleRows}
                loading={loading}
                language={language}
                dirtyIds={dirtyIdsBySection[config.key]}
                values={drafts[config.key]}
                errors={errors[config.key]}
                feedback={feedback[config.key]}
                saving={saving[config.key]}
                activeStudentId={activeStudentId}
                onValueChange={handleSectionValueChange}
                onKeyDown={handleCellKeyDown}
                onSave={handleSectionSave}
                onStudentFocus={setActiveStudentId}
              />
            ))}
          </div>
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
  activeStudentId,
  onValueChange,
  onKeyDown,
  onSave,
  onStudentFocus,
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
                {dirtyIds.size} {getTranslation("gradesUnsavedRows", language)}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                {getTranslation("gradesKeyboardHint", language)}
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
              <span>{getTranslation("gradesSaveChanges", language)}</span>
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
        <div className="max-h-[420px] overflow-auto">
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
                  {getTranslation(config.inputLabelKey, language)}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const dirty = dirtyIds.has(row.student_id);
                const value = values[row.student_id] ?? getInputValue(row, config.field);
                const error = errors[row.student_id];
                const isActive = row.student_id === activeStudentId;

                return (
                  <tr
                    key={`${config.key}-${row.student_id}`}
                    className={dirty ? config.accentClasses.row : ""}
                  >
                    <td
                      className={`border-b border-gray-100 px-4 py-3 align-top text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-white ${
                        isActive ? config.accentClasses.selected : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{row.student_name}</span>
                        {dirty ? <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" /> : null}
                      </div>
                    </td>
                    <td
                      className={`border-b border-gray-100 px-4 py-3 align-top text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300 ${
                        isActive ? config.accentClasses.selected : ""
                      }`}
                    >
                      {row.class_name}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 align-top dark:border-gray-700">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        max="20"
                        value={value}
                        onChange={(event) =>
                          onValueChange(config.key, row.student_id, event.target.value)
                        }
                        onKeyDown={(event) =>
                          onKeyDown(event, config.key, rowIndex, row.student_id)
                        }
                        onFocus={() => onStudentFocus(row.student_id)}
                        data-grid-section={config.key}
                        data-grid-row={rowIndex}
                        data-student-id={row.student_id}
                        placeholder="0 - 20"
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

function getInputValue(
  row: StudentGradeGridRow,
  field: SectionConfig["field"]
) {
  const value = row[field];
  return value == null ? "" : String(value);
}

function normalizeDraftValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? trimmed : parsed;
}

function normalizeRowValue(
  row: StudentGradeGridRow,
  field: SectionConfig["field"]
) {
  return row[field] ?? null;
}

function validateDraftValue(value: string, language: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return getTranslation("gradesNumericValueError", language);
  }

  if (parsed < 0 || parsed > 20) {
    return getTranslation("gradesMarkRangeError", language);
  }

  return "";
}

function getFilledValuesCount(row: StudentGradeGridRow) {
  return [
    row.evaluation_mark,
    row.devoir1_mark,
    row.devoir2_mark,
    row.exam_mark,
    row.average_mark,
  ].filter((value) => value !== null && value !== undefined).length;
}

export default GradeManager;
