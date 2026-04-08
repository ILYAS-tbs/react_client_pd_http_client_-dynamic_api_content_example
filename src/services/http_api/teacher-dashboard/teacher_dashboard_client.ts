import {
  BatchPatchStudentGradesSectionPayload,
  BatchPatchMonthlyEvaluationPayload,
  PatchMonthlyEvaluationPayload,
  PatchStudentPayload,
  PostMonthlyEvaluationPayload,
  PostAbsencePayload,
  PostBehaviourReportPayload,
  PostMarkPayload,
  PostStudentGradesPayload,
  TeacherStudentGradesFilters,
  TeacherMonthlyEvaluationFilters,
} from "../payloads_types/teacher_client_payload_types";
import { TeacherDashboardStats } from "../../../models/TeacherDashboardStats";
import { TeacherMonthlyEvaluationGridResponse } from "../../../models/MonthlyEvaluation";
import { TeacherStudentGradesGridResponse } from "../../../models/StudentGrade";
import { SERVER_BASE_URL } from "../server_constants";

const BASE_URL = SERVER_BASE_URL;
const URLS = {
  get_teacher_by_id:`${BASE_URL}/teacher/teachers/`,
  get_current_teacher_students: `${BASE_URL}/teacher/teachers/get_current_teacher_students/`,
  get_current_teacher_stats: `${BASE_URL}/teacher/teachers/get_current_teacher_stats/`,
  get_current_teacher_modules_and_class_groups: `${BASE_URL}/teacher/teachers/get_current_teacher_modules_and_class_groups/`,
  get_current_teacher_uploads: `${BASE_URL}/teacher/teachers/get_current_teacher_uploads/`,
  get_current_teacher_behaviour_reports: `${BASE_URL}/teacher/teachers/get_current_teacher_behaviour_reports/`,
  current_teacher_school_modules: `${BASE_URL}/teacher/teachers/current_teacher_school_modules/`,
  current_teacher_students_grades: `${BASE_URL}/teacher/teachers/current_teacher_students_grades/`,
  get_current_teacher_schedules: `${BASE_URL}/teacher/teachers/get_current_teacher_schedules/`,
  get_monthly_evaluations: `${BASE_URL}/student/monthly-evaluations/`,
  student_monthly_evaluations: `${BASE_URL}/student/students/`,
  get_grading_formula: `${BASE_URL}/teacher/grading-formulas/get_formula/`,
  save_grading_formula: `${BASE_URL}/teacher/grading-formulas/save_formula/`,
  recalculate_all_averages: `${BASE_URL}/teacher/grading-formulas/recalculate_all_averages/`,
  patch_student: `${BASE_URL}/student/students/`,

  post_absence: `${BASE_URL}/class-group/absences/`,

  post_behaviour_report: `${BASE_URL}/school/behaviour-reports/`,

  post_mark: `${BASE_URL}/teacher/marks/`,
  post_grades: `${BASE_URL}/teacher/student-grades/`,
  patch_grades: `${BASE_URL}/teacher/student-grades/`,
  get_grade_grid: `${BASE_URL}/teacher/student-grades/grid/`,
  batch_patch_grade_section: `${BASE_URL}/teacher/student-grades/batch-section/`,
  calculate_average: `${BASE_URL}/teacher/student-grades/`,
  calculate_batch_averages: `${BASE_URL}/teacher/student-grades/calculate_batch_averages/`,
  get_student_averages: `${BASE_URL}/teacher/student-grades/get_student_averages/`,

  create_teacher_upload: `${BASE_URL}/teacher/teacher-uploads/create_teacher_upload/`,
  delete_teacher_upload: `${BASE_URL}/teacher/teacher-uploads/`,
};

