import React, { useEffect, useMemo, useState } from "react";

import { useLanguage } from "../../contexts/LanguageContext";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { ClassGroup } from "../../models/ClassGroups";
import { Student } from "../../models/Student";
import { chat_http_client } from "../../services/chat/chat_http_client";
import {
  ContextualChatListItem,
  PaginatedChatListResponse,
} from "../../services/chat/chat_http_payload_types";
import { getTranslation } from "../../utils/translations";
import ContextualChatWorkspace from "./ContextualChatWorkspace";

interface SchoolParentChatProps {
  school_id: number;
  students: Student[];
  classGroups: ClassGroup[];
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

const SchoolParentChat: React.FC<SchoolParentChatProps> = ({
  school_id,
  students,
  classGroups,
}) => {
  const { language } = useLanguage();
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
    let cancelled = false;

    async function loadChats() {
      setIsLoading(true);
      const response = await chat_http_client.get_current_school_parents_chats({
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

  const activeFilterLabel = classGroups.find((group) => group.class_group_id === selectedClassGroupId)?.name;

  return (
    <ContextualChatWorkspace
      title={getTranslation("parents", language)}
      searchPlaceholder={getTranslation("searchParentsStudentsOrEmail", language)}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      sidebarControls={
        <div className="space-y-3">
          <select
            value={selectedClassGroupId}
            onChange={(event) => setSelectedClassGroupId(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{getTranslation("allClassGroups", language)}</option>
            {classGroups.map((group) => (
              <option key={group.class_group_id} value={group.class_group_id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      }
      items={chatResponse.results}
      isListLoading={isLoading}
      hasMore={chatResponse.page < chatResponse.total_pages}
      onLoadMore={() => setPage((prev) => prev + 1)}
      currentUserId={school_id}
      emptyStateTitle={getTranslation("noChatsFound", language)}
      emptyStateHint={getTranslation("noChatsMatchFilters", language)}
      selectionPrompt={getTranslation("selectChatToStart", language)}
      selectionHint={getTranslation("noChatsMatchFilters", language)}
      activeFilterLabel={activeFilterLabel}
      onPatchChatItem={patchChatItem}
    />
  );
};

export default SchoolParentChat;