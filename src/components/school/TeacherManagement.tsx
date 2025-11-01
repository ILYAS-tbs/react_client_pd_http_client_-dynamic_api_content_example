import React, { FormEvent, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Eye,
  UserCheck,
  EyeOff,
  FileUp,
} from "lucide-react";
import { TeacherManagementProps } from "../../types";

// Backend server :
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";
import { auth_http_client } from "../../services/http_api/auth/auth_http_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import {
  PostPutTeacherModuleClassGrpPayload,
  RegisterTeacherPayload,
  SignupPayload,
} from "../../services/http_api/payloads_types/school_client_payload_types";
import { Teacher } from "../../models/Teacher";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachersList: teacherList,
  setTeacherList,
  modules,

  class_groups_list,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalError, SetModalError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password1: "",
    password2: "",
    years_of_experience: 0,
  });

  const [showPassword, setShowPassword] = useState(false);

  const {language}=useLanguage()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  //? 1.Creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData); // send to backend API here
    setShowAddModal(false);

    // basic validation :
    if (formData.password1 !== formData.password2) {
      SetModalError("كلمتا المرور غير متطابقتين. يجب أن تكونا متطابقتين.");
      setTimeout(() => {
        SetModalError("");
      }, 5000);
      return;
    }

    //! 1. signup an account
    const teacher_signup_payload: SignupPayload = {
      email: formData.email,
      phone: formData.phone_number,
      username: formData.email,
      password: formData.password1,
    };
    let latest_csrf = getCSRFToken()!;
    const teacher_signup_res = await auth_http_client.teacher_signup(
      teacher_signup_payload,
      latest_csrf
    );
    console.log("teacher signup :");
    console.log(teacher_signup_res);
    //! 2. register a teacher account with that account
    const register_teacher_payload: RegisterTeacherPayload = {
      full_name: formData.name,
      username: formData.email,
      phone_number: formData.phone_number,
    };
    latest_csrf = getCSRFToken()!;
    const register_teacher_res = await auth_http_client.register_Teacher(
      register_teacher_payload,
      latest_csrf
    );
    console.log("teacher register :");
    console.log(register_teacher_res);

    //! 3. Sync/update data :
    const res = await school_dashboard_client.get_current_school_teachers();
    if (res.ok) {
      setTeacherList(res.data);
    }
  };

  // const [file, setFile] = useState<File | null>(null);

  // fake teachers data
  // const teachers = [
  //   {
  //     id: 1,
  //     name: "أحمد بن علي",
  //     subject: "الرياضيات",
  //     classes: ["5أ", "5ب", "6أ"],
  //     phone: "0555123456",
  //     email: "ahmed@school.dz",
  //     status: "نشط",
  //     experience: "8 سنوات",
  //   },
  //   {
  //     id: 2,
  //     name: "فاطمة حسن",
  //     subject: "اللغة العربية",
  //     classes: ["4أ", "4ب"],
  //     phone: "0555234567",
  //     email: "fatima@school.dz",
  //     status: "نشط",
  //     experience: "5 سنوات",
  //   },
  //   {
  //     id: 3,
  //     name: "محمد السعيد",
  //     subject: "العلوم",
  //     classes: ["6أ", "6ب"],
  //     phone: "0555345678",
  //     email: "mohammed@school.dz",
  //     status: "معلق",
  //     experience: "12 سنة",
  //   },
  //   {
  //     id: 4,
  //     name: "زينب العلي",
  //     subject: "التاريخ",
  //     classes: ["5أ", "6أ"],
  //     phone: "0555456789",
  //     email: "zeinab@school.dz",
  //     status: "نشط",
  //     experience: "6 سنوات",
  //   },
  // ];

  // real teachers data
  // const map_subjects = (modulesAndClassGroupsList: ModulesAndClassGroups[]) => {
  //   if (!modulesAndClassGroupsList) return [];

  //   const subject_list = modulesAndClassGroupsList.map(
  //     (modulesAndClassGroups) => modulesAndClassGroups.class_group.name
  //   );
  //   return subject_list;
  // };

  //  Mock data
  // const teachers_real: Teacher[] = teacherList.map((teacher_response) => {
  //   const teacher: Teacher = {
  //     id: teacher_response.id,
  //     name: teacher_response.full_name,
  //     subject:
  //       teacher_response.modulesAndClassGroups?.[0]?.module.module_name ||
  //       "unfound",
  //     classes: map_subjects(teacher_response.modulesAndClassGroups || []),
  //     phone: teacher_response.phone_number,
  //     email: teacher_response.user.email,
  //     experience: teacher_response.years_of_experience,
  //     status: teacher_response.status === "pending" ? "معلق" : "نشط",
  //     profile_picture: teacher_response.profile_picture,
  //   };
  //   return teacher;
  // });
  // const subjects = [
  //   "الرياضيات",
  //   "اللغة العربية",
  //   "العلوم",
  //   "التاريخ",
  //   "الجغرافيا",
  //   "الفرنسية",
  //   "الإنجليزية",
  // ];
  const subjects = modules;

  // modules;

  const loopThroughClassGroups = (teacher: Teacher) => {
    let exist: boolean = false;

    teacher.modulesAndClassGroups?.[0]?.module.module_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!teacher.modulesAndClassGroups) {
      return;
    }

    for (let i = 0; i < teacher.modulesAndClassGroups?.length; i++) {
      exist =
        (exist ||
          teacher.modulesAndClassGroups?.[i]?.class_group.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ??
        false;
    }

    return exist;
  };
  const filteredTeachers = teacherList.filter(
    (teacher) =>
      teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loopThroughClassGroups(teacher)
  );

  async function RefetchData() {
    //! To sync the teachers with teacher in the server
    const updated_data_res =
      await school_dashboard_client.get_current_school_teachers();
    if (updated_data_res.ok) {
      const updated_teacher_list: Teacher[] = updated_data_res.data;
      setTeacherList(updated_teacher_list);
    }
  }

  //? 2.Edit Teacher :
  const [last_chosen_teacher_id, set_last_chosen_teacher_id] = useState(-1);
  const [showEditModal, setShowEditModel] = useState(false);
  const [profile_pic_update, setProfilPic_update] = useState<File | null>(null);
  const [full_name_update, set_full_name_update] = useState("");
  const [phone_number_update, set_phone_number_update] = useState("");
  const [years_of_experience_update, set_years_of_experience_update] =
    useState("0");

  const [modules_id, setModuleID] = useState<string>("");
  const [class_group_id, setClassGrpID] = useState<string>("");
  const [editModalError, setEditModalError] = useState("");

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    // selected teacher to perform various checks
    const selected_teacher = teacherList.find(
      (t) => t.user.id === last_chosen_teacher_id
    );

    //* Basic Validations :
    // empty name fall back to default
    formData.append("full_name", full_name_update);
    if (!full_name_update) {
      formData.append("full_name", selected_teacher?.full_name ?? "");
    }

    formData.append("phone_number", phone_number_update);
    // empty phone number fall back
    if (!phone_number_update) {
      formData.append("phone_number", selected_teacher?.phone_number ?? "");
    }

    if (profile_pic_update) {
      formData.append("profile_picture", profile_pic_update);
    }
    if (years_of_experience_update !== "0") {
      formData.append("years_of_experience", years_of_experience_update);
    }

    console.log(Object.fromEntries(formData.entries()));

    // basic validations
    if (!class_group_id) {
      showEditModalError("يرجى تحديد  الصف");
      return;
    }
    if (!modules_id) {
      showEditModalError("يرجى اختيار المادة");
      return;
    }

    //? API CALL 01 : updating teacher fields
    const latest_csrf = getCSRFToken()!;
    const res = await school_dashboard_client.update_teacher(
      last_chosen_teacher_id,
      formData,
      latest_csrf
    );

    if (res.ok) {
      console.log(res);

      //? API CALL 02 : Creating a relation between  teacher-classGrp-module

      const teacherModuleClass_payload: PostPutTeacherModuleClassGrpPayload = {
        teacher_id: String(last_chosen_teacher_id),
        class_group_id: class_group_id,
        module_id: modules_id,
      };
      const latest_csrf = getCSRFToken()!;

      console.log("teacherModuleClass_payload : ");
      console.log(teacherModuleClass_payload);

      const teacherModuleClass_res =
        await school_dashboard_client.create_or_update_TeacherModuleClassGroup(
          teacherModuleClass_payload,
          latest_csrf
        );
      if (teacherModuleClass_res.ok) {
        console.info("TeacherManagement.tsx : teacherModuleClass_res OK!");
        // reset
        setShowEditModel(false);
        setClassGrpID("");
        setModuleID("");
      }

      // Refresh Data if successful update :
      RefetchData();
      // empty form data
      resetUpdateForm();
    }
  };
  const resetUpdateForm = () => {
    setProfilPic_update(null);
    set_full_name_update("");
    set_phone_number_update("");
    set_years_of_experience_update("0");
  };
  const showEditModalError = (error: string) => {
    setEditModalError(error);
    setTimeout(() => {
      setEditModalError("");
    }, 7000);
  };
  //! Activate teacher :
  const handleActivateTeacher = async (id: number, activate: boolean) => {
    // selected teacher to perform various checks
    // const selected_teacher = teacherList.find(
    //   (t) => t.user.id === last_chosen_teacher_id
    // );
    const latest_csrf = getCSRFToken()!;
    const formData = new FormData();
    formData.append("status", activate ? "active" : "pending");
    const patch_res = await school_dashboard_client.update_teacher(
      id,
      formData,
      latest_csrf
    );
    // Sync data with the server
    if (patch_res.ok) {
      RefetchData();
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation('teacherManagement',language)}
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>{getTranslation('addTeacher',language)}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={getTranslation('searchTeachers',language)}
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
            key={teacher.user.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {/* Teacher Proifile pic if it exist */}
                {teacher.profile_picture ? (
                  <img
                    src={`${SERVER_BASE_URL}${teacher.profile_picture}`}
                    alt=""
                    className="rounded-full bg-cover w-[64px] h-[64px]"
                  />
                ) : (
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {teacher.full_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {teacher.modulesAndClassGroups?.[0]?.module.module_name}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  teacher.status === "نشط" || teacher.status === "active"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                }`}
              >
                {teacher.status === "نشط" || teacher.status === "active"
                  ? getTranslation('active',language)
                  : getTranslation('inactive',language)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation('classCount',language)}:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  <ul className="flex flex-col items-end">
                    {teacher.modulesAndClassGroups?.map((x) => (
                    <li key={`${x.module.module_id}-${x.class_group.class_group_id}`}>
                        {x.module.module_name} - {x.class_group.name}
                      </li>
                    ))}
                  </ul>
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation('experience',language)}:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {teacher.years_of_experience}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation('phoneNumber',language)}:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {teacher.phone_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation('email',language)}:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-left">
                  {teacher.user.email}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {/* hide teacher removed for now  */}
                {/* <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  <Eye className="h-4 w-4" />
                </button> */}

                <button
                  onClick={() => {
                    setShowEditModel(true);
                    set_last_chosen_teacher_id(teacher.user.id);
                  }}
                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                >
                  <Edit className="h-4 w-4" />
                </button>
                {/* Delete teacher removed for now  */}
                {/* <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button> */}
              </div>

              <div className="activation-buttons">
                <button
                  onClick={() => handleActivateTeacher(teacher.user.id, true)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    teacher.status === "نشط"
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                      : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                  }`}
                >
                  {teacher.status === "نشط" ? getTranslation('suspend',language): getTranslation('activate',language)}
                </button>

                <button
                  onClick={() => handleActivateTeacher(teacher.user.id, false)}
                  className={`px-3 mx-1 py-1 text-xs font-medium rounded-lg transition-colors ${"bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"}`}
                >
                  {getTranslation('suspend',language)}
                </button>
              </div>
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

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم المعلم
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="الاسم الكامل"
                />
              </div>

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
                  placeholder="teacher@school.dz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رقم الهاتف
                </label>
                <input
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0555 XX XX XX"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  كلمة السر
                </label>
                <input
                  name="password1"
                  type={showPassword ? "text" : "password"}
                  value={formData.password1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="كلمة السر"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute mt-3 right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  name="password2"
                  type={showPassword ? "text" : "password"}
                  value={formData.password2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="تأكيد كلمة المرور"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute mt-3 right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  سنوات الخبرة
                </label>
                <input
                  name="years_of_experience"
                  type="number"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="عدد السنوات"
                />
              </div> */}

              {/* Modal Error */}
              {modalError && (
                <h1 className=" text-red-600 text-sm">{modalError}</h1>
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

      {/* Edit Teacher Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              تحديث بيانات المعلم
            </h3>

            <form className="space-y-4" onSubmit={handleEditSubmit}>
              {/* Profil Pic */}
              <div className="profile-picture-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  صورة الملف الشخصي
                </label>
                <label
                  htmlFor="img-file-update"
                  className="flex text-gray-300 bg-brand-blue w-1/4 p-2 mt-2 rounded cursor-pointer "
                >
                  <FileUp />
                  <div className="text">تحميل</div>
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const uploaded_file = e.target.files
                      ? e.target.files?.[0]
                      : null;
                    setProfilPic_update(uploaded_file ?? null);
                  }}
                  id="img-file-update"
                  style={{ display: "none" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم المعلم
                </label>
                <input
                  name="name"
                  type="text"
                  value={full_name_update}
                  onChange={(e) => set_full_name_update(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="الاسم الكامل"
                />
              </div>

              {/* will be changed - additional data on the update*/}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الصف
                </label>
                <select
                  name="class_group_id"
                  value={class_group_id}
                  onChange={(e) => setClassGrpID(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={""}>اختر الفصل</option>
                  {class_groups_list.map((cls) => (
                    <option key={cls.class_group_id} value={cls.class_group_id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المادة
                </label>
                <select
                  name="modules_id"
                  value={modules_id}
                  onChange={(e) => setModuleID(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={""}>اختر المادة</option>
                  {subjects.map((subject) => (
                    <option key={subject.module_id} value={subject.module_id}>
                      {subject.module_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="teacher@school.dz"
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رقم الهاتف
                </label>
                <input
                  name="phone_number"
                  type="tel"
                  value={phone_number_update}
                  onChange={(e) => set_phone_number_update(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0555 XX XX XX"
                />
              </div>

              {/* <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  كلمة السر
                </label>
                <input
                  name="password1"
                  type={showPassword ? "text" : "password"}
                  value={formData.password1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="كلمة السر"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute mt-3 right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div> */}

              {/* <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  name="password2"
                  type={showPassword ? "text" : "password"}
                  value={formData.password2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="تأكيد كلمة المرور"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute mt-3 right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  سنوات الخبرة
                </label>
                <input
                  name="years_of_experience"
                  type="number"
                  value={years_of_experience_update}
                  onChange={(e) =>
                    set_years_of_experience_update(e.target.value)
                  }
                  min={0}
                  max={20}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="عدد السنوات"
                />
              </div>

              {/* Modal Error */}
              {editModalError && (
                <h1 className=" text-red-600 text-sm">{editModalError}</h1>
              )}

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setClassGrpID("");
                    setModuleID("");
                    setShowEditModel(false);
                    resetUpdateForm();
                  }}
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
    </div>
  );
};

export default TeacherManagement;
