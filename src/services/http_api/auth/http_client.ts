import {
  SignupPayload,
  RegisterSchoolPayload,
  LoginPayload,
} from "../http_types";

const BASE_URL = "http://127.0.0.1:8000";

const URLS = {
  SESSION: `${BASE_URL}/user-auth/_allauth/browser/v1/auth/session`,
  SIGNUP: `${BASE_URL}/user-auth/_allauth/browser/v1/auth/signup`,
  LOGIN: `${BASE_URL}/user-auth/_allauth/browser/v1/auth/login`,
  LOGOUT: `${BASE_URL}user-auth/_allauth/browser/v1/auth/session`,
  REGISTER_SCHOOL: `${BASE_URL}/api/school/register-school`,
};

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

export const http_client = {
  signup: signup,
  login: login,
  logout: logout,
  register_school: register_school,
};
