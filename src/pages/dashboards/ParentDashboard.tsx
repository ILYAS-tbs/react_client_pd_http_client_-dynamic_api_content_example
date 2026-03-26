import React, { useEffect, useState } from "react";
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
    {
      title: getTranslation("myChildren", language),
      value: students.length || "0",
      icon: UserIcon,
      color: "bg-primary-500",
    },
    {
      title: getTranslation("totalAbsences", language),
      value: total_absences() || "0",
      icon: Calendar,
      color: "bg-primary-400",
    },
    {
      title: getTranslation("newMessages", language),
      value: "—",
      icon: MessageCircle,
      color: "bg-purple-500",
    },
    {
      title: getTranslation("notifications", language),
      value: notifications.length || "0",
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
  ];

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
    { id: "grades", label: getTranslation("grade", language), icon: FileText },
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
    {
      id: "timetable",
      label: getTranslation("timetable", language),
      icon: LayoutGrid,
    },
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
          <GradeReports
            students={students}
            studentPerformances={studentPerformances}
          />
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
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
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

            {/* Children Summary 
             mock data : 
            [
              {
                  name: "أحمد محمد",
                  class: "الصف الخامس أ",
                  grade: "16/20",
                  attendance: "96%",
                  status: "ممتاز",
                },
            ]
            */}
            <div className="grid md:grid-cols-2 gap-6">
              {isLoadingStudents ? (
              <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 animate-pulse">
                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-3" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
              </div>
            ) : students.length === 0 ? (
              <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                {getTranslation("noStudentsFound", language)}
              </div>
            ) : students.map((child, index) => {
                const perf = studentPerformances.find(
                  (p) => String(p.student_id) === String(child.student_id)
                );
                const displayGrade =
                  perf?.s1_overall !== null && perf?.s1_overall !== undefined
                    ? perf.s1_overall.toFixed(2)
                    : perf?.s2_overall !== null && perf?.s2_overall !== undefined
                    ? perf.s2_overall.toFixed(2)
                    : perf?.s3_overall !== null && perf?.s3_overall !== undefined
                    ? perf.s3_overall.toFixed(2)
                    : child.trimester_grade != null
                    ? String(child.trimester_grade)
                    : "—";
                const overallScore = perf?.s1_overall ?? perf?.s2_overall ?? perf?.s3_overall ?? null;
                const derived_state = overallScore !== null
                  ? overallScore >= 16 ? "excellent" : overallScore >= 14 ? "very_good" : "needs_improvement"
                  : (child.academic_state ?? "needs_improvement");
                return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
                    <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {child.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {child.class_group?.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getTranslation("overallGrade", language)}
                      </p>
                      <p className="text-xl font-bold text-primary-600">
                        {displayGrade}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getTranslation("absences", language)}
                      </p>
                      <p className="text-xl font-bold text-primary-500">
                        {one_student_absences(child) || "0"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getTranslation("academicStatus", language)}
                    </span>
                    <span
                      className={
                        "px-3 py-1 rounded-full text-sm font-medium" +
                        (derived_state === "excellent"
                          ? " bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 "
                          : derived_state === "very_good"
                            ? " bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 "
                            : " bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 ")
                      }
                    >
                      {derived_state === "excellent"
                        ? getTranslation("excellent", language)
                        : derived_state === "very_good"
                          ? getTranslation("veryGood", language)
                          : getTranslation("poorPerformance", language)}
                    </span>
                  </div>
                </div>
                );
              })}
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
