import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
} from "lucide-react";
import { Teacher, TeacherManagementProps } from "../../types";
import { ModulesAndClassGroups } from "../../services/http_api/http_types";

const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachersList: teacherList,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // fake teachers data
  const teachers = [
    {
      id: 1,
      name: "أحمد بن علي",
      subject: "الرياضيات",
      classes: ["5أ", "5ب", "6أ"],
      phone: "0555123456",
      email: "ahmed@school.dz",
      status: "نشط",
      experience: "8 سنوات",
    },
    {
      id: 2,
      name: "فاطمة حسن",
      subject: "اللغة العربية",
      classes: ["4أ", "4ب"],
      phone: "0555234567",
      email: "fatima@school.dz",
      status: "نشط",
      experience: "5 سنوات",
    },
    {
      id: 3,
      name: "محمد السعيد",
      subject: "العلوم",
      classes: ["6أ", "6ب"],
      phone: "0555345678",
      email: "mohammed@school.dz",
      status: "معلق",
      experience: "12 سنة",
    },
    {
      id: 4,
      name: "زينب العلي",
      subject: "التاريخ",
      classes: ["5أ", "6أ"],
      phone: "0555456789",
      email: "zeinab@school.dz",
      status: "نشط",
      experience: "6 سنوات",
    },
  ];

  // real teachers data
  const map_subjects = (modulesAndClassGroupsList: ModulesAndClassGroups[]) => {
    if (!modulesAndClassGroupsList) return [];

    const subject_list = modulesAndClassGroupsList.map(
      (modulesAndClassGroups) => modulesAndClassGroups.class_group.name
    );
    return subject_list;
  };
  const teachers_real: Teacher[] = teacherList.map((teacher_response) => {
    const teacher: Teacher = {
      id: teacher_response.user.id,
      name: teacher_response.full_name,
      subject:
        teacher_response.modulesAndClassGroups?.[0]?.module.module_name ||
        "unfound",
      classes: map_subjects(teacher_response.modulesAndClassGroups || []),
      phone: teacher_response.phone_number,
      email: teacher_response.user.email,
      experience: teacher_response.years_of_experience,
      status: teacher_response.status === "pending" ? "معلق" : "نشط",
    };
    return teacher;
  });
  const subjects = [
    "الرياضيات",
    "اللغة العربية",
    "العلوم",
    "التاريخ",
    "الجغرافيا",
    "الفرنسية",
    "الإنجليزية",
  ];

  const filteredTeachers = teachers_real.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة المعلمين
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة معلم</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="البحث عن المعلمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {teacher.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {teacher.subject}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  teacher.status === "نشط"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                }`}
              >
                {teacher.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  الفصول:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {teacher.classes.join(", ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  الخبرة:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {teacher.experience}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  الهاتف:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {teacher.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  البريد:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-left">
                  {teacher.email}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <button
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  teacher.status === "نشط"
                    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                    : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                }`}
              >
                {teacher.status === "نشط" ? "تعليق" : "تفعيل"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إضافة معلم جديد
            </h3>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم المعلم
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المادة
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>اختر المادة</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="teacher@school.dz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0555 XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  سنوات الخبرة
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="عدد السنوات"
                />
              </div>
            </form>

            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
