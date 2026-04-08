export interface PrivateConversationIDPayload {
  type: "private";
  other_user_id: string | number;
  student_id: string;
}

export interface GetConversationIDResponse {
  conversation_id: string;
  name: string;
  type: "private" | "group";
  student_id: string | null;
}

export interface ChatListQueryParams {
  search?: string;
  page?: number;
  page_size?: number;
  class_group_id?: string;
  student_id?: string;
}

export interface ChatListMessagePreview {
  content: string;
  timestamp: string;
  type: string;
  file: string | null;
}

export interface ContextualChatListItem {
  conversation_id: string | null;
  participant_user_id: number;
  participant_role: "parent" | "teacher" | "school";
  participant_name: string;
  participant_email: string;
  participant_avatar: string | null;
  student_id: string;
  student_name: string;
  class_group_id: string | null;
  class_group_name: string | null;
  module_names: string[];
  school_name: string | null;
  last_message: ChatListMessagePreview | null;
  timestamp: string | null;
  unread: number;
  online: boolean;
}

export interface PaginatedChatListResponse<T = ContextualChatListItem> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
}

export interface GetConvesationMessagesPayload {
  conversation_id: string;
}
export interface MarkChatMessagedAsRead {
  conversation_id: string;
}

