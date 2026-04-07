import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  X,
  Download,
  BookOpen,
} from "lucide-react";
import { Homework, HomeworkSubmission, HomeworkStats } from "../../models/Homework";
import { homework_client } from "../../services/http_api/homework/homework_client";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";

interface TeacherHomeworksProps {
  modules_class_groups: TeacherModuleClassGroup[];
}

const TeacherHomeworks: React.FC<TeacherHomeworksProps> = ({
  modules_class_groups,
}) => {
  const { language } = useLanguage();

  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("");

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingHomework, setEditingHW] = useState<Homework | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date_assigned: "",
    last_submission_date: "",
    max_mark: "20",
    remarks: "",
    class_group: "",
    module: "",
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Submissions modal
  const [viewingHomework, setViewingHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [stats, setStats] = useState<HomeworkStats | null>(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<HomeworkSubmission | null>(null);
  const [gradeForm, setGradeForm] = useState({ mark: "", remarks: "" });
  const [gradingSaving, setGradingSaving] = useState(false);

  // Unique class-groups from teacher's assignments
  const uniqueClassGroups = Array.from(
    new Map(
      modules_class_groups.map((m) => [
        m.class_group.class_group_id,
        m.class_group,
      ])
    ).values()
  );

  const uniqueModules = modules_class_groups
    .filter(
      (m) =>
        !selectedClassGroup ||
        m.class_group.class_group_id === selectedClassGroup
    )
    .map((m) => m.module);

  useEffect(() => {
    if (uniqueClassGroups.length > 0 && !selectedClassGroup) {
      const first = uniqueClassGroups[0];
      if (first) setSelectedClassGroup(first.class_group_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules_class_groups]);

  useEffect(() => {
    fetchHomeworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassGroup]);

  async function fetchHomeworks() {
    setLoading(true);
    const res = await homework_client.getTeacherHomeworks(
      selectedClassGroup || undefined
    );
    if (res.ok) setHomeworks(res.data);
    setLoading(false);
  }

  function openCreate() {
    setEditingHW(null);
    setFormData({
      title: "",
      description: "",
      date_assigned: "",
      last_submission_date: "",
      max_mark: "20",
      remarks: "",
      class_group: selectedClassGroup,
      module: uniqueModules[0]?.module_id?.toString() ?? "",
    });
    setAttachmentFile(null);
    setShowModal(true);
  }

  function openEdit(hw: Homework) {
    setEditingHW(hw);
    setFormData({
      title: hw.title,
      description: hw.description ?? "",
      date_assigned: hw.date_assigned,
      last_submission_date: hw.last_submission_date,
      max_mark: String(hw.max_mark),
      remarks: hw.remarks ?? "",
      class_group: hw.class_group,
      module: hw.module?.toString() ?? "",
    });
    setAttachmentFile(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingHW(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });
    if (attachmentFile) fd.append("attachment", attachmentFile);

    const res = editingHomework
      ? await homework_client.updateHomework(editingHomework.id, fd)
      : await homework_client.createHomework(fd);

    if (res.ok) {
      fetchHomeworks();
      closeModal();
    }
    setSaving(false);
  }

  async function handleDelete(hw: Homework) {
    if (!confirm(getTranslation("confirmDelete", language) || "Confirm delete?"))
      return;
    const res = await homework_client.deleteHomework(hw.id);
    if (res.ok) fetchHomeworks();
  }

  async function openSubmissions(hw: Homework) {
    setViewingHomework(hw);
    setLoadingSubmissions(true);
    const [subsRes, statsRes] = await Promise.all([
      homework_client.getHomeworkSubmissions(hw.id),
      homework_client.getHomeworkStats(hw.id),
    ]);
    if (subsRes.ok) setSubmissions(subsRes.data);
    if (statsRes.ok) setStats(statsRes.data);
    setLoadingSubmissions(false);
  }

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!viewingHomework || !gradingSubmission) return;
    setGradingSaving(true);
    const res = await homework_client.gradeSubmission(
      viewingHomework.id,
      gradingSubmission.id,
      { mark: Number(gradeForm.mark), remarks: gradeForm.remarks }
    );
    if (res.ok) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === res.data.id ? res.data : s))
      );
      setGradingSubmission(null);
    }
    setGradingSaving(false);
  }

  const isOverdue = (hw: Homework) =>
    new Date(hw.last_submission_date) < new Date();

  return (
    <div className="space-y-6">
      {/* Header + class group filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {getTranslation("homeworksTab", language)}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedClassGroup}
            onChange={(e) => setSelectedClassGroup(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">
              {getTranslation("allClasses", language)}
            </option>
            {uniqueClassGroups.map((cg) => (
              <option key={cg.class_group_id} value={cg.class_group_id}>
                {cg.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            {getTranslation("addHomework", language)}
          </button>
        </div>
      </div>

      {/* Homeworks list */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          {getTranslation("loading", language)}...
        </div>
      ) : homeworks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {getTranslation("noHomeworksYet", language)}
          </p>
          <button
            onClick={openCreate}
            className="mt-4 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-sm transition-colors"
          >
            {getTranslation("addHomework", language)}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {homeworks.map((hw) => (
            <div
              key={hw.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    {hw.title}
                  </h3>
                  {hw.module_name && (
                    <p className="text-xs text-primary-500 mt-0.5">
                      {hw.module_name}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    isOverdue(hw)
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {isOverdue(hw)
                    ? getTranslation("expired", language)
                    : getTranslation("active", language)}
                </span>
              </div>

              {hw.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {hw.description}
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTranslation("assigned", language)}: {hw.date_assigned}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {getTranslation("deadline", language)}: {hw.last_submission_date}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-3 w-3 text-primary-500" />
                <span>
                  {hw.submissions_count} {getTranslation("submissions", language)}
                </span>
                <span className="mx-1">·</span>
                <span>
                  {getTranslation("maxMark", language)}: {hw.max_mark}
                </span>
              </div>

              {hw.attachment && (
                <a
                  href={`${SERVER_BASE_URL}${hw.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline"
                >
                  <Download className="h-3 w-3" />
                  {getTranslation("attachment", language)}
                </a>
              )}

              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => openSubmissions(hw)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 py-1.5 rounded-lg transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {getTranslation("viewSubmissions", language)}
                </button>
                <button
                  onClick={() => openEdit(hw)}
                  className="p-1.5 text-gray-500 hover:text-primary-500 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(hw)}
                  className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create/Edit Modal ────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingHomework
                  ? getTranslation("editHomework", language)
                  : getTranslation("addHomework", language)}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Class group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("class", language)}
                </label>
                <select
                  value={formData.class_group}
                  onChange={(e) =>
                    setFormData({ ...formData, class_group: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">--</option>
                  {uniqueClassGroups.map((cg) => (
                    <option key={cg.class_group_id} value={cg.class_group_id}>
                      {cg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Module */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("subject", language)}
                </label>
                <select
                  value={formData.module}
                  onChange={(e) =>
                    setFormData({ ...formData, module: e.target.value })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">--</option>
                  {uniqueModules.map((m) => (
                    <option key={m.module_id} value={m.module_id}>
                      {m.module_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("homeworkTitle", language)}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("description", language)}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("dateAssigned", language)}
                  </label>
                  <input
                    type="date"
                    value={formData.date_assigned}
                    onChange={(e) =>
                      setFormData({ ...formData, date_assigned: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("deadline", language)}
                  </label>
                  <input
                    type="date"
                    value={formData.last_submission_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        last_submission_date: e.target.value,
                      })
                    }
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Max mark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("maxMark", language)}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.max_mark}
                  onChange={(e) =>
                    setFormData({ ...formData, max_mark: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("remarks", language)}
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("attachment", language)}
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={(e) =>
                    setAttachmentFile(e.target.files?.[0] ?? null)
                  }
                  className="w-full text-sm text-gray-600 dark:text-gray-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {getTranslation("cancel", language)}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {saving
                    ? getTranslation("saving", language)
                    : getTranslation("save", language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Submissions Modal ─────────────────────────────────── */}
      {viewingHomework && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {viewingHomework.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getTranslation("submissionsOverview", language)}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewingHomework(null);
                  setGradingSubmission(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {getTranslation("loading", language)}...
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Stats bar */}
                {stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: getTranslation("totalStudents", language),
                        value: stats.total_students,
                        color: "bg-gray-100 dark:bg-gray-700",
                      },
                      {
                        label: getTranslation("submitted", language),
                        value: stats.submitted,
                        color: "bg-green-100 dark:bg-green-900/30",
                      },
                      {
                        label: getTranslation("notSubmitted", language),
                        value: stats.not_submitted,
                        color: "bg-red-100 dark:bg-red-900/30",
                      },
                      {
                        label: getTranslation("averageMark", language),
                        value: stats.average_mark ?? "—",
                        color: "bg-blue-100 dark:bg-blue-900/30",
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className={`${s.color} rounded-xl p-3 text-center`}
                      >
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {s.value}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submissions list */}
                {submissions.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                    {getTranslation("noSubmissionsYet", language)}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {sub.student_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {new Date(sub.submitted_at).toLocaleDateString()}
                            </p>
                            {sub.submission_text && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                                {sub.submission_text}
                              </p>
                            )}
                            {sub.submission_file && (
                              <a
                                href={`${SERVER_BASE_URL}${sub.submission_file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline mt-1"
                              >
                                <Download className="h-3 w-3" />
                                {getTranslation("downloadSubmission", language)}
                              </a>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {sub.is_graded ? (
                              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                                <CheckCircle className="h-4 w-4" />
                                {sub.mark} / {viewingHomework.max_mark}
                              </span>
                            ) : (
                              <span className="text-xs text-amber-500">
                                {getTranslation("pendingGrade", language)}
                              </span>
                            )}
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  setGradingSubmission(sub);
                                  setGradeForm({
                                    mark: sub.mark?.toString() ?? "",
                                    remarks: sub.remarks ?? "",
                                  });
                                }}
                                className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
                              >
                                {getTranslation("grade", language)}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Inline grade form */}
                        {gradingSubmission?.id === sub.id && (
                          <form
                            onSubmit={handleGrade}
                            className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 items-end"
                          >
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {getTranslation("mark", language)} / {viewingHomework.max_mark}
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={viewingHomework.max_mark}
                                step="0.5"
                                value={gradeForm.mark}
                                onChange={(e) =>
                                  setGradeForm({ ...gradeForm, mark: e.target.value })
                                }
                                required
                                className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {getTranslation("remarks", language)}
                              </label>
                              <input
                                type="text"
                                value={gradeForm.remarks}
                                onChange={(e) =>
                                  setGradeForm({
                                    ...gradeForm,
                                    remarks: e.target.value,
                                  })
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={gradingSaving}
                                className="px-3 py-1.5 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
                              >
                                {gradingSaving
                                  ? "..."
                                  : getTranslation("save", language)}
                              </button>
                              <button
                                type="button"
                                onClick={() => setGradingSubmission(null)}
                                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                {getTranslation("cancel", language)}
                              </button>
                            </div>
                          </form>
                        )}

                        {sub.remarks && sub.is_graded && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                            {getTranslation("teacherNote", language)}: {sub.remarks}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHomeworks;
