import React, { useEffect, useMemo, useState } from "react";

import { useLanguage } from "../../contexts/LanguageContext";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import { chat_http_client } from "../../services/chat/chat_http_client";
import {
  ContextualChatListItem,
  PaginatedChatListResponse,
} from "../../services/chat/chat_http_payload_types";
import { getTranslation } from "../../utils/translations";
import ContextualChatWorkspace from "./ContextualChatWorkspace";

interface TeacherChatProps {
  userType: "parent" | "teacher";
  teacher_id: number;
  classGroups: TeacherModuleClassGroup[];
}

function getTimestampValue(value?: string | null) {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mergeTeacherChatsByParent(items: ContextualChatListItem[]) {
  const merged = new Map<number, ContextualChatListItem & { __studentNames: string[] }>();

  items.forEach((item) => {
    const existing = merged.get(item.participant_user_id);
    if (!existing) {
      merged.set(item.participant_user_id, {
        ...item,
        __studentNames: item.student_name ? [item.student_name] : [],
      });
      return;
    }

    const nextTimestamp = getTimestampValue(item.timestamp ?? item.last_message?.timestamp ?? null);
    const currentTimestamp = getTimestampValue(
      existing.timestamp ?? existing.last_message?.timestamp ?? null
    );
    const nextStudentNames = Array.from(new Set([...existing.__studentNames, item.student_name]));

    if (nextTimestamp > currentTimestamp) {
      merged.set(item.participant_user_id, {
        ...existing,
        ...item,
        unread: existing.unread + item.unread,
        student_name: nextStudentNames.join(", "),
        __studentNames: nextStudentNames,
      });
      return;
    }

    merged.set(item.participant_user_id, {
      ...existing,
      unread: existing.unread + item.unread,
      student_name: nextStudentNames.join(", "),
      __studentNames: nextStudentNames,
    });
  });

  return Array.from(merged.values()).map(({ __studentNames, ...item }) => item);
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

const TeacherChat: React.FC<TeacherChatProps> = ({ teacher_id, classGroups }) => {
  const { language } = useLanguage();

  const classGroupOptions = useMemo(() => {
    const byId = new Map<string, string>();
    classGroups.forEach((entry) => {
      if (!byId.has(entry.class_group.class_group_id)) {
        byId.set(entry.class_group.class_group_id, entry.class_group.name);
      }
    });
    return Array.from(byId.entries()).map(([value, label]) => ({ value, label }));
  }, [classGroups]);

  const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
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

  useEffect(() => {
    setPage(1);
  }, [selectedClassGroupId, debouncedSearch]);

  useEffect(() => {
    if (!selectedClassGroupId) {
      setChatResponse({ count: 0, page: 1, page_size: 20, total_pages: 0, results: [] });
      return;
    }

    let cancelled = false;

    async function loadChats() {
      setIsLoading(true);
      const response = await chat_http_client.get_current_teacher_parents_chats({
        class_group_id: selectedClassGroupId,
        search: debouncedSearch,
        page,
      });

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
  }, [selectedClassGroupId, debouncedSearch, page]);

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

  const selectedClassLabel = classGroupOptions.find(
    (option) => option.value === selectedClassGroupId
  )?.label;

  const visibleItems = useMemo(
    () => mergeTeacherChatsByParent(chatResponse.results),
    [chatResponse.results]
  );

  return (
    <ContextualChatWorkspace
      title={getTranslation("parents", language)}
      searchPlaceholder={getTranslation("searchParentsStudentsOrEmail", language)}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      sidebarControls={
        <select
          value={selectedClassGroupId}
          onChange={(event) => setSelectedClassGroupId(event.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{getTranslation("selectClassGroup", language)}</option>
          {classGroupOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      }
      items={visibleItems}
      isListLoading={isLoading}
      hasMore={chatResponse.page < chatResponse.total_pages}
      onLoadMore={() => setPage((prev) => prev + 1)}
      currentUserId={teacher_id}
      emptyStateTitle={
        selectedClassGroupId
          ? getTranslation("noChatsFound", language)
          : getTranslation("selectClassGroup", language)
      }
      emptyStateHint={
        selectedClassGroupId
          ? getTranslation("noChatsMatchFilters", language)
          : getTranslation("chooseClassToViewChats", language)
      }
      selectionPrompt={getTranslation("selectChatToStart", language)}
      selectionHint={getTranslation("chooseClassToViewChats", language)}
      activeFilterLabel={selectedClassLabel}
      onPatchChatItem={patchChatItem}
    />
  );
};

export default TeacherChat;