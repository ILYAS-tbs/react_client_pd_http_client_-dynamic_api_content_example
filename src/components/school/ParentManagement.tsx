import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import { ResponseParent } from "../../services/http_api/http_reponse_types";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import {
  AddCurrectSchoolStudentsToParent,
  AddorRemoveParentToSchoolPayload,
  FindParentByIdPayload,
} from "../../services/http_api/payloads_types/school_client_payload_types";
import { Parent, ParentJson } from "../../models/ParenAndStudent";
import { ParentManagementProps } from "../../types";
import { Student, StudentJson } from "../../models/Student";

const ParentManagement: React.FC<ParentManagementProps> = ({
  parentsList,
  setParentList,
  class_groups_list,
  studentsList,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorAddParent, setErrorAddParent] = useState("");

  // fake parent list :
  // const parents = [
  //   {
  //     id: 1,
  //     name: "محمد علي",
  //     phone: "0555123456",
  //     email: "mohammed.ali@example.com",
  //     students: ["أحمد محمد علي"],
  //     address: "شارع الملك، الرياض",
  //     classes: ["5أ"],
  //   },
  //   {
  //     id: 2,
  //     name: "حسن أحمد",
  //     phone: "0555234567",
  //     email: "hassan.ahmed@example.com",
  //     students: ["فاطمة حسن"],
  //     address: "حي النصر، جدة",
  //     classes: ["4ب"],
  //   },
  //   {
  //     id: 3,
  //     name: "السعيد محمد",
  //     phone: "0555345678",
  //     email: "said.mohammed@example.com",
  //     students: ["عمر السعيد"],
  //     address: "شارع السلام، مكة",
  //     classes: ["6أ"],
  //   },
  //   {
  //     id: 4,
  //     name: "علي حسن",
  //     phone: "0555456789",
  //     email: "ali.hassan@example.com",
  //     students: ["زينب العلي"],
  //     address: "حي الخالدية، الدمام",
  //     classes: ["5أ"],
  //   },
  //   {
  //     id: 5,
  //     name: "الأمين يوسف",
  //     phone: "0555567890",
  //     email: "amin.youssef@example.com",
  //     students: ["يوسف الأمين"],
  //     address: "شارع الرياض، المدينة",
  //     classes: ["3ب"],
  //   },
  // ];
  // real parent data
  const parents_real: Parent[] = parentsList;

  const classes = ["الكل", "3أ", "3ب", "4أ", "4ب", "5أ", "5ب", "6أ", "6ب"];

  const filteredParents = parents_real.filter((parent) => {
    const matchesSearch =
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.students?.some((student) =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesClass =
      selectedClass === "all" ||
      selectedClass === "الكل" ||
      parent.students
        ?.map((s) => s.class_group?.class_group_id)
        .includes(selectedClass);
    return matchesSearch && matchesClass;
  });

  const [formData, setFormData] = useState({
    email: "",
    students: [""],
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  // ! CUSTOM FOR MULTIPLE SELECT :
  const handleStudentsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData({ ...formData, students: selected });
  };

  //! 1. Parent Addition Logic : 1-SearchForParent -> 2.AddParentToSchool
  //! -> 3. add selected student to the parent :
  const handleAddParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    //? Look for the parent in the system
    const payload: FindParentByIdPayload = {
      email: formData.email,
    };
    const latest_csrf = getCSRFToken()!;
    const res = await school_dashboard_client.find_parent_by_email(
      payload,
      latest_csrf
    );
    //? parent exist or not
    if (res.ok) {
      const parent_pk = res.data.user;
      // success
      const payload: AddorRemoveParentToSchoolPayload = {
        parent_pk: parent_pk,
      };
      const latest_csrf = getCSRFToken()!;
      const add_parent_res = await school_dashboard_client.add_parent_to_school(
        payload,
        latest_csrf
      );

      if (add_parent_res.ok) {
        //? 3. Adding students to this parent
        const latest_csrf = getCSRFToken()!;
        const payload: AddCurrectSchoolStudentsToParent = {
          parent_pk: parent_pk,
          students: formData.students,
        };
        const add_students_to_parent_res =
          await school_dashboard_client.add_current_school_students_to_parent(
            payload,
            latest_csrf
          );

        if (add_students_to_parent_res.ok) {
          // ALL SUCCESSFUL RE-FRESH DATA
          const new_res =
            await school_dashboard_client.get_current_school_parents();
          if (new_res.ok) {
            const new_parents_list: Parent[] = new_res.data.map(
              (p: ParentJson) => Parent.fromJson(p)
            );
            setParentList(new_parents_list);
            setShowAddModal(false);
          }
        } else {
          setErrorAddParent(
            "حدث خطأ غير متوقع أثناء معالجة طلبك، يرجى المحاولة لاحقًا. إذا استمر هذا الأمر، يرجى التواصل معنا."
          );
        }
      } else {
        setErrorAddParent(
          "حدث خطأ غير متوقع أثناء معالجة طلبك، يرجى المحاولة لاحقًا. إذا استمر هذا الأمر، يرجى التواصل معنا."
        );
        setTimeout(() => {
          setErrorAddParent("");
        }, 7000);
      }
    } else {
      setErrorAddParent(
        "لم يتم العثور على حساب ولي أمر بهذا البريد الإلكتروني، تحقق من بياناتك المدخلة"
      );
      setTimeout(() => {
        setErrorAddParent("");
      }, 7000);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    const latest_csrf = getCSRFToken()!;
    const delete_payload: AddorRemoveParentToSchoolPayload = {
      parent_pk: id,
    };

    const delete_res = await school_dashboard_client.remove_parent_from_school(
      delete_payload,
      latest_csrf
    );

    if (!delete_res.ok) {
      return;
    }

    const parents_res =
      await school_dashboard_client.get_current_school_parents();
    if (parents_res.ok) {
      const new_parents_list: Parent[] = parents_res.data.map((p: ParentJson) =>
        Parent.fromJson(p)
      );
      setParentList(new_parents_list);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة أولياء الأمور
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة ولي أمر</span>
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
                placeholder="البحث عن أولياء الأمور أو الطلاب أو البريد الإلكتروني..."
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
                {"الكل"}
              </option>
              {class_groups_list.map((cls) => (
                <option key={cls.class_group_id} value={cls.class_group_id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ولي الأمر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  رقم الهاتف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الأبناء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredParents.map((parent) => (
                <tr
                  key={parent.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {parent.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {parent.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {parent.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {/* {parent.students?.join(", ")} */}
                      {parent.students
                        ?.map((student) => student.full_name)
                        .join(", ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* the parent has his data - can't be edited by school for now */}
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            email: parent.email,
                          });
                          setShowAddModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(parent.id)}
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

      {/* Add or Update Parent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إضافة ولي أمر جديد
            </h3>

            <form className="space-y-4" onSubmit={handleAddParentSubmit}>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم ولي الأمر
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="الاسم الكامل"
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="example@example.com"
                />
              </div>

              {/* Error */}
              {errorAddParent && (
                <div className="text text-red-500 text-sm">
                  {errorAddParent}
                </div>
              )}

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0555 XX XX XX"
                />
              </div> */}

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="العنوان الكامل"
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الطلاب المرتبطون
                </label>
                <select
                  multiple
                  name="students"
                  value={formData.students}
                  onChange={handleStudentsChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {studentsList.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </div>

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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentManagement;
