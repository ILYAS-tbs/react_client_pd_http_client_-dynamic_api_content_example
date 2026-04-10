import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth_http_client } from "../services/http_api/auth/auth_http_client";
import { getCSRFToken } from "../lib/get_CSRFToken";
import {
  LoginPayload,
  RegisterWithRolePayload,
} from "../services/http_api/payloads_types/school_client_payload_types";
import { SERVER_BASE_URL } from "../services/http_api/server_constants";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "school" | "teacher" | "parent" | "super-admin";
  schoolId?: string;
  schoolType?: "public" | "private";
  is_admin?: boolean;
  is_verified?: boolean;
}
export interface UserData {
  commune?: string;
  confirmPassword?: string;
  email: string;
  name: string;
  numberOfChildren?: number;
  password: string;
  phone?: string;
  role?: "school" | "teacher" | "parent" | "super-admin";
  schoolType?: string;
  school_level?: string;
  wilaya?: string;
  children?: Array<{
    fullName: string;
    dateOfBirth: string;
    schoolName: string;
    grade: string;
  }>;
}
interface LoginResponse {
  ok: boolean;
  status: number | undefined;
  user?: User;
  error?: any;
  emailNotVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  login: (
    email: string,
    password: string
  ) => Promise<LoginResponse>;
  register: (userData: any, isCreatingSchool: boolean) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  refreshVerificationStatus: () => Promise<void>;

  // just to change the role again after login,
  change_role: (role: "school" | "teacher" | "parent" | "super-admin") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  //! USERDATA USED with Registrations
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hydrate user from localStorage, then verify the session is still valid.
    const savedUser = localStorage.getItem(
      "schoolParentOrTeacherManagementUser"
    );
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (error) {
        console.error("Failed to parse stored user session", error);
        localStorage.removeItem("schoolParentOrTeacherManagementUser");
      }
    }
    setIsLoading(false);
  }, []);


  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    setIsLoading(true);

    const latest_csrf = getCSRFToken()!;
    const login_payload: LoginPayload = {
      username: email,
      password: password,
      email: email,
    };
    const result = await auth_http_client.login(login_payload, latest_csrf);

    if (!result.ok) {
      setIsLoading(false);
      return { ok: false, status: result.status, error: result.data?.detail || result.error };
    }

    // Custom login endpoint returns clean JSON:
    // { id, email, username, role, is_verified }
    const loginData = result.data;

    // Check if user is an admin
    let is_admin = false;
    try {
      const admin_check = await fetch(
        `${SERVER_BASE_URL}/api/admin/overview/stats/`,
        { method: "GET", credentials: "include" }
      );
      is_admin = admin_check.ok;
    } catch { is_admin = false; }

    const newUser: User = {
      id: loginData.id?.toString() ?? "-1",
      name: loginData.username || email,
      email: loginData.email || email,
      role: loginData.role as "school" | "teacher" | "parent" | "super-admin",
      is_admin,
      is_verified: loginData.is_verified ?? false,
    };

    localStorage.setItem(
      "schoolParentOrTeacherManagementUser",
      JSON.stringify(newUser)
    );
    setUser(newUser);
    setIsLoading(false);

    return { ok: true, status: result.status, user: newUser };
  };

  function change_role(role: "school" | "teacher" | "parent" | "super-admin") {
    if (!user) return;

    console.log(`user`); // to check if it is in sync with the MockUSer
    console.log(user);

    const newUser: User = {
      id: user.id,
      name:
        role === "school"
          ? "École Primaire El-Hikmah"
          : role === "teacher"
            ? "Ahmed Benaissa"
            : role === "super-admin"
              ? "PedaConnect Admin"
              : "Fatima Bourahla",
      email: user.email || "NO EMAIL!",
      role: role as "school" | "teacher" | "parent" | "super-admin",
      is_admin: user.is_admin,
      schoolId: role !== "school" ? "school-1" : undefined,
      schoolType: role === "school" ? "private" : undefined,
    };

    setUser(newUser);
    localStorage.setItem(
      "schoolParentOrTeacherManagementUser",
      JSON.stringify(newUser)
    );
  }

  const register = async (
    userData: UserData
  ): Promise<User> => {
    setIsLoading(true);

    // Atomic signup: User + Role created in a single backend call
    const isSchool = userData.role === "school";

    const payload: RegisterWithRolePayload = {
      email: userData.email,
      password: userData.password,
      username: userData.email,
      role: isSchool ? "school" : "parent",
      // School-specific fields
      ...(isSchool
        ? {
            school_name: userData.name,
            phone_number: userData.phone ?? "",
            school_level: userData.school_level ?? "primary",
            school_type: userData.schoolType ?? "public",
            wilaya: userData.wilaya ?? "",
            commun: userData.commune ?? "",
          }
        : {
            full_name: userData.name,
            phone_number: userData.phone ?? "",
          }),
    };

    const latest_csrf = getCSRFToken()!;
    const result = await auth_http_client.register_with_role(payload, latest_csrf);

    if (!result.ok) {
      setIsLoading(false);
      throw new Error(result.data?.error || "Registration failed");
    }

    // register_with_role already called auth_login() on the backend,
    // so we have an active session. Set up frontend user state directly.
    const role = isSchool ? "school" : "parent";
    const newUser: User = {
      id: result.data?.user_id?.toString() ?? "-1",
      name: userData.name || userData.email,
      email: userData.email,
      role: role as "school" | "parent",
      is_admin: false,
      is_verified: false,
    };

    // Persist to localStorage FIRST so ProtectedRoute can hydrate
    // even if React state hasn't flushed by the time the route renders.
    localStorage.setItem(
      "schoolParentOrTeacherManagementUser",
      JSON.stringify(newUser)
    );
    setUser(newUser);
    setUserData(userData);
    setIsLoading(false);
    return newUser;
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("schoolParentOrTeacherManagementUser");

    // API CALL
    const latest_csrf = getCSRFToken()!;
    const res = await auth_http_client.logout(latest_csrf);
    console.log("logout res : ");
    console.log(res);
  };

  const refreshVerificationStatus = async () => {
    const res = await auth_http_client.get_verification_status();
    if (res.ok && res.is_verified && user) {
      const updatedUser = { ...user, is_verified: true };
      setUser(updatedUser);
      localStorage.setItem(
        "schoolParentOrTeacherManagementUser",
        JSON.stringify(updatedUser)
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userData, setUserData, login, register, logout, isLoading, change_role, refreshVerificationStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};
