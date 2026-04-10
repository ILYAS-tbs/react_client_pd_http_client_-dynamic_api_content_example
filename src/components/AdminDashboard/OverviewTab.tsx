import React, { useState, useEffect } from "react";
import {
  School,
  Users,
  UserCheck,
  TrendingUp,
  FileText,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  GraduationCap,
  Layers3,
  UserCog,
  BookOpen,
} from "lucide-react";
import { StatsGrid } from "./StatsCard";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { adminApiClient } from "../../services/http_api/platform-admin/admin_api_client";
import { OverviewWorkspace } from "../../services/http_api/platform-admin/admin_types";
import { ErrorAlert, LoadingSpinner, EmptyState } from "./ui";

interface OverviewTabProps {
  onRefresh?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onRefresh }) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<OverviewWorkspace | null>(null);

  const fetchWorkspace = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminApiClient.getOverviewWorkspace();
      setWorkspace(response);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch dashboard statistics";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const dashboardStats = workspace?.stats;

  const stats = [
    {
      title: getTranslation("admin.totalSchools", language),
      value: dashboardStats?.schools.total.toString() || "0",
      icon: School,
      color: "bg-primary-500",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("admin.totalTeachers", language),
      value: dashboardStats?.roles.teachers.toString() || "0",
      icon: UserCheck,
      color: "bg-secondary-600",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("admin.totalParents", language),
      value: dashboardStats?.roles.parents.toString() || "0",
      icon: Users,
      color: "bg-primary-600",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("admin.students", language),
      value: dashboardStats?.academics.students_total.toString() || "0",
      icon: GraduationCap,
      color: "bg-emerald-600",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("admin.classGroups", language),
      value: dashboardStats?.academics.class_groups_total.toString() || "0",
      icon: Layers3,
      color: "bg-indigo-600",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("admin.platformAdmins", language),
      value: dashboardStats?.users.admins.toString() || "0",
      icon: UserCog,
      color: "bg-rose-600",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("admin.unattachedUsers", language),
      value: dashboardStats?.users.unattached_non_admin.toString() || "0",
      icon: Users,
      color: "bg-slate-600",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("admin.activeSubscriptions", language),
      value: dashboardStats?.memberships.active.toString() || "0",
      icon: CreditCard,
      color: "bg-amber-500",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("admin.pendingReports", language),
      value: ((dashboardStats?.reports.absence_pending || 0) + (dashboardStats?.reports.behaviour_pending || 0)).toString(),
      icon: FileText,
      color: "bg-secondary-500",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
  ];

  const handleRefresh = async () => {
    await fetchWorkspace();
    onRefresh?.();
  };

  // Calculate health based on active vs total
  const totalUsers = dashboardStats?.users.total || 1;
  const activeUsers = dashboardStats?.users.active || 0;
  const healthPercentage = ((activeUsers / totalUsers) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {error && (
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
      )}

      {isLoading && !workspace ? (
        <LoadingSpinner message={getTranslation("admin.loading", language)} />
      ) : (
        <>
          <StatsGrid stats={stats} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr,1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getTranslation("admin.recentActivity", language)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getTranslation("admin.latestPlatformChanges", language)}
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 disabled:opacity-50 dark:bg-primary-900/20 dark:text-primary-400"
                  >
                    {isLoading ? getTranslation("admin.loading", language) : getTranslation("admin.refresh", language)}
                  </button>
                </div>

                {workspace?.recent_activity?.length ? (
                  <div className="space-y-4">
                    {workspace.recent_activity.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-b-0 dark:border-gray-700">
                        <div className="mt-2 h-2 w-2 rounded-full bg-primary-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {(log.action_display || log.action_type)} {log.entity_display || log.entity_type}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(log.admin_name || log.admin_username || getTranslation("admin.system", language))} • {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message={getTranslation("admin.noActivity", language)} />
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {getTranslation("admin.pendingQueue", language)}
                  </h3>
                  <div className="space-y-3">
                    {workspace?.pending_reports?.length ? (
                      workspace.pending_reports.map((report) => (
                        <div key={report.id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/40">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{report.student_name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{report.school_name}</p>
                            </div>
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                              {report.reason}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState message={getTranslation("admin.noReports", language)} />
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {getTranslation("admin.expiringMemberships", language)}
                  </h3>
                  <div className="space-y-3">
                    {workspace?.expiring_memberships?.length ? (
                      workspace.expiring_memberships.map((membership) => (
                        <div key={membership.id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/40">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{membership.parent_name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{membership.parent_email}</p>
                            </div>
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                              {new Date(membership.expiry_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState message={getTranslation("admin.noMemberships", language)} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {getTranslation("admin.alerts", language)}
                </h3>
                <div className="space-y-3">
                  {workspace && Object.entries(workspace.alerts).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-rose-50 p-2 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {getTranslation(`admin.alertKey.${key}`, language)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {getTranslation("admin.latestSchools", language)}
                </h3>
                <div className="space-y-3">
                  {workspace?.latest_schools?.map((school) => (
                    <div key={school.id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/40">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{school.school_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {school.total_students} {getTranslation("admin.students", language)} • {school.total_teachers} {getTranslation("admin.teachers", language)}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {getTranslation("admin.recentUsers", language)}
                </h3>
                <div className="space-y-3">
                  {workspace?.recent_users?.length ? (
                    workspace.recent_users.map((user) => (
                      <div key={user.id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/40">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.is_admin ? "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"}`}>
                            {user.is_admin ? getTranslation("admin.admin", language) : getTranslation("admin.nonAdmin", language)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState message={getTranslation("admin.noUsers", language)} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {getTranslation("admin.platformHealth", language)}
                </h4>
                <ShieldAlert className="h-5 w-5 text-primary-500" />
              </div>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{healthPercentage}%</p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {getTranslation("admin.activeUsersRatio", language)}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {getTranslation("admin.totalRegistrations", language)}
                </h4>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(dashboardStats?.users.total || 0) + (dashboardStats?.schools.total || 0)}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {getTranslation("admin.schools", language)} + {getTranslation("admin.users", language)}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {getTranslation("admin.highPriorityAnnouncements", language)}
                </h4>
                <MessageSquare className="h-5 w-5 text-rose-500" />
              </div>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {workspace?.alerts.high_priority_announcements || 0}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {getTranslation("admin.keepCommunicationVisible", language)}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {getTranslation("admin.modules", language)}
                </h4>
                <BookOpen className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {dashboardStats?.academics.modules_total || 0}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {getTranslation("admin.studentsWithParents", language)}: {dashboardStats?.academics.students_with_parent || 0}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
