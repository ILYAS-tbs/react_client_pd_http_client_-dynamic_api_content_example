import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Download, Upload } from "lucide-react";
import { Student } from "../../models/Student";
import { AttendanceAbsence } from "../../models/Attendance";
import { attendance_client } from "../../services/http_api/attendance/attendance_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

interface ParentAttendanceTabProps {
  students: Student[];
  selectedStudentId?: string | null;
}

function getLocalizedSessionLabel(hour: number, language: string) {
  return getTranslation(`session${hour}` as never, language);
}

function getLocalizedStatus(status: string, language: string) {
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

const ParentAttendanceTab: React.FC<ParentAttendanceTabProps> = ({ students, selectedStudentId }) => {
  const { language } = useLanguage();
  const [absences, setAbsences] = useState<AttendanceAbsence[]>([]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [selectedAbsence, setSelectedAbsence] = useState<AttendanceAbsence | null>(null);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [activeSection, setActiveSection] = useState<"absences" | "history">("absences");

  const loadAbsences = useCallback(async () => {
    if (!selectedStudentId) {
      setAbsences([]);
      return;
    }

    const res = await attendance_client.listAbsences({
      include_deleted: true,
      student: selectedStudentId,
    });
    if (res.ok) setAbsences(res.data);
  }, [selectedStudentId]);

  useEffect(() => {
    void loadAbsences();
  }, [selectedStudentId]);

  const grouped = useMemo(() => {
    return students.map((student) => {
      const items = absences.filter((absence) => absence.student.student_id === student.student_id);
      return {
        student,
        items,
        totalActive: items.filter((absence) => !absence.is_deleted).length,
        pending: items.filter((absence) => absence.justification?.status === "pending").length,
      };
    });
  }, [absences, students]);

  const history = useMemo(
    () =>
      absences
        .filter((absence) => absence.justification)
        .sort((left, right) => right.created_at.localeCompare(left.created_at)),
    [absences]
  );

  const submitJustification = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedAbsence || !comment.trim()) return;
    const res = await attendance_client.submitJustification(
      { absence_id: selectedAbsence.id, comment: comment.trim(), file },
      getCSRFToken() ?? ""
    );
    if (res.ok) {
      setSelectedAbsence(null);
      setComment("");
      setFile(null);
      await loadAbsences();
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTranslation("myKidsAbsencesTab", language)}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("myKidsAbsencesSubtitle", language)}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setActiveSection("absences")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeSection === "absences" ? "bg-primary-500 text-white" : "border border-gray-200 text-gray-700 dark:border-gray-600 dark:text-gray-200"}`}>
            {getTranslation("absenceList", language)}
          </button>
          <button type="button" onClick={() => setActiveSection("history")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeSection === "history" ? "bg-primary-500 text-white" : "border border-gray-200 text-gray-700 dark:border-gray-600 dark:text-gray-200"}`}>
            {getTranslation("justificationHistory", language)}
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {activeSection === "absences" ? (
        <div className="space-y-4">
          {grouped.map(({ student, items, totalActive, pending }) => (
            <article key={student.student_id} className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <button type="button" onClick={() => setExpandedStudentId((current) => current === student.student_id ? null : student.student_id)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{student.full_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("totalAbsences", language)}: {totalActive} • {getTranslation("pendingJustifications", language)}: {pending}</p>
                </div>
                <Calendar className="h-5 w-5 text-primary-500" />
              </button>
              {expandedStudentId === student.student_id ? (
                <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                          <th className="px-3 py-2">{getTranslation("Date", language)}</th>
                          <th className="px-3 py-2">{getTranslation("moduleHour", language)}</th>
                          <th className="px-3 py-2">{getTranslation("teacher", language)}</th>
                          <th className="px-3 py-2">{getTranslation("status", language)}</th>
                          <th className="px-3 py-2">{getTranslation("justification", language)}</th>
                          <th className="px-3 py-2">{getTranslation("actions", language)}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((absence) => (
                          <tr key={absence.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="px-3 py-3 text-gray-700 dark:text-gray-200">{absence.date}</td>
                            <td className="px-3 py-3 text-gray-700 dark:text-gray-200">{absence.module?.module_name ?? "—"} / {getLocalizedSessionLabel(absence.hour, language)}</td>
                            <td className="px-3 py-3 text-gray-700 dark:text-gray-200">{absence.teacher.full_name}</td>
                            <td className="px-3 py-3 text-gray-700 dark:text-gray-200">{getLocalizedStatus(absence.status, language)}</td>
                            <td className="px-3 py-3 text-gray-700 dark:text-gray-200">{absence.justification?.comment ?? "—"}</td>
                            <td className="px-3 py-3">
                              {!absence.is_deleted && absence.justification?.status !== "pending" && absence.justification?.status !== "approved" ? (
                                <button type="button" onClick={() => setSelectedAbsence(absence)} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white">
                                  <Upload className="h-3.5 w-3.5" />
                                  {getTranslation("justifyAbsence", language)}
                                </button>
                              ) : !absence.is_deleted && !absence.justification ? (
                                <button type="button" onClick={() => setSelectedAbsence(absence)} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white">
                                  <Upload className="h-3.5 w-3.5" />
                                  {getTranslation("justifyAbsence", language)}
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((absence) => (
            <article key={absence.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{absence.student.full_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{absence.date} • {absence.module?.module_name ?? "—"}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${absence.justification?.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200" : absence.justification?.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200"}`}>
                  {absence.justification?.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-200">{absence.justification?.comment}</p>
              {absence.justification?.review_note ? (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{absence.justification.review_note}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {selectedAbsence ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getTranslation("submitJustification", language)}</h3>
              <button type="button" onClick={() => setSelectedAbsence(null)} className="text-sm text-gray-500">{getTranslation("close", language)}</button>
            </div>
            <form onSubmit={submitJustification} className="space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4 text-sm dark:bg-gray-800">
                <p className="font-semibold text-gray-900 dark:text-white">{selectedAbsence.student.full_name}</p>
                <p className="mt-1 text-gray-500 dark:text-gray-400">{selectedAbsence.date} • {selectedAbsence.module?.module_name ?? "—"} / {getLocalizedSessionLabel(selectedAbsence.hour, language)}</p>
                <p className="mt-1 text-gray-500 dark:text-gray-400">{selectedAbsence.teacher.full_name}</p>
              </div>
              <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <span>{getTranslation("comment", language)}</span>
                <textarea value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} rows={5} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-800" />
              </label>
              <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <span>{getTranslation("uploadFile", language)}</span>
                <input type="file" accept="application/pdf,image/*" capture="environment" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </label>
              <button type="submit" className="w-full rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white">{getTranslation("submitJustification", language)}</button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ParentAttendanceTab;