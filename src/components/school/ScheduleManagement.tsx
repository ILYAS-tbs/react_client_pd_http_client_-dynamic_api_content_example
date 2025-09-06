import React, { useState } from "react";
import {
  Calendar,
  Edit,
  Trash2,
  Plus,
  Search,
  Eye,
  Upload,
} from "lucide-react";
import { ScheduleManagementProps } from "../../types";
import { ClassGroup } from "../../models/ClassGroups";
import { SERVER_BASE_URL } from "../../services/http_api/auth/auth_http_client";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";

interface ScheduleItem {
  id: string;
  className: string; // e.g., "الصف الخامس أ"
  pdfUrl: string | null; // URL or base64 of the uploaded PDF
  uploadedAt: string; // Timestamp of upload
}

const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  class_groups_list,
  setClassGroupList,
}) => {
  function mapClassGroupToSchedule(
    class_groups_list: ClassGroup[]
  ): ScheduleItem[] {
    return class_groups_list.map((classGroup: ClassGroup) => ({
      id: classGroup.class_group_id,
      className: classGroup.name,
      pdfUrl: classGroup.time_table,
      uploadedAt: "",
    }));
  }
  // mock schedule data : { id: "s1", className: "الصف الخامس أ", pdfUrl: null, uploadedAt: "" },

  const [schedules, setSchedules] = useState<ScheduleItem[]>(
    mapClassGroupToSchedule(class_groups_list)
  );
  const [newSchedule, setNewSchedule] = useState<
    Omit<ScheduleItem, "id" | "uploadedAt">
  >({ className: "", pdfUrl: null });
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const pdfUrl = reader.result as string;
      if (editingSchedule) {
        setSchedules(
          schedules.map((sch) =>
            sch.id === editingSchedule.id
              ? { ...sch, pdfUrl, uploadedAt: new Date().toISOString() }
              : sch
          )
        );
      } else if (newSchedule.className) {
        setSchedules([
          ...schedules,
          {
            id: `s-${Date.now()}`,
            ...newSchedule,
            pdfUrl,
            uploadedAt: new Date().toISOString(),
          },
        ]);
        setNewSchedule({ className: "", pdfUrl: null });
      }
      setSelectedFile(null);
      setShowUploadModal(false);
      setEditingSchedule(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEditSchedule = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setNewSchedule({ className: schedule.className, pdfUrl: schedule.pdfUrl });
    setShowUploadModal(true);
  };

  //! OPTIMISTIC UPDATE TECHNIQUE
  const handleDeleteSchedule = async (id: string) => {
    setSchedules(schedules.filter((sch) => sch.id !== id));
    // API CALL  DELETE
    const latest_csrf = getCSRFToken()!;
    const res = await school_dashboard_client.delete_class_group(
      id,
      latest_csrf
    );
    // Fetch & Update new data : GET
    const new_res =
      await school_dashboard_client.get_current_school_class_groups();
    if (new_res.ok) {
      const new_class_group_list: ClassGroup[] = new_res.data.map(
        (classGroup: ClassGroup) => ClassGroup.formJson(classGroup)
      );
      setClassGroupList(new_class_group_list);
    }
  };

  const handleViewSchedule = (pdfUrl: string | null) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  const filteredSchedules = schedules.filter((sch) =>
    sch.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const daysOfWeek = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  const timeSlots = Array.from(
    { length: 9 },
    (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة الجداول
        </h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="h-5 w-5" />
            <span>إضافة جدول</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن الفصل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            جدول الفصول
          </h3>
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    اسم الفصل
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    حالة الرفع
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    جدول الحصص
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                      {schedule.className}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                      {schedule.pdfUrl ? "تم الرفع" : "لم يتم الرفع"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      {/* {schedule.uploadedAt
                        ? new Date(schedule.uploadedAt).toLocaleDateString(
                            "ar-DZ"
                          )
                        : "-"} */}
                      {schedule.pdfUrl ? (
                        <div className="flex items-center space-x-2 justify-start rtl:space-x-reverse">
                          <a
                            href={SERVER_BASE_URL + schedule.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {schedule.className + ".pdf"}
                          </a>
                          {/* <button
                                                // onClick={() => handleRemovePdf(cls.id)}
                                                className="text-blue-400 hover:text-blue-300"
                                              > */}
                          {/* <X className="h-5 w-5" /> */}
                          {/* <Download className="h-5 w-5" />
                                              </button> */}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 relative">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        {/* no need for the eye  */}
                        {/* {schedule.pdfUrl && (
                          <button
                            onClick={() => handleViewSchedule(schedule.pdfUrl)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        )} */}
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Upload className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upload/Edit Schedule Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingSchedule ? "تعديل جدول" : "رفع جدول جديد"}
            </h3>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الفصل
                </label>
                <input
                  type="text"
                  value={newSchedule.className}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      className: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="مثل: الصف الخامس أ"
                  disabled={!!editingSchedule}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ملف الجدول (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </form>

            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setEditingSchedule(null);
                  setNewSchedule({ className: "", pdfUrl: null });
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => selectedFile && handleFileUpload(selectedFile)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={!selectedFile}
              >
                {editingSchedule ? "تحديث" : "رفع"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
