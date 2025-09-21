import { PostAbsenceReportPayload } from "../payloads_types/parent_client_payload_types";
import { SERVER_BASE_URL } from "../server_constants";

const BASE_URL = SERVER_BASE_URL;
const URLS = {
  get_current_parent_students: `${BASE_URL}/parent/parents/get_current_parent_students/`,
  get_current_parent_absence_reports: `${BASE_URL}/parent/parents/get_current_parent_absence_reports/`,
  get_current_parent_behaviour_reports: `${BASE_URL}/parent/parents/get_current_parent_behaviour_reports/`,
  get_current_parent_all_students_uploads: `${BASE_URL}/parent/parents/get_current_parent_all_students_uploads/`,
  current_parent_students_absences: `${BASE_URL}/parent/parents/current_parent_students_absences/`,
  get_current_parent_students_performances: `${BASE_URL}/parent/parents/get_current_parent_students_performances/`,
  get_parent_class_groups: `${BASE_URL}/parent/parents/get_parent_class_groups/`,
  post_absence_report: `${BASE_URL}/school/absence-reports/`,
  parent_students_events: `${BASE_URL}/parent/parents/parent_students_events/`,
};

async function get_current_parent_students() {
  try {
    const response = await fetch(URLS.get_current_parent_students, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_current_parent_absence_reports() {
  try {
    const response = await fetch(URLS.get_current_parent_absence_reports, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function get_current_parent_behaviour_reports() {
  try {
    const response = await fetch(URLS.get_current_parent_behaviour_reports, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function get_current_parent_all_students_uploads() {
  try {
    const response = await fetch(URLS.get_current_parent_all_students_uploads, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function current_parent_students_absences() {
  try {
    const response = await fetch(URLS.current_parent_students_absences, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_current_parent_students_performances() {
  try {
    const response = await fetch(
      URLS.get_current_parent_students_performances,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function parent_students_events() {
  try {
    const response = await fetch(URLS.parent_students_events, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_parent_class_groups() {
  try {
    const response = await fetch(URLS.get_parent_class_groups, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}
async function post_absence_report(
  payload: PostAbsenceReportPayload,
  csrf_token: string
) {
  const formData: FormData = new FormData();
  formData.append("absence_date", payload.absence_date);
  formData.append("absence_reason", payload.absence_reason);
  formData.append("more_details", payload.more_details);
  formData.append("is_urgent", String(payload.is_urgent));
  formData.append("student_id", payload.student_id);

  if (payload.proof_document) {
    formData.append("proof_document", payload.proof_document);
  }

  try {
    const response = await fetch(URLS.post_absence_report, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrf_token,
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
export const parent_dashboard_client = {
  get_current_parent_students: get_current_parent_students,
  get_current_parent_absence_reports: get_current_parent_absence_reports,
  get_current_parent_behaviour_reports: get_current_parent_behaviour_reports,
  get_current_parent_all_students_uploads:
    get_current_parent_all_students_uploads,
  current_parent_students_absences: current_parent_students_absences,
  parent_students_events: parent_students_events,
  get_parent_class_groups: get_parent_class_groups,

  get_current_parent_students_performances:
    get_current_parent_students_performances,

  post_absence_report: post_absence_report,
};
