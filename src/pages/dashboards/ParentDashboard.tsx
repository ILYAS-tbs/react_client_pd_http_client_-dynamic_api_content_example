import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  User as UserIcon,
  MessageCircle,
  FileText,
  Calendar,
  TrendingUp,
  Star,
  LayoutGrid,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import ChildrenOverview from "../../components/parent/ChildrenOverview";
import ScheduleManagement from "../../components/parent/ScheduleManagement";
import ActivitiesView from "../../components/parent/ActivitiesManagement";
import ParentHomeworks from "../../components/parent/ParentHomeworks.tsx";
import ParentExamScheduleManagement from "../../components/parent/ParentExamScheduleManagement";
import ParentWeeklyMealsManagement from "../../components/parent/ParentWeeklyMealsManagement";
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
import ParentAttendanceTab from "../../components/parent/ParentAttendanceTab";
import ParentBehaviourReportsTab from "../../components/parent/ParentBehaviourReportsTab";
import ParentGradesTab from "../../components/parent/ParentGradesTab";
import {
  ParentDashboardStats,
  ParentStudentSummary,
} from "../../models/ParentDashboard.ts";

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
  const [, setIsLoadingMonthlyEvaluations] = useState(true);

  const [studentPerformances, setStudentPerformances] = useState<
    StudentPerformance[]
  >([]);

  const [parentStudentsEvents, setParentStudentsEvents] = useState<
    ParentStudentEvent[]
  >([]);
  const [dashboardStats, setDashboardStats] = useState<ParentDashboardStats | null>(null);
  const [studentsSummary, setStudentsSummary] = useState<ParentStudentSummary[]>([]);
  const [isLoadingDashboardStats, setIsLoadingDashboardStats] = useState(true);
  const [isLoadingStudentsSummary, setIsLoadingStudentsSummary] = useState(true);
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

  const get_parent_dashboard_stats = async (studentId: string, requestId?: number) => {
    try {
      setIsLoadingDashboardStats(true);
      const res = await parent_dashboard_client.get_parent_dashboard_stats(studentId);
      if (res.ok) {
        if (requestId !== undefined && requestId !== studentRequestRef.current) return;
        setDashboardStats(res.data);
      } else {
        console.error("Failed to fetch parent dashboard stats:", res);
      }
    } catch (error) {
      console.error("Error fetching parent dashboard stats:", error);
    } finally {
      if (requestId === undefined || requestId === studentRequestRef.current) {
        setIsLoadingDashboardStats(false);
      }
    }
  };

  const get_parent_students_summary = async () => {
    try {
      setIsLoadingStudentsSummary(true);
      const res = await parent_dashboard_client.get_parent_students_summary();
      if (res.ok) {
        setStudentsSummary(res.data);
      } else {
        console.error("Failed to fetch parent students summary:", res);
      }
    } catch (error) {
      console.error("Error fetching parent students summary:", error);
    } finally {
      setIsLoadingStudentsSummary(false);
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

  useEffect(() => {
    void get_current_parent_students();
    void get_parent_students_summary();

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
        get_parent_dashboard_stats(selectedStudentId, requestId),
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
  const stats = [
    {
      title: getTranslation("myChildren", language),
      value: dashboardStats?.totalKids ?? students.length ?? 0,
      icon: UserIcon,
      color: "bg-primary-500",
      tab: "children",
    },
    {
      title: getTranslation("totalAbsences", language),
      value: dashboardStats?.absences ?? 0,
      icon: Calendar,
      color: "bg-primary-400",
      tab: "kid_absences",
    },
    {
      title: getTranslation("homeworksTab", language),
      value: dashboardStats?.homeworks ?? 0,
      icon: BookOpen,
      color: "bg-emerald-500",
      tab: "homework",
    },
    {
      title: getTranslation("messages", language),
      value: dashboardStats?.messages ?? 0,
      icon: MessageCircle,
      color: "bg-cyan-500",
      tab: "chat",
    },
  ];

  const getSummaryLabel = (status: ParentStudentSummary["status"]) => {
    if (status === "excellent") {
      return getTranslation("excellent", language);
    }
    if (status === "good") {
      return getTranslation("good", language);
    }
    return getTranslation("weak", language);
  };

  const getSummaryBadgeClass = (status: ParentStudentSummary["status"]) => {
    if (status === "excellent") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
    }
    if (status === "good") {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200";
    }
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";
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
        {
      id: "weekly_menu",
      label: getTranslation("weeklyMenu", language),
      icon: FileText,
    },
    {
      id: "homework",
      label: getTranslation("homeworksTab", language),
      icon: BookOpen,
    },
    {
      id: "evaluations",
      label: getTranslation("monthlyEvaluation", language),
      icon: ClipboardList,
    },
    { id: "grades", label: getTranslation("gradesOfMyKids", language), icon: FileText },
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
    {
      id: "exam_schedule",
      label: getTranslation("ExamSchedule", language),
      icon: FileText,
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
            <ParentGradesTab selectedStudent={selectedStudent} />
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
      case "exam_schedule":
        return <ParentExamScheduleManagement students={students} />;
      case "weekly_menu":
        return <ParentWeeklyMealsManagement students={students} />;

      case "homework":
        return (
          <ParentHomeworks
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectedStudentChange={setSelectedStudentId}
          />
        );
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
                {isLoadingStudents || isLoadingStudentsSummary || isLoadingDashboardStats ? (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 animate-pulse">
                    <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4" />
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                  </div>
                ) : studentsSummary.length === 0 ? (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                    {getTranslation("noStudentsFound", language)}
                  </div>
                ) : (
                  studentsSummary.map((summary) => {
                    return (
                      <div
                        key={summary.studentId}
                        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 p-5 sm:p-6 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4 min-w-0">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 p-2 sm:p-3 rounded-full flex-shrink-0">
                              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                                {summary.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {summary.className || "—"}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex max-w-full self-start px-3 py-1.5 rounded-full text-xs font-bold text-center leading-tight whitespace-normal break-words ${getSummaryBadgeClass(summary.status)}`}>
                            {getSummaryLabel(summary.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Updates (removed)*/}

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
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${isActive
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
