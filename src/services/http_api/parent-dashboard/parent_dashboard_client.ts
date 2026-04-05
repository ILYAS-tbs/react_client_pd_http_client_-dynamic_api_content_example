import { PostAbsenceReportPayload } from "../payloads_types/parent_client_payload_types";
import { SERVER_BASE_URL } from "../server_constants";
import { StudentPerformance } from "../../../models/StudentPerformance";
import { Student } from "../../../models/Student";
import { AbsenceReport } from "../../../models/AbsenceReports";
import { BehaviourReport } from "../../../models/BehaviorReport";
import { MonthlyEvaluation } from "../../../models/MonthlyEvaluation";
import { TeacherUpload } from "../../../models/TeacherUpload";
import { ParentAbsence } from "../../../models/ParentAbsence";
import { ParentStudentEvent } from "../../../models/ParentStudentEvent";

type ApiOk<T> = { ok: true; status: number; data: T };
type ApiError = { ok: false; error: unknown };
type ApiResult<T> = ApiOk<T> | ApiError;

const BASE_URL = SERVER_BASE_URL;
const URLS = {
  get_current_parent_students: `${BASE_URL}/parent/parents/get_current_parent_students/`,
  get_current_parent_absence_reports: `${BASE_URL}/parent/parents/get_current_parent_absence_reports/`,
  get_current_parent_behaviour_reports: `${BASE_URL}/parent/parents/get_current_parent_behaviour_reports/`,
  get_current_parent_monthly_evaluations: `${BASE_URL}/student/monthly-evaluations/`,
  get_current_parent_all_students_uploads: `${BASE_URL}/parent/parents/get_current_parent_all_students_uploads/`,
  current_parent_students_absences: `${BASE_URL}/parent/parents/current_parent_students_absences/`,
  get_current_parent_students_performances: `${BASE_URL}/parent/parents/get_current_parent_students_performances/`,
  get_parent_class_groups: `${BASE_URL}/parent/parents/get_parent_class_groups/`,
  post_absence_report: `${BASE_URL}/school/absence-reports/`,
  parent_students_events: `${BASE_URL}/parent/parents/parent_students_events/`,
};

async function get_current_parent_students(): Promise<ApiResult<Student[]>> {
  try {
    const response = await fetch(URLS.get_current_parent_students, {
      method: "GET",
      credentials: "include",
    });
    const data: Student[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function get_current_parent_absence_reports(): Promise<ApiResult<AbsenceReport[]>> {
  try {
    const response = await fetch(URLS.get_current_parent_absence_reports, {
      method: "GET",
      credentials: "include",
    });
    const data: AbsenceReport[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}
async function get_current_parent_behaviour_reports(): Promise<ApiResult<BehaviourReport[]>> {
  try {
    const response = await fetch(URLS.get_current_parent_behaviour_reports, {
      method: "GET",
      credentials: "include",
    });
    const data: BehaviourReport[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}
async function get_current_parent_monthly_evaluations(): Promise<ApiResult<MonthlyEvaluation[]>> {
  try {
    const response = await fetch(URLS.get_current_parent_monthly_evaluations, {
      method: "GET",
      credentials: "include",
    });
    const data: MonthlyEvaluation[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}
async function get_current_parent_all_students_uploads(): Promise<ApiResult<TeacherUpload[]>> {
  try {
    const response = await fetch(URLS.get_current_parent_all_students_uploads, {
      method: "GET",
      credentials: "include",
    });
    const data: TeacherUpload[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}
async function current_parent_students_absences(): Promise<ApiResult<ParentAbsence[]>> {
  try {
    const response = await fetch(URLS.current_parent_students_absences, {
      method: "GET",
      credentials: "include",
    });
    const data: ParentAbsence[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function get_current_parent_students_performances(): Promise<ApiResult<StudentPerformance[]>> {
  try {
    const response = await fetch(
      URLS.get_current_parent_students_performances,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data: StudentPerformance[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}
async function parent_students_events(): Promise<ApiResult<ParentStudentEvent[]>> {
  try {
    const response = await fetch(URLS.parent_students_events, {
      method: "GET",
      credentials: "include",
    });
    const data: ParentStudentEvent[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function get_parent_class_groups(): Promise<ApiResult<unknown[]>> {
  try {
    const response = await fetch(URLS.get_parent_class_groups, {
      method: "GET",
      credentials: "include",
    });
    const data: unknown[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
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
  get_current_parent_monthly_evaluations: get_current_parent_monthly_evaluations,
  get_current_parent_all_students_uploads:
    get_current_parent_all_students_uploads,
  current_parent_students_absences: current_parent_students_absences,
  parent_students_events: parent_students_events,
  get_parent_class_groups: get_parent_class_groups,

  get_current_parent_students_performances:
    get_current_parent_students_performances,

  post_absence_report: post_absence_report,
};
