import React, { useState } from "react";
import {
  FileText,
  Edit,
  Trash2,
  Plus,
  Search,
  BarChart2,
  Eye,
} from "lucide-react";
import { BehaviorReportsProps } from "../../types";
import { BehaviourReport } from "../../models/BehaviorReport";

// interface BehaviorReport {
//   id: string;
//   studentName: string;
//   date: string;
//   category: string;
//   description: string;
//   actionTaken: string;
// }

const BehaviorReports: React.FC<BehaviorReportsProps> = ({
  behaviour_reports_list,
  students_list,
}) => {
  /* 
 - mock data : 
 {
      id: "r1",
      studentName: "أحمد علي",
      date: "2025-06-14",
      category: "سلوك إيجابي",
      description: "مشاركة نشطة في الدرس",
      actionTaken: "شهادة تقدير",
    },
*/
  const [reports, setReports] = useState<BehaviourReport[]>(
    behaviour_reports_list
  );
  const [newReport, setNewReport] = useState({
    studentName: "",
    date: "",
    category: "",
    description: "",
    actionTaken: "",
  });
  const [editingReport, setEditingReport] = useState<BehaviourReport | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewSummary, setViewSummary] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // const handleAddReport = () => {
  //   if (
  //     newReport.studentName &&
  //     newReport.date &&
  //     newReport.category &&
  //     newReport.description &&
  //     newReport.actionTaken
  //   ) {
  //     setReports([...reports, { id: `r-${Date.now()}`, ...newReport }]);
  //     setNewReport({
  //       studentName: "",
  //       date: "",
  //       category: "",
  //       description: "",
  //       actionTaken: "",
  //     });
  //     setShowAddModal(false);
  //   }
  // };

  // const handleEditReport = (report: BehaviorReport) => {
  //   setEditingReport(report);
  //   setNewReport({
  //     studentName: report.studentName,
  //     date: report.date,
  //     category: report.category,
  //     description: report.description,
  //     actionTaken: report.actionTaken,
  //   });
  //   setShowAddModal(true);
  // };

  // const handleUpdateReport = () => {
  //   if (
  //     editingReport &&
  //     newReport.studentName &&
  //     newReport.date &&
  //     newReport.category &&
  //     newReport.description &&
  //     newReport.actionTaken
  //   ) {
  //     setReports(
  //       reports.map((rep) =>
  //         rep.id === editingReport.id ? { ...rep, ...newReport } : rep
  //       )
  //     );
  //     setEditingReport(null);
  //     setNewReport({
  //       studentName: "",
  //       date: "",
  //       category: "",
  //       description: "",
  //       actionTaken: "",
  //     });
  //     setShowAddModal(false);
  //   }
  // };

  // const handleDeleteReport = (id: string) => {
  //   setReports(reports.filter((rep) => rep.id !== id));
  // };

  const filteredReports = reports.filter(
    (rep) =>
      (rep.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.conclusion.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "all" || rep.type === selectedCategory)
  );

  const isNegative = (type: string) => {
    if (type === "سلوك سلبي" || type === "bad") {
      return true;
    }
    return false;
  };
  const isPositive = (type: string) => {
    if (
      type === "سلوك إيجابي" ||
      type === "excellent" ||
      type === "very good" ||
      type === "good"
    ) {
      return true;
    }
    return false;
  };
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          تقارير السلوك
        </h2>

        <div className="flex space-x-2 rtl:space-x-reverse">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">الكل</option>
            <option value="good">سلوك إيجابي</option>
            <option value="bad">سلوك سلبي</option>
          </select>
          <button
            onClick={() => setViewSummary(!viewSummary)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <BarChart2 className="h-5 w-5" />
            <span>{viewSummary ? "عرض قائمة" : "عرض ملخص"}</span>
          </button>

          {/* For now : adding is only possible by the teacher not school */}
          {/* <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="h-5 w-5" />
            <span>إضافة تقرير</span>
          </button> */}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن الطالب أو الوصف أو الإجراء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table or Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {viewSummary ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              ملخص تقارير السلوك
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  إجمالي التقارير: {reports.length}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  سلوك إيجابي:{" "}
                  {reports.filter((r) => isPositive(r.type)).length}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  سلوك سلبي: {reports.filter((r) => isNegative(r.type)).length}
                </p>
              </div>
              {filteredReports.map((report) => (
                <div
                  key={report.behaviour_report_id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow flex justify-between items-center"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.student.full_name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(report.date).toDateString()}
                    </p>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {isNegative(report.type) ? "سلوك سلبي" : " سلوك إيجابي"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    اسم الطالب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الوصف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراء
                  </th>
                  {/* For now : actions disallowed for from school for now */}
                  {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراءات
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReports.map((report) => (
                  <tr
                    key={report.behaviour_report_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.student.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(report.date).toDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {isNegative(report.type) ? "سلوك سلبي" : " سلوك إيجابي"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {report.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {report.conclusion}
                      </div>
                    </td>

                    {/* For now : actions are disallowed from school */}
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleEditReport(report)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteReport(report.behaviour_report_id)
                          }
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingReport ? "تعديل التقرير" : "إضافة تقرير جديد"}
            </h3>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اختر الطالب
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  name=""
                  id=""
                >
                  {students_list.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={newReport.date}
                  onChange={(e) =>
                    setNewReport({ ...newReport, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الفئة
                </label>
                <select
                  value={newReport.category}
                  onChange={(e) =>
                    setNewReport({ ...newReport, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">اختر الفئة</option>
                  <option value="سلوك إيجابي">سلوك إيجابي</option>
                  <option value="سلوك سلبي">سلوك سلبي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوصف
                </label>
                <textarea
                  value={newReport.description}
                  onChange={(e) =>
                    setNewReport({ ...newReport, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="تفاصيل السلوك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الإجراء
                </label>
                <input
                  type="text"
                  value={newReport.actionTaken}
                  onChange={(e) =>
                    setNewReport({ ...newReport, actionTaken: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="الإجراء المتخذ"
                />
              </div>
            </form>

            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingReport(null);
                  setNewReport({
                    studentName: "",
                    date: "",
                    category: "",
                    description: "",
                    actionTaken: "",
                  });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                // onClick={editingReport ? handleUpdateReport : handleAddReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingReport ? "تحديث" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehaviorReports;
