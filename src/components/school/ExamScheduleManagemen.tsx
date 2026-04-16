import React, { useEffect, useState } from "react";

import { LayoutPanelTop } from "lucide-react";

import { getCSRFToken } from "../../lib/get_CSRFToken";
import type { ClassGroup } from "../../models/ClassGroups";
import type { Schedule, ScheduleType } from "../../models/Schedule";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import type { ExamScheduleManagementProps } from "../../types";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import ScheduleSectionTable from "../shared/ScheduleSectionTable";
import ScheduleUploadModal from "../shared/ScheduleUploadModal";

type DashboardScheduleType = Extract<ScheduleType, "devoir" | "exam">;

type GroupedSchedules = {
  devoir: Schedule[];
  exam: Schedule[];
};

const EMPTY_GROUPS: GroupedSchedules = {
  devoir: [],
  exam: [],
};

const DevoirExamScheduleManagement: React.FC<ExamScheduleManagementProps> = ({ class_groups_list }) => {
  const { language } = useLanguage();
  const [groupedSchedules, setGroupedSchedules] = useState<GroupedSchedules>(EMPTY_GROUPS);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<DashboardScheduleType, string>>({
    devoir: "",
    exam: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalScheduleType, setModalScheduleType] = useState<DashboardScheduleType>("devoir");
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const classOptions = class_groups_list.map((classGroup: ClassGroup) => ({
    id: classGroup.class_group_id,
    name: classGroup.name,
  }));

  const fetchSchedules = async () => {
    setLoading(true);
    const response = await school_dashboard_client.get_current_school_devoir_exam_schedules();
    if (response.ok) {
      setGroupedSchedules({
        devoir: response.data.devoir ?? [],
        exam: response.data.exam ?? [],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchSchedules();
  }, []);

  const openCreateModal = (scheduleType: DashboardScheduleType) => {
    setModalScheduleType(scheduleType);
    setEditingSchedule(null);
    setModalOpen(true);
  };

  const openEditModal = (schedule: Schedule) => {
    setModalScheduleType(schedule.schedule_type as DashboardScheduleType);
    setEditingSchedule(schedule);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSchedule(null);
  };

  const replaceScheduleInState = (nextSchedule: Schedule) => {
    const nextType = nextSchedule.schedule_type as DashboardScheduleType;

    setGroupedSchedules((current) => ({
      devoir:
        nextType === "devoir"
          ? [nextSchedule, ...current.devoir.filter((item) => item.schedule_id !== nextSchedule.schedule_id)]
          : current.devoir.filter((item) => item.schedule_id !== nextSchedule.schedule_id),
      exam:
        nextType === "exam"
          ? [nextSchedule, ...current.exam.filter((item) => item.schedule_id !== nextSchedule.schedule_id)]
          : current.exam.filter((item) => item.schedule_id !== nextSchedule.schedule_id),
    }));
  };

  const handleModalSubmit = async (payload: { classGroupId: string; title: string; file: File | null }) => {
    const csrfToken = getCSRFToken();
    if (!csrfToken) return;

    const formData = new FormData();
    formData.append("class_group_id", payload.classGroupId);
    formData.append("schedule_type", modalScheduleType);
    formData.append("title", payload.title);
    if (payload.file) {
      formData.append("schedule_file", payload.file);
    }

    const response = await school_dashboard_client.upsert_devoir_exam_schedule(formData, csrfToken);
    if (response.ok) {
      replaceScheduleInState(response.data as Schedule);
      closeModal();
    }
  };

  const handleDelete = async (schedule: Schedule) => {
    const csrfToken = getCSRFToken();
    if (!csrfToken) return;
    if (!window.confirm(getTranslation("confirmDeleteSchedule", language))) return;

    const scheduleType = schedule.schedule_type as DashboardScheduleType;
    setGroupedSchedules((current) => ({
      ...current,
      [scheduleType]: current[scheduleType].filter((item) => item.schedule_id !== schedule.schedule_id),
    }));

    const response = await school_dashboard_client.delete_schedule(schedule.schedule_id, csrfToken);
    if (!response.ok) {
      await fetchSchedules();
    }
  };

  const filteredDevoirSchedules = groupedSchedules.devoir.filter((schedule) => {
    if (!filters.devoir) return true;
    return schedule.class_group_info?.class_group_id === filters.devoir;
  });

  const filteredExamSchedules = groupedSchedules.exam.filter((schedule) => {
    if (!filters.exam) return true;
    return schedule.class_group_info?.class_group_id === filters.exam;
  });

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary-600 p-3 text-white shadow-lg">
            <LayoutPanelTop className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {getTranslation("devoirAndExamsSchedules", language)}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {getTranslation("devoirExamDashboardDescription", language)}
            </p>
          </div>
        </div>
      </section>

      <ScheduleSectionTable
        title={getTranslation("devoirSchedules", language)}
        schedules={filteredDevoirSchedules}
        loading={loading}
        emptyMessage={getTranslation("noDevoirSchedulesAvailable", language)}
        classFilterValue={filters.devoir}
        classOptions={classOptions}
        onClassFilterChange={(value) => setFilters((current) => ({ ...current, devoir: value }))}
        onCreateClick={() => openCreateModal("devoir")}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <ScheduleSectionTable
        title={getTranslation("examSchedules", language)}
        schedules={filteredExamSchedules}
        loading={loading}
        emptyMessage={getTranslation("noExamSchedulesAvailable", language)}
        classFilterValue={filters.exam}
        classOptions={classOptions}
        onClassFilterChange={(value) => setFilters((current) => ({ ...current, exam: value }))}
        onCreateClick={() => openCreateModal("exam")}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <ScheduleUploadModal
        isOpen={modalOpen}
        scheduleType={modalScheduleType}
        schedule={editingSchedule}
        defaultClassGroupId={editingSchedule?.class_group_info?.class_group_id ?? filters[modalScheduleType]}
        classOptions={classOptions}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default DevoirExamScheduleManagement;
