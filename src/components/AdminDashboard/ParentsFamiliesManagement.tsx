import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  Eye,
  GraduationCap,
  Search,
  Users,
} from "lucide-react";
import {
  ParentFamily,
  ParentFamilyStats,
} from "../../services/http_api/platform-admin/admin_types";
import {
  adminApiClient,
  normalizePaginatedResponse,
} from "../../services/http_api/platform-admin/admin_api_client";
import { ErrorAlert, LoadingSpinner, EmptyState } from "./ui";
import { StatsGrid } from "./StatsCard";
import { PaginationControls } from "./PaginationControls";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

const formatDate = (value: string | null | undefined, language: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const locale = language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-GB";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const distributionPalette = [
  "bg-primary-500",
  "bg-secondary-500",
  "bg-amber-500",
];

export const ParentsFamiliesManagement: React.FC = () => {
  const { language } = useLanguage();
  const [parents, setParents] = useState<ParentFamily[]>([]);
  const [stats, setStats] = useState<ParentFamilyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [minChildren, setMinChildren] = useState("");
  const [maxChildren, setMaxChildren] = useState("");
  const [sortBy, setSortBy] = useState("-created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [detailParent, setDetailParent] = useState<ParentFamily | null>(null);

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        school: schoolFilter !== "all" ? Number(schoolFilter) : undefined,
        min_children: minChildren === "" ? undefined : Number(minChildren),
        max_children: maxChildren === "" ? undefined : Number(maxChildren),
        search: searchTerm || undefined,
        ordering: sortBy,
      };

      const [listResponse, statsResponse] = await Promise.all([
        adminApiClient.listParents(currentPage, pageSize, filters),
        adminApiClient.getParentStats(),
      ]);

      const normalized = normalizePaginatedResponse(listResponse);
      setParents(normalized.results);
      setTotalCount(normalized.count);
      setStats(statsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : getTranslation("admin.failedLoadParentAnalytics", language));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, schoolFilter, minChildren, maxChildren, sortBy]);

  useEffect(() => {
    fetchParents();
  }, [currentPage, pageSize, searchTerm, schoolFilter, minChildren, maxChildren, sortBy]);

  const handleOpenDetails = async (parent: ParentFamily) => {
    try {
      setDetailParent(parent);
      setDetailLoading(true);
      const response = await adminApiClient.getParent(parent.id);
      setDetailParent(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : getTranslation("admin.failedLoadParentDetails", language));
    } finally {
      setDetailLoading(false);
    }
  };

  const distribution = [
    { label: getTranslation("admin.childrenCountOne", language), value: stats?.parents_with_1_child ?? 0 },
    { label: getTranslation("admin.childrenCountTwo", language), value: stats?.parents_with_2_children ?? 0 },
    { label: getTranslation("admin.childrenCountThreePlus", language), value: stats?.parents_with_3_plus_children ?? 0 },
  ];

  const maxDistributionValue = Math.max(1, ...distribution.map((item) => item.value));
  const maxSchoolValue = Math.max(1, ...(stats?.parents_per_school ?? []).map((item) => item.parents_count));

  const statsCards = [
    {
      title: getTranslation("admin.totalParents", language),
      value: stats?.total_parents ?? 0,
      icon: Users,
      color: "bg-slate-700",
      isLoading: loading,
    },
    {
      title: getTranslation("admin.linkedStudents", language),
      value: stats?.total_students ?? 0,
      icon: GraduationCap,
      color: "bg-primary-600",
      isLoading: loading,
    },
    {
      title: getTranslation("admin.avgChildrenPerParent", language),
      value: stats?.average_children_per_parent ?? 0,
      icon: BarChart3,
      color: "bg-secondary-500",
      isLoading: loading,
    },
    {
      title: getTranslation("admin.largeFamilies", language),
      value: stats?.parents_with_3_plus_children ?? 0,
      icon: Building2,
      color: "bg-amber-500",
      isLoading: loading,
    },
  ];

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <StatsGrid stats={statsCards} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr,1.35fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTranslation("admin.familyDistribution", language)}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {getTranslation("admin.familyDistributionDescription", language)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-4">
            {distribution.map((item, index) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full ${distributionPalette[index]}`}
                    style={{ width: `${(item.value / maxDistributionValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTranslation("admin.parentsPerSchool", language)}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {getTranslation("admin.parentsPerSchoolDescription", language)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
            {(stats?.parents_per_school?.length ?? 0) > 0 ? (
              stats?.parents_per_school.map((item) => (
                <div key={item.school_id} className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.school_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.students_count} {getTranslation("admin.linkedStudentsLabel", language)}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                      {item.parents_count} {getTranslation("admin.parentsLabel", language)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${(item.parents_count / maxSchoolValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message={getTranslation("admin.noSchoolDistributionAvailable", language)} />
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTranslation("admin.parentsExplorer", language)}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {getTranslation("admin.parentsExplorerDescription", language)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={getTranslation("admin.searchParents", language)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <select
              value={schoolFilter}
              onChange={(event) => setSchoolFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{getTranslation("admin.allSchools", language)}</option>
              {(stats?.parents_per_school ?? []).map((item) => (
                <option key={item.school_id} value={item.school_id}>
                  {item.school_name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              value={minChildren}
              onChange={(event) => setMinChildren(event.target.value)}
              placeholder={getTranslation("admin.minChildren", language)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />

            <input
              type="number"
              min="0"
              value={maxChildren}
              onChange={(event) => setMaxChildren(event.target.value)}
              placeholder={getTranslation("admin.maxChildren", language)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="-created_at">{getTranslation("admin.newestParents", language)}</option>
              <option value="-total_children">{getTranslation("admin.mostChildren", language)}</option>
              <option value="full_name">{getTranslation("admin.alphabetical", language)}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message={getTranslation("admin.loadingParentAnalytics", language)} />
        ) : parents.length === 0 ? (
          <EmptyState message={getTranslation("admin.noParentsMatchedFilters", language)} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <th className="pb-3 font-medium">{getTranslation("parentName", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("email", language)}</th>
                    <th className="pb-3 font-medium"># {getTranslation("children", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.schoolsInvolved", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("createdAt", language)}</th>
                    <th className="pb-3 text-right font-medium">{getTranslation("actions", language)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {parents.map((parent) => (
                    <tr key={parent.id} className="align-top text-sm text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700/40">
                      <td className="py-4">
                        <div>
                          <p className="font-semibold">{parent.full_name}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {parent.total_children >= 3
                              ? getTranslation("admin.largeFamily", language)
                              : getTranslation("admin.familyProfile", language)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{parent.email}</td>
                      <td className="py-4">
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                          {parent.total_children}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        <div className="flex flex-wrap gap-2">
                          {parent.schools_involved.length > 0 ? (
                            parent.schools_involved.map((school) => (
                              <span
                                key={`${parent.id}-${school.school_id}`}
                                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                              >
                                {school.school_name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">{getTranslation("admin.noLinkedSchools", language)}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{formatDate(parent.created_at, language)}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(parent)}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <Eye className="h-4 w-4" />
                          {getTranslation("viewDetails", language)}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                isLoading={loading}
              />
            </div>
          </>
        )}
      </section>

      {detailParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{detailParent.full_name}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{detailParent.email}</p>
              </div>
              <button
                onClick={() => setDetailParent(null)}
                className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {getTranslation("close", language)}
              </button>
            </div>

            <div className="max-h-[calc(85vh-88px)] overflow-y-auto px-6 py-6">
              {detailLoading ? (
                <LoadingSpinner message={getTranslation("admin.loadingFamilyDetails", language)} />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/40">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("children", language)}</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{detailParent.total_children}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/40">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("admin.schoolsInvolved", language)}</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{detailParent.total_schools}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/40">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getTranslation("admin.joined", language)}</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{formatDate(detailParent.created_at, language)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{getTranslation("phoneNumber", language)}</p>
                      <p className="mt-2 text-sm text-gray-900 dark:text-white">{detailParent.phone_number || getTranslation("admin.notProvided", language)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{getTranslation("admin.relationship", language)}</p>
                      <p className="mt-2 text-sm capitalize text-gray-900 dark:text-white">
                        {detailParent.relationship_to_student || getTranslation("admin.notSpecified", language)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{getTranslation("admin.address", language)}</p>
                    <p className="mt-2 text-sm text-gray-900 dark:text-white">{detailParent.address || getTranslation("admin.noAddressProvided", language)}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="border-b border-gray-100 px-4 py-4 dark:border-gray-700">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">{getTranslation("admin.childrenDetails", language)}</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left">
                        <thead>
                          <tr className="border-b border-gray-100 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            <th className="px-4 py-3 font-medium">{getTranslation("student", language)}</th>
                            <th className="px-4 py-3 font-medium">{getTranslation("schoolName", language)}</th>
                            <th className="px-4 py-3 font-medium">{getTranslation("admin.classGroup", language)}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {detailParent.children.map((child) => (
                            <tr key={child.id} className="text-sm text-gray-900 dark:text-white">
                              <td className="px-4 py-3 font-medium">{child.student_name}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{child.school_name || "-"}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{child.class_group_name || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};