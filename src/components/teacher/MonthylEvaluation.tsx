import React, { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Edit, Paperclip, Save, Search, Trash2 } from "lucide-react";
import { MonthylEvaluationProps } from "../../types";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import {
  PatchMonthlyEvaluationPayload,
  PostMonthlyEvaluationPayload,
} from "../../services/http_api/payloads_types/teacher_client_payload_types";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { MonthlyEvaluation } from "../../models/MonthlyEvaluation";
import { Student } from "../../models/Student";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

type EvaluationFormState = {
  title: string;
  description: string;
  month: string;
  attachment: File | null;
  participationMark: string;
  homeworksMark: string;
};

const defaultFormState = (): EvaluationFormState => ({
  title: "",
  description: "",
  month: new Date().toISOString().slice(0, 7),
  attachment: null,
  participationMark: "",
  homeworksMark: "",
});

const MonthylEvaluation: React.FC<MonthylEvaluationProps> = ({
  students_list,
  modules_class_groups,
  monthly_evaluations,
  setMonthlyEvaluations,
}) => {
  const { language } = useLanguage();
  const [selectedStudentId, setSelectedStudentId] = useState(
    students_list[0]?.student_id ?? ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [formState, setFormState] = useState<EvaluationFormState>(defaultFormState());
  const [editingEvaluation, setEditingEvaluation] = useState<MonthlyEvaluation | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!students_list.length) {
      setSelectedStudentId("");
      return;
    }
    if (!selectedStudentId) {
      const firstStudent = students_list[0];
      if (firstStudent) {
        setSelectedStudentId(firstStudent.student_id);
      }
    }
  }, [students_list, selectedStudentId]);

  const filteredStudents = useMemo(
    () =>
      students_list.filter((student: Student) =>
        student.full_name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
      ),
    [searchTerm, students_list]
  );

  const selectedStudent = useMemo(
    () => students_list.find((student) => student.student_id === selectedStudentId),
    [students_list, selectedStudentId]
  );

  const availableModules = useMemo(() => {
    if (!selectedStudent?.class_group?.class_group_id) {
      return [];
    }

    return modules_class_groups.filter(
      (item) => item.class_group.class_group_id === selectedStudent.class_group?.class_group_id
    );
  }, [modules_class_groups, selectedStudent]);

  useEffect(() => {
    if (!availableModules.length) {
      setSelectedModuleId("");
      return;
    }
    if (!selectedModuleId) {
      const firstModule = availableModules[0];
      if (firstModule) {
        setSelectedModuleId(firstModule.module.module_id);
      }
    }
    const hasSelected = availableModules.some(
      (item) => item.module.module_id === selectedModuleId
    );
    if (!hasSelected) {
      const firstModule = availableModules[0];
      if (firstModule) {
        setSelectedModuleId(firstModule.module.module_id);
      }
    }
  }, [availableModules, selectedModuleId]);

  const loadStudentEvaluations = async (studentId: string) => {
    setLoading(true);
    setErrorMessage("");
    const res = await teacher_dashboard_client.get_student_monthly_evaluations(studentId);
    if (res.ok) {
      setMonthlyEvaluations(res.data as MonthlyEvaluation[]);
    } else {
      setErrorMessage(getTranslation("evaluationLoadFailed", language));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedStudentId) return;
    loadStudentEvaluations(selectedStudentId);
  }, [selectedStudentId]);

  const resetForm = () => {
    setFormState(defaultFormState());
    setEditingEvaluation(null);
    setFeedbackMessage("");
  };

  const handleEdit = (evaluation: MonthlyEvaluation) => {
    setEditingEvaluation(evaluation);
    setFormState({
      title: evaluation.title ?? "",
      description: evaluation.description ?? evaluation.remarks ?? "",
      month: evaluation.month.slice(0, 7),
      attachment: null,
      participationMark: evaluation.mark_of_participation_in_class != null
        ? String(evaluation.mark_of_participation_in_class)
        : "",
      homeworksMark: evaluation.homeworks_mark != null
        ? String(evaluation.homeworks_mark)
        : "",
    });
    setFeedbackMessage("");
  };

  const handleSave = async () => {
    if (!selectedStudentId) return;

    const csrfToken = getCSRFToken() ?? "";
    if (!selectedModuleId) {
      setFeedbackMessage(getTranslation("selectModuleToManageEvaluation", language));
      return;
    }

    const payloadBase: PostMonthlyEvaluationPayload | PatchMonthlyEvaluationPayload = {
      student_id: selectedStudentId,
      module_id: selectedModuleId,
      month: `${formState.month}-01`,
      title: formState.title.trim() || null,
      description: formState.description.trim() || null,
      remarks: formState.description.trim() || null,
      attachment: formState.attachment ?? undefined,
      mark_of_participation_in_class: formState.participationMark !== ""
        ? parseFloat(formState.participationMark)
        : null,
      homeworks_mark: formState.homeworksMark !== ""
        ? parseFloat(formState.homeworksMark)
        : null,
    };

    setSaving(true);
    const response = editingEvaluation
      ? await teacher_dashboard_client.patch_monthly_evaluation(
          editingEvaluation.id,
          payloadBase as PatchMonthlyEvaluationPayload,
          csrfToken
        )
      : await teacher_dashboard_client.post_monthly_evaluation(
          selectedStudentId,
          payloadBase as PostMonthlyEvaluationPayload,
          csrfToken
        );

    if (response.ok) {
      const savedEvaluation = response.data as MonthlyEvaluation;
      setMonthlyEvaluations((prev) => {
        const exists = prev.some((evaluation) => evaluation.id === savedEvaluation.id);
        if (exists) {
          return prev.map((evaluation) =>
            evaluation.id === savedEvaluation.id ? savedEvaluation : evaluation
          );
        }
        return [savedEvaluation, ...prev];
      });
      setFeedbackMessage(getTranslation("evaluationSaved", language));
      resetForm();
    } else {
      setFeedbackMessage(getTranslation("evaluationSaveFailed", language));
    }

    setSaving(false);
  };

  const handleDelete = async (evaluationId: number) => {
    const confirmed = window.confirm(
      getTranslation("confirmDeleteMonthlyEvaluation", language)
    );
    if (!confirmed) return;

    setDeletingId(evaluationId);
    const csrfToken = getCSRFToken() ?? "";
    const response = await teacher_dashboard_client.delete_monthly_evaluation(
      evaluationId,
      csrfToken
    );

    if (response.ok) {
      setMonthlyEvaluations((prev) =>
        prev.filter((evaluation) => evaluation.id !== evaluationId)
      );
      setFeedbackMessage(getTranslation("evaluationDeleted", language));
    } else {
      setFeedbackMessage(getTranslation("evaluationDeleteFailed", language));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getTranslation("monthlyEvaluation", language)}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation("monthlyEvaluationDescription", language)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1 text-primary-700 dark:text-primary-300">
                {getTranslation("monthlyEvaluationTeacherHint", language)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={getTranslation("searchStudents", language)}
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {filteredStudents.map((student) => (
                <option key={student.student_id} value={student.student_id}>
                  {student.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {getTranslation("addMonthlyEvaluation", language)}
            </h3>
            {!selectedStudentId ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getTranslation("selectStudentPrompt", language)}
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getTranslation("evaluationTitle", language)}
                  </label>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getTranslation("evaluationMonth", language)}
                  </label>
                  <input
                    type="month"
                    value={formState.month}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, month: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getTranslation("module", language)}
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {availableModules.map((item) => (
                      <option key={item.module.module_id} value={item.module.module_id}>
                        {item.module.module_name}
                      </option>
                    ))}
                  </select>
                  {!availableModules.length && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
                      {getTranslation("noModulesForSelectedClass", language)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {getTranslation("participationMark", language)}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={formState.participationMark}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, participationMark: e.target.value }))
                      }
                      placeholder="0 – 20"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {getTranslation("homeworksMark", language)}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={formState.homeworksMark}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, homeworksMark: e.target.value }))
                      }
                      placeholder="0 – 20"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getTranslation("evaluationDescription", language)}
                  </label>
                  <textarea
                    value={formState.description}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={4}
                    placeholder={getTranslation("monthlyEvaluationRemarksPlaceholder", language)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getTranslation("evaluationAttachment", language)}
                  </label>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    {getTranslation("homeworkAttachmentHint", language)}
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          attachment: e.target.files?.[0] ?? null,
                        }))
                      }
                      className="w-full text-sm text-gray-600 dark:text-gray-300"
                    />
                  </div>
                  {(formState.attachment || editingEvaluation?.attachment) && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Paperclip className="h-4 w-4" />
                      <span>
                        {formState.attachment?.name ?? editingEvaluation?.attachment}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {feedbackMessage}
                  </span>
                  <div className="flex items-center gap-2">
                    {editingEvaluation && (
                      <button
                        onClick={resetForm}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {getTranslation("cancel", language)}
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={saving || !selectedStudentId}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>
                        {saving
                          ? getTranslation("savingEvaluation", language)
                          : editingEvaluation
                            ? getTranslation("updateEvaluation", language)
                            : getTranslation("addEvaluation", language)}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedStudent?.full_name ?? getTranslation("students", language)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedStudent?.class_group?.name ?? ""}
                  </p>
                </div>
                {loading && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getTranslation("loading", language)}
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
                  {errorMessage}
                </div>
              )}

              {!monthly_evaluations.length && !loading ? (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  {getTranslation("noMonthlyEvaluationsForStudent", language)}
                </div>
              ) : (
                <div className="space-y-3">
                  {monthly_evaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {evaluation.title || getTranslation("monthlyEvaluation", language)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {evaluation.month.slice(0, 7)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(evaluation)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-300"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            {getTranslation("edit", language)}
                          </button>
                          <button
                            onClick={() => handleDelete(evaluation.id)}
                            disabled={deletingId === evaluation.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingId === evaluation.id
                              ? getTranslation("deletingEvaluation", language)
                              : getTranslation("delete", language)}
                          </button>
                        </div>
                      </div>

                      {(evaluation.mark_of_participation_in_class != null || evaluation.homeworks_mark != null) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {evaluation.mark_of_participation_in_class != null && (
                            <span className="inline-flex items-center gap-1 text-xs rounded-full bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 text-primary-700 dark:text-primary-300">
                              {getTranslation("participationMark", language)}: {evaluation.mark_of_participation_in_class}/20
                            </span>
                          )}
                          {evaluation.homeworks_mark != null && (
                            <span className="inline-flex items-center gap-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">
                              {getTranslation("homeworksMark", language)}: {evaluation.homeworks_mark}/20
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-wrap">
                        {evaluation.description || evaluation.remarks || "-"}
                      </p>

                      {evaluation.attachment && (
                        <a
                          href={evaluation.attachment}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-xs text-primary-600 hover:underline dark:text-primary-300"
                        >
                          <Paperclip className="h-4 w-4" />
                          {getTranslation("viewAttachment", language)}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthylEvaluation;