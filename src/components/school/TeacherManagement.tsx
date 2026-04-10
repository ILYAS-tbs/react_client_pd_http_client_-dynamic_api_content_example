import React, { FormEvent, useCallback, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Eye,
  UserCheck,
  EyeOff,
  FileUp,
  BookOpen,
  X,
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
import { useModalFormReset } from "../../hooks/useModalFormReset";

const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachersList: teacherList,
  setTeacherList,
  modules,

  class_groups_list,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalError, SetModalError] = useState("");
  const defaultTeacherForm = {
    name: "",
    email: "",
    phone_number: "",
    password1: "",
    password2: "",
    years_of_experience: 0,
  };
  const [formData, setFormData] = useState({
    ...defaultTeacherForm,
  });

  const [showPassword, setShowPassword] = useState(false);

  const { language } = useLanguage()

  const resetAddTeacherForm = useCallback(() => {
    setFormData(defaultTeacherForm);
    SetModalError("");
    setShowPassword(false);
  }, []);

  const { formKey: addTeacherFormKey } = useModalFormReset({
    isOpen: showAddModal,
    mode: "add",
    resetForm: resetAddTeacherForm,
  });

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
      resetAddTeacherForm();
      setShowAddModal(false);
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
  const [weekly_schedule, setWeeklySchedue] = useState<File | null>(null)

  const selectedTeacherForEdit =
    teacherList.find((teacher) => teacher.user.id === last_chosen_teacher_id) ??
    null;

  // Assignment Management Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assign_teacher_id, set_assign_teacher_id] = useState<number>(-1);
  const [assign_teacher_name, set_assign_teacher_name] = useState<string>("");
  const [new_assign_classgrp, set_new_assign_classgrp] = useState<string>("");
  const [new_assign_module, set_new_assign_module] = useState<string>("");
  const [assignModalError, setAssignModalError] = useState<string>("");

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

    if (weekly_schedule) {
      formData.append('weekly_schedule', weekly_schedule)
    }

    if (years_of_experience_update !== "0") {
      formData.append("years_of_experience", years_of_experience_update);
    }

    console.log(Object.fromEntries(formData.entries()));

    //? API CALL : updating teacher fields
    const latest_csrf = getCSRFToken()!;
    const res = await school_dashboard_client.update_teacher(
      last_chosen_teacher_id,
      formData,
      latest_csrf
    );
    if (res.ok) {
      setShowEditModel(false);
      RefetchData();
      resetUpdateForm();
    }
  };
  const resetUpdateForm = useCallback(() => {
    setProfilPic_update(null);
    set_full_name_update("");
    set_phone_number_update("");
    set_years_of_experience_update("0");
    setWeeklySchedue(null);
  }, []);

  const populateUpdateForm = useCallback((teacher: Teacher) => {
    setProfilPic_update(null);
    set_full_name_update(teacher.full_name ?? "");
    set_phone_number_update(teacher.phone_number ?? "");
    set_years_of_experience_update(
      String(teacher.years_of_experience ?? 0)
    );
    setWeeklySchedue(null);
  }, []);

  const { formKey: editTeacherFormKey } = useModalFormReset({
    isOpen: showEditModal,
    mode: selectedTeacherForEdit ? "edit" : "add",
    selectedItem: selectedTeacherForEdit,
    selectedKey: selectedTeacherForEdit?.user.id ?? null,
    resetForm: resetUpdateForm,
    populateForm: populateUpdateForm,
  });
  //! Activate teacher :
  const handleActivateTeacher = async (id: number, activate: boolean) => {
    const latest_csrf = getCSRFToken()!;
    const formData = new FormData();
    formData.append("status", activate ? "active" : "pending");
    const patch_res = await school_dashboard_client.update_teacher(
      id,
      formData,
      latest_csrf
    );
    if (patch_res.ok) {
      RefetchData();
    }
  };

  //! Assignment Management:
  const handleAddAssignment = async () => {
    if (!new_assign_classgrp || !new_assign_module) {
      setAssignModalError("يرجى تحديد الصف والمادة");
      setTimeout(() => setAssignModalError(""), 5000);
      return;
    }
    const payload: PostPutTeacherModuleClassGrpPayload = {
      teacher_id: String(assign_teacher_id),
      class_group_id: new_assign_classgrp,
      module_id: new_assign_module,
    };
    const csrf = getCSRFToken()!;
    const res = await school_dashboard_client.create_or_update_TeacherModuleClassGroup(payload, csrf);
    if (res.ok) {
      set_new_assign_classgrp("");
      set_new_assign_module("");
      await RefetchData();
    } else {
      setAssignModalError("حدث خطأ أثناء إضافة التسجيل");
      setTimeout(() => setAssignModalError(""), 5000);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    const csrf = getCSRFToken()!;
    const res = await school_dashboard_client.delete_TeacherModuleClassGroup(assignmentId, csrf);
    if (res.ok) {
      await RefetchData();
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation('teacherManagement', language)}
        </h2>
        <button
                  onClick={() => setShowAddModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>{getTranslation('addTeacher', language)}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={getTranslation('searchTeachers', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto p-2">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.user.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 max-w-full min-w-0 w-full transition-transform hover:scale-[1.025] overflow-hidden"
            style={{ maxWidth: '370px', margin: '0 auto', wordBreak: 'break-word' }}
          >
            {/* Header with profile and name */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              {/* Teacher Profile pic if it exists */}
              {teacher.profile_picture ? (
                <img
                  src={`${SERVER_BASE_URL}${teacher.profile_picture}`}
                  alt=""
                  className="rounded-full bg-cover w-[64px] h-[64px] border-2 border-primary-400 object-cover flex-shrink-0"
                />
              ) : (
                <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full flex-shrink-0">
                  {/* <UserCheck className="h-6 w-6 text-primary-500" /> */}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                  {teacher.full_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {teacher.modulesAndClassGroups?.[0]?.module.module_name}
                </p>
              </div>
            </div>

            {/* Email section */}
            <div className="mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1">
                {getTranslation('email', language)}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white break-all block">
                {teacher.user.email}
              </span>
            </div>

            {/* Status badge */}
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap w-full text-center ${teacher.status === "نشط" || teacher.status === "active"
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  }`}
              >
                {teacher.status === "نشط" || teacher.status === "active"
                  ? getTranslation('active', language)
                  : getTranslation('inactive', language)}
              </span>
            </div>

            <div className="space-y-2 mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation('classCount', language)}:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[160px] truncate">
                  <ul className="flex flex-col items-end">
                    {teacher.modulesAndClassGroups?.map((x) => (
                      <li key={`${x.module.module_id}-${x.class_group.class_group_id}`} className="truncate max-w-[150px]">
                        {x.module.module_name} - {x.class_group.name}
                      </li>
                    ))}
                  </ul>
                </span>
              </div>

              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation('experience', language)}:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {teacher.years_of_experience}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation('phoneNumber', language)}:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white break-all">
                  {teacher.phone_number}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 gap-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                <button
                  onClick={() => {
                    setShowEditModel(true);
                    set_last_chosen_teacher_id(teacher.user.id);
                  }}
                  className="text-primary-600 hover:bg-primary-300 p-1 rounded"
                  title="تعديل بيانات المعلم"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              <div className="activation-buttons flex items-center gap-2 flex-wrap">
                {/* Manage Assignments button */}
                <button
                  onClick={() => {
                    set_assign_teacher_id(teacher.user.id);
                    set_assign_teacher_name(teacher.full_name);
                    setShowAssignModal(true);
                  }}
                  className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                  title="إدارة الحصص والمواد"
                >
                  <BookOpen className="h-4 w-4" />
                </button>
                {/* Toggle activate / deactivate */}
                <button
                  onClick={() =>
                    handleActivateTeacher(
                      teacher.user.id,
                      teacher.status !== "active" && teacher.status !== "نشط"
                    )
                  }
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    teacher.status === "active" || teacher.status === "نشط"
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                      : "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800"
                  }`}
                >
                  {teacher.status === "active" || teacher.status === "نشط"
                    ? getTranslation("suspend", language)
                    : getTranslation("activate", language)}
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

            <form key={addTeacherFormKey} className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم المعلم
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="عدد السنوات"
                />
              </div> */}

              {/* Modal Error */}
              {modalError && (
                <h1 className=" text-red-600 text-sm">{modalError}</h1>
              )}

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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

            <form key={editTeacherFormKey} className="space-y-4" onSubmit={handleEditSubmit}>
              {/* Profil Pic */}
              <div className="profile-picture-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  صورة الملف الشخصي
                </label>
                <label
                  htmlFor="img-file-update"
                  className="flex text-gray-300 bg-brand-primary w-1/4 p-2 mt-2 rounded cursor-pointer "
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="الاسم الكامل"
                />
              </div>

              {/* Weekly Schedule */}
              <div className="profile-picture-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الجدول الأسبوعي
                </label>
                <label
                  htmlFor="weekly-schedule-file"
                  className="flex text-gray-300 bg-brand-primary w-1/4 p-2 mt-2 rounded cursor-pointer "
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
                    setWeeklySchedue(uploaded_file ?? null);
                  }}
                  id="weekly-schedule-file"
                  style={{ display: "none" }}
                />
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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

              {/* Modal Error */}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModel(false);
                    resetUpdateForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Assignments Modal */}
      {showAssignModal && (() => {
        const assign_teacher = teacherList.find(t => t.user.id === assign_teacher_id);
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  إدارة الحصص — {assign_teacher_name}
                </h3>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    set_new_assign_classgrp("");
                    set_new_assign_module("");
                    setAssignModalError("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Current Assignments */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  الحصص الحالية:
                </h4>
                {assign_teacher?.modulesAndClassGroups?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {assign_teacher.modulesAndClassGroups.map((asgn) => (
                      <span
                        key={asgn.id}
                        className="flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium px-3 py-1.5 rounded-full"
                      >
                        {asgn.module.module_name} — {asgn.class_group.name}
                        <button
                          onClick={() => handleRemoveAssignment(asgn.id)}
                          className="text-primary-500 hover:text-red-500 transition-colors"
                          title="حذف"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">لا توجد حصص مُسندة حالياً.</p>
                )}
              </div>

              <hr className="border-gray-200 dark:border-gray-700 mb-5" />

              {/* Add New Assignment */}
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {getTranslation('continue', language)}:
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">الصف</label>
                  <select
                    value={new_assign_classgrp}
                    onChange={(e) => set_new_assign_classgrp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">اختر الفصل</option>
                    {class_groups_list.map((cls) => (
                      <option key={cls.class_group_id} value={cls.class_group_id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">المادة</label>
                  <select
                    value={new_assign_module}
                    onChange={(e) => set_new_assign_module(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">اختر المادة</option>
                    {subjects.map((subj) => (
                      <option key={subj.module_id} value={subj.module_id}>
                        {subj.module_name}
                      </option>
                    ))}
                  </select>
                </div>
                {assignModalError && (
                  <p className="text-red-500 text-xs">{assignModalError}</p>
                )}
                <button
                  onClick={handleAddAssignment}
                  className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                 {getTranslation('continue', language)}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TeacherManagement;
