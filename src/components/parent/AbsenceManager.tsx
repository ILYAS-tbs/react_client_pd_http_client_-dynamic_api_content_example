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
import { AbsenceManagerProps } from "../../types";
import { AbsenceReport } from "../../models/AbsenceReports";
import { PostAbsenceReportPayload } from "../../services/http_api/payloads_types/parent_client_payload_types";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { parent_dashboard_client } from "../../services/http_api/parent-dashboard/parent_dashboard_client";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

const AbsenceManager: React.FC<AbsenceManagerProps> = ({
  students,
  absence_reports,
  setAbsenceReports,
  behaviour_reports,
  setBehabiourReports,
}) => {
  //! Translation :
  const { language } = useLanguage();

  const [selectedChild, setSelectedChild] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState("absences");
  const [newRequest, setNewRequest] = useState({
    childId: "",
    date: "",
    reason: "",
    details: "",
    urgent: false,
    documents: null as File[] | null,
  });

  //! mock data to map the API to:
  // const children = [
  //   { id: "child1", name: "أحمد محمد علي" },
  //   { id: "child2", name: "فاطمة محمد علي" },
  // ];
  const children = students.map((student) => ({
    id: student.student_id,
    name: student.full_name,
  }));

  //! mock data to map the API to
  // const absenceRequests = [
  //   {
  //     id: 1,
  //     childId: "child1",
  //     childName: "أحمد محمد علي",
  //     date: "2024-01-15",
  //     reason: "مرض - حمى وصداع",
  //     status: "pending",
  //     submittedDate: "2024-01-16",
  //     documents: true,
  //     adminComment: "",
  //   },
  //   {
  //     id: 2,
  //     childId: "child1",
  //     childName: "أحمد محمد علي",
  //     date: "2024-01-10",
  //     reason: "موعد طبي",
  //     status: "approved",
  //     submittedDate: "2024-01-11",
  //     documents: true,
  //     adminComment: "تم قبول الطلب مع الشهادة الطبية المقدمة",
  //     reviewDate: "2024-01-12",
  //   },
  //   {
  //     id: 3,
  //     childId: "child2",
  //     childName: "فاطمة محمد علي",
  //     date: "2024-01-08",
  //     reason: "ظروف عائلية طارئة",
  //     status: "rejected",
  //     submittedDate: "2024-01-09",
  //     documents: false,
  //     adminComment: "يرجى تقديم مستندات داعمة للطلب",
  //     reviewDate: "2024-01-10",
  //   },
  //   {
  //     id: 4,
  //     childId: "child1",
  //     childName: "أحمد محمد علي",
  //     date: "2024-01-05",
  //     reason: "إجازة عائلية",
  //     status: "approved",
  //     submittedDate: "2024-01-04",
  //     documents: false,
  //     adminComment: "تم قبول الطلب - إجازة مبررة",
  //     reviewDate: "2024-01-05",
  //   },
  // ];
  const absenceRequests = absence_reports.map((report) => ({
    id: report.absence_report_id,
    childId: report.student.student_id,
    childName: report.student.full_name,
    date: new Date(report.absence_date),
    reason: report.absence_reason,
    status: report.status,
    submittedDate: new Date(report.submit_date),
    documents: report.proof_document ? true : false,
    adminComment: report.adminComment,
    reviewDate: report.reviewDate ? new Date(report.reviewDate) : null,
  }));

  //! Mock Date to map the API to :
  // const attitudeReports = [
  //   {
  //     id: 1,
  //     childId: "child1",
  //     childName: "أحمد محمد علي",
  //     date: "2024-01-15",
  //     behaviorRating: "ممتاز",
  //     participation: "نشط جداً",
  //     teacherComment:
  //       "أحمد يظهر اهتماماً كبيراً في الدروس ويشارك بنشاط في النقاشات الصفية.",
  //     submittedBy: "الأستاذة فاطمة حسن",
  //     submittedDate: "2024-01-16",
  //   },
  //   {
  //     id: 2,
  //     childId: "child1",
  //     childName: "أحمد محمد علي",
  //     date: "2024-01-10",
  //     behaviorRating: "جيد",
  //     participation: "نشط",
  //     teacherComment:
  //       "أحمد يحتاج إلى التركيز أكثر أثناء الشرح لكنه يظهر تحسناً.",
  //     submittedBy: "أ. محمد السعيد",
  //     submittedDate: "2024-01-11",
  //   },
  //   {
  //     id: 3,
  //     childId: "child2",
  //     childName: "فاطمة محمد علي",
  //     date: "2024-01-08",
  //     behaviorRating: "ممتاز",
  //     participation: "نشط جداً",
  //     teacherComment:
  //       "فاطمة متعاونة للغاية وتساعد زملاءها في المشاريع الجماعية.",
  //     submittedBy: "الأستاذة سارة أحمد",
  //     submittedDate: "2024-01-09",
  //   },
  //   {
  //     id: 4,
  //     childId: "child2",
  //     childName: "فاطمة محمد علي",
  //     date: "2024-01-05",
  //     behaviorRating: "جيد جداً",
  //     participation: "نشط",
  //     teacherComment: "فاطمة تظهر تقدماً ملحوظاً في التفاعل مع الدروس.",
  //     submittedBy: "أ. علي حسن",
  //     submittedDate: "2024-01-06",
  //   },
  // ];

  const mapBehaviourRating = (rating: string) => {
    switch (rating) {
      case "excellent":
        return getTranslation("excellent", language);

      case "very good":
        return getTranslation("veryGood", language);

      case "good":
        return getTranslation("good", language);

      default:
        return getTranslation("poorPerformance", language);
    }
  };
  const attitudeReports = behaviour_reports.map((report) => ({
    id: report.behaviour_report_id,
    childId: report.student.student_id,
    childName: report.student.full_name,
    date: new Date(report.date),
    behaviorRating: mapBehaviourRating(report.type),
    participation: report.conclusion,
    teacherComment: report.description,
    submittedBy: report.teacher.full_name,
    submittedDate: new Date(report.created_at),
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
        return getTranslation("Accepted", language);
      case "rejected":
        return getTranslation("Rejected", language);
      default:
        return getTranslation("UnderReview", language);
    }
  };

  const getBehaviorColor = (rating: string) => {
    switch (rating) {
      case "ممتاز":
      case "excellent":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "جيد جداً":
      case "very good":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "جيد":
      case "good":
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

  //! PostAbsenceReport modal & Form :

  const [absence_date, setAbsenceDate] = useState("");
  const [absence_reason, setAbsenceReason] = useState("");
  const [more_details, setMoreDetails] = useState("");
  const [is_urgent, setIsUrgent] = useState(false);
  const [proof_document, setProofDocument] = useState<File | null>(null);
  const [student_id, setStudentID] = useState("");

  const [requestError, setRequestError] = useState("");
  const showRequestError = (error: string) => {
    setRequestError(error);
    setTimeout(() => {
      setRequestError("");
    }, 7000);
  };
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setNewRequest({
      childId: "",
      date: "",
      reason: "",
      details: "",
      urgent: false,
      documents: null,
    });
    //! API CALL :
    if (!absence_date) {
      showRequestError("الرجاء اختيار تاريخ الغياب");
      return;
    }
    if (!absence_reason) {
      showRequestError("يرجى إدخال سبب الغياب");
      return;
    }

    if (!student_id) {
      showRequestError("الرجاء اختيار الطالب");
      return;
    }

    const report_payload: PostAbsenceReportPayload = {
      absence_date: absence_date,
      absence_reason: absence_reason,
      more_details: more_details,
      is_urgent: is_urgent,
      proof_document: proof_document,
      student_id: student_id,
    };
    const latest_csrf = getCSRFToken()!;

    const post_report_res = await parent_dashboard_client.post_absence_report(
      report_payload,
      latest_csrf
    );

    if (!post_report_res.ok) {
      showRequestError("حدث خطأ غير متوقع، يرجى المحاولة لاحقًا");
      return;
    }
    setShowRequestModal(false);

    //? Refreshing data :
    const new_absence_reports_res =
      await parent_dashboard_client.get_current_parent_absence_reports();

    if (new_absence_reports_res.ok) {
      const new_absence_reports_list: AbsenceReport[] =
        new_absence_reports_res.data;

      setAbsenceReports(new_absence_reports_list);
    }
  };

  const renderAbsenceContent = () => (
    <>
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: getTranslation("totalRequests", language),
            value: stats.total,
            color: "bg-blue-500",
            icon: FileText,
          },
          {
            label: getTranslation("UnderReview", language),
            value: stats.pending,
            color: "bg-yellow-500",
            icon: Clock,
          },
          {
            label: getTranslation("Accepted", language),
            value: stats.approved,
            color: "bg-green-500",
            icon: CheckCircle,
          },
          {
            label: getTranslation("Rejected", language),
            value: stats.rejected,
            color: "bg-red-500",
            icon: XCircle,
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

      {/* Absence Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {getTranslation("noLeaveRequests", language)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {getTranslation("noLeaveJustificationRequests", language)}{" "}
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {getTranslation("submitNewRequest", language)}
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
                      {getTranslation("AbsenceDate", language)}:{" "}
                      {request.date.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getTranslation("SubmissionDate", language)}:{" "}
                      {request.submittedDate.toLocaleDateString()}
                    </p>
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

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("AbsenceReason", language)}
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {request.reason}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getTranslation("supportingDocuments", language)}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      request.documents
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    }`}
                  >
                    {request.documents
                      ? getTranslation("Available", language)
                      : getTranslation("NotAvailable", language)}
                  </span>
                </div>
                {request.reviewDate && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getTranslation("reviewDate", language)}:{" "}
                    {request.reviewDate.toLocaleString()}
                  </span>
                )}
              </div>

              {request.adminComment && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("adminComment", language)}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {request.adminComment}
                  </p>
                </div>
              )}

              {request.status === "pending" && (
                <div className="mt-4 flex items-center space-x-2 rtl:space-x-reverse text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{getTranslation("requestUnderReview", language)}</span>
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
            label: getTranslation("totalReports", language),
            value: attitudeStats.total,
            color: "bg-blue-500",
            icon: FileText,
          },
          {
            label: getTranslation("excellentBehavior", language),
            value: attitudeStats.excellent,
            color: "bg-green-500",
            icon: CheckCircle,
          },
          {
            label: getTranslation("goodBehavior", language),
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
              {getTranslation("noBehaviorReports", language)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {getTranslation("noBehaviorReportsForChild", language)}
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
                      {getTranslation("reportDate", language)}:{" "}
                      {report.date.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getTranslation("SubmissionDate", language)}:{" "}
                      {report.submittedDate.toLocaleDateString()}
                    </p>
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
                  {getTranslation("classParticipation", language)}:
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {report.participation}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("teacherComment", language)}:
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {report.teacherComment}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getTranslation("submittedBy", language)}
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
          <select
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
          </select>
          {activeTab === "absences" && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>{getTranslation("leaveRequest", language)}</span>
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
            {getTranslation("absenceManagement", language)}
          </button>
          <button
            onClick={() => setActiveTab("attitude")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "attitude"
                ? "bg-green-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {getTranslation("behaviorReports", language)}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "absences"
        ? renderAbsenceContent()
        : renderAttitudeContent()}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {getTranslation("leaveRequest", language)}
            </h3>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("selectChild", language)}
                </label>
                <select
                  value={student_id}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, childId: e.target.value });
                    setStudentID(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">
                    {getTranslation("selectChild", language)}
                  </option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("AbsenceDate", language)}
                </label>
                <input
                  type="date"
                  value={absence_date}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, date: e.target.value });
                    setAbsenceDate(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("AbsenceReason", language)}
                </label>
                <select
                  value={absence_reason}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, reason: e.target.value });
                    setAbsenceReason(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">
                    {getTranslation("absenceReasonPlaceholder", language)}
                  </option>
                  <option value="مرض">
                    {getTranslation("illness", language)}
                  </option>
                  <option value="موعد طبي">
                    {getTranslation("medicalAppointment", language)}
                  </option>
                  <option value="ظروف عائلية">
                    {getTranslation("familyCircumstances", language)}
                  </option>
                  <option value="طوارئ">
                    {getTranslation("emergency", language)}
                  </option>
                  <option value="سفر">
                    {getTranslation("travel", language)}
                  </option>
                  <option value="أخرى">
                    {getTranslation("other", language)}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("additionalDetails", language)}
                </label>
                <textarea
                  rows={4}
                  value={more_details}
                  onChange={(e) => {
                    setMoreDetails(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={getTranslation(
                    "additionalDetailsPlaceholder",
                    language
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("uploadSupportingDocuments", language)}
                </label>
                <label htmlFor="proof_doc_input">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getTranslation("clickToSelect", language)}
                    </p>
                    <input
                      id="proof_doc_input"
                      type="file"
                      // multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        setNewRequest({
                          ...newRequest,
                          documents: e.target.files
                            ? Array.from(e.target.files)
                            : null,
                        });

                        setProofDocument(
                          e.target.files ? e.target.files[0] : null
                        );
                      }}
                      className="hidden"
                    />
                  </div>
                </label>
                {newRequest.documents && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {newRequest.documents.length}{" "}
                    {getTranslation("selectedFiles", language)}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={is_urgent}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, urgent: e.target.checked });
                    setIsUrgent(e.target.checked);
                  }}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label
                  htmlFor="urgent"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  {getTranslation("urgentRequest", language)}
                </label>
              </div>

              {/* ERROR */}
              {requestError && (
                <div className="text text-red-500">{requestError}</div>
              )}

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
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
                  {getTranslation("cancel", language)}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {getTranslation("submitRequest", language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsenceManager;
