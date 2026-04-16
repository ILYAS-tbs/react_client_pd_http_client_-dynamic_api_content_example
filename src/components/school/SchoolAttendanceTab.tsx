import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Download, SquarePen, Trash2, X } from "lucide-react";
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

interface AbsenceFormState {
  student_id: string;
  teacher_id: string;
  module_id: string;
  class_group_id: string;
  date: string;
  remark: string;
}

function createEmptyFormState(date = new Date().toISOString().slice(0, 10)): AbsenceFormState {
  return {
    student_id: "",
    teacher_id: "",
    module_id: "",
    class_group_id: "",
    date,
    remark: "",
  };
}

function getStatusLabel(status: string, language: string) {
  switch (status) {
    case "approved":
      return getTranslation("approved", language);
    case "pending":
      return getTranslation("pending", language);
    case "refused":
      return getTranslation("refused", language);
    case "absent":
      return getTranslation("absent", language);
    default:
      return status;
  }
}

function downloadCsv(rows: AttendanceAbsence[], language: string) {
  const csv = [
    ["Student", "Class", "Date", "Module", "Teacher", "Remark", "Status"],
    ...rows.map((row) => [
      row.student.full_name,
      row.class_group?.name ?? "",
      row.date,
      row.module?.module_name ?? "",
      row.teacher?.full_name ?? "",
      row.remark ?? "",
      getStatusLabel(row.status, language),
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<AttendanceAbsence | null>(null);
  const [formState, setFormState] = useState<AbsenceFormState>(() => createEmptyFormState());

  const selectedClassStudents = useMemo(() => {
    if (!formState.class_group_id) {
      return students;
    }
    return students.filter((student) => student.class_group?.class_group_id === formState.class_group_id);
  }, [formState.class_group_id, students]);

  useEffect(() => {
    if (!formState.class_group_id && classGroups[0]) {
      setFormState((current) => ({ ...current, class_group_id: classGroups[0].class_group_id }));
    }
  }, [classGroups, formState.class_group_id]);

  useEffect(() => {
    if (!formState.student_id && selectedClassStudents[0]) {
      setFormState((current) => ({ ...current, student_id: selectedClassStudents[0].student_id }));
    }
  }, [formState.student_id, selectedClassStudents]);

  const loadAbsences = useCallback(async () => {
    setIsLoading(true);
    const response = await attendance_client.listAbsences({ ...filters, include_deleted: true });
    if (response.ok) {
      setAbsences(response.data);
    }
    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    void loadAbsences();
  }, [loadAbsences]);

  const activeAbsences = useMemo(() => absences.filter((item) => !item.is_deleted), [absences]);
  const justifiedCount = useMemo(() => absences.filter((item) => item.status === "approved").length, [absences]);
  const unjustifiedCount = useMemo(() => activeAbsences.filter((item) => !item.justification).length, [activeAbsences]);

  const topStudents = useMemo(() => {
    return Object.values(
      activeAbsences.reduce<Record<string, { name: string; count: number }>>((acc, item) => {
        const key = item.student.student_id;
        acc[key] = acc[key] ?? { name: item.student.full_name, count: 0 };
        acc[key].count += 1;
        return acc;
      }, {})
    )
      .sort((left, right) => right.count - left.count)
      .slice(0, 5);
  }, [activeAbsences]);

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

  const resetFilters = () => {
    setFilters({ include_deleted: true });
  };

  const getErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null && "detail" in error) {
      return String((error as { detail?: unknown }).detail ?? "");
    }
    return "";
  };

  const review = async (justificationId: number, status: "approved" | "refused") => {
    const note = status === "refused"
      ? window.prompt(getTranslation("reviewNotePrompt", language), "") ?? ""
      : "";

    await attendance_client.reviewJustification(
      justificationId,
      { status, review_note: note },
      getCSRFToken() ?? ""
    );
    await loadAbsences();
  };

  const bulkApprove = async () => {
    const pendingIds = absences
      .filter((absence) => absence.justification?.status === "pending")
      .map((absence) => absence.justification?.id)
      .filter((value): value is number => Boolean(value));

    for (const id of pendingIds) {
      await attendance_client.reviewJustification(id, { status: "approved" }, getCSRFToken() ?? "");
    }

    await loadAbsences();
  };

  const removeAbsence = async (absenceId: string) => {
    const reason = window.prompt(
      getTranslation("deleteAbsenceReasonPrompt", language),
      getTranslation("manualDeletionReason", language)
    );
    if (!reason) {
      return;
    }

    await attendance_client.deleteAbsence(absenceId, reason, getCSRFToken() ?? "");
    await loadAbsences();
  };

  const openEditModal = (absence: AttendanceAbsence) => {
    setEditingAbsence(absence);
    setFormState({
      student_id: absence.student.student_id,
      teacher_id: absence.teacher?.user?.id ? String(absence.teacher.user.id) : "",
      module_id: absence.module?.module_id ?? "",
      class_group_id:
        absence.class_group?.class_group_id ??
        absence.student.class_group?.class_group_id ??
        "",
      date: absence.date,
      remark: absence.remark ?? "",
    });
    setIsModalOpen(true);
  };

  const submitAbsence = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      student_id: formState.student_id,
      teacher_id: formState.teacher_id ? Number(formState.teacher_id) : undefined,
      module_id: formState.module_id || undefined,
      class_group_id: formState.class_group_id,
      date: formState.date,
      remark: formState.remark.trim(),
    };

    const csrf = getCSRFToken() ?? "";
    const response = editingAbsence
      ? await attendance_client.updateAbsence(editingAbsence.id, payload, csrf)
      : await attendance_client.markAbsences(payload, csrf);

    if (response.ok) {
      setFeedback(getTranslation(editingAbsence ? "absenceUpdated" : "absenceSaved", language));
      setIsModalOpen(false);
      setEditingAbsence(null);
      await loadAbsences();
    } else {
      setFeedback(
        getErrorMessage(response.error) ||
          getTranslation(editingAbsence ? "absenceUpdateFailed" : "absenceSaveFailed", language)
      );
    }

    setIsSubmitting(false);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getTranslation("studentAbsencesTab", language)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getTranslation("studentAbsencesSubtitle", language)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadCsv(absences, language)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <Download className="h-4 w-4" />
              {getTranslation("exportCsv", language)}
            </button>
            <button
              type="button"
              onClick={() => {
                void bulkApprove();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
            >
              <Check className="h-4 w-4" />
              {getTranslation("bulkApprove", language)}
            </button>
          </div>
        </div>

        {feedback ? (
          <div className="mb-4 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-100">
            {feedback}
          </div>
        ) : null}

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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("class", language)}</span>
              <select
                value={filters.class ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, class: event.target.value || undefined }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
              >
                <option value="">{getTranslation("allClasses", language)}</option>
                {classGroups.map((classGroup) => (
                  <option key={classGroup.class_group_id} value={classGroup.class_group_id}>
                    {classGroup.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("student", language)}</span>
              <select
                value={filters.student ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, student: event.target.value || undefined }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
              >
                <option value="">{getTranslation("allStudents", language)}</option>
                {students.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </label>

            {/* <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("module", language)}</span>
              <select
                value={filters.module ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, module: event.target.value || undefined }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
              >
                <option value="">{getTranslation("allModules", language)}</option>
                {modules.map((module) => (
                  <option key={module.module_id} value={module.module_id}>
                    {module.module_name}
                  </option>
                ))}
              </select>
            </label> */}

            {/* <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("teacher", language)}</span>
              <select
                value={filters.teacher ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, teacher: event.target.value || undefined }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
              >
                <option value="">{getTranslation("allTeachers", language)}</option>
                {teachers.map((teacher) => (
                  <option key={teacher.user.id} value={teacher.user.id}>
                    {teacher.full_name}
                  </option>
                ))}
              </select>
            </label> */}

            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("fromDate", language)}</span>
              <input
                type="date"
                value={filters.date_from ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    date_from: event.target.value || undefined,
                    date: undefined,
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("toDate", language)}</span>
              <input
                type="date"
                value={filters.date_to ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    date_to: event.target.value || undefined,
                    date: undefined,
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{getTranslation("status", language)}</span>
              <select
                value={filters.status ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value || undefined }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
              >
                <option value="">{getTranslation("allStatuses", language)}</option>
                <option value="absent">{getTranslation("absent", language)}</option>
                <option value="pending">{getTranslation("pending", language)}</option>
                <option value="approved">{getTranslation("approved", language)}</option>
                <option value="refused">{getTranslation("refused", language)}</option>
              </select>
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

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="max-h-[34rem] overflow-auto">
          <table className="w-full min-w-[1250px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="px-4 py-3">{getTranslation("student", language)}</th>
                <th className="px-4 py-3">{getTranslation("class", language)}</th>
                <th className="px-4 py-3">{getTranslation("Date", language)}</th>
                <th className="px-4 py-3">{getTranslation("module", language)}</th>
                <th className="px-4 py-3">{getTranslation("teacher", language)}</th>
                <th className="px-4 py-3">{getTranslation("remarks", language)}</th>
                <th className="px-4 py-3">{getTranslation("justification", language)}</th>
                <th className="px-4 py-3">{getTranslation("status", language)}</th>
                <th className="px-4 py-3">{getTranslation("actions", language)}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">{getTranslation("loading", language)}</td>
                </tr>
              ) : absences.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">{getTranslation("noAbsencesFound", language)}</td>
                </tr>
              ) : (
                absences.map((absence) => (
                  <tr key={absence.id} className="border-b border-gray-100 align-top dark:border-gray-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{absence.student.full_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.class_group?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.date}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.module?.module_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.teacher?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.remark?.trim() ? absence.remark : "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{absence.justification?.comment ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${absence.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200" : absence.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200" : absence.status === "refused" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200" : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200"}`}>
                        {getStatusLabel(absence.status, language)}
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
                          <button type="button" onClick={() => openEditModal(absence)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <SquarePen className="h-3.5 w-3.5" />
                            {getTranslation("editAbsence", language)}
                          </button>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getTranslation("editAbsence", language)}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{getTranslation("attendanceTabSubtitle", language)}</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
                {getTranslation("close", language)}
              </button>
            </div>

            <form className="space-y-4" onSubmit={submitAbsence}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span>{getTranslation("class", language)}</span>
                  <select value={formState.class_group_id} onChange={(event) => setFormState((current) => ({ ...current, class_group_id: event.target.value, student_id: "" }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
                    {classGroups.map((classGroup) => (
                      <option key={classGroup.class_group_id} value={classGroup.class_group_id}>{classGroup.name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span>{getTranslation("student", language)}</span>
                  <select value={formState.student_id} onChange={(event) => setFormState((current) => ({ ...current, student_id: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
                    {selectedClassStudents.map((student) => (
                      <option key={student.student_id} value={student.student_id}>{student.full_name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span>{getTranslation("teacher", language)}</span>
                  <select value={formState.teacher_id} onChange={(event) => setFormState((current) => ({ ...current, teacher_id: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
                    <option value="">{getTranslation("allTeachers", language)}</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.user.id} value={teacher.user.id}>{teacher.full_name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span>{getTranslation("module", language)}</span>
                  <select value={formState.module_id} onChange={(event) => setFormState((current) => ({ ...current, module_id: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
                    <option value="">{getTranslation("allModules", language)}</option>
                    {modules.map((module) => (
                      <option key={module.module_id} value={module.module_id}>{module.module_name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span>{getTranslation("Date", language)}</span>
                  <input type="date" value={formState.date} onChange={(event) => setFormState((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
                </label>
              </div>

              <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <span>{getTranslation("absenceRemark", language)}</span>
                <textarea value={formState.remark} onChange={(event) => setFormState((current) => ({ ...current, remark: event.target.value }))} rows={4} placeholder={getTranslation("absenceRemarkPlaceholder", language)} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-800" />
              </label>

              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
                  {getTranslation("cancel", language)}
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {isSubmitting ? getTranslation("loading", language) : getTranslation("update", language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default SchoolAttendanceTab;
