//! Endpoint that are needed by more than one dashboard
const BASE_URL = "http://127.0.0.1:8000";

const URLS = {
  absences_for_current_school_or_teacher: `${BASE_URL}/class-group/absences/absences_for_current_school_or_teacher/`,
};
//127.0.0.1:8000/class-group/absences/get_absences_by_school/?id=41962a29-7084-4b5b-84ad-8ace75dd790e
// ! Get absences for the current teacher school or the current school itself
//! called by 2 users : teacher , or school

async function absences_for_current_school_or_teacher() {
  try {
    const response = await fetch(URLS.absences_for_current_school_or_teacher, {
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

export const shared_endpoints_clinet = {
  absences_for_current_school_or_teacher:
    absences_for_current_school_or_teacher,
};
