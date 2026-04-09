import React, { useEffect, useMemo, useState } from "react";

import { useLanguage } from "../../contexts/LanguageContext";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { Student } from "../../models/Student";
import { Teacher } from "../../models/Teacher";
import { chat_http_client } from "../../services/chat/chat_http_client";
import {
  ContextualChatListItem,
  PaginatedChatListResponse,
} from "../../services/chat/chat_http_payload_types";
import { getTranslation } from "../../utils/translations";
import ContextualChatWorkspace from "./ContextualChatWorkspace";

interface ParentChatProps {
  userType: "parent" | "teacher";
  teachers_list: Teacher[];
  parent_id: number;
  students: Student[];
  selectedStudentId?: string | null;
}

function getTimestampValue(value?: string | null) {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mergeParentChatsByParticipant(items: ContextualChatListItem[]) {
  const merged = new Map<
    number,
    ContextualChatListItem & { __studentNames: string[]; __moduleNames: string[] }
  >();

  items.forEach((item) => {
    const existing = merged.get(item.participant_user_id);
    if (!existing) {
      merged.set(item.participant_user_id, {
        ...item,
        __studentNames: item.student_name ? [item.student_name] : [],
        __moduleNames: [...item.module_names],
      });
      return;
    }

    const nextTimestamp = getTimestampValue(item.timestamp ?? item.last_message?.timestamp ?? null);
    const currentTimestamp = getTimestampValue(
      existing.timestamp ?? existing.last_message?.timestamp ?? null
    );
    const nextStudentNames = Array.from(new Set([...existing.__studentNames, item.student_name]));
    const nextModuleNames = Array.from(new Set([...existing.__moduleNames, ...item.module_names]));

    if (nextTimestamp > currentTimestamp) {
      merged.set(item.participant_user_id, {
        ...existing,
        ...item,
        unread: existing.unread + item.unread,
        student_name: nextStudentNames.join(", "),
        module_names: nextModuleNames,
        __studentNames: nextStudentNames,
        __moduleNames: nextModuleNames,
      });
      return;
    }

    merged.set(item.participant_user_id, {
      ...existing,
      unread: existing.unread + item.unread,
      student_name: nextStudentNames.join(", "),
      module_names: nextModuleNames,
      __studentNames: nextStudentNames,
      __moduleNames: nextModuleNames,
    });
  });

  return Array.from(merged.values()).map(({ __studentNames, __moduleNames, ...item }) => item);
}

function mergeChatPages(
  current: ContextualChatListItem[],
  incoming: ContextualChatListItem[],
  replace = false
) {
  if (replace) {
    return incoming;
  }

  const merged = new Map<string, ContextualChatListItem>();
  [...current, ...incoming].forEach((item) => {
    merged.set(`${item.student_id}:${item.participant_user_id}`, item);
  });
  return Array.from(merged.values());
}

const ParentChat: React.FC<ParentChatProps> = ({ parent_id, students, selectedStudentId }) => {
  const { language } = useLanguage();
  const [chatType, setChatType] = useState<"teachers" | "schools">("teachers");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const [chatResponse, setChatResponse] = useState<PaginatedChatListResponse>({
    count: 0,
    page: 1,
    page_size: 20,
    total_pages: 0,
    results: [],
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const studentOptions = useMemo(
    () => students.map((student) => ({ value: student.student_id, label: student.full_name })),
    [students]
  );

  useEffect(() => {
    setPage(1);
  }, [chatType, selectedStudentId, debouncedSearch]);

  useEffect(() => {
    if (!selectedStudentId) {
      setChatResponse({ count: 0, page: 1, page_size: 20, total_pages: 0, results: [] });
      return;
    }

    let cancelled = false;

    async function loadChats() {
      setIsLoading(true);
      const params = {
        student_id: selectedStudentId ?? undefined,
        search: debouncedSearch,
        page,
      };
      const response =
        chatType === "teachers"
          ? await chat_http_client.get_current_parent_teachers_chats(params)
          : await chat_http_client.get_current_parent_schools_chats(params);

      if (!response.ok || cancelled) {
        setIsLoading(false);
        return;
      }

      const data: PaginatedChatListResponse = response.data;
      setChatResponse((prev) => ({
        ...data,
        results: mergeChatPages(prev.results, data.results, page === 1),
      }));
      setIsLoading(false);
    }

    loadChats();

    return () => {
      cancelled = true;
    };
  }, [chatType, selectedStudentId, debouncedSearch, page]);

  function patchChatItem(studentId: string, participantUserId: number, patch: Partial<ContextualChatListItem>) {
    setChatResponse((prev) => ({
      ...prev,
      results: prev.results.map((item) =>
        item.student_id === studentId && item.participant_user_id === participantUserId
          ? { ...item, ...patch }
          : item
      ),
    }));
  }

  const selectedStudentLabel = studentOptions.find(
    (option) => option.value === selectedStudentId
  )?.label;

  const visibleItems = useMemo(
    () => mergeParentChatsByParticipant(chatResponse.results),
    [chatResponse.results]
  );

  return (
    <ContextualChatWorkspace
      title={chatType === "teachers" ? getTranslation("teachers", language) : getTranslation("schools", language)}
      searchPlaceholder={getTranslation("searchChatsByParticipantOrStudent", language)}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      sidebarControls={
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setChatType("teachers")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chatType === "teachers"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {getTranslation("teachers", language)}
            </button>
            <button
              type="button"
              onClick={() => setChatType("schools")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chatType === "schools"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {getTranslation("schools", language)}
            </button>
          </div>

          <div className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            {selectedStudentLabel || getTranslation("selectStudent", language)}
          </div>
        </div>
      }
      items={visibleItems}
      isListLoading={isLoading}
      hasMore={chatResponse.page < chatResponse.total_pages}
      onLoadMore={() => setPage((prev) => prev + 1)}
      currentUserId={parent_id}
      emptyStateTitle={
        students.length === 0
          ? getTranslation("noStudentsFound", language)
          : selectedStudentId
            ? getTranslation("noChatsFound", language)
            : getTranslation("selectStudent", language)
      }
      emptyStateHint={
        selectedStudentId
          ? getTranslation("noChatsMatchFilters", language)
          : getTranslation("chooseStudentToViewChats", language)
      }
      selectionPrompt={getTranslation("selectChatToStart", language)}
      selectionHint={getTranslation("chooseStudentToViewChats", language)}
      activeFilterLabel={selectedStudentLabel}
      onPatchChatItem={patchChatItem}
    />
  );
};

export default ParentChat;