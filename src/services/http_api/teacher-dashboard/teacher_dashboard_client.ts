import {
  PatchStudentPayload,
  PostAbsencePayload,
  PostBehaviourReportPayload,
  PostMarkPayload,
  PostStudentGradesPayload,
} from "../payloads_types/teacher_client_payload_types";

const BASE_URL = "http://127.0.0.1:8000";
const URLS = {
  get_current_teacher_students: `${BASE_URL}/teacher/teachers/get_current_teacher_students/`,
  get_current_teacher_modules_and_class_groups: `${BASE_URL}/teacher/teachers/get_current_teacher_modules_and_class_groups/`,
  get_current_teacher_uploads: `${BASE_URL}/teacher/teachers/get_current_teacher_uploads/`,
  get_current_teacher_behaviour_reports: `${BASE_URL}/teacher/teachers/get_current_teacher_behaviour_reports/`,
  current_teacher_school_modules: `${BASE_URL}/teacher/teachers/current_teacher_school_modules/`,
  current_teacher_students_grades: `${BASE_URL}/teacher/teachers/current_teacher_students_grades/`,
  patch_student: `${BASE_URL}/student/students/`,

  post_absence: `${BASE_URL}/class-group/absences/`,

  post_behaviour_report: `${BASE_URL}/school/behaviour-reports/`,

  post_mark: `${BASE_URL}/teacher/marks/`,
  post_grades: `${BASE_URL}/teacher/student-grades/`,
  patch_grades: `${BASE_URL}/teacher/student-grades/`,

  create_teacher_upload: `${BASE_URL}/teacher/teacher-uploads/create_teacher_upload/`,
  delete_teacher_upload: `${BASE_URL}/teacher/teacher-uploads/`,
};

async function get_current_teacher_students() {
  try {
    const response = await fetch(URLS.get_current_teacher_students, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function get_current_teacher_modules_and_class_groups() {
  try {
    const response = await fetch(
      URLS.get_current_teacher_modules_and_class_groups,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function current_teacher_students_grades() {
  try {
    const response = await fetch(URLS.current_teacher_students_grades, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function get_current_teacher_uploads() {
  try {
    const response = await fetch(URLS.get_current_teacher_uploads, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_current_teacher_behaviour_reports() {
  try {
    const response = await fetch(URLS.get_current_teacher_behaviour_reports, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function current_teacher_school_modules() {
  try {
    const response = await fetch(URLS.current_teacher_school_modules, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
//! Patch Student
async function patch_student(
  id: string,
  payload: PatchStudentPayload,
  csrf_token: string
) {
  const PATCH_URL = URLS.patch_student + id + "/";
  try {
    const response = await fetch(PATCH_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf_token,
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

// ! Create absence
async function post_absence(payload: PostAbsencePayload, csrf_token: string) {
  try {
    const response = await fetch(URLS.post_absence, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf_token,
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

//! Create Behaviour Report :
async function post_behaviour_report(
  payload: PostBehaviourReportPayload,
  csrf_token: string
) {
  try {
    const response = await fetch(URLS.post_behaviour_report, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf_token,
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

//! Post Mark => migrated to student-grades :
async function post_mark(payload: PostMarkPayload, csrfToken: string) {
  try {
    const response = await fetch(URLS.post_mark, {
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
async function post_grades(
  payload: PostStudentGradesPayload,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.post_grades, {
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
async function patch_grades(
  id: number,
  payload: PatchStudentPayload,
  csrfToken: string
) {
  const PATCH_GRADE_URL = URLS.patch_grades + id + "/";
  try {
    const response = await fetch(PATCH_GRADE_URL, {
      method: "PATCH",
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

//! Create  Teacher Upload :
async function create_teacher_upload(formData: FormData, csrfToken: string) {
  try {
    const response = await fetch(URLS.create_teacher_upload, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
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

//! Delete  Teacher Upload :
async function delete_teacher_upload(id: number, csrfToken: string) {
  const DELETE_URL = URLS.delete_teacher_upload + id + "/";
  try {
    const response = await fetch(DELETE_URL, {
      method: "DELETE",
      headers: {
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
export const teacher_dashboard_client = {
  get_current_teacher_students: get_current_teacher_students,
  get_current_teacher_modules_and_class_groups:
    get_current_teacher_modules_and_class_groups,
  get_current_teacher_uploads: get_current_teacher_uploads,
  get_current_teacher_behaviour_reports: get_current_teacher_behaviour_reports,
  current_teacher_school_modules: current_teacher_school_modules,
  current_teacher_students_grades: current_teacher_students_grades,

  patch_student: patch_student,

  post_absence: post_absence,

  post_behaviour_report: post_behaviour_report,

  post_mark: post_mark,
  post_grades: post_grades,
  patch_grades: patch_grades,

  create_teacher_upload: create_teacher_upload,
  delete_teacher_upload: delete_teacher_upload,
};
