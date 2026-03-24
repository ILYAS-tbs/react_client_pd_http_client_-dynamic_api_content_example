import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  isLoading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "bg-primary-500",
  trend,
  isLoading = false,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {value}
              </p>
              {trend && (
                <p
                  className={`text-xs mt-2 ${
                    trend.direction === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {trend.direction === "up" ? "↑" : "↓"} {trend.value}% this month
                </p>
              )}
            </>
          )}
        </div>
        <div className={`${color} p-4 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

interface StatsGridProps {
  stats: StatsCardProps[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};
