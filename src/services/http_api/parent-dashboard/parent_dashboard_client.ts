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
import { ExamSchedule } from "../../../models/ExamSchedule";
import { ParentWeeklyMeal } from "../../../models/WeeklyMeal";
import { ParentReadOnlyGradesResponse } from "../../../models/StudentGrade";

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
  get_current_parent_grade_sections: `${BASE_URL}/parent/parents/get_current_parent_grade_sections/`,
  get_parent_class_groups: `${BASE_URL}/parent/parents/get_parent_class_groups/`,
  post_absence_report: `${BASE_URL}/school/absence-reports/`,
  parent_students_events: `${BASE_URL}/parent/parents/parent_students_events/`,
  get_current_parent_schedules: `${BASE_URL}/parent/parents/get_current_parent_schedules/`,
  get_current_parent_exam_schedules: `${BASE_URL}/parent/parents/get_current_parent_exam_schedules/`,
  get_current_parent_weekly_meals: `${BASE_URL}/parent/weekly-meals/`,
};

function withStudentId(url: string, studentId?: string | null): string {
  if (!studentId) return url;
  const params = new URLSearchParams({ student_id: studentId });
  return `${url}?${params.toString()}`;
}

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
async function get_current_parent_monthly_evaluations(studentId: string): Promise<ApiResult<MonthlyEvaluation[]>> {
  try {
    const response = await fetch(withStudentId(URLS.get_current_parent_monthly_evaluations, studentId), {
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
async function get_current_parent_all_students_uploads(studentId: string): Promise<ApiResult<TeacherUpload[]>> {
  try {
    const response = await fetch(withStudentId(URLS.get_current_parent_all_students_uploads, studentId), {
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
async function current_parent_students_absences(studentId: string): Promise<ApiResult<ParentAbsence[]>> {
  try {
    const response = await fetch(withStudentId(URLS.current_parent_students_absences, studentId), {
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

async function get_current_parent_students_performances(studentId: string): Promise<ApiResult<StudentPerformance[]>> {
  try {
    const response = await fetch(
      withStudentId(URLS.get_current_parent_students_performances, studentId),
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

async function get_current_parent_grade_sections(
  studentId: string,
  semester: "s1" | "s2" | "s3",
  moduleId?: string
): Promise<ApiResult<ParentReadOnlyGradesResponse>> {
  try {
    const params = new URLSearchParams({
      student_id: studentId,
      semester,
    });
    if (moduleId) {
      params.set("module_id", moduleId);
    }

    const response = await fetch(
      `${URLS.get_current_parent_grade_sections}?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data: ParentReadOnlyGradesResponse = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}
async function parent_students_events(studentId: string): Promise<ApiResult<ParentStudentEvent[]>> {
  try {
    const response = await fetch(withStudentId(URLS.parent_students_events, studentId), {
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
import { Schedule } from "../../../models/Schedule";

async function get_current_parent_schedules(studentId: string): Promise<ApiResult<Schedule[]>> {
  try {
    const response = await fetch(withStudentId(URLS.get_current_parent_schedules, studentId), {
      method: "GET",
      credentials: "include",
    });
    const data: Schedule[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function get_current_parent_exam_schedules(): Promise<ApiResult<ExamSchedule[]>> {
  try {
    const response = await fetch(URLS.get_current_parent_exam_schedules, {
      method: "GET",
      credentials: "include",
    });
    const data: ExamSchedule[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function get_current_parent_weekly_meals(): Promise<ApiResult<ParentWeeklyMeal[]>> {
  try {
    const response = await fetch(URLS.get_current_parent_weekly_meals, {
      method: "GET",
      credentials: "include",
    });
    const data: ParentWeeklyMeal[] = await response.json();
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
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
  get_current_parent_grade_sections: get_current_parent_grade_sections,

  post_absence_report: post_absence_report,
  get_current_parent_schedules: get_current_parent_schedules,
  get_current_parent_exam_schedules: get_current_parent_exam_schedules,
  get_current_parent_weekly_meals: get_current_parent_weekly_meals,
};
