import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Send,
  Archive,
  Trash2,
} from "lucide-react";
import { Announcement } from "../../services/http_api/platform-admin/admin_types";
import { adminApiClient } from "../../services/http_api/platform-admin/admin_api_client";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "./ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

export const AnnouncementsManagement: React.FC = () => {
  const { language } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
    target_group: "STUDENTS",
    category: "",
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
        filters.targetGroup = targetFilter;
      }

      const response = await adminApiClient.listAnnouncements(
        currentPage,
        15,
        filters
      );

      setAnnouncements(response.results);
      setTotalPages(Math.ceil(response.count / 15));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch announcements"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, targetFilter]);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, searchTerm, targetFilter]);

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      setError(getTranslation("titleAndContentRequired", language));
      return;
    }

    try {
      setActionLoading("create");
      await adminApiClient.createAnnouncement({
        title: formData.title,
        content: formData.content,
        priority: formData.priority as any,
        target_group: formData.target_group as any,
        category: formData.category,
      } as any);

      setSuccess(getTranslation("announcementCreatedSuccessfully", language));
      setFormData({
        title: "",
        content: "",
        priority: "medium",
        target_group: "STUDENTS",
        category: "",
      });
      setCreateModal(false);
      fetchAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : getTranslation("failedCreateAnnouncement", language)
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishAnnouncement = async (id: string) => {
    try {
      setActionLoading(`publish-${id}`);
      await adminApiClient.publishAnnouncement(id);
      setSuccess(getTranslation("announcementPublishedSuccessfully", language));
      fetchAnnouncements();
      setOpenMenuId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : getTranslation("failedPublishAnnouncement", language)
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchiveAnnouncement = async (id: string) => {
    try {
      setActionLoading(`archive-${id}`);
      await adminApiClient.archiveAnnouncement(id);
      setSuccess(getTranslation("announcementArchivedSuccessfully", language));
      fetchAnnouncements();
      setOpenMenuId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : getTranslation("failedArchiveAnnouncement", language)
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      medium:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
      high: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    };
    return colors[priority] || colors.medium;
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
            {getTranslation("announcementsManagement", language)}
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation("searchAnnouncements", language)}
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
              <option value="all">{getTranslation("allAudiences", language)}</option>
              <option value="STUDENTS">{getTranslation("students", language)}</option>
              <option value="PARENTS">{getTranslation("parents", language)}</option>
              <option value="EVERYONE">{getTranslation("everyone", language)}</option>
            </select>

            <button
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4" /> {getTranslation("new", language)}
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message={getTranslation("loadingAnnouncements", language)} />
        ) : (
          <>
            <div className="space-y-4">
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
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                            announcement.priority
                          )}`}
                        >
                          {announcement.priority.toUpperCase()}
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
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {getTranslation("target", language)}:{" "}
                          <span className="font-medium">
                            {announcement.target_group}
                          </span>
                        </span>
                        <span>
                          {getTranslation("created", language)}:{" "}
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`${
                            announcement.is_published
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-500"
                          }`}
                        >
                          {announcement.is_published
                            ? getTranslation("published", language)
                            : getTranslation("draft", language)}
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
                          {!announcement.is_published && (
                            <button
                              onClick={() =>
                                handlePublishAnnouncement(announcement.id)
                              }
                              disabled={
                                actionLoading === `publish-${announcement.id}`
                              }
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm text-green-700 dark:text-green-400 disabled:opacity-50"
                            >
                              <Send className="h-4 w-4" /> {getTranslation("publish", language)}
                            </button>
                          )}
                          {announcement.is_published && (
                            <button
                              onClick={() =>
                                handleArchiveAnnouncement(announcement.id)
                              }
                              disabled={
                                actionLoading === `archive-${announcement.id}`
                              }
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-sm text-yellow-700 dark:text-yellow-400 disabled:opacity-50"
                            >
                              <Archive className="h-4 w-4" /> {getTranslation("archive", language)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Create Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation("createNewAnnouncement", language)}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("title", language)} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder={getTranslation("announcementTitle", language)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("content", language)} *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-24 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder={getTranslation("announcementContent", language)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("priority", language)}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <option value="low">{getTranslation("low", language)}</option>
                      <option value="medium">{getTranslation("medium", language)}</option>
                      <option value="high">{getTranslation("high", language)}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("targetGroup", language)}
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
                      <option value="STUDENTS">{getTranslation("students", language)}</option>
                      <option value="PARENTS">{getTranslation("parents", language)}</option>
                      <option value="EVERYONE">{getTranslation("everyone", language)}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("category", language)}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder={getTranslation("categoryPlaceholder", language)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setCreateModal(false);
                    setFormData({
                      title: "",
                      content: "",
                      priority: "medium",
                      target_group: "STUDENTS",
                      category: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  {getTranslation("cancel", language)}
                </button>
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={actionLoading === "create"}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {getTranslation("create", language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
