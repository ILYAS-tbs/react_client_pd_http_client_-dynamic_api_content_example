import React, { useState, useEffect } from "react";
import {
  School,
  Users,
  UserCheck,
  TrendingUp,
  FileText,
  MessageSquare,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { StatsGrid } from "./StatsCard";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { adminApiClient } from "../../services/http_api/platform-admin/admin_api_client";
import { DashboardStats, AdminAuditLog } from "../../services/http_api/platform-admin/admin_types";
import { ErrorAlert } from "./ui";

interface OverviewTabProps {
  onRefresh?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onRefresh }) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stats = await adminApiClient.getDashboardStats();
      const logsResponse = await adminApiClient.listAuditLogs(1, 5, {
        ordering: "-timestamp",
      });
      
      setDashboardStats(stats);
      setAuditLogs(Array.isArray(logsResponse) ? logsResponse : logsResponse.results || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch dashboard statistics";
      setError(errorMsg);
      console.error("Dashboard stats error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = [
    {
      title: getTranslation("totalSchools", language),
      value: dashboardStats?.schools.total.toString() || "0",
      icon: School,
      color: "bg-blue-500",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("totalTeachers", language),
      value: dashboardStats?.roles.teachers.toString() || "0",
      icon: UserCheck,
      color: "bg-green-500",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("totalParents", language),
      value: dashboardStats?.roles.parents.toString() || "0",
      icon: Users,
      color: "bg-purple-500",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("pendingReports", language),
      value: dashboardStats?.reports.absence_pending.toString() || "0",
      icon: FileText,
      color: "bg-orange-500",
      trend: { value: 0, direction: "up" as const },
      isLoading,
    },
  ];

  const handleRefresh = async () => {
    await fetchStats();
    onRefresh?.();
  };

  const getActivityDescription = (log: AdminAuditLog): string => {
    const entityName = log.entity_display || log.entity_type;
    const action = log.action_type.replace(/_/g, " ").toLowerCase();
    return `${action} ${entityName}`;
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

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTranslation("recentActivity", language)}
            </h3>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-primary-500 hover:text-primary-600 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? getTranslation("loading", language) : getTranslation("refresh", language)}
            </button>
          </div>

          <div className="space-y-4">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getActivityDescription(log)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getTranslation("noActivity", language) || "No recent activity"}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {getTranslation("pendingActions", language)}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getTranslation("pendingReports", language)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getTranslation("absenceReportsAwaitingReview", language)}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {dashboardStats?.reports.absence_pending || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getTranslation("totalSchools", language)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getTranslation("activeSchoolAccounts", language)}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {dashboardStats?.schools.active || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getTranslation("totalUsers", language)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getTranslation("activeUserAccounts", language)}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {dashboardStats?.users.active || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {getTranslation("platformHealth", language)}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {healthPercentage}%
            </span>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                ✓
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {getTranslation("activeUsersRatio", language) || "Active users ratio"}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {getTranslation("totalRegistrations", language) || "Total Registrations"}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {((dashboardStats?.users.total || 0) + (dashboardStats?.schools.total || 0))}
            </span>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {getTranslation("schools", language)} + {getTranslation("users", language)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {getTranslation("activeUsers", language)}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {(dashboardStats?.users.active || 0).toLocaleString()}
            </span>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {getTranslation("currentlyActive", language) || "Currently active"}
          </p>
        </div>
      </div>
    </div>
  );
};
