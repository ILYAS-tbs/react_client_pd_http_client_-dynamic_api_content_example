import React, { useEffect, useState } from "react";

import { LayoutPanelTop } from "lucide-react";

import { ParentExamScheduleManagementProps } from "../../types";
import type { Schedule } from "../../models/Schedule";
import { parent_dashboard_client } from "../../services/http_api/parent-dashboard/parent_dashboard_client";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import ScheduleSectionTable from "../shared/ScheduleSectionTable";

const ParentExamScheduleManagement: React.FC<ParentExamScheduleManagementProps> = ({
  students,
  selectedStudentId,
}) => {
  const { language } = useLanguage();
  const [groupedSchedules, setGroupedSchedules] = useState<{ devoir: Schedule[]; exam: Schedule[] }>({ devoir: [], exam: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedStudentId) {
        setGroupedSchedules({ devoir: [], exam: [] });
        return;
      }

      setLoading(true);
      const res = await parent_dashboard_client.get_current_parent_devoir_exam_schedules(selectedStudentId);
      if (res.ok) {
        setGroupedSchedules({
          devoir: res.data.devoir ?? [],
          exam: res.data.exam ?? [],
        });
      }
      setLoading(false);
    };

    void fetchSchedules();
  }, [selectedStudentId]);

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary-600 p-3 text-white shadow-lg">
            <LayoutPanelTop className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {getTranslation("devoirAndExams", language)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {getTranslation("parentDevoirExamDescription", language)}
            </p>
          </div>
        </div>
      </section>

      <ScheduleSectionTable
        title={getTranslation("devoirSchedules", language)}
        schedules={groupedSchedules.devoir}
        loading={loading}
        emptyMessage={students.length === 0 ? getTranslation("noStudentsFound", language) : getTranslation("noDevoirSchedulesAvailable", language)}
      />

      <ScheduleSectionTable
        title={getTranslation("examSchedules", language)}
        schedules={groupedSchedules.exam}
        loading={loading}
        emptyMessage={students.length === 0 ? getTranslation("noStudentsFound", language) : getTranslation("noExamSchedulesAvailable", language)}
      />
    </div>
  );
};

export default ParentExamScheduleManagement;