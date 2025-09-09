export interface PrivateConversationIDPayload {
  type: "private";
  other_user_id: string | number;
}

export interface GetConversationIDResponse {
  conversation_id: string;
  name: string;
  type: "private" | "group";
}
