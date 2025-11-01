import React, { useState } from "react";
import { Check, X, Eye, Calendar, User } from "lucide-react";
import { AbsenceReviewsProps } from "../../types";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { PatchAbsenceReportPayload } from "../../services/http_api/payloads_types/school_client_payload_types";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

const AbsenceReviews: React.FC<AbsenceReviewsProps> = ({
  absence_reports_list,
  RefetchReports,
}) => {
  const [filter, setFilter] = useState("pending");

  //! Translation :: 
  const {language}=useLanguage()
  // mock data :
  // const absenceRequests = [
  //   {
  //     id: 1,
  //     studentName: "أحمد محمد علي",
  //     class: "5أ",
  //     parentName: "محمد علي",
  //     date: "2024-01-15",
  //     reason: "مرض - حمى وصداع",
  //     status: "pending",
  //     submittedDate: "2024-01-16",
  //     documents: true,
  //   },
  //   {
  //     id: 2,
  //     studentName: "فاطمة حسن",
  //     class: "4ب",
  //     parentName: "حسن أحمد",
  //     date: "2024-01-14",
  //     reason: "ظروف عائلية طارئة",
  //     status: "accepted",
  //     submittedDate: "2024-01-15",
  //     documents: false,
  //     reviewDate: "2024-01-16",
  //   },
  //   {
  //     id: 3,
  //     studentName: "عمر السعيد",
  //     class: "6أ",
  //     parentName: "السعيد محمد",
  //     date: "2024-01-13",
  //     reason: "موعد طبي",
  //     status: "refused",
  //     submittedDate: "2024-01-14",
  //     documents: true,
  //     reviewDate: "2024-01-15",
  //     rejectionReason: "لم يتم تقديم شهادة طبية",
  //   },
  //   {
  //     id: 4,
  //     studentName: "زينب العلي",
  //     class: "5أ",
  //     parentName: "علي حسن",
  //     date: "2024-01-12",
  //     reason: "سفر عائلي",
  //     status: "pending",
  //     submittedDate: "2024-01-13",
  //     documents: false,
  //   },
  // ];

  //! ORIGINAL FAKE DATA
  // const filteredRequests = absenceRequests.filter((request) => {
  //   if (filter === "all") return true;
  //   return request.status === filter;
  // });

  const absenceRequests = absence_reports_list;
  const filteredRequests = absence_reports_list.filter((request) => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "rejected":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return getTranslation('Accepted',language);
      case "rejected":
        return getTranslation('Rejected',language);
      default:
        return getTranslation('UnderReview',language);
    }
  };

  const handleAcceptance = async (report_id: string, accept: boolean) => {
    const latest_csrf = getCSRFToken()!;
    const patch_payload: PatchAbsenceReportPayload = {
      status: accept ? "accepted" : "rejected",
    };
    //! API CALL
    const patch_report_res = await school_dashboard_client.patch_absence_report(
      report_id,
      patch_payload,
      latest_csrf
    );
    if (patch_report_res.ok) {
      //! Update data
      console.log("patch reports successful");
      RefetchReports();
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
         {getTranslation('ReviewAbsenceRequests',language)}
        </h2>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getTranslation('Filtering',language)}:
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">{getTranslation('all',language)}</option>
            <option value="pending">{getTranslation('UnderReview',language)}</option>
            <option value="accepted">{getTranslation('Accepted',language)}</option>
            <option value="rejected">{getTranslation('Rejected',language)}</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: getTranslation('TotalRequests',language),
            value: absenceRequests.length,
            color: "bg-blue-500",
          },
          {
            label: getTranslation('UnderReview',language),
            value: absenceRequests.filter((r) => r.status === "pending").length,
            color: "bg-yellow-500",
          },
          {
            label: getTranslation('Accepted',language),
            value: absenceRequests.filter((r) => r.status === "accepted")
              .length,
            color: "bg-green-500",
          },
          {
            label:getTranslation('Rejected',language),
            value: absenceRequests.filter((r) => r.status === "rejected")
              .length,
            color: "bg-red-500",
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
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.absence_report_id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {request.student.full_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getTranslation('class',language)} {request?.student?.class_group?.name} - {getTranslation('parent',language)}: {" "}
                    {request.parent.full_name}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                  request.status
                )}`}
              >
                {getStatusText(request.status)}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {getTranslation('AbsenceDate',language)}:
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(request.submit_date).toDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {getTranslation('SubmissionDate',language)}:
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(request.submit_date).toDateString()}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {getTranslation('AbsenceReason',language)}:
              </p>
              <p className="text-gray-900 dark:text-white">
                {request.absence_reason}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                   {getTranslation('Documents',language)}:
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      request.proof_document
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    }`}
                  >
                    {request.proof_document ? getTranslation('Available',language):getTranslation('NotAvailable',language)}
                  </span>
                </div>

                {/* maybe for later implement a way to insert rejection reason  */}
                {/* {request.status === "rejected" && request.absence_reason && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    سبب الرفض: {request.}
                  </div>
                )} */}
              </div>

              {request.status === "pending" && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() =>
                      handleAcceptance(request.absence_report_id, true)
                    }
                    className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>{getTranslation('Accept',language)}</span>
                  </button>

                  <button
                    onClick={() =>
                      handleAcceptance(request.absence_report_id, false)
                    }
                    className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>{getTranslation('Reject',language)}</span>
                  </button>

                  {/* show the proof document if exist else error */}
                  {request.proof_document ? (
                    <a
                      href={SERVER_BASE_URL + request.proof_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{getTranslation('Details',language)}</span>
                    </a>
                  ) : (
                    <div className="  space-x-1 rtl:space-x-reverse px-3 py-2 text-red-600  rounded-lg hover:text-red-500 transition-colors">
                      {getTranslation('NoDetailsOrDocuments',language)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AbsenceReviews;
