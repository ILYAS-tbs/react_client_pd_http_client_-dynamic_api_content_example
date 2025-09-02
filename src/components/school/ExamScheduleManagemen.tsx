import React, { useState } from "react";
import { Calendar, Edit, Trash2, Plus, Search, Clock, Eye } from "lucide-react";
import { ExamScheduleManagementProps } from "../../types";

interface Exam {
  id: string;
  subject: string;
  date: string;
  time: string;
  duration: number; // in minutes
  className: string;
  room: string;
}

const ExamScheduleManagement: React.FC<ExamScheduleManagementProps> = ({
  exam_schedules,
  setExamSchedules,
}) => {
  /* 
   mock data model :
     {
      id: "e1",
      subject: "الرياضيات",
      date: "2025-06-20",
      time: "09:00",
      duration: 90,
      className: "الصف الخامس - أ",
      room: "ص 10",
    },
  */
  const [exams, setExams] = useState<Exam[]>([
    {
      id: "e1",
      subject: "الرياضيات",
      date: "2025-06-20",
      time: "09:00",
      duration: 90,
      className: "الصف الخامس - أ",
      room: "ص 10",
    },
    {
      id: "e2",
      subject: "العلوم",
      date: "2025-06-21",
      time: "10:00",
      duration: 60,
      className: "الصف الرابع - ب",
      room: "ص 12",
    },
    {
      id: "e3",
      subject: "اللغة العربية",
      date: "2025-06-22",
      time: "13:00",
      duration: 75,
      className: "الصف الثالث - أ",
      room: "ص 15",
    },
    {
      id: "e4",
      subject: "الدراسات الاجتماعية",
      date: "2025-06-23",
      time: "09:00",
      duration: 90,
      className: "الصف السادس - ب",
      room: "ص 11",
    },
  ]);
  const [newExam, setNewExam] = useState({
    subject: "",
    date: "",
    time: "",
    duration: 0,
    className: "",
    room: "",
  });
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewTimeline, setViewTimeline] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");

  const handleAddExam = () => {
    if (
      newExam.subject &&
      newExam.date &&
      newExam.time &&
      newExam.duration > 0 &&
      newExam.className &&
      newExam.room
    ) {
      setExams([...exams, { id: `e-${Date.now()}`, ...newExam }]);
      setNewExam({
        subject: "",
        date: "",
        time: "",
        duration: 0,
        className: "",
        room: "",
      });
      setShowAddModal(false);
    }
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setNewExam({
      subject: exam.subject,
      date: exam.date,
      time: exam.time,
      duration: exam.duration,
      className: exam.className,
      room: exam.room,
    });
    setShowAddModal(true);
  };

  const handleUpdateExam = () => {
    if (
      editingExam &&
      newExam.subject &&
      newExam.date &&
      newExam.time &&
      newExam.duration > 0 &&
      newExam.className &&
      newExam.room
    ) {
      setExams(
        exams.map((ex) =>
          ex.id === editingExam.id ? { ...ex, ...newExam } : ex
        )
      );
      setEditingExam(null);
      setNewExam({
        subject: "",
        date: "",
        time: "",
        duration: 0,
        className: "",
        room: "",
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteExam = (id: string) => {
    setExams(exams.filter((ex) => ex.id !== id));
  };

  const filteredExams = exam_schedules.filter(
    (ex) =>
      (ex.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.class_group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.class_group_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedClass === "all" || ex.class_group_name === selectedClass)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          رزنامة الامتحانات
        </h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">الكل</option>
            {[...new Set(exams.map((ex) => ex.className))].map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          <button
            onClick={() => setViewTimeline(!viewTimeline)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Clock className="h-5 w-5" />
            <span>{viewTimeline ? "عرض جدول" : "عرض زمني"}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="h-5 w-5" />
            <span>إضافة امتحان</span>
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
                placeholder="البحث عن المادة أو الصف أو القاعة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exam Schedule Table or Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {viewTimeline ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              عرض زمني للامتحانات
            </h3>
            <div className="space-y-4">
              {filteredExams.map((exam) => (
                <div
                  key={exam.exam_schedule_id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {exam.class_group_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(
                          "2025-09-03T00:00:00.000Z"
                        ).toLocaleDateString("ar", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {exam.class_group_name} - {exam.class_group_name}
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {exam.time} ({exam.duration} دقيقة)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    المادة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الصف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الوقت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    المدة (دقيقة)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    القاعة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredExams.map((exam) => (
                  <tr
                    key={exam.exam_schedule_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.class_group_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {exam.class_group_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(
                          "2025-09-03T00:00:00.000Z"
                        ).toLocaleDateString("ar", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {exam.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {exam.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {exam.class_group_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleEditExam(exam)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingExam ? "تعديل الامتحان" : "إضافة امتحان جديد"}
            </h3>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المادة
                </label>
                <input
                  type="text"
                  value={newExam.subject}
                  onChange={(e) =>
                    setNewExam({ ...newExam, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم المادة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الصف
                </label>
                <input
                  type="text"
                  value={newExam.className}
                  onChange={(e) =>
                    setNewExam({ ...newExam, className: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم الصف (مثل: الصف الخامس - أ)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={newExam.date}
                  onChange={(e) =>
                    setNewExam({ ...newExam, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوقت
                </label>
                <input
                  type="time"
                  value={newExam.time}
                  onChange={(e) =>
                    setNewExam({ ...newExam, time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المدة (دقيقة)
                </label>
                <input
                  type="number"
                  value={newExam.duration}
                  onChange={(e) =>
                    setNewExam({
                      ...newExam,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="مدة الامتحان"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  القاعة
                </label>
                <input
                  type="text"
                  value={newExam.room}
                  onChange={(e) =>
                    setNewExam({ ...newExam, room: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="رقم القاعة (مثل: ص 10)"
                />
              </div>
            </form>

            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingExam(null);
                  setNewExam({
                    subject: "",
                    date: "",
                    time: "",
                    duration: 0,
                    className: "",
                    room: "",
                  });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={editingExam ? handleUpdateExam : handleAddExam}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingExam ? "تحديث" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduleManagement;
