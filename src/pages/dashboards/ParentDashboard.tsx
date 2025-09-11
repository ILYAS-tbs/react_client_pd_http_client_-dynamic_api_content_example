import React, { useEffect, useState } from "react";
import {
  User as UserIcon,
  GraduationCap,
  MessageCircle,
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  BookOpen,
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

const ParentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // ! Fetching the parent's id (which is the user id)
  const lc_user: User = JSON.parse(
    localStorage.getItem("schoolParentOrTeacherManagementUser") || ""
  );
  if (!lc_user) {
    console.error("TeacherAbsenceMAnagement lc_user is null");
    // return
  }
  const parent_id: number = JSON.parse(lc_user.id);
  console.log("parent_id's id : ", parent_id);

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
    const res = await parent_dashboard_client.get_current_parent_students();
    if (res.ok) {
      const new_students_list: Student[] = res.data;
      setStudents(new_students_list);
    }
  };

  const get_current_parent_absence_reports = async () => {
    const res =
      await parent_dashboard_client.get_current_parent_absence_reports();
    if (res.ok) {
      const new_absence_reports_list: AbsenceReport[] = res.data;
      setAbsenceReports(new_absence_reports_list);
    }
  };

  const get_current_parent_behaviour_reports = async () => {
    const res =
      await parent_dashboard_client.get_current_parent_behaviour_reports();
    if (res.ok) {
      const new_behaviour_reports_list: BehaviourReport[] = res.data;
      setBehabiourReports(new_behaviour_reports_list);
    }
  };

  const get_current_parent_all_students_uploads = async () => {
    const res =
      await parent_dashboard_client.get_current_parent_all_students_uploads();
    if (res.ok) {
      const new_uploads_list: TeacherUpload[] = res.data;
      setUploads(new_uploads_list);
    }
  };

  const current_parent_students_absences = async () => {
    const res =
      await parent_dashboard_client.current_parent_students_absences();
    if (res.ok) {
      const parent_absences_list: ParentAbsence[] = res.data;
      setParentAbsences(parent_absences_list);
    }
  };

  const get_current_parent_students_performances = async () => {
    const res =
      await parent_dashboard_client.get_current_parent_students_performances();
    if (res.ok) {
      const performances_list: StudentPerformance[] = res.data;
      setStudentPerformances(performances_list);
    }
  };

  const parent_students_events = async () => {
    const res = await parent_dashboard_client.parent_students_events();
    if (res.ok) {
      const new_events_list: ParentStudentEvent[] = res.data;
      setParentStudentsEvents(new_events_list);
    }
  };

  const get_parent_class_groups = async () => {
    const res = await parent_dashboard_client.get_parent_class_groups();
    if (res.ok) {
      const class_groups = res.data.map((classGroupJson: ClassGroupJson) =>
        ClassGroup.formJson(classGroupJson)
      );
      setClassGroups(class_groups);
    }
  };

  //? Chat system :
  //? list for all the teachers this parent can chat with
  const [teachers_list, setTeachersList] = useState<Teacher[]>([]);

  //! API CALL : 1. retrieving the teachers for this parent
  const get_current_parent_schools_teachers = async () => {
    const res = await chat_http_client.get_current_parent_schools_teachers();
    if (res.ok) {
      const new_teachers_list: Teacher[] = res.data;
      setTeachersList(new_teachers_list);
    }
  };

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
      title: "أطفالي",
      value: students.length || "0",
      icon: UserIcon,
      color: "bg-blue-500",
    },
    {
      title: "إجمالي عدد الغيابات",
      value: total_absences() || "0",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "رسائل جديدة",
      value: "3",
      icon: MessageCircle,
      color: "bg-purple-500",
    },
    {
      title: "إشعارات",
      value: "5",
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
  ];

  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: TrendingUp },
    { id: "children", label: "أطفالي", icon: UserIcon },
    { id: "grades", label: "المعدل", icon: FileText },
    { id: "absences", label: "تقارير وغيابات", icon: Calendar },
    { id: "chat", label: "دردشة", icon: MessageCircle },
    { id: "announcements", label: "إشعارات وتنبيهات", icon: AlertTriangle },
    { id: "timetable", label: "جدول التوقيت", icon: LayoutGrid },
    { id: "homework", label: "الواجبات", icon: BookOpen },
    { id: "calendar", label: "مكتبة رقمية", icon: Calendar },
    { id: "events", label: "فعاليات", icon: Star },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "children":
        return (
          <ChildrenOverview
            students={students ?? []}
            one_student_absences={one_student_absences}
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
            parent_id={parent_id}
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
              {students.map((child, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-blue-600" />
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
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        المعدل العام
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        {child.trimester_grade}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        الغيابات
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {one_student_absences(child) || "0"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      الحالة الأكاديمية
                    </span>
                    <span
                      className={
                        "px-3 py-1 rounded-full text-sm font-medium" +
                        (child.academic_state == "excellent"
                          ? " bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 "
                          : child.academic_state == "very_good"
                          ? " bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 "
                          : " bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 ")
                      }
                    >
                      {child.academic_state == "excellent"
                        ? "ممتاز"
                        : child.academic_state == "very_good"
                        ? "جيد جدا"
                        : "اداء ضعيف"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Updates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  آخر التحديثات
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      type: "grade",
                      message: "درجة جديدة في الرياضيات - أحمد",
                      time: "منذ ساعة",
                      child: "أحمد",
                    },
                    {
                      type: "message",
                      message: "رسالة من الأستاذة سارة",
                      time: "منذ 2 ساعة",
                      child: "فاطمة",
                    },
                    {
                      type: "announcement",
                      message: "إعلان: موعد الامتحانات",
                      time: "منذ يوم",
                      child: "عام",
                    },
                  ].map((update, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          update.type === "grade"
                            ? "bg-green-100 dark:bg-green-900"
                            : update.type === "message"
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-orange-100 dark:bg-orange-900"
                        }`}
                      >
                        {update.type === "grade" ? (
                          <FileText className="h-4 w-4 text-green-600" />
                        ) : update.type === "message" ? (
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <GraduationCap className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {update.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {update.child}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {update.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  المهام المطلوبة
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
                              : "bg-green-500"
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
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      title="لوحة تحكم ولي الأمر"
      subtitle="مرحباً بك، هنا يمكنك متابعة تقدم أطفالك الأكاديمي"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default ParentDashboard;
