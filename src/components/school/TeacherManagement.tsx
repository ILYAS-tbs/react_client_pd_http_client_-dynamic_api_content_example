import React, { FormEvent, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  EyeOff,
  FileUp,
} from "lucide-react";
import { TeacherManagementProps } from "../../types";
import { ModulesAndClassGroups } from "../../services/http_api/http_reponse_types";

// Backend server :
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";
import { auth_http_client } from "../../services/http_api/auth/auth_http_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import {
  RegisterTeacherPayload,
  SignupPayload,
} from "../../services/http_api/payloads_types/school_client_payload_types";
import { Teacher } from "../../models/Teacher";

const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachersList: teacherList,
  setTeacherList,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalError, SetModalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Create form
  const [formData_creation, setFormData_creation] = useState({
    name: "",
    subject: "",
    email: "",
    phone: "",
    password1: "",
    password2: "",
    years_of_experience: 0,
  });

  // Edit form
  const [last_chosen_teacher_id, set_last_chosen_teacher_id] = useState(-1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profile_pic_update, setProfilPic_update] = useState<File | null>(null);
  const [full_name_update, set_full_name_update] = useState("");
  const [phone_number_update, set_phone_number_update] = useState("");
  const [years_of_experience_update, set_years_of_experience_update] =
    useState("0");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData_creation({
      ...formData_creation,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData_creation.password1 !== formData_creation.password2) {
      SetModalError("كلمتا المرور غير متطابقتين. يجب أن تكونا متطابقتين.");
      setTimeout(() => SetModalError(""), 5000);
      return;
    }

    // 1. signup an account
    const teacher_signup_payload: SignupPayload = {
      email: formData_creation.email,
      phone: formData_creation.phone,
      username: formData_creation.email,
      password: formData_creation.password1,
    };
    let latest_csrf = getCSRFToken()!;
    await auth_http_client.teacher_signup(teacher_signup_payload, latest_csrf);

    // 2. register a teacher account
    const register_teacher_payload: RegisterTeacherPayload = {
      full_name: formData_creation.name,
      username: formData_creation.email,
    };
    latest_csrf = getCSRFToken()!;
    await auth_http_client.register_Teacher(
      register_teacher_payload,
      latest_csrf
    );

    // 3. Sync/update data
    const res = await school_dashboard_client.get_current_school_teachers();
    if (res.ok) {
      setTeacherList(res.data);
    }

    setShowAddModal(false);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    const selected_teacher = teacherList.find(
      (t) => t.user.id === last_chosen_teacher_id
    );

    formData.append(
      "full_name",
      full_name_update || selected_teacher?.full_name || ""
    );
    formData.append(
      "phone_number",
      phone_number_update || selected_teacher?.phone_number || ""
    );
    if (profile_pic_update) {
      formData.append("profile_picture", profile_pic_update);
    }
    if (years_of_experience_update !== "0") {
      formData.append("years_of_experience", years_of_experience_update);
    }

    const latest_csrf = getCSRFToken()!;
    const res = await school_dashboard_client.update_teacher(
      last_chosen_teacher_id,
      formData,
      latest_csrf
    );
    if (res.ok) {
      setShowEditModal(false);
      RefetchData();
    }
  };

  async function RefetchData() {
    const updated_data_res =
      await school_dashboard_client.get_current_school_teachers();
    if (updated_data_res.ok) {
      setTeacherList(updated_data_res.data);
    }
  }

  // Activate teacher
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

  // Subjects
  const subjects = [
    "الرياضيات",
    "اللغة العربية",
    "العلوم",
    "التاريخ",
    "الجغرافيا",
    "الفرنسية",
    "الإنجليزية",
  ];

  // Filtering
  const loopThroughClassGroups = (teacher: Teacher) => {
    if (!teacher.modulesAndClassGroups) return false;
    return teacher.modulesAndClassGroups.some((c) =>
      c.class_group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredTeachers = teacherList.filter(
    (teacher) =>
      teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loopThroughClassGroups(teacher)
  );

  return <div>{/* ... keep your JSX (unchanged) ... */}</div>;
};

export default TeacherManagement;
