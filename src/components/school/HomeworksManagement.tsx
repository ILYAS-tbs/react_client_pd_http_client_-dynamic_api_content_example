import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  User,
  UserCheck,
} from "lucide-react";
import { Homework } from "../../models/Homework";
import { Teacher } from "../../models/Teacher";
import { ClassGroup } from "../../models/ClassGroups";
import { homework_client } from "../../services/http_api/homework/homework_client";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface SchoolHomeworksManagementProps {
  teachers: Teacher[];
  class_groups: ClassGroup[];
}

const SchoolHomeworksManagement: React.FC<SchoolHomeworksManagementProps> = ({
  teachers,
  class_groups,
}) => {
  const { language } = useLanguage();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("");
  const [expandedHomeworkId, setExpandedHomeworkId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await homework_client.getSchoolHomeworks({
        teacher: selectedTeacher ? Number(selectedTeacher) : undefined,
        class_group: selectedClassGroup || undefined,
      });
      if (res.ok) {
        setHomeworks(res.data);
      }
      setLoading(false);
    }
    load();
  }, [selectedTeacher, selectedClassGroup]);

  const summary = useMemo(() => {
    const totalSubmissions = homeworks.reduce(
      (sum, homework) => sum + homework.submissions.length,
      0
    );
    const gradedSubmissions = homeworks.reduce(
      (sum, homework) =>
        sum + homework.submissions.filter((submission) => submission.mark !== null).length,
      0
    );
    return {
      totalHomeworks: homeworks.length,
      totalSubmissions,
      pendingSubmissions: totalSubmissions - gradedSubmissions,
      gradedSubmissions,
    };
  }, [homeworks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary-500" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {getTranslation("homeworksTab", language)}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getTranslation("schoolHomeworkOverview", language)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: getTranslation("totalHomeworks", language),
            value: summary.totalHomeworks,
            icon: BookOpen,
            color: "bg-primary-500",
          },
          {
            label: getTranslation("totalSubmissions", language),
            value: summary.totalSubmissions,
            icon: FileText,
            color: "bg-emerald-500",
          },
          {
            label: getTranslation("graded", language),
            value: summary.gradedSubmissions,
            icon: UserCheck,
            color: "bg-blue-500",
          },
          {
            label: getTranslation("pendingSubmissions", language),
            value: summary.pendingSubmissions,
            icon: Clock,
            color: "bg-amber-500",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
              </div>
              <div className={`${item.color} p-3 rounded-lg`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {getTranslation("filters", language)}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedTeacher}
            onChange={(event) => setSelectedTeacher(event.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
          >
            <option value="">{getTranslation("allTeachers", language)}</option>
            {teachers.map((teacher) => (
              <option key={teacher.user.id} value={teacher.user.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>

          <select
            value={selectedClassGroup}
            onChange={(event) => setSelectedClassGroup(event.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
          >
            <option value="">{getTranslation("allClasses", language)}</option>
            {class_groups.map((classGroup) => (
              <option key={classGroup.class_group_id} value={classGroup.class_group_id}>
                {classGroup.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : homeworks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          {getTranslation("noHomeworksYet", language)}
        </div>
      ) : (
        <div className="space-y-4">
          {homeworks.map((homework) => {
            const isExpanded = expandedHomeworkId === homework.id;
            return (
              <div
                key={homework.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedHomeworkId((current) =>
                      current === homework.id ? null : homework.id
                    )
                  }
                  className="w-full px-5 py-4 text-left"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {homework.title}
                        </h3>
                        {homework.module_name && (
                          <span className="rounded-full bg-primary-100 dark:bg-primary-900/40 px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-200">
                            {homework.module_name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {homework.teacher_name}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Layers className="h-4 w-4" />
                          {homework.class_group_name}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {homework.last_submission_date}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 self-start lg:self-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {homework.submissions_count}
                        </span>{" "}
                        {getTranslation("submissions", language)}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 space-y-4">
                    {homework.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {homework.description}
                      </p>
                    )}

                    {homework.remarks && (
                      <p className="text-sm italic text-gray-500 dark:text-gray-400">
                        {getTranslation("teacherNote", language)}: {homework.remarks}
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      {homework.submissions.length === 0 ? (
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {getTranslation("noSubmissionsYet", language)}
                        </div>
                      ) : (
                        homework.submissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3"
                          >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-900 dark:text-white">
                                  <span className="inline-flex items-center gap-1 font-medium">
                                    <User className="h-4 w-4 text-primary-500" />
                                    {submission.student_name}
                                  </span>
                                  {submission.teacher_name && (
                                    <span className="text-gray-500 dark:text-gray-400">
                                      {getTranslation("teacher", language)}: {submission.teacher_name}
                                    </span>
                                  )}
                                </div>
                                {submission.remarks && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {submission.remarks}
                                  </p>
                                )}
                              </div>
                              <div className="text-sm md:text-right">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {submission.mark !== null
                                    ? `${submission.mark} / ${homework.max_mark}`
                                    : getTranslation("submitted", language)}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">
                                  {new Date(submission.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchoolHomeworksManagement;