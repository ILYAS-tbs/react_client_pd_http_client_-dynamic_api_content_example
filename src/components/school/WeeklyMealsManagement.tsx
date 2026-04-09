import React, { useEffect, useState } from "react";
import { Calendar, Download, Eye, Trash2, Upload } from "lucide-react";
import { WeeklyMeal } from "../../models/WeeklyMeal";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { WeeklyMealsManagementProps } from "../../types";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

const buildEmptyWeeklyMeal = (schoolId: number): WeeklyMeal => ({
  school_id: schoolId,
  school_name: "",
  label: "Weekly Meals Program",
  weekly_meal_id: null,
  pdf_file: null,
  pdf_url: null,
  view_url: null,
  download_url: null,
  uploaded_by: null,
  uploaded_at: null,
  updated_at: null,
  has_pdf: false,
});

const WeeklyMealsManagement: React.FC<WeeklyMealsManagementProps> = ({ schoolId }) => {
  const { language } = useLanguage();
  const [weeklyMeal, setWeeklyMeal] = useState<WeeklyMeal>(() => buildEmptyWeeklyMeal(schoolId));
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const fetchWeeklyMeal = async () => {
    if (!schoolId || schoolId < 0) {
      return;
    }

    setLoading(true);
    const res = await school_dashboard_client.get_current_school_weekly_meal(schoolId);
    if (res.ok) {
      setWeeklyMeal(res.data as WeeklyMeal);
    } else {
      setWeeklyMeal(buildEmptyWeeklyMeal(schoolId));
    }
    setLoading(false);
  };

  useEffect(() => {
    setWeeklyMeal(buildEmptyWeeklyMeal(schoolId));
    void fetchWeeklyMeal();
  }, [schoolId]);

  const closeUploadModal = () => {
    setShowUploadModal(false);
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
    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append("pdf_file", selectedFile);

    const response = await school_dashboard_client.upload_weekly_meal(
      schoolId,
      formData,
      getCSRFToken()!
    );

    if (response.ok) {
      await fetchWeeklyMeal();
      closeUploadModal();
    }
  };

  const handleDelete = async () => {
    await school_dashboard_client.delete_weekly_meal(schoolId, getCSRFToken()!);
    await fetchWeeklyMeal();
  };

  const hasFile = !!weeklyMeal?.has_pdf;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation("weeklyMeals", language)}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 animate-pulse text-gray-300" />
              <p>{getTranslation("loading", language)}</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("weeklyMeals", language)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("actions", language)}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-1">
                      <span>{getTranslation("weeklyMealsProgram", language)}</span>
                      {!hasFile ? (
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                          {getTranslation("noWeeklyMealsAvailable", language)}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                        title={hasFile ? getTranslation("update", language) : getTranslation("upload", language)}
                      >
                        <Upload className="h-5 w-5" />
                      </button>

                      {hasFile && weeklyMeal.view_url ? (
                        <a
                          href={weeklyMeal.view_url}
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

                      {hasFile && weeklyMeal.download_url ? (
                        <a
                          href={weeklyMeal.download_url}
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
                          onClick={() => void handleDelete()}
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
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showUploadModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {hasFile
                ? getTranslation("updateWeeklyMeals", language)
                : getTranslation("uploadWeeklyMeals", language)}
            </h3>

            <div className="space-y-4">
              {hasFile && weeklyMeal?.view_url ? (
                <a
                  href={weeklyMeal.view_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 underline text-sm"
                >
                  {getTranslation("viewCurrentWeeklyMeals", language)}
                </a>
              ) : null}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("weeklyMealsProgram", language)} (PDF)
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
                onClick={() => void handleUpload()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {hasFile ? getTranslation("update", language) : getTranslation("upload", language)}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WeeklyMealsManagement;