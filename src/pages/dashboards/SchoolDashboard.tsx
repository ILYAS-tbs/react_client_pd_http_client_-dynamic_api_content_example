import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  Layers,
  BookOpen,
  Calendar,
  FileText,
  BarChart2,
  Star,
  MessageCircle,
  ClipboardList,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StudentManagement from "../../components/school/StudentManagement";
import ScheduleManagement from "../../components/school/ScheduleManagement";
import ParentManagement from "../../components/school/ParentManagement";
import ActivitiesManagement from "../../components/school/ActivitiesManagement";
import ExamScheduleManagemen from "../../components/school/ExamScheduleManagemen";
import ClassesManagement from "../../components/school/ClassesManagement";
import SchoolHomeworksManagement from "../../components/school/HomeworksManagement";
import SchoolParentChat from "../../components/shared/SchoolParentChat.tsx";
import MonthlyEvaluationSection from "../../components/shared/MonthlyEvaluationSection";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { ClassGroup, ClassGroupJson } from "../../models/ClassGroups";
import { Student } from "../../models/Student";
import { Parent, ParentJson } from "../../models/ParenAndStudent";
import { Event, EventJson } from "../../models/Event";
import { Teacher } from "../../models/Teacher";
import { ExamSchedule } from "../../models/ExamSchedule";
import { SchoolStat } from "../../models/SchoolStat";
import TeacherManagement from "../../components/school/TeacherManagement";
import { Module } from "../../models/Module";
import { MonthlyEvaluation } from "../../models/MonthlyEvaluation";
import { User } from "../../contexts/AuthContext";
import { timeAgoArabic } from "../../lib/timeAgoArabic";
import { useNotifications } from "../../contexts/NotificationContext";

import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";
import SchoolAttendanceTab from "../../components/school/SchoolAttendanceTab";
import SchoolBehaviourReportsTab from "../../components/school/SchoolBehaviourReportsTab";

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">هذه الصفحة قيد التطوير.</p>
  </div>
);

const SchoolDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");

  const { language } = useLanguage();



  //! Getting the schools's id (which is the user id)
  const lc_user: User | null = (() => {
    try {
      const raw = localStorage.getItem("schoolParentOrTeacherManagementUser");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Failed to parse stored school session", error);
      return null;
    }
  })();
  if (!lc_user) {
    console.error("School dashboard session is missing");
  }
  const school_id = Number(lc_user?.id ?? -1);
  console.log("schools's id : ", school_id);

  // to inspect some data we got from the server :
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [class_groups, setClassGroups] = useState<ClassGroup[] | []>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [exam_schedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [, setSchoolStat] = useState<SchoolStat | null>(null);
  const [modules, SetModules] = useState<Module[]>([]);
  const [monthlyEvaluations, setMonthlyEvaluations] = useState<MonthlyEvaluation[]>([]);


  const get_current_school_students = async () => {
    const res = await school_dashboard_client.get_current_school_students();
    if (res.ok) {
      const students_list: Student[] = res.data;
      setStudents(students_list);
    }
  };

  const get_current_school_teachers = async () => {
    const res = await school_dashboard_client.get_current_school_teachers();
    if (res.ok) {
      const teachers_list: Teacher[] = res.data;
      setTeachers(teachers_list);
    }
  };

  const get_current_school_class_groups = async () => {
    const res = await school_dashboard_client.get_current_school_class_groups();
    if (res.ok) {
      const class_groups = res.data.map((classGroupJson: ClassGroupJson) =>
        ClassGroup.formJson(classGroupJson)
      );
      setClassGroups(class_groups);
    }
  };
  const get_current_school_parents = async () => {
    const res = await school_dashboard_client.get_current_school_parents();
    if (res.ok) {
      const parent_list = res.data.map((parentJson: ParentJson) =>
        Parent.fromJson(parentJson)
      );
      setParents(parent_list);
    }
  };
  const get_current_school_events = async () => {
    const res = await school_dashboard_client.get_current_school_events();
    if (res.ok) {
      const events_list = res.data.map((e: EventJson) => Event.fromJson(e));
      setEvents(events_list);
    }
  };
  const get_current_school_exam_schedules = async () => {
    const res =
      await school_dashboard_client.get_current_school_exam_schedules();

    if (res.ok) {
      const exam_schedules_list: ExamSchedule[] = res.data;
      setExamSchedules(exam_schedules_list);
    }
  };
  const get_current_school_monthly_evaluations = async () => {
    const res = await school_dashboard_client.get_current_school_monthly_evaluations();
    if (res.ok) {
      const evaluations_list: MonthlyEvaluation[] = res.data;
      setMonthlyEvaluations(evaluations_list);
    }
  };
  const get_current_school_stats = async () => {
    const res = await school_dashboard_client.get_current_school_stats();
    if (res.ok) {
      const school_stat: SchoolStat = res.data;
      setSchoolStat(school_stat);
    }
  };
  const get_modules = async () => {
    const res = await school_dashboard_client.get_modules();
    if (res.ok) {
      const modules_list: Module[] = res.data;
      SetModules(modules_list);
    }
  };



  useEffect(() => {
    //! fetching :
    get_current_school_students();
    get_current_school_teachers();
    get_current_school_class_groups();
    get_current_school_parents();
    get_current_school_events();
    get_current_school_monthly_evaluations();
    get_current_school_exam_schedules();
    get_current_school_stats();
    get_modules();

  }, []);

  const total_num_of_absences = () => {
    let sum = 0;
    students.forEach((s) => {
      sum += s.number_of_absences ?? 0;
    });
    return sum;
  };

  //! Passed Down function to refetch & Sync with the server :
  function RefetchStudents() {
    get_current_school_students();
  }
  function RefetchExams() {
    get_current_school_exam_schedules();
  }
  function RefetchEvents() {
    get_current_school_events();
  }

  //?: Notifications ::
  /*
  Frontend shape to map to
  [
                    {
                      action: "تم تسجيل طالب جديد",
                      name: "أحمد محمد",
                      time: "منذ ساعة",
                    },
                    {
                      action: "طلب إجازة مرسل",
                      name: "الأستاذة فاطمة",
                      time: "منذ 2 ساعة",
                    },
                    {
                      action: "إعلان جديد",
                      name: "امتحانات الفصل الأول",
                      time: "منذ 3 ساعات",
                    },
                  ].map
  */

  const { notifications_data } = useNotifications()

  const [actions, setActions] = useState(
    notifications_data?.map((not) => ({
      action: not.title,
      name: not.message,
      time: timeAgoArabic(not.created_at),
    }))
  );

  useEffect(() => {
    setActions(
      notifications_data?.map((not) => ({
        key: not.id,
        action: not.title,
        name: not.message,
        time: timeAgoArabic(not.created_at),
      }))
    );
  }, [notifications_data]);

  // const stats = [
  //   {
  //     title: "TotalStudents",
  //     value: students.length || "0",
  //     icon: Users,
  //     color: "bg-primary-500",
  //   },
  //   {
  //     title: getTranslation("المعلمون",language),
  //     value: teachers.length || "0",
  //     icon: Users,
  //     color: "bg-green-500",
  //   },
  //   {
  //     title: getTranslation("الفصول",language),
  //     value: class_groups.length || "0",
  //     icon: FileText,
  //     color: "bg-purple-500",
  //   },
  //   {
  //     title: getTranslation("اجمالي الغيابات",language),
  //     value: total_num_of_absences() ?? "0",
  //     icon: BarChart2,
  //     color: "bg-orange-500",
  //   },
  // ];

  //? Cached Array (no rerender)


  console.log('📊 SchoolDashboard rendering with language:', language);

  const stats = [
    { title: getTranslation("TotalStudents", language), value: students.length || "0", icon: Users, color: "bg-primary-500", tab: "users" },
    { title: getTranslation("Teachers", language), value: teachers.length || "0", icon: Users, color: "bg-primary-400", tab: "users" },
    { title: getTranslation("Classes", language), value: class_groups.length || "0", icon: FileText, color: "bg-primary-500", tab: "levels" },
    { title: getTranslation("TotalAbsences", language), value: total_num_of_absences() || "0", icon: BarChart2, color: "bg-primary-400", tab: "student_absences" },
  ]


  const tabs = [
    { id: "home", label: getTranslation("home", language), icon: Home },
    { id: "levels", label: getTranslation("ClassManagement", language), icon: Layers },
    { id: "users", label: getTranslation("UserManagement", language), icon: Users },
    { id: "homeworks", label: getTranslation("homeworksTab", language), icon: BookOpen },
    { id: "chat", label: getTranslation("chat", language), icon: MessageCircle },
    { id: "schedules", label: getTranslation("ScheduleManagement", language), icon: Calendar },
    { id: "exams", label: getTranslation('ExamSchedule', language), icon: FileText },
    { id: "evaluations", label: getTranslation("monthlyEvaluation", language), icon: ClipboardList },
    { id: "student_absences", label: getTranslation('studentAbsencesTab', language), icon: BarChart2 },
    { id: "behaviour_reports", label: getTranslation('behaviourReportsTab', language), icon: FileText },
    // { id: "grades", label: getTranslation("GradeOverview", language), icon: FileText },
    { id: "activities", label: getTranslation('Activities', language), icon: Star },
  ];

  const renderContent = () => {



    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  onClick={() => stat.tab && setActiveTab(stat.tab)}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-transform duration-150${stat.tab ? " cursor-pointer hover:scale-105 hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {getTranslation(String(stat.value), language)}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className=" h-64 overflow-y-scroll bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {getTranslation("recentActivity", language)}
                </h3>
                <div className="space-y-4">
                  {actions?.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {activity.name}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {getTranslation('monthlyStats', language)}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      طلاب جدد
                    </span>
                    <span className="text-sm font-semibold text-primary-600">
                      +12
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      معدل الحضور
                    </span>
                    <span className="text-sm font-semibold text-primary-500">
                      94.2%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      الإعلانات المنشورة
                    </span>
                    <span className="text-sm font-semibold text-purple-600">
                      8
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      طلبات الغياب المراجعة
                    </span>
                    <span className="text-sm font-semibold text-orange-600">
                      23
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="space-y-6">
            <StudentManagement
              studentsList={students}
              setStudentsList={setStudents}
              class_groups_list={class_groups}
            />
            <TeacherManagement
              teachersList={teachers}
              setTeacherList={setTeachers}
              modules={modules}
              SetModules={SetModules}
              class_groups_list={class_groups}
            />
            <ParentManagement
              parentsList={parents}
              setParentList={setParents}
              class_groups_list={class_groups}
              studentsList={students}
              //? Re-Sync with the server functions:
              RefetchStudents={RefetchStudents}
            />
          </div>
        );
      case "homeworks":
        return (
          <SchoolHomeworksManagement
            teachers={teachers}
            class_groups={class_groups}
          />
        );
      case "chat":
        return (
          <SchoolParentChat
            school_id={school_id}
            students={students}
            classGroups={class_groups}
          />
        );
      case "levels":
        return (
          <ClassesManagement
            class_groups_list={class_groups}
            setClassGroupList={setClassGroups}
          />
        );
      case "schedules":
        return (
          <ScheduleManagement
            class_groups_list={class_groups}
            setClassGroupList={setClassGroups}
          />
        );
      case "exams":
        return (
          <ExamScheduleManagemen
            exam_schedules={exam_schedules}
            setExamSchedules={setExamSchedules}
            school_id={school_id}
            class_groups={class_groups}
            //? Re-Sync with the server functions:
            RefetchExams={RefetchExams}
          />
        );
      case "student_absences":
        return (
          <SchoolAttendanceTab
            students={students}
            classGroups={class_groups}
            teachers={teachers}
            modules={modules}
          />
        );
      case "behaviour_reports":
        return (
          <SchoolBehaviourReportsTab
            students={students}
            classGroups={class_groups}
            teachers={teachers}
            modules={modules}
          />
        );
      case "evaluations":
        return (
          <MonthlyEvaluationSection evaluations={monthlyEvaluations} />
        );
      // case "grades":
      //   return (
      //     <GradeOverview
      //       school_stat={school_stat}
      //       setSchoolStat={setSchoolStat}
      //       class_groups={class_groups}
      //     />
      //   );
      case "activities":
        return (
          <ActivitiesManagement
            events_list={events}
            school_id={school_id}
            RefetchEvents={RefetchEvents}
          />
        );
      default:
        return <PlaceholderPage title="صفحة غير موجودة" />;
    }
  };

  return (

    <DashboardLayout
      title={getTranslation("SchoolDashboard", language)}
      subtitle={getTranslation("WelcomeSubtitle", language)}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default SchoolDashboard;
