import { SERVER_BASE_URL } from "../http_api/server_constants";
import {
  GetConvesationMessagesPayload,
  PrivateConversationIDPayload,
} from "./chat_http_payload_types";

export const WEBSOCKET_BASEURL = "ws://127.0.0.1:8000";
const URLS = {
  get_current_parent_schools_teachers: `${SERVER_BASE_URL}/parent/parents/get_current_parent_schools_teachers/`,
  get_conversation_id: `${SERVER_BASE_URL}/chat/get_conversation_id/`,
  get_conversation_messages: `${SERVER_BASE_URL}/chat/get_conversation_messages/`,
  get_current_teacher_school_parents: `${SERVER_BASE_URL}/teacher/teachers/get_current_teacher_school_parents/`,
};
//! used by the parent dashboard/chat
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
//! used by the teacherDashboard/chat
async function get_current_teacher_school_parents() {
  try {
    const response = await fetch(URLS.get_current_teacher_school_parents, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

// ? both parenDashboard/chat and teacherDashboard/chat use
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
async function get_conversation_messages(
  payload: GetConvesationMessagesPayload,
  csrfToken: string
) {
  try {
    const response = await fetch(URLS.get_conversation_messages, {
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

  get_current_teacher_school_parents: get_current_teacher_school_parents,

  get_conversation_id: get_conversation_id,
  get_conversation_messages: get_conversation_messages,
};
