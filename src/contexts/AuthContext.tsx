import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { http_client } from "../services/http_api/auth/http_client";
import { LoginPayload } from "../services/http_api/http_reponse_types";
import { getCSRFToken } from "../lib/get_CSRFToken";

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
  register: (userData: any) => Promise<boolean>;
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

  const register = async (userData: any): Promise<boolean> => {
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
