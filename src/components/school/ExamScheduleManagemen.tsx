import React, { useEffect, useState } from "react";
import { Calendar, Download, Eye, Search, Trash2, Upload } from "lucide-react";
import { ExamScheduleManagementProps } from "../../types";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { ExamSchedule } from "../../models/ExamSchedule";
import { ClassGroup } from "../../models/ClassGroups";

const ExamScheduleManagement: React.FC<ExamScheduleManagementProps> = ({ class_groups_list }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingExamSchedule, setEditingExamSchedule] = useState<ExamSchedule | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { language } = useLanguage();

  const fetchExamSchedules = async () => {
    setLoading(true);
    const res = await school_dashboard_client.get_current_school_exam_schedules();
    if (res.ok) {
      setExamSchedules(res.data as ExamSchedule[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchExamSchedules();
  }, []);

  const examScheduleByClassGroup: Record<string, ExamSchedule> = {};
  examSchedules.forEach((schedule) => {
    examScheduleByClassGroup[schedule.class_group_id] = schedule;
  });

  const filteredClassGroups = class_groups_list.filter((cg: ClassGroup) =>
    cg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openUploadModal = (classGroup: ClassGroup) => {
    setSelectedClassGroupId(classGroup.class_group_id);
    setEditingExamSchedule(examScheduleByClassGroup[classGroup.class_group_id] ?? null);
    setSelectedFile(null);
    setFileError(null);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setEditingExamSchedule(null);
    setSelectedFile(null);
    setFileError(null);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setSelectedFile(null);
      setFileError(getTranslation("pdfOnlyError", language));
      return;
    }

    setSelectedFile(file);
    setFileError(null);
  };

  const handleUpload = async () => {
    if (!selectedClassGroupId || !selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append("pdf_file", selectedFile);

    const response = await school_dashboard_client.upload_exam_schedule(
      selectedClassGroupId,
      formData,
      getCSRFToken()!
    );

    if (response.ok) {
      await fetchExamSchedules();
      closeUploadModal();
    }
  };

  const handleDeleteExam = async (classGroupId: string) => {
    await school_dashboard_client.delete_exam_schedule(classGroupId, getCSRFToken()!);
    await fetchExamSchedules();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation("ExamSchedule", language)}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={getTranslation("searchClass", language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {getTranslation("examSchedulePdf", language)}
          </h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 animate-pulse text-gray-300" />
              <p>{getTranslation("loading", language)}</p>
            </div>
          ) : filteredClassGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{getTranslation("noExamSchedulesAvailable", language)}</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("className", language)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("examSchedulePdf", language)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClassGroups.map((classGroup) => {
                  const examSchedule = examScheduleByClassGroup[classGroup.class_group_id];
                  const hasFile = !!examSchedule?.pdf_file;
                  const viewUrl = examSchedule?.view_url ?? null;
                  const downloadUrl = examSchedule?.download_url ?? null;

                  return (
                    <tr key={classGroup.class_group_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                        {classGroup.name}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openUploadModal(classGroup)}
                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                            title={hasFile ? getTranslation("update", language) : getTranslation("upload", language)}
                          >
                            <Upload className="h-5 w-5" />
                          </button>

                          {hasFile && viewUrl ? (
                            <a
                              href={viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                              title={getTranslation("view", language)}
                            >
                              <Eye className="h-5 w-5" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              title={getTranslation("view", language)}
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          )}

                          {hasFile && downloadUrl ? (
                            <a
                              href={downloadUrl}
                              download
                              className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                              title={getTranslation("download", language)}
                            >
                              <Download className="h-5 w-5" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              title={getTranslation("download", language)}
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          )}

                          {hasFile ? (
                            <button
                              onClick={() => handleDeleteExam(classGroup.class_group_id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title={getTranslation("delete", language)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              title={getTranslation("delete", language)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingExamSchedule?.has_pdf
                ? getTranslation("updateExamSchedule", language)
                : getTranslation("uploadExamSchedule", language)}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("className", language)}
                </label>
                <p className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                  {class_groups_list.find((cg) => cg.class_group_id === selectedClassGroupId)?.name ?? "—"}
                </p>
              </div>

              {editingExamSchedule?.pdf_file && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("currentFile", language)}
                  </label>
                  <a
                    href={editingExamSchedule.view_url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 underline text-sm"
                  >
                    {getTranslation("viewCurrentExamSchedule", language)}
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("examSchedulePdf", language)} (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                {fileError ? (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fileError}</p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {getTranslation("cancel", language)}
                </button>
                <button
                  type="button"
                  disabled={!selectedFile}
                  onClick={handleUpload}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {editingExamSchedule?.has_pdf
                    ? getTranslation("update", language)
                    : getTranslation("upload", language)}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduleManagement;
