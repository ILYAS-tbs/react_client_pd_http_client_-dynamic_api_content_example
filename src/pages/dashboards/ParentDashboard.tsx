import React, { useEffect, useMemo, useRef, useState } from "react";
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
  BookOpen,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import ChildrenOverview from "../../components/parent/ChildrenOverview";
import GradeReports from "../../components/parent/GradeReports";
import ScheduleManagement from "../../components/parent/ScheduleManagement";
import ActivitiesView from "../../components/parent/ActivitiesManagement";
import ParentHomeworks from "../../components/parent/ParentHomeworks.tsx";
import ResourceLibrary from "../../components/parent/ResourceLibrary";
import ParentChat from "../../components/shared/ParentChat.tsx";
import MonthlyEvaluationSection from "../../components/shared/MonthlyEvaluationSection";
import SchoolAnnouncements from "../../components/parent/SchoolAnnouncements";
import { Student } from "../../models/Student.ts";
import { TeacherUpload } from "../../models/TeacherUpload.ts";
import { parent_dashboard_client } from "../../services/http_api/parent-dashboard/parent_dashboard_client.ts";
import { ParentAbsence } from "../../models/ParentAbsence.ts";
import { StudentPerformance } from "../../models/StudentPerformance.ts";
import { ParentStudentEvent } from "../../models/ParentStudentEvent.ts";
import { chat_http_client } from "../../services/chat/chat_http_client.ts";
import { Teacher } from "../../models/Teacher.ts";
import { MonthlyEvaluation } from "../../models/MonthlyEvaluation.ts";
import { User } from "../../contexts/AuthContext.tsx";
import { getTranslation } from "../../utils/translations.ts";
import { useLanguage } from "../../contexts/LanguageContext.tsx";
import { useNotifications } from "../../contexts/NotificationContext.tsx";
import { timeAgoArabic } from "../../lib/timeAgoArabic.ts";
import ParentAttendanceTab from "../../components/parent/ParentAttendanceTab";
import ParentBehaviourReportsTab from "../../components/parent/ParentBehaviourReportsTab";

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
  const [isLoadingStudentScope, setIsLoadingStudentScope] = useState(false);

  // ! Fetch from the API
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

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
  const studentRequestRef = useRef(0);

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
  const get_current_parent_monthly_evaluations = async (studentId: string, requestId?: number) => {
    try {
      setIsLoadingMonthlyEvaluations(true);
      const res = await parent_dashboard_client.get_current_parent_monthly_evaluations(studentId);
      if (res.ok) {
        if (requestId !== undefined && requestId !== studentRequestRef.current) return;
        const evaluations_list: MonthlyEvaluation[] = res.data;
        setMonthlyEvaluations(evaluations_list);
      } else {
        console.error("Failed to fetch monthly evaluations:", res);
      }
    } catch (error) {
      console.error("Error fetching monthly evaluations:", error);
    } finally {
      if (requestId === undefined || requestId === studentRequestRef.current) {
        setIsLoadingMonthlyEvaluations(false);
      }
    }
  };

  const get_current_parent_all_students_uploads = async (studentId: string, requestId?: number) => {
    try {
      const res =
        await parent_dashboard_client.get_current_parent_all_students_uploads(studentId);
      if (res.ok) {
        if (requestId !== undefined && requestId !== studentRequestRef.current) return;
        const new_uploads_list: TeacherUpload[] = res.data;
        setUploads(new_uploads_list);
      } else {
        console.error("Failed to fetch uploads:", res);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  };

  const current_parent_students_absences = async (studentId: string, requestId?: number) => {
    try {
      const res =
        await parent_dashboard_client.current_parent_students_absences(studentId);
      if (res.ok) {
        if (requestId !== undefined && requestId !== studentRequestRef.current) return;
        const parent_absences_list: ParentAbsence[] = res.data;
        setParentAbsences(parent_absences_list);
      } else {
        console.error("Failed to fetch student absences:", res);
      }
    } catch (error) {
      console.error("Error fetching student absences:", error);
    }
  };

  const get_current_parent_students_performances = async (studentId: string, requestId?: number) => {
    try {
      const res =
        await parent_dashboard_client.get_current_parent_students_performances(studentId);
      if (res.ok) {
        if (requestId !== undefined && requestId !== studentRequestRef.current) return;
        const performances_list: StudentPerformance[] = res.data;
        setStudentPerformances(performances_list);
      } else {
        console.error("Failed to fetch student performances:", res);
      }
    } catch (error) {
      console.error("Error fetching student performances:", error);
    }
  };

  const parent_students_events = async (studentId: string, requestId?: number) => {
    try {
      const res = await parent_dashboard_client.parent_students_events(studentId);
      if (res.ok) {
        if (requestId !== undefined && requestId !== studentRequestRef.current) return;
        const new_events_list: ParentStudentEvent[] = res.data;
        setParentStudentsEvents(new_events_list);
      } else {
        console.error("Failed to fetch parent student events:", res);
      }
    } catch (error) {
      console.error("Error fetching parent student events:", error);
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
    void get_current_parent_students();

    //? chat
    void get_current_parent_schools_teachers();

    //?
  }, []);

  useEffect(() => {
    if (!students.length) return;

    const selectedStillExists = students.some(
      (student) => student.student_id === selectedStudentId
    );
    if (!selectedStillExists) {
      setSelectedStudentId(students[0]!.student_id);
    }
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (!selectedStudentId) return;

    let isCancelled = false;
    const requestId = studentRequestRef.current + 1;
    studentRequestRef.current = requestId;

    const loadStudentScope = async () => {
      setIsLoadingStudentScope(true);
      await Promise.all([
        get_current_parent_monthly_evaluations(selectedStudentId, requestId),
        get_current_parent_all_students_uploads(selectedStudentId, requestId),
        current_parent_students_absences(selectedStudentId, requestId),
        get_current_parent_students_performances(selectedStudentId, requestId),
        parent_students_events(selectedStudentId, requestId),
      ]);
      if (!isCancelled && requestId === studentRequestRef.current) {
        setIsLoadingStudentScope(false);
      }
    };

    void loadStudentScope();

    const intervalId = window.setInterval(() => {
      void get_current_parent_monthly_evaluations(selectedStudentId, requestId);
    }, 60000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [selectedStudentId]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.student_id === selectedStudentId) ?? null,
    [selectedStudentId, students]
  );

  const selectedStudents = selectedStudent ? [selectedStudent] : [];

  const one_student_absences = (s: Student) => {
    const parent_absence = parent_absences.find(
      (absence) => absence.student_id == s.student_id
    );

    const total_absences = parent_absence?.abscences.length;
    return total_absences;
  };
  const total_absences = () => {
    return parent_absences.reduce(
      (absences_num, parent_absence) => absences_num + parent_absence.abscences.length,
      0
    );
  };
  const stats = [
    { title: getTranslation("myChildren", language), value: students.length || "0", icon: UserIcon, color: "bg-primary-500", tab: "children" },
    { title: getTranslation("totalAbsences", language), value: total_absences() || "0", icon: Calendar, color: "bg-primary-400", tab: "kid_absences" },
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

    const latestEvalWithRemark = evaluations
      .filter((e) => e.description?.trim() || e.remarks?.trim())
      .sort((a, b) => b.month.localeCompare(a.month))[0];
    const latestRemark =
      latestEvalWithRemark?.description?.trim() ||
      latestEvalWithRemark?.remarks?.trim() ||
      null;
    const latestRemarkModule = latestEvalWithRemark?.module?.module_name ?? null;
    const latestRemarkClassGroup = latestEvalWithRemark?.class_group?.name ?? null;
    const latestRemarkTeacher = latestEvalWithRemark?.teacher?.full_name ?? null;
    const latestRemarkMonth = latestEvalWithRemark?.month ?? null;

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
      latestRemark,
      latestRemarkModule,
      latestRemarkClassGroup,
      latestRemarkTeacher,
      latestRemarkMonth,
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
      id: "homework",
      label: getTranslation("homeworksTab", language),
      icon: BookOpen,
    },
    {
      id: "timetable",
      label: getTranslation("timetable", language),
      icon: LayoutGrid,
    },
    { id: "grades", label: getTranslation("gradeReports", language), icon: FileText },
    {
      id: "evaluations",
      label: getTranslation("monthlyEvaluation", language),
      icon: ClipboardList,
    },
    {
      id: "kid_absences",
      label: getTranslation("myKidsAbsencesTab", language),
      icon: Calendar,
    },
    {
      id: "behaviour_reports",
      label: getTranslation("behaviourReportsTab", language),
      icon: FileText,
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
            students={selectedStudents}
            one_student_absences={one_student_absences}
            setActiveTab={setActiveTab}
            studentPerformances={studentPerformances}
          />
        );
      case "grades":
        return (
          <div className="space-y-6">
            <GradeReports
              students={selectedStudents}
              studentPerformances={studentPerformances}
            />
          </div>
        );
      case "evaluations":
        return (
          <MonthlyEvaluationSection evaluations={monthlyEvaluations} />
        );
      case "kid_absences":
        return (
          <ParentAttendanceTab students={selectedStudents} selectedStudentId={selectedStudentId} />
        );
      case "behaviour_reports":
        return <ParentBehaviourReportsTab students={selectedStudents} selectedStudentId={selectedStudentId} />;
      case "chat":
        return (
          <ParentChat
            userType="parent"
            teachers_list={teachers_list}
            parent_id={parent_id ?? 0}
            students={students}
            selectedStudentId={selectedStudentId}
          />
        );
      case "announcements":
        return <SchoolAnnouncements />;
      case "timetable":
        return (
          <ScheduleManagement
            students={selectedStudents}
            selectedStudentId={selectedStudentId}
          />
        );

      case "homework":
        return <ParentHomeworks selectedStudentId={selectedStudentId} />;
      case "calendar":
        return <ResourceLibrary uploads={uploads} />;
      case "events":
        return <ActivitiesView parentStudentsEvents={parentStudentsEvents} />;
      default:
        return (
          <div className="space-y-8">
                        {/* Stats Grid - Secondary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  onClick={() => stat.tab && setActiveTab(stat.tab)}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-transform duration-150${stat.tab
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

            {/* ════ STUDENTS GENERAL INFORMATION - MAIN FOCUS ════ */}
            <div className="rounded-2xl sm:rounded-3xl border-2 border-primary-200 dark:border-primary-800/60 bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-primary-950/20 dark:via-gray-800 dark:to-primary-950/10 shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-10 ring-1 ring-primary-100 dark:ring-primary-900/40">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-1 sm:mb-2">
                    {getTranslation("studentsGeneralInformation", language)}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    {getTranslation("monthlyEvaluationForParents", language)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {getTranslation("excellent", language)}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {getTranslation("veryGood", language)}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-100 dark:bg-red-900/40 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-red-700 dark:text-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {getTranslation("poorPerformance", language)}
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-7">
                {isLoadingStudents || isLoadingMonthlyEvaluations || isLoadingStudentScope ? (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 animate-pulse">
                    <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4" />
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                  </div>
                ) : selectedStudents.length === 0 ? (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                    {getTranslation("noStudentsFound", language)}
                  </div>
                ) : (
                  selectedStudents.map((child, index) => {
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
                        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 p-4 sm:p-5 lg:p-7 transition-all duration-300 md:transform md:hover:scale-105"
                      >
                        {/* Header with student info and performance badge */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-5 min-w-0">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 p-2 sm:p-3 rounded-full flex-shrink-0">
                              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                                {child.full_name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {child.class_group?.name}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex max-w-full self-start sm:max-w-[9rem] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold text-center leading-tight whitespace-normal break-words ${stateStyles}`}>
                            {stateLabel}
                          </span>
                        </div>

                        {/* Overall Mark - Prominent Display */}
                        <div className={`rounded-xl p-3 sm:p-4 lg:p-5 mb-4 sm:mb-5 border-2 border-gray-200 dark:border-gray-700 ${markBackgroundColor}`}>
                          <p className={`text-xs font-semibold uppercase tracking-wider ${markTextColor} mb-2`}>
                            {getTranslation("overallPerformance", language)}
                          </p>
                          <div className="flex items-baseline gap-1 sm:gap-2">
                            <p className={`text-2xl sm:text-3xl lg:text-4xl font-black ${markTextColor}`}>
                              {overallMark !== null ? overallMark.toFixed(1) : "—"}
                            </p>
                            <p className={`text-sm sm:text-base lg:text-lg font-bold ${markTextColor}`}>/20</p>
                          </div>
                        </div>

                        {/* Stats Grid - Participation & Homework */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                          {/* Participation */}
                          <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-3 sm:p-4 border border-cyan-200 dark:border-cyan-700/50 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider">
                                {getTranslation("participationMark", language)}
                              </p>
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-cyan-700 dark:text-cyan-300">
                              {summary.participationAverage !== null
                                ? summary.participationAverage.toFixed(1)
                                : "—"}
                            </p>
                            <p className="text-xs text-cyan-600 dark:text-cyan-300/70 mt-1">/20</p>
                          </div>
                          {/* Homework */}
                          <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 p-3 sm:p-4 border border-orange-200 dark:border-orange-700/50 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider">
                                {getTranslation("homeworksMark", language)}
                              </p>
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-orange-700 dark:text-orange-300">
                              {summary.homeworkAverage !== null
                                ? summary.homeworkAverage.toFixed(1)
                                : "—"}
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-300/70 mt-1">/20</p>
                          </div>
                        </div>

                        {/* Remarque, Absences & Academic Performance Section */}
                        <div className="space-y-2 sm:space-y-3">
                          {/* Remarque - Prominent Section */}
                          <div className="rounded-lg bg-gradient-to-r from-primary-50/80 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 p-3 sm:p-4 border-2 border-primary-200 dark:border-primary-700/50 hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sm:mb-3">
                              <p className="text-xs font-bold text-primary-800 dark:text-primary-300 uppercase tracking-wider">
                                {getTranslation("evaluationRemark", language)}
                              </p>
                              {summary.latestRemarkMonth && (
                                <span className="text-xs font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                                  {formatEvaluationMonth(summary.latestRemarkMonth)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed text-primary-900 dark:text-primary-100 font-medium break-words mb-2 sm:mb-3">
                              {summary.latestRemark ? summary.latestRemark : <span className="text-gray-500 dark:text-gray-400 italic">—</span>}
                            </p>
                            {(summary.latestRemarkModule || summary.latestRemarkClassGroup || summary.latestRemarkTeacher) && (
                              <div className="flex flex-wrap gap-1 sm:gap-2 pt-2 sm:pt-3 border-t border-primary-200 dark:border-primary-700/40">
                                {summary.latestRemarkModule && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 dark:bg-primary-900/40 px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-semibold text-primary-700 dark:text-primary-300 break-words">
                                    📚 <span className="truncate">{summary.latestRemarkModule}</span>
                                  </span>
                                )}
                                {summary.latestRemarkClassGroup && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 dark:bg-primary-900/40 px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-semibold text-primary-700 dark:text-primary-300 break-words">
                                    🏫 <span className="truncate">{summary.latestRemarkClassGroup}</span>
                                  </span>
                                )}
                                {summary.latestRemarkTeacher && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 dark:bg-primary-900/40 px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-semibold text-primary-700 dark:text-primary-300 break-words">
                                    👤 <span className="truncate">{summary.latestRemarkTeacher}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Absences & Academic Performance - Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {/* Absences */}
                            <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 p-3 sm:p-4 border border-red-200 dark:border-red-700/50 hover:shadow-md transition-shadow duration-200">
                              <p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider mb-2 sm:mb-3 block">
                                {getTranslation("absences", language)}
                              </p>
                              <div className="flex items-end gap-1 sm:gap-2">
                                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-red-700 dark:text-red-300">
                                  {one_student_absences(child) || "0"}
                                </span>
                                <span className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-300/70 mb-1">
                                  {getTranslation("day", language) || "day"}
                                </span>
                              </div>
                            </div>

                            {/* Academic Performance - Participation Mark */}
                            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 p-3 sm:p-4 border border-emerald-200 dark:border-emerald-700/50 hover:shadow-md transition-shadow duration-200">
                              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2 sm:mb-3 block">
                                {getTranslation("monthlyEvaluation", language)}
                              </p>
                              <div className="flex items-end gap-1 sm:gap-2">
                                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-700 dark:text-emerald-300">
                                  {summary.participationAverage !== null
                                    ? summary.participationAverage.toFixed(1)
                                    : "—"}
                                </span>
                                <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-300/70 mb-1">
                                  /20
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Updates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {getTranslation("latestUpdates", language)}
                </h3>
                <div className="h-56 sm:h-64 overflow-y-scroll space-y-3 sm:space-y-4">
                  {notifications
                    .map((not) => ({
                      type: not.type,
                      message: not.title,
                      time: timeAgoArabic(not.timestamp),
                    }))
                    .map((update, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 sm:space-x-3 rtl:space-x-reverse p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${update.type === "grade"
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
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">
                            {update.message}
                          </p>
                          <div className="flex items-center justify-end mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
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
      {students.length > 0 && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {getTranslation("selectStudent", language)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedStudent?.full_name ?? getTranslation("selectStudentPrompt", language)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {students.map((student) => {
                const isActive = student.student_id === selectedStudentId;
                return (
                  <button
                    key={student.student_id}
                    type="button"
                    onClick={() => setSelectedStudentId(student.student_id)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-primary-500 dark:hover:text-primary-300"
                    }`}
                    aria-pressed={isActive}
                  >
                    {student.full_name}
                  </button>
                );
              })}
            </div>
          </div>
          {isLoadingStudentScope && (
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary-500" />
            </div>
          )}
        </div>
      )}
      {renderContent()}
    </DashboardLayout>
  );
};

export default ParentDashboard;
