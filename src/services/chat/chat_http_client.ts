import { SERVER_BASE_URL } from "../http_api/server_constants";
import {
  GetConvesationMessagesPayload,
  PrivateConversationIDPayload,
} from "./chat_http_payload_types";


const URLS = {
  get_current_parent_schools_teachers: `${SERVER_BASE_URL}/parent/parents/get_current_parent_schools_teachers/`,
  get_conversation_id: `${SERVER_BASE_URL}/chat/get_conversation_id/`,
  get_conversation_messages: `${SERVER_BASE_URL}/chat/get_conversation_messages/`,
  get_current_teacher_school_parents: `${SERVER_BASE_URL}/teacher/teachers/get_current_teacher_school_parents/`,

  get_current_teacher_parents_chats: `${SERVER_BASE_URL}/chat/get_current_teacher_parents_chats/`,
  get_current_parent_teachers_chats: `${SERVER_BASE_URL}/chat/get_current_parent_teachers_chats/`,

  upload_chat_file: `${SERVER_BASE_URL}/chat/upload-chat-file/`,

  get_latest_five_messages:`${SERVER_BASE_URL}/chat/get_latest_five_messages/`
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

//! CHATS from the teacher dashboard : getting the school's parent's chats
async function get_current_teacher_parents_chats() {
  try {
    const response = await fetch(URLS.get_current_teacher_parents_chats, {
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
//! CHATS from the Parent dashboard : getting the school's teachers's chats
async function get_current_parent_teachers_chats() {
  try {
    const response = await fetch(URLS.get_current_parent_teachers_chats, {
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

//! get_latest_five_messages for parent or Teacher
async function get_latest_five_messages() {
  try {
    const response = await fetch(URLS.get_latest_five_messages, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json(); // Automatically parse the response data
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, error: error };
  }
}

//! FILE UPLOADS to the chat
async function upload_chat_file(formData: FormData, csrfToken: string) {
  /*
  payload : 
    file_obj = request.FILES.get('file')  
    conversation_id = request.data.get('conversation_id')
  */
  try {
    const response = await fetch(URLS.upload_chat_file, {
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
export const chat_http_client = {
  get_current_parent_schools_teachers: get_current_parent_schools_teachers,

  get_current_teacher_school_parents: get_current_teacher_school_parents,

  get_conversation_id: get_conversation_id,
  get_conversation_messages: get_conversation_messages,

  get_current_teacher_parents_chats: get_current_teacher_parents_chats,
  get_current_parent_teachers_chats: get_current_parent_teachers_chats,

  upload_chat_file: upload_chat_file,

  get_latest_five_messages:get_latest_five_messages,
};
