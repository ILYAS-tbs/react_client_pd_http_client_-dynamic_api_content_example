import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Eye, Search } from "lucide-react";
import { ParentExamScheduleManagementProps } from "../../types";
import { ExamSchedule } from "../../models/ExamSchedule";
import { parent_dashboard_client } from "../../services/http_api/parent-dashboard/parent_dashboard_client";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

const ParentExamScheduleManagement: React.FC<ParentExamScheduleManagementProps> = ({
  students,
}) => {
  const { language } = useLanguage();
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchExamSchedules = async () => {
      setLoading(true);
      const res = await parent_dashboard_client.get_current_parent_exam_schedules();
      if (res.ok) {
        setExamSchedules(res.data as ExamSchedule[]);
      }
      setLoading(false);
    };

    void fetchExamSchedules();
  }, []);

  const filteredExamSchedules = useMemo(
    () =>
      examSchedules.filter((schedule) =>
        schedule.class_group_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [examSchedules, searchTerm]
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation("ExamSchedule", language)}
        </h2>
      </div>

      {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
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
      </div> */}

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
          ) : students.length === 0 || filteredExamSchedules.length === 0 ? (
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
                {filteredExamSchedules.map((schedule) => {
                  const viewUrl = schedule.view_url;
                  const downloadUrl = schedule.download_url;

                  return (
                    <tr key={schedule.class_group_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                        {schedule.class_group_name}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          {schedule.has_pdf && viewUrl ? (
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

                          {schedule.has_pdf && downloadUrl ? (
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
    </div>
  );
};

export default ParentExamScheduleManagement;