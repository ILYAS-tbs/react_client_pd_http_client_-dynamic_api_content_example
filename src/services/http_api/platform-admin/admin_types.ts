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
  role: "school" | "teacher" | "parent" | "student" | "user";
  profile: {
    role: string;
    id: string;
  };
}

// Report Management
export interface AbsenceReport {
  id: string;
  student_id: string;
  student_name: string;
  parent_id: string;
  parent_name: string;
  teacher_id: string;
  teacher_name: string;
  school_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  absence_date: string;
  submit_date: string;
  review_date: string | null;
  admin_comment: string;
  created_at: string;
  updated_at: string;
}

export interface BehaviourReport {
  id: string;
  student_id: string;
  student_name: string;
  teacher_id: string;
  teacher_name: string;
  school_id: string;
  description: string;
  behavior_date: string;
  submit_date: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
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
  target_group: string;
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

// Common Responses
export interface SuccessResponse {
  detail: string;
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
  };
  reports: {
    absence_pending: number;
    absence_approved: number;
    absence_rejected: number;
    behaviour_total: number;
  };
  roles: {
    teachers: number;
    parents: number;
    students: number;
    admins: number;
  };
}

// Audit Log
export interface AdminAuditLog {
  id: string;
  admin?: {
    id: string;
    username: string;
    email: string;
  } | null;
  action_type: "create" | "update" | "delete" | "approve" | "reject" | "publish" | "deactivate" | "reactivate" | "bulk_action" | "other";
  entity_type: string;
  entity_id: string;
  entity_display: string;
  changes: Record<string, any>;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string;
  timestamp: string;
}
