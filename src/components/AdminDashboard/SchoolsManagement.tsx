import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  Eye,
  Lock,
  Unlock,
  Building2,
  Users,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { School, SchoolSummary } from "../../services/http_api/platform-admin/admin_types";
import { adminApiClient, normalizePaginatedResponse } from "../../services/http_api/platform-admin/admin_api_client";
import { LoadingSpinner, ErrorAlert, SuccessAlert, ConfirmDialog, EmptyState } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { StatsGrid } from "./StatsCard";
import { PaginationControls } from "./PaginationControls";

export const SchoolsManagement: React.FC = () => {
  const { language } = useLanguage();
  const [schools, setSchools] = useState<School[]>([]);
  const [summary, setSummary] = useState<SchoolSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailSchool, setDetailSchool] = useState<School | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "suspend" | "activate"; id: string } | null>(null);

  const getLevelTranslation = (level: string): string => {
    const levelMap: { [key: string]: string } = {
      primary: "primarySchool",
      middle: "middleSchool",
      high: "highSchool",
    };
    return getTranslation(levelMap[level] || level, language);
  };

  const getTypeTranslation = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      public: "admin.public",
      PUBLIC: "admin.public",
      private: "admin.private",
      PRIVATE: "admin.private",
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

    const [response, summaryResponse] = await Promise.all([
      adminApiClient.listSchools(currentPage, pageSize, filters),
      adminApiClient.getSchoolSummary(filters),
    ]);

    const normalized = normalizePaginatedResponse(response);

    setSchools(normalized.results);
    setTotalCount(normalized.count);
    setSummary(summaryResponse);
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
  }, [currentPage, pageSize, searchTerm, levelFilter, typeFilter]);

  const handleActivateSchool = async (schoolId: string) => {
    try {
      setActionLoading(`activate-${schoolId}`);
      setError(null);
      await adminApiClient.activateSchool(schoolId);
      setSuccess(getTranslation("admin.schoolActivatedSuccessfully", language));
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
      setSuccess(getTranslation("admin.schoolSuspendedSuccessfully", language));
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

  const stats = [
    { title: getTranslation("admin.totalSchools", language), value: summary?.total ?? 0, icon: Building2, color: "bg-slate-600", isLoading: loading },
    { title: getTranslation("admin.active", language), value: summary?.active ?? 0, icon: ShieldCheck, color: "bg-primary-600", isLoading: loading },
    { title: getTranslation("admin.students", language), value: schools.reduce((sum, school) => sum + (school.total_students ?? 0), 0), icon: Users, color: "bg-blue-600", isLoading: loading },
    { title: getTranslation("admin.classes", language), value: schools.reduce((sum, school) => sum + (school.total_classes ?? 0), 0), icon: GraduationCap, color: "bg-amber-500", isLoading: loading },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
      )}
      {success && (
        <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />
      )}

      <StatsGrid stats={stats} />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getTranslation("admin.schoolManagement", language)}
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("admin.searchSchools", language)}
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
              <option value="all">{getTranslation("admin.allLevels", language)}</option>
              <option value="primary">{getTranslation("admin.primary", language)}</option>
              <option value="middle">{getTranslation("admin.middle", language)}</option>
              <option value="high">{getTranslation("admin.high", language)}</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">{getTranslation("admin.allTypes", language)}</option>
              <option value="private">{getTranslation("admin.private", language)}</option>
              <option value="public">{getTranslation("admin.public", language)}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message={getTranslation("admin.loadingSchools", language)} />
        ) : (
          <>
            {schools.length === 0 && (
              <EmptyState message={getTranslation("admin.noSchools", language)} />
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="pb-3 font-medium">{getTranslation("admin.schoolName", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.email", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.level", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.type", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.students", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.status", language)}</th>
                    <th className="pb-3 font-medium text-right">{getTranslation("admin.actions", language)}</th>
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
                            school.school_type?.toLowerCase() === "public"
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
                          {school.is_active ? getTranslation("admin.active", language) : getTranslation("admin.suspended", language)}
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
                                <Eye className="h-4 w-4" /> {getTranslation("admin.viewDetails", language)}
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
                                  <Lock className="h-4 w-4" /> {getTranslation("admin.suspend", language)}
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
                                  <Unlock className="h-4 w-4" /> {getTranslation("admin.activate", language)}
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

            <PaginationControls
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setCurrentPage(1);
                setPageSize(size);
              }}
              isLoading={loading}
            />
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
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.email", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailSchool.email || detailSchool.user_email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.level", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{getLevelTranslation(detailSchool.school_level)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.type", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{getTypeTranslation(detailSchool.school_type)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.students", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailSchool.total_students ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.teachers", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailSchool.total_teachers ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.classes", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailSchool.total_classes ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.status", language)}</dt>
                  <dd className={`font-medium ${detailSchool.is_active ? "text-primary-600 dark:text-primary-400" : "text-red-600 dark:text-red-400"}`}>
                    {detailSchool.is_active ? getTranslation("admin.active", language) : getTranslation("admin.suspended", language)}
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
          title={getTranslation("admin.confirmActionTitle", language)}
          message={
            confirmAction.type === "suspend"
              ? getTranslation("admin.confirmSuspend", language)
              : getTranslation("admin.confirmActivate", language)
          }
          confirmLabel={
            confirmAction.type === "suspend"
              ? getTranslation("admin.suspend", language)
              : getTranslation("admin.activate", language)
          }
          cancelLabel={getTranslation("admin.cancel", language)}
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
