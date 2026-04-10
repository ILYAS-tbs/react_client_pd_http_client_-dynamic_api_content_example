import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  Plus,
  Send,
  Archive,
  Trash2,
  MessageSquare,
  Pin,
  Megaphone,
} from "lucide-react";
import { Announcement, School, AnnouncementSummary } from "../../services/http_api/platform-admin/admin_types";
import { adminApiClient, normalizePaginatedResponse } from "../../services/http_api/platform-admin/admin_api_client";
import { LoadingSpinner, ErrorAlert, SuccessAlert, ConfirmDialog, EmptyState } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { StatsGrid } from "./StatsCard";
import { PaginationControls } from "./PaginationControls";

export const AnnouncementsManagement: React.FC = () => {
  const { language } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [summary, setSummary] = useState<AnnouncementSummary | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
    target_group: "EVERYONE",
    category: "",
    school: "",
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        search: searchTerm || undefined,
        ordering: "-created_at",
      };

      if (targetFilter !== "all") {
        filters.target_group = targetFilter;
      }

      const [response, summaryResponse] = await Promise.all([
        adminApiClient.listAnnouncements(currentPage, pageSize, filters),
        adminApiClient.getAnnouncementSummary(filters),
      ]);

      const normalized = normalizePaginatedResponse(response);

      setAnnouncements(normalized.results);
      setTotalCount(normalized.count);
      setSummary(summaryResponse);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch announcements"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await adminApiClient.listSchools(1, 100);
      const results = normalizePaginatedResponse(response).results;
      setSchools(results);
      if (results.length > 0) {
        setFormData((prev) => ({ ...prev, school: String(results[0].id) }));
      }
    } catch (err) {
      console.warn("Could not fetch schools for announcement selector:", err);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, targetFilter]);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, pageSize, searchTerm, targetFilter]);

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      setError(getTranslation("admin.titleAndContentRequired", language));
      return;
    }

    try {
      setActionLoading("create");
      
      const priorityMap: Record<string, string> = {
        low: "منخفض",
        medium: "متوسط",
        high: "عالي",
      };
      const targetGroupMap: Record<string, string> = {
        STUDENTS: "جميع الطلاب",
        PARENTS: "أولياء الأمور",
        EVERYONE: "الجميع",
      };

      if (!formData.school) {
        setError(getTranslation("admin.selectSchool", language));
        setActionLoading(null);
        return;
      }

      await adminApiClient.createAnnouncement({
        title: formData.title,
        content: formData.content,
        priority: priorityMap[formData.priority] || "متوسط",
        target_group: targetGroupMap[formData.target_group] || "الجميع",
        category: formData.category,
        school: Number(formData.school),
      } as any);

      setSuccess(getTranslation("admin.announcementCreatedSuccessfully", language));
      setTimeout(() => setSuccess(null), 3000);
      setFormData((prev) => ({
        title: "",
        content: "",
        priority: "medium",
        target_group: "EVERYONE",
        category: "",
        school: prev.school,
      }));
      setCreateModal(false);
      fetchAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : getTranslation("admin.failedCreateAnnouncement", language)
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishAnnouncement = async (id: string) => {
    try {
      setActionLoading(`publish-${id}`);
      setError(null);
      await adminApiClient.publishAnnouncement(id);
      setSuccess(getTranslation("admin.announcementPublishedSuccessfully", language));
      setTimeout(() => setSuccess(null), 3000);
      fetchAnnouncements();
      setOpenMenuId(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : getTranslation("admin.failedPublishAnnouncement", language);
      setError(errorMsg);
      console.error("Publish announcement error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchiveAnnouncement = async (id: string) => {
    try {
      setActionLoading(`archive-${id}`);
      setError(null);
      await adminApiClient.archiveAnnouncement(id);
      setSuccess(getTranslation("admin.announcementArchivedSuccessfully", language));
      setTimeout(() => setSuccess(null), 3000);
      fetchAnnouncements();
      setOpenMenuId(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : getTranslation("admin.failedArchiveAnnouncement", language);
      setError(errorMsg);
      console.error("Archive announcement error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      setActionLoading(`delete-${id}`);
      setError(null);
      await adminApiClient.deleteAnnouncement(id);
      setSuccess(getTranslation("admin.deleteAnnouncement", language) + " successful");
      setTimeout(() => setSuccess(null), 3000);
      setConfirmDelete(null);
      fetchAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete announcement");
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      // Arabic values from backend
      "منخفض": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      "متوسط": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
      "عالي": "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
      // English fallback
      low: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
      high: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    };
    return colors[priority] || colors["متوسط"];
  };

  const stats = [
    { title: getTranslation("admin.announcements", language), value: summary?.total ?? 0, icon: MessageSquare, color: "bg-slate-600", isLoading: loading },
    { title: getTranslation("admin.published", language), value: summary?.published ?? 0, icon: Megaphone, color: "bg-primary-600", isLoading: loading },
    { title: getTranslation("admin.pinned", language), value: announcements.filter((item) => item.pinned).length, icon: Pin, color: "bg-blue-600", isLoading: loading },
    { title: getTranslation("admin.highPriorityAnnouncements", language), value: summary?.high_priority ?? 0, icon: Send, color: "bg-rose-600", isLoading: loading },
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
            {getTranslation("admin.announcementsManagement", language)}
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("admin.searchAnnouncements", language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-48"
              />
            </div>

            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">{getTranslation("admin.allAudiences", language)}</option>
              <option value="جميع الطلاب">{getTranslation("admin.students", language)}</option>
              <option value="أولياء الأمور">{getTranslation("admin.parent", language)}</option>
              <option value="الجميع">{getTranslation("admin.everyone", language)}</option>
            </select>

            <button
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4" /> {getTranslation("admin.createNew", language)}
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message={getTranslation("admin.loadingAnnouncements", language)} />
        ) : (
          <>            {announcements.length === 0 && (
              <EmptyState message={getTranslation("admin.noAnnouncements", language)} />
            )}            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {announcement.title}
                        </h4>
                        <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                            announcement.priority
                          )}`}
                        >
                          {announcement.priority}
                        </span>
                        {announcement.pinned && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                            PINNED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        {announcement.school_name && (
                          <span>
                            {getTranslation("admin.schoolName", language)}:{" "}
                            <span className="font-medium">{announcement.school_name}</span>
                          </span>
                        )}
                        <span>
                          {getTranslation("admin.targetGroup", language)}:{" "}
                          <span className="font-medium">{announcement.target_group}</span>
                        </span>
                        <span>
                          {getTranslation("admin.created", language)}:{" "}
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`font-medium ${
                            announcement.pinned
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-500"
                          }`}
                        >
                          {announcement.pinned
                            ? getTranslation("admin.published", language)
                            : getTranslation("admin.draft", language)}
                        </span>
                      </div>
                    </div>

                    <div className="relative ml-4">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === announcement.id
                              ? null
                              : announcement.id
                          )
                        }
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === announcement.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                          {!announcement.pinned && (
                            <button
                              onClick={() => handlePublishAnnouncement(announcement.id)}
                              disabled={actionLoading === `publish-${announcement.id}`}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary-400 disabled:opacity-50"
                            >
                              <Send className="h-4 w-4" /> {getTranslation("admin.publish", language)}
                            </button>
                          )}
                          {announcement.pinned && (
                            <button
                              onClick={() => handleArchiveAnnouncement(announcement.id)}
                              disabled={actionLoading === `archive-${announcement.id}`}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-sm text-yellow-700 dark:text-yellow-400 disabled:opacity-50"
                            >
                              <Archive className="h-4 w-4" /> {getTranslation("admin.archive", language)}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setConfirmDelete(announcement.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" /> {getTranslation("admin.delete", language)}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          title={getTranslation("admin.deleteAnnouncement", language)}
          message={getTranslation("admin.confirmDeleteAnnouncement", language)}
          confirmLabel={getTranslation("admin.delete", language)}
          cancelLabel={getTranslation("admin.cancel", language)}
          onConfirm={() => handleDeleteAnnouncement(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          isLoading={actionLoading === `delete-${confirmDelete}`}
        />
      )}

      {/* Create Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation("admin.createNewAnnouncement", language)}
              </h3>

              <div className="space-y-4">
                {/* School selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("admin.schoolName", language)} *
                  </label>
                  {schools.length === 0 ? (
                    <p className="text-sm text-red-500">No schools available</p>
                  ) : (
                    <select
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {schools.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.school_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("admin.title", language)} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder={getTranslation("admin.announcementTitle", language)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("admin.content", language)} *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-24 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder={getTranslation("admin.announcementContent", language)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("admin.priority", language)}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                    <option value="low">{getTranslation("admin.low", language)}</option>
                    <option value="medium">{getTranslation("admin.medium", language)}</option>
                      <option value="high">{getTranslation("admin.high", language)}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("admin.targetGroup", language)}
                    </label>
                    <select
                      value={formData.target_group}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_group: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <option value="STUDENTS">{getTranslation("admin.students", language)}</option>
                      <option value="PARENTS">{getTranslation("admin.parent", language)}</option>
                      <option value="EVERYONE">{getTranslation("admin.everyone", language)}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("admin.category", language)}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder={getTranslation("admin.categoryPlaceholder", language)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setCreateModal(false);
                    setFormData((prev) => ({
                      title: "",
                      content: "",
                      priority: "medium",
                      target_group: "EVERYONE",
                      category: "",
                      school: prev.school,
                    }));
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  {getTranslation("admin.cancel", language)}
                </button>
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={actionLoading === "create"}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {getTranslation("admin.create", language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
