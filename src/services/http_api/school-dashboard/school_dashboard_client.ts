const BASE_URL = "http://127.0.0.1:8000";

const URLS = {
  get_current_school_students: `${BASE_URL}/student/students/get_current_school_students`,
  get_current_school_teachers: `${BASE_URL}/teacher/teachers/get_current_school_teachers`,
  get_current_school_class_groups: `${BASE_URL}/class-group/class-groups/get_current_school_class_groups`,
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
export const school_dashboard_client = {
  get_current_school_students: get_current_school_students,
  get_current_school_teachers: get_current_school_teachers,
  get_current_school_class_groups: get_current_school_class_groups,
};
