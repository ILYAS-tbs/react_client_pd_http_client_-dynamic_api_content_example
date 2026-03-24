import React, { useState } from "react";
import {
  School,
  Users,
  UserCheck,
  TrendingUp,
  FileText,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import { StatsGrid } from "./StatsCard";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface OverviewTabProps {
  onRefresh?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onRefresh }) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // Mock stats - in production, these would come from API
  // TODO: Add API endpoint for dashboard stats
  const stats = [
    {
      title: getTranslation("totalSchools", language),
      value: "243",
      icon: School,
      color: "bg-blue-500",
      trend: { value: 12, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("totalTeachers", language),
      value: "1,842",
      icon: UserCheck,
      color: "bg-green-500",
      trend: { value: 8, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("totalParents", language),
      value: "5,324",
      icon: Users,
      color: "bg-purple-500",
      trend: { value: 15, direction: "up" as const },
      isLoading,
    },
    {
      title: getTranslation("activeSubscriptions", language),
      value: "892",
      icon: CreditCard,
      color: "bg-orange-500",
      trend: { value: 5, direction: "up" as const },
      isLoading,
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onRefresh?.();
    }, 1000);
  };

  return (
    <div className="space-y-6">
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
              className="text-primary-500 hover:text-primary-600 text-sm font-medium"
            >
              {getTranslation("refresh", language)}
            </button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getTranslation("schoolRegistrationApproved", language)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getTranslation("hoursAgo", language)}
                  </p>
                </div>
              </div>
            ))}
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
                24
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getTranslation("pendingSchools", language)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getTranslation("schoolsAwaitingApproval", language)}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                7
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getTranslation("expiringSoon", language)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getTranslation("subscriptionsExpiringIn30Days", language)}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                42
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {getTranslation("platformGrowth", language)}
        </h3>

        <div className="h-64 flex items-end justify-between gap-2">
          {[40, 60, 45, 90, 80, 100, 120, 95, 110, 85, 130, 140].map((h, i) => (
            <div
              key={i}
              className="bg-gradient-to-t from-primary-500 to-primary-300 w-full rounded-t-lg transition-all hover:from-primary-600 hover:to-primary-400 cursor-pointer relative group"
              style={{ height: `${h}%` }}
            >
              <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {h} {getTranslation("registrations", language)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{getTranslation("jan", language)}</span>
          <span>{getTranslation("feb", language)}</span>
          <span>{getTranslation("mar", language)}</span>
          <span>{getTranslation("apr", language)}</span>
          <span>{getTranslation("may", language)}</span>
          <span>{getTranslation("jun", language)}</span>
          <span>{getTranslation("jul", language)}</span>
          <span>{getTranslation("aug", language)}</span>
          <span>{getTranslation("sep", language)}</span>
          <span>{getTranslation("oct", language)}</span>
          <span>{getTranslation("nov", language)}</span>
          <span>{getTranslation("dec", language)}</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {getTranslation("platformHealth", language)}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              99.8%
            </span>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                ✓
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {getTranslation("uptimeThisMonth", language)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {getTranslation("avgResponseTime", language)}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              245
            </span>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <span className="text-xs text-blue-600 dark:text-blue-400">{getTranslation("milliseconds", language)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {getTranslation("milliseconds", language)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {getTranslation("activeUsers", language)}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              1.2K
            </span>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {getTranslation("currentlyOnline", language)}
          </p>
        </div>
      </div>
    </div>
  );
};
