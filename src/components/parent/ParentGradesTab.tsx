import React, { useEffect, useMemo, useState } from "react";
import { Student } from "../../models/Student";
import { ParentReadOnlyGradesResponse } from "../../models/StudentGrade";
import { parent_dashboard_client } from "../../services/http_api/parent-dashboard/parent_dashboard_client";
import ReadOnlyGradesBoard, {
  ReadOnlyGradesFilterSelect,
} from "../shared/ReadOnlyGradesBoard";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

type ParentGradesTabProps = {
  selectedStudent: Student | null;
};

const ParentGradesTab: React.FC<ParentGradesTabProps> = ({ selectedStudent }) => {
  const { language } = useLanguage();
  const [moduleId, setModuleId] = useState("");
  const [semester, setSemester] = useState<"s1" | "s2" | "s3">("s1");
  const [data, setData] = useState<ParentReadOnlyGradesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setModuleId("");
    setData(null);
    setLoadError("");
  }, [selectedStudent?.student_id]);

  useEffect(() => {
    if (!selectedStudent?.student_id) {
      setData(null);
      setLoadError("");
      return;
    }

    let cancelled = false;

    const loadSections = async () => {
      setLoading(true);
      setLoadError("");

      const response = await parent_dashboard_client.get_current_parent_grade_sections(
        selectedStudent.student_id,
        semester,
        moduleId || undefined
      );
      if (cancelled) {
        return;
      }

      if (response.ok) {
        setData(response.data);
      } else {
        setData(null);
        setLoadError(getTranslation("gradesLoadFailed", language));
      }

      setLoading(false);
    };

    void loadSections();

    return () => {
      cancelled = true;
    };
  }, [selectedStudent?.student_id, semester, moduleId, language]);

  const moduleOptions = useMemo(
    () =>
      (data?.available_modules ?? []).map((module) => ({
        value: module.id,
        label: module.name,
      })),
    [data]
  );

  const semesterOptions = useMemo(
    () => [
      { value: "s1", label: getTranslation("firstSemester", language) },
      { value: "s2", label: getTranslation("secondSemester", language) },
      { value: "s3", label: getTranslation("thirdSemester", language) },
    ],
    [language]
  );

  const summaryBadges = data
    ? [
        data.student.name,
        data.module?.name ?? getTranslation("allSubjects", language),
        getTranslation(
          data.semester === "s1"
            ? "firstSemester"
            : data.semester === "s2"
              ? "secondSemester"
              : "thirdSemester",
          language
        ),
      ]
    : selectedStudent
      ? [selectedStudent.full_name]
      : [];

  return (
    <ReadOnlyGradesBoard
      title={getTranslation("gradesOfMyKids", language)}
      description={getTranslation("parentGradesReadOnlyDescription", language)}
      filterHint={getTranslation("parentGradesFilterHint", language)}
      filters={
        <>
          <div className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("studentName", language)}</span>
            <div className="flex h-11 items-center rounded-2xl border border-gray-300 bg-gray-50 px-4 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
              {selectedStudent?.full_name ?? getTranslation("selectStudent", language)}
            </div>
          </div>
          <ReadOnlyGradesFilterSelect
            label={getTranslation("optionalModule", language)}
            value={moduleId}
            onChange={setModuleId}
            options={moduleOptions}
            placeholder={getTranslation("allSubjects", language)}
            disabled={!selectedStudent}
          />
          <ReadOnlyGradesFilterSelect
            label={getTranslation("semester", language)}
            value={semester}
            onChange={(value) => setSemester(value as "s1" | "s2" | "s3")}
            options={semesterOptions}
            placeholder={getTranslation("selectSemesterPlaceholder", language)}
            disabled={!selectedStudent}
          />
        </>
      }
      summaryBadges={summaryBadges}
      loading={loading}
      error={loadError}
      isReady={Boolean(selectedStudent?.student_id)}
      sections={data?.sections ?? null}
      columns={[
        { key: "student_name", labelKey: "studentName" },
        { key: "class_name", labelKey: "class" },
        { key: "module_name", labelKey: "module" },
        { key: "teacher_name", labelKey: "teacher" },
        { key: "mark", labelKey: "marks" },
      ]}
      notReadyTitle={getTranslation("parentGradesSelectStudent", language)}
      notReadyDescription={getTranslation("parentGradesSelectStudentHint", language)}
      emptyTitle={getTranslation("gradesNoDataForSelection", language)}
      emptyDescription={getTranslation("gradesNoDataForSelectionHint", language)}
    />
  );
};

export default ParentGradesTab;