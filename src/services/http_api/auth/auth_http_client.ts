import {
  SignupPayload,
  RegisterSchoolPayload,
  LoginPayload,
  RegisterParentPayload,
  RegisterTeacherPayload,
  VefiryEmailPayload,
} from "../payloads_types/school_client_payload_types";
import { SERVER_BASE_URL } from "../server_constants";

const URLS = {
  SESSION: `${SERVER_BASE_URL}/user-auth/_allauth/browser/v1/auth/session`,
  ROLE: `${SERVER_BASE_URL}/user-auth/get_role`,
  SIGNUP: `${SERVER_BASE_URL}/user-auth/_allauth/browser/v1/auth/signup`,
  VERIFY_EMAIL:`${SERVER_BASE_URL}/user-auth/_allauth/browser/v1/auth/email/verify`,
  
  TEACHER_SIGNUP: `${SERVER_BASE_URL}/user-auth/_allauth/app/v1/auth/signup`,
  LOGIN: `${SERVER_BASE_URL}/user-auth/_allauth/browser/v1/auth/login`,
  LOGOUT: `${SERVER_BASE_URL}/user-auth/_allauth/browser/v1/auth/session`,
  REGISTER_SCHOOL: `${SERVER_BASE_URL}/school/register-school/`,
  REGISTER_PARENT: `${SERVER_BASE_URL}/parent/register-parent/`,
  REGISTER_TEACHER: `${SERVER_BASE_URL}/teacher/register-teacher/`,
};

// will return : {"role": "parennt"|"school"|"teacher"} or {"error":"No role for this user account"}
async function get_role() {
  const response = await fetch(URLS.ROLE, {
    method: "GET",
    credentials: "include", // ensures cookies like sessionid are sent
  });
  const data = await response.json();
  return data;
}

async function signup(payload: SignupPayload, csrfToken: string) {
  if (!csrfToken) {
    throw new Error("CSRF Token is empty or null");
  }
  try {
    const response = await fetch(URLS.SIGNUP, {
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
async function verify_email(payload:VefiryEmailPayload,csrfToken:string){
  if(!csrfToken){
    throw new Error("Error No Csrf Token Passed")
  }

  try {
    const response = await fetch(URLS.VERIFY_EMAIL,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-CSRFToken":csrfToken
      },
      credentials:"include",
      body:JSON.stringify(payload)
    })

    const data = await response.json()
    return {ok:response.ok,status:response.status,data:data}

  } catch (error) {
    return {ok:false , error:error}
  }
}
async function teacher_signup(payload: SignupPayload, csrfToken: string) {
  if (!csrfToken) {
    throw new Error("CSRF Token is empty or null");
  }
  try {
    const response = await fetch(URLS.TEACHER_SIGNUP, {
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
async function login(payload: LoginPayload, csrfToken: string) {
  if (!csrfToken) {
    throw new Error("CSRF Token is empty or null");
  }

  try {
    const response = await fetch(URLS.LOGIN, {
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
    console.log(error);
    return { ok: false, error: error };
  }
}

//! Logout
async function logout(csrfToken: string) {
  if (!csrfToken) {
    throw new Error("CSRF Token is empty or null");
  }
  try {
    const response = await fetch(URLS.LOGOUT, {
      method: "DELETE",
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

//! register school :
async function register_school(
  payload: RegisterSchoolPayload,
  csrfToken: string
) {
  if (!csrfToken) {
    throw new Error("CSRF Token is empty or null");
  }
  try {
    const response = await fetch(URLS.REGISTER_SCHOOL, {
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

//! register Parent :
async function register_parent(
  payload: RegisterParentPayload,
  csrfToken: string
) {
  if (!csrfToken) {
    throw new Error("CSRF Token is empty or null");
  }
  try {
    const response = await fetch(URLS.REGISTER_PARENT, {
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

//! register Teacehr :
async function register_Teacher(
  payload: RegisterTeacherPayload,
  csrfToken: string
) {
  if (!csrfToken) {
    throw new Error("CSRF Token is empty or null");
  }
  try {
    const response = await fetch(URLS.REGISTER_TEACHER, {
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
export const auth_http_client = {
  signup: signup,
  verify_email:verify_email,
  teacher_signup: teacher_signup,
  login: login,
  logout: logout,
  register_school: register_school,
  register_parent: register_parent,
  register_Teacher: register_Teacher,
  get_role: get_role,
};
