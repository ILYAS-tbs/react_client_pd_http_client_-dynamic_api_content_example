import React, { useState } from "react";
import {
  Plus,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { TeacherAbsenceManagerProps } from "../../types";
import { TeacherAbsence } from "../../models/TeacherAbsence";
import { User } from "../../contexts/AuthContext";
import { Student } from "../../models/Student";
import { PostBehaviourReportPayload } from "../../services/http_api/payloads_types/teacher_client_payload_types";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { BehaviourReport } from "../../models/BehaviorReport";

const TeacherAbsenceManager: React.FC<TeacherAbsenceManagerProps> = ({
  absences,
  setAbsences,
  students_list,
  teacher_id,
  behaviour_reports,
  setBehaviourReports,
}) => {
  const [selectedChild, setSelectedChild] = useState("all");
  const [showBehaviourReportModel, setShowBehaviourReportModel] =
    useState(false);
  const [activeTab, setActiveTab] = useState("absences");
  const [newRequest, setNewRequest] = useState({
    childId: "",
    date: "",
    reason: "",
    details: "",
    urgent: false,
    documents: null as File[] | null,
  });

  // mock child data :  { id: "child1", name: "أحمد محمد علي" },
  const children = students_list.map((s: Student) => ({
    id: s.student_id,
    name: s.full_name,
  }));

  /*
  - absence request mock data :
   {
      id: 1,
      childId: "child1",
      childName: "أحمد محمد علي",
      date: "2024-01-15",
      reason: "مرض - حمى وصداع",
      status: "pending",
      submittedDate: "2024-01-16",
      documents: true,
      adminComment: "",
    },
  */
  const absenceRequests = absences?.map((abs: TeacherAbsence) => {
    const absence = {
      id: abs.id,
      childId: abs.student?.student_id,
      childName: abs.student?.full_name,
      date: abs.created_at,
      reason: "مرض - حمى وصداع",
      status: "pending",
      submittedDate: "2024-01-16",
      documents: true,
      adminComment: "",
    };
    return absence;
  });

  /* mock attitudereport data :
   {
      id: 1,
      childId: "child1",
      childName: "أحمد محمد علي",
      date: "2024-01-15",
      behaviorRating: "ممتاز",
      participation: "نشط جداً",
      teacherComment:
        "أحمد يظهر اهتماماً كبيراً في الدروس ويشارك بنشاط في النقاشات الصفية.",
      submittedBy: "الأستاذة فاطمة حسن",
      submittedDate: "2024-01-16",
    },
  */
  const attitudeReports = behaviour_reports.map((report: BehaviourReport) => ({
    id: report.behaviour_report_id,
    childId: report.student.student_id,
    childName: report.student.full_name,
    date: report.date,
    behaviorRating: report.type,
    participation: report.description,
    teacherComment: report.conclusion,
    submittedBy: report.teacher.full_name,
    // submittedDate: new Date(report.created_at),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "rejected":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "مقبول";
      case "rejected":
        return "مرفوض";
      default:
        return "قيد المراجعة";
    }
  };

  const getBehaviorColor = (rating: string) => {
    switch (rating) {
      case "ممتاز":
      case "excellent":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "جيد جداً":
      case "good":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "جيد":
      case "bad":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    }
  };

  const filteredRequests = absenceRequests.filter(
    (request) => selectedChild === "all" || request.childId === selectedChild
  );

  const filteredAttitudeReports = attitudeReports.filter(
    (report) => selectedChild === "all" || report.childId === selectedChild
  );

  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter((r) => r.status === "pending").length,
    approved: filteredRequests.filter((r) => r.status === "approved").length,
    rejected: filteredRequests.filter((r) => r.status === "rejected").length,
  };

  const attitudeStats = {
    total: filteredAttitudeReports.length,
    excellent: filteredAttitudeReports.filter(
      (r) => r.behaviorRating === "ممتاز" || r.behaviorRating === "excellent"
    ).length,
    veryGood: filteredAttitudeReports.filter(
      (r) => r.behaviorRating === "جيد جداً" || r.behaviorRating === "very good"
    ).length,
    good: filteredAttitudeReports.filter(
      (r) => r.behaviorRating === "جيد" || r.behaviorRating === "good"
    ).length,
  };

  //! Behaviour Report :
  const [behaviourReportFormData, setBehaviourReportFormData] =
    useState<PostBehaviourReportPayload>({
      date: "",
      type: "good",
      description: "",
      conclusion: "",
      teacher_id: teacher_id,
      student_id: "",
    });

  const handleBehaviourModelFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setBehaviourReportFormData({
      ...behaviourReportFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("TeacherAbsenceManger - submit behaviour report data : ");
    console.log(behaviourReportFormData);

    // Simulate submitting the absence request
    const newAbsenceRequest = {
      id: absenceRequests.length + 1,
      childId: newRequest.childId,
      childName:
        children.find((child) => child.id === newRequest.childId)?.name || "",
      date: newRequest.date,
      reason:
        newRequest.reason +
        (newRequest.details ? ` - ${newRequest.details}` : ""),
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0],
      documents: !!newRequest.documents,
      adminComment: "",
    };
    // In a real app, send to backend
    console.log("Submitting absence request:", newAbsenceRequest);
    setShowBehaviourReportModel(false);
    setNewRequest({
      childId: "",
      date: "",
      reason: "",
      details: "",
      urgent: false,
      documents: null,
    });

    // ! API CALL
    const latest_csrf = getCSRFToken()!;
    const post_behaviour_report_res =
      await teacher_dashboard_client.post_behaviour_report(
        behaviourReportFormData,
        latest_csrf
      );
    //! refresh data :
    if (!post_behaviour_report_res.ok) {
      return;
    }

    const new_behaviour_reports_res =
      await teacher_dashboard_client.get_current_teacher_behaviour_reports();

    if (new_behaviour_reports_res.ok) {
      const new_behaviour_reports_list: BehaviourReport[] =
        new_behaviour_reports_res.data;
      setBehaviourReports(new_behaviour_reports_list);
    }
  };

  const renderAbsenceContent = () => (
    <>
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "إجمالي الغيابات",
            value: absences.length,
            color: "bg-blue-500",
            icon: FileText,
          },
          // {
          //   label: "قيد المراجعة",
          //   value: stats.pending,
          //   color: "bg-yellow-500",
          //   icon: Clock,
          // },
          // {
          //   label: "مقبول",
          //   value: stats.approved,
          //   color: "bg-green-500",
          //   icon: CheckCircle,
          // },
          // {
          //   label: "مرفوض",
          //   value: stats.rejected,
          //   color: "bg-red-500",
          //   icon: XCircle,
          // },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
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

      {/* Absence Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد طلبات غياب
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              لم تقم بتقديم أي طلبات تبرير غياب بعد
            </p>
            <button
              onClick={() => setShowBehaviourReportModel(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              تقديم طلب جديد
            </button>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {request.childName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      تاريخ الغياب:{" "}
                      {new Date(request.date).toLocaleDateString("ar")}
                    </p>
                    {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                      تاريخ التقديم: {request.submittedDate}
                    </p> */}
                  </div>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {getStatusIcon(request.status)}
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {getStatusText(request.status)}
                  </span>
                </div>
              </div>

              {/* <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  سبب الغياب:
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {request.reason}
                </p>
              </div> */}

              {/* <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    مستندات داعمة:
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      request.documents
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    }`}
                  >
                    {request.documents ? "متوفرة" : "غير متوفرة"}
                  </span>
                </div>
                {request.reviewDate && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    تاريخ المراجعة: {request.reviewDate}
                  </span>
                )}
              </div> */}

              {request.adminComment && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    تعليق الإدارة:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {request.adminComment}
                  </p>
                </div>
              )}

              {request.status === "pending" && (
                <div className="mt-4 flex items-center space-x-2 rtl:space-x-reverse text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>الطلب قيد المراجعة من قبل الإدارة</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );

  const renderAttitudeContent = () => (
    <>
      {/* Attitude Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "إجمالي التقارير",
            value: attitudeStats.total,
            color: "bg-blue-500",
            icon: FileText,
          },
          {
            label: "سلوك ممتاز",
            value: attitudeStats.excellent,
            color: "bg-green-500",
            icon: CheckCircle,
          },
          {
            label: "سلوك جيد",
            value: attitudeStats.good + attitudeStats.veryGood,
            color: "bg-yellow-500",
            icon: TrendingUp,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
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

      {/* Attitude Reports */}
      <div className="space-y-4">
        {filteredAttitudeReports.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد تقارير سلوك
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              لا توجد تقارير سلوك متاحة لهذا الطفل حالياً
            </p>
          </div>
        ) : (
          filteredAttitudeReports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {report.childName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      تاريخ التقديم:{" "}
                      {new Date(report.date).toLocaleDateString("ar")}
                    </p>
                    {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                      على الساعة:{" "}
                      {new Date(report.date).toLocaleTimeString("ar")}
                    </p> */}
                  </div>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${getBehaviorColor(
                      report.behaviorRating
                    )}`}
                  >
                    {report.behaviorRating}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المشاركة الصفية:
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {report.participation}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تعليق المعلم:
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {report.teacherComment}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    مقدم من:
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {report.submittedBy}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {activeTab === "absences" ? "إدارة الغياب" : "تقارير السلوك"}
        </h2>

        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Searching students disabled for now */}
          {/* <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">جميع الأطفال</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select> */}
          {activeTab !== "absences" && (
            <button
              onClick={() => setShowBehaviourReportModel(true)}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة تقرير سلوك</span>
            </button>
          )}
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4 rtl:space-x-reverse">
          <button
            onClick={() => setActiveTab("absences")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "absences"
                ? "bg-green-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            إدارة الغياب
          </button>
          <button
            onClick={() => setActiveTab("attitude")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "attitude"
                ? "bg-green-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            تقارير السلوك
          </button>
        </div>
      </div>
      {/* Content */}
      {activeTab === "absences"
        ? renderAbsenceContent()
        : renderAttitudeContent()}

      {/* Behaviour Report  Modal */}
      {showBehaviourReportModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إضافة تقرير سلوك
            </h3>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اختر الطفل
                </label>
                <select
                  name="student_id"
                  value={behaviourReportFormData.student_id}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, childId: e.target.value });
                    handleBehaviourModelFormChange(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">اختر الطفل</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تاريخ التقرير
                </label>
                <input
                  name="date"
                  type="date"
                  value={behaviourReportFormData.date}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, date: e.target.value });
                    handleBehaviourModelFormChange(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  نوع السلوك
                </label>
                <select
                  name="type"
                  value={behaviourReportFormData.type}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, reason: e.target.value });
                    handleBehaviourModelFormChange(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">اختر نوع السلوك</option>
                  <option value="excellent">ممتاز</option>
                  <option value="good">جيد</option>
                  <option value="bad">سيئ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المشاركة الصفية
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={behaviourReportFormData.description}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, details: e.target.value });
                    handleBehaviourModelFormChange(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اكتب تفاصيل إضافية عن حالة المشاركة الصفية للطالب..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تعليق المعلم
                </label>
                <textarea
                  rows={4}
                  name="conclusion"
                  value={behaviourReportFormData.conclusion}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, details: e.target.value });
                    handleBehaviourModelFormChange(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أضف ملاحظاتك حول الطالب هنا..."
                />
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={newRequest.urgent}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, urgent: e.target.checked })
                  }
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label
                  htmlFor="urgent"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  طلب عاجل (يتطلب مراجعة فورية)
                </label>
              </div>

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBehaviourReportModel(false);
                    setNewRequest({
                      childId: "",
                      date: "",
                      reason: "",
                      details: "",
                      urgent: false,
                      documents: null,
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  تقديم التقرير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAbsenceManager;
