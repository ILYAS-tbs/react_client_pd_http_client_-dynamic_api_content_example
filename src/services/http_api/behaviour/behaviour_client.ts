import {
  BehaviourFilters,
  BehaviourNote,
  CreateBehaviourNotePayload,
} from "../../../models/BehaviourNote";
import { SERVER_BASE_URL } from "../server_constants";

const BASE_URL = SERVER_BASE_URL;

type ApiResponse<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status?: number; error: unknown };

function buildQuery(filters: BehaviourFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function listBehaviourReports(
  filters: BehaviourFilters = {}
): Promise<ApiResponse<BehaviourNote[]>> {
  try {
    const response = await fetch(
      `${BASE_URL}/behaviour/reports/${buildQuery(filters)}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data: BehaviourNote[] = await response.json();
    if (!response.ok) return { ok: false, status: response.status, error: data };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

async function createBehaviourReport(
  payload: CreateBehaviourNotePayload,
  csrfToken: string
): Promise<ApiResponse<BehaviourNote>> {
  try {
    const response = await fetch(`${BASE_URL}/behaviour/report/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data: BehaviourNote = await response.json();
    if (!response.ok) return { ok: false, status: response.status, error: data };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, error };
  }
}

export const behaviour_client = {
  listBehaviourReports,
  createBehaviourReport,
};