import {
  AddCurrectSchoolStudentsToParent,
  AddorRemoveParentToSchoolPayload,
  FindParentByIdPayload,
  PatchAbsenceReportPayload,
  PatchEventPayload,
  PostPutClassGroupPayload as PostClassGroupPayload,
  PostEventPayload,
  PostExamSchedule,
  PostPutTeacherModuleClassGrpPayload,
  PostStudentPayload,
} from "../payloads_types/school_client_payload_types";
import { SERVER_BASE_URL } from "../server_constants";

const BASE_URL = SERVER_BASE_URL;
const URLS = {
  get_current_school_students: `${BASE_URL}/school/schools/get_current_school_students`,
  get_current_school_teachers: `${BASE_URL}/school/schools/get_current_school_teachers`,
  get_current_school_class_groups: `${BASE_URL}/school/schools/get_current_school_class_groups`,
  get_current_school_parents: `${BASE_URL}/school/schools/get_current_school_parents`,
  get_current_school_events: `${BASE_URL}/school/schools/get_current_school_events/`,
  get_current_school_exam_schedules: `${BASE_URL}/school/schools/get_current_school_exam_schedules/`,
  get_current_school_stats: `${BASE_URL}/school/schools/get_current_school_stats/`,
  get_modules: `${BASE_URL}/school/modules/`,

  patch_teacher: `${BASE_URL}/teacher/teachers/`,

  get_class_group: `${BASE_URL}/class-group/class-groups/`,
  post_class_group: `${BASE_URL}/class-group/class-groups/`,
  delete_class_group: `${BASE_URL}/class-group/class-groups/`,
  put_class_group: `${BASE_URL}/class-group/class-groups/`,

  post_student: `${BASE_URL}/student/students/`,
  put_student: `${BASE_URL}/student/students/`,
  delete_student: `${BASE_URL}/student/students/`,

  post_exam_schedule: `${BASE_URL}/school/exam-schedules/`,
  delete_exam_schedule: `${BASE_URL}/school/exam-schedules/`,

  find_parent_by_email: `${BASE_URL}/school/schools/find_parent_by_email/`,
  add_parent_to_school: `${BASE_URL}/school/schools/add_parent_to_school/`,
  add_current_school_students_to_parent: `${BASE_URL}/school/schools/add_current_school_students_to_parent/`,
  remove_parent_from_school: `${BASE_URL}/school/schools/remove_parent_from_school/`,

  get_current_school_absence_reports: `${BASE_URL}/school/absence-reports/get_current_school_absence_reports/`,
  patch_absence_report: `${BASE_URL}/school/absence-reports/`,

  get_current_school_behaviour_reports: `${BASE_URL}/school/behaviour-reports/get_current_school_behaviour_reports/`,

  create_or_update_TeacherModuleClassGroup: `${BASE_URL}/teacher/create_or_update_TeacherModuleClassGroup/`,

  post_event: `${BASE_URL}/school/events/`,
  patch_event: `${BASE_URL}/school/events/`,
  delete_event: `${BASE_URL}/school/events/`,
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

  /*
  {
  "full_name": "string",
  "phone_number": "string",
  "address": "string",
  "profile_picture": "string",
  "hire_date": "2025-09-02",
  "specialization": "string",
  "qualifications": "string",
  "years_of_experience": 9223372036854776000,
  "status": "active"
}
  */

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
//! Post Exam schedule
async function post_exam_schedule(
  payload: PostExamSchedule,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.post_exam_schedule, {
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
async function delete_exam_schedule(id: string, csrfToken: string) {
  try {
    const DELETE_URL = URLS.delete_exam_schedule + id + "/";
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

//! EVENTS :
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
async function post_event(payload: PostEventPayload, csrfToken: string) {
  try {
    const response = await fetch(URLS.post_event, {
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
async function patch_event(
  id: string,
  payload: PatchEventPayload,
  csrf_token: string
) {
  const PATCH_URL = URLS.patch_event + id + "/";
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
async function delete_event(id: string, csrfToken: string) {
  try {
    const DELETE_URL = URLS.delete_event + id + "/";
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
export async function patch_absence_report(
  id: string,
  payload: PatchAbsenceReportPayload,
  csrf_token: string
) {
  const PATCH_URL = URLS.patch_absence_report + id + "/";
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

//! fetch modules : english,arabic .. :
export async function get_modules() {
  try {
    const response = await fetch(URLS.get_modules, {
      method: "GET",
      credentials: "include", // ensures cookies like sessionid are sent
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
//! Link a teacher with ClassGroup and Module:
async function create_or_update_TeacherModuleClassGroup(
  payload: PostPutTeacherModuleClassGrpPayload,
  csrfToken: string
) {
  try {
    const response = await fetch(
      URLS.create_or_update_TeacherModuleClassGroup,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

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
  get_modules: get_modules,

  update_teacher: update_teacher,

  post_class_group: post_class_group,
  get_class_group: get_class_group,
  delete_class_group: delete_class_group,
  put_class_group: put_class_group,

  post_student: post_student,
  put_student: put_student,
  delete_student: delete_student,

  post_exam_schedule: post_exam_schedule,
  delete_exam_schedule: delete_exam_schedule,

  find_parent_by_email: find_parent_by_email,
  add_parent_to_school: add_parent_to_school,
  add_current_school_students_to_parent: add_current_school_students_to_parent,
  remove_parent_from_school: remove_parent_from_school,

  get_current_school_absence_reports: get_current_school_absence_reports,

  get_current_school_behaviour_reports: get_current_school_behaviour_reports,

  create_or_update_TeacherModuleClassGroup:
    create_or_update_TeacherModuleClassGroup,

  patch_absence_report: patch_absence_report,

  post_event: post_event,
  patch_event: patch_event,
  delete_event: delete_event,
};
