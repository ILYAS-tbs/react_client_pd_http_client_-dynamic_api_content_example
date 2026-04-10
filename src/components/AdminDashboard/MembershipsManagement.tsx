import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  Plus,
  Clock,
  CheckCircle,
  CreditCard,
  Hourglass,
  ShieldCheck,
} from "lucide-react";
import { Membership, MembershipSummary } from "../../services/http_api/platform-admin/admin_types";
import { adminApiClient, normalizePaginatedResponse } from "../../services/http_api/platform-admin/admin_api_client";
import { LoadingSpinner, ErrorAlert, SuccessAlert, ConfirmDialog, EmptyState } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { StatsGrid } from "./StatsCard";
import { PaginationControls } from "./PaginationControls";

export const MembershipsManagement: React.FC = () => {
  const { language } = useLanguage();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [summary, setSummary] = useState<MembershipSummary | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [extendModal, setExtendModal] = useState<string | null>(null);
  const [extendMonths, setExtendMonths] = useState(1);
  const [extendReason, setExtendReason] = useState("");
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        search: searchTerm || undefined,
        ordering: "-created_at",
      };

      if (typeFilter !== "all") {
        filters.type = typeFilter;
      }

      if (activeFilter !== "all") {
        filters.is_active = activeFilter === "active";
      }

      const [response, summaryResponse] = await Promise.all([
        adminApiClient.listMemberships(currentPage, pageSize, filters),
        adminApiClient.getMembershipSummary(filters),
      ]);

      const normalized = normalizePaginatedResponse(response);

      setMemberships(normalized.results);
      setTotalCount(normalized.count);
      setSummary(summaryResponse);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch memberships"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, activeFilter]);

  useEffect(() => {
    fetchMemberships();
  }, [currentPage, pageSize, searchTerm, typeFilter, activeFilter]);

  const handleCancelMembership = async (membershipId: string) => {
    try {
      setActionLoading(`cancel-${membershipId}`);
      setError(null);
      await adminApiClient.cancelMembership(membershipId);
      setSuccess(getTranslation("admin.cancelSubscription", language) + " successful");
      setTimeout(() => setSuccess(null), 3000);
      setConfirmCancel(null);
      fetchMemberships();
      setOpenMenuId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel membership");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtendMembership = async (membershipId: string) => {
    if (extendMonths < 1) {
      setError(getTranslation("admin.extendDurationMinimum", language));
      return;
    }

    try {
      setActionLoading(`extend-${membershipId}`);
      setError(null);
      await adminApiClient.extendMembership(
        membershipId,
        extendMonths,
        extendReason
      );

      setSuccess(getTranslation("admin.membershipExtendedSuccessfully", language));
      setTimeout(() => setSuccess(null), 3000);
      setExtendModal(null);
      setExtendMonths(1);
      setExtendReason("");
      fetchMemberships();
      setOpenMenuId(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : getTranslation("admin.failedExtendMembership", language);
      setError(errorMsg);
      console.error("Extend membership error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      free: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
      sub_200:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      sub_500:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return colors[type] || colors.free;
  };

  const isExpiringSoon = (expiryDate: string) => {
    const days = Math.floor(
      (new Date(expiryDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days < 30 && days > 0;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const stats = [
    { title: getTranslation("admin.subscriptions", language), value: summary?.total ?? 0, icon: CreditCard, color: "bg-slate-600", isLoading: loading },
    { title: getTranslation("admin.active", language), value: summary?.active ?? 0, icon: ShieldCheck, color: "bg-primary-600", isLoading: loading },
    { title: getTranslation("admin.expiringSoon", language), value: summary?.expiring_soon ?? 0, icon: Hourglass, color: "bg-amber-500", isLoading: loading },
    { title: getTranslation("admin.expired", language), value: summary?.expired ?? 0, icon: Clock, color: "bg-rose-600", isLoading: loading },
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
            {getTranslation("admin.subscriptionsManagement", language)}
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("admin.searchSubscriptions", language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-48"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">{getTranslation("admin.allTypes", language)}</option>
              <option value="free">{getTranslation("admin.free", language)}</option>
              <option value="sub_200">{getTranslation("admin.sub200", language)}</option>
              <option value="sub_500">{getTranslation("admin.sub500", language)}</option>
            </select>

            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">{getTranslation("admin.allStatus", language)}</option>
              <option value="active">{getTranslation("admin.active", language)}</option>
              <option value="inactive">{getTranslation("admin.inactive", language)}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message={getTranslation("admin.loadingSubscriptions", language)} />
        ) : (
          <>
            {memberships.length === 0 && (
              <EmptyState message={getTranslation("admin.noMemberships", language)} />
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="pb-3 font-medium">{getTranslation("admin.parent", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.email", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.type", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.startDate", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.expiryDate", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.status", language)}</th>
                    <th className="pb-3 font-medium text-right">{getTranslation("admin.actions", language)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {memberships.map((membership) => (
                    <tr
                      key={membership.id}
                      className={`text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        isExpired(membership.expiry_date)
                          ? "bg-red-50 dark:bg-red-900/10"
                          : ""
                      }`}
                    >
                      <td className="py-4 text-sm font-medium">
                        {membership.parent_name}
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {membership.parent_email}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(
                            membership.type
                          )}`}
                        >
                          {membership.type}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {membership.start_date ? new Date(membership.start_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {isExpired(membership.expiry_date) ? (
                            <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                          ) : isExpiringSoon(membership.expiry_date) ? (
                            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          )}
                          {new Date(membership.expiry_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isExpired(membership.expiry_date)
                              ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                              : isExpiringSoon(membership.expiry_date)
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                              : "bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                          }`}
                        >
                          {isExpired(membership.expiry_date)
                            ? getTranslation("admin.expired", language)
                            : isExpiringSoon(membership.expiry_date)
                            ? getTranslation("admin.expiringSoon", language)
                            : getTranslation("admin.active", language)}
                        </span>
                      </td>
                      <td className="py-4 text-right relative">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === String(membership.id)
                                  ? null
                                  : String(membership.id)
                              )
                            }
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuId === String(membership.id) && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                              <button
                                onClick={() => setExtendModal(String(membership.id))}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-400"
                              >
                                <Plus className="h-4 w-4" /> {getTranslation("admin.extend", language)}
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmCancel(String(membership.id));
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-700 dark:text-red-400"
                              >
                                <CheckCircle className="h-4 w-4" /> {getTranslation("admin.cancelSubscription", language)}
                              </button>
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

      {/* Cancel Confirmation */}
      {confirmCancel && (
        <ConfirmDialog
          title={getTranslation("admin.cancelSubscription", language)}
          message={getTranslation("admin.confirmCancelSubscription", language)}
          confirmLabel={getTranslation("admin.cancelSubscription", language)}
          cancelLabel={getTranslation("admin.cancel", language)}
          onConfirm={() => handleCancelMembership(confirmCancel)}
          onCancel={() => setConfirmCancel(null)}
          isLoading={actionLoading === `cancel-${confirmCancel}`}
          confirmClassName="bg-red-500 hover:bg-red-600 text-white"
        />
      )}

      {/* Extend Modal */}
      {extendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation("admin.extendSubscription", language)}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("admin.durationMonths", language)} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={extendMonths}
                    onChange={(e) => setExtendMonths(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("admin.reasonOptional", language)}
                  </label>
                  <textarea
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    placeholder={getTranslation("admin.reasonForExtensionPlaceholder", language)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-20 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setExtendModal(null);
                    setExtendMonths(1);
                    setExtendReason("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  {getTranslation("admin.cancel", language)}
                </button>
                <button
                  onClick={() => handleExtendMembership(extendModal)}
                  disabled={actionLoading !== null}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {getTranslation("admin.extend", language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
