import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react";
import { User } from "../../services/http_api/platform-admin/admin_types";
import { adminApiClient } from "../../services/http_api/platform-admin/admin_api_client";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface UsersManagementProps {
  onUserSelect?: (user: User) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  onUserSelect,
}) => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        search: searchTerm || undefined,
        ordering: "-date_joined",
      };

      if (roleFilter !== "all") {
        filters.role = roleFilter;
      }

      if (activeFilter !== "all") {
        filters.is_active = activeFilter === "active";
      }

      const response = await adminApiClient.listUsers(currentPage, 15, filters);

      setUsers(response.results);
      setTotalPages(Math.ceil(response.count / 15));
    } catch (err) {
      setError(err instanceof Error ? err.message : getTranslation("errorMessage", language));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, activeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, activeFilter]);

  const handleDeactivateUser = async (userId: number) => {
    try {
      setActionLoading(`deactivate-${userId}`);
      await adminApiClient.deactivateUser(userId);
      setSuccess(getTranslation("successMessage", language));
      fetchUsers();
      setOpenMenuId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : getTranslation("errorMessage", language));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateUser = async (userId: number) => {
    try {
      setActionLoading(`reactivate-${userId}`);
      await adminApiClient.reactivateUser(userId);
      setSuccess(getTranslation("successMessage", language));
      fetchUsers();
      setOpenMenuId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : getTranslation("errorMessage", language));
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      school: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      teacher:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      parent: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      student: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
      user: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
    };
    return colors[role] || colors.user;
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
            {getTranslation("userManagement", language)}
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("searchUsers", language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-48"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">{getTranslation("allRoles", language)}</option>
              <option value="school">{getTranslation("school", language)}</option>
              <option value="teacher">{getTranslation("teacher", language)}</option>
              <option value="parent">{getTranslation("parent", language)}</option>
              <option value="student">{getTranslation("student", language)}</option>
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
          <LoadingSpinner message={getTranslation("loadingUsers", language)} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="pb-3 font-medium">{getTranslation("username", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("email", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("userType", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("status", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("joined", language)}</th>
                    <th className="pb-3 font-medium text-right">{getTranslation("actions", language)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4 text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getTranslation(user.role, language)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {user.is_active ? getTranslation("active", language) : getTranslation("inactive", language)}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right relative">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === user.id ? null : user.id
                              )
                            }
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuId === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                              <button
                                onClick={() => onUserSelect?.(user)}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-200"
                              >
                                <Eye className="h-4 w-4" /> {getTranslation("viewDetails", language)}
                              </button>
                              {user.is_active ? (
                                <button
                                  onClick={() =>
                                    handleDeactivateUser(user.id)
                                  }
                                  disabled={
                                    actionLoading === `deactivate-${user.id}`
                                  }
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-700 dark:text-red-400 disabled:opacity-50"
                                >
                                  <Ban className="h-4 w-4" /> {getTranslation("deactivate", language)}
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleReactivateUser(user.id)
                                  }
                                  disabled={
                                    actionLoading === `reactivate-${user.id}`
                                  }
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm text-green-700 dark:text-green-400 disabled:opacity-50"
                                >
                                  <CheckCircle className="h-4 w-4" /> {getTranslation("reactivate", language)}
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
    </div>
  );
};
