import React, { useState, useEffect, useMemo } from "react";
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

const Register: React.FC<RegisterProps> = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "parent",
    schoolType: "public",
    school_level: "primary", // New field for school level
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
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { register } = useAuth();
  const { t, language, isRTL } = useLanguage();

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
          .map((name) => ({ name, communes: wilayaMap[name].sort() }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setWilayas(wilayaArray);

        const schoolResponse = await fetch("/assets/mock_data.json");
        if (!schoolResponse.ok) throw new Error("Failed to load schools");
        const schoolData: { schools: School[] } = await schoolResponse.json();
        setSchools(
          schoolData.schools.sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch (err) {
        console.error("Error loading data:", err);
        setError(t("dataLoadError") || "Failed to load data");
        setWilayas([]);
        setSchools([]);
      }
    };

    loadData();
  }, [t]);

  const grades = useMemo(
    () => ({
      primary: [
        { value: "1", label: t("grade1") || "Grade 1" },
        { value: "2", label: t("grade2") || "Grade 2" },
        { value: "3", label: t("grade3") || "Grade 3" },
        { value: "4", label: t("grade4") || "Grade 4" },
        { value: "5", label: t("grade5") || "Grade 5" },
      ],
      middle: [
        { value: "1", label: t("middle1") || "Middle 1" },
        { value: "2", label: t("middle2") || "Middle 2" },
        { value: "3", label: t("middle3") || "Middle 3" },
        { value: "4", label: t("middle4") || "Middle 4" },
      ],
      high: [
        { value: "1", label: t("high1") || "High 1" },
        { value: "2", label: t("high2") || "High 2" },
        { value: "3", label: t("high3") || "High 3" },
      ],
    }),
    [t]
  );

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

  const handleChildChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedChildren = prev.children.map((child, i) => {
        if (i !== index) return child;
        const updatedChild = { ...child, [field]: value };
        if (field === "schoolName") {
          const selectedSchool = schools.find(
            (school) => school.name === value
          );
          updatedChild.grade = "";
        }
        return updatedChild;
      });
      return { ...prev, children: updatedChildren };
    });
    setError("");
    setSuccess("");
  };

  const updateChildrenCount = (count: number) => {
    const newChildren = Array.from(
      { length: count },
      (_, i) =>
        formData.children[i] || {
          fullName: "",
          dateOfBirth: "",
          schoolName: "",
          grade: "",
        }
    );
    setFormData((prev) => ({
      ...prev,
      numberOfChildren: count,
      children: newChildren,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      return t("passwordMismatch") || "Passwords do not match";
    }
    if (!/^\+213[0-9]{9}$/.test(formData.phone)) {
      return t("invalidPhone") || "Invalid phone number";
    }
    if (
      formData.role === "parent" &&
      formData.children.some(
        (child) =>
          !child.fullName ||
          !child.dateOfBirth ||
          !child.schoolName ||
          !child.grade
      )
    ) {
      return t("incompleteChildData") || "Incomplete child data";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const {  logout } = useAuth();

    try {
      //? Call 00 : logout first - removing the session_id if it was there from signup
      const logout_res = logout();

      //?: turned validation off for now - because of students data
      // const validationError = validateForm();
      // if (validationError) {
      //   setError(validationError);
      //   setIsLoading(false);
      //   return;
      // }
      const success = await register(
        {
          ...formData,
          role: formData.role === "school" ? "school" : formData.role,
        },
        formData.role === "school"
      );
      //?: LocalStorage:: Account Role Global
      localStorage.setItem("role",formData.role)

      if (success) {
        setSuccess(t("registrationSuccess") || "Successfully signed up!");
        navigate("/confirmation-code");

        // Reset form after success
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
                {t("register")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("registerSlogan") || "Connect with Education"}
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

        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm">
            {success}
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
                    className={`flex items-center space-x-3 rtl:space-x-reverse p-3 border-2 rounded-lg transition-all ${
                      formData.role === option.value
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

          {/* Name */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                isRTL ? "text-right" : "text-left"
              }`}
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
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={
                formData.role === "school"
                  ? t("schoolNamePlaceholder") || "Al Amal Primary School"
                  : t("fullNamePlaceholder") || "Mohammed Ali"
              }
              required
            />
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
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={t("emailPlaceholder") || "example@email.dz"}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("phoneNumber") || "Phone Number"}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder="+213 551 123 456"
              required
            />
          </div>

          {/* Wilaya */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                isRTL ? "text-right" : "text-left"
              }`}
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
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
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
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                isRTL ? "text-right" : "text-left"
              }`}
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
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
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

          {/* School Type (only for schools) */}
          {formData.role === "school" && (
            <div>
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("schoolType") || "School Type"}
              </label>
              <select
                name="schoolType"
                value={formData.schoolType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                required
              >
                <option value="public">{t("publicSchool") || "Public"}</option>
                <option value="private">
                  {t("privateSchool") || "Private"}
                </option>
              </select>
            </div>
          )}

          {/* School Level (only for schools) */}
          {formData.role === "school" && (
            <div>
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("schoolLevel") || "School Level"}
              </label>
              <select
                name="school_level"
                value={formData.school_level}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
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
          )}

          {/* Number of Children (for parents) */}
          {/* {formData.role === "parent" && (
            <div>
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("numberOfChildren") || "Number of Children"}
              </label>
              <select
                name="numberOfChildren"
                value={formData.numberOfChildren}
                onChange={(e) => updateChildrenCount(parseInt(e.target.value))}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                required
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          )} */}

          {/* Child Forms (for parents) */}
          {/* Modification : children fields not required for now */}
          {/* {formData.role === "parent" &&
            formData.children.map((child, index) => (
              <div
                key={index}
                className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <h4
                  className={`font-medium text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar"
                    ? `الطفل ${index + 1}`
                    : language === "fr"
                    ? `Enfant ${index + 1}`
                    : `Child ${index + 1}`}
                </h4>

                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("childFullName") || "Child Full Name"}
                  </label>
                  <input
                    type="text"
                    value={child.fullName}
                    onChange={(e) =>
                      handleChildChange(index, "fullName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    placeholder={t("childFullName") || "Child Full Name"}
                    // required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("dateOfBirth") || "Date of Birth"}
                  </label>
                  <input
                    type="date"
                    value={child.dateOfBirth}
                    onChange={(e) =>
                      handleChildChange(index, "dateOfBirth", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    // required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {t("schoolName") || "School Name"}
                  </label>
                  <select
                    value={child.schoolName}
                    onChange={(e) =>
                      handleChildChange(index, "schoolName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    // required
                  >
                    <option value="">
                      {t("selectSchool") || "Select School"}
                    </option>
                    {schools
                      .filter(
                        (school) =>
                          (!selectedWilaya ||
                            school.wilaya_name === selectedWilaya) &&
                          (!selectedCommune ||
                            school.commune_name === selectedCommune)
                      )
                      .map((school) => (
                        <option key={school.name} value={school.name}>
                          {school.name}
                        </option>
                      ))}
                  </select>
                </div>

                {child.schoolName && (
                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("selectGrade") || "Select Grade"}
                    </label>
                    <select
                      value={child.grade}
                      onChange={(e) =>
                        handleChildChange(index, "grade", e.target.value)
                      }
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                      // required
                    >
                      <option value="">
                        {t("selectGrade") || "Select Grade"}
                      </option>
                      {(() => {
                        const selectedSchool = schools.find(
                          (school) => school.name === child.schoolName
                        );
                        const schoolLevel = selectedSchool?.level || "primary";
                        return grades[schoolLevel as keyof typeof grades]?.map(
                          (grade) => (
                            <option key={grade.value} value={grade.value}>
                              {grade.label}
                            </option>
                          )
                        );
                      })()}
                    </select>
                  </div>
                )}
              </div>
            ))} */}

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
                name="password"
                value={formData.password}
                onChange={handleInputChange}
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

          {/* Confirm Password */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("confirmPassword") || "Confirm Password"}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 pr-10 rtl:pr-3 rtl:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                placeholder={t("confirmPassword") || "Confirm Password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? (
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
            {isLoading
              ? t("loading") || "Loading..."
              : t("signUp") || "Sign Up"}
          </button>

          {/* Login Link */}
          <div
            className={`text-center text-sm text-gray-600 dark:text-gray-400 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("alreadyHaveAccount") || "Already have an account?"}{" "}
            <Link to="/login" className="text-[#39789b] hover:underline">
              {t("signIn") || "Sign In"}
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
        </form>
      </div>
    </div>
  );
};

export default Register;
