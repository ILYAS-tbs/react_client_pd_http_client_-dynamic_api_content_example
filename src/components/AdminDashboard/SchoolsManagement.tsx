import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";
import { School } from "../../services/http_api/platform-admin/admin_types";
import { adminApiClient } from "../../services/http_api/platform-admin/admin_api_client";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface SchoolsManagementProps {
  onSchoolSelect?: (school: School) => void;
}

export const SchoolsManagement: React.FC<SchoolsManagementProps> = ({
  onSchoolSelect,
}) => {
  const { language } = useLanguage();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

 const fetchSchools = async () => {
  try {
    setLoading(true);
    setError(null);

    const filters: any = {
      search: searchTerm || undefined,
      ordering: "-created_at",
    };

    if (levelFilter !== "all") filters.school_level = levelFilter;
    if (typeFilter !== "all") filters.type = typeFilter;

    const response = await adminApiClient.listSchools(currentPage, 15, filters);

    // Handle both array and paginated object responses
    const results = Array.isArray(response) ? response : response.results ?? [];
    const count = Array.isArray(response) ? response.length : response.count ?? 0;

    setSchools(results);
    setTotalPages(Math.ceil(count / 15) || 1);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to fetch schools");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilter, typeFilter]);

  useEffect(() => {
    fetchSchools();
  }, [currentPage, searchTerm, levelFilter, typeFilter]);

  const handleActivateSchool = async (schoolId: string) => {
    try {
      setActionLoading(`activate-${schoolId}`);
      await adminApiClient.activateSchool(schoolId);
      setSuccess("School activated successfully");
      fetchSchools();
      setOpenMenuId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate school");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendSchool = async (schoolId: string) => {
    try {
      setActionLoading(`suspend-${schoolId}`);
      await adminApiClient.suspendSchool(schoolId);
      setSuccess("School suspended successfully");
      fetchSchools();
      setOpenMenuId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suspend school");
    } finally {
      setActionLoading(null);
    }
  };

  const getLevelBadgeColor = (level: string) => {
    const colors: { [key: string]: string } = {
      PRIMARY: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      MIDDLE:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    };
    return colors[level] || colors.MIDDLE;
  };

  return (
    <div className="space-y-6">
      {error && (
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
      )}
      {success && (
        <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getTranslation("schoolManagement", language)}
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("searchSchools", language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-48"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">{getTranslation("allLevels", language)}</option>
              <option value="PRIMARY">{getTranslation("primary", language)}</option>
              <option value="MIDDLE">{getTranslation("middle", language)}</option>
              <option value="HIGH">{getTranslation("high", language)}</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">{getTranslation("allTypes", language)}</option>
              <option value="PUBLIC">{getTranslation("public", language)}</option>
              <option value="PRIVATE">{getTranslation("private", language)}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message={getTranslation("loadingSchools", language)} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="pb-3 font-medium">{getTranslation("schoolName", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("email", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("level", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("type", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("students", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("status", language)}</th>
                    <th className="pb-3 font-medium text-right">{getTranslation("actions", language)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {schools.map((school) => (
                    <tr
                      key={school.id}
                      className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4 text-sm font-medium">{school.name}</td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {school.email}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(
                            school.school_level
                          )}`}
                        >
                          {school.school_level}
                        </span>
                      </td>
                      <td className="py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            school.type === "PUBLIC"
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                              : "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400"
                          }`}
                        >
                          {school.type}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {school.total_students}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            school.is_active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {school.is_active ? getTranslation("active", language) : getTranslation("suspended", language)}
                        </span>
                      </td>
                      <td className="py-4 text-right relative">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === school.id ? null : school.id
                              )
                            }
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuId === school.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                              <button
                                onClick={() => onSchoolSelect?.(school)}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-200"
                              >
                                <Eye className="h-4 w-4" /> {getTranslation("viewDetails", language)}
                              </button>
                              {school.is_active ? (
                                <button
                                  onClick={() =>
                                    handleSuspendSchool(school.id)
                                  }
                                  disabled={
                                    actionLoading === `suspend-${school.id}`
                                  }
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-700 dark:text-red-400 disabled:opacity-50"
                                >
                                  <Lock className="h-4 w-4" /> {getTranslation("suspend", language)}
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleActivateSchool(school.id)
                                  }
                                  disabled={
                                    actionLoading === `activate-${school.id}`
                                  }
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm text-green-700 dark:text-green-400 disabled:opacity-50"
                                >
                                  <Unlock className="h-4 w-4" /> {getTranslation("activate", language)}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getTranslation("page", language)} {currentPage} {getTranslation("of", language)} {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
