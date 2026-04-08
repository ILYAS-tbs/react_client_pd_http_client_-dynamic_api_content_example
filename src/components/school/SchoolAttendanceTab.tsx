import React, { useEffect, useMemo, useState } from "react";
import { Check, Download, Search, Trash2, X } from "lucide-react";
import { AttendanceAbsence, AttendanceFilters } from "../../models/Attendance";
import { attendance_client } from "../../services/http_api/attendance/attendance_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { Student } from "../../models/Student";
import { ClassGroup } from "../../models/ClassGroups";
import { Teacher } from "../../models/Teacher";
import { Module } from "../../models/Module";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

interface SchoolAttendanceTabProps {
  students: Student[];
  classGroups: ClassGroup[];
  teachers: Teacher[];
  modules: Module[];
}

function downloadCsv(rows: AttendanceAbsence[]) {
  const csv = [
    ["Student", "Class", "Module", "Hour", "Date", "Teacher", "Status"],
    ...rows.map((row) => [
      row.student.full_name,
      row.class_group?.name ?? "",
      row.module?.module_name ?? "",
      String(row.hour),
      row.date,
      row.teacher.full_name,
      row.status,
    ]),
  ]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  link.download = `student-absences-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

const SchoolAttendanceTab: React.FC<SchoolAttendanceTabProps> = ({
  students,
  classGroups,
  teachers,
  modules,
}) => {
  const { language } = useLanguage();
  const [filters, setFilters] = useState<AttendanceFilters>({ include_deleted: true });
  const [absences, setAbsences] = useState<AttendanceAbsence[]>([]);
  const [studentQuery, setStudentQuery] = useState("");
  const [classQuery, setClassQuery] = useState("");

  const resetFilters = () => {
    setStudentQuery("");
    setClassQuery("");
    setFilters({ include_deleted: true });
  };

  const loadAbsences = async () => {
    const res = await attendance_client.listAbsences({ ...filters, include_deleted: true });
    if (res.ok) setAbsences(res.data);
  };

  useEffect(() => {
    void loadAbsences();
  }, [filters.module, filters.date_from, filters.date_to, filters.status]);

  const displayedAbsences = useMemo(() => {
    const normalizedStudentQuery = studentQuery.trim().toLowerCase();
    const normalizedClassQuery = classQuery.trim().toLowerCase();

    return absences.filter((item) => {
      const matchesStudent =
        !normalizedStudentQuery ||
        item.student.full_name.toLowerCase().includes(normalizedStudentQuery);
      const matchesClass =
        !normalizedClassQuery ||
        (item.class_group?.name ?? "").toLowerCase().includes(normalizedClassQuery);
      return matchesStudent && matchesClass;
    });
  }, [absences, classQuery, studentQuery]);

  const activeAbsences = displayedAbsences.filter((item) => !item.is_deleted);
  const justifiedCount = displayedAbsences.filter((item) => item.status === "approved").length;
  const unjustifiedCount = activeAbsences.filter((item) => !item.justification).length;
  const topStudents = Object.values(
    activeAbsences.reduce<Record<string, { name: string; count: number }>>((acc, item) => {
      const key = item.student.student_id;
      acc[key] = acc[key] ?? { name: item.student.full_name, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  )
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  const heatMap = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const key = day.toISOString().slice(0, 10);
      return {
        key,
        count: activeAbsences.filter((absence) => absence.date === key).length,
      };
    });
  }, [activeAbsences]);

  const review = async (justificationId: number, status: "approved" | "refused") => {
    const note = status === "refused" ? window.prompt(getTranslation("reviewNotePrompt", language), "") ?? "" : "";
    await attendance_client.reviewJustification(justificationId, { status, review_note: note }, getCSRFToken() ?? "");
    await loadAbsences();
  };

  const bulkApprove = async () => {
    const pendingIds = displayedAbsences
      .filter((absence) => absence.justification?.status === "pending")
      .map((absence) => absence.justification?.id)
      .filter((value): value is number => Boolean(value));
    for (const id of pendingIds) {
      await attendance_client.reviewJustification(id, { status: "approved" }, getCSRFToken() ?? "");
    }
    await loadAbsences();
  };

  const removeAbsence = async (absenceId: string) => {
    const reason = window.prompt(getTranslation("deleteAbsenceReasonPrompt", language), getTranslation("manualDeletionReason", language));
    if (!reason) return;
    await attendance_client.deleteAbsence(absenceId, reason, getCSRFToken() ?? "");
    await loadAbsences();
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTranslation("studentAbsencesTab", language)}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("studentAbsencesSubtitle", language)}</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => downloadCsv(displayedAbsences)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
              <Download className="h-4 w-4" />
              {getTranslation("exportCsv", language)}
            </button>
            <button type="button" onClick={() => { void bulkApprove(); }} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white">
              <Check className="h-4 w-4" />
              {getTranslation("bulkApprove", language)}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {getTranslation("filters", language)}
            </h3>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-300 hover:text-primary-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
            >
              {getTranslation("clearFilters", language)}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("searchStudent", language)}</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={studentQuery}
                  onChange={(event) => setStudentQuery(event.target.value)}
                  placeholder={`${getTranslation("searchStudentPlaceholder", language)} (${students.length})`}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 dark:border-gray-600 dark:bg-gray-900"
                />
              </span>
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("searchClass", language)}</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={classQuery}
                  onChange={(event) => setClassQuery(event.target.value)}
                  placeholder={`${getTranslation("searchClass", language)} (${classGroups.length})`}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 dark:border-gray-600 dark:bg-gray-900"
                />
              </span>
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("module", language)}</span>
              <select value={filters.module ?? ""} onChange={(event) => setFilters((current) => ({ ...current, module: event.target.value || undefined }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
                <option value="">{getTranslation("allModules", language)}</option>
                {modules.map((module) => <option key={module.module_id} value={module.module_id}>{module.module_name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("status", language)}</span>
              <select value={filters.status ?? ""} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value || undefined }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
                <option value="">{getTranslation("allStatuses", language)}</option>
                <option value="absent">{getTranslation("absent", language)}</option>
                <option value="pending">{getTranslation("pending", language)}</option>
                <option value="approved">{getTranslation("approved", language)}</option>
                <option value="refused">{getTranslation("refused", language)}</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("fromDate", language)}</span>
              <input type="date" value={filters.date_from ?? ""} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value || undefined }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900" />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("toDate", language)}</span>
              <input type="date" value={filters.date_to ?? ""} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value || undefined }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900" />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{getTranslation("weekHeatMap", language)}</h3>
          <div className="grid grid-cols-7 gap-3">
            {heatMap.map((cell) => (
              <div key={cell.key} className="rounded-2xl border border-gray-200 p-3 text-center dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">{cell.key.slice(5)}</p>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{cell.count}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{getTranslation("topAbsenceStudents", language)}</h3>
            <div className="space-y-2">
              {topStudents.map((student) => (
                <div key={student.name} className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900">
                  <span className="text-gray-800 dark:text-gray-200">{student.name}</span>
                  <span className="font-bold text-primary-600">{student.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{getTranslation("justificationSplit", language)}</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex justify-between"><span>{getTranslation("approved", language)}</span><span>{justifiedCount}</span></div>
              <div className="flex justify-between"><span>{getTranslation("unjustified", language)}</span><span>{unjustifiedCount}</span></div>
              <div className="flex justify-between"><span>{getTranslation("teachers", language)}</span><span>{teachers.length}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <th className="px-4 py-3">{getTranslation("student", language)}</th>
              <th className="px-4 py-3">{getTranslation("class", language)}</th>
              <th className="px-4 py-3">{getTranslation("moduleHour", language)}</th>
              <th className="px-4 py-3">{getTranslation("Date", language)}</th>
              <th className="px-4 py-3">{getTranslation("absentBy", language)}</th>
              <th className="px-4 py-3">{getTranslation("justification", language)}</th>
              <th className="px-4 py-3">{getTranslation("status", language)}</th>
              <th className="px-4 py-3">{getTranslation("actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {displayedAbsences.map((absence) => (
              <tr key={absence.id} className="border-b border-gray-100 align-top dark:border-gray-800">
                <td className="px-4 py-3 text-gray-900 dark:text-white">{absence.student.full_name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.class_group?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.module?.module_name ?? "—"} / {absence.hour}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.date}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.teacher.full_name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.justification?.comment ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${absence.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200" : absence.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200" : absence.status === "refused" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200" : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200"}`}>
                    {absence.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {absence.justification?.status === "pending" ? (
                      <>
                        <button type="button" onClick={() => { void review(absence.justification!.id, "approved"); }} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white">
                          <Check className="h-3.5 w-3.5" />
                          {getTranslation("approve", language)}
                        </button>
                        <button type="button" onClick={() => { void review(absence.justification!.id, "refused"); }} className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white">
                          <X className="h-3.5 w-3.5" />
                          {getTranslation("refuse", language)}
                        </button>
                      </>
                    ) : null}
                    {!absence.is_deleted ? (
                      <button type="button" onClick={() => { void removeAbsence(absence.id); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 dark:border-red-500/30 dark:text-red-200">
                        <Trash2 className="h-3.5 w-3.5" />
                        {getTranslation("deleteAbsence", language)}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SchoolAttendanceTab;