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
  AuditLogSummary,
  SchoolSummary,
  UserSummary,
  ReportSummary,
  AnnouncementSummary,
  MembershipSummary,
  OverviewWorkspace,
  AdminAuditLog,
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
  membership_summary: `${BASE_URL}/memberships/summary/`,

  // Overview
  overview_stats: `${BASE_URL}/overview/stats/`,
  overview_workspace: `${BASE_URL}/overview/workspace/`,

  // Audit Logs
  audit_logs: `${BASE_URL}/audit-logs/`,
  audit_logs_summary: `${BASE_URL}/audit-logs/summary/`,
  school_summary: `${BASE_URL}/schools/summary/`,
  user_summary: `${BASE_URL}/users/summary/`,
  report_summary: `${BASE_URL}/reports/summary/`,
  announcement_summary: `${BASE_URL}/announcements/summary/`,
};

type QueryValue = string | number | boolean | undefined | null;

const buildQuery = (params: Record<string, QueryValue>) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    query.set(key, String(value));
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};

export const normalizePaginatedResponse = <T>(
  response: PaginatedResponse<T> | T[]
): PaginatedResponse<T> => {
  if (Array.isArray(response)) {
    return {
      count: response.length,
      next: null,
      previous: null,
      results: response,
    };
  }

  return response;
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
    return makeRequest(
      `${URLS.admins}${buildQuery({
        page,
        page_size: pageSize,
        role: filters?.role,
        is_active: filters?.is_active,
        search: filters?.search,
        ordering: filters?.ordering,
      })}`
    );
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
      school_type?: string;
      search?: string;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<School>> {
    return makeRequest(
      `${URLS.schools}${buildQuery({
        page,
        page_size: pageSize,
        school_level: filters?.school_level,
        school_type: filters?.school_type,
        search: filters?.search,
        ordering: filters?.ordering,
      })}`
    );
  },

  async getSchoolSummary(filters?: {
    school_level?: string;
    school_type?: string;
    search?: string;
  }): Promise<SchoolSummary> {
    return makeRequest(
      `${URLS.school_summary}${buildQuery({
        school_level: filters?.school_level,
        school_type: filters?.school_type,
        search: filters?.search,
      })}`
    );
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
    return makeRequest(
      `${URLS.users}${buildQuery({
        page,
        page_size: pageSize,
        role: filters?.role,
        is_active: filters?.is_active,
        search: filters?.search,
        ordering: filters?.ordering,
      })}`
    );
  },

  async getUserSummary(filters?: {
    role?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<UserSummary> {
    return makeRequest(
      `${URLS.user_summary}${buildQuery({
        role: filters?.role,
        is_active: filters?.is_active,
        search: filters?.search,
      })}`
    );
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
    return makeRequest(
      `${URLS.reports}${buildQuery({
        page,
        page_size: pageSize,
        report_type: filters?.report_type,
        status: filters?.status,
        school: filters?.school,
        search: filters?.search,
        ordering: filters?.ordering,
      })}`
    );
  },

  async getReportSummary(filters?: {
    report_type?: "absence" | "behaviour";
    status?: string;
    school?: string;
    search?: string;
  }): Promise<ReportSummary> {
    return makeRequest(
      `${URLS.report_summary}${buildQuery({
        report_type: filters?.report_type,
        status: filters?.status,
        school: filters?.school,
        search: filters?.search,
      })}`
    );
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
    return makeRequest(
      `${URLS.announcements}${buildQuery({
        page,
        page_size: pageSize,
        category: filters?.category,
        target_group: filters?.target_group,
        pinned: filters?.pinned,
        search: filters?.search,
        ordering: filters?.ordering,
      })}`
    );
  },

  async getAnnouncementSummary(filters?: {
    category?: string;
    target_group?: string;
    pinned?: boolean;
    search?: string;
  }): Promise<AnnouncementSummary> {
    return makeRequest(
      `${URLS.announcement_summary}${buildQuery({
        category: filters?.category,
        target_group: filters?.target_group,
        pinned: filters?.pinned,
        search: filters?.search,
      })}`
    );
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
    return makeRequest(
      `${URLS.memberships}${buildQuery({
        page,
        page_size: pageSize,
        type: filters?.type,
        is_active: filters?.is_active,
        search: filters?.search,
        ordering: filters?.ordering,
      })}`
    );
  },

  async getMembershipSummary(filters?: {
    type?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<MembershipSummary> {
    return makeRequest(
      `${URLS.membership_summary}${buildQuery({
        type: filters?.type,
        is_active: filters?.is_active,
        search: filters?.search,
      })}`
    );
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
      search?: string;
      date_from?: string;
      date_to?: string;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<AdminAuditLog>> {
    return makeRequest(
      `${URLS.audit_logs}${buildQuery({
        page,
        page_size: pageSize,
        action_type: filters?.action_type,
        entity_type: filters?.entity_type,
        admin: filters?.admin,
        search: filters?.search,
        date_from: filters?.date_from,
        date_to: filters?.date_to,
        ordering: filters?.ordering,
      })}`
    );
  },

  async getAuditLogSummary(filters?: {
    action_type?: string;
    entity_type?: string;
    admin?: string;
    search?: string;
  }): Promise<AuditLogSummary> {
    return makeRequest(
      `${URLS.audit_logs_summary}${buildQuery({
        action_type: filters?.action_type,
        entity_type: filters?.entity_type,
        admin: filters?.admin,
        search: filters?.search,
      })}`
    );
  },

  // ============== DASHBOARD OVERVIEW ==============
  async getDashboardStats(): Promise<DashboardStats> {
    return makeRequest(URLS.overview_stats);
  },

  async getOverviewWorkspace(): Promise<OverviewWorkspace> {
    return makeRequest(URLS.overview_workspace);
  },
};

export default adminApiClient;
