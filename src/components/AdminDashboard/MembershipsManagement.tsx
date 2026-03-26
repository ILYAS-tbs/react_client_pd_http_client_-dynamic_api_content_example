import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Membership } from "../../services/http_api/platform-admin/admin_types";
import { adminApiClient } from "../../services/http_api/platform-admin/admin_api_client";
import { LoadingSpinner, ErrorAlert, SuccessAlert, ConfirmDialog, EmptyState } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

export const MembershipsManagement: React.FC = () => {
  const { language } = useLanguage();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
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

      const response = await adminApiClient.listMemberships(
        currentPage,
        15,
        filters
      );

      // Handle both array and paginated object responses
      const results = Array.isArray(response) ? response : response.results ?? [];
      const count = Array.isArray(response) ? response.length : response.count ?? 0;

      setMemberships(results);
      setTotalPages(Math.ceil(count / 15));
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
  }, [currentPage, searchTerm, typeFilter, activeFilter]);

  const handleCancelMembership = async (membershipId: string) => {
    try {
      setActionLoading(`cancel-${membershipId}`);
      setError(null);
      await adminApiClient.cancelMembership(membershipId);
      setSuccess(getTranslation("cancelSubscription", language) + " successful");
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
      setError(getTranslation("extendDurationMinimum", language));
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

      setSuccess(getTranslation("membershipExtendedSuccessfully", language));
      setTimeout(() => setSuccess(null), 3000);
      setExtendModal(null);
      setExtendMonths(1);
      setExtendReason("");
      fetchMemberships();
      setOpenMenuId(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : getTranslation("failedExtendMembership", language);
      setError(errorMsg);
      console.error("Extend membership error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      FREE: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
      SUB_200:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      SUB_500:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return colors[type] || colors.FREE;
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
            {getTranslation("subscriptionsManagement", language)}
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("searchSubscriptions", language)}
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
              <option value="all">{getTranslation("allTypes", language)}</option>
              <option value="FREE">{getTranslation("free", language)}</option>
              <option value="SUB_200">{getTranslation("sub200", language)}</option>
              <option value="SUB_500">{getTranslation("sub500", language)}</option>
            </select>

            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">{getTranslation("allStatus", language)}</option>
              <option value="active">{getTranslation("active", language)}</option>
              <option value="inactive">{getTranslation("inactive", language)}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message={getTranslation("loadingSubscriptions", language)} />
        ) : (
          <>
            {memberships.length === 0 && (
              <EmptyState message={getTranslation("noMemberships", language)} />
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="pb-3 font-medium">{getTranslation("parent", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("email", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("type", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("startDate", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("expiryDate", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("status", language)}</th>
                    <th className="pb-3 font-medium text-right">{getTranslation("actions", language)}</th>
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
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
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
                              : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          }`}
                        >
                          {isExpired(membership.expiry_date)
                            ? getTranslation("expired", language)
                            : isExpiringSoon(membership.expiry_date)
                            ? getTranslation("expiringSoon", language)
                            : getTranslation("active", language)}
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
                                <Plus className="h-4 w-4" /> {getTranslation("extend", language)}
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmCancel(String(membership.id));
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-700 dark:text-red-400"
                              >
                                <CheckCircle className="h-4 w-4" /> {getTranslation("cancelSubscription", language)}
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

      {/* Cancel Confirmation */}
      {confirmCancel && (
        <ConfirmDialog
          title={getTranslation("cancelSubscription", language)}
          message={getTranslation("confirmCancelSubscription", language)}
          confirmLabel={getTranslation("cancelSubscription", language)}
          cancelLabel={getTranslation("cancel", language)}
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
                {getTranslation("extendSubscription", language)}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("durationMonths", language)} *
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
                    {getTranslation("reasonOptional", language)}
                  </label>
                  <textarea
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    placeholder={getTranslation("reasonForExtensionPlaceholder", language)}
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
                  {getTranslation("cancel", language)}
                </button>
                <button
                  onClick={() => handleExtendMembership(extendModal)}
                  disabled={actionLoading !== null}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {getTranslation("extend", language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
