import React, { useEffect, useState } from "react";
import {
  Layers,
  Edit,
  Trash2,
  Plus,
  FileText,
  X,
  Search,
  Download,
} from "lucide-react";
import { ClassesManagementProps } from "../../types";
import { ClassGroup, ClassGroupJson } from "../../models/ClassGroups";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { PostPutClassGroupPayload } from "../../services/http_api/payloads_types/school_client_payload_types";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";

interface Class {
  class_group_id: string;
  name: string;
  students: number;
  teachersPdf: { url: string; name: string } | null;
}

const ClassesManagement: React.FC<ClassesManagementProps> = ({
  class_groups_list,
  setClassGroupList,
}) => {
  //! Map ClassGroup in models to Class here
  function mapClassGrpToClass(classes: ClassGroup[]): Class[] {
    return classes.map((class_group: ClassGroup) => ({
      class_group_id: class_group.class_group_id,
      id: class_group.class_group_id,
      name: `${class_group.name}`,
      students: 25,
      teachersPdf: class_group.teacher_list
        ? {
            url: class_group.teacher_list,
            name: class_group.name + ".pdf",
          }
        : null,
    }));
  }
  const initial_classes: Class[] = class_groups_list?.map(
    (class_group: ClassGroup) => ({
      class_group_id: class_group.class_group_id,
      id: class_group.class_group_id,
      name: `${class_group.name}`,
      students: class_group.students_number,
      teachersPdf: class_group.teacher_list
        ? {
            url: class_group.teacher_list,
            name: class_group.name + ".pdf",
          }
        : null,
    })
  );
  // delete :  const [classes, setClasses] = useState<Class[]>(initial_classes);
  // mock data : [{ id: "1a", name: "الصف الأول - أ", students: 25, teachersPdf: null },]
  const [newClass, setNewClass] = useState({
    class_group_id: "",
    name: "",
    students: 0,
    teachersPdf: null as { url: string; name: string } | null,
  });
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  //?: 1. ClassGroup Creation
  const [formData_creation, setFormData_creation] = useState({
    name: "",
  });
  const handleCreationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData_creation({
      ...formData_creation,
      [e.target.name]: e.target.value,
    });
  };

  //! keep classes in sync with parent prop
  // / delete :
  // useEffect(() => {
  //   if (class_groups_list) {
  //     setClasses(mapClassGrpToClass(class_groups_list));
  //   }
  // }, [class_groups_list]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // the previous UI logic
    editingClass ? handleUpdateClass() : handleAddClass();

    //* API CALL :
    console.log(formData_creation);
    const post_class_group_payload: PostPutClassGroupPayload = {
      name: formData_creation.name,
    };
    let latest_csrf = getCSRFToken()!;
    const res = await school_dashboard_client.post_class_group(
      post_class_group_payload,
      latest_csrf
    );

    if (res.ok) {
      // Backend returns the new class with real ID
      const newClassFromBackend = res.data;

      // Map to  frontend Class type
      const mappedClass: Class = {
        class_group_id: newClassFromBackend.class_group_id,
        name: newClassFromBackend.name,
        students: 0, // or whatever comes from backend
        teachersPdf: null,
      };

      // Update frontend - A call to fetch the fresh data from the API
      // delete :: setClasses([...classes, mappedClass

      const new_res =
        await school_dashboard_client.get_current_school_class_groups();
      if (new_res.ok) {
        const new_class_groups_list: ClassGroupJson[] = new_res.data.map(
          (classGroupJson: ClassGroupJson) =>
            ClassGroup.formJson(classGroupJson)
        );
        console.log("new list");
        console.log(new_class_groups_list);
        // update parent state
        setClassGroupList(new_class_groups_list);
      }

      // Reset modal/input
      setNewClass({
        class_group_id: "",
        name: "",
        students: 0,
        teachersPdf: null,
      });
      setFormData_creation({ name: "" });
      setShowAddModal(false);
    } else {
      console.error("Failed to create class");
    }
  };

  //?: 2. ClassGroup Update :
  const [updated_class_title, set_updated_class_title] = useState("");
  const [file_teachers, setFile_teachers] = useState<File | null>(null);
  const [chosen_class_id, set_chosen_class_id] = useState("");

  const handleAddClass = () => {
    if (newClass.name && newClass.students >= 0) {
      // delete :
      // setClasses([...classes, newClass]);
      // setNewClass({
      //   class_group_id: "",
      //   name: "",
      //   students: 0,
      //   teachersPdf: null,
      // });
      setShowAddModal(false);
    }
  };

  const handleEditClass = (cls: Class | ClassGroup) => {
    cls = cls as Class; // will be a class from the UI that's what we pass to it
    setEditingClass(cls);
    setNewClass({
      class_group_id: cls.class_group_id,
      name: cls.name,
      students: cls.students,
      teachersPdf: cls.teachersPdf,
    });
    setShowAddModal(true);
  };

  const handleUpdateClass = () => {
    if (editingClass && newClass.name && newClass.students >= 0) {
      // delete :
      // setClasses(
      //   classes.map((cls) =>
      //     cls.class_group_id === editingClass.class_group_id
      //       ? { ...cls, ...newClass }
      //       : cls
      //   )
      // );
      setEditingClass(null);
      setNewClass({
        class_group_id: "",
        name: "",
        students: 0,
        teachersPdf: null,
      });
      setShowAddModal(false);
    }
  };
  // API CALL PUT class_group
  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowAddModal(false);

    const formData_update = new FormData();

    if (updated_class_title) {
      formData_update.append("name", updated_class_title);
    } else {
      // in case the name is let empty
      const chosen_class = class_groups_list.filter(
        (cls) => cls.class_group_id === chosen_class_id
      )[0];

      if (chosen_class) {
        formData_update.append("name", chosen_class.name);
      }
    }

    if (file_teachers) {
      formData_update.append("teacher_list", file_teachers);
    }
    const latest_csrf = getCSRFToken()!;
    const id = chosen_class_id;
    // * API CALL UPDATE IN THE BACKEND
    const res = await school_dashboard_client.put_class_group(
      id,
      formData_update,
      latest_csrf
    );
    // * UPDATE THE DATA IN THE FRONTEND :
    if (res.ok) {
      // Re-fetch all classes from backend instead of patching one
      const new_res =
        await school_dashboard_client.get_current_school_class_groups();
      if (new_res.ok) {
        const new_class_groups_list: ClassGroupJson[] = new_res.data.map(
          (classGroupJson: ClassGroupJson) =>
            ClassGroup.formJson(classGroupJson)
        );
        console.log("new list");
        console.log(new_class_groups_list);
        // update parent state
        setClassGroupList(new_class_groups_list);
      }

      // delete
      // setClasses(mapClassGrpToClass(fresh_list.data.map(ClassGroup.formJson)));

      // reset temp states
      setEditingClass(null);
      setNewClass({
        class_group_id: "",
        name: "",
        students: 0,
        teachersPdf: null,
      });
      setFile_teachers(null);
      set_updated_class_title("");
    }
  }

  // Delete
  const handleDeleteClass = async (id: string) => {
    setClassGroupList(
      class_groups_list.filter((cls) => cls.class_group_id !== id)
    );
    //*  API CALL
    const latest_csrf = getCSRFToken()!;
    const res = await school_dashboard_client.delete_class_group(
      id,
      latest_csrf
    );
    if (res.ok) {
      console.log("ClassManagement delete_class_group res: OK");
    }
  };

  // const handleFileUpload = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   id: string
  // ) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const url = URL.createObjectURL(file);
  //     setClassGroupList(
  //       class_groups_list.map((cls) =>
  //         cls.class_group_id === id
  //           ? { ...cls, teachersPdf: { url, name: file.name } }
  //           : cls
  //       )
  //     );
  //   }
  // };

  // const handleRemovePdf = (id: string) => {
  //   setClassGroupList(
  //     class_groups_list.map((cls) =>
  //       cls.class_group_id === id ? { ...cls, teachersPdf: null } : cls
  //     )
  //   );
  // };

  const filteredClasses = class_groups_list.filter(
    (cls) => cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    // delete
    //  ||
    // cls.students.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة الصفوف
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة صف</span>
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
                placeholder="البحث عن الصفوف أو عدد الطلاب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  عدد الطلاب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  قائمة المعلمين
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClasses.map((cls) => (
                <tr
                  key={cls.class_group_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {cls.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {cls.students_number || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cls.teacher_list ? (
                      <div className="flex items-center space-x-2 justify-start rtl:space-x-reverse">
                        <a
                          href={SERVER_BASE_URL + cls.teacher_list}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {cls.name + ".pdf"}
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
                      <div className="relative">
                        {/* <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleFileUpload(e, cls.id)}
                          className="hidden"
                          id={`pdfUpload-${cls.id}`}
                        />
                        <label
                          htmlFor={`pdfUpload-${cls.id}`}
                          className="flex items-center justify-center w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition duration-200 text-sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          رفع ملف
                        </label> */}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => {
                          handleEditClass(cls);
                          set_chosen_class_id(cls.class_group_id!);
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.class_group_id)}
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

      {/* Add/Edit Class Modal */}
      {showAddModal && (
        <div className="!mt-0 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingClass ? "تعديل الصف" : "إضافة صف جديد"}
            </h3>

            <form
              className="space-y-4"
              onSubmit={editingClass ? handleUpdateSubmit : handleCreateSubmit}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الصف
                </label>
                <input
                  name="name"
                  type="text"
                  value={
                    editingClass ? updated_class_title : formData_creation.name
                  }
                  onChange={(e) => {
                    setNewClass({ ...newClass, name: e.target.value });
                    //?: logic for either creation or update
                    if (editingClass) {
                      set_updated_class_title(e.target.value);
                    } else {
                      handleCreationChange(e);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم الصف (مثل: الصف الأول - أ)"
                />
              </div>

              {editingClass && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    قائمة المعلمين (PDF)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        // handleFileUpload(
                        //   e,
                        //   editingClass?.id || `new-${Date.now()}`
                        // );

                        e.target.files
                          ? setFile_teachers(e.target.files[0])
                          : null;
                      }}
                      className="hidden"
                      id="pdfUploadModal"
                    />
                    <label
                      htmlFor="pdfUploadModal"
                      className="flex items-center justify-center w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition duration-200 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      رفع ملف PDF
                    </label>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingClass(null);
                    setNewClass({
                      class_group_id: "",
                      name: "",
                      students: 0,
                      teachersPdf: null,
                    });
                    // reset states
                    setFile_teachers(null);
                    setFormData_creation({ ...formData_creation, name: "" });
                    set_updated_class_title("");
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  // onClick={editingClass ? handleUpdateClass : handleAddClass}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingClass ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesManagement;
