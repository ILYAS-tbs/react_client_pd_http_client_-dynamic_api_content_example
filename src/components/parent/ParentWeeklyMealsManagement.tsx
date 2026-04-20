import React, { useEffect, useState } from "react";
import { Calendar, Download, Eye } from "lucide-react";
import { ParentWeeklyMeal } from "../../models/WeeklyMeal";
import { parent_dashboard_client } from "../../services/http_api/parent-dashboard/parent_dashboard_client";
import { ParentWeeklyMealsManagementProps } from "../../types";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { FilePreview } from "../shared/file_preview";

const ParentWeeklyMealsManagement: React.FC<ParentWeeklyMealsManagementProps> = ({ students }) => {
  const { language } = useLanguage();
  const [weeklyMeals, setWeeklyMeals] = useState<ParentWeeklyMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const visibleStudentIds = new Set(students.map((student) => student.student_id));

  const visibleWeeklyMeals = weeklyMeals.filter((row) => visibleStudentIds.has(row.student_id));

  useEffect(() => {
    const fetchWeeklyMeals = async () => {
      setLoading(true);
      const res = await parent_dashboard_client.get_current_parent_weekly_meals();
      if (res.ok) {
        setWeeklyMeals(res.data as ParentWeeklyMeal[]);
      }
      setLoading(false);
    };

    void fetchWeeklyMeals();
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation("weeklyMenu", language)}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 animate-pulse text-gray-300" />
              <p>{getTranslation("loading", language)}</p>
            </div>
          ) : students.length === 0 || visibleWeeklyMeals.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{getTranslation("noWeeklyMealsAvailable", language)}</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("studentName", language)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("schoolName", language)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("weeklyMenu", language)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleWeeklyMeals.map((row) => (
                  <tr key={row.student_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                      {row.student_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                      {row.school_name}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          {row.has_pdf && row.view_url ? (
                            <FilePreview url={row.view_url} filename={row.pdf_file} compact />
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                        {row.has_pdf && row.view_url ? (
                          <a
                            href={row.view_url}
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

                        {row.has_pdf && row.download_url ? (
                          <a
                            href={row.download_url}
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
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentWeeklyMealsManagement;