const BASE_URL = "http://127.0.0.1:8000";

const URLS = {
  get_current_parent_students: `${BASE_URL}/parent/parents/get_current_parent_students/`,
  get_current_parent_absence_reports: `${BASE_URL}/parent/parents/get_current_parent_absence_reports/`,
  get_current_parent_behaviour_reports: `${BASE_URL}/parent/parents/get_current_parent_behaviour_reports/`,
  get_current_parent_all_students_uploads: `${BASE_URL}/parent/parents/get_current_parent_all_students_uploads/`,
  current_parent_students_absences: `${BASE_URL}/parent/parents/current_parent_students_absences/`,
  get_current_parent_students_performances: `${BASE_URL}/parent/parents/get_current_parent_students_performances/`,
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

export const parent_dashboard_client = {
  get_current_parent_students: get_current_parent_students,
  get_current_parent_absence_reports: get_current_parent_absence_reports,
  get_current_parent_behaviour_reports: get_current_parent_behaviour_reports,
  get_current_parent_all_students_uploads:
    get_current_parent_all_students_uploads,
  current_parent_students_absences: current_parent_students_absences,

  get_current_parent_students_performances:
    get_current_parent_students_performances,
};
