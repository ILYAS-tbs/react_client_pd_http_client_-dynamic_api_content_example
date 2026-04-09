import React, { useEffect, useMemo, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { BehaviourNote, BehaviourFilters } from "../../models/BehaviourNote";
import { behaviour_client } from "../../services/http_api/behaviour/behaviour_client";
import { Student } from "../../models/Student";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

interface ParentBehaviourReportsTabProps {
  students: Student[];
  selectedStudentId?: string | null;
}

const ParentBehaviourReportsTab: React.FC<ParentBehaviourReportsTabProps> = ({ students, selectedStudentId }) => {
  const { language } = useLanguage();
  const [reports, setReports] = useState<BehaviourNote[]>([]);
  const [filters, setFilters] = useState<BehaviourFilters>({
    student: selectedStudentId || undefined,
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      student: selectedStudentId || undefined,
    }));
  }, [selectedStudentId]);

  useEffect(() => {
    const load = async () => {
      const res = await behaviour_client.listBehaviourReports(filters);
      if (res.ok) setReports(res.data);
    };
    void load();
  }, [filters]);

  const teacherOptions = useMemo(
    () => Array.from(new Map(reports.map((item) => [String(item.teacher.user), item.teacher])).values()),
    [reports]
  );
  const classOptions = useMemo(
    () => Array.from(new Map(reports.filter((item) => item.class_group).map((item) => [item.class_group!.class_group_id, item.class_group!])).values()),
    [reports]
  );
  const moduleOptions = useMemo(
    () => Array.from(new Map(reports.filter((item) => item.module).map((item) => [item.module!.module_id, item.module!])).values()),
    [reports]
  );

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTranslation("behaviourReportsTab", language)}</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
            {students[0]?.full_name ?? getTranslation("selectStudent", language)}
          </div>
          <select value={filters.class ?? ""} onChange={(event) => setFilters((current) => ({ ...current, class: event.target.value || undefined }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <option value="">{getTranslation("allClasses", language)}</option>
            {classOptions.map((group) => <option key={group.class_group_id} value={group.class_group_id}>{group.name}</option>)}
          </select>
          <select value={filters.teacher ?? ""} onChange={(event) => setFilters((current) => ({ ...current, teacher: event.target.value || undefined }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <option value="">{getTranslation("allTeachers", language)}</option>
            {teacherOptions.map((teacher) => <option key={teacher.user} value={String(teacher.user)}>{teacher.full_name}</option>)}
          </select>
          <select value={filters.module ?? ""} onChange={(event) => setFilters((current) => ({ ...current, module: event.target.value || undefined }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <option value="">{getTranslation("allModules", language)}</option>
            {moduleOptions.map((module) => <option key={module.module_id} value={module.module_id}>{module.module_name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((item) => (
          <article key={item.behaviour_report_id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.student.full_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.teacher.full_name} • {item.class_group?.name ?? "—"} • {item.module?.module_name ?? getTranslation("generalNote", language)}</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-200">{item.report}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ParentBehaviourReportsTab;