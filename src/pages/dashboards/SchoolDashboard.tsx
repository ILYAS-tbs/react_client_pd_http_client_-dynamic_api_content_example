import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  Layers,
  Calendar,
  FileText,
  BarChart2,
  Star,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StudentManagement from "../../components/school/StudentManagement";
import ScheduleManagement from "../../components/school/ScheduleManagement";
import ParentManagement from "../../components/school/ParentManagement";
import TeacherManagement from "../../components/school/TeacherManagement";
import ActivitiesManagement from "../../components/school/ActivitiesManagement";
import BehaviorReports from "../../components/school/BehaviorReports";
import ExamScheduleManagemen from "../../components/school/ExamScheduleManagemen";
import AbsenceReviews from "../../components/school/AbsenceReviews";
import GradeOverview from "../../components/school/GradeOverview";
import ClassesManagement from "../../components/school/ClassesManagement";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";

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

  // to inspect some data we got from the server :
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [class_groups, set_class_groups] = useState([]);
  const [parents, setParents] = useState([]);

  const get_current_school_students = async () => {
    const data = await school_dashboard_client.get_current_school_students();
    console.log(data);
    setStudents(data);
  };

  const get_current_school_teachers = async () => {
    const data = await school_dashboard_client.get_current_school_teachers();
    console.log(data);
    setTeachers(data);
  };

  const get_current_school_class_groups = async () => {
    const data =
      await school_dashboard_client.get_current_school_class_groups();
    console.log(data);
    set_class_groups(data);
  };
  const get_current_school_parents = async () => {
    const data = await school_dashboard_client.get_current_school_parents();
    console.log(data);
    setParents(data);
  };

  useEffect(() => {
    //! fetching :
    get_current_school_students();
    get_current_school_teachers();
    get_current_school_class_groups();
    get_current_school_parents();
  }, []);
  const stats = [
    {
      title: "إجمالي الطلاب",
      value: students.length || "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "المعلمون",
      value: teachers.length || "0",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "الفصول",
      value: class_groups.length || "0",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "الحضور اليومي",
      value: "94%",
      icon: BarChart2,
      color: "bg-orange-500",
    },
  ];

  const tabs = [
    { id: "home", label: "الرئيسية", icon: Home },
    { id: "users", label: "إدارة المستخدمين", icon: Users },
    { id: "levels", label: "إدارة الصفوف", icon: Layers },
    { id: "schedules", label: "جداول توقيت", icon: Calendar },
    { id: "exams", label: "رزنامة الامتحانات", icon: FileText },
    { id: "reports", label: "تقارير", icon: BarChart2 },
    { id: "grades", label: "المعدل الفصلي", icon: FileText },
    { id: "activities", label: "فعاليات", icon: Star },
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

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  الأنشطة الأخيرة
                </h3>
                <div className="space-y-4">
                  {[
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
                  ].map((activity, index) => (
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
                  الإحصائيات الشهرية
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      طلاب جدد
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      +12
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      معدل الحضور
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
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
            <StudentManagement studentsList={students} />
            <TeacherManagement teachersList={teachers} />
            <ParentManagement parentsList={parents}/>
          </div>
        );
      case "levels":
        return <ClassesManagement />;
      case "schedules":
        return <ScheduleManagement />;
      case "exams":
        return <ExamScheduleManagemen />;
      case "reports":
        return (
          <div className="space-y-6">
            <AbsenceReviews />
            <BehaviorReports />
          </div>
        );
      case "grades":
        return <GradeOverview />;
      case "activities":
        return <ActivitiesManagement />;
      default:
        return <PlaceholderPage title="صفحة غير موجودة" />;
    }
  };

  return (
    <DashboardLayout
      title="لوحة تحكم المدرسة"
      subtitle="مرحباً بك في نظام إدارة مدرسة الأمل الابتدائية"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default SchoolDashboard;
