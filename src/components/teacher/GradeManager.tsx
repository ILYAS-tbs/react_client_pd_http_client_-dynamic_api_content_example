import React, { useEffect, useState } from "react";
import { Plus, Edit, X, Filter, Download, LayoutGrid } from "lucide-react";
import { GradeManagerProps } from "../../types";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
// import { TeacherModuleClassGrp } from "../../models/TeacherModuleClassGrp";
import { StudentGrade } from "../../models/StudentGrade";

import {
  PatchStudentGradesPayload,
  PostStudentGradesPayload,
} from "../../services/http_api/payloads_types/teacher_client_payload_types";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

const GradeManager: React.FC<GradeManagerProps> = ({
  students,
  modules,
  modules_class_groups,
  students_grades,
  teacher_id,
  setStudentsGrades,
  RefetchGrades,
}) => {
  //! Translations :
  const {language}=useLanguage()

  const [selectedClass, setSelectedClass] = useState(
    modules_class_groups?.[0]?.class_group.class_group_id
  );
  // const [selectedSubject, setSelectedSubject] = useState("الرياضيات");
  const [selectedModule, setSelectedModule] = useState(
    modules?.[0]?.module.module_id ?? ""
  ); // Add module filter state
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
  const unique_modules = [...new Set(modules.map((m) => m.module.module_id))];

  // helper function
  function mapStudentGrade(grade: StudentGrade) {
    return {
      id: grade.student.student_id,
      studentName: grade.student.full_name,
      grades: {
        // -------- الفصل الأول --------
        "تقويم الفصل الأول": {
          score: grade.s1_evaluation,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "فرض الفصل الأول 1": {
          score: grade.s1_devoir_1,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "فرض الفصل الأول 2": {
          score: grade.s1_devoir_2, // typo fixed here (was s1_devoi2)
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "واجبات الفصل الأول": {
          score: grade.s1_homeworks,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "امتحان الفصل الأول": {
          score: grade.s1_exam,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "معدل الفصل الأول": {
          score: grade.s1_average,
          max: 20,
          date: "",
          note: "",
          module: "",
        },

        // -------- الفصل الثاني --------
        "تقويم الفصل الثاني": {
          score: grade.s2_evaluation,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "فرض الفصل الثاني 1": {
          score: grade.s2_devoir_1,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "فرض الفصل الثاني 2": {
          score: grade.s2_devoir_2, // typo fixed here (was s2_devoi2)
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "واجبات الفصل الثاني": {
          score: grade.s2_homeworks,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "امتحان الفصل الثاني": {
          score: grade.s2_exam,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "معدل الفصل الثاني": {
          score: grade.s2_average,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
      },
      average: Number(grade.s1_average) || 0,
    };
  }

  // usage
  const initial_students_grades = students_grades.map(mapStudentGrade);
  const [grades, setGrades] = useState(initial_students_grades);

  //? SYNC WITH THE SERVER
  useEffect(() => {
    const mappedGrades = students_grades.map(mapStudentGrade);
    setGrades(mappedGrades);
  }, [students_grades]);

  const gradeKeys = [
    "تقويم الفصل الأول",
    "فرض الفصل الأول 1",
    "فرض الفصل الأول 2",
    "واجبات الفصل الأول",
    "امتحان الفصل الأول",
    "معدل الفصل الأول",

    "تقويم الفصل الثاني",
    "فرض الفصل الثاني 1",
    "فرض الفصل الثاني 2",
    "واجبات الفصل الثاني",
    "امتحان الفصل الثاني",
    "معدل الفصل الثاني",
  ] as const;
  // apply the filter ; class and module
  // useEffect(() => {
  //   const updatedGrades = students_grades
  //     .filter((grade: StudentGrade) => grade.class_group.name === selectedClass) //
  //     .map((grade: StudentGrade) => {
  //       const home_work = grade.grades?.find(
  //         (mark) =>
  //           mark.mark_type === "home_work" &&
  //           mark.module.module_name === selectedSubject
  //       );

  //       const devoir_1 = grade.grades?.find(
  //         (mark) =>
  //           mark.mark_type === "devoir_1" &&
  //           mark.module.module_name === selectedSubject
  //       );

  //       const exam_1 = grade.grades?.find(
  //         (mark) =>
  //           mark.mark_type === "exam_1" &&
  //           mark.module.module_name === selectedSubject
  //       );

  //       return {
  //         id: grade.student_id,
  //         studentName: grade.student_name,
  //         grades: {
  //           "فرض الفصل الأول": {
  //             score: devoir_1?.mark_degree ?? 0,
  //             max: 20,
  //             date: devoir_1?.date ?? "",
  //             note: devoir_1?.remarks ?? "",
  //             module: devoir_1?.module?.module_name ?? "",
  //           },
  //           "واجب منزلي 1": {
  //             score: home_work?.mark_degree ?? 0,
  //             max: 20,
  //             date: home_work?.date ?? "",
  //             note: home_work?.remarks ?? "",
  //             module: home_work?.module?.module_name ?? "",
  //           },
  //           "امتحان الفصل الأول": {
  //             score: exam_1?.mark_degree ?? 0,
  //             max: 20,
  //             date: exam_1?.date ?? "",
  //             note: exam_1?.remarks ?? "",
  //             module: exam_1?.module?.module_name ?? "",
  //           },
  //         },
  //         average: Number(grade.average) || 0,
  //       };
  //     });

  //   setGrades(updatedGrades);
  // }, [students_grades, selectedClass, selectedSubject]);

  // Filter grades based on applied module filter
  // const filteredGrades = appliedModuleFilter
  //   ? grades
  //       .map((student) => {
  //         const filtered = Object.fromEntries(
  //           Object.entries(student.grades).filter(
  //             ([, grade]) => grade.module === appliedModuleFilter
  //           )
  //         );

  //         return {
  //           ...student,
  //           grades: filtered,
  //         };
  //       })
  //       .filter((student) => Object.keys(student.grades).length > 0)
  //   : grades;

  const classes = [
    ...new Set(
      modules_class_groups.map(
        (moduleAndClassGroup: TeacherModuleClassGroup) =>
          moduleAndClassGroup.class_group.class_group_id
      )
    ),
  ];
  const filteredGrades = students_grades
    .filter(
      (student_grade) =>
        student_grade.module === selectedModule &&
        student_grade.class_group.class_group_id === selectedClass
    )
    .map(mapStudentGrade);

  //? mock data : const subjects = ["الرياضيات", "العلوم", "اللغة العربية"];
  const subjects = [
    ...new Set(
      modules_class_groups.map(
        (moduleAndClassGrp) => moduleAndClassGrp.module.module_name
      )
    ),
  ];

  // Get unique modules from grades data
  // const availableModules = [
  //   ...new Set(
  //     grades.flatMap((student) =>
  //       Object.values(student.grades)
  //         .map((grade) => grade.module)
  //         .filter((module) => module && module.trim() !== "")
  //     )
  //   ),
  // ];

  // const gradeSystems = ["20", "15", "10"];
  // const assessmentTypes = ["exam_1", "home_work", "devoir_1", "test", "other"];

  const handleApplyFilter = () => {
    setAppliedModuleFilter(selectedModule);
  };

  const handleClearFilter = () => {
    setSelectedModule("");
    setAppliedModuleFilter("");
  };

  // const handleAddGrade = () => {
  //   if (
  //     !newGrade.studentId ||
  //     !newGrade.assessmentType ||
  //     !newGrade.score ||
  //     !newGrade.date
  //   ) {
  //     alert("يرجى ملء جميع الحقول المطلوبة");
  //     return;
  //   }

  //   const updatedGrades = grades.map((student) => {
  //     if (student.id.toString() === newGrade.studentId) {
  //       const newGrades = {
  //         ...student.grades,
  //         [newGrade.assessmentType]: {
  //           score: parseFloat(newGrade.score),
  //           max: parseInt(gradeSystem),
  //           date: newGrade.date,
  //           note: newGrade.note,
  //           module: newGrade.module,
  //         },
  //       };
  //       const scores = Object.values(newGrades)
  //         .map((g) => Number(g.score))
  //         .filter((s) => !isNaN(s));
  //       const average =
  //         scores.length > 0
  //           ? scores.reduce((a, b) => a + b, 0) / scores.length
  //           : student.average;

  //       return { ...student, grades: newGrades, average };
  //     }
  //     return student;
  //   });

  //   setGrades(updatedGrades);
  //   setShowAddModal(false);
  //   setNewGrade({
  //     studentId: "",
  //     assessmentType: "",
  //     score: "",
  //     date: "",
  //     note: "",
  //     module: "",
  //   });
  // };

  //! Post Mark

  const [gradeSemester, setGradeSemester] = useState("s1");
  const [postStudentGradeForm, setPostStudentGradeForm] =
    useState<PostStudentGradesPayload>({
      student_id: "",
      teacher_id: teacher_id,
      module_id: "",
      class_group_id: "",

      s1_devoir_1: 0,
      s1_devoir_2: 0,
      s1_tests: 0,
      s1_homeworks: 0,
      s1_evaluation: 0,

      s1_exam: 0,
      s1_average: 0,

      s2_devoir_1: 0,
      s2_devoir_2: 0,
      s2_tests: 0,
      s2_homeworks: 0,
      s2_evaluation: 0,
      s2_exam: 0,
      s2_average: 0,
    });

  const handleStudentGradeFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setPostStudentGradeForm({
      ...postStudentGradeForm,
      [e.target.name]: e.target.value,
    });
  };

  //! POST STUDENT  GRADE
  const handlePostStudentGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handlePostStudentGrade payload :");
    console.log(postStudentGradeForm);

    //! API CALL
    const latest_csrf = getCSRFToken()!;
    const post_studentGrade_payload: PostStudentGradesPayload = {
      student_id: postStudentGradeForm.student_id,
      module_id: postStudentGradeForm.module_id ?? "",
      teacher_id: postStudentGradeForm.teacher_id ?? 0,
      class_group_id: selectedClass ?? "",

      // Semester 1
      s1_devoir_1: postStudentGradeForm.s1_devoir_1 ?? null,
      s1_devoir_2: postStudentGradeForm.s1_devoir_2 ?? null,
      s1_tests: postStudentGradeForm.s1_tests ?? null,
      s1_homeworks: postStudentGradeForm.s1_homeworks ?? null,
      s1_evaluation:postStudentGradeForm.s1_evaluation ?? null,
      s1_exam: postStudentGradeForm.s1_exam ?? null,
      s1_average: postStudentGradeForm.s1_average ?? null,

      // Semester 2
      s2_devoir_1: postStudentGradeForm.s2_devoir_1 ?? null,
      s2_devoir_2: postStudentGradeForm.s2_devoir_2 ?? null,
      s2_tests: postStudentGradeForm.s2_tests ?? null,
      s2_homeworks: postStudentGradeForm.s2_homeworks ?? null,
      s2_evaluation:postStudentGradeForm.s2_evaluation ?? null,

      s2_exam: postStudentGradeForm.s2_exam ?? null,
      s2_average: postStudentGradeForm.s2_average ?? null,
    };

    const post_studentGrade_res = await teacher_dashboard_client.post_grades(
      post_studentGrade_payload,
      latest_csrf
    );
    if (post_studentGrade_res.ok) {
      console.log("post_studentGrade_res OK");
      //? Refetch Grades
      RefetchGrades();
    }
  };

  //! PATCH : Edit Marks & Student Average ::
  const [showEditMarksModal, setShowEditMarksModal] = useState(false);
  const [last_selected_student, setLastSelectedStudent] = useState("");
  const [patchStudentGradeForm, setPatchStudentGradeForm] =
    useState<PatchStudentGradesPayload>({
      s1_devoir_1: undefined,
      s1_devoir_2: undefined,
      s1_tests: undefined,
      s1_homeworks: undefined,
      s1_evaluation : undefined,
      s1_exam: undefined,
      s1_average: undefined,

      s2_devoir_1: undefined,
      s2_devoir_2: undefined,
      s2_tests: undefined,
      s2_homeworks: undefined,
      s2_evaluation : undefined,
      s2_exam: undefined,
      s2_average: undefined,
    });
  function resetPatchStudentGradeForm() {
    setPatchStudentGradeForm({
      s1_devoir_1: undefined,
      s1_devoir_2: undefined,
      s1_tests: undefined,
      s1_homeworks: undefined,
      s1_exam: undefined,
      s1_average: undefined,

      s2_devoir_1: undefined,
      s2_devoir_2: undefined,
      s2_tests: undefined,
      s2_homeworks: undefined,
      s2_exam: undefined,
      s2_average: undefined,
    });
  }
  const handleStudentGradePatchFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setPatchStudentGradeForm({
      ...patchStudentGradeForm,
      [e.target.name]: e.target.value,
    });
  };

  //! API CALL
  const handlePatchStudentGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handlePatchStudentGrade payload:");
    console.log(patchStudentGradeForm);

    const latest_csrf = getCSRFToken()!;
    const last_selected_student_grades_id =
      students_grades.find(
        (grade) =>
          grade.student.student_id === last_selected_student &&
          grade.module === selectedModule
      )?.id ?? -1;

    const patch_grade_payload: PatchStudentGradesPayload = {
      // Semester 1
      s1_devoir_1: patchStudentGradeForm.s1_devoir_1,
      s1_devoir_2: patchStudentGradeForm.s1_devoir_2,
      s1_tests: patchStudentGradeForm.s1_tests,
      s1_homeworks: patchStudentGradeForm.s1_homeworks,
      s1_evaluation:patchStudentGradeForm.s1_evaluation,
      s1_exam: patchStudentGradeForm.s1_exam,
      s1_average: patchStudentGradeForm.s1_average,

      // Semester 2
      s2_devoir_1: patchStudentGradeForm.s2_devoir_1,
      s2_devoir_2: patchStudentGradeForm.s2_devoir_2,
      s2_tests: patchStudentGradeForm.s2_tests,
      s2_homeworks: patchStudentGradeForm.s2_homeworks,
      s2_evaluation:patchStudentGradeForm.s2_evaluation,

      s2_exam: patchStudentGradeForm.s2_exam,
      s2_average: patchStudentGradeForm.s2_average,
    };

    const patch_grades_res = await teacher_dashboard_client.patch_grades(
      last_selected_student_grades_id,
      patch_grade_payload,
      latest_csrf
    );
    if (patch_grades_res.ok) {
      console.log("patch_grades_res OK");
      //? Refetch grades
      RefetchGrades();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation('gradesManagement',language)}
        </h2>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>{getTranslation('export',language)}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{getTranslation('addGrade',language)}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {getTranslation('class',language)}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {classes.map((cls) => {
                return (
                  <option key={cls} value={cls}>
                    {modules_class_groups.find(
                      (modules_class_groups) =>
                        modules_class_groups.class_group.class_group_id === cls
                    )?.class_group.name ?? ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {getTranslation('Subject',language)}
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {unique_modules.map((module) => (
                <option key={module} value={module}>
                  {modules.find((m) => m.module.module_id === module)?.module
                    .module_name ?? ""}
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

          {/* <div className="flex items-end space-x-2 rtl:space-x-reverse">
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
          </div> */}
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getTranslation('marks',language)}{" "}
            {modules_class_groups.find(
              (module_class_group) =>
                module_class_group.class_group.class_group_id == selectedClass
            )?.class_group.name ?? ""}{" "}
            -{" "}
            {modules.find((m) => m.module.module_id === selectedModule)?.module
              .module_name ?? " "}
            {appliedModuleFilter && ` - ${appliedModuleFilter}`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('student',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('firstSemesterAssessment',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('firstSemesterExam1',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('firstSemesterExam2',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('firstSemesterHomework',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('firstSemesterTest',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('firstSemesterAverage',language)}
                </th>
                {/* Second semester  */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                 {getTranslation('secondSemesterAssessment',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('secondSemesterExam1',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('secondSemesterExam2',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('secondSemesterHomework',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('secondSemesterTest',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('secondSemesterAverage',language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('actions',language)}
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
                  {/* Loop through fixed order of grade keys */}
                  {gradeKeys.map((key) =>
                    key === "معدل الفصل الأول" ||
                    key === "معدل الفصل الثاني" ? (
                      <td
                        key={key}
                        className="px-6 py-4 whitespace-nowrap text-center"
                      >
                        <span
                          className={`text-sm font-bold ${
                            (student.grades[key]!.score ?? 0) >= 16
                              ? "text-green-600"
                              : (student.grades[key]!.score ?? 0) >= 12
                              ? "text-blue-600"
                              : (student.grades[key]!.score ?? 0) >= 10
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {student.grades[key]!.score ?? "-"}/{gradeSystem}
                        </span>
                      </td>
                    ) : (
                      <td
                        key={key}
                        className="px-6 py-4 whitespace-nowrap text-center"
                      >
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {student.grades[key]?.score ?? "-"} / {gradeSystem}
                        </div>

                        {/* Remark/note for later */}
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {student.grades[key]?.note
                            ? `${student.grades[key]!.note.substring(0, 20)}${
                                student.grades[key]!.note.length > 20
                                  ? "..."
                                  : ""
                              }`
                            : "-"}
                          {student.grades[key]?.module
                            ? ` (${student.grades[key]!.module})`
                            : ""}
                        </div>
                      </td>
                    )
                  )}

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
                      <Edit
                        onClick={() => {
                          setLastSelectedStudent(student.id);
                          setShowEditMarksModal(true);
                        }}
                        className="h-4 w-4"
                      />
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
        <div className=" !mt-0 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="h-5/6 overflow-y-auto  bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <form onSubmit={handlePostStudentGrade}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation('addNewGrade',language)}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation('student',language)}
                  </label>
                  <select
                    name="student_id"
                    value={postStudentGradeForm.student_id}
                    onChange={(e) => {
                      setNewGrade({ ...newGrade, studentId: e.target.value });
                      handleStudentGradeFormChange(e);
                    }}
                    className=" w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">{getTranslation('selectStudent',language)}</option>
                    {students.map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation('Subject',language)}
                  </label>
                  <select
                    name="module_id"
                    value={postStudentGradeForm.module_id}
                    onChange={(e) => {
                      setNewGrade({ ...newGrade, studentId: e.target.value });
                      handleStudentGradeFormChange(e);
                    }}
                    className=" w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">{getTranslation('selectSubject',language)}</option>
                    {unique_modules.map((module_id) => (
                      <option key={module_id} value={module_id}>
                        {modules.find((m) => m.module.module_id == module_id)
                          ?.module.module_name ?? ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation('class',language)}
                </label>
                <select
                  name="semester"
                  value={gradeSemester}
                  onChange={(e) => {
                    setGradeSemester(e.target.value);
                    handleStudentGradeFormChange(e);
                  }}
                  className=" w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option key={"s1"} value={"s1"}>
                    {getTranslation('firstSemester',language)}
                  </option>
                  <option key={"s2"} value={"s2"}>
                    {getTranslation('secondSemester',language)}
                  </option>
                </select>
              </div>

              {gradeSemester === "s1" ? (
                <div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('firstSemesterAssessment',language)}
                    </label>
                    <input
                      name="s1_evaluation"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s1_evaluation ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {getTranslation('firstSemesterExam1',language)}
                    </label>
                    <input
                      name="s1_devoir_1"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s1_devoir_1 ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('firstSemesterExam2',language)}
                    </label>
                    <input
                      name="s1_devoir_2"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s1_devoir_2 ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('firstSemesterHomework',language)}
                    </label>
                    <input
                      name="s1_homeworks"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s1_homeworks ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {getTranslation('firstSemesterTest',language)}
                    </label>
                    <input
                      name="s1_exam"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s1_exam ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('firstSemesterAverage',language)}
                    </label>
                    <input
                      name="s1_average"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s1_average ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('secondSemesterAssessment',language)}
                    </label>
                    <input
                      name="s2_evaluation"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s2_evaluation ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation('secondSemesterExam1',language)}
                    </label>
                    <input
                      name="s2_devoir_1"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s2_devoir_1 ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('secondSemesterExam2',language)}
                    </label>
                    <input
                      name="s1_devoir_2"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s1_devoir_2 ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('secondSemesterHomework',language)}
                    </label>
                    <input
                      name="s2_homeworks"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s2_homeworks ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('secondSemesterTest',language)}
                    </label>
                    <input
                      name="s2_exam"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s2_exam ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('secondSemesterAverage',language)}
                    </label>
                    <input
                      name="s2_average"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={postStudentGradeForm.s2_average ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

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
                  {getTranslation('cancel',language)}
                </button>
                <button
                  type="submit"
                  // onClick={handleAddGrade} // formNotConnectedError
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {getTranslation('save',language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit marks & average modal */}
      {showEditMarksModal && (
        <div className=" !mt-0 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="h-5/6 overflow-y-auto  bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <form onSubmit={handlePatchStudentGrade}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation('addNewGrade',language)}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation('student',language)}
                  </label>
                  <select
                    name="student_id"
                    value={last_selected_student}
                    onChange={() => {}}
                    className=" w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option
                      key={last_selected_student}
                      value={last_selected_student}
                    >
                      {students.find(
                        (s) => s.student_id == last_selected_student
                      )?.full_name ?? ""}
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation('subject',language)}
                  </label>
                  <select
                    name="module_id"
                    value={patchStudentGradeForm.module_id}
                    onChange={() => {}}
                    className=" w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option
                      key={patchStudentGradeForm.module_id}
                      value={patchStudentGradeForm.module_id}
                    >
                      {modules_class_groups.find(
                        (modules_class_groups) =>
                          modules_class_groups.module.module_id ===
                          selectedModule
                      )?.module.module_name ?? ""}
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation('semester',language)}
                </label>
                <select
                  name="semester"
                  value={gradeSemester}
                  onChange={(e) => {
                    setGradeSemester(e.target.value);
                    handleStudentGradePatchFormChange(e);
                  }}
                  className=" w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option key={"s1"} value={"s1"}>
                   {getTranslation('firstSemester',language)}
                  </option>
                  <option key={"s2"} value={"s2"}>
                    {getTranslation('secondSemester',language)}
                  </option>
                </select>
              </div>

              {gradeSemester === "s1" ? (
                <div>
                  <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       {getTranslation('firstSemesterAssessment',language)}
                      </label>
                      <input
                        name="s1_evaluation"
                        type="number"
                        min="0"
                        max={gradeSystem}
                        step="0.01" 
                        value={patchStudentGradeForm.s1_evaluation ?? 0}
                        onChange={handleStudentGradePatchFormChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                      />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('firstSemesterExam1',language)}
                    </label>
                    <input
                      name="s1_devoir_1"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s1_devoir_1 ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('firstSemesterExam2',language)}
                    </label>
                    <input
                      name="s1_devoir_2"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s1_devoir_2 ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation('firstSemesterHomework',language)}
                    </label>
                    <input
                      name="s1_homeworks"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s1_homeworks ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('firstSemesterTest',language)}
                    </label>
                    <input
                      name="s1_exam"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s1_exam ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('firstSemesterAverage',language)}
                    </label>
                    <input
                      name="s1_average"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s1_average ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              ) : (
                <div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {getTranslation('secondSemesterAssessment',language)}
                      </label>
                      <input
                        name="s2_evaluation"
                        type="number"
                        min="0"
                        max={gradeSystem}
                        step="0.01" 
                        value={patchStudentGradeForm.s2_evaluation ?? 0}
                        onChange={handleStudentGradePatchFormChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                      />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('secondSemesterExam1',language)}
                    </label>
                    <input
                      name="s2_devoir_1"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s2_devoir_1 ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {getTranslation('secondSemesterExam2',language)}
                    </label>
                    <input
                      name="s2_devoir_2"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s2_devoir_2 ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation('secondSemesterHomework',language)}
                    </label>
                    <input
                      name="s2_homeworks"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s2_homeworks ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {getTranslation('secondSemesterTest',language)}
                    </label>
                    <input
                      name="s2_exam"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s2_exam ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {getTranslation('secondSemesterAverage',language)}
                    </label>
                    <input
                      name="s2_average"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01" 
                      value={patchStudentGradeForm.s2_average ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowEditMarksModal(false);
                    resetPatchStudentGradeForm();
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
                  {getTranslation('cancel',language)}
                </button>
                <button
                  type="submit"
                  // onClick={handleAddGrade} // formNotConnectedError
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {getTranslation('save',language)}
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
