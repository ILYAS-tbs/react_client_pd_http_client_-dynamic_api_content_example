import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  AbsenceReport,
  BehaviourReport,
} from "../../services/http_api/platform-admin/admin_types";
import { adminApiClient } from "../../services/http_api/platform-admin/admin_api_client";
import { LoadingSpinner, ErrorAlert, SuccessAlert, EmptyState } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface ReportsManagementProps {
  reportType?: "absence" | "behaviour";
}

export const ReportsManagement: React.FC<ReportsManagementProps> = ({
  reportType = "absence",
}) => {
  const { language } = useLanguage();
  const [reports, setReports] = useState<(AbsenceReport | BehaviourReport)[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [approvalModal, setApprovalModal] = useState<{
    reportId: string;
    action: "approve" | "reject";
  } | null>(null);
  const [comments, setComments] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        report_type: reportType,
        search: searchTerm || undefined,
        ordering: "-submit_date",
      };

      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const response = await adminApiClient.listReports(
        currentPage,
        15,
        filters
      );

      // Handle both array and paginated object responses
      const results = Array.isArray(response) ? response : response.results ?? [];
      const count = Array.isArray(response) ? response.length : response.count ?? 0;

      setReports(results);
      setTotalPages(Math.ceil(count / 15));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, reportType]);

  useEffect(() => {
    fetchReports();
  }, [currentPage, searchTerm, statusFilter, reportType]);

  const handleApproveReport = async (reportId: string) => {
    try {
      setActionLoading(`approve-${reportId}`);
      setError(null);
      await adminApiClient.approveReport(reportId, comments);
      setSuccess("Report approved successfully");
      setTimeout(() => setSuccess(null), 3000);
      fetchReports();
      setApprovalModal(null);
      setComments("");
      setOpenMenuId(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to approve report";
      setError(errorMsg);
      console.error("Approve report error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      setActionLoading(`reject-${reportId}`);
      setError(null);
      await adminApiClient.rejectReport(reportId, comments);
      setSuccess("Report rejected successfully");
      setTimeout(() => setSuccess(null), 3000);
      fetchReports();
      setApprovalModal(null);
      setComments("");
      setOpenMenuId(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to reject report";
      setError(errorMsg);
      console.error("Reject report error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
      APPROVED:
        "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      REJECTED:
        "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: getTranslation("pending", language),
      APPROVED: getTranslation("approved", language),
      REJECTED: getTranslation("rejected", language),
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
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
            {reportType === "absence" ? getTranslation("absenceReports", language) : getTranslation("behaviourReports", language)}
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("searchReports", language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-48"
              />
            </div>

            {reportType === "absence" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="all">{getTranslation("allStatus", language)}</option>
                <option value="PENDING">{getTranslation("pending", language)}</option>
                <option value="APPROVED">{getTranslation("approved", language)}</option>
                <option value="REJECTED">{getTranslation("rejected", language)}</option>
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message={getTranslation("loadingReports", language)} />
        ) : (
          <>
            {reports.length === 0 && (
              <EmptyState message={getTranslation("noReports", language)} />
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    {reportType === "absence" ? (
                      <>
                        <th className="pb-3 font-medium">{getTranslation("student", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("parent", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("absenceDate", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("reason", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("status", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("submitted", language)}</th>
                        <th className="pb-3 font-medium text-right">{getTranslation("actions", language)}</th>
                      </>
                    ) : (
                      <>
                        <th className="pb-3 font-medium">{getTranslation("student", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("teacher", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("date", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("severity", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("description", language)}</th>
                        <th className="pb-3 font-medium">{getTranslation("submitted", language)}</th>
                        <th className="pb-3 font-medium text-right">{getTranslation("actions", language)}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {reports.map((report) => {
                    const absenceReport = report as AbsenceReport;
                    const behaviourReport = report as BehaviourReport;
                    const isAbsence = reportType === "absence";

                    return (
                      <tr
                        key={report.id}
                        className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-4 text-sm font-medium">
                          {isAbsence
                            ? absenceReport.student_name
                            : behaviourReport.student_name}
                        </td>
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {isAbsence
                            ? absenceReport.parent_name
                            : behaviourReport.teacher_name}
                        </td>
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {isAbsence
                            ? new Date(
                                absenceReport.absence_date
                              ).toLocaleDateString()
                            : new Date(
                                behaviourReport.behavior_date
                              ).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {isAbsence ? absenceReport.reason : ""}
                        </td>
                        {isAbsence && (
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(absenceReport.status)}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                  absenceReport.status
                                )}`}
                              >
                                {getStatusText(absenceReport.status)}
                              </span>
                            </div>
                          </td>
                        )}
                        {!isAbsence && (
                          <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                            {behaviourReport.severity}
                          </td>
                        )}
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(report.submit_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-right relative">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === report.id ? null : report.id
                                )
                              }
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {openMenuId === report.id &&
                              isAbsence &&
                              absenceReport.status === "PENDING" && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                                  <button
                                    onClick={() =>
                                      setApprovalModal({
                                        reportId: report.id,
                                        action: "approve",
                                      })
                                    }
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm text-green-700 dark:text-green-400"
                                  >
                                    <CheckCircle className="h-4 w-4" /> {getTranslation("approve", language)}
                                  </button>
                                  <button
                                    onClick={() =>
                                      setApprovalModal({
                                        reportId: report.id,
                                        action: "reject",
                                      })
                                    }
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-700 dark:text-red-400"
                                  >
                                    <XCircle className="h-4 w-4" /> {getTranslation("reject", language)}
                                  </button>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {approvalModal.action === "approve"
                  ? getTranslation("approveReport", language)
                  : getTranslation("rejectReport", language)}
              </h3>

              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  approvalModal.action === "approve"
                    ? getTranslation("addCommentOptional", language)
                    : getTranslation("addRejectionReason", language)
                }
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-24 focus:ring-2 focus:ring-primary-500 outline-none"
                required={approvalModal.action === "reject"}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setApprovalModal(null);
                    setComments("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  {getTranslation("cancel", language)}
                </button>
                <button
                  onClick={() => {
                    if (approvalModal.action === "approve") {
                      handleApproveReport(approvalModal.reportId);
                    } else {
                      if (!comments.trim()) {
                        setError(getTranslation("rejectionReasonRequired", language));
                        return;
                      }
                      handleRejectReport(approvalModal.reportId);
                    }
                  }}
                  disabled={actionLoading !== null}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                    approvalModal.action === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } disabled:opacity-50`}
                >
                  {approvalModal.action === "approve" ? getTranslation("approve", language) : getTranslation("reject", language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
