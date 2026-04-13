import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Search, Undo2 } from "lucide-react";
import { Student } from "../../models/Student";
import { ClassGroup } from "../../models/ClassGroups";
import { Module } from "../../models/Module";
import { Teacher } from "../../models/Teacher";
import { AttendanceAbsence } from "../../models/Attendance";
import { attendance_client } from "../../services/http_api/attendance/attendance_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

interface SchoolManageAbsencesTabProps {
  students: Student[];
  classGroups: ClassGroup[];
  teachers: Teacher[];
  modules: Module[];
}

interface PendingAbsenceState {
  absenceId: string | null;
  expiresAt: number;
}

const UNDO_WINDOW_MS = 60_000;

const SchoolManageAbsencesTab: React.FC<SchoolManageAbsencesTabProps> = ({
  students,
  classGroups,
  teachers,
  modules,
}) => {
  const { language } = useLanguage();
  const [selectedClassGroupId, setSelectedClassGroupId] = useState(classGroups[0]?.class_group_id ?? "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSession, setSelectedSession] = useState(1);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [slotAbsences, setSlotAbsences] = useState<AttendanceAbsence[]>([]);
  const [pendingByStudentId, setPendingByStudentId] = useState<Record<string, PendingAbsenceState>>({});
  const [savingStudentIds, setSavingStudentIds] = useState<string[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedClassGroupId && classGroups[0]) {
      setSelectedClassGroupId(classGroups[0].class_group_id);
    }
  }, [classGroups, selectedClassGroupId]);

  const loadSlotAbsences = useCallback(async () => {
    if (!selectedClassGroupId) {
      setSlotAbsences([]);
      return;
    }

    setIsLoading(true);
    const response = await attendance_client.listAbsences({
      class: selectedClassGroupId,
      date: selectedDate,
      hour: selectedSession,
    });
    if (response.ok) {
      setSlotAbsences(response.data.filter((absence) => !absence.is_deleted));
    }
    setIsLoading(false);
  }, [selectedClassGroupId, selectedDate, selectedSession]);

  useEffect(() => {
    void loadSlotAbsences();
    setPendingByStudentId({});
  }, [loadSlotAbsences]);

  useEffect(() => {
    setPendingByStudentId((current) => {
      const nextEntries = Object.entries(current).filter(([, pending]) => pending.expiresAt > nowMs);
      if (nextEntries.length === Object.keys(current).length) {
        return current;
      }
      return Object.fromEntries(nextEntries);
    });
  }, [nowMs]);

  const classStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return students
      .filter((student) => student.class_group?.class_group_id === selectedClassGroupId)
      .filter((student) => !normalizedSearch || student.full_name.toLowerCase().includes(normalizedSearch))
      .sort((left, right) => left.full_name.localeCompare(right.full_name));
  }, [search, selectedClassGroupId, students]);

  const activeAbsenceByStudentId = useMemo(() => {
    const map = new Map<string, AttendanceAbsence>();
    slotAbsences.forEach((absence) => {
      map.set(absence.student.student_id, absence);
    });
    return map;
  }, [slotAbsences]);

  const stats = useMemo(() => {
    const pendingCount = Object.keys(pendingByStudentId).length;
    const confirmedCount = classStudents.filter((student) => activeAbsenceByStudentId.has(student.student_id) && !pendingByStudentId[student.student_id]).length;
    const presentCount = classStudents.length - pendingCount - confirmedCount;
    return { pendingCount, confirmedCount, presentCount };
  }, [activeAbsenceByStudentId, classStudents, pendingByStudentId]);

  const handleMarkAbsent = async (studentId: string) => {
    if (!selectedClassGroupId || savingStudentIds.includes(studentId) || activeAbsenceByStudentId.has(studentId)) {
      return;
    }

    setFeedback(null);
    setSavingStudentIds((current) => [...current, studentId]);
    setPendingByStudentId((current) => ({
      ...current,
      [studentId]: { absenceId: null, expiresAt: Date.now() + UNDO_WINDOW_MS },
    }));

    const csrf = getCSRFToken() ?? "";
    const response = await attendance_client.quickMarkAbsence(
      {
        student_id: studentId,
        class_group_id: selectedClassGroupId,
        date: selectedDate,
        session: selectedSession,
        module_id: selectedModuleId || undefined,
        teacher_id: selectedTeacherId ? Number(selectedTeacherId) : undefined,
      },
      csrf
    );

    if (response.ok) {
      setSlotAbsences((current) => [response.data, ...current.filter((absence) => absence.id !== response.data.id)]);
      setPendingByStudentId((current) => ({
        ...current,
        [studentId]: { absenceId: response.data.id, expiresAt: Date.now() + UNDO_WINDOW_MS },
      }));
    } else {
      let detail = "";
      if (typeof response.error === "object" && response.error !== null) {
        if ("detail" in response.error) {
          detail = String((response.error as { detail?: unknown }).detail ?? "");
        } else {
          const firstValue = Object.values(response.error as Record<string, unknown>)[0];
          if (Array.isArray(firstValue)) {
            detail = firstValue.map(String).join(", ");
          } else if (firstValue) {
            detail = String(firstValue);
          }
        }
      } else if (Array.isArray(response.error)) {
        detail = response.error.join(", ");
      }
      setPendingByStudentId((current) => {
        const next = { ...current };
        delete next[studentId];
        return next;
      });
      setFeedback(detail || getTranslation("quickMarkFailed", language));
    }

    setSavingStudentIds((current) => current.filter((id) => id !== studentId));
  };

  const handleUndo = async (studentId: string) => {
    const pending = pendingByStudentId[studentId];
    if (!pending?.absenceId) {
      return;
    }

    setSavingStudentIds((current) => [...current, studentId]);
    const previousPending = pending;
    setPendingByStudentId((current) => {
      const next = { ...current };
      delete next[studentId];
      return next;
    });

    const response = await attendance_client.deleteAbsence(
      previousPending.absenceId,
      "quick undo",
      getCSRFToken() ?? ""
    );

    if (response.ok) {
      setSlotAbsences((current) => current.filter((absence) => absence.id !== previousPending.absenceId));
    } else {
      setPendingByStudentId((current) => ({ ...current, [studentId]: previousPending }));
      setFeedback(getTranslation("undoFailed", language));
      await loadSlotAbsences();
    }

    setSavingStudentIds((current) => current.filter((id) => id !== studentId));
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTranslation("manageAbsencesTab", language)}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("manageAbsencesSubtitle", language)}</p>
          </div>
          <div className="inline-flex items-center rounded-xl bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-100">
            {getTranslation("autoTeacherModuleHint", language)}
          </div>
        </div>

        {feedback ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
            {feedback}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("class", language)}</span>
            <select value={selectedClassGroupId} onChange={(event) => setSelectedClassGroupId(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              <option value="">{getTranslation("selectClassGroup", language)}</option>
              {classGroups.map((classGroup) => (
                <option key={classGroup.class_group_id} value={classGroup.class_group_id}>{classGroup.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("Date", language)}</span>
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900" />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("session", language)}</span>
            <select value={selectedSession} onChange={(event) => setSelectedSession(Number(event.target.value))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              {Array.from({ length: 8 }, (_, index) => index + 1).map((session) => (
                <option key={session} value={session}>{getTranslation(`session${session}`, language)}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("module", language)}</span>
            <select value={selectedModuleId} onChange={(event) => setSelectedModuleId(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              <option value="">{getTranslation("allModules", language)}</option>
              {modules.map((module) => (
                <option key={module.module_id} value={module.module_id}>{module.module_name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("teacher", language)}</span>
            <select value={selectedTeacherId} onChange={(event) => setSelectedTeacherId(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              <option value="">{getTranslation("allTeachers", language)}</option>
              {teachers.map((teacher) => (
                <option key={teacher.user.id} value={teacher.user.id}>{teacher.full_name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("searchStudent", language)}</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={getTranslation("searchStudentPlaceholder", language)} className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 dark:border-gray-600 dark:bg-gray-900" />
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("present", language)}</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.presentCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("pendingConfirmation", language)}</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">{stats.pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("confirmedAbsent", language)}</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.confirmedCount}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-300 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTranslation("currentSlotAbsences", language)}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClassGroupId ? `${classStudents.length} ${getTranslation("students", language)}` : getTranslation("selectClassGroup", language)}</p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{selectedDate}</span>
            <span>•</span>
            <span>{getTranslation(`session${selectedSession}`, language)}</span>
          </div>
        </div>

        <div className="max-h-[68vh] min-h-[32rem] overflow-y-auto bg-gray-50/60 dark:bg-gray-900/30">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-white text-left text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <th className="px-5 py-3">{getTranslation("student", language)}</th>
                <th className="px-5 py-3">{getTranslation("studentStatus", language)}</th>
                <th className="px-5 py-3">{getTranslation("actions", language)}</th>
              </tr>
            </thead>
            <tbody>
              {!selectedClassGroupId ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">{getTranslation("selectClassGroup", language)}</td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">{getTranslation("loading", language)}</td>
                </tr>
              ) : classStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">{getTranslation("noStudentsForSelection", language)}</td>
                </tr>
              ) : (
                classStudents.map((student) => {
                  const pending = pendingByStudentId[student.student_id];
                  const activeAbsence = activeAbsenceByStudentId.get(student.student_id);
                  const remainingSeconds = pending ? Math.max(Math.ceil((pending.expiresAt - nowMs) / 1000), 0) : 0;
                  const isSaving = savingStudentIds.includes(student.student_id);

                  let statusClassName = "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200";
                  let statusLabel = getTranslation("present", language);

                  if (pending && remainingSeconds > 0) {
                    statusClassName = "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200";
                    statusLabel = `${getTranslation("pendingConfirmation", language)} (${remainingSeconds}s)`;
                  } else if (activeAbsence) {
                    statusClassName = "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200";
                    statusLabel = getTranslation("confirmedAbsent", language);
                  }

                  return (
                    <tr key={student.student_id} className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/80">
                      <td className="px-5 py-4 text-gray-900 dark:text-white">
                        <div>
                          <p className="font-semibold">{student.full_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{student.class_group?.name ?? "—"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {pending && remainingSeconds > 0 && pending.absenceId ? (
                          <button type="button" onClick={() => { void handleUndo(student.student_id); }} disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-700 disabled:opacity-60 dark:border-orange-500/30 dark:text-orange-200">
                            <Undo2 className="h-3.5 w-3.5" />
                            {getTranslation("undoAbsence", language)}
                          </button>
                        ) : activeAbsence ? (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                            {getTranslation("confirmedAbsent", language)}
                          </span>
                        ) : (
                          <button type="button" onClick={() => { void handleMarkAbsent(student.student_id); }} disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
                            {isSaving ? getTranslation("loading", language) : getTranslation("markAbsent", language)}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default SchoolManageAbsencesTab;