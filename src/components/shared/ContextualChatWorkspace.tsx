import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock,
  Mail,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  User,
  Video,
  X,
} from "lucide-react";
import { SyncLoader } from "react-spinners";

import { getCSRFToken } from "../../lib/get_CSRFToken";
import { Message } from "../../models/chat_system/Message";
import { chat_http_client } from "../../services/chat/chat_http_client";
import {
  ContextualChatListItem,
  GetConversationIDResponse,
  GetConvesationMessagesPayload,
  MarkChatMessagedAsRead,
  PrivateConversationIDPayload,
} from "../../services/chat/chat_http_payload_types";
import { WEBSOCKET_BASEURL } from "../../services/http_api/server_constants";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { FilePreview } from "./file_preview";

interface ContextualChatWorkspaceProps {
  title: string;
  searchPlaceholder: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sidebarControls?: React.ReactNode;
  items: ContextualChatListItem[];
  isListLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  currentUserId: number;
  emptyStateTitle: string;
  emptyStateHint: string;
  selectionPrompt: string;
  selectionHint?: string;
  activeFilterLabel?: string;
  onPatchChatItem?: (
    studentId: string,
    participantUserId: number,
    patch: Partial<ContextualChatListItem>
  ) => void;
}

interface FrontendMessage {
  id: string;
  sender: "self" | "other";
  content: string;
  timestamp: Date | null;
  type: string;
  file: string | null;
}

function getChatKey(item: ContextualChatListItem) {
  return `${item.student_id}:${item.participant_user_id}`;
}

function mapApiMessages(messages: Message[], currentUserId: number): FrontendMessage[] {
  return messages.map((message) => ({
    id: message.message_id,
    sender: String(message.from_user?.id) === String(currentUserId) ? "self" : "other",
    content: message.content ?? "",
    timestamp: message.timestamp ? new Date(message.timestamp) : null,
    type: message.type ?? "text",
    file: (message.file as string | null) ?? null,
  }));
}

