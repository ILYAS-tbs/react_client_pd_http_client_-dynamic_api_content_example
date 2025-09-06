import React, { useEffect, useState } from "react";
import { Plus, Edit, X, Filter, Download } from "lucide-react";
import { GradeManagerProps } from "../../types";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import { Module } from "../../models/Module";
import { StudentGrade } from "../../models/StudentGrade";

import { PostMarkPayload } from "../../services/http_api/payloads_types/teacher_client_payload_types";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";

const GradeManager: React.FC<GradeManagerProps> = ({
  modules,
  modules_class_groups,
  students_grades,
  teacher_id,
  setStudentsGrades,
}) => {
  const [selectedClass, setSelectedClass] = useState(
    modules_class_groups?.[0].class_group.name
  );
  const [selectedSubject, setSelectedSubject] = useState("الرياضيات");
  const [selectedModule, setSelectedModule] = useState(""); // Add module filter state
  const [appliedModuleFilter, setAppliedModuleFilter] = useState(""); // Applied filter state
  const [gradeSystem, setGradeSystem] = useState("20");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGrade, setNewGrade] = useState({
    studentId: "",
    assessmentType: "",
    score: "",
    date: "",
    note: "",
    module: "",
  });
  //* new ...Set to make values unique and not repeating

  //? mock data : const classes = ["5أ", "4أ", "6أ"];

  // i may make this from the backend
  // const [grades, setGrades] = useState([
  //   {
  //     id: 2,
  //     studentName: "فاطمة حسن",
  //     grades: {
  //       "امتحان الفصل الأول": {
  //         score: 16,
  //         max: 20,
  //         date: "2024-01-15",
  //         note: "جهد جيد، لكنها تحتاج إلى تحسين سرعتها في الحل.",
  //         module: "الكسور",
  //       },
  //       "واجب منزلي 1": {
  //         score: 18,
  //         max: 20,
  //         date: "2024-01-10",
  //         note: "واجب مكتمل بشكل ممتاز مع تنظيم رائع.",
  //         module: "المعادلات",
  //       },
  //       "اختبار قصير": {
  //         score: 17,
  //         max: 20,
  //         date: "2024-01-08",
  //         note: "إجابات صحيحة، لكن بعض النقاط كانت غير مكتملة.",
  //         module: "الأعداد",
  //       },
  //     },
  //     average: 17.0,
  //   },
  //   {
  //     id: 3,
  //     studentName: "عمر السعيد",
  //     grades: {
  //       "امتحان الفصل الأول": {
  //         score: 15,
  //         max: 20,
  //         date: "2024-01-15",
  //         note: "يحتاج إلى مراجعة المفاهيم الأساسية قبل الامتحانات.",
  //         module: "الكسور",
  //       },
  //       "واجب منزلي 1": {
  //         score: 14,
  //         max: 20,
  //         date: "2024-01-10",
  //         note: "الواجب غير مكتمل، يحتاج إلى بذل مجهود أكبر.",
  //         module: "المعادلات",
  //       },
  //       "اختبار قصير": {
  //         score: 16,
  //         max: 20,
  //         date: "2024-01-08",
  //         note: "تحسن ملحوظ مقارنة بالواجبات السابقة.",
  //         module: "الأعداد",
  //       },
  //     },
  //     average: 15.0,
  //   },
  // ]);

  /*todo 
  
  (EXAM1 = "exam_1"), "Exam 1";
  (EXAM2 = "exam_2"), "Exam 2";
  (HOMEWORK = "home_work"), "Homework";
  (DEVOIR1 = "devoir_1"), "Devoir 1";
  (DEVOIR2 = "devoir_2"), "Devoir 2";
  (TEST = "test"), "Test";
  (OTHER = "other"), "Other";

  */
  //! Filtering Grades For each module
  const module_names = modules.map((m: Module) => m.module.module_name);

  const initial_studetents_grades = students_grades.map(
    (grade: StudentGrade) => {
      //* filtering by subject
      //* filtering the marks types :
      const home_work = grade.grades?.filter(
        (mark) =>
          mark.mark_type == "home_work" &&
          mark.module.module_name == selectedSubject
      )?.[0];

      const devoir_1 = grade.grades?.filter(
        (mark) =>
          mark.mark_type == "devoir_1" &&
          mark.module.module_name == selectedSubject
      )?.[0];

      const exam_1 = grade.grades?.filter(
        (mark) =>
          mark.mark_type == "exam_1" &&
          mark.module.module_name == selectedSubject
      )?.[0];

      //* finale result
      const student_grade = {
        id: grade.student_id,
        studentName: grade.student_name,
        grades: {
          "فرض الفصل الأول": {
            score: devoir_1?.mark_degree,
            max: 20,
            date: devoir_1?.date,
            note: devoir_1?.remarks,
            module: devoir_1?.module.module_name,
          },
          "واجب منزلي 1": {
            score: home_work?.mark_degree,
            max: 20,
            date: home_work?.date,
            note: home_work?.remarks,
            module: home_work?.module.module_name,
          },
          "امتحان الفصل الأول": {
            score: exam_1?.mark_degree ?? "0",
            max: 20,
            date: exam_1?.date,
            note: exam_1?.remarks,
            module: exam_1?.module.module_name,
          },
        },
        average: Number(grade.average) || 0,
      };
      return student_grade;
    }
  );
  const [grades, setGrades] = useState(initial_studetents_grades);
  // apply the filter ; class and module
  useEffect(() => {
    const updatedGrades = students_grades
      .filter((grade: StudentGrade) => grade.class_group.name === selectedClass) //
      .map((grade: StudentGrade) => {
        const home_work = grade.grades?.find(
          (mark) =>
            mark.mark_type === "home_work" &&
            mark.module.module_name === selectedSubject
        );

        const devoir_1 = grade.grades?.find(
          (mark) =>
            mark.mark_type === "devoir_1" &&
            mark.module.module_name === selectedSubject
        );

        const exam_1 = grade.grades?.find(
          (mark) =>
            mark.mark_type === "exam_1" &&
            mark.module.module_name === selectedSubject
        );

        return {
          id: grade.student_id,
          studentName: grade.student_name,
          grades: {
            "فرض الفصل الأول": {
              score: devoir_1?.mark_degree ?? 0,
              max: 20,
              date: devoir_1?.date ?? "",
              note: devoir_1?.remarks ?? "",
              module: devoir_1?.module?.module_name ?? "",
            },
            "واجب منزلي 1": {
              score: home_work?.mark_degree ?? 0,
              max: 20,
              date: home_work?.date ?? "",
              note: home_work?.remarks ?? "",
              module: home_work?.module?.module_name ?? "",
            },
            "امتحان الفصل الأول": {
              score: exam_1?.mark_degree ?? 0,
              max: 20,
              date: exam_1?.date ?? "",
              note: exam_1?.remarks ?? "",
              module: exam_1?.module?.module_name ?? "",
            },
          },
          average: Number(grade.average) || 0,
        };
      });

    setGrades(updatedGrades);
  }, [students_grades, selectedClass, selectedSubject]);

  // Filter grades based on applied module filter
  const filteredGrades = appliedModuleFilter
    ? grades
        .map((student) => ({
          ...student,
          grades: Object.fromEntries(
            Object.entries(student.grades).filter(
              ([_, grade]) => grade.module === appliedModuleFilter
            )
          ),
        }))
        .filter((student) => Object.keys(student.grades).length > 0)
    : grades;

  const classes = [
    ...new Set(
      modules_class_groups.map(
        (moduleAndClassGroup: TeacherModuleClassGroup) =>
          moduleAndClassGroup.class_group.name
      )
    ),
  ];

  //? mock data : const subjects = ["الرياضيات", "العلوم", "اللغة العربية"];
  const subjects = [
    ...new Set(modules.map((module: Module) => module.module.module_name)),
  ];

  // Get unique modules from grades data
  const availableModules = [
    ...new Set(
      grades.flatMap((student) =>
        Object.values(student.grades)
          .map((grade) => grade.module)
          .filter((module) => module && module.trim() !== "")
      )
    ),
  ];

  // const gradeSystems = ["20", "15", "10"];
  const assessmentTypes = ["exam_1", "home_work", "devoir_1", "test", "other"];

  const handleApplyFilter = () => {
    setAppliedModuleFilter(selectedModule);
  };

  const handleClearFilter = () => {
    setSelectedModule("");
    setAppliedModuleFilter("");
  };

  const handleAddGrade = () => {
    if (
      !newGrade.studentId ||
      !newGrade.assessmentType ||
      !newGrade.score ||
      !newGrade.date
    ) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const updatedGrades = grades.map((student) => {
      if (student.id.toString() === newGrade.studentId) {
        const newGrades = {
          ...student.grades,
          [newGrade.assessmentType]: {
            score: parseFloat(newGrade.score),
            max: parseInt(gradeSystem),
            date: newGrade.date,
            note: newGrade.note,
            module: newGrade.module,
          },
        };
        const scores = Object.values(newGrades)
          .map((g) => Number(g.score))
          .filter((s) => !isNaN(s));
        const average =
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : student.average;

        return { ...student, grades: newGrades, average };
      }
      return student;
    });

    setGrades(updatedGrades);
    setShowAddModal(false);
    setNewGrade({
      studentId: "",
      assessmentType: "",
      score: "",
      date: "",
      note: "",
      module: "",
    });
  };

  //! Post Mark
  const [markFormData, setMarkFormData] = useState<PostMarkPayload>({
    mark_type: "",
    mark_degree: 0,
    date: "",
    topic: "",
    remarks: "",
    student_id: "",
    teacher_id: teacher_id,
  });

  const handleMarkFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setMarkFormData({
      ...markFormData,
      [e.target.name]: e.target.value,
    });
  };

  async function handleMarkFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowAddModal(false);
    console.log("payload:");
    console.log(markFormData);

    //! API CALL :
    const post_mark_payload: PostMarkPayload = {
      mark_type: markFormData.mark_type,
      mark_degree: markFormData.mark_degree,
      date: markFormData.date,
      topic: markFormData.topic,
      remarks: markFormData.remarks,
      student_id: markFormData.student_id,
      teacher_id: teacher_id,
    };
    const latest_csrf = getCSRFToken()!;

    const post_form_res = await teacher_dashboard_client.post_mark(
      post_mark_payload,
      latest_csrf
    );
    // Refresh data
    if (!post_form_res.ok) {
      return;
    }

    const new_grades_res =
      await teacher_dashboard_client.current_teacher_students_grades();
    if (new_grades_res.ok) {
      const new_grades_list: StudentGrade[] = new_grades_res.data;
      setStudentsGrades(new_grades_list);
    }
  }
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة الدرجات
        </h2>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة درجة</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الفصل
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المادة
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Disabled for now : */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نظام التقييم
            </label>
            <select
              value={gradeSystem}
              onChange={(e) => setGradeSystem(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {gradeSystems.map((system) => (
                <option key={system} value={system}>
                  /{system}
                </option>
              ))}
            </select>
          </div> */}

          <div className="flex items-end space-x-2 rtl:space-x-reverse">
            <button
              onClick={handleApplyFilter}
              className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>تطبيق الفلتر</span>
            </button>
            {appliedModuleFilter && (
              <button
                onClick={handleClearFilter}
                className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>مسح</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            درجات {selectedClass} - {selectedSubject}
            {appliedModuleFilter && ` - ${appliedModuleFilter}`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الطالب
                </th>

                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  فرض الفصل الأول
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  واجب منزلي 1
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  امتحان الفصل الأول
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المعدل
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredGrades.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.studentName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {student.grades["فرض الفصل الأول"]?.score || "-"}/
                      {gradeSystem}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {student.grades["فرض الفصل الأول"]?.note
                        ? `${student.grades["فرض الفصل الأول"].note.substring(
                            0,
                            20
                          )}${
                            student.grades["فرض الفصل الأول"].note.length > 20
                              ? "..."
                              : ""
                          }`
                        : "-"}
                      {student.grades["فرض الفصل الأول"]?.module
                        ? ` (${student.grades["فرض الفصل الأول"].module})`
                        : ""}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {student.grades["واجب منزلي 1"]?.score || "-"}/
                      {gradeSystem}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {student.grades["واجب منزلي 1"]?.note
                        ? `${student.grades["واجب منزلي 1"].note.substring(
                            0,
                            20
                          )}${
                            student.grades["واجب منزلي 1"].note.length > 20
                              ? "..."
                              : ""
                          }`
                        : "-"}
                      {student.grades["واجب منزلي 1"]?.module
                        ? ` (${student.grades["واجب منزلي 1"].module})`
                        : ""}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {student.grades["امتحان الفصل الأول"]?.score || "-"}/
                      {gradeSystem}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {student.grades["امتحان الفصل الأول"]?.note
                        ? `${student.grades[
                            "امتحان الفصل الأول"
                          ].note.substring(0, 20)}${
                            student.grades["امتحان الفصل الأول"].note.length >
                            20
                              ? "..."
                              : ""
                          }`
                        : "-"}
                      {student.grades["امتحان الفصل الأول"]?.module
                        ? ` (${student.grades["امتحان الفصل الأول"].module})`
                        : ""}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`text-sm font-bold ${
                        student.average >= 16
                          ? "text-green-600"
                          : student.average >= 12
                          ? "text-blue-600"
                          : student.average >= 10
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {student.average}/{gradeSystem}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() =>
                        setNewGrade({
                          studentId: student.id.toString(),
                          assessmentType: "",
                          score: "",
                          date: "",
                          note: "",
                          module: "",
                        })
                      }
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mx-1"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Grade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <form onSubmit={handleMarkFormSubmit}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                إضافة درجة جديدة
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الطالب
                  </label>
                  <select
                    name="student_id"
                    value={markFormData.student_id}
                    onChange={(e) => {
                      setNewGrade({ ...newGrade, studentId: e.target.value });
                      handleMarkFormChange(e);
                    }}
                    className=" w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">اختر الطالب</option>
                    {students_grades.map((student_grade) => (
                      <option
                        key={student_grade.student_id}
                        value={student_grade.student_id}
                      >
                        {student_grade.student_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نوع التقييم
                  </label>
                  <select
                    name="mark_type"
                    value={markFormData.mark_type}
                    onChange={(e) => {
                      setNewGrade({
                        ...newGrade,
                        assessmentType: e.target.value,
                      });
                      handleMarkFormChange(e);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">اختر النوع</option>
                    {assessmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type == "exam_1"
                          ? "امتحان الفصل الاول"
                          : type == "home_work"
                          ? "واجب منزلي"
                          : type == "devoir_1"
                          ? "الفرض الاول"
                          : type == "test"
                          ? "استجواب"
                          : "اخر"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الدرجة
                    </label>
                    <input
                      name="mark_degree"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      value={markFormData.mark_degree}
                      onChange={(e) => {
                        setNewGrade({ ...newGrade, score: e.target.value });
                        handleMarkFormChange(e);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    من
                  </label>
                  <input
                    type="number"
                    value={gradeSystem}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                </div> */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    التاريخ
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={markFormData.date}
                    onChange={(e) => {
                      setNewGrade({ ...newGrade, date: e.target.value });
                      handleMarkFormChange(e);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الوحدة
                  </label>
                  <input
                    name="topic"
                    type="text"
                    value={markFormData.topic}
                    onChange={(e) => {
                      setNewGrade({ ...newGrade, module: e.target.value });
                      handleMarkFormChange(e);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="أدخل الوحدة (مثال: الكسور)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    name="remarks"
                    rows={4}
                    value={markFormData.remarks}
                    onChange={(e) => {
                      setNewGrade({ ...newGrade, note: e.target.value });
                      handleMarkFormChange(e);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="أدخل ملاحظات حول سلوك الطالب أو أدائه..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewGrade({
                      studentId: "",
                      assessmentType: "",
                      score: "",
                      date: "",
                      note: "",
                      module: "",
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  // onClick={handleAddGrade} // formNotConnectedError
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeManager;
