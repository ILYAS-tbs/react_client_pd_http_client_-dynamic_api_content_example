import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Search, Trash2 } from "lucide-react";
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

const SchoolManageAbsencesTab: React.FC<SchoolManageAbsencesTabProps> = ({
  students,
  classGroups,
  teachers,
  modules,
}) => {
  const { language } = useLanguage();
  const [selectedClassGroupId, setSelectedClassGroupId] = useState(classGroups[0]?.class_group_id ?? "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dailyAbsences, setDailyAbsences] = useState<AttendanceAbsence[]>([]);
  const [savingStudentIds, setSavingStudentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedClassGroupId && classGroups[0]) {
      setSelectedClassGroupId(classGroups[0].class_group_id);
    }
  }, [classGroups, selectedClassGroupId]);

  const loadDailyAbsences = useCallback(async () => {
    if (!selectedClassGroupId) {
      setDailyAbsences([]);
      return;
    }

    setIsLoading(true);
    const response = await attendance_client.listAbsences({
      class: selectedClassGroupId,
      date: selectedDate,
    });
    if (response.ok) {
      setDailyAbsences(response.data.filter((absence) => !absence.is_deleted));
    }
    setIsLoading(false);
  }, [selectedClassGroupId, selectedDate]);

  useEffect(() => {
    void loadDailyAbsences();
  }, [loadDailyAbsences]);

  const classStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return students
      .filter((student) => student.class_group?.class_group_id === selectedClassGroupId)
      .filter((student) => !normalizedSearch || student.full_name.toLowerCase().includes(normalizedSearch))
      .sort((left, right) => left.full_name.localeCompare(right.full_name));
  }, [search, selectedClassGroupId, students]);

  const activeAbsenceByStudentId = useMemo(() => {
    const map = new Map<string, AttendanceAbsence>();
    dailyAbsences.forEach((absence) => {
      map.set(absence.student.student_id, absence);
    });
    return map;
  }, [dailyAbsences]);

  const stats = useMemo(() => {
    const absentCount = classStudents.filter((student) => activeAbsenceByStudentId.has(student.student_id)).length;
    const presentCount = classStudents.length - absentCount;
    return { absentCount, presentCount, totalCount: classStudents.length };
  }, [activeAbsenceByStudentId, classStudents]);

  const getErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null) {
      if ("detail" in error) {
        return String((error as { detail?: unknown }).detail ?? "");
      }
      const firstValue = Object.values(error as Record<string, unknown>)[0];
      if (Array.isArray(firstValue)) {
        return firstValue.map(String).join(", ");
      }
      if (firstValue) {
        return String(firstValue);
      }
    }
    if (Array.isArray(error)) {
      return error.join(", ");
    }
    return "";
  };

  const handleMarkAbsent = async (studentId: string) => {
    if (!selectedClassGroupId || savingStudentIds.includes(studentId) || activeAbsenceByStudentId.has(studentId)) {
      return;
    }

    setFeedback(null);
    setSavingStudentIds((current) => [...current, studentId]);

    const response = await attendance_client.quickMarkAbsence(
      {
        student_id: studentId,
        class_group_id: selectedClassGroupId,
        date: selectedDate,
        module_id: selectedModuleId || undefined,
        teacher_id: selectedTeacherId ? Number(selectedTeacherId) : undefined,
      },
      getCSRFToken() ?? ""
    );

    if (response.ok) {
      setDailyAbsences((current) => [response.data, ...current.filter((absence) => absence.id !== response.data.id)]);
    } else {
      setFeedback(getErrorMessage(response.error) || getTranslation("quickMarkFailed", language));
    }

    setSavingStudentIds((current) => current.filter((id) => id !== studentId));
  };

  const handleRemoveAbsence = async (studentId: string) => {
    const activeAbsence = activeAbsenceByStudentId.get(studentId);
    if (!activeAbsence || savingStudentIds.includes(studentId)) {
      return;
    }

    setFeedback(null);
    setSavingStudentIds((current) => [...current, studentId]);

    const response = await attendance_client.deleteAbsence(
      activeAbsence.id,
      "manual deletion",
      getCSRFToken() ?? ""
    );

    if (response.ok) {
      setDailyAbsences((current) => current.filter((absence) => absence.id !== activeAbsence.id));
    } else {
      setFeedback(getErrorMessage(response.error) || getTranslation("undoFailed", language));
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

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
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
          {/* <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("module", language)}</span>
            <select value={selectedModuleId} onChange={(event) => setSelectedModuleId(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              <option value="">{getTranslation("allModules", language)}</option>
              {modules.map((module) => (
                <option key={module.module_id} value={module.module_id}>{module.module_name}</option>
              ))}
            </select>
          </label> */}
          {/* <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{getTranslation("teacher", language)}</span>
            <select value={selectedTeacherId} onChange={(event) => setSelectedTeacherId(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              <option value="">{getTranslation("allTeachers", language)}</option>
              {teachers.map((teacher) => (
                <option key={teacher.user.id} value={teacher.user.id}>{teacher.full_name}</option>
              ))}
            </select>
          </label> */}
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
          <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("confirmedAbsent", language)}</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.absentCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("students", language)}</p>
          <p className="mt-2 text-2xl font-bold text-primary-600">{stats.totalCount}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-300 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTranslation("currentDayAbsences", language)}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClassGroupId ? `${classStudents.length} ${getTranslation("students", language)}` : getTranslation("selectClassGroup", language)}</p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{selectedDate}</span>
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
                  const activeAbsence = activeAbsenceByStudentId.get(student.student_id);
                  const isSaving = savingStudentIds.includes(student.student_id);
                  const statusClassName = activeAbsence
                    ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200";
                  const context = [activeAbsence?.module?.module_name, activeAbsence?.teacher?.full_name]
                    .filter(Boolean)
                    .join(" • ");
                  const statusLabel = activeAbsence
                    ? `${getTranslation("confirmedAbsent", language)}${context ? ` • ${context}` : ""}`
                    : getTranslation("present", language);

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
                        {activeAbsence ? (
                          <button type="button" onClick={() => { void handleRemoveAbsence(student.student_id); }} disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60 dark:border-red-500/30 dark:text-red-200">
                            <Trash2 className="h-3.5 w-3.5" />
                            {getTranslation("removeAbsence", language)}
                          </button>
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