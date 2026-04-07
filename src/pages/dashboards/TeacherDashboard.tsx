import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  MessageCircle,
  FileText,
  TrendingUp,
  Upload,
  Edit,
  FileX2,
  ClipboardList,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import MonthylEvaluation from "../../components/teacher/MonthylEvaluation";
import ClassManagement from "../../components/teacher/ClassManagement";
import GradeManager from "../../components/teacher/GradeManager";
import ResourceManager from "../../components/teacher/ResourceManager";
import { Student } from "../../models/Student";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import { TeacherUpload } from "../../models/TeacherUpload";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import TeacherAbsenceManager from "../../components/teacher/TeacherAbsenceManager";
import { TeacherAbsence } from "../../models/TeacherAbsence";
import { shared_endpoints_clinet } from "../../services/http_api/shared_endpoints/shared_endpoints_client";
import { User } from "../../contexts/AuthContext";
import { BehaviourReport } from "../../models/BehaviorReport";
import { TeacherModuleClassGrp } from "../../models/TeacherModuleClassGrp";
import { StudentGrade } from "../../models/StudentGrade";
import { chat_http_client } from "../../services/chat/chat_http_client";
import TeacherChat from "../../components/shared/TeacherChat";
import ScheduleViewer from "../../components/teacher/ScheduleViewer";
import TeacherHomeworks from "../../components/teacher/TeacherHomeworks";
import { Parent } from "../../models/Parent";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";
import { getTranslation } from "../../utils/translations";
import { Message } from "../../models/chat_system/Message";
import { timeAgoArabic } from "../../lib/timeAgoArabic";
import { Teacher } from "../../models/Teacher";
import { MonthlyEvaluation } from "../../models/MonthlyEvaluation";

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
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [students, setStudents] = useState<Student[]>([]);
  const [modules_class_groups, setModulesClassGroups] = useState<
    TeacherModuleClassGroup[]
  >([]);
  const [teacher_uploads, setTeacherUploads] = useState<TeacherUpload[]>([]);
  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [behaviour_reports, setBehaviourReports] = useState<BehaviourReport[]>(
    []
  );
  const [modules, setModules] = useState<TeacherModuleClassGrp[]>([]);
  const [students_grades, setStudentsGrades] = useState<StudentGrade[]>([]);
  const [monthlyEvaluations, setMonthlyEvaluations] = useState<MonthlyEvaluation[]>([]);

  const [newMessages, setNewMessages] = useState<Message[]>([]);

  const handleDeactivated = async () => {
    setIsDeactivated(true);
    await logout();
  };

  const get_teacher_by_id = async () => {
    if (!Number.isFinite(teacher_id) || teacher_id <= 0) {
      return;
    }
    const res = await teacher_dashboard_client.get_teacher_by_id(teacher_id);
    if (res.status === 401 || res.status === 403) {
      handleDeactivated();
      return;
    }
    if (res.ok) {
      const new_teacher: Teacher = res.data;
      setTeacher(new_teacher);
    }
  };
  const get_current_teacher_students = async () => {
    const res = await teacher_dashboard_client.get_current_teacher_students();
    if (res.ok) {
      const students_list: Student[] = res.data;
      setStudents(students_list);
    }
  };
  const get_current_teacher_modules_and_class_groups = async () => {
    const res =
      await teacher_dashboard_client.get_current_teacher_modules_and_class_groups();
    if (res.ok) {
      const modules_class_groups_list: TeacherModuleClassGroup[] = res.data;
      setModulesClassGroups(modules_class_groups_list);
    }
  };
  const current_teacher_students_grades = async () => {
    const res =
      await teacher_dashboard_client.current_teacher_students_grades();
    if (res.ok) {
      const grades_list: StudentGrade[] = res.data;
      setStudentsGrades(grades_list);
    }
  };
  const get_current_teacher_uploads = async () => {
    const res = await teacher_dashboard_client.get_current_teacher_uploads();
    if (res.ok) {
      const teacher_uploads_list: TeacherUpload[] = res.data;
      setTeacherUploads(teacher_uploads_list);
    }
  };
  const absences_for_current_school_or_teacher = async () => {
    const res =
      await shared_endpoints_clinet.absences_for_current_school_or_teacher();
    if (res.ok) {
      const absences_list: TeacherAbsence[] = res.data;
      setAbsences(absences_list);
    }
  };
  const get_current_teacher_behaviour_reports = async () => {
    const res =
      await teacher_dashboard_client.get_current_teacher_behaviour_reports();
    if (res.ok) {
      const behaviour_reports_list: BehaviourReport[] = res.data;
      setBehaviourReports(behaviour_reports_list);
    }
  };
  const current_teacher_school_modules = async () => {
    const res = await teacher_dashboard_client.current_teacher_school_modules();
    if (res.ok) {
      const modules_list: TeacherModuleClassGrp[] = res.data;
      setModules(modules_list);
    }
  };

  const get_latest_five_messages = async () => {
    const res = await chat_http_client.get_latest_five_messages()
    if (res.ok) {
      const new_messages_list: Message[] = res.data
      setNewMessages(new_messages_list)
    }
  }

  //? Chat system :
  //? list for all the parents this teacher can chat with
  const [parents_list, setParentsList] = useState<Parent[]>([]);

  //! API CALL : 1. retrieving the teachers for this parent
  const get_current_teacher_school_parents = async () => {
    const res = await chat_http_client.get_current_teacher_school_parents();
    if (res.ok) {
      const new_parents_list: Parent[] = res.data;
      setParentsList(new_parents_list);
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
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    get_teacher_by_id();
    get_current_teacher_students();
    get_current_teacher_modules_and_class_groups();
    get_current_teacher_uploads();
    absences_for_current_school_or_teacher();
    get_current_teacher_behaviour_reports();
    current_teacher_school_modules();
    current_teacher_students_grades();
    get_latest_five_messages()

    //? chat system :
    get_current_teacher_school_parents();
  }, []);

  //? SYNC WITH THE SERVER
  function RefetchGrades() {
    current_teacher_students_grades();
  }

  const stats = [
    { title: getTranslation('myStudents', language), value: students.length || "0", icon: Users, color: "bg-primary-500", tab: "classes" },
    { title: getTranslation('Classes', language), value: modules_class_groups.length || "0", icon: BookOpen, color: "bg-primary-400", tab: "classes" },
    { title: getTranslation('newMessages', language), value: newMessages.length || "0", icon: MessageCircle, color: "bg-primary-500", tab: "chat" },
    { title: getTranslation('uploadedMaterials', language), value: teacher_uploads.length || "0", icon: Upload, color: "bg-primary-400", tab: "resources" },
  ];

  const tabs = [
    { id: "overview", label: getTranslation('overview', language), icon: TrendingUp },
    { id: "classes", label: getTranslation('myClasses', language), icon: Users },
    { id: "homeworks", label: getTranslation('homeworksTab', language), icon: ClipboardList },
    { id: "monthly_evaluation", label: getTranslation('monthlyEvaluation', language), icon: FileText },
    { id: "schedule", label: getTranslation('classSchedule', language), icon: Calendar },

    { id: "grades", label: getTranslation('marks', language), icon: FileText },
    { id: "resources", label: getTranslation('educationalMaterials', language), icon: BookOpen },
    { id: "chat", label: getTranslation('communication_teacher', language), icon: MessageCircle },
    {
      id: "absences",
      label: getTranslation('unexcusedAbsencesAndBehaviorReports', language),
      icon: FileX2,
    },
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
            setAbsences={setAbsences}
            teacher_id={teacher_id}
            setActiveTab={setActiveTab}
            teacher={teacher}
          />
        );
      case "monthly_evaluation":
        return (
          <MonthylEvaluation
            students_list={students}
            modules_class_groups={modules_class_groups}
            monthly_evaluations={monthlyEvaluations}
            setMonthlyEvaluations={setMonthlyEvaluations}
          />
        );
      case "grades":
        return (
          <GradeManager
            modules={modules}
            modules_class_groups={modules_class_groups}
            students_grades={students_grades}
            teacher_id={teacher_id}
            setStudentsGrades={setStudentsGrades}
            RefetchGrades={RefetchGrades}
            students={students}
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
            parents_list={parents_list}
            teacher_id={teacher_id}
          />
        );

      case "schedule":
        return <ScheduleViewer modules_class_groups={modules_class_groups} />;
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
      case "absences":
        return (
          <TeacherAbsenceManager
            absences={absences}
            setAbsences={setAbsences}
            students_list={students}
            teacher_id={teacher_id}
            behaviour_reports={behaviour_reports}
            setBehaviourReports={setBehaviourReports}
          />
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

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
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
            </div>



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
