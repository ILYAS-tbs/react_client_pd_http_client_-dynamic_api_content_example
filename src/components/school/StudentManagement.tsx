import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import { StudentManagementProps } from "../../types";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { PostStudentPayload } from "../../services/http_api/payloads_types/school_client_payload_types";
import { Student, StudentJson } from "../../models/Student";
import { ClassGroup } from "../../models/ClassGroups";

const StudentManagement: React.FC<StudentManagementProps> = ({
  studentsList,
  setStudentsList,
  class_groups_list,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorAddModal, setErrorAddModal] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  // to be able to provide student_id when updating
  const [last_chosen_student, set_last_chosen_student] = useState("");

  // fake data :
  const students = [
    {
      id: 1,
      name: "أحمد محمد علي",
      class: "5أ",
      age: 11,
      parent: "محمد علي",
      phone: "0555123456",
      average: "16.5/20",
      attendance: "95%",
    },
    {
      id: 2,
      name: "فاطمة حسن",
      class: "4ب",
      age: 10,
      parent: "حسن أحمد",
      phone: "0555234567",
      average: "17.2/20",
      attendance: "98%",
    },
    {
      id: 3,
      name: "عمر السعيد",
      class: "6أ",
      age: 12,
      parent: "السعيد محمد",
      phone: "0555345678",
      average: "15.8/20",
      attendance: "92%",
    },
    {
      id: 4,
      name: "زينب العلي",
      class: "5أ",
      age: 11,
      parent: "علي حسن",
      phone: "0555456789",
      average: "18.1/20",
      attendance: "97%",
    },
    {
      id: 5,
      name: "يوسف الأمين",
      class: "3ب",
      age: 9,
      parent: "الأمين يوسف",
      phone: "0555567890",
      average: "14.9/20",
      attendance: "89%",
    },
  ];
  function getAge(dateString: string) {
    const today = new Date();
    const birthDate = new Date(dateString);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    // If birthday hasn't happened yet this year → subtract 1
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // real data :
  const students_real: Student[] = studentsList.map((response_student) => {
    const student: Student = {
      student_id: response_student.student_id,
      full_name: response_student.full_name,
      class_group: response_student.class_group,
      age: getAge(response_student.date_of_birth),
      date_of_birth: response_student.date_of_birth,
      parent: response_student?.parent,
      phone: response_student?.parent?.phone_number,
      trimester_grade: response_student.trimester_grade ?? 0,
      attendance: "89%",
    };
    return student;
  });

  // mock data : const classes = ["الكل", "3أ", "3ب", "4أ", "4ب", "5أ", "5ب", "6أ", "6ب"];
  const filteredStudents = students_real.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parent?.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" ||
      selectedClass === "الكل" ||
      student.class_group?.name === selectedClass;
    return matchesSearch && matchesClass;
  });

  //! 1. Student Creation
  const [formData_creation, setFormData_creation] = useState({
    full_name: "",
    date_of_birth: "2020-08-09",
    class_group_id: "",
  });

  const handleChange_creation = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData_creation({
      ...formData_creation,
      [e.target.name]: e.target.value,
    });
  };
  const handleCreationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData_creation);

    if (!formData_creation.class_group_id) {
      setErrorAddModal("يرجى اختيار فصل للطالب");
      setTimeout(() => {
        setErrorAddModal("");
      }, 5000);
      return;
    }
    // API CALL
    const student_payload: PostStudentPayload = {
      full_name: formData_creation.full_name,
      date_of_birth: formData_creation.date_of_birth,
      class_group_id: formData_creation.class_group_id,
    };
    const latest_csrf = getCSRFToken()!;
    const res = await school_dashboard_client.post_student(
      student_payload,
      latest_csrf
    );
    if (res.ok) {
      setShowAddModal(false);
      // Fresh data from server:
      const get_students_res =
        await school_dashboard_client.get_current_school_students();
      setStudentsList(get_students_res.data);
    } else {
      setErrorAddModal(
        "حدث خطأ متوقع، يرجى التحقق من البيانات التي أدخلتها ثم المحاولة لاحقًا أو التواصل معنا"
      );
      setTimeout(() => {
        setErrorAddModal("");
      }, 20000); // 20 seconds dispay error
    }
  };

  //! 2. Student update
  const [formData_update, setFormData_update] = useState({
    full_name: "",
    date_of_birth: "2020-08-09",
    trimester_grade: 0,
    class_group_id: "",
  });

  const handleChange_update = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData_update({
      ...formData_update,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData_update);
    console.log(`Student id : ${last_chosen_student}`);
    setShowEditModal(false);

    // case no other name was provided
    const student_to_update = studentsList.find(
      (s) => s.student_id == last_chosen_student
    );

    // fallback to existing name if empty
    const full_name =
      formData_update.full_name.trim() || student_to_update?.full_name || "";
    // API CALL
    const student_payload: PostStudentPayload = {
      full_name: full_name,
      date_of_birth: formData_update.date_of_birth,
      trimester_grade: formData_update.trimester_grade,
      class_group_id:
        formData_update.class_group_id ||
        student_to_update?.class_group?.class_group_id,
    };
    const id = last_chosen_student;
    const latest_csrf = getCSRFToken()!;

    const res = await school_dashboard_client.put_student(
      id,
      student_payload,
      latest_csrf
    );

    // Refresh Frontend data :
    if (res.ok) {
      const get_students_res =
        await school_dashboard_client.get_current_school_students();

      setStudentsList(get_students_res.data);
    }
  };

  //! 3. Delete Student :
  const handleDeleteStudent = async (student_id: string) => {
    const latest_csrf = getCSRFToken()!;
    const res = await school_dashboard_client.delete_student(
      student_id,
      latest_csrf
    );
    // Refresh Frontend data :
    //  res.ok isn't checking correct for "DELETE"
    const get_students_res =
      await school_dashboard_client.get_current_school_students();

    setStudentsList(get_students_res.data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة الطلاب
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة طالب</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن الطلاب أو الأولياء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option key={"all"} value={"all"}>
                الكل
              </option>
              {class_groups_list.map((cls) => (
                <option key={cls.class_group_id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الطالب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  العمر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ولي الأمر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المعدل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحضور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student, index) => (
                <tr
                  key={student.student_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {student.class_group?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.age} سنة
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {student.parent?.full_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {student.trimester_grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {student.attendance}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {/* hide student : disable for now  */}
                      {/* <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button> */}

                      <button
                        onClick={() => {
                          setShowEditModal(true);
                          set_last_chosen_student(student.student_id);
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.student_id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إضافة طالب جديد
            </h3>

            <form className="space-y-4" onSubmit={handleCreationSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الطالب
                </label>
                <input
                  name="full_name"
                  type="text"
                  value={formData_creation.full_name}
                  onChange={handleChange_creation}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الصف
                </label>
                <select
                  name="class_group_id"
                  value={formData_creation.class_group_id}
                  onChange={handleChange_creation}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={""}>اختر الصف</option>
                  {class_groups_list.map((cls) => (
                    <option key={cls.class_group_id} value={cls.class_group_id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تاريخ الميلاد
                </label>
                <input
                  name="date_of_birth"
                  type="date"
                  value={formData_creation.date_of_birth}
                  onChange={handleChange_creation}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* parent name deleted for now */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم ولي الأمر
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم ولي الأمر"
                />
              </div> */}

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

              {/* Error */}
              {errorAddModal && (
                <div className="text text-red-600 text-sm">{errorAddModal}</div>
              )}

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              تحديث معلومات الطالب
            </h3>

            <form className="space-y-4" onSubmit={handleUpdateSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الطالب
                </label>
                <input
                  name="full_name"
                  type="text"
                  value={formData_update.full_name}
                  onChange={handleChange_update}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  معدل الفصل الدراسي
                </label>
                <input
                  name="trimester_grade"
                  type="number"
                  value={formData_update.trimester_grade}
                  onChange={handleChange_update}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder=" معدل الفصل الدراسي"
                  min={0}
                  max={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الصف
                </label>
                <select
                  name="class_group_id"
                  value={formData_update.class_group_id}
                  onChange={handleChange_update}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={""}>اختر الصف</option>
                  {class_groups_list.map((cls) => (
                    <option key={cls.class_group_id} value={cls.class_group_id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تاريخ الميلاد
                </label>
                <input
                  name="date_of_birth"
                  type="date"
                  value={formData_update.date_of_birth}
                  onChange={handleChange_update}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم ولي الأمر
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم ولي الأمر"
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
              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    set_last_chosen_student("");
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  تحديث
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
