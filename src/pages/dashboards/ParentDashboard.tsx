import React, { useEffect, useMemo, useState } from "react";
import {
  User as UserIcon,
  GraduationCap,
  MessageCircle,
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Star,
  LayoutGrid,
  ClipboardList,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import ChildrenOverview from "../../components/parent/ChildrenOverview";
import GradeReports from "../../components/parent/GradeReports";
import AbsenceManager from "../../components/parent/AbsenceManager";
import ScheduleManagement from "../../components/parent/ScheduleManagement";
import ActivitiesView from "../../components/parent/ActivitiesManagement";
import ParentScheduleTable from "../../components/parent/HomeworksManagement.tsx";
import ResourceLibrary from "../../components/parent/ResourceLibrary";
import ParentChat from "../../components/shared/ParentChat";
import MonthlyEvaluationSection from "../../components/shared/MonthlyEvaluationSection";
import SchoolAnnouncements from "../../components/parent/SchoolAnnouncements";
import { Student } from "../../models/Student.ts";
import { AbsenceReport } from "../../models/AbsenceReports.ts";
import { BehaviourReport } from "../../models/BehaviorReport.ts";
import { TeacherUpload } from "../../models/TeacherUpload.ts";
import { parent_dashboard_client } from "../../services/http_api/parent-dashboard/parent_dashboard_client.ts";
import { ParentAbsence } from "../../models/ParentAbsence.ts";
import { StudentPerformance } from "../../models/StudentPerformance.ts";
import { ParentStudentEvent } from "../../models/ParentStudentEvent.ts";
import { ClassGroup, ClassGroupJson } from "../../models/ClassGroups.ts";
import { chat_http_client } from "../../services/chat/chat_http_client.ts";
import { Teacher } from "../../models/Teacher.ts";
import { MonthlyEvaluation } from "../../models/MonthlyEvaluation.ts";
import { User } from "../../contexts/AuthContext.tsx";
import { getTranslation } from "../../utils/translations.ts";
import { useLanguage } from "../../contexts/LanguageContext.tsx";
import { useNotifications } from "../../contexts/NotificationContext.tsx";
import { timeAgoArabic } from "../../lib/timeAgoArabic.ts";

const ParentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  //! Translation :
  const { language } = useLanguage();

  // ! Fetching the parent's id (which is the user id)
  const lc_user: User | null = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("schoolParentOrTeacherManagementUser") || "null"
      );
    } catch {
      return null;
    }
  })();
  const parent_id: number | null = (() => {
    try {
      if (!lc_user?.id) return null;
      const id = typeof lc_user.id === 'string' ? JSON.parse(lc_user.id) : lc_user.id;
      return Number.isInteger(id) ? id : null;
    } catch {
      console.error("Failed to parse parent_id:", lc_user?.id);
      return null;
    }
  })();

  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  // ! Fetch from the API
  const [students, setStudents] = useState<Student[]>([]);
  const [class_groups, setClassGroups] = useState<ClassGroup[] | []>([]);

  const [absence_reports, setAbsenceReports] = useState<AbsenceReport[]>([]);
  const [behaviour_reports, setBehabiourReports] = useState<BehaviourReport[]>(
    []
  );
  const [uploads, setUploads] = useState<TeacherUpload[]>([]);

  const [parent_absences, setParentAbsences] = useState<ParentAbsence[]>([]);
  const [monthlyEvaluations, setMonthlyEvaluations] = useState<MonthlyEvaluation[]>([]);
  const [isLoadingMonthlyEvaluations, setIsLoadingMonthlyEvaluations] = useState(true);

  const [studentPerformances, setStudentPerformances] = useState<
    StudentPerformance[]
  >([]);

  const [parentStudentsEvents, setParentStudentsEvents] = useState<
    ParentStudentEvent[]
  >([]);

  const get_current_parent_students = async () => {
    try {
      setIsLoadingStudents(true);
      const res = await parent_dashboard_client.get_current_parent_students();
      if (res.ok) {
        setStudents(res.data);
      } else {
        console.error("Failed to fetch students:", res);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const get_current_parent_absence_reports = async () => {
    try {
      const res =
        await parent_dashboard_client.get_current_parent_absence_reports();
      if (res.ok) {
        const new_absence_reports_list: AbsenceReport[] = res.data;
        setAbsenceReports(new_absence_reports_list);
      } else {
        console.error("Failed to fetch absence reports:", res);
      }
    } catch (error) {
      console.error("Error fetching absence reports:", error);
    }
  };

  const get_current_parent_behaviour_reports = async () => {
    try {
      const res =
        await parent_dashboard_client.get_current_parent_behaviour_reports();
      if (res.ok) {
        const new_behaviour_reports_list: BehaviourReport[] = res.data;
        setBehabiourReports(new_behaviour_reports_list);
      } else {
        console.error("Failed to fetch behaviour reports:", res);
      }
    } catch (error) {
      console.error("Error fetching behaviour reports:", error);
    }
  };
  const get_current_parent_monthly_evaluations = async () => {
    try {
      setIsLoadingMonthlyEvaluations(true);
      const res = await parent_dashboard_client.get_current_parent_monthly_evaluations();
      if (res.ok) {
        const evaluations_list: MonthlyEvaluation[] = res.data;
        setMonthlyEvaluations(evaluations_list);
      } else {
        console.error("Failed to fetch monthly evaluations:", res);
      }
    } catch (error) {
      console.error("Error fetching monthly evaluations:", error);
    } finally {
      setIsLoadingMonthlyEvaluations(false);
    }
  };

  const get_current_parent_all_students_uploads = async () => {
    try {
      const res =
        await parent_dashboard_client.get_current_parent_all_students_uploads();
      if (res.ok) {
        const new_uploads_list: TeacherUpload[] = res.data;
        setUploads(new_uploads_list);
      } else {
        console.error("Failed to fetch uploads:", res);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  };

  const current_parent_students_absences = async () => {
    try {
      const res =
        await parent_dashboard_client.current_parent_students_absences();
      if (res.ok) {
        const parent_absences_list: ParentAbsence[] = res.data;
        setParentAbsences(parent_absences_list);
      } else {
        console.error("Failed to fetch student absences:", res);
      }
    } catch (error) {
      console.error("Error fetching student absences:", error);
    }
  };

  const get_current_parent_students_performances = async () => {
    try {
      const res =
        await parent_dashboard_client.get_current_parent_students_performances();
      if (res.ok) {
        const performances_list: StudentPerformance[] = res.data;
        setStudentPerformances(performances_list);
      } else {
        console.error("Failed to fetch student performances:", res);
      }
    } catch (error) {
      console.error("Error fetching student performances:", error);
    }
  };

  const parent_students_events = async () => {
    try {
      const res = await parent_dashboard_client.parent_students_events();
      if (res.ok) {
        const new_events_list: ParentStudentEvent[] = res.data;
        setParentStudentsEvents(new_events_list);
      } else {
        console.error("Failed to fetch parent student events:", res);
      }
    } catch (error) {
      console.error("Error fetching parent student events:", error);
    }
  };

  const get_parent_class_groups = async () => {
    try {
      const res = await parent_dashboard_client.get_parent_class_groups();
      if (res.ok && Array.isArray(res.data)) {
        const class_groups = (res.data as ClassGroupJson[]).map((classGroupJson: ClassGroupJson) =>
          ClassGroup.formJson(classGroupJson)
        );
        setClassGroups(class_groups);
      } else {
        console.error("Failed to fetch class groups:", res);
      }
    } catch (error) {
      console.error("Error fetching class groups:", error);
    }
  };

  //? Chat system :
  //? list for all the teachers this parent can chat with
  const [teachers_list, setTeachersList] = useState<Teacher[]>([]);

  //! API CALL : 1. retrieving the teachers for this parent
  const get_current_parent_schools_teachers = async () => {
    try {
      const res = await chat_http_client.get_current_parent_schools_teachers();
      if (res.ok) {
        const new_teachers_list: Teacher[] = res.data;
        setTeachersList(new_teachers_list);
      } else {
        console.error("Failed to fetch teachers:", res);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  //? Notifications :
  const { notifications } = useNotifications();

  useEffect(() => {
    get_current_parent_students();
    get_current_parent_absence_reports();
    get_current_parent_behaviour_reports();
    get_current_parent_all_students_uploads();
    current_parent_students_absences();
    get_current_parent_students_performances();
    parent_students_events();
    get_parent_class_groups();

    //? chat
    get_current_parent_schools_teachers();

    //?
  }, []);

  useEffect(() => {
    get_current_parent_monthly_evaluations();
    const intervalId = window.setInterval(() => {
      get_current_parent_monthly_evaluations();
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const one_student_absences = (s: Student) => {
    const parent_absence = parent_absences.find(
      (absence) => absence.student_id == s.student_id
    );

    const total_absences = parent_absence?.abscences.length;
    return total_absences;
  };
  const total_absences = () => {
    let absences_num = 0;

    parent_absences.forEach((parent_absence) => {
      absences_num += parent_absence.abscences.length;
    });

    return absences_num;
  };
  const stats = [
    { title: getTranslation("myChildren", language), value: students.length || "0", icon: UserIcon, color: "bg-primary-500", tab: "children" },
    { title: getTranslation("totalAbsences", language), value: total_absences() || "0", icon: Calendar, color: "bg-primary-400", tab: "absences" },
    { title: getTranslation("newMessages", language), value: notifications.length || "0", icon: MessageCircle, color: "bg-primary-500", tab: "chat" },
    { title: getTranslation("notifications", language), value: notifications.length || "0", icon: AlertTriangle, color: "bg-primary-400", tab: null },
  ];

  const evaluationLocale =
    language === "fr" ? "fr-FR" : language === "en" ? "en-US" : "ar-DZ";

  const formatEvaluationMonth = (value?: string | null) => {
    if (!value) return "—";
    const monthValue = value.length >= 7 ? value.slice(0, 7) : value;
    const date = new Date(monthValue + "-01");
    if (Number.isNaN(date.getTime())) return monthValue;
    return new Intl.DateTimeFormat(evaluationLocale, {
      year: "numeric",
      month: "long",
    }).format(date);
  };

  const evaluationsByStudent = useMemo(() => {
    const map = new Map<string, MonthlyEvaluation[]>();
    monthlyEvaluations.forEach((evaluation) => {
      const studentId = String(
        evaluation.student.student_id ?? evaluation.student.full_name
      );
      const list = map.get(studentId) ?? [];
      list.push(evaluation);
      map.set(studentId, list);
    });
    return map;
  }, [monthlyEvaluations]);

  const buildPerformanceSummary = (studentId: string) => {
    const evaluations = evaluationsByStudent.get(studentId) ?? [];
    let marksTotal = 0;
    let marksCount = 0;
    let participationTotal = 0;
    let participationCount = 0;
    let homeworkTotal = 0;
    let homeworkCount = 0;

    evaluations.forEach((evaluation) => {
      if (typeof evaluation.mark_of_participation_in_class === "number") {
        participationTotal += evaluation.mark_of_participation_in_class;
        participationCount += 1;
        marksTotal += evaluation.mark_of_participation_in_class;
        marksCount += 1;
      }
      if (typeof evaluation.homeworks_mark === "number") {
        homeworkTotal += evaluation.homeworks_mark;
        homeworkCount += 1;
        marksTotal += evaluation.homeworks_mark;
        marksCount += 1;
      }
    });

    const overallAverage = marksCount ? marksTotal / marksCount : null;
    const participationAverage = participationCount
      ? participationTotal / participationCount
      : null;
    const homeworkAverage = homeworkCount ? homeworkTotal / homeworkCount : null;

    const latestMonth = evaluations
      .map((evaluation) => evaluation.month)
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a))[0];

    const performanceLevel =
      overallAverage === null
        ? "needs_improvement"
        : overallAverage < 10
        ? "weak"
        : overallAverage < 15
        ? "good"
        : "excellent";

    return {
      evaluations,
      overallAverage,
      participationAverage,
      homeworkAverage,
      latestMonth,
      performanceLevel,
    };
  };

  

  const tabs = [
    {
      id: "overview",
      label: getTranslation("overview", language),
      icon: TrendingUp,
    },
    {
      id: "children",
      label: getTranslation("myChildren", language),
      icon: UserIcon,
    },
      {
      id: "timetable",
      label: getTranslation("timetable", language),
      icon: LayoutGrid,
    },
    { id: "grades", label: getTranslation("grade", language), icon: FileText },
    {
      id: "evaluations",
      label: getTranslation("monthlyEvaluation", language),
      icon: ClipboardList,
    },
    {
      id: "absences",
      label: getTranslation("absencesAndReports", language),
      icon: Calendar,
    },
    {
      id: "chat",
      label: getTranslation("chat", language),
      icon: MessageCircle,
    },
    // {
    //   id: "announcements",
    //   label: getTranslation("notificationsAndAlarms", language),
    //   icon: AlertTriangle,
    // },

    // {
    //   id: "homework",
    //   label: getTranslation("homeworks", language),
    //   icon: BookOpen,
    // },
    {
      id: "calendar",
      label: getTranslation("digitalLibrary", language),
      icon: Calendar,
    },
    { id: "events", label: getTranslation("events", language), icon: Star },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "children":
        return (
          <ChildrenOverview
            students={students ?? []}
            one_student_absences={one_student_absences}
            setActiveTab={setActiveTab}
            studentPerformances={studentPerformances}
          />
        );
      case "grades":
        return (
          <div className="space-y-6">
            <GradeReports
              students={students}
              studentPerformances={studentPerformances}
            />
          </div>
        );
      case "evaluations":
        return (
          <MonthlyEvaluationSection evaluations={monthlyEvaluations} />
        );
      case "absences":
        return (
          <AbsenceManager
            students={students}
            absence_reports={absence_reports}
            setAbsenceReports={setAbsenceReports}
            behaviour_reports={behaviour_reports}
            setBehabiourReports={setBehabiourReports}
          />
        );
      case "chat":
        return (
          <ParentChat
            userType="parent"
            teachers_list={teachers_list}
            parent_id={parent_id ?? 0}
          />
        );
      case "announcements":
        return <SchoolAnnouncements />;
      case "timetable":
        return (
          <ScheduleManagement
            students={students}
            class_groups_list={class_groups}
            setClassGroupList={setClassGroups}
          />
        );

      case "homework":
        return <ParentScheduleTable />;
      case "calendar":
        return <ResourceLibrary uploads={uploads} />;
      case "events":
        return <ActivitiesView parentStudentsEvents={parentStudentsEvents} />;
      default:
        return (
          <div className="space-y-8">
            {/* ════ STUDENTS GENERAL INFORMATION - MAIN FOCUS ════ */}
            <div className="rounded-3xl border-2 border-primary-200 dark:border-primary-800/60 bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-primary-950/20 dark:via-gray-800 dark:to-primary-950/10 shadow-2xl p-8 lg:p-10 ring-1 ring-primary-100 dark:ring-primary-900/40">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                    {getTranslation("studentsGeneralInformation", language)}
                  </h1>
                  <p className="text-base text-gray-600 dark:text-gray-300">
                    {getTranslation("monthlyEvaluationForParents", language)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {getTranslation("excellent", language)}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/40 px-4 py-2 text-sm font-bold text-amber-700 dark:text-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {getTranslation("veryGood", language)}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-100 dark:bg-red-900/40 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {getTranslation("poorPerformance", language)}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {isLoadingStudents || isLoadingMonthlyEvaluations ? (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 animate-pulse">
                    <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4" />
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                    {getTranslation("noStudentsFound", language)}
                  </div>
                ) : (
                  students.map((child, index) => {
                    const studentId = String(child.student_id);
                    const summary = buildPerformanceSummary(studentId);
                    const overallMark = summary.overallAverage;

                    const stateLabel =
                      summary.performanceLevel === "excellent"
                        ? getTranslation("excellent", language)
                        : summary.performanceLevel === "good"
                        ? getTranslation("veryGood", language)
                        : getTranslation("poorPerformance", language);

                    const stateStyles =
                      summary.performanceLevel === "excellent"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                        : summary.performanceLevel === "good"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";

                    const markBackgroundColor =
                      overallMark === null
                        ? "bg-gray-100 dark:bg-gray-700"
                        : overallMark < 10
                        ? "bg-red-100 dark:bg-red-900/30"
                        : overallMark < 15
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-emerald-100 dark:bg-emerald-900/30";

                    const markTextColor =
                      overallMark === null
                        ? "text-gray-700 dark:text-gray-300"
                        : overallMark < 10
                        ? "text-red-700 dark:text-red-300"
                        : overallMark < 15
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-emerald-700 dark:text-emerald-300";

                    return (
                      <div
                        key={index}
                        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 p-7 transition-all duration-300 transform hover:scale-105"
                      >
                        {/* Header with student info and performance badge */}
                        <div className="flex items-start justify-between gap-3 mb-5">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 p-3 rounded-full">
                              <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {child.full_name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {child.class_group?.name}
                              </p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${stateStyles}`}>
                            {stateLabel}
                          </span>
                        </div>

                        {/* Overall Mark - Prominent Display */}
                        <div className={`rounded-xl p-5 mb-5 border-2 border-gray-200 dark:border-gray-700 ${markBackgroundColor}`}>
                          <p className={`text-xs font-semibold uppercase tracking-wider ${markTextColor} mb-2`}>
                            {getTranslation("overallPerformance", language)}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className={`text-4xl font-black ${markTextColor}`}>
                              {overallMark !== null ? overallMark.toFixed(1) : "—"}
                            </p>
                            <p className={`text-lg font-bold ${markTextColor}`}>/20</p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                              {getTranslation("participationMark", language)}
                            </p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                              {summary.participationAverage !== null
                                ? summary.participationAverage.toFixed(1)
                                : "—"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4 border border-purple-200 dark:border-purple-800">
                            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
                              {getTranslation("homeworksMark", language)}
                            </p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">
                              {summary.homeworkAverage !== null
                                ? summary.homeworkAverage.toFixed(1)
                                : "—"}
                            </p>
                          </div>
                        </div>

                        {/* Absences & Month */}
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 border border-gray-200 dark:border-gray-600 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getTranslation("absences", language)}
                            </span>
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold text-sm">
                              {one_student_absences(child) || "0"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getTranslation("evaluationMonth", language)}
                            </span>
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                              {formatEvaluationMonth(summary.latestMonth)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {getTranslation("monthlyEvaluation", language)}
                            </span>
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold text-xs">
                              {summary.evaluations.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Stats Grid - Secondary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  onClick={() => stat.tab && setActiveTab(stat.tab)}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-transform duration-150${
                    stat.tab
                      ? " cursor-pointer hover:scale-105 hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Updates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {getTranslation("latestUpdates", language)}
                </h3>
                <div className="h-64 overflow-y-scroll space-y-4">
                  {notifications
                    .map((not) => ({
                      type: not.type,
                      message: not.title,
                      time: timeAgoArabic(not.timestamp),
                    }))
                    .map((update, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-lg ${update.type === "grade"
                              ? "bg-primary-100 dark:bg-primary-900"
                              : update.type === "message"
                                ? "bg-primary-100 dark:bg-primary-900/20"
                                : "bg-orange-100 dark:bg-orange-900/20"
                            }`}
                        >
                          {update.type === "grade" ? (
                            <FileText className="h-4 w-4 text-primary-600" />
                          ) : update.type === "message" ? (
                            <MessageCircle className="h-4 w-4 text-primary-500" />
                          ) : (
                            <GraduationCap className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {update.message}
                          </p>
                          <div className="flex items-center justify-end mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {update.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Commented For Now - Doesn't Exist on the Backend */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {getTranslation('requiredTasks',language)}
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      task: "مراجعة درجات أحمد في الرياضيات",
                      priority: "عادي",
                      dueDate: "اليوم",
                    },
                    {
                      task: "الرد على رسالة الأستاذة سارة",
                      priority: "مهم",
                      dueDate: "غداً",
                    },
                    {
                      task: "تبرير غياب فاطمة يوم الثلاثاء",
                      priority: "عاجل",
                      dueDate: "منتهي الصلاحية",
                    },
                  ].map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            task.priority === "عاجل"
                              ? "bg-red-500"
                              : task.priority === "مهم"
                              ? "bg-orange-500"
                              : "bg-primary-500"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.task}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {task.dueDate}
                          </p>
                        </div>
                      </div>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      title={getTranslation("parentDashboard", language)}
      subtitle={getTranslation("welcomeMessage", language)}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default ParentDashboard;
