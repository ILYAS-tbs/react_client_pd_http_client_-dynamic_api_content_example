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

function getTimestampValue(value?: string | null) {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mergeSchoolChatsByParent(items: ContextualChatListItem[]) {
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

const SchoolParentChat: React.FC<SchoolParentChatProps> = ({
  school_id,
  students,
  classGroups,
}) => {
  const { language } = useLanguage();
  const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
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

  const filteredStudents = useMemo(
    () =>
      selectedClassGroupId
        ? students.filter((student) => student.class_group?.class_group_id === selectedClassGroupId)
        : students,
    [selectedClassGroupId, students]
  );

  useEffect(() => {
    if (
      selectedStudentId &&
      !filteredStudents.some((student) => student.student_id === selectedStudentId)
    ) {
      setSelectedStudentId("");
    }
  }, [filteredStudents, selectedStudentId]);

  useEffect(() => {
    setPage(1);
  }, [selectedClassGroupId, selectedStudentId, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadChats() {
      setIsLoading(true);
      const response = await chat_http_client.get_current_school_parents_chats({
        class_group_id: selectedClassGroupId,
        student_id: selectedStudentId,
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
  }, [selectedClassGroupId, selectedStudentId, debouncedSearch, page]);

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

  const activeFilterParts = [
    classGroups.find((group) => group.class_group_id === selectedClassGroupId)?.name,
    filteredStudents.find((student) => student.student_id === selectedStudentId)?.full_name,
  ].filter(Boolean);

  const visibleItems = useMemo(
    () => mergeSchoolChatsByParent(chatResponse.results),
    [chatResponse.results]
  );

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

          <select
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{getTranslation("allStudents", language)}</option>
            {filteredStudents.map((student) => (
              <option key={student.student_id} value={student.student_id}>
                {student.full_name}
              </option>
            ))}
          </select>

          {(selectedClassGroupId || selectedStudentId) ? (
            <button
              type="button"
              onClick={() => {
                setSelectedClassGroupId("");
                setSelectedStudentId("");
              }}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {getTranslation("clearFilters", language)}
            </button>
          ) : null}
        </div>
      }
      items={visibleItems}
      isListLoading={isLoading}
      hasMore={chatResponse.page < chatResponse.total_pages}
      onLoadMore={() => setPage((prev) => prev + 1)}
      currentUserId={school_id}
      emptyStateTitle={getTranslation("noChatsFound", language)}
      emptyStateHint={getTranslation("noChatsMatchFilters", language)}
      selectionPrompt={getTranslation("selectChatToStart", language)}
      selectionHint={getTranslation("noChatsMatchFilters", language)}
      activeFilterLabel={activeFilterParts.join(" • ") || undefined}
      onPatchChatItem={patchChatItem}
    />
  );
};

export default SchoolParentChat;