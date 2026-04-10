import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, Clock3, Filter, Search, ShieldAlert } from "lucide-react";
import { adminApiClient, normalizePaginatedResponse } from "../../services/http_api/platform-admin/admin_api_client";
import { AdminAuditLog, AuditLogSummary, OverviewWorkspace } from "../../services/http_api/platform-admin/admin_types";
import { LoadingSpinner, ErrorAlert, EmptyState } from "./ui";
import { PaginationControls } from "./PaginationControls";
import { StatsGrid } from "./StatsCard";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

const ACTION_OPTIONS = ["all", "create", "update", "approve", "reject", "publish", "archive", "activate", "suspend", "deactivate", "reactivate", "extend", "cancel", "bulk_action", "other"];

const formatActionLabel = (action: string, language: "ar" | "en" | "fr") => {
  if (action === "all") {
    return getTranslation("admin.allActions", language);
  }
  return getTranslation(`admin.auditAction.${action}`, language);
};

export const ActivityCenter: React.FC = () => {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [summary, setSummary] = useState<AuditLogSummary | null>(null);
  const [workspace, setWorkspace] = useState<OverviewWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const entityOptions = ["all", ...Object.keys(summary?.by_entity ?? {})];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [logsResponse, summaryResponse, workspaceResponse] = await Promise.all([
          adminApiClient.listAuditLogs(currentPage, pageSize, {
            action_type: actionFilter === "all" ? undefined : actionFilter,
            entity_type: entityFilter === "all" ? undefined : entityFilter,
            search: searchTerm || undefined,
            ordering: "-timestamp",
          }),
          adminApiClient.getAuditLogSummary({
            action_type: actionFilter === "all" ? undefined : actionFilter,
            entity_type: entityFilter === "all" ? undefined : entityFilter,
            search: searchTerm || undefined,
          }),
          adminApiClient.getOverviewWorkspace(),
        ]);

        const normalized = normalizePaginatedResponse(logsResponse);
        setLogs(normalized.results);
        setTotalCount(normalized.count);
        setSummary(summaryResponse);
        setWorkspace(workspaceResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : getTranslation("admin.errorMessage", language));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [actionFilter, currentPage, entityFilter, language, pageSize, searchTerm]);

  const stats = [
    {
      title: getTranslation("admin.auditEntries", language),
      value: summary?.total ?? 0,
      icon: Activity,
      color: "bg-slate-600",
    },
    {
      title: getTranslation("admin.pendingInvestigations", language),
      value: (workspace?.alerts.pending_absence_reports ?? 0) + (workspace?.alerts.pending_behaviour_reports ?? 0),
      icon: ShieldAlert,
      color: "bg-amber-500",
    },
    {
      title: getTranslation("admin.expiringSoon", language),
      value: workspace?.alerts.expiring_memberships ?? 0,
      icon: Clock3,
      color: "bg-blue-600",
    },
    {
      title: getTranslation("admin.alerts", language),
      value: Object.values(workspace?.alerts ?? {}).reduce((sum, value) => sum + value, 0),
      icon: AlertTriangle,
      color: "bg-rose-600",
    },
  ];

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getTranslation("admin.auditTrail", language)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getTranslation("admin.auditTrailDescription", language)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={actionFilter}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setActionFilter(event.target.value);
                  }}
                  className="bg-transparent outline-none"
                >
                  {ACTION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatActionLabel(option, language)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600">
                <select
                  value={entityFilter}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setEntityFilter(event.target.value);
                  }}
                  className="bg-transparent outline-none"
                >
                  {entityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? getTranslation("admin.allEntities", language) : option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setSearchTerm(event.target.value);
                  }}
                  placeholder={getTranslation("admin.searchActivity", language)}
                  className="bg-transparent outline-none"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message={getTranslation("admin.loadingActivity", language)} />
          ) : logs.length === 0 ? (
            <EmptyState message={getTranslation("admin.noActivity", language)} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      <th className="pb-3 font-medium">{getTranslation("admin.action", language)}</th>
                      <th className="pb-3 font-medium">{getTranslation("admin.entity", language)}</th>
                      <th className="pb-3 font-medium">{getTranslation("admin.adminUser", language)}</th>
                      <th className="pb-3 font-medium">{getTranslation("admin.requestPath", language)}</th>
                      <th className="pb-3 font-medium">{getTranslation("admin.time", language)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="text-sm text-gray-900 dark:text-white">
                        <td className="py-4 font-medium">
                          {log.action_display || formatActionLabel(log.action_type, language)}
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-400">
                          <div>{log.entity_type}</div>
                          <div className="text-xs">{log.entity_display || log.entity_id}</div>
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-400">
                          <div>{log.admin_name || log.admin_username || getTranslation("admin.system", language)}</div>
                          {log.admin_role && (
                            <div className="text-xs uppercase tracking-wide">{log.admin_role}</div>
                          )}
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-400">
                          <div className="max-w-xs truncate">{String(log.details?.path || "-")}</div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700">{String(log.details?.method || "-")}</span>
                            <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700">{getTranslation("admin.statusCode", language)}: {String(log.details?.status_code ?? "-")}</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
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

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {getTranslation("admin.alertFeed", language)}
            </h3>
            <div className="space-y-3 text-sm">
              {workspace && Object.entries(workspace.alerts).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3 dark:bg-gray-700/40">
                  <span className="text-gray-600 dark:text-gray-300">
                    {getTranslation(`admin.alertKey.${key}`, language)}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {getTranslation("admin.activityBreakdown", language)}
            </h3>
            <div className="space-y-3 text-sm">
              {summary && Object.entries(summary.by_action).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">
                    {getTranslation(`admin.auditAction.${key}`, language)}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {getTranslation("admin.entityBreakdown", language)}
            </h3>
            <div className="space-y-3 text-sm">
              {summary && Object.entries(summary.by_entity).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">{key}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
