import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Clock,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Layers,
} from "lucide-react";
import { StudentHomework, StudentHomeworkGroup } from "../../models/Homework";
import { homework_client } from "../../services/http_api/homework/homework_client";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";

interface HomeworkCardProps {
  hw: StudentHomework;
  language: string;
}

function HomeworkCard({ hw, language }: HomeworkCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {hw.title}
            </h4>
            {hw.module_name && (
              <span className="text-xs text-primary-500 font-medium">
                {hw.module_name}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {getTranslation("assigned", language)}: {hw.date_assigned}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getTranslation("dueDate", language)}: {hw.last_submission_date}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {hw.teacher_name}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {hw.class_group_name}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
          {hw.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {hw.description}
            </p>
          )}

          {/* Class group + module info */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{hw.class_group_name}</span>
            {hw.module_name && <span>· {hw.module_name}</span>}
          </div>

          {hw.attachment && (
            <a
              href={`${SERVER_BASE_URL}${hw.attachment}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline"
            >
              <Download className="h-3 w-3" />
              {getTranslation("downloadAttachment", language)}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

interface ParentHomeworksProps {
  selectedStudentId?: string | null;
}

const ParentHomeworks: React.FC<ParentHomeworksProps> = ({ selectedStudentId }) => {
  const { language } = useLanguage();
  const [groups, setGroups] = useState<StudentHomeworkGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!selectedStudentId) {
        setGroups([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await homework_client.getParentHomeworksByStudent(selectedStudentId);
      if (res.ok) {
        setGroups(res.data);
      } else {
        setGroups([]);
      }
      setLoading(false);
    }
    void load();
  }, [selectedStudentId]);

  const currentGroup = useMemo(() => groups[0], [groups]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {getTranslation("homeworksTab", language)}
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"
            />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {getTranslation("noHomeworksYet", language)}
          </p>
        </div>
      ) : (
        <>
          {currentGroup && (
            <>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getTranslation("totalHomeworks", language)}: {currentGroup.homeworks.length}
                </p>
              </div>

              {/* Homework list */}
              <div className="space-y-3">
                {currentGroup.homeworks.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {getTranslation("noHomeworksYet", language)}
                  </p>
                ) : (
                  currentGroup.homeworks.map((hw) => (
                    <HomeworkCard key={hw.id} hw={hw} language={language} />
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ParentHomeworks;
