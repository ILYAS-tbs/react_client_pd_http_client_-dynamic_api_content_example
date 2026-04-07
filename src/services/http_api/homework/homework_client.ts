import { SERVER_BASE_URL } from "../server_constants";
import {
  Homework,
  HomeworkSubmission,
  HomeworkStats,
  StudentHomeworkGroup,
} from "../../../models/Homework";

type ApiOk<T> = { ok: true; status: number; data: T };
type ApiError = { ok: false; error: unknown };
type ApiResult<T> = ApiOk<T> | ApiError;

const BASE_URL = SERVER_BASE_URL;
const HW_BASE = `${BASE_URL}/homework`;

async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { credentials: "include", ...options });
    const data: T = await res.json();
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, status: res.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() ?? null;
  return null;
}

// ─── Teacher endpoints ────────────────────────────────────────────────────────

export async function getTeacherHomeworks(
  classGroupId?: string
): Promise<ApiResult<Homework[]>> {
  const url = classGroupId
    ? `${HW_BASE}/homeworks/?class_group=${classGroupId}`
    : `${HW_BASE}/homeworks/`;
  return apiFetch<Homework[]>(url);
}

export async function createHomework(
  payload: FormData
): Promise<ApiResult<Homework>> {
  return apiFetch<Homework>(`${HW_BASE}/homeworks/`, {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") ?? "" },
    body: payload,
  });
}

export async function updateHomework(
  id: string,
  payload: FormData
): Promise<ApiResult<Homework>> {
  return apiFetch<Homework>(`${HW_BASE}/homeworks/${id}/`, {
    method: "PATCH",
    headers: { "X-CSRFToken": getCookie("csrftoken") ?? "" },
    body: payload,
  });
}

export async function deleteHomework(id: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`${HW_BASE}/homeworks/${id}/`, {
    method: "DELETE",
    headers: { "X-CSRFToken": getCookie("csrftoken") ?? "" },
  });
}

export async function getHomeworkSubmissions(
  homeworkId: string
): Promise<ApiResult<HomeworkSubmission[]>> {
  return apiFetch<HomeworkSubmission[]>(
    `${HW_BASE}/homeworks/${homeworkId}/submissions/`
  );
}

export async function gradeSubmission(
  homeworkId: string,
  submissionId: string,
  payload: { mark: number; remarks?: string }
): Promise<ApiResult<HomeworkSubmission>> {
  return apiFetch<HomeworkSubmission>(
    `${HW_BASE}/homeworks/${homeworkId}/grade/${submissionId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken") ?? "",
      },
      body: JSON.stringify(payload),
    }
  );
}

export async function getHomeworkStats(
  homeworkId: string
): Promise<ApiResult<HomeworkStats>> {
  return apiFetch<HomeworkStats>(
    `${HW_BASE}/homeworks/${homeworkId}/stats/`
  );
}

// ─── Parent endpoints ─────────────────────────────────────────────────────────

export async function getParentHomeworksByStudent(): Promise<
  ApiResult<StudentHomeworkGroup[]>
> {
  return apiFetch<StudentHomeworkGroup[]>(
    `${HW_BASE}/parent-homeworks/by-student/`
  );
}

export const homework_client = {
  getTeacherHomeworks,
  createHomework,
  updateHomework,
  deleteHomework,
  getHomeworkSubmissions,
  gradeSubmission,
  getHomeworkStats,
  getParentHomeworksByStudent,
};
