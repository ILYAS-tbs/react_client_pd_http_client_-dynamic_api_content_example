// Admin Management
export interface PlatformAdmin {
  id: string;
  user_id: number;
  user_username: string;
  user_email: string;
  first_name: string;
  last_name: string;
  role: "SUPER_ADMIN" | "PLATFORM_MOD" | "SUPPORT";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  notes: string;
}

export interface RoleDetails {
  role: "school" | "teacher" | "parent" | "user";
  name?: string;
  full_name?: string;
  school_level?: string;
  school?: string | null;
  phone?: string | null;
}

// School Management
export interface School {
  id: number;
  user: number;
  school_name: string;
  email: string;
  phone_number: string;
  address: string;
  commune: string;
  commun: string;
  wilaya: string;
  school_level: "primary" | "middle" | "high";
  school_type: string;
  director_name: string;
  director_email: string;
  director_phone: string;
  total_students: number;
  total_teachers: number;
  total_classes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description: string;
  user_email: string;
  user_username: string;
  school_level_display?: string;
}

// User Management
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
  role: "school" | "teacher" | "parent" | "user";
  role_details?: RoleDetails;
  is_admin?: boolean;
  admin_role?: string | null;
  admin_status?: boolean | null;
}

export interface ParentChild {
  id: string;
  student_name: string;
  school_id: number | null;
  school_name: string | null;
  class_group_id: string | null;
  class_group_name: string | null;
}

export interface ParentSchoolLink {
  school_id: number;
  school_name: string | null;
}

export interface ParentFamily {
  id: number;
  full_name: string;
  email: string;
  total_children: number;
  total_schools: number;
  schools_involved: ParentSchoolLink[];
  children: ParentChild[];
  created_at: string;
  phone_number?: string | null;
  relationship_to_student?: string | null;
  address?: string | null;
}

export interface ParentsPerSchoolStat {
  school_id: number;
  school_name: string;
  parents_count: number;
  students_count: number;
}

export interface ParentFamilyStats {
  total_parents: number;
  total_students: number;
  average_children_per_parent: number;
  parents_with_1_child: number;
  parents_with_2_children: number;
  parents_with_3_plus_children: number;
  parents_per_school: ParentsPerSchoolStat[];
}

// Report Management
export interface AbsenceReport {
  id: string;
  absence_report_id: string;
  student: string;
  student_name: string;
  parent: string;
  parent_name: string;
  school: number;
  school_name: string;
  class_group: string;
  class_group_name: string;
  status: "pending" | "accepted" | "rejected";
  reason: string;
  absence_date: string;
  submit_date: string;
  reviewDate: string | null;
  review_date: string | null;
  adminComment: string;
  admin_comment: string;
  more_details: string;
  is_urgent: boolean;
  created_at: string;
  updated_at: string;
}

export interface BehaviourReport {
  id: string;
  behaviour_report_id: string;
  student: string;
  student_name: string;
  teacher: string;
  teacher_name: string;
  school: number;
  school_name: string;
  status: "pending" | "reviewed";
  description: string;
  conclusion: string;
  type: string;
  type_display: string;
  behavior_date: string;
  date: string;
  submit_date: string;
  severity: string;
  created_at: string;
  updated_at: string;
}

// Announcement Management
export interface Announcement {
  id: string;
  announcement_id: string;
  school: number;
  school_name: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  priority_display?: string;
  target_group: string;
  target_group_display?: string;
  pinned: boolean;
  is_published: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

// Subscription Management
export interface Membership {
  id: number;
  user: number;
  parent_email: string;
  parent_name: string;
  type: string;
  type_display?: string;
  is_active: boolean;
  start_date?: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

// Pagination Response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuditLogSummary {
  total: number;
  recent: AdminAuditLog[];
  by_action: Record<string, number>;
  by_entity: Record<string, number>;
}

export interface SchoolSummary {
  total: number;
  active: number;
  inactive: number;
  by_level: Record<string, number>;
  by_type: Record<string, number>;
  latest: School[];
}

export interface UserSummary {
  total: number;
  active: number;
  inactive: number;
  recent_signups_30d: number;
  by_role: Record<string, number>;
  recent: User[];
}

export interface ReportSummary {
  report_type: "absence" | "behaviour";
  total: number;
  pending: number;
  approved?: number;
  rejected?: number;
  reviewed?: number;
  urgent?: number;
  latest: Array<AbsenceReport | BehaviourReport>;
}

export interface AnnouncementSummary {
  total: number;
  published: number;
  draft: number;
  high_priority: number;
  latest: Announcement[];
}

export interface MembershipSummary {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  expiring_soon: number;
  by_type: Record<string, number>;
  upcoming_expirations: Membership[];
}

// Common Responses
export interface SuccessResponse {
  detail: string;
  count?: number;
  new_expiry?: string;
}

export interface ErrorResponse {
  detail: string;
  status?: number;
  [key: string]: any;
}

// Dashboard Stats
export interface DashboardStats {
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    unattached: number;
    unattached_non_admin: number;
    recent_signups_30d: number;
  };
  reports: {
    absence_pending: number;
    absence_approved: number;
    absence_rejected: number;
    behaviour_total: number;
    behaviour_pending: number;
  };
  roles: {
    teachers: number;
    parents: number;
    students: number;
    admins: number;
    all_admin_records: number;
  };
  academics: {
    students_total: number;
    class_groups_total: number;
    modules_total: number;
    students_with_parent: number;
  };
  memberships: {
    total: number;
    active: number;
    expired: number;
    expiring_soon: number;
  };
  announcements: {
    total: number;
    published: number;
    draft: number;
    high_priority: number;
  };
}

export interface AdminAlerts {
  inactive_schools: number;
  inactive_users: number;
  unattached_non_admin_users: number;
  pending_absence_reports: number;
  pending_behaviour_reports: number;
  expired_memberships: number;
  expiring_memberships: number;
  high_priority_announcements: number;
}

export interface WorkspaceSchoolSnapshot {
  id: number;
  school_name: string;
  school_level: string;
  school_type: string;
  is_active: boolean;
  total_students: number;
  total_teachers: number;
  total_classes: number;
  created_at: string;
}

export interface OverviewWorkspace {
  generated_at: string;
  stats: DashboardStats;
  alerts: AdminAlerts;
  recent_activity: AdminAuditLog[];
  recent_announcements: Announcement[];
  pending_reports: AbsenceReport[];
  expiring_memberships: Membership[];
  recent_users: User[];
  latest_schools: WorkspaceSchoolSnapshot[];
}

// Audit Log
export interface AdminAuditLog {
  id: string;
  admin?: string | null;
  admin_username?: string;
  admin_name?: string;
  admin_role?: string;
  action_type:
    | "create"
    | "update"
    | "delete"
    | "approve"
    | "reject"
    | "publish"
    | "archive"
    | "activate"
    | "suspend"
    | "deactivate"
    | "reactivate"
    | "extend"
    | "cancel"
    | "bulk_action"
    | "other";
  action_display?: string;
  entity_type: string;
  entity_id: string;
  entity_display: string;
  changes: Record<string, any>;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent?: string;
  timestamp: string;
}
