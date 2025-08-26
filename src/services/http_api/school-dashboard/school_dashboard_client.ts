import { TeacherPayload } from "../http_payload_types";

const BASE_URL = "http://127.0.0.1:8000";

const URLS = {
  get_current_school_students: `${BASE_URL}/student/students/get_current_school_students`,
  get_current_school_teachers: `${BASE_URL}/teacher/teachers/get_current_school_teachers`,
  get_current_school_class_groups: `${BASE_URL}/class-group/class-groups/get_current_school_class_groups`,
  get_current_school_parents: `${BASE_URL}/parent/parents/get_current_school_parents`,
  patch_teacher: `${BASE_URL}/teacher/teachers/`,
};

async function get_current_school_students() {
  const response = await fetch(URLS.get_current_school_students, {
    method: "GET",
    credentials: "include", // ensures cookies like sessionid are sent
  });

  const data = await response.json();
  return data;
}

async function get_current_school_teachers() {
  const response = await fetch(URLS.get_current_school_teachers, {
    method: "GET",
    credentials: "include", // ensures cookies like sessionid are sent
  });

  const data = await response.json();
  return data;
}

async function get_current_school_class_groups() {
  const response = await fetch(URLS.get_current_school_class_groups, {
    method: "GET",
    credentials: "include", // ensures cookies like sessionid are sent
  });

  const data = await response.json();
  return data;
}

async function get_current_school_parents() {
  const response = await fetch(URLS.get_current_school_parents, {
    method: "GET",
    credentials: "include", // ensures cookies like sessionid are sent
  });

  const data = await response.json();
  return data;
}

// POST / PATCH  requests :
async function update_teacher(
  id: string,
  formData: FormData,
  csrf_token: string
) {
  if (!csrf_token) {
    throw new Error("update teacher : No CSRF TOKEN found..");
  }

  const PATCH_URL = URLS.patch_teacher + id + "/";
  //  do not set Content-Type manually, browser will set boundary for multipart (mutipart : data + files)
  const response = await fetch(PATCH_URL, {
    method: "PATCH",
    headers: {
      "X-CSRFTOKEN": csrf_token,
    },
    credentials: "include",
    body: formData,
  });
  const data = await response.json();
  return data;
}
export const school_dashboard_client = {
  get_current_school_students: get_current_school_students,
  get_current_school_teachers: get_current_school_teachers,
  get_current_school_class_groups: get_current_school_class_groups,
  get_current_school_parents: get_current_school_parents,
  update_teacher: update_teacher,
};
