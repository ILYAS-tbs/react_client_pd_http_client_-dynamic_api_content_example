import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  MessageCircle,
  FileText,
  TrendingUp,
  Upload,
  ClipboardList,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import MonthylEvaluation from "../../components/teacher/MonthylEvaluation.tsx";
import ClassManagement from "../../components/teacher/ClassManagement";
import GradeManager from "../../components/teacher/GradeManager.tsx";
import ResourceManager from "../../components/teacher/ResourceManager";
import { Student } from "../../models/Student";
import {
  sanitizeTeacherModuleClassGroups,
  TeacherModuleClassGroup,
} from "../../models/TeacherModuleClassGroup";
import { TeacherUpload } from "../../models/TeacherUpload";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { User } from "../../contexts/AuthContext";
import TeacherChat from "../../components/shared/TeacherChat.tsx";
import TeacherHomeworks from "../../components/teacher/TeacherHomeworks";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";
import { getTranslation } from "../../utils/translations";
import TeacherBehaviourNotesTab from "../../components/teacher/TeacherBehaviourNotesTab";

interface TeacherDashboardStats {
  my_classes: number;
  grades: number;
  chats: number;
  teaching_materials: number;
}

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { logout } = useAuth();
  const navigate = useNavigate();

  //! Translation 
  const { language } = useLanguage()

  // ! Storing the teacher's id (which is the user id)
  const lc_user: User | null = (() => {
    try {
      const raw = localStorage.getItem("schoolParentOrTeacherManagementUser");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Failed to parse stored teacher session", error);
      return null;
    }
  })();
  if (!lc_user) {
    console.error("Teacher dashboard session is missing");
  }
  const teacher_id = Number(lc_user?.id ?? -1);
  console.log("teacher's id : ", teacher_id);

  //*: New Messages Frontend shape ::
  /*
  [
                    {
                      from: "أم أحمد",
                      message: "استفسار عن درجات الرياضيات",
                      time: "منذ ساعة",
                    },
                    {
                      from: "أبو فاطمة",
                      message: "طلب موعد لقاء",
                      time: "منذ 2 ساعة",
                    },
                    {
                      from: "أم محمد",
                      message: "شكر على المجهود",
                      time: "منذ 3 ساعات",
                    },
                  ]
  */


  const [isDeactivated, setIsDeactivated] = useState(false);

  //! Fetching Data From The Server
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [modules_class_groups, setModulesClassGroups] = useState<
    TeacherModuleClassGroup[]
  >([]);
  const [classGroupsLoaded, setClassGroupsLoaded] = useState(false);
  const [teacher_uploads, setTeacherUploads] = useState<TeacherUpload[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherDashboardStats>({
    my_classes: 0,
    grades: 0,
    chats: 0,
    teaching_materials: 0,
  });

  const handleDeactivated = async () => {
    setIsDeactivated(true);
    await logout();
  };
  const get_current_teacher_students = async () => {
    const res = await teacher_dashboard_client.get_current_teacher_students();
    if (res.ok) {
      const students_list: Student[] = res.data;
      setStudents(students_list);
    }
    setStudentsLoaded(true);
  };
  const get_current_teacher_stats = async () => {
    const res = await teacher_dashboard_client.get_current_teacher_stats();
    if (res.ok) {
      const stats_data: TeacherDashboardStats = res.data ?? {
        my_classes: 0,
        grades: 0,
        chats: 0,
        teaching_materials: 0,
      };
      setTeacherStats(stats_data);
    }
  };
  const get_current_teacher_modules_and_class_groups = async () => {
    const res =
      await teacher_dashboard_client.get_current_teacher_modules_and_class_groups();
    if (res.ok) {
      const modules_class_groups_list: TeacherModuleClassGroup[] =
        sanitizeTeacherModuleClassGroups(res.data);
      setModulesClassGroups(modules_class_groups_list);
    }
    setClassGroupsLoaded(true);
  };
  const get_current_teacher_uploads = async () => {
    const res = await teacher_dashboard_client.get_current_teacher_uploads();
    if (res.ok) {
      const teacher_uploads_list: TeacherUpload[] = res.data;
      setTeacherUploads(teacher_uploads_list);
    }
  };
  // Poll every 30s – if the school deactivated this teacher the session is
  // destroyed server-side, so the next check returns 401 and we show the
  // deactivation screen instead of silently failing.
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${SERVER_BASE_URL}/user-auth/get_role`, {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401 || res.status === 403) {
          handleDeactivated();
        }
      } catch {
        // network error – ignore, don't kick the user out
      }
    };

    const intervalId = setInterval(checkSession, 30_000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    get_current_teacher_students();
    get_current_teacher_stats();
    get_current_teacher_modules_and_class_groups();
    get_current_teacher_uploads();
  }, []);

  const stats = [
    { title: getTranslation('myClasses', language), value: teacherStats.my_classes || "0", icon: Users, color: "bg-primary-500", tab: "classes" },
    { title: getTranslation('marks', language), value: teacherStats.grades || "0", icon: FileText, color: "bg-primary-400", tab: "grades" },
    { title: getTranslation('chats', language), value: teacherStats.chats || "0", icon: MessageCircle, color: "bg-primary-500", tab: "chat" },
    { title: getTranslation('educationalMaterials', language), value: teacherStats.teaching_materials || "0", icon: Upload, color: "bg-primary-400", tab: "resources" },
  ];

  const tabs = [
    { id: "overview", label: getTranslation('overview', language), icon: TrendingUp },
    { id: "classes", label: getTranslation('myClasses', language), icon: Users },
       { id: "homeworks", label: getTranslation('homeworksTab', language), icon: ClipboardList },
    { id: "monthly_evaluation", label: getTranslation('monthlyEvaluation', language), icon: FileText },
    { id: "grades", label: getTranslation('marks', language), icon: FileText },
       {
      id: "behaviour_notes",
      label: getTranslation('behaviourNotesTab', language),
      icon: ClipboardList,
    },
    // { id: "schedule", label: getTranslation('classSchedule', language), icon: Calendar },
    { id: "chat", label: getTranslation('communication_teacher', language), icon: MessageCircle },

    { id: "resources", label: getTranslation('educationalMaterials', language), icon: BookOpen },
 
  ];

  //! Mapping the Schedule from API to Frontendshape :
  /* Frontend shape :
  {[
                    {
                      time: "08:00 - 08:45",
                      classes: [
                        "رياضيات 5أ",
                        "عربي 4ب",
                        "علوم 6أ",
                        "رياضيات 5ب",
                        "عربي 4أ",
                      ],
                    },
    ]
  */

  const renderContent = () => {
    switch (activeTab) {
      case "classes":
        return (
          <ClassManagement
            students_list={students}
            setStudentsList={setStudents}
            modules_class_groups={modules_class_groups}
            isLoading={!(studentsLoaded && classGroupsLoaded)}
          />
        );
      case "monthly_evaluation":
        return (
          <MonthylEvaluation
            modules_class_groups={modules_class_groups}
          />
        );
      case "grades":
        return (
          <GradeManager
            modules_class_groups={modules_class_groups}
          />
        );
      case "homeworks":
        return (
          <TeacherHomeworks
            modules_class_groups={modules_class_groups}
            students={students}
          />
        );
      case "resources":
        return (
          <ResourceManager
            modules_class_groups={modules_class_groups}
            teacher_uploads={teacher_uploads}
            setTeacherUploads={setTeacherUploads}
          />
        );
      case "chat":
        return (
          <TeacherChat
            userType="teacher"
            teacher_id={teacher_id}
            classGroups={modules_class_groups}
          />
        );

      // case "schedule":
      //   return <ScheduleViewer modules_class_groups={modules_class_groups} />;
      //               <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
      //                 الوقت
      //               </th>
      //               <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">
      //                 الأحد
      //               </th>
      //               <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">
      //                 الاثنين
      //               </th>
      //               <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">
      //                 الثلاثاء
      //               </th>
      //               <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">
      //                 الأربعاء
      //               </th>
      //               <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">
      //                 الخميس
      //               </th>
      //             </tr>
      //           </thead>
      //           <tbody>
      //             {[
      //               {
      //                 time: "08:00 - 08:45",
      //                 classes: [
      //                   "رياضيات 5أ",
      //                   "عربي 4ب",
      //                   "علوم 6أ",
      //                   "رياضيات 5ب",
      //                   "عربي 4أ",
      //                 ],
      //               },
      //               {
      //                 time: "08:45 - 09:30",
      //                 classes: [
      //                   "عربي 4أ",
      //                   "رياضيات 5أ",
      //                   "رياضيات 5ب",
      //                   "علوم 6أ",
      //                   "عربي 4ب",
      //                 ],
      //               },
      //               {
      //                 time: "10:00 - 10:45",
      //                 classes: [
      //                   "علوم 6أ",
      //                   "عربي 4أ",
      //                   "رياضيات 5أ",
      //                   "عربي 4ب",
      //                   "رياضيات 5ب",
      //                 ],
      //               },
      //             ].map((slot, index) => (
      //               <tr key={index}>
      //                 <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
      //                   {slot.time}
      //                 </td>
      //                 {slot.classes.map((cls, clsIndex) => (
      //                   <td
      //                     key={clsIndex}
      //                     className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-center text-sm text-gray-700 dark:text-gray-300"
      //                   >
      //                     {cls}
      //                   </td>
      //                 ))}
      //               </tr>
      //             ))}
      //           </tbody>
      //         </table>
      //       </div>
      //     </div>
      //   );
      case "behaviour_notes":
        return (
          <TeacherBehaviourNotesTab students={students} modulesClassGroups={modules_class_groups} />
        );
      default:
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

            {/* Today's Classes - removed for now */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                حصص اليوم
              </h3>
              <div className="space-y-3">
                {[
                  {
                    time: "08:00 - 08:45",
                    subject: "رياضيات",
                    class: "5أ",
                    room: "غرفة 201",
                  },
                  {
                    time: "08:45 - 09:30",
                    subject: "عربي",
                    class: "4أ",
                    room: "غرفة 102",
                  },
                  {
                    time: "10:00 - 10:45",
                    subject: "علوم",
                    class: "6أ",
                    room: "مختبر العلوم",
                  },
                ].map((lesson, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {lesson.subject} - {lesson.class}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lesson.room}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {lesson.time}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Quick Actions (hidden) */}
            {/* <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {getTranslation('quickActions', language)}
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('grades')}
                    className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors">
                    <Edit className="h-5 w-5" />
                    <span>{getTranslation('enterNewGrades', language)}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors">
                    <Upload className="h-5 w-5" />
                    <span>{getTranslation('uploadEducationalMaterial', language)}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>{getTranslation('sendNotificationToParents', language)}</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {getTranslation('newMessages', language)}
                </h3>
                <div className="space-y-3">
                  {newMessages.map((msg) => ({
                    from: msg.from_user?.username,
                    message: msg.content ?? "set a file",
                    time: timeAgoArabic(msg.timestamp),
                  })).map((msg, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {msg.from}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {msg.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}



          </div>
        );
    }
  };

  if (isDeactivated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6" dir="rtl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border border-red-200 dark:border-red-800">
          {/* Icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            تم تعطيل حسابك
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
            قامت المدرسة بتعطيل حسابك مؤقتاً.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            يرجى التواصل مع إدارة المدرسة لإعادة تفعيل حسابك والدخول مجدداً.
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
          >
            العودة إلى صفحة تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={getTranslation('teacherDashboardTitle', language)}
      subtitle={getTranslation('teacherDashboardSubtitle', language)}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