async function get_teacher_by_id(id:number) {
  const GET_TEACHER_URL = URLS.get_teacher_by_id + id + '/'
  try {
    const response = await fetch(GET_TEACHER_URL, {
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

async function get_current_teacher_stats() {
  try {
    const response = await fetch(URLS.get_current_teacher_stats, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data: TeacherDashboardStats = await response.json();
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

async function get_grade_grid(filters: TeacherStudentGradesFilters) {
  const params = new URLSearchParams({
    class_group_id: filters.class_group_id,
    module_id: filters.module_id,
    semester: filters.semester,
  });

  try {
    const response = await fetch(`${URLS.get_grade_grid}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data: TeacherStudentGradesGridResponse = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function get_monthly_evaluations() {
  try {
    const response = await fetch(URLS.get_monthly_evaluations, {
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

async function get_student_monthly_evaluations(studentId: string) {
  const GET_URL = `${URLS.student_monthly_evaluations}${studentId}/monthly-evaluations/`;
  try {
    const response = await fetch(GET_URL, {
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

async function get_filtered_monthly_evaluations(
  filters: TeacherMonthlyEvaluationFilters
) {
  const params = new URLSearchParams({
    class_group_id: filters.class_group_id,
    module_id: filters.module_id,
    month: filters.month,
  });

  try {
    const response = await fetch(`${URLS.get_monthly_evaluations}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data: TeacherMonthlyEvaluationGridResponse = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
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

async function mark_student_absent_today(
  studentId: string,
  teacherId: number,
  csrfToken: string
) {
  const patchResult = await patch_student(
    studentId,
    { is_absent: true },
    csrfToken
  );

  if (!patchResult.ok) {
    return patchResult;
  }

  return post_absence(
    {
      student_id: studentId,
      teacher_id: teacherId,
    },
    csrfToken
  );
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

function buildMonthlyEvaluationFormData(
  payload: PostMonthlyEvaluationPayload | PatchMonthlyEvaluationPayload
) {
  const formData = new FormData();
  const entries: Array<[string, string | File]> = [];

  if (payload.month) entries.push(["month", payload.month]);
  if (payload.title) entries.push(["title", payload.title]);
  if (payload.description) entries.push(["description", payload.description]);
  if (payload.remarks) entries.push(["remarks", payload.remarks]);
  if (payload.student_id) entries.push(["student_id", payload.student_id]);
  if (payload.module_id) entries.push(["module_id", payload.module_id]);
  if (payload.class_group_id) entries.push(["class_group_id", payload.class_group_id]);

  if (payload.mark_of_participation_in_class !== undefined && payload.mark_of_participation_in_class !== null) {
    entries.push(["mark_of_participation_in_class", String(payload.mark_of_participation_in_class)]);
  }
  if (payload.homeworks_mark !== undefined && payload.homeworks_mark !== null) {
    entries.push(["homeworks_mark", String(payload.homeworks_mark)]);
  }
  if (payload.attachment) entries.push(["attachment", payload.attachment]);

  entries.forEach(([key, value]) => formData.append(key, value));
  return formData;
}

async function post_monthly_evaluation(
  studentId: string,
  payload: PostMonthlyEvaluationPayload,
  csrfToken: string
) {
  const POST_URL = `${URLS.student_monthly_evaluations}${studentId}/monthly-evaluations/`;
  const formData = buildMonthlyEvaluationFormData(payload);
  try {
    const response = await fetch(POST_URL, {
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

async function patch_monthly_evaluation(
  id: number,
  payload: PatchMonthlyEvaluationPayload,
  csrfToken: string
) {
  const PATCH_URL = URLS.get_monthly_evaluations + id + "/";
  const formData = buildMonthlyEvaluationFormData(payload);
  try {
    const response = await fetch(PATCH_URL, {
      method: "PATCH",
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

async function batch_patch_monthly_evaluations(
  payload: BatchPatchMonthlyEvaluationPayload,
  csrfToken: string
) {
  const PATCH_URL = `${URLS.get_monthly_evaluations}batch/`;
  try {
    const response = await fetch(PATCH_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function delete_monthly_evaluation(id: number, csrfToken: string) {
  const DELETE_URL = URLS.get_monthly_evaluations + id + "/";
  try {
    const response = await fetch(DELETE_URL, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
    });

    const rawBody = await response.text();
    const data = rawBody ? JSON.parse(rawBody) : null;
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

async function batch_patch_student_grades_section(
  payload: BatchPatchStudentGradesSectionPayload,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.batch_patch_grade_section, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
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

//! Calculate Average for Single Student Grade Record :
async function calculate_average(id: number, csrfToken: string) {
  const CALCULATE_URL = URLS.calculate_average + id + "/calculate_average/";
  try {
    const response = await fetch(CALCULATE_URL, {
      method: "POST",
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

//! Calculate Batch Averages for Multiple Records :
async function calculate_batch_averages(
  csrfToken: string,
  filters?: {
    student_id?: number;
    module_id?: number;
    class_group_id?: number;
  }
) {
  let url = URLS.calculate_batch_averages;
  
  // Add query parameters if filters provided
  if (filters) {
    const params = new URLSearchParams();
    if (filters.student_id) params.append("student_id", filters.student_id.toString());
    if (filters.module_id) params.append("module_id", filters.module_id.toString());
    if (filters.class_group_id) params.append("class_group_id", filters.class_group_id.toString());
    
    if (params.toString()) {
      url += "?" + params.toString();
    }
  }
  
  try {
    const response = await fetch(url, {
      method: "POST",
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

//! Get Student Averages :
async function get_student_averages(
  studentId: number,
  moduleId?: number
) {
  let url = URLS.get_student_averages + "?student_id=" + studentId;
  
  if (moduleId) {
    url += "&module_id=" + moduleId;
  }
  
  try {
    const response = await fetch(url, {
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

//! Get Grading Formula for a Module/Class/Semester :
async function get_grading_formula(
  moduleId: string | number,
  classGroupId: string | number,
  semester: 's1' | 's2' | 's3'
) {
  let url = URLS.get_grading_formula;
  url += `?module_id=${moduleId}&class_group_id=${classGroupId}&semester=${semester}`;
  
  try {
    const response = await fetch(url, {
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

//! Save Grading Formula for a Module/Class/Semester :
async function save_grading_formula(
  payload: {
    module_id: string | number;
    class_group_id: string | number;
    semester: 's1' | 's2' | 's3';
    formula_config: Record<string, number>;
  },
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.save_grading_formula, {
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

//! Recalculate All Averages for a Module/Class/Semester :
async function recalculate_all_averages(
  payload: {
    module_id: string | number;
    class_group_id: string | number;
    semester: 's1' | 's2' | 's3';
  },
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.recalculate_all_averages, {
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

async function get_current_teacher_schedules() {
  try {
    const response = await fetch(URLS.get_current_teacher_schedules, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

export const teacher_dashboard_client = {
  get_teacher_by_id:get_teacher_by_id,
  get_current_teacher_students: get_current_teacher_students,
  get_current_teacher_stats: get_current_teacher_stats,
  get_current_teacher_modules_and_class_groups:
    get_current_teacher_modules_and_class_groups,
  get_current_teacher_uploads: get_current_teacher_uploads,
  get_current_teacher_behaviour_reports: get_current_teacher_behaviour_reports,
  current_teacher_school_modules: current_teacher_school_modules,
  current_teacher_students_grades: current_teacher_students_grades,
  get_grade_grid: get_grade_grid,
  get_monthly_evaluations: get_monthly_evaluations,
  get_student_monthly_evaluations: get_student_monthly_evaluations,
  get_filtered_monthly_evaluations: get_filtered_monthly_evaluations,

  patch_student: patch_student,
  mark_student_absent_today: mark_student_absent_today,

  post_absence: post_absence,

  post_behaviour_report: post_behaviour_report,

  post_mark: post_mark,
  post_grades: post_grades,
  post_monthly_evaluation: post_monthly_evaluation,
  patch_monthly_evaluation: patch_monthly_evaluation,
  batch_patch_monthly_evaluations: batch_patch_monthly_evaluations,
  delete_monthly_evaluation: delete_monthly_evaluation,
  patch_grades: patch_grades,
  batch_patch_student_grades_section: batch_patch_student_grades_section,
  calculate_average: calculate_average,
  calculate_batch_averages: calculate_batch_averages,
  get_student_averages: get_student_averages,
  get_grading_formula: get_grading_formula,
  save_grading_formula: save_grading_formula,
  recalculate_all_averages: recalculate_all_averages,

  create_teacher_upload: create_teacher_upload,
  delete_teacher_upload: delete_teacher_upload,
  get_current_teacher_schedules: get_current_teacher_schedules,
};
