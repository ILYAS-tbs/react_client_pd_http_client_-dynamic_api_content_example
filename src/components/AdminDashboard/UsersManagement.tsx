import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  Users,
  UserCheck,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { User, UserSummary } from "../../services/http_api/platform-admin/admin_types";
import { adminApiClient, normalizePaginatedResponse } from "../../services/http_api/platform-admin/admin_api_client";
import { LoadingSpinner, ErrorAlert, SuccessAlert, ConfirmDialog, EmptyState } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { StatsGrid } from "./StatsCard";
import { PaginationControls } from "./PaginationControls";

export const UsersManagement: React.FC = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ type: "deactivate" | "reactivate"; id: number } | null>(null);

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

      const [response, summaryResponse] = await Promise.all([
        adminApiClient.listUsers(currentPage, pageSize, filters),
        adminApiClient.getUserSummary(filters),
      ]);

      const normalized = normalizePaginatedResponse(response);

      setUsers(normalized.results);
      setTotalCount(normalized.count);
      setSummary(summaryResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : getTranslation("admin.errorMessage", language));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedUsers([]);
  }, [searchTerm, roleFilter, activeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchTerm, roleFilter, activeFilter]);

  const handleDeactivateUser = async (userId: number) => {
    try {
      setActionLoading(`deactivate-${userId}`);
      setError(null);
      await adminApiClient.deactivateUser(userId);
      setSuccess(getTranslation("admin.userDeactivatedSuccessfully", language));
      setTimeout(() => setSuccess(null), 3000);
      setConfirmAction(null);
      fetchUsers();
      setOpenMenuId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate user");
      console.error("Deactivate user error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateUser = async (userId: number) => {
    try {
      setActionLoading(`reactivate-${userId}`);
      setError(null);
      await adminApiClient.reactivateUser(userId);
      setSuccess(getTranslation("admin.userReactivatedSuccessfully", language));
      setTimeout(() => setSuccess(null), 3000);
      setConfirmAction(null);
      fetchUsers();
      setOpenMenuId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reactivate user");
      console.error("Reactivate user error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (type: "deactivate" | "reactivate") => {
    if (selectedUsers.length === 0) {
      return;
    }

    try {
      setActionLoading(type === "deactivate" ? "bulk-deactivate" : "bulk-reactivate");
      setError(null);

      if (type === "deactivate") {
        await adminApiClient.bulkDeactivateUsers(selectedUsers);
        setSuccess(getTranslation("admin.bulkDeactivateSuccess", language));
      } else {
        await adminApiClient.bulkReactivateUsers(selectedUsers);
        setSuccess(getTranslation("admin.bulkReactivateSuccess", language));
      }

      setSelectedUsers([]);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : getTranslation("admin.errorMessage", language));
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelectedUser = (userId: number) => {
    setSelectedUsers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUsers((current) =>
      current.length === users.length ? [] : users.map((user) => user.id)
    );
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      school: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      teacher:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      parent: "bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400",
      student: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
      user: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
    };
    return colors[role] || colors.user;
  };

  const getAdminBadgeColor = (isAdmin?: boolean) => {
    return isAdmin
      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
      : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
  };

  const stats = [
    {
      title: getTranslation("admin.totalUsers", language),
      value: summary?.total ?? 0,
      icon: Users,
      color: "bg-slate-600",
      isLoading: loading,
    },
    {
      title: getTranslation("admin.activeUsers", language),
      value: summary?.active ?? 0,
      icon: UserCheck,
      color: "bg-primary-600",
      isLoading: loading,
    },
    {
      title: getTranslation("admin.newThisMonth", language),
      value: summary?.recent_signups_30d ?? 0,
      icon: ShieldAlert,
      color: "bg-blue-600",
      isLoading: loading,
    },
    {
      title: getTranslation("admin.platformAdmins", language),
      value: summary?.by_role.admin ?? 0,
      icon: UserCog,
      color: "bg-rose-500",
      isLoading: loading,
    },
    {
      title: getTranslation("admin.unattachedUsers", language),
      value: summary?.by_role.non_admin_user ?? 0,
      icon: ShieldAlert,
      color: "bg-amber-500",
      isLoading: loading,
    },
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTranslation("admin.userManagement", language)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getTranslation("admin.userManagementDescription", language)}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("admin.searchUsers", language)}
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
              <option value="all">{getTranslation("admin.allRoles", language)}</option>
              <option value="school">{getTranslation("admin.schoolAdmin", language)}</option>
              <option value="teacher">{getTranslation("admin.teacher", language)}</option>
              <option value="parent">{getTranslation("admin.parent", language)}</option>
              <option value="admin">{getTranslation("admin.admin", language)}</option>
              <option value="user">{getTranslation("admin.user", language)}</option>
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

        <div className="mb-4 flex flex-col gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/40 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {selectedUsers.length > 0
              ? `${selectedUsers.length} ${getTranslation("admin.selected", language)}`
              : getTranslation("admin.selectUsersForBulkActions", language)}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction("reactivate")}
              disabled={selectedUsers.length === 0 || actionLoading !== null}
              className="rounded-lg border border-primary-200 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 disabled:opacity-50 dark:border-primary-800 dark:text-primary-400"
            >
              {getTranslation("admin.bulkReactivate", language)}
            </button>
            <button
              onClick={() => handleBulkAction("deactivate")}
              disabled={selectedUsers.length === 0 || actionLoading !== null}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400"
            >
              {getTranslation("admin.bulkDeactivate", language)}
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message={getTranslation("admin.loadingUsers", language)} />
        ) : (
          <>
            {users.length === 0 && (
              <EmptyState message={getTranslation("admin.noUsers", language)} />
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="pb-3 font-medium">
                      <input
                        type="checkbox"
                        checked={users.length > 0 && selectedUsers.length === users.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="pb-3 font-medium">{getTranslation("admin.username", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.email", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.userType", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.adminAccess", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.status", language)}</th>
                    <th className="pb-3 font-medium">{getTranslation("admin.joined", language)}</th>
                    <th className="pb-3 font-medium text-right">{getTranslation("admin.actions", language)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectedUser(user.id)}
                        />
                      </td>
                      <td className="py-4 text-sm font-medium">
                        {(user.first_name && user.last_name ? user.first_name + " " + user.last_name : user.username)}
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
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${getAdminBadgeColor(user.is_admin)}`}>
                            {user.is_admin ? getTranslation("admin.admin", language) : getTranslation("admin.nonAdmin", language)}
                          </span>
                          {user.is_admin && user.admin_role && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{user.admin_role}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active
                              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {user.is_active ? getTranslation("admin.active", language) : getTranslation("admin.inactive", language)}
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
                                onClick={() => { setDetailUser(user); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-200"
                              >
                                <Eye className="h-4 w-4" /> {getTranslation("admin.viewDetails", language)}
                              </button>
                              {user.is_active ? (
                                <button
                                  onClick={() => {
                                    setConfirmAction({ type: "deactivate", id: user.id });
                                    setOpenMenuId(null);
                                  }}
                                  disabled={actionLoading === `deactivate-${user.id}`}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-700 dark:text-red-400 disabled:opacity-50"
                                >
                                  <Ban className="h-4 w-4" /> {getTranslation("admin.deactivate", language)}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setConfirmAction({ type: "reactivate", id: user.id });
                                    setOpenMenuId(null);
                                  }}
                                  disabled={actionLoading === `reactivate-${user.id}`}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary-400 disabled:opacity-50"
                                >
                                  <CheckCircle className="h-4 w-4" /> {getTranslation("admin.reactivate", language)}
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

      {/* User Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {detailUser.first_name && detailUser.last_name
                    ? `${detailUser.first_name} ${detailUser.last_name}`
                    : detailUser.username}
                </h3>
                <button onClick={() => setDetailUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.username", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailUser.username}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.email", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{detailUser.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.userType", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium capitalize">{detailUser.role}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.adminAccess", language)}</dt>
                  <dd className={`font-medium ${detailUser.is_admin ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-300"}`}>
                    {detailUser.is_admin ? getTranslation("admin.admin", language) : getTranslation("admin.nonAdmin", language)}
                  </dd>
                </div>
                {detailUser.is_admin && detailUser.admin_role && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.adminRole", language)}</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">{detailUser.admin_role}</dd>
                  </div>
                )}
                {detailUser.role_details?.school && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.schoolName", language)}</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">{detailUser.role_details.school}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.status", language)}</dt>
                  <dd className={`font-medium ${detailUser.is_active ? "text-primary-600 dark:text-primary-400" : "text-red-600 dark:text-red-400"}`}>
                    {detailUser.is_active ? getTranslation("admin.active", language) : getTranslation("admin.inactive", language)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{getTranslation("admin.joined", language)}</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{new Date(detailUser.date_joined).toLocaleDateString()}</dd>
                </div>
              </dl>
              <button onClick={() => setDetailUser(null)} className="mt-6 w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
                {getTranslation("close", language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Deactivate/Reactivate */}
      {confirmAction && (
        <ConfirmDialog
          title={getTranslation("admin.confirmActionTitle", language)}
          message={
            confirmAction.type === "deactivate"
              ? getTranslation("admin.confirmDeactivate", language)
              : getTranslation("admin.confirmReactivate", language)
          }
          confirmLabel={
            confirmAction.type === "deactivate"
              ? getTranslation("admin.deactivate", language)
              : getTranslation("admin.reactivate", language)
          }
          cancelLabel={getTranslation("admin.cancel", language)}
          onConfirm={() =>
            confirmAction.type === "deactivate"
              ? handleDeactivateUser(confirmAction.id)
              : handleReactivateUser(confirmAction.id)
          }
          onCancel={() => setConfirmAction(null)}
          isLoading={actionLoading === `${confirmAction.type}-${confirmAction.id}`}
          confirmClassName="bg-red-500 hover:bg-red-600 text-white"
        />
      )}
    </div>
  );
};
