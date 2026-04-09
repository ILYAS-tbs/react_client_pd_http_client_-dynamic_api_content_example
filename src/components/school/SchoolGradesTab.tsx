import React, { useEffect, useMemo, useState } from "react";
import { ClassGroup } from "../../models/ClassGroups";
import { Module } from "../../models/Module";
import { SchoolReadOnlyGradesResponse } from "../../models/StudentGrade";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import ReadOnlyGradesBoard, {
  ReadOnlyGradesFilterSelect,
} from "../shared/ReadOnlyGradesBoard";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

type SchoolGradesTabProps = {
  classGroups: ClassGroup[];
  modules: Module[];
};

const SchoolGradesTab: React.FC<SchoolGradesTabProps> = ({ classGroups, modules }) => {
  const { language } = useLanguage();
  const [filters, setFilters] = useState<{
    class_group_id: string;
    module_id: string;
    semester: "s1" | "s2" | "s3";
  }>({
    class_group_id: "",
    module_id: "",
    semester: "s1",
  });
  const [data, setData] = useState<SchoolReadOnlyGradesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setFilters((previous) => ({
      class_group_id:
        classGroups.some((item) => item.class_group_id === previous.class_group_id)
          ? previous.class_group_id
          : classGroups[0]?.class_group_id ?? "",
      module_id: modules.some((item) => item.module_id === previous.module_id)
        ? previous.module_id
        : modules[0]?.module_id ?? "",
      semester: previous.semester,
    }));
  }, [classGroups, modules]);

  useEffect(() => {
    if (!filters.class_group_id || !filters.module_id || !filters.semester) {
      setData(null);
      setLoadError("");
      return;
    }

    let cancelled = false;

    const loadSections = async () => {
      setLoading(true);
      setLoadError("");

      const response = await school_dashboard_client.get_current_school_grade_sections(filters);
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
  }, [filters, language]);

  const classOptions = useMemo(
    () =>
      classGroups
        .map((classGroup) => ({
          value: classGroup.class_group_id,
          label: classGroup.name,
        }))
        .sort((left, right) => left.label.localeCompare(right.label)),
    [classGroups]
  );

  const moduleOptions = useMemo(
    () =>
      modules
        .map((module) => ({
          value: module.module_id,
          label: module.module_name,
        }))
        .sort((left, right) => left.label.localeCompare(right.label)),
    [modules]
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
        data.class_group.name,
        data.module.name,
        getTranslation(
          data.semester === "s1"
            ? "firstSemester"
            : data.semester === "s2"
              ? "secondSemester"
              : "thirdSemester",
          language
        ),
      ]
    : [];

  return (
    <ReadOnlyGradesBoard
      title={getTranslation("marks", language)}
      description={getTranslation("schoolGradesReadOnlyDescription", language)}
      filterHint={getTranslation("gradesReadOnlyFilterHint", language)}
      filters={
        <>
          <ReadOnlyGradesFilterSelect
            label={getTranslation("classesFilter", language)}
            value={filters.class_group_id}
            onChange={(value) =>
              setFilters((previous) => ({ ...previous, class_group_id: value }))
            }
            options={classOptions}
            placeholder={getTranslation("selectClassPlaceholder", language)}
          />
          <ReadOnlyGradesFilterSelect
            label={getTranslation("module", language)}
            value={filters.module_id}
            onChange={(value) =>
              setFilters((previous) => ({ ...previous, module_id: value }))
            }
            options={moduleOptions}
            placeholder={getTranslation("monthlyEvaluationSelectModule", language)}
            disabled={!moduleOptions.length}
          />
          <ReadOnlyGradesFilterSelect
            label={getTranslation("semester", language)}
            value={filters.semester}
            onChange={(value) =>
              setFilters((previous) => ({
                ...previous,
                semester: value as "s1" | "s2" | "s3",
              }))
            }
            options={semesterOptions}
            placeholder={getTranslation("selectSemesterPlaceholder", language)}
          />
        </>
      }
      summaryBadges={summaryBadges}
      loading={loading}
      error={loadError}
      isReady={Boolean(filters.class_group_id && filters.module_id && filters.semester)}
      sections={data?.sections ?? null}
      columns={[
        { key: "student_name", labelKey: "studentName" },
        { key: "class_name", labelKey: "class" },
        { key: "mark", labelKey: "marks" },
      ]}
      notReadyTitle={getTranslation("gradesSelectFilters", language)}
      notReadyDescription={getTranslation("gradesSelectFiltersHint", language)}
      emptyTitle={getTranslation("gradesNoDataForSelection", language)}
      emptyDescription={getTranslation("gradesNoDataForSelectionHint", language)}
    />
  );
};

export default SchoolGradesTab;