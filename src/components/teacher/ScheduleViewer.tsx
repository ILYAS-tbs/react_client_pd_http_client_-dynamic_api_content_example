import React, { useEffect, useState } from "react";
import { Calendar, Search } from "lucide-react";
import { ScheduleViewerProps } from "../../types";
import { Schedule } from "../../models/Schedule";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation, getMediaUrl } from "../../utils/translations";
import { FilePreview } from "../shared/file_preview";

const ScheduleViewer: React.FC<ScheduleViewerProps> = () => {
  const { language } = useLanguage();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res =
        await teacher_dashboard_client.get_current_teacher_schedules();
      if (res.ok) setSchedules(res.data as Schedule[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = schedules.filter((s) =>
    (s.class_group_info?.name ?? s.class_group_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation("classSchedule", language)}
        </h2>
      </div>

      {/* Search */}
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

      {/* Schedule list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {getTranslation("myClasses", language)}
          </h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 animate-pulse text-gray-300" />
              <p>{getTranslation("loading", language)}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{getTranslation("noTimetablesAvailable", language)}</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("className", language)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("uploadStatus", language)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("actions", language)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((schedule) => (
                  <tr
                    key={schedule.schedule_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                      {schedule.class_group_info?.name ??
                        schedule.class_group_name}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-gray-200 dark:border-gray-700">
                      {schedule.schedule_file ? (
                        <span className="text-primary-600 dark:text-primary-400">
                          {getTranslation("uploaded", language)}
                        </span>
                      ) : (
                        <span className="text-red-500">
                          {getTranslation("notUploaded", language)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      {schedule.schedule_file ? (
                        <FilePreview
                          url={getMediaUrl(schedule.schedule_file, SERVER_BASE_URL)!}
                          filename={schedule.schedule_file}
                          compact
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
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

export default ScheduleViewer;
