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
  RegisterParentPayload,
  RegisterSchoolPayload,
  SignupPayload,
} from "../services/http_api/payloads_types/school_client_payload_types";
import { BackendUser } from "../models/BackendUser";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "school" | "teacher" | "parent";
  schoolId?: string;
  schoolType?: "public" | "private";
}
interface LoginResponse {
  ok: boolean;
  status: number | undefined;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    role: string
  ) => Promise<LoginResponse>;
  register: (userData: any, isCreatingSchool: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;

  // just to change the role again after login,
  change_role: (role: "school" | "teacher" | "parent") => void;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem(
      "schoolParentOrTeacherManagementUser"
    );
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    setIsLoading(true);

    // Mock authentication - in production, this would be an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    //!1. Real login
    const latest_csrf = getCSRFToken()!;
    const login_payload: LoginPayload = {
      username: email,
      password: password,
      email: email,
    };
    const result = await auth_http_client.login(login_payload, latest_csrf);

    if (!result.ok) {
      console.log("RESPONSE NOT OK");
      return { ok: false, status: result.status };
    }
    console.log("Login Succeful");
    console.log(result.data);

    const backend_user: BackendUser = result.data;
    console.log(`backend user${JSON.stringify(backend_user)}`);

    //! API CALL 2 :  Get the user Role
    const role_data = await auth_http_client.get_role();
    const role_from_server = role_data.role; // actual role from server

    change_role(role_from_server); // auth context rule

    const newUser: User = {
      id: backend_user?.data.user.id.toString() ?? "-1",
      name: backend_user.data.user.username,
      email: backend_user.data.user.email || "NO EMAIL!",
      role: role_from_server as "school" | "teacher" | "parent",
      // schoolId: role_from_server !== "school" ? "school-1" : undefined,
      // schoolType: role_from_server === "school" ? "private" : undefined,
    };

    console.log(`user`);
    console.log(newUser);

    setUser(newUser);
    localStorage.setItem(
      "schoolParentOrTeacherManagementUser",
      JSON.stringify(newUser)
    );
    setIsLoading(false);

    return { ok: result.ok, status: result.status, user: newUser };
  };

  function change_role(role: "school" | "teacher" | "parent") {
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
          : "Fatima Bourahla",
      email: user.email || "NO EMAIL!",
      role: role as "school" | "teacher" | "parent",
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
    userData: any,
    isCreatingSchool: boolean
  ): Promise<boolean> => {
    setIsLoading(true);

    // Mock registration
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      schoolId: userData.schoolId,
      schoolType: userData.schoolType,
    };

    // Real registry :
    const user_payload: SignupPayload = {
      email: userData.email,
      phone: userData.phone,
      username: userData.email,
      password: userData.password,
    };

    //? call01 : userCreation ()
    // CSRF token
    let latest_csrf = getCSRFToken()!;
    const result = await auth_http_client.signup(user_payload, latest_csrf);
    
    //? call02 School or parent linking with him
    // CSRF token
    latest_csrf = getCSRFToken()!;

    //* Migrated to :: "verify email" & store in LC
    localStorage.setItem("user_data",JSON.stringify(userData))
    // if (isCreatingSchool) {
    //   const school_payload: RegisterSchoolPayload = {
    //     school_name: userData.name,
    //     email: userData.email,
    //     phone_number: userData.phone,
    //     school_level: userData.school_level,
    //     website: "",
    //     address: "",
    //     wilaya: "",
    //     commun: "",
    //     school_type: "",
    //     established_year: 0,
    //     description: "",
    //   };

    //   const school_result = await auth_http_client.register_school(
    //     school_payload,
    //     latest_csrf
    //   );
    // } else {
    //   const parent_payload: RegisterParentPayload = {
    //     full_name: userData.email,
    //     phone_number: userData.phone,
    //     address: "",
    //     relationship_to_student: "",
    //   };

    //   const parent_result = await auth_http_client.register_parent(
    //     parent_payload,
    //     latest_csrf
    //   );
    // }
    setUser(newUser);
    localStorage.setItem(
      "schoolParentOrTeacherManagementUser",
      JSON.stringify(newUser)
    );
    setIsLoading(false);
    return true;
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

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading, change_role }}
    >
      {children}
    </AuthContext.Provider>
  );
};
