import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  FileText,
  X,
  Download,
  BookOpen,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Homework } from "../../models/Homework";
import { homework_client } from "../../services/http_api/homework/homework_client";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";

interface TeacherHomeworksProps {
  modules_class_groups: TeacherModuleClassGroup[];
  students: unknown[];
}

const TeacherHomeworks: React.FC<TeacherHomeworksProps> = ({
  modules_class_groups,
}) => {
  const { language } = useLanguage();

  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [viewingHomework, setViewingHomework] = useState<Homework | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    last_submission_date: "",
    class_group: "",
    module: "",
  });

  const uniqueClassGroups = useMemo(
    () =>
      Array.from(
        new Map(
          modules_class_groups.map((item) => [
            item.class_group.class_group_id,
            item.class_group,
          ])
        ).values()
      ),
    [modules_class_groups]
  );

  const availableModules = useMemo(
    () =>
      modules_class_groups
        .filter(
          (item) =>
            !formData.class_group ||
            item.class_group.class_group_id === formData.class_group
        )
        .map((item) => item.module),
    [formData.class_group, modules_class_groups]
  );

  useEffect(() => {
    if (!selectedClassGroup && uniqueClassGroups[0]) {
      setSelectedClassGroup(uniqueClassGroups[0].class_group_id);
    }
  }, [selectedClassGroup, uniqueClassGroups]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const response = await homework_client.getTeacherHomeworks(
        selectedClassGroup || undefined
      );
      if (response.ok) {
        setHomeworks(response.data);
      }
      setLoading(false);
    }

    load();
  }, [selectedClassGroup]);

  function openCreate() {
    setEditingHomework(null);
    setAttachmentFile(null);
    setFormData({
      title: "",
      description: "",
      last_submission_date: "",
      class_group: selectedClassGroup,
      module: "",
    });
    setShowModal(true);
  }

  function openEdit(homework: Homework) {
    setEditingHomework(homework);
    setAttachmentFile(null);
    setFormData({
      title: homework.title,
      description: homework.description ?? "",
      last_submission_date: homework.last_submission_date,
      class_group: homework.class_group,
      module: homework.module?.toString() ?? "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingHomework(null);
  }

  async function refreshHomeworks() {
    setLoading(true);
    const response = await homework_client.getTeacherHomeworks(
      selectedClassGroup || undefined
    );
    if (response.ok) {
      setHomeworks(response.data);
    }
    setLoading(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const payload = new FormData();
    const assignedDate =
      editingHomework?.date_assigned ?? new Date().toISOString().split("T")[0] ?? "";

    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("last_submission_date", formData.last_submission_date);
    payload.append("class_group", formData.class_group);
    payload.append("date_assigned", assignedDate);

    if (formData.module) {
      payload.append("module", formData.module);
    }

    if (attachmentFile) {
      payload.append("attachment", attachmentFile);
    }

    const response = editingHomework
      ? await homework_client.updateHomework(editingHomework.id, payload)
      : await homework_client.createHomework(payload);

    if (response.ok) {
      await refreshHomeworks();
      closeModal();
    }

    setSaving(false);
  }

  async function handleDelete(homework: Homework) {
    if (!confirm(getTranslation("confirmDelete", language))) {
      return;
    }

    const response = await homework_client.deleteHomework(homework.id);
    if (response.ok) {
      await refreshHomeworks();
    }
  }

  return (
    <div className="space-y-6">
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
            onChange={(event) => setSelectedClassGroup(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">{getTranslation("allClasses", language)}</option>
            {uniqueClassGroups.map((classGroup) => (
              <option
                key={classGroup.class_group_id}
                value={classGroup.class_group_id}
              >
                {classGroup.name}
              </option>
            ))}
          </select>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            <Plus className="h-4 w-4" />
            {getTranslation("addHomework", language)}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          {getTranslation("loading", language)}...
        </div>
      ) : homeworks.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            {getTranslation("noHomeworksYet", language)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {homeworks.map((homework) => (
            <div
              key={homework.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {homework.title}
                </h3>
                {homework.module_name && (
                  <p className="mt-0.5 text-xs text-primary-500">
                    {homework.module_name}
                  </p>
                )}
              </div>

              {homework.description && (
                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {homework.description}
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTranslation("dateAssigned", language)}: {homework.date_assigned}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {getTranslation("dueDate", language)}: {homework.last_submission_date}
                </span>
              </div>

              {homework.attachment && (
                <a
                  href={`${SERVER_BASE_URL}${homework.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline"
                >
                  <Download className="h-3 w-3" />
                  {getTranslation("attachment", language)}
                </a>
              )}

              <div className="mt-auto flex gap-2 border-t border-gray-100 pt-2 dark:border-gray-700">
                <button
                  onClick={() => setViewingHomework(homework)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary-50 py-1.5 text-xs text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-800"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {getTranslation("viewDetails", language)}
                </button>
                <button
                  onClick={() => openEdit(homework)}
                  className="p-1.5 text-gray-500 transition-colors hover:text-primary-500"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(homework)}
                  className="p-1.5 text-gray-500 transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
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

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation("class", language)}
                </label>
                <select
                  value={formData.class_group}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      class_group: event.target.value,
                      module: "",
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">--</option>
                  {uniqueClassGroups.map((classGroup) => (
                    <option
                      key={classGroup.class_group_id}
                      value={classGroup.class_group_id}
                    >
                      {classGroup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation("subject", language)}
                </label>
                <select
                  value={formData.module}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      module: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">--</option>
                  {availableModules.map((module) => (
                    <option key={module.module_id} value={module.module_id}>
                      {module.module_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation("homeworkTitle", language)}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation("description", language)}
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation("dueDate", language)}
                </label>
                <input
                  type="date"
                  value={formData.last_submission_date}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      last_submission_date: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation("attachment", language)}
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={(event) =>
                    setAttachmentFile(event.target.files?.[0] ?? null)
                  }
                  className="w-full text-sm text-gray-600 dark:text-gray-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {getTranslation("cancel", language)}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
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

      {viewingHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {viewingHomework.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {viewingHomework.class_group_name}
                  {viewingHomework.module_name ? ` · ${viewingHomework.module_name}` : ""}
                </p>
              </div>
              <button
                onClick={() => setViewingHomework(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">
                    {getTranslation("dateAssigned", language)}
                  </p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {viewingHomework.date_assigned}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">
                    {getTranslation("dueDate", language)}
                  </p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {viewingHomework.last_submission_date}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <Layers className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {getTranslation("class", language)}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {viewingHomework.class_group_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <GraduationCap className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {getTranslation("teacher", language)}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {viewingHomework.teacher_name}
                    </p>
                  </div>
                </div>
              </div>

              {viewingHomework.description && (
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">
                    {getTranslation("Details", language)}
                  </p>
                  <p className="leading-6 text-gray-700 dark:text-gray-300">
                    {viewingHomework.description}
                  </p>
                </div>
              )}

              {viewingHomework.attachment && (
                <a
                  href={`${SERVER_BASE_URL}${viewingHomework.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30"
                >
                  <Download className="h-4 w-4" />
                  {getTranslation("downloadAttachment", language)}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHomeworks;

