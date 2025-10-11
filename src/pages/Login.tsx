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

  //? REMOVE THE SESSION ID :
  function deleteSessionIdCookie() {
  document.cookie = "sessionid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img
              src="/assets/logo.jpg"
              alt="Platform Logo"
              className="w-10 h-10 object-contain rounded-lg"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("login")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("loginSlogan") || "Connect with Education"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="text-gray-600 dark:text-white" size={20} />
            </button>
          )}
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role Selection */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                isRTL ? "text-right" : "text-left"
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
                    className={`flex items-center space-x-3 rtl:space-x-reverse p-3 border-2 rounded-lg transition-all ${
                      role === option.value
                        ? "border-[#39789b] bg-[#39789b]/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-[#39789b]/50"
                    } ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <Icon className="w-5 h-5 text-[#39789b]" />
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
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("email") || "Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={t("emailPlaceholder") || "example@school.dz"}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("password") || "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 rtl:pr-3 rtl:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-[#39789b] text-white rounded-lg hover:bg-[#2f6a85] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {isLoading ? t("loading") || "Loading..." : t("login") || "Login"}
          </button>

          {/* Register Link */}
          <div
            className={`text-center text-sm text-gray-600 dark:text-gray-400 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("noAccount") || "Don’t have an account?"}{" "}
            <Link to="/register" className="text-[#39789b] hover:underline">
              {t("signUp") || "Sign Up"}
            </Link>
          </div>
          <div
            className={`text-center text-sm text-gray-600 dark:text-gray-400 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <Link to="/" className="text-[#39789b] hover:underline">
              {t("cancel") || "Go Back"}
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4
              className={`text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("demoCredentials") || "Demo Credentials:"}
            </h4>
            <div
              className={`text-xs text-gray-600 dark:text-gray-400 space-y-1 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <p>{t("demoSchool") || "School"}: school@demo.dz / password</p>
              <p>{t("demoTeacher") || "Teacher"}: teacher@demo.dz / password</p>
              <p>{t("demoParent") || "Parent"}: parent@demo.dz / password</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
