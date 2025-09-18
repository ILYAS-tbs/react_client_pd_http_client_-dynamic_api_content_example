import React, { useState } from "react";
import { Calendar, Edit, Trash2, Plus, Search, Clock, Eye } from "lucide-react";
import { ExamScheduleManagementProps } from "../../types";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { PostExamSchedule } from "../../services/http_api/payloads_types/school_client_payload_types";
import { getCSRFToken } from "../../lib/get_CSRFToken";

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
  RefetchExams,
  school_id,
  class_groups,
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

  // const [exams, setExams] = useState<Exam[]>([
  //   {
  //     id: "e1",
  //     subject: "الرياضيات",
  //     date: "2025-06-20",
  //     time: "09:00",
  //     duration: 90,
  //     className: "الصف الخامس - أ",
  //     room: "ص 10",
  //   },
  //   {
  //     id: "e2",
  //     subject: "العلوم",
  //     date: "2025-06-21",
  //     time: "10:00",
  //     duration: 60,
  //     className: "الصف الرابع - ب",
  //     room: "ص 12",
  //   },
  //   {
  //     id: "e3",
  //     subject: "اللغة العربية",
  //     date: "2025-06-22",
  //     time: "13:00",
  //     duration: 75,
  //     className: "الصف الثالث - أ",
  //     room: "ص 15",
  //   },
  //   {
  //     id: "e4",
  //     subject: "الدراسات الاجتماعية",
  //     date: "2025-06-23",
  //     time: "09:00",
  //     duration: 90,
  //     className: "الصف السادس - ب",
  //     room: "ص 11",
  //   },
  // ]);
  //? mapped to the mock shape above
  const [exams, setExams] = useState<Exam[]>(
    exam_schedules.map((exam) => ({
      id: exam.exam_schedule_id,
      subject: exam.module_name,
      date: new Date(exam.date).toString(),
      time: exam.time,
      duration: exam.duration,
      className: exam.class_group_name,
      room: exam.room,
    }))
  );

  const [newExamForm, setNewExamForm] = useState({
    module_name: "",
    date: "",
    time: "",
    duration: 0,
    class_group_name: "",
    room: "",
    school_id: school_id,
  });
  const handleNewExamFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewExamForm({
      ...newExamForm,
      [e.target.name]: e.target.value,
    });
  };
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewTimeline, setViewTimeline] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");

  // const handleAddExam = () => {
  //   if (
  //     newExamForm.module_name &&
  //     newExamForm.date &&
  //     newExamForm.time &&
  //     newExamForm.duration > 0 &&
  //     newExamForm.class_group_name &&
  //     newExamForm.room
  //   ) {
  //     // setExams([...exams, { id: `e-${Date.now()}`, ...newExamForm }]);
  //     // setNewExamForm({
  //     //   module_name: "",
  //     //   date: "",
  //     //   time: "",
  //     //   duration: 0,
  //     //   class_group_name: "",
  //     //   room: "",
  //     // });
  //   }
  // };

  // const handleEditExam = (exam: Exam) => {
  // setEditingExam(exam);
  // setNewExamForm({
  //   module_name: exam.subject,
  //   date: exam.date,
  //   time: exam.time,
  //   duration: exam.duration,
  //   class_group_name: exam.className,
  //   room: exam.room,
  // });
  // };

  const handleUpdateExam = () => {
    if (
      editingExam &&
      newExamForm.module_name &&
      newExamForm.date &&
      newExamForm.time &&
      newExamForm.duration > 0 &&
      newExamForm.class_group_name &&
      newExamForm.room
    ) {
      setExams(
        exams.map((ex) =>
          ex.id === editingExam.id ? { ...ex, ...newExamForm } : ex
        )
      );
      // setEditingExam(null);
      // setNewExamForm({
      //   module_name: "",
      //   date: "",
      //   time: "",
      //   duration: 0,
      //   class_group_name: "",
      //   room: "",
      // });
      setShowAddModal(false);
    }
  };

  // const handleDeleteExam = (id: string) => {
  //   setExams(exams.filter((ex) => ex.id !== id));
  // };

  const filteredExams = exam_schedules.filter(
    (ex) =>
      (ex.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.class_group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.class_group_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedClass === "all" || ex.class_group_name === selectedClass)
  );

  //! Post Exam
  const handlePostExam = async (e: React.FormEvent) => {
    e.preventDefault();

    // form inspection :
    console.log("ExamScheduleManagement post exam payload is :");
    console.log(newExamForm);

    //! API CALL
    const latest_csrf = getCSRFToken()!;
    const post_exam_payload: PostExamSchedule = {
      school_id: school_id,
      module_name: newExamForm.module_name,
      class_group_name: newExamForm.class_group_name,
      date: newExamForm.date,
      time: newExamForm.time,
      duration: newExamForm.duration,
      room: newExamForm.room,
    };
    const post_exam_res = await school_dashboard_client.post_exam_schedule(
      post_exam_payload,
      latest_csrf
    );

    if (!post_exam_res.ok) {
      console.error("ExamSchedule : post_exam_res Failed!");
    }
    // refresh exams :
    RefetchExams();
    setShowAddModal(false);
  };

  //! Patch Exam
  const handlePatchExam = (e: React.FormEvent) => {
    e.preventDefault();
  };

  //! Delete Exam :
  const handleDeleteExam = async (id: string) => {
    const delete_exam_res = await school_dashboard_client.delete_exam_schedule(
      id,
      getCSRFToken()!
    );

    // Referech exams ::
    RefetchExams();
  };

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
                      {new Date("2025-09-03T00:00:00.000Z").toLocaleDateString(
                        "ar",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
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
                        {exam.module_name}
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
                        {exam.room}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {/* For now : no edit */}
                        {/* <button
                          onClick={() => setShowAddModal(true)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        */}
                        <button
                          onClick={() =>
                            handleDeleteExam(exam.exam_schedule_id)
                          }
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        {/* For now : no eye */}
                        {/* <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </button> */}
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

            <form
              className="space-y-4"
              onSubmit={editingExam ? handlePatchExam : handlePostExam}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المادة
                </label>
                <input
                  type="text"
                  name="module_name"
                  value={newExamForm.module_name}
                  onChange={handleNewExamFormChange}
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
                  name="class_group_name"
                  value={newExamForm.class_group_name}
                  onChange={handleNewExamFormChange}
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
                  name="date"
                  value={newExamForm.date}
                  onChange={handleNewExamFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوقت
                </label>
                <input
                  type="time"
                  name="time"
                  value={newExamForm.time}
                  onChange={handleNewExamFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المدة (دقيقة)
                </label>
                <input
                  type="number"
                  name="duration"
                  min={0}
                  value={newExamForm.duration}
                  onChange={handleNewExamFormChange}
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
                  name="room"
                  value={newExamForm.room}
                  onChange={handleNewExamFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="رقم القاعة (مثل: ص 10)"
                />
              </div>

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingExam(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingExam ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduleManagement;
