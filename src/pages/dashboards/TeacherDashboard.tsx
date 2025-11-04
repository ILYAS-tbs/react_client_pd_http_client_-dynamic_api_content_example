import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  MessageCircle,
  FileText,
  Calendar,
  TrendingUp,
  Upload,
  Edit,
  FileX2,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import ClassManagement from "../../components/teacher/ClassManagement";
import GradeManager from "../../components/teacher/GradeManager";
import ResourceManager from "../../components/teacher/ResourceManager";
import ParentChat from "../../components/shared/ParentChat";
import { Student } from "../../models/Student";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import { Mark } from "../../models/Mark";
import { TeacherUpload } from "../../models/TeacherUpload";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import TeacherAbsenceManager from "../../components/teacher/TeacherAbsenceManager";
import { TeacherAbsence } from "../../models/TeacherAbsence";
import { shared_endpoints_clinet } from "../../services/http_api/shared_endpoints/shared_endpoints_client";
import { User } from "../../contexts/AuthContext";
import { BehaviourReport } from "../../models/BehaviorReport";
import {
  TeacherModuleClassGrp,
  ModuleClass,
} from "../../models/TeacherModuleClassGrp";
import { StudentGrade } from "../../models/StudentGrade";
import { chat_http_client } from "../../services/chat/chat_http_client";
import TeacherChat from "../../components/shared/TeacherChat";
import { Parent } from "../../models/Parent";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { Message } from "../../models/chat_system/Message";
import { timeAgoArabic } from "../../lib/timeAgoArabic";

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  //! Translation 
  const {language}=useLanguage()

  // ! Storing the teacher's id (which is the user id)
  const lc_user: User = JSON.parse(
    localStorage.getItem("schoolParentOrTeacherManagementUser") || ""
  );
  if (!lc_user) {
    console.error("TeacherAbsenceMAnagement lc_user is null");
    // return
  }
  const teacher_id: number = JSON.parse(lc_user.id);
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
 

  //! Fetching Data From The Server
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

  const [newMessages,setNewMessages]=useState<Message[]>([]);

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

  const get_latest_five_messages = async ()=>{
    const res = await chat_http_client.get_latest_five_messages()
    if(res.ok){
      const new_messages_list :Message[]= res.data 
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
  useEffect(() => {
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
    {
      title: getTranslation('myStudents',language),
      value: students.length || "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: getTranslation('Classes',language),
      value: modules_class_groups.length || "0",
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      title: getTranslation('newMessages',language),
      value: "7",
      icon: MessageCircle,
      color: "bg-purple-500",
    },
    {
      title: getTranslation('uploadedMaterials',language),
      value: teacher_uploads.length ?? "0",
      icon: Upload,
      color: "bg-orange-500",
    },
  ];

  const tabs = [
    { id: "overview", label: getTranslation('overview',language), icon: TrendingUp },
    { id: "classes", label: getTranslation('myClasses',language), icon: Users },
    { id: "grades", label: getTranslation('marks',language), icon: FileText },
    { id: "resources", label: getTranslation('educationalMaterials',language), icon: BookOpen },
    { id: "chat", label: getTranslation('communication_teacher',language), icon: MessageCircle },
    // { id: "schedule", label: "الجدول", icon: Calendar },
    {
      id: "absences",
      label: getTranslation('unexcusedAbsencesAndBehaviorReports',language),
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

      // Might be implemented later :
      // case "schedule":
      //   return (
      //     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      //       <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      //         الجدول الأسبوعي
      //       </h3>
      //       <div className="overflow-x-auto">
      //         <table className="w-full border-collapse">
      //           <thead>
      //             <tr className="bg-gray-50 dark:bg-gray-700">
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
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
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
                  {getTranslation('quickActions',language)}
                </h3>
                <div className="space-y-3">
                  <button 
                  onClick={()=>setActiveTab('grades')}
                  className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
                    <Edit className="h-5 w-5" />
                    <span>{getTranslation('enterNewGrades',language)}</span>
                  </button>
                  <button
                  onClick={()=>setActiveTab('resources')}
                  className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                    <Upload className="h-5 w-5" />
                    <span>{getTranslation('uploadEducationalMaterial',language)}</span>
                  </button>
                  <button 
                  onClick={()=>setActiveTab('chat')}
                  className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>{getTranslation('sendNotificationToParents',language)}</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                 {getTranslation('newMessages',language)}
                </h3>
                <div className="space-y-3">
                  {newMessages.map((msg)=>({
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

  return (
    <DashboardLayout
      title={getTranslation('teacherDashboardTitle',language)}
      subtitle={getTranslation('teacherDashboardSubtitle',language)}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
