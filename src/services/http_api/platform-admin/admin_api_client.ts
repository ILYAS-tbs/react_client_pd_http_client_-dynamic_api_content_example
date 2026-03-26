import { SERVER_BASE_URL } from "../server_constants";
import { getCSRFToken } from "../../../lib/get_CSRFToken";
import {
  PlatformAdmin,
  School,
  User,
  AbsenceReport,
  BehaviourReport,
  Announcement,
  Membership,
  PaginatedResponse,
  SuccessResponse,
  DashboardStats,
} from "./admin_types";

const BASE_URL = `${SERVER_BASE_URL}/api/admin`;

const URLS = {
  // Admin Management
  admins: `${BASE_URL}/admins/`,
  admin_detail: `${BASE_URL}/admins/{id}/`,
  admin_deactivate: `${BASE_URL}/admins/{id}/deactivate/`,
  admin_reactivate: `${BASE_URL}/admins/{id}/reactivate/`,

  // School Management
  schools: `${BASE_URL}/schools/`,
  school_detail: `${BASE_URL}/schools/{id}/`,
  school_activate: `${BASE_URL}/schools/{id}/activate/`,
  school_suspend: `${BASE_URL}/schools/{id}/suspend/`,

  // User Management
  users: `${BASE_URL}/users/`,
  user_detail: `${BASE_URL}/users/{id}/`,
  user_deactivate: `${BASE_URL}/users/{id}/deactivate/`,
  user_reactivate: `${BASE_URL}/users/{id}/reactivate/`,
  user_bulk_deactivate: `${BASE_URL}/users/bulk_deactivate/`,
  user_bulk_reactivate: `${BASE_URL}/users/bulk_reactivate/`,

  // Report Management
  reports: `${BASE_URL}/reports/`,
  report_detail: `${BASE_URL}/reports/{id}/`,
  report_approve: `${BASE_URL}/reports/{id}/approve/`,
  report_reject: `${BASE_URL}/reports/{id}/reject/`,

  // Announcement Management
  announcements: `${BASE_URL}/announcements/`,
  announcement_detail: `${BASE_URL}/announcements/{id}/`,
  announcement_publish: `${BASE_URL}/announcements/{id}/publish/`,
  announcement_archive: `${BASE_URL}/announcements/{id}/archive/`,

  // Subscription Management
  memberships: `${BASE_URL}/memberships/`,
  membership_detail: `${BASE_URL}/memberships/{id}/`,
  membership_extend: `${BASE_URL}/memberships/{id}/extend_subscription/`,
  membership_cancel: `${BASE_URL}/memberships/{id}/cancel_subscription/`,

  // Overview
  overview_stats: `${BASE_URL}/overview/stats/`,

  // Audit Logs
  audit_logs: `${BASE_URL}/audit-logs/`,
};

