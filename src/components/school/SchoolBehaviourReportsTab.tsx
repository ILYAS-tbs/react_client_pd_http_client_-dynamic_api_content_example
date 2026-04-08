import React, { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { BehaviourNote, BehaviourFilters } from "../../models/BehaviourNote";
import { behaviour_client } from "../../services/http_api/behaviour/behaviour_client";
import { Student } from "../../models/Student";
import { ClassGroup } from "../../models/ClassGroups";
import { Teacher } from "../../models/Teacher";
import { Module } from "../../models/Module";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

interface SchoolBehaviourReportsTabProps {
  students: Student[];
  classGroups: ClassGroup[];
  teachers: Teacher[];
  modules: Module[];
}

const SchoolBehaviourReportsTab: React.FC<SchoolBehaviourReportsTabProps> = ({
  students,
  classGroups,
  teachers,
  modules,
}) => {
  const { language } = useLanguage();
  const [filters, setFilters] = useState<BehaviourFilters>({});
  const [reports, setReports] = useState<BehaviourNote[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await behaviour_client.listBehaviourReports(filters);
      if (res.ok) setReports(res.data);
    };
    void load();
  }, [filters.class, filters.date_from, filters.date_to, filters.module, filters.student, filters.teacher]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTranslation("behaviourReportsTab", language)}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("behaviourReportsSubtitle", language)}</p>
          </div>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white">
            <Printer className="h-4 w-4" />
            {getTranslation("printReport", language)}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <select value={filters.student ?? ""} onChange={(event) => setFilters((current) => ({ ...current, student: event.target.value || undefined }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <option value="">{getTranslation("allStudents", language)}</option>
            {students.map((student) => <option key={student.student_id} value={student.student_id}>{student.full_name}</option>)}
          </select>
          <select value={filters.teacher ?? ""} onChange={(event) => setFilters((current) => ({ ...current, teacher: event.target.value || undefined }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <option value="">{getTranslation("allTeachers", language)}</option>
            {teachers.map((teacher) => <option key={teacher.user.id} value={String(teacher.user.id)}>{teacher.full_name}</option>)}
          </select>
          <select value={filters.class ?? ""} onChange={(event) => setFilters((current) => ({ ...current, class: event.target.value || undefined }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <option value="">{getTranslation("allClasses", language)}</option>
            {classGroups.map((group) => <option key={group.class_group_id} value={group.class_group_id}>{group.name}</option>)}
          </select>
          <select value={filters.module ?? ""} onChange={(event) => setFilters((current) => ({ ...current, module: event.target.value || undefined }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <option value="">{getTranslation("allModules", language)}</option>
            {modules.map((module) => <option key={module.module_id} value={module.module_id}>{module.module_name}</option>)}
          </select>
          <input type="date" value={filters.date_from ?? ""} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value || undefined }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900" />
          <input type="date" value={filters.date_to ?? ""} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value || undefined }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900" />
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((item) => (
          <article key={item.behaviour_report_id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.student.full_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.teacher.full_name} • {item.class_group?.name ?? "—"} • {item.module?.module_name ?? getTranslation("generalNote", language)}</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-200">{item.report}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SchoolBehaviourReportsTab;