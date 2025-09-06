import {
  AddCurrectSchoolStudentsToParent,
  AddorRemoveParentToSchoolPayload,
  FindParentByIdPayload,
  PostPutClassGroupPayload as PostClassGroupPayload,
  PostStudentPayload,
  TeacherPayload,
} from "../payloads_types/school_client_payload_types";

const BASE_URL = "http://127.0.0.1:8000";
const URLS = {
  get_current_school_students: `${BASE_URL}/school/schools/get_current_school_students`,
  get_current_school_teachers: `${BASE_URL}/school/schools/get_current_school_teachers`,
  get_current_school_class_groups: `${BASE_URL}/school/schools/get_current_school_class_groups`,
  get_current_school_parents: `${BASE_URL}/school/schools/get_current_school_parents`,
  get_current_school_events: `${BASE_URL}/school/schools/get_current_school_events/`,
  get_current_school_exam_schedules: `${BASE_URL}/school/schools/get_current_school_exam_schedules/`,
  get_current_school_stats: `${BASE_URL}/school/schools/get_current_school_stats/`,

  patch_teacher: `${BASE_URL}/teacher/teachers/`,

  get_class_group: `${BASE_URL}/class-group/class-groups/`,
  post_class_group: `${BASE_URL}/class-group/class-groups/`,
  delete_class_group: `${BASE_URL}/class-group/class-groups/`,
  put_class_group: `${BASE_URL}/class-group/class-groups/`,

  post_student: `${BASE_URL}/student/students/`,
  put_student: `${BASE_URL}/student/students/`,
  delete_student: `${BASE_URL}/student/students/`,

  find_parent_by_email: `${BASE_URL}/school/schools/find_parent_by_email/`,
  add_parent_to_school: `${BASE_URL}/school/schools/add_parent_to_school/`,
  add_current_school_students_to_parent: `${BASE_URL}/school/schools/add_current_school_students_to_parent/`,
  remove_parent_from_school: `${BASE_URL}/school/schools/remove_parent_from_school/`,

  get_current_school_absence_reports: `${BASE_URL}/school/absence-reports/get_current_school_absence_reports/`,
  get_current_school_behaviour_reports: `${BASE_URL}/school/behaviour-reports/get_current_school_behaviour_reports/`,
};

async function get_current_school_students() {
  try {
    const response = await fetch(URLS.get_current_school_students, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_current_school_teachers() {
  try {
    const response = await fetch(URLS.get_current_school_teachers, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();

    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_current_school_class_groups() {
  try {
    const response = await fetch(URLS.get_current_school_class_groups, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_current_school_parents() {
  try {
    const response = await fetch(URLS.get_current_school_parents, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_current_school_exam_schedules() {
  try {
    const response = await fetch(URLS.get_current_school_exam_schedules, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_current_school_stats() {
  try {
    const response = await fetch(URLS.get_current_school_stats, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

// POST / PATCH  requests :
async function update_teacher(
  id: number,
  formData: FormData,
  csrf_token: string
) {
  if (!csrf_token) {
    throw new Error("update teacher : No CSRF TOKEN found..");
  }

  const PATCH_URL = URLS.patch_teacher + id + "/";
  try {
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
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

// POST class_group
async function post_class_group(
  payload: PostClassGroupPayload,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.post_class_group, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function put_class_group(
  id: string,
  payload: FormData,
  csrfToken: string
) {
  const PUT_URL = URLS.put_class_group + id + "/";
  try {
    const response = await fetch(PUT_URL, {
      method: "PUT",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: payload,
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function delete_class_group(id: string, csrfToken: string) {
  try {
    const DELETE_URL = URLS.delete_class_group + id + "/";
    const response = await fetch(DELETE_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function get_class_group(id: string) {
  const GET_ONE_URL = URLS.get_class_group + id + "/";

  try {
    const response = await fetch(GET_ONE_URL, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

// * Student
async function post_student(payload: PostStudentPayload, csrfToken: string) {
  try {
    const response = await fetch(URLS.post_student, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function put_student(
  id: string,
  payload: PostStudentPayload,
  csrfToken: string
) {
  const PUT_URL = URLS.put_student + id + "/";
  try {
    const response = await fetch(PUT_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function delete_student(id: string, csrfToken: string) {
  const DELETE_URL = URLS.delete_student + id + "/";
  try {
    const response = await fetch(DELETE_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

//! Parent :
async function find_parent_by_email(
  payload: FindParentByIdPayload,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.find_parent_by_email, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function add_parent_to_school(
  payload: AddorRemoveParentToSchoolPayload,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.add_parent_to_school, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function remove_parent_from_school(
  payload: AddorRemoveParentToSchoolPayload,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.remove_parent_from_school, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function add_current_school_students_to_parent(
  payload: AddCurrectSchoolStudentsToParent,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.add_current_school_students_to_parent, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

//* EVENTS :
async function get_current_school_events() {
  try {
    const response = await fetch(URLS.get_current_school_events, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
//! Absence Reports :
export async function get_current_school_absence_reports() {
  try {
    const response = await fetch(URLS.get_current_school_absence_reports, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

//! BehaviourReports :
export async function get_current_school_behaviour_reports() {
  try {
    const response = await fetch(URLS.get_current_school_behaviour_reports, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

export const school_dashboard_client = {
  get_current_school_students: get_current_school_students,
  get_current_school_teachers: get_current_school_teachers,
  get_current_school_class_groups: get_current_school_class_groups,
  get_current_school_parents: get_current_school_parents,
  get_current_school_events: get_current_school_events,
  get_current_school_exam_schedules: get_current_school_exam_schedules,
  get_current_school_stats: get_current_school_stats,

  update_teacher: update_teacher,

  post_class_group: post_class_group,
  get_class_group: get_class_group,
  delete_class_group: delete_class_group,
  put_class_group: put_class_group,

  post_student: post_student,
  put_student: put_student,
  delete_student: delete_student,

  find_parent_by_email: find_parent_by_email,
  add_parent_to_school: add_parent_to_school,
  add_current_school_students_to_parent: add_current_school_students_to_parent,
  remove_parent_from_school: remove_parent_from_school,

  get_current_school_absence_reports: get_current_school_absence_reports,

  get_current_school_behaviour_reports: get_current_school_behaviour_reports,
};
