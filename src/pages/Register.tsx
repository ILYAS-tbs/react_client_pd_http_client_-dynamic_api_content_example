import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Eye, EyeOff, Users, School } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

interface Wilaya {
  name: string;
  communes: string[];
}

interface School {
  name: string;
  level: string;
  wilaya_name: string;
  commune_name: string;
}

interface Child {
  fullName: string;
  dateOfBirth: string;
  schoolName: string;
  grade: string;
}

interface RegisterProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Register: React.FC<RegisterProps> = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const { setUserData } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "parent",
    schoolType: "public",
    school_level: "primary",
    phone: "",
    wilaya: "",
    commune: "",
    numberOfChildren: 1,
    children: [{ fullName: "", dateOfBirth: "", schoolName: "", grade: "" }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);

  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { register } = useAuth();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const loadData = async () => {
      try {
        const wilayaResponse = await fetch("/assets/states_and_communes.json");
        if (!wilayaResponse.ok) throw new Error("Failed to load wilayas");
        const wilayaData: { wilaya_name: string; commune_name: string }[] =
          await wilayaResponse.json();
        const wilayaMap = wilayaData.reduce(
          (acc: { [key: string]: string[] }, item) => {
            const { wilaya_name, commune_name } = item;
            if (!acc[wilaya_name]) acc[wilaya_name] = [];
            if (!acc[wilaya_name].includes(commune_name))
              acc[wilaya_name].push(commune_name);
            return acc;
          },
          {}
        );
        const wilayaArray = Object.keys(wilayaMap)
          .map((name) => ({ name, communes: wilayaMap[name]!.sort() }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setWilayas(wilayaArray);


      } catch (err) {
        console.error("Error loading data:", err);
        setError(t("dataLoadError") || "Failed to load data");
        setWilayas([]);
      }
    };

    loadData();
  }, [t]);



  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };







  const { logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      logout();

      const success = await register(
        {
          ...formData,
          role: formData.role === "school" ? "school" : formData.role,
        },
        formData.role === "school"
      );
      localStorage.setItem("role", formData.role)

      if (success) {
        setUserData({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          commune: formData.commune,
          wilaya: formData.wilaya,
          role: formData.role as "parent" | "teacher" | "school",
          phone: formData.phone,
          numberOfChildren: formData.numberOfChildren,
          children: formData.children,
          schoolType: formData.schoolType,
          school_level: formData.school_level,
        });

        setSuccess(t("registrationSuccess") || "Successfully signed up!");
        navigate("/confirmation-code");

        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "parent",
          schoolType: "public",
          school_level: "",
          phone: "",
          wilaya: "",
          commune: "",
          numberOfChildren: 1,
          children: [
            { fullName: "", dateOfBirth: "", schoolName: "", grade: "" },
          ],
        });
        setSelectedWilaya("");
        setSelectedCommune("");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError(t("registrationFailed") || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    parent: Users,
    school: School,
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-4 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="flex justify-center mb-2">
            <img
              src="/assets/pedaconnect-removebg.png"
              alt="PedaConnect Logo"
              className="w-96 h-96 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("register")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("registerSlogan") || "Connect with Education"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Role Selection - side by side */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("selectRole") || "Select Role"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "parent",
                  label: t("parent") || "Parent",
                  icon: Users,
                },
                {
                  value: "school",
                  label: t("schoolAdmin") || "School Admin",
                  icon: School,
                },
              ].map((option) => {
                const Icon = roleIcons[option.value as keyof typeof roleIcons];
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: option.value })
                    }
                    className={`flex items-center justify-center space-x-2 rtl:space-x-reverse p-3 border-2 rounded-lg transition-all flex-1 ${formData.role === option.value
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary-200"
                      } ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <Icon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name - full width */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}
            >
              {formData.role === "school"
                ? t("schoolName") || "School Name"
                : t("fullName") || "Full Name"}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
              placeholder={
                formData.role === "school"
                  ? t("schoolNamePlaceholder") || "Al Amal Primary School"
                  : t("fullNamePlaceholder") || "Mohammed Ali"
              }
              required
            />
          </div>

          {/* Email + Phone - side by side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("email") || "Email"}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
                placeholder={t("emailPlaceholder") || "example@email.dz"}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("phoneNumber") || "Phone Number"}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
                placeholder="+213 551 123 456"
                required
              />
            </div>
          </div>

          {/* Wilaya + Commune - side by side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wilaya */}
            <div>
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("wilaya") || "Wilaya"}
              </label>
              <select
                name="wilaya"
                value={selectedWilaya}
                onChange={(e) => {
                  setSelectedWilaya(e.target.value);
                  setSelectedCommune("");
                  setFormData({
                    ...formData,
                    wilaya: e.target.value,
                    commune: "",
                  });
                }}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
                required
              >
                <option value="">{t("selectWilaya") || "Select Wilaya"}</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya.name} value={wilaya.name}>
                    {wilaya.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Commune */}
            <div>
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("commune") || "Commune"}
              </label>
              <select
                name="commune"
                value={selectedCommune}
                onChange={(e) => {
                  setSelectedCommune(e.target.value);
                  setFormData({ ...formData, commune: e.target.value });
                }}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
                required
                disabled={!selectedWilaya}
              >
                <option value="">{t("selectCommune") || "Select Commune"}</option>
                {selectedWilaya &&
                  wilayas
                    .find((wilaya) => wilaya.name === selectedWilaya)
                    ?.communes.map((commune) => (
                      <option key={commune} value={commune}>
                        {commune}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          {/* School Type + Level (for schools) - side by side on md+ */}
          {formData.role === "school" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School Type */}
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}
                >
                  {t("schoolType") || "School Type"}
                </label>
                <select
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
                  required
                >
                  <option value="public">{t("publicSchool") || "Public"}</option>
                  <option value="private">
                    {t("privateSchool") || "Private"}
                  </option>
                </select>
              </div>

              {/* School Level */}
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}
                >
                  {t("schoolLevel") || "School Level"}
                </label>
                <select
                  name="school_level"
                  value={formData.school_level}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
                  required
                >
                  <option value="primary">
                    {t("primarySchool") || "Primary School"}
                  </option>
                  <option value="middle">
                    {t("middleSchool") || "Middle School"}
                  </option>
                  <option value="high">{t("highSchool") || "High School"}</option>
                </select>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("password") || "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 pr-10 rtl:pr-3 rtl:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
                placeholder={t("password") || "Password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("confirmPassword") || "Confirm Password"}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 pr-10 rtl:pr-3 rtl:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
                placeholder={t("confirmPassword") || "Confirm Password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? "text-right" : "text-left"}`}
          >
            {isLoading ? t("loading") || "Loading..." : t("signUp") || "Sign Up"}
          </button>

          {/* Links */}
          <div
            className={`text-center text-sm text-gray-600 dark:text-gray-400 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("alreadyHaveAccount") || "Already have an account?"}{" "}
            <Link to="/login" className="text-primary-600 hover:underline">
              {t("signIn") || "Sign In"}
            </Link>
          </div>
          <div
            className={`text-center text-sm text-gray-600 dark:text-gray-400 ${isRTL ? "text-right" : "text-left"}`}
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

export default Register;