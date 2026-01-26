import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Eye, EyeOff, Users, School, GraduationCap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { auth_http_client } from "../services/http_api/auth/auth_http_client";

interface LoginProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Login: React.FC<LoginProps> = ({ isOpen = true, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("parent");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const { login, change_role, logout } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();

  function showError(duration: number, error: string) {
    setError(error)

    setTimeout(() => {
      setError("")
    }, duration);
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Call 00 : logout first - removing the session_id if it was there from signup
      const logout_res = logout();

      // call 01 - authenticate user
      const success_result = await login(email, password, role);
      const user_role = success_result?.user?.role;

      if (!success_result.ok) {
        showError(5000, "البريد الإلكتروني أو كلمة المرور غير صحيحة")
      }
      if (success_result) {
        if (user_role) {
          navigate(`/${user_role}-dashboard`);
          onClose?.();
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(t("loginFailed") || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    parent: Users,
    teacher: GraduationCap,
    school: School,
  };

  if (!isOpen) return null;


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/pedaconnect-removebg.png"
              alt="PedaConnect Logo"
              className="w-48 h-48 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("login")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("loginSlogan") || "Connect with Education"}
          </p>
        </div>


        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Role Selection */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? "text-right" : "text-left"
                }`}
            >
              {t("selectRole") || "Select Role"}
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  value: "parent",
                  label: t("parent") || "Parent",
                  icon: Users,
                },
                {
                  value: "teacher",
                  label: t("teacher") || "Teacher",
                  icon: GraduationCap,
                },
                {
                  value: "school",
                  label: t("school") || "School",
                  icon: School,
                },
              ].map((option) => {
                const Icon = roleIcons[option.value as keyof typeof roleIcons];
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`flex items-center space-x-3 rtl:space-x-reverse p-3 border-2 rounded-lg transition-all ${role === option.value
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary-200"
                      } ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <Icon className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"
                }`}
            >
              {t("email") || "Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"
                }`}
              placeholder={t("emailPlaceholder") || "example@school.dz"}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"
                }`}
            >
              {t("password") || "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 rtl:pr-3 rtl:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"
                  }`}
                placeholder={t("password") || "Password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className=" mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? "text-right" : "text-left"
              }`}
          >
            {isLoading ? t("loading") || "Loading..." : t("login") || "Login"}
          </button>

          {/* Register Link */}
          <div
            className={`text-center text-sm text-gray-600 dark:text-gray-400 ${isRTL ? "text-right" : "text-left"
              }`}
          >
            {t("noAccount") || "Don’t have an account?"}{" "}
            <Link to="/register" className="text-primary-600 hover:underline">
              {t("signUp") || "Sign Up"}
            </Link>
          </div>
          <div
            className={`text-center text-sm text-gray-600 dark:text-gray-400 ${isRTL ? "text-right" : "text-left"
              }`}
          >
            <Link to="/" className="text-primary-600 hover:underline">
              {t("cancel") || "Go Back"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