// Helper function to make authenticated requests
const makeRequest = async <T>(
  url: string,
  options: RequestInit = {},
  csrfToken?: string
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge in existing headers if provided as a record
  if (options.headers && typeof options.headers === "object" && !Array.isArray(options.headers)) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  // Add CSRF token for non-GET requests
  const method = options.method || "GET";
  if (method !== "GET") {
    const token = csrfToken || getCSRFToken();
    if (token) {
      headers["X-CSRFToken"] = token;
    } else {
      console.warn("⚠️ CSRF token not available - request may fail with 403");
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    });

    // Handle specific HTTP errors
    if (response.status === 403) {
      throw new Error("Access Denied (403) - Check permissions, authentication, or CSRF token");
    }

    if (response.status === 401) {
      throw new Error("Unauthorized (401) - Please log in again");
    }

    if (response.status === 404) {
      throw new Error("Resource Not Found (404)");
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({ detail: "Bad Request" }));
      throw new Error(errorData.detail || "Validation Error");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "An error occurred",
      }));
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    // Log for debugging
    console.error("API Request Error:", {
      url,
      method,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
};

// Admin API Client
export const adminApiClient = {
  // ============== ADMIN MANAGEMENT ==============
  async listAdmins(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      role?: string;
      is_active?: boolean;
      search?: string;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<PlatformAdmin>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.is_active !== undefined && {
        is_active: filters.is_active.toString(),
      }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.ordering && { ordering: filters.ordering }),
    });

    return makeRequest(`${URLS.admins}?${params}`);
  },

  async getAdmin(id: string): Promise<PlatformAdmin> {
    return makeRequest(URLS.admin_detail.replace("{id}", id));
  },

  async createAdmin(data: Partial<PlatformAdmin>, csrfToken?: string): Promise<PlatformAdmin> {
    return makeRequest(URLS.admins, {
      method: "POST",
      body: JSON.stringify(data),
    }, csrfToken);
  },

  async updateAdmin(
    id: string,
    data: Partial<PlatformAdmin>,
    csrfToken?: string
  ): Promise<PlatformAdmin> {
    return makeRequest(URLS.admin_detail.replace("{id}", id), {
      method: "PUT",
      body: JSON.stringify(data),
    }, csrfToken);
  },

  async deactivateAdmin(id: string, csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.admin_deactivate.replace("{id}", id), {
      method: "POST",
    }, csrfToken);
  },

  async reactivateAdmin(id: string, csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.admin_reactivate.replace("{id}", id), {
      method: "POST",
    }, csrfToken);
  },

  // ============== SCHOOL MANAGEMENT ==============
  async listSchools(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      school_level?: string;
      type?: string;
      search?: string;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<School>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.school_level && { school_level: filters.school_level }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.ordering && { ordering: filters.ordering }),
    });

    return makeRequest(`${URLS.schools}?${params}`);
  },

  async getSchool(id: string): Promise<School> {
    return makeRequest(URLS.school_detail.replace("{id}", id));
  },

  async updateSchool(id: string, data: Partial<School>, csrfToken?: string): Promise<School> {
    return makeRequest(URLS.school_detail.replace("{id}", id), {
      method: "PATCH",
      body: JSON.stringify(data),
    }, csrfToken);
  },

  async activateSchool(id: string, csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.school_activate.replace("{id}", id), {
      method: "POST",
    }, csrfToken);
  },

  async suspendSchool(id: string, csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.school_suspend.replace("{id}", id), {
      method: "POST",
    }, csrfToken);
  },

  // ============== USER MANAGEMENT ==============
  async listUsers(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      role?: string;
      is_active?: boolean;
      search?: string;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.is_active !== undefined && {
        is_active: filters.is_active.toString(),
      }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.ordering && { ordering: filters.ordering }),
    });

    return makeRequest(`${URLS.users}?${params}`);
  },

  async getUser(id: number): Promise<User> {
    return makeRequest(URLS.user_detail.replace("{id}", id.toString()));
  },

  async deactivateUser(userId: number, csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.user_deactivate.replace("{id}", userId.toString()), {
      method: "POST",
    }, csrfToken);
  },

  async reactivateUser(userId: number, csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.user_reactivate.replace("{id}", userId.toString()), {
      method: "POST",
    }, csrfToken);
  },

  async bulkDeactivateUsers(userIds: number[], csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.user_bulk_deactivate, {
      method: "POST",
      body: JSON.stringify({ user_ids: userIds }),
    }, csrfToken);
  },

  async bulkReactivateUsers(userIds: number[], csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.user_bulk_reactivate, {
      method: "POST",
      body: JSON.stringify({ user_ids: userIds }),
    }, csrfToken);
  },

  // ============== REPORT MANAGEMENT ==============
  async listReports(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      report_type?: "absence" | "behaviour";
      status?: string;
      school?: string;
      search?: string;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<AbsenceReport | BehaviourReport>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.report_type && { report_type: filters.report_type }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.school && { school: filters.school }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.ordering && { ordering: filters.ordering }),
    });

    return makeRequest(`${URLS.reports}?${params}`);
  },

  async getReport(
    id: string,
    reportType: "absence" | "behaviour" = "absence"
  ): Promise<AbsenceReport | BehaviourReport> {
    return makeRequest(
      `${URLS.report_detail.replace("{id}", id)}?report_type=${reportType}`
    );
  },

  async approveReport(
    reportId: string,
    comment?: string,
    csrfToken?: string
  ): Promise<AbsenceReport | BehaviourReport> {
    return makeRequest(URLS.report_approve.replace("{id}", reportId), {
      method: "POST",
      body: JSON.stringify({ comment }),
    }, csrfToken);
  },

  async rejectReport(
    reportId: string,
    reason: string,
    csrfToken?: string
  ): Promise<AbsenceReport | BehaviourReport> {
    return makeRequest(URLS.report_reject.replace("{id}", reportId), {
      method: "POST",
      body: JSON.stringify({ reason }),
    }, csrfToken);
  },

  // ============== ANNOUNCEMENT MANAGEMENT ==============
  async listAnnouncements(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      category?: string;
      target_group?: string;
      pinned?: boolean;
      search?: string;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<Announcement>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.target_group && { target_group: filters.target_group }),
      ...(filters?.pinned !== undefined && { pinned: filters.pinned.toString() }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.ordering && { ordering: filters.ordering }),
    });

    return makeRequest(`${URLS.announcements}?${params}`);
  },

  async getAnnouncement(id: string): Promise<Announcement> {
    return makeRequest(URLS.announcement_detail.replace("{id}", id));
  },

  async createAnnouncement(data: Partial<Announcement>, csrfToken?: string): Promise<Announcement> {
    return makeRequest(URLS.announcements, {
      method: "POST",
      body: JSON.stringify(data),
    }, csrfToken);
  },

  async updateAnnouncement(
    id: string,
    data: Partial<Announcement>,
    csrfToken?: string
  ): Promise<Announcement> {
    return makeRequest(URLS.announcement_detail.replace("{id}", id), {
      method: "PATCH",
      body: JSON.stringify(data),
    }, csrfToken);
  },

  async publishAnnouncement(id: string, csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.announcement_publish.replace("{id}", id), {
      method: "POST",
    }, csrfToken);
  },

  async archiveAnnouncement(id: string, csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.announcement_archive.replace("{id}", id), {
      method: "POST",
    }, csrfToken);
  },

  async deleteAnnouncement(id: string, csrfToken?: string): Promise<void> {
    return makeRequest(URLS.announcement_detail.replace("{id}", id), {
      method: "DELETE",
    }, csrfToken);
  },

  // ============== SUBSCRIPTION MANAGEMENT ==============
  async listMemberships(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      type?: string;
      is_active?: boolean;
      search?: string;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<Membership>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.is_active !== undefined && {
        is_active: filters.is_active.toString(),
      }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.ordering && { ordering: filters.ordering }),
    });

    return makeRequest(`${URLS.memberships}?${params}`);
  },

  async getMembership(id: string): Promise<Membership> {
    return makeRequest(URLS.membership_detail.replace("{id}", id));
  },

  async extendMembership(
    id: string,
    months: number,
    reason?: string,
    csrfToken?: string
  ): Promise<SuccessResponse> {
    return makeRequest(URLS.membership_extend.replace("{id}", id), {
      method: "POST",
      body: JSON.stringify({ months, reason }),
    }, csrfToken);
  },

  async cancelMembership(id: string, csrfToken?: string): Promise<SuccessResponse> {
    return makeRequest(URLS.membership_cancel.replace("{id}", id), {
      method: "POST",
    }, csrfToken);
  },

  // ============== AUDIT LOGS ==============
  async listAuditLogs(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      action_type?: string;
      entity_type?: string;
      admin?: string;
      date_from?: string;
      date_to?: string;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.action_type && { action_type: filters.action_type }),
      ...(filters?.entity_type && { entity_type: filters.entity_type }),
      ...(filters?.admin && { admin: filters.admin }),
      ...(filters?.date_from && { date_from: filters.date_from }),
      ...(filters?.date_to && { date_to: filters.date_to }),
      ...(filters?.ordering && { ordering: filters.ordering }),
    });

    return makeRequest(`${URLS.audit_logs}?${params}`);
  },

  // ============== DASHBOARD OVERVIEW ==============
  async getDashboardStats(): Promise<DashboardStats> {
    return makeRequest(URLS.overview_stats);
  },
};

export default adminApiClient;
