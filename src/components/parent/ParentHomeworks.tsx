import React, { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  FileText,
  TrendingUp,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StudentHomework, StudentHomeworkGroup } from "../../models/Homework";
import { homework_client } from "../../services/http_api/homework/homework_client";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";

function submissionStatus(hw: StudentHomework) {
  const overdue = new Date(hw.last_submission_date) < new Date();
  if (hw.submission) {
    if (hw.submission.is_graded) return "graded";
    return "submitted";
  }
  if (overdue) return "missed";
  return "pending";
}

const statusConfig = {
  graded: {
    icon: CheckCircle,
    className: "text-green-600 dark:text-green-400",
    bgClass: "bg-green-100 dark:bg-green-900/30",
    labelKey: "graded",
  },
  submitted: {
    icon: Clock,
    className: "text-blue-500 dark:text-blue-400",
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
    labelKey: "submitted",
  },
  missed: {
    icon: XCircle,
    className: "text-red-500 dark:text-red-400",
    bgClass: "bg-red-100 dark:bg-red-900/30",
    labelKey: "missed",
  },
  pending: {
    icon: AlertCircle,
    className: "text-amber-500 dark:text-amber-400",
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
    labelKey: "pending",
  },
};

interface HomeworkCardProps {
  hw: StudentHomework;
  language: string;
}

function HomeworkCard({ hw, language }: HomeworkCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status = submissionStatus(hw);
  const cfg = statusConfig[status];
  const Icon = cfg.icon;

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
              {getTranslation("deadline", language)}: {hw.last_submission_date}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bgClass} ${cfg.className}`}
          >
            <Icon className="h-3 w-3" />
            {getTranslation(cfg.labelKey, language)}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
          {hw.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {hw.description}
            </p>
          )}

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

          {hw.remarks && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {getTranslation("teacherNote", language)}: {hw.remarks}
            </p>
          )}

          {/* Grade info */}
          {hw.submission?.is_graded && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex flex-wrap gap-4 items-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getTranslation("mark", language)}
                </p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {hw.submission.mark} / {hw.max_mark}
                </p>
              </div>
              {hw.submission.remarks && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getTranslation("teacherNote", language)}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    {hw.submission.remarks}
                  </p>
                </div>
              )}
            </div>
          )}

          {hw.submission && !hw.submission.is_graded && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {getTranslation("submittedAwaitingGrade", language)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {new Date(hw.submission.submitted_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ParentHomeworks: React.FC = () => {
  const { language } = useLanguage();
  const [groups, setGroups] = useState<StudentHomeworkGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStudent, setActiveStudent] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await homework_client.getParentHomeworksByStudent();
      if (res.ok) {
        setGroups(res.data);
        const firstGroup = res.data[0];
        if (firstGroup) setActiveStudent(firstGroup.student_id);
      }
      setLoading(false);
    }
    load();
  }, []);

  const currentGroup = groups.find((g) => g.student_id === activeStudent);

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
          {/* Student tabs */}
          {groups.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {groups.map((g) => (
                <button
                  key={g.student_id}
                  onClick={() => setActiveStudent(g.student_id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStudent === g.student_id
                      ? "bg-primary-500 text-white"
                      : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {g.student_name}
                </button>
              ))}
            </div>
          )}

          {currentGroup && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: getTranslation("totalHomeworks", language),
                    value: currentGroup.stats.total,
                    color: "bg-gray-100 dark:bg-gray-700",
                    textColor: "text-gray-900 dark:text-white",
                  },
                  {
                    label: getTranslation("submitted", language),
                    value: currentGroup.stats.submitted,
                    color: "bg-green-100 dark:bg-green-900/30",
                    textColor: "text-green-700 dark:text-green-400",
                  },
                  {
                    label: getTranslation("notSubmitted", language),
                    value: currentGroup.stats.not_submitted,
                    color: "bg-red-100 dark:bg-red-900/30",
                    textColor: "text-red-700 dark:text-red-400",
                  },
                  {
                    label: getTranslation("averageMark", language),
                    value:
                      currentGroup.stats.average_mark !== null
                        ? currentGroup.stats.average_mark.toFixed(1)
                        : "—",
                    color: "bg-blue-100 dark:bg-blue-900/30",
                    textColor: "text-blue-700 dark:text-blue-400",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`${s.color} rounded-xl p-4 text-center`}
                  >
                    <p
                      className={`text-2xl font-bold ${s.textColor}`}
                    >
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Performance bar */}
              {currentGroup.stats.total > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary-500" />
                      {getTranslation("submissionRate", language)}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {Math.round(
                        (currentGroup.stats.submitted /
                          currentGroup.stats.total) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-primary-500 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          (currentGroup.stats.submitted /
                            currentGroup.stats.total) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

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
