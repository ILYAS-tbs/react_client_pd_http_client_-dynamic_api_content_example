import React, { useEffect, useState } from "react";
import {
  Calendar,
  Trash2,
  Search,
  Upload,
  Eye,
  FileText,
} from "lucide-react";
import { ScheduleManagementProps } from "../../types";
import { ClassGroup } from "../../models/ClassGroups";
import { Schedule } from "../../models/Schedule";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation, getMediaUrl } from "../../utils/translations";


const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  class_groups_list,
}) => {
  const { language } = useLanguage();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClassGroupId, setSelectedClassGroupId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    const res = await school_dashboard_client.get_current_school_schedules();
    if (res.ok) setSchedules(res.data as Schedule[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // class_group_id → Schedule lookup
  const scheduleByClassGroup: Record<string, Schedule> = {};
  schedules.forEach((s) => {
    if (s.class_group_info) {
      scheduleByClassGroup[s.class_group_info.class_group_id] = s;
    }
  });

  const filteredClassGroups = class_groups_list.filter((cg: ClassGroup) =>
    cg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openUploadModal = (classGroup: ClassGroup) => {
    const existing = scheduleByClassGroup[classGroup.class_group_id];
    setEditingSchedule(existing ?? null);
    setSelectedClassGroupId(classGroup.class_group_id);
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  const handleSubmit = async () => {
    const csrf = getCSRFToken()!;
    const formData = new FormData();
    formData.append("class_group_id", selectedClassGroupId);
    if (selectedFile) formData.append("schedule_file", selectedFile);

    let res;
    if (editingSchedule) {
      res = await school_dashboard_client.update_schedule(
        editingSchedule.schedule_id,
        formData,
        csrf
      );
    } else {
      res = await school_dashboard_client.upload_schedule(formData, csrf);
    }
    if (res.ok) await fetchSchedules();
    setShowUploadModal(false);
    setEditingSchedule(null);
    setSelectedFile(null);
  };

  const handleDelete = async (scheduleId: string) => {
    const csrf = getCSRFToken()!;
    setSchedules((prev) => prev.filter((s) => s.schedule_id !== scheduleId));
    await school_dashboard_client.delete_schedule(scheduleId, csrf);
    await fetchSchedules();
  };

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

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {getTranslation("classSchedule", language)}
          </h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 animate-pulse text-gray-300" />
              <p>{getTranslation("loading", language)}</p>
            </div>
          ) : filteredClassGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{getTranslation("noClassesFound", language)}</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("className", language)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {getTranslation("actions", language)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClassGroups.map((cg: ClassGroup) => {
                  const schedule = scheduleByClassGroup[cg.class_group_id];
                  const hasFile = !!schedule?.schedule_file;
                  return (
                    <tr
                      key={cg.class_group_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                        {cg.name}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          {/* Upload Button */}
                          <button
                            onClick={() => openUploadModal(cg)}
                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                            title={getTranslation("upload", language)}
                          >
                            <Upload className="h-5 w-5" />
                          </button>

                          {/* Download Button */}
                          {hasFile ? (
                            <a
                              href={getMediaUrl(schedule.schedule_file, SERVER_BASE_URL)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                              title={getTranslation("download", language) || "Download"}
                            >
                              <Eye className="h-5 w-5" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              title={getTranslation("download", language) || "Download"}
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          )}

                          {/* Delete Button */}
                          {hasFile ? (
                            <button
                              onClick={() =>
                                handleDelete(schedule.schedule_id)
                              }
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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

      {/* Upload / Update Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingSchedule
                ? getTranslation("updateSchedule", language)
                : getTranslation("uploadSchedule", language)}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("className", language)}
                </label>
                <p className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                  {class_groups_list.find(
                    (cg: ClassGroup) =>
                      cg.class_group_id === selectedClassGroupId
                  )?.name ?? "—"}
                </p>
              </div>

              {editingSchedule?.schedule_file && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("currentFile", language)}
                  </label>
                  <a
                    href={getMediaUrl(editingSchedule.schedule_file, SERVER_BASE_URL) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 underline text-sm"
                  >
                    {getTranslation("viewCurrentSchedule", language)}
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("scheduleFile", language)} (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setSelectedFile(e.target.files?.[0] ?? null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setEditingSchedule(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                {getTranslation("cancel", language)}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedFile && !editingSchedule}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm"
              >
                {editingSchedule
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

export default ScheduleManagement;
