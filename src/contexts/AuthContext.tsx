import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { http_client } from "../services/http_api/auth/http_client";
import { getCSRFToken } from "../lib/get_CSRFToken";
import {
  LoginPayload,
  RegisterParentPayload,
  RegisterSchoolPayload,
  SignupPayload,
} from "../services/http_api/http_payload_types";

interface User {
  id: string;
  name: string;
  email: string;
  role: "school" | "teacher" | "parent";
  schoolId?: string;
  schoolType?: "public" | "private";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
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
    const savedUser = localStorage.getItem("schoolManagementUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    role: string
  ): Promise<boolean> => {
    setIsLoading(true);

    // Mock authentication - in production, this would be an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Real login
    const latest_csrf = getCSRFToken()!;
    const login_payload: LoginPayload = {
      username: email,
      password: password,
      email: email,
    };
    const result = await http_client.login(login_payload, latest_csrf);
    if (result.ok) {
      console.log("Login Succeful");
      console.log(result.data);
    }

    const mockUser: User = {
      id: "1",
      name:
        role === "school"
          ? "École Primaire El-Hikmah"
          : role === "teacher"
          ? "Ahmed Benaissa"
          : "Fatima Bourahla",
      email,
      role: role as "school" | "teacher" | "parent",
      schoolId: role !== "school" ? "school-1" : undefined,
      schoolType: role === "school" ? "private" : undefined,
    };

    setUser(mockUser);
    localStorage.setItem("schoolManagementUser", JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };
  function change_role(role: "school" | "teacher" | "parent") {
    if (!user) return;
    const newUser: User = {
      id: "1",
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
    localStorage.setItem("schoolManagementUser", JSON.stringify(newUser));
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

    // call01 : userCreation ()
    // CSRF token
    let latest_csrf = getCSRFToken()!;
    const result = await http_client.signup(user_payload, latest_csrf);
    // call02 School or parent linking with him
    // CSRF token
    latest_csrf = getCSRFToken()!;

    if (isCreatingSchool) {
      const school_payload: RegisterSchoolPayload = {
        school_name: userData.name,
        email: userData.email,
        phone_number: userData.phone,
        website: "",
        address: "",
        wilaya: "",
        commun: "",
        school_type: "",
        established_year: 0,
        description: "",
      };

      const school_result = await http_client.register_school(
        school_payload,
        latest_csrf
      );
    } else {
      const parent_payload: RegisterParentPayload = {
        full_name: userData.email,
        phone_number: userData.phone,
        address: "",
        relationship_to_student: "",
      };

      const parent_result = await http_client.register_parent(
        parent_payload,
        latest_csrf
      );
    }
    setUser(newUser);
    localStorage.setItem("schoolManagementUser", JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("schoolManagementUser");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading, change_role }}
    >
      {children}
    </AuthContext.Provider>
  );
};