function formatTime(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ContextualChatWorkspace: React.FC<ContextualChatWorkspaceProps> = ({
  title,
  searchPlaceholder,
  searchTerm,
  onSearchChange,
  sidebarControls,
  items,
  isListLoading,
  hasMore,
  onLoadMore,
  currentUserId,
  emptyStateTitle,
  emptyStateHint,
  selectionPrompt,
  selectionHint,
  activeFilterLabel,
  onPatchChatItem,
}) => {
  const { language } = useLanguage();

  const [selectedChatKey, setSelectedChatKey] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState("");
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const selectedChat = useMemo(
    () => items.find((item) => getChatKey(item) === selectedChatKey) ?? null,
    [items, selectedChatKey]
  );
  const messages = useMemo(
    () => mapApiMessages(conversationMessages, currentUserId),
    [conversationMessages, currentUserId]
  );

  useEffect(() => {
    if (!selectedChatKey || selectedChat) {
      return;
    }

    setSelectedChatKey(null);
    setConversationId("");
    setConversationMessages([]);
    setIsThreadLoading(false);
  }, [selectedChat, selectedChatKey]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    const websocket = new WebSocket(`${WEBSOCKET_BASEURL}/ws/conversation/${conversationId}/`);
    socketRef.current = websocket;

    websocket.onmessage = (event) => {
      const incomingMessage: Message = JSON.parse(event.data);
      setConversationMessages((prev) => [...prev, incomingMessage]);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      websocket.close();
      if (socketRef.current === websocket) {
        socketRef.current = null;
      }
    };
  }, [conversationId]);

  async function fetchMessages(nextConversationId: string) {
    const csrfToken = getCSRFToken()!;
    const payload: GetConvesationMessagesPayload = {
      conversation_id: nextConversationId,
    };
    const response = await chat_http_client.get_conversation_messages(payload, csrfToken);
    if (!response.ok) {
      console.error("Failed to fetch the conversation messages");
      setConversationMessages([]);
      return;
    }
    setConversationMessages(response.data);
  }

  async function markMessagesAsRead(nextConversationId: string, item: ContextualChatListItem) {
    const csrfToken = getCSRFToken()!;
    const payload: MarkChatMessagedAsRead = {
      conversation_id: nextConversationId,
    };
    await chat_http_client.mark_conv_messaged_as_read(payload, csrfToken);
    onPatchChatItem?.(item.student_id, item.participant_user_id, {
      unread: 0,
      conversation_id: nextConversationId,
    });
  }

  async function handleSelectingChat(item: ContextualChatListItem) {
    setSelectedChatKey(getChatKey(item));
    setIsThreadLoading(true);

    let nextConversationId = item.conversation_id;
    if (!nextConversationId) {
      const csrfToken = getCSRFToken()!;
      const payload: PrivateConversationIDPayload = {
        type: "private",
        other_user_id: item.participant_user_id,
        student_id: item.student_id,
      };
      const response = await chat_http_client.get_conversation_id(payload, csrfToken);
      if (!response.ok) {
        console.error("Failed to get the conversation ID");
        setIsThreadLoading(false);
        return;
      }
      const data: GetConversationIDResponse = response.data;
      nextConversationId = data.conversation_id;
      onPatchChatItem?.(item.student_id, item.participant_user_id, {
        conversation_id: nextConversationId,
      });
    }

    setConversationId(nextConversationId);
    await fetchMessages(nextConversationId);
    await markMessagesAsRead(nextConversationId, item);
    setIsThreadLoading(false);
  }

  function sendTextMessage(text: string) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          message_type: "chat_message",
          message: text,
        })
      );
    }
  }

  function sendFileMessage(messageId: string) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          message_type: "chat_file_message",
          message_id: messageId,
        })
      );
    }
  }

  async function handleSendMessage() {
    if (!conversationId) {
      return;
    }

    if (message.trim()) {
      const nextText = message;
      setMessage("");
      sendTextMessage(nextText);
    }

    if (uploadedFile) {
      const formData = new FormData();
      formData.append("conversation_id", conversationId);
      formData.append("file", uploadedFile);

      const csrfToken = getCSRFToken()!;
      const response = await chat_http_client.upload_chat_file(formData, csrfToken);
      if (response.ok) {
        sendFileMessage(response.data.message_id);
      }
      setUploadedFile(null);
    }
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-[640px] flex overflow-hidden">
      <div className="w-[360px] border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            {activeFilterLabel ? (
              <p className="text-xs text-primary-600 dark:text-primary-300 mt-1">
                {getTranslation("activeFilters", language)}: {activeFilterLabel}
              </p>
            ) : null}
          </div>

          {sidebarControls}

          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isListLoading && items.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <SyncLoader color="#3fa7a3" />
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{emptyStateTitle}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{emptyStateHint}</p>
            </div>
          ) : (
            <>
              {items.map((item) => {
                const isSelected = getChatKey(item) === selectedChatKey;
                return (
                  <button
                    key={getChatKey(item)}
                    type="button"
                    onClick={() => handleSelectingChat(item)}
                    className={`w-full text-right p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? "bg-primary-50 dark:bg-primary-900/40 border-r-2 border-primary-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {item.participant_name}
                          </h4>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatTime(item.timestamp ?? item.last_message?.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          {getTranslation("studentLabel", language)}: {item.student_name}
                        </p>

                        {item.class_group_name ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {getTranslation("classGroupLabel", language)}: {item.class_group_name}
                          </p>
                        ) : null}

                        {item.module_names.length > 0 ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {getTranslation("moduleLabel", language)}: {item.module_names.join(", ")}
                          </p>
                        ) : null}

                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {getTranslation("email", language)}: {item.participant_email}
                        </p>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.last_message?.content || getTranslation("noMessagesYet", language)}
                          </p>
                          {item.unread > 0 ? (
                            <span className="bg-primary-500 text-white text-[11px] rounded-full px-2 py-1 min-w-[20px] text-center">
                              {item.unread}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {hasMore ? (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onLoadMore}
                    className="w-full px-4 py-2 text-sm font-medium rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-900/30"
                  >
                    {getTranslation("loadMore", language)}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {selectedChat.participant_name}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <span>{getTranslation("studentLabel", language)}: {selectedChat.student_name}</span>
                    {selectedChat.class_group_name ? (
                      <span>{getTranslation("classGroupLabel", language)}: {selectedChat.class_group_name}</span>
                    ) : null}
                    {selectedChat.module_names.length > 0 ? (
                      <span>{getTranslation("moduleLabel", language)}: {selectedChat.module_names.join(", ")}</span>
                    ) : null}
                    <span>{getTranslation("email", language)}: {selectedChat.participant_email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {isThreadLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <SyncLoader color="#3fa7a3" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60 dark:bg-gray-900/20">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                    <Clock className="h-8 w-8 mb-3" />
                    <p className="text-sm font-medium">{getTranslation("noMessagesYet", language)}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "self" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                          msg.sender === "self"
                            ? "bg-primary-500 text-white"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        {msg.type === "file" && msg.file ? (
                          <FilePreview url={msg.file} filename={msg.file.split("/").pop()} />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                        <p
                          className={`text-[11px] mt-2 ${
                            msg.sender === "self" ? "text-white/80" : "text-gray-500 dark:text-gray-300"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endOfMessagesRef} />
              </div>
            )}

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {uploadedFile ? (
                <div className="mb-3 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              <div className="flex items-end gap-3">
                <label className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <Paperclip className="h-5 w-5" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => setUploadedFile(event.target.files?.[0] ?? null)}
                  />
                </label>

                <div className="flex-1 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={2}
                    placeholder={getTranslation("messagePlaceholder", language)}
                    className="w-full resize-none bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!conversationId || (!message.trim() && !uploadedFile)}
                  className="p-3 rounded-xl bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-gray-500 dark:text-gray-400">
            <Mail className="h-10 w-10 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectionPrompt}</h3>
            <p className="text-sm mt-2 max-w-md">{selectionHint || getTranslation("selectChatToStart", language)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextualChatWorkspace;