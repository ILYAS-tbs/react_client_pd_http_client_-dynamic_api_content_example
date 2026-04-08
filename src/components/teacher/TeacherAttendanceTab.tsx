import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Search,
  Undo2,
} from "lucide-react";
import { Student } from "../../models/Student";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import {
  AttendanceAbsence,
  MarkAttendancePayload,
} from "../../models/Attendance";
import { attendance_client } from "../../services/http_api/attendance/attendance_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

interface TeacherAttendanceTabProps {
  students: Student[];
  modulesClassGroups: TeacherModuleClassGroup[];
}

interface AssignmentOption {
  id: string;
  classGroupId: string;
  classGroupName: string;
  moduleId: string;
  moduleName: string;
}

const UNDO_GRACE_MS = 60 * 1000;
const TIMEZONE_OFFSET_STEP_MS = 60 * 60 * 1000;

const toDateInputValue = (value = new Date()) => value.toISOString().slice(0, 10);

function parseApiDateTimeToMs(value?: string | null) {
  if (!value) {
    return null;
  }

  const hasExplicitTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  const normalizedValue = hasExplicitTimezone ? value : `${value}Z`;
  const timestamp = new Date(normalizedValue).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function getUndoRemainingMs(absence: AttendanceAbsence, nowMs: number) {
  const deadlineMs = parseApiDateTimeToMs(absence.undo_deadline);
  if (deadlineMs === null) {
    return 0;
  }

  let remainingMs = deadlineMs - nowMs;
  const createdAtMs = parseApiDateTimeToMs(absence.created_at);

  if (createdAtMs !== null) {
    const graceWindowMs = deadlineMs - createdAtMs;
    if (graceWindowMs > 0 && graceWindowMs <= UNDO_GRACE_MS && remainingMs > graceWindowMs) {
      while (remainingMs > graceWindowMs) {
        remainingMs -= TIMEZONE_OFFSET_STEP_MS;
      }
    }

    if (graceWindowMs > 0) {
      remainingMs = Math.min(remainingMs, graceWindowMs);
    }
  }

  return Math.max(remainingMs, 0);
}

const TeacherAttendanceTab: React.FC<TeacherAttendanceTabProps> = ({
  students,
  modulesClassGroups,
}) => {
  const { language } = useLanguage();
  const [absences, setAbsences] = useState<AttendanceAbsence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(toDateInputValue());
  const [selectedHour, setSelectedHour] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [draftAbsentIds, setDraftAbsentIds] = useState<string[]>([]);
  const [savingStudentIds, setSavingStudentIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const assignments = useMemo<AssignmentOption[]>(() => {
    const seen = new Map<string, AssignmentOption>();
    modulesClassGroups.forEach((item) => {
      const id = `${item.class_group.class_group_id}:${item.module.module_id}`;
      if (!seen.has(id)) {
        seen.set(id, {
          id,
          classGroupId: item.class_group.class_group_id,
          classGroupName: item.class_group.name,
          moduleId: item.module.module_id,
          moduleName: item.module.module_name,
        });
      }
    });
    return Array.from(seen.values()).sort((left, right) =>
      `${left.classGroupName}${left.moduleName}`.localeCompare(
        `${right.classGroupName}${right.moduleName}`
      )
    );
  }, [modulesClassGroups]);

  useEffect(() => {
    if (!selectedAssignmentId && assignments[0]) {
      setSelectedAssignmentId(assignments[0].id);
    }
  }, [assignments, selectedAssignmentId]);

  const selectedAssignment = assignments.find(
    (assignment) => assignment.id === selectedAssignmentId
  );

  const refreshAbsences = useCallback(async () => {
    setIsLoading(true);
    const res = await attendance_client.listAbsences({ include_deleted: true });
    if (res.ok) {
      setAbsences(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refreshAbsences();

    const interval = window.setInterval(() => {
      void refreshAbsences();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshAbsences();
      }
    };

    const handleWindowFocus = () => {
      void refreshAbsences();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [refreshAbsences, selectedAssignmentId, selectedDate, selectedHour]);

  const currentStudents = useMemo(() => {
    if (!selectedAssignment) return [];
    return students.filter(
      (student) =>
        student.class_group?.class_group_id === selectedAssignment.classGroupId &&
        student.full_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, selectedAssignment, students]);

  const existingAbsences = useMemo(() => {
    if (!selectedAssignment) return [];
    return absences.filter(
      (absence) =>
        absence.class_group?.class_group_id === selectedAssignment.classGroupId &&
        absence.module?.module_id === selectedAssignment.moduleId &&
        absence.date === selectedDate &&
        absence.hour === selectedHour &&
        !absence.is_deleted &&
        absence.status === "absent"
    );
  }, [absences, selectedAssignment, selectedDate, selectedHour]);

  const lockedAbsentIds = useMemo(
    () => existingAbsences.map((absence) => absence.student.student_id),
    [existingAbsences]
  );

  const activeUndoAbsencesByStudentId = useMemo(() => {
    const byStudentId = new Map<string, AttendanceAbsence>();

    existingAbsences.forEach((absence) => {
      if (!absence.can_teacher_undo || !absence.undo_deadline) {
        return;
      }

      const remainingMs = getUndoRemainingMs(absence, now);
      if (remainingMs <= 0) {
        return;
      }

      const current = byStudentId.get(absence.student.student_id);
      const currentCreatedAtMs = parseApiDateTimeToMs(current?.created_at) ?? 0;
      const absenceCreatedAtMs = parseApiDateTimeToMs(absence.created_at) ?? 0;
      if (!current || currentCreatedAtMs < absenceCreatedAtMs) {
        byStudentId.set(absence.student.student_id, absence);
      }
    });

    return byStudentId;
  }, [existingAbsences, now]);

  useEffect(() => {
    setDraftAbsentIds(lockedAbsentIds);
  }, [lockedAbsentIds, selectedAssignmentId, selectedDate, selectedHour]);

  const absentCount = draftAbsentIds.length;
  const presentCount = Math.max(currentStudents.length - absentCount, 0);
  const presentPercentage = currentStudents.length
    ? Math.round((presentCount / currentStudents.length) * 100)
    : 0;

  const buildPayload = (studentIds: string[]): MarkAttendancePayload[] => {
    if (!selectedAssignment) return [];
    return studentIds.map((studentId) => ({
      student_id: studentId,
      module_id: selectedAssignment.moduleId,
      class_group_id: selectedAssignment.classGroupId,
      date: selectedDate,
      hour: selectedHour,
    }));
  };

  const persistAbsences = async (studentIds: string[]) => {
    const payload = buildPayload(studentIds);
    if (!payload.length) {
      return false;
    }

    setSavingStudentIds((current) => [...current, ...studentIds]);
    const csrf = getCSRFToken() ?? "";
    const res = await attendance_client.markAbsences(payload, csrf);
    if (res.ok) {
      setFeedback(getTranslation("teacherAbsenceSaved", language));
      await refreshAbsences();
      setSavingStudentIds((current) => current.filter((id) => !studentIds.includes(id)));
      return true;
    } else {
      const errorMessage =
        typeof res.error === "object" && res.error !== null && "detail" in res.error
          ? String((res.error as { detail?: unknown }).detail ?? "")
          : "";
      setFeedback(
        errorMessage
          ? `${getTranslation("teacherAbsenceSaveFailed", language)}: ${errorMessage}`
          : getTranslation("teacherAbsenceSaveFailed", language)
      );
      setSavingStudentIds((current) => current.filter((id) => !studentIds.includes(id)));
      return false;
    }
  };

  const undoAbsence = async (absence: AttendanceAbsence) => {
    setSavingStudentIds((current) => [...current, absence.student.student_id]);
    const csrf = getCSRFToken() ?? "";
    const res = await attendance_client.undoAbsence(absence.id, csrf);

    if (res.ok) {
      setFeedback(getTranslation("attendanceUndoSuccess", language));
      await refreshAbsences();
    } else {
      const errorMessage =
        typeof res.error === "object" && res.error !== null && "detail" in res.error
          ? String((res.error as { detail?: unknown }).detail ?? "")
          : "";
      setFeedback(
        errorMessage
          ? `${getTranslation("attendanceUndoFailed", language)}: ${errorMessage}`
          : getTranslation("attendanceUndoFailed", language)
      );
    }

    setSavingStudentIds((current) => current.filter((id) => id !== absence.student.student_id));
  };

  const toggleAbsent = (studentId: string, nextState?: boolean) => {
    const isAbsent = draftAbsentIds.includes(studentId);
    const locked = lockedAbsentIds.includes(studentId);
    const isSavingStudent = savingStudentIds.includes(studentId);
    const shouldBeAbsent = nextState ?? !isAbsent;

    if (locked || isSavingStudent || !shouldBeAbsent) {
      return;
    }

    setDraftAbsentIds((current) =>
      current.includes(studentId) ? current : [...current, studentId]
    );

    void (async () => {
      const saved = await persistAbsences([studentId]);
      if (!saved) {
        setDraftAbsentIds((current) => current.filter((currentId) => currentId !== studentId));
      }
    })();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getTranslation("teacherAbsencesTab", language)}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {getTranslation("teacherAbsencesTabSubtitle", language)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center rounded-xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-200">
              {getTranslation("attendanceAutoSaveHint", language)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("moduleClass", language)}</span>
            <select
              value={selectedAssignmentId}
              onChange={(event) => setSelectedAssignmentId(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            >
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.classGroupName} - {assignment.moduleName}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("Date", language)}</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("hour", language)}</span>
            <select
              value={selectedHour}
              onChange={(event) => setSelectedHour(Number(event.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            >
              {Array.from({ length: 8 }, (_, index) => index + 1).map((hour) => (
                <option key={hour} value={hour}>
                  {getTranslation("hourLabel", language)} {hour}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("searchStudent", language)}</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 dark:border-gray-600 dark:bg-gray-900"
                placeholder={getTranslation("searchStudentPlaceholder", language)}
              />
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          [getTranslation("presentRate", language), `${presentPercentage}%`],
          [getTranslation("absentCount", language), String(absentCount)],
          [getTranslation("students", language), String(currentStudents.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getTranslation("teacherMarkAbsences", language)}
          </h3>
        </div>
        <div className="mb-4 rounded-2xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm text-primary-800 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-100">
          {getTranslation("teacherAttendanceFreshListHint", language)}
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("loading", language)}</p>
          ) : currentStudents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("noStudentsForSelection", language)}</p>
          ) : (
            currentStudents.map((student) => {
              const isAbsent = draftAbsentIds.includes(student.student_id);
              const isLocked = lockedAbsentIds.includes(student.student_id);
              const isSavingStudent = savingStudentIds.includes(student.student_id);
              const undoableAbsence = activeUndoAbsencesByStudentId.get(student.student_id);
              const undoSecondsLeft = undoableAbsence
                ? Math.ceil(getUndoRemainingMs(undoableAbsence, now) / 1000)
                : 0;
              return (
                <button
                  key={student.student_id}
                  type="button"
                  onClick={() => toggleAbsent(student.student_id)}
                  onKeyDown={(event) => {
                    if (event.key.toLowerCase() === "a") toggleAbsent(student.student_id, true);
                    if (event.key.toLowerCase() === "p") toggleAbsent(student.student_id, false);
                  }}
                  disabled={isSavingStudent}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${isAbsent ? "border-orange-300 bg-orange-50 dark:border-orange-500/40 dark:bg-orange-950/30" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"}`}
                >
                  <div className="min-w-0">
                    <p className={`font-semibold ${isAbsent ? "line-through text-orange-700 dark:text-orange-300" : "text-gray-900 dark:text-white"}`}>
                      {student.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isSavingStudent
                        ? getTranslation("saving", language)
                        : isLocked
                          ? getTranslation("teacherAbsenceAlreadySaved", language)
                          : getTranslation("present", language)}
                    </p>
                    {undoableAbsence && undoSecondsLeft > 0 ? (
                      <span
                        onClick={(event) => {
                          event.stopPropagation();
                          void undoAbsence(undoableAbsence);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            void undoAbsence(undoableAbsence);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="mt-2 inline-flex items-center gap-1 rounded-full border border-primary-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-primary-700 hover:border-primary-300 dark:border-primary-500/30 dark:bg-gray-900 dark:text-primary-200"
                      >
                        <Undo2 className="h-3 w-3" />
                        {getTranslation("undoAbsence", language)}
                        <span>{undoSecondsLeft}s</span>
                      </span>
                    ) : null}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${isAbsent ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"}`}>
                    {isAbsent ? getTranslation("absent", language) : getTranslation("present", language)}
                  </span>
                </button>
              );
            })
          )}
        </div>
        {feedback ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            {feedback}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default TeacherAttendanceTab;