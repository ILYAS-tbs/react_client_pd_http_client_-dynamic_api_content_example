import {
  AttendanceAbsence,
  AttendanceFilters,
  MarkAttendancePayload,
  QuickMarkAbsencePayload,
  ReviewJustificationPayload,
  SubmitJustificationPayload,
} from "../../../models/Attendance";
import { SERVER_BASE_URL } from "../server_constants";

const BASE_URL = SERVER_BASE_URL;

type ApiResponse<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status?: number; error: unknown; data?: unknown };

function buildQuery(filters: AttendanceFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function listAbsences(
  filters: AttendanceFilters = {}
): Promise<ApiResponse<AttendanceAbsence[]>> {
  try {
    const response = await fetch(
      `${BASE_URL}/attendance/absences/${buildQuery(filters)}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data: AttendanceAbsence[] = await response.json();
    if (!response.ok) return { ok: false, status: response.status, error: data };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function markAbsences(
  absences: MarkAttendancePayload[] | MarkAttendancePayload,
  csrfToken: string
): Promise<ApiResponse<AttendanceAbsence[]>> {
  try {
    const response = await fetch(`${BASE_URL}/attendance/absence/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(absences),
    });
    const data = await response.json();
    if (!response.ok) return { ok: false, status: response.status, error: data };
    return { ok: true, status: response.status, data: Array.isArray(data) ? data : [data] };
  } catch (error) {
    return { ok: false, error };
  }
}

async function deleteAbsence(
  absenceId: string,
  reason: string,
  csrfToken: string
): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${BASE_URL}/attendance/absence/${absenceId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { ok: false, status: response.status, error: errorData };
    }
    return { ok: true, status: response.status, data: null };
  } catch (error) {
    return { ok: false, error };
  }
}

async function updateAbsence(
  absenceId: string,
  payload: Partial<MarkAttendancePayload>,
  csrfToken: string
): Promise<ApiResponse<AttendanceAbsence>> {
  try {
    const response = await fetch(`${BASE_URL}/attendance/absence/${absenceId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return { ok: false, status: response.status, error: data };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function quickMarkAbsence(
  payload: QuickMarkAbsencePayload,
  csrfToken: string
): Promise<ApiResponse<AttendanceAbsence>> {
  try {
    const response = await fetch(`${BASE_URL}/school/absences/quick-mark/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, status: response.status, error: data };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function submitJustification(
  payload: SubmitJustificationPayload,
  csrfToken: string
): Promise<ApiResponse<unknown>> {
  const formData = new FormData();
  formData.append("absence_id", payload.absence_id);
  formData.append("comment", payload.comment);
  if (payload.file) formData.append("file", payload.file);

  try {
    const response = await fetch(`${BASE_URL}/attendance/justification/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) return { ok: false, status: response.status, error: data };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function reviewJustification(
  justificationId: number,
  payload: ReviewJustificationPayload,
  csrfToken: string
): Promise<ApiResponse<unknown>> {
  try {
    const response = await fetch(
      `${BASE_URL}/attendance/justification/${justificationId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    if (!response.ok) return { ok: false, status: response.status, error: data };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

export const attendance_client = {
  listAbsences,
  markAbsences,
  quickMarkAbsence,
  deleteAbsence,
  updateAbsence,
  submitJustification,
  reviewJustification,
};