import { SERVER_BASE_URL } from "../http_api/server_constants";
import { PrivateConversationIDPayload } from "./chat_http_payload_types";

const URLS = {
  get_current_parent_schools_teachers: `${SERVER_BASE_URL}/parent/parents/get_current_parent_schools_teachers/`,
  get_conversation_id: `${SERVER_BASE_URL}/chat/get_conversation_id/`,
};

async function get_current_parent_schools_teachers() {
  try {
    const response = await fetch(URLS.get_current_parent_schools_teachers, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

async function get_conversation_id(
  payload: PrivateConversationIDPayload,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.get_conversation_id, {
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

export const chat_http_client = {
  get_current_parent_schools_teachers: get_current_parent_schools_teachers,

  get_conversation_id: get_conversation_id,
};
