import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Student } from "../../models/Student";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import { BehaviourNote } from "../../models/BehaviourNote";
import { behaviour_client } from "../../services/http_api/behaviour/behaviour_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface TeacherBehaviourNotesTabProps {
  students: Student[];
  modulesClassGroups: TeacherModuleClassGroup[];
}

const TeacherBehaviourNotesTab: React.FC<TeacherBehaviourNotesTabProps> = ({
  students,
  modulesClassGroups,
}) => {
  const { language } = useLanguage();
  const [reports, setReports] = useState<BehaviourNote[]>([]);
  const [studentId, setStudentId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [classGroupId, setClassGroupId] = useState("");
  const [report, setReport] = useState("");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReports = async () => {
    const res = await behaviour_client.listBehaviourReports();
    if (res.ok) setReports(res.data);
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const studentAssignments = useMemo(() => {
    if (!studentId) return modulesClassGroups;
    const student = students.find((item) => item.student_id === studentId);
    return modulesClassGroups.filter(
      (item) => item.class_group.class_group_id === student?.class_group?.class_group_id
    );
  }, [modulesClassGroups, studentId, students]);

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (item) =>
          item.student.full_name.toLowerCase().includes(search.toLowerCase()) ||
          item.report.toLowerCase().includes(search.toLowerCase())
      ),
    [reports, search]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentId || !report.trim()) return;
    setIsSubmitting(true);
    const res = await behaviour_client.createBehaviourReport(
      {
        student_id: studentId,
        module_id: moduleId || undefined,
        class_group_id: classGroupId || undefined,
        report: report.trim(),
      },
      getCSRFToken() ?? ""
    );
    if (res.ok) {
      setReport("");
      await loadReports();
    }
    setIsSubmitting(false);
  };

  return (
    <section className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getTranslation("behaviourNotesTab", language)}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("student", language)}</span>
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              <option value="">{getTranslation("selectStudent", language)}</option>
              {students.map((student) => (
                <option key={student.student_id} value={student.student_id}>{student.full_name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("class", language)}</span>
            <select value={classGroupId} onChange={(event) => setClassGroupId(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              <option value="">{getTranslation("autoFromStudent", language)}</option>
              {studentAssignments.map((assignment) => (
                <option key={`${assignment.class_group.class_group_id}-${assignment.module.module_id}`} value={assignment.class_group.class_group_id}>
                  {assignment.class_group.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("module", language)}</span>
            <select value={moduleId} onChange={(event) => setModuleId(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              <option value="">{getTranslation("optionalModule", language)}</option>
              {studentAssignments.map((assignment) => (
                <option key={`${assignment.class_group.class_group_id}:${assignment.module.module_id}`} value={assignment.module.module_id}>
                  {assignment.module.module_name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <span>{getTranslation("behaviourReportText", language)}</span>
          <textarea
            value={report}
            onChange={(event) => setReport(event.target.value)}
            rows={5}
            placeholder={getTranslation("behaviourPlaceholder", language)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-900"
          />
        </label>
        <button type="submit" disabled={isSubmitting || !studentId || !report.trim()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60">
          <Plus className="h-4 w-4" />
          {isSubmitting ? getTranslation("saving", language) : getTranslation("submitBehaviourNote", language)}
        </button>
      </form>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTranslation("studentTimeline", language)}</h3>
          <span className="relative block max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={getTranslation("searchBehaviourReports", language)} className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 dark:border-gray-600 dark:bg-gray-900" />
          </span>
        </div>
        <div className="space-y-3">
          {filteredReports.map((item) => (
            <article key={item.behaviour_report_id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{item.student.full_name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.class_group?.name ?? "—"} • {item.module?.module_name ?? getTranslation("generalNote", language)}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-200">{item.report}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeacherBehaviourNotesTab;