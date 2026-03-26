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
import { LoadingSpinner, ErrorAlert, SuccessAlert, ConfirmDialog, EmptyState } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

export const SchoolsManagement: React.FC = () => {
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
  const [detailSchool, setDetailSchool] = useState<School | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "suspend" | "activate"; id: string } | null>(null);

  const getLevelTranslation = (level: string): string => {
    const levelMap: { [key: string]: string } = {
      primary: "primary",
      middle: "middle",
      high: "high",
    };
    return getTranslation(levelMap[level] || level, language);
  };

  const getTypeTranslation = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      PUBLIC: "public",
      PRIVATE: "private",
    };
    return getTranslation(typeMap[type] || type, language);
  };

 const fetchSchools = async () => {
  try {
    setLoading(true);
    setError(null);

    const filters: any = {
      search: searchTerm || undefined,
      ordering: "-created_at",
    };

    if (levelFilter !== "all") filters.school_level = levelFilter;
    if (typeFilter !== "all") filters.school_type = typeFilter;

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
      setError(null);
      await adminApiClient.activateSchool(schoolId);
      setSuccess(getTranslation("schoolActivatedSuccessfully", language));
      setTimeout(() => setSuccess(null), 3000);
      setConfirmAction(null);
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
      setError(null);
      await adminApiClient.suspendSchool(schoolId);
      setSuccess(getTranslation("schoolSuspendedSuccessfully", language));
      setTimeout(() => setSuccess(null), 3000);
      setConfirmAction(null);
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
      primary: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      middle: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    };
    return colors[level] || colors.middle;
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
              <option value="primary">{getTranslation("primary", language)}</option>
              <option value="middle">{getTranslation("middle", language)}</option>
              <option value="high">{getTranslation("high", language)}</option>
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
            {schools.length === 0 && (
              <EmptyState message={getTranslation("noSchools", language)} />
            )}
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

                      <td className="py-4 text-sm font-medium">{school.school_name}</td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {school.email}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(
                            school.school_level
                          )}`}
                        >
                          {getLevelTranslation(school.school_level)}
                        </span>
                      </td>
                      <td className="py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            school.school_type === "PUBLIC"
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                              : "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400"
                          }`}
                        >
                          {getTypeTranslation(school.school_type)}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {school.total_students}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            school.is_active
                              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
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
                                openMenuId === String(school.id) ? null : String(school.id)
                              )
                            }
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuId === String(school.id) && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                              <button
                                onClick={() => { setDetailSchool(school); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-200"
                              >
                                <Eye className="h-4 w-4" /> {getTranslation("viewDetails", language)}
                              </button>
                              {school.is_active ? (
                                <button
                                  onClick={() => {
                                    setConfirmAction({ type: "suspend", id: String(school.id) });
                                    setOpenMenuId(null);
                                  }}
                                  disabled={actionLoading === `suspend-${school.id}`}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-700 dark:text-red-400 disabled:opacity-50"
                                >
                                  <Lock className="h-4 w-4" /> {getTranslation("suspend", language)}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setConfirmAction({ type: "activate", id: String(school.id) });
                                    setOpenMenuId(null);
                                  }}
                                  disabled={actionLoading === `activate-${school.id}`}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary-400 disabled:opacity-50"
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

      {/* School Detail Modal */}
      {detailSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {detailSchool.school_name}
                </h3>
                <button
                  onClick={() => setDetailSchool(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("email", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailSchool.email || detailSchool.user_email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("level", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{getLevelTranslation(detailSchool.school_level)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("type", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailSchool.school_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("students", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailSchool.total_students ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("teachers", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailSchool.total_teachers ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("classes", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailSchool.total_classes ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("status", language)}</dt>
                  <dd className={`font-medium ${detailSchool.is_active ? "text-primary-600 dark:text-primary-400" : "text-red-600 dark:text-red-400"}`}>
                    {detailSchool.is_active ? getTranslation("active", language) : getTranslation("suspended", language)}
                  </dd>
                </div>
              </dl>
              <button
                onClick={() => setDetailSchool(null)}
                className="mt-6 w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                {getTranslation("close", language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Suspend/Activate */}
      {confirmAction && (
        <ConfirmDialog
          title={getTranslation("confirmActionTitle", language)}
          message={
            confirmAction.type === "suspend"
              ? getTranslation("confirmSuspend", language)
              : getTranslation("confirmActivate", language)
          }
          confirmLabel={
            confirmAction.type === "suspend"
              ? getTranslation("suspend", language)
              : getTranslation("activate", language)
          }
          cancelLabel={getTranslation("cancel", language)}
          onConfirm={() =>
            confirmAction.type === "suspend"
              ? handleSuspendSchool(confirmAction.id)
              : handleActivateSchool(confirmAction.id)
          }
          onCancel={() => setConfirmAction(null)}
          isLoading={
            actionLoading === `${confirmAction.type}-${confirmAction.id}`
          }
          confirmClassName="bg-red-500 hover:bg-red-600 text-white"
        />
      )}
    </div>
  );
};
