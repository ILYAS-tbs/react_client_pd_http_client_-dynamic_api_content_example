import React, { useEffect, useState } from "react";
import { Plus, Edit, X, Download } from "lucide-react";
import { GradeManagerProps } from "../../types";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import { StudentGrade } from "../../models/StudentGrade";
import {
  PatchStudentGradesPayload,
  PostStudentGradesPayload,
} from "../../services/http_api/payloads_types/teacher_client_payload_types";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import GradingFormulaBuilder, { 
  calculateAverageFromFormula, 
  fetchGradingFormula 
} from "./GradingFormulaBuilder";

const GradeManager: React.FC<GradeManagerProps> = ({
  students,
  modules,
  modules_class_groups,
  students_grades,
  teacher_id,
  RefetchGrades,
}) => {
  //! Translations :
  const { language } = useLanguage();
  const [selectedClass, setSelectedClass] = useState(
    modules_class_groups?.[0]?.class_group.class_group_id
  );
  const [selectedModule, setSelectedModule] = useState(
    modules?.[0]?.module.module_id ?? ""
  );
  // ✅ ADDED SEMESTER STATE
  const [selectedSemester, setSelectedSemester] = useState<"s1" | "s2" | "s3">("s1");
  
  // ✅ ADDED FORMULA STATE
  const [currentFormula, setCurrentFormula] = useState<Record<string, number> | null>(null);
  
  const [gradeSystem, _setGradeSystem] = useState("20");
  const [appliedModuleFilter, _setAppliedModuleFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGrade, setNewGrade] = useState({
    studentId: "",
    assessmentType: "",
    score: "",
    date: "",
    note: "",
    module: "",
  });

  //! Filtering Grades For each module
  const unique_modules = [...new Set(modules.map((m) => m.module.module_id))];

  // ✅ LOAD FORMULA WHEN MODULE/CLASS/SEMESTER CHANGES
  useEffect(() => {
    if (selectedModule && selectedClass && selectedSemester) {
      const loadFormula = async () => {
        const formula = await fetchGradingFormula(
          selectedModule,
          selectedClass,
          selectedSemester
        );
        setCurrentFormula(formula);
      };
      loadFormula();
    }
  }, [selectedModule, selectedClass, selectedSemester]);

  // helper function
  function mapStudentGrade(grade: StudentGrade) {
    return {
      id: grade.student.student_id,
      studentName: grade.student.full_name,
      grades: {
        // -------- Semester 1 --------
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
          score: grade.s1_devoir_2,
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
        "الاختبارات القصيرة - الفصل الأول": {
          score: grade.s1_tests,
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
        // -------- Semester 2 --------
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
          score: grade.s2_devoir_2,
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
        "الاختبارات القصيرة - الفصل الثاني": {
          score: grade.s2_tests,
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
        // -------- Semester 3 --------
        "تقويم الفصل الثالث": {
          score: grade.s3_evaluation,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "فرض الفصل الثالث 1": {
          score: grade.s3_devoir_1,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "فرض الفصل الثالث 2": {
          score: grade.s3_devoir_2,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "واجبات الفصل الثالث": {
          score: grade.s3_homeworks,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "الاختبارات القصيرة - الفصل الثالث": {
          score: grade.s3_tests,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "امتحان الفصل الثالث": {
          score: grade.s3_exam,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
        "معدل الفصل الثالث": {
          score: grade.s3_average,
          max: 20,
          date: "",
          note: "",
          module: "",
        },
      },
      average: Number(grade.s1_average) || 0,
    };
  }

  const [, setGrades] = useState(students_grades.map(mapStudentGrade));

  //? SYNC WITH THE SERVER
  useEffect(() => {
    const mappedGrades = students_grades.map(mapStudentGrade);
    setGrades(mappedGrades);
  }, [students_grades]);

  const gradeKeys = [
    // -------- Semester 1 --------
    "تقويم الفصل الأول",
    "فرض الفصل الأول 1",
    "فرض الفصل الأول 2",
    "واجبات الفصل الأول",
    "الاختبارات القصيرة - الفصل الأول",
    "امتحان الفصل الأول",
    "معدل الفصل الأول",
    // -------- Semester 2 --------
    "تقويم الفصل الثاني",
    "فرض الفصل الثاني 1",
    "فرض الفصل الثاني 2",
    "واجبات الفصل الثاني",
    "الاختبارات القصيرة - الفصل الثاني",
    "امتحان الفصل الثاني",
    "معدل الفصل الثاني",
    // -------- Semester 3 --------
    "تقويم الفصل الثالث",
    "فرض الفصل الثالث 1",
    "فرض الفصل الثالث 2",
    "واجبات الفصل الثالث",
    "الاختبارات القصيرة - الفصل الثالث",
    "امتحان الفصل الثالث",
    "معدل الفصل الثالث",
  ] as const;

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



  //! Post Mark
  const [gradeSemester, setGradeSemester] = useState("s1");
  const [postStudentGradeForm, setPostStudentGradeForm] =
    useState<PostStudentGradesPayload>({
      student_id: "",
      teacher_id: teacher_id,
      module_id: "",
      class_group_id: "",
      // -------- Semester 1 --------
      s1_devoir_1: 0,
      s1_devoir_2: 0,
      s1_tests: 0,
      s1_homeworks: 0,
      s1_evaluation: 0,
      s1_exam: 0,
      s1_average: 0,
      // -------- Semester 2 --------
      s2_devoir_1: 0,
      s2_devoir_2: 0,
      s2_tests: 0,
      s2_homeworks: 0,
      s2_evaluation: 0,
      s2_exam: 0,
      s2_average: 0,
      // -------- Semester 3 --------
      s3_devoir_1: 0,
      s3_devoir_2: 0,
      s3_tests: 0,
      s3_homeworks: 0,
      s3_evaluation: 0,
      s3_exam: 0,
      s3_average: 0,
    });

  // ✅ HELPER: Calculate and set average based on formula
  const calculateAndSetAverage = (formData: PostStudentGradesPayload, semester: string) => {
    if (!currentFormula) return formData;

    const semesterPrefix = semester as 's1' | 's2' | 's3';
    
    // Map form fields to formula keys
    const gradesMapToFormula: Record<string, number> = {
      evaluation: formData[`${semesterPrefix}_evaluation`] || 0,
      devoir_1: formData[`${semesterPrefix}_devoir_1`] || 0,
      devoir_2: formData[`${semesterPrefix}_devoir_2`] || 0,
      homeworks: formData[`${semesterPrefix}_homeworks`] || 0,
      tests: formData[`${semesterPrefix}_tests`] || 0,
      exam: formData[`${semesterPrefix}_exam`] || 0,
    };

    // Calculate the average using the formula
    const calculatedAverage = calculateAverageFromFormula(gradesMapToFormula, currentFormula);

    // Update the average field in the form
    return {
      ...formData,
      [`${semesterPrefix}_average`]: calculatedAverage,
    };
  };

  const handleStudentGradeFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const updatedForm = {
      ...postStudentGradeForm,
      [e.target.name]: e.target.value,
    };
    
    // ✅ AUTO-CALCULATE AVERAGE BASED ON CURRENT SEMESTER
    const formWithCalculatedAverage = calculateAndSetAverage(updatedForm, gradeSemester);
    setPostStudentGradeForm(formWithCalculatedAverage);
  };

  //! POST STUDENT  GRADE
  const handlePostStudentGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handlePostStudentGrade payload :");
    
    // ✅ RECALCULATE AVERAGE BEFORE SENDING
    const finalFormData = calculateAndSetAverage(postStudentGradeForm, gradeSemester);
    
    console.log(finalFormData);
    //! API CALL
    const latest_csrf = getCSRFToken()!;
    const post_studentGrade_payload: PostStudentGradesPayload = {
      student_id: finalFormData.student_id,
      module_id: finalFormData.module_id ?? "",
      teacher_id: finalFormData.teacher_id ?? 0,
      class_group_id: selectedClass ?? "",
      // -------- Semester 1 --------
      s1_devoir_1: finalFormData.s1_devoir_1 ?? null,
      s1_devoir_2: finalFormData.s1_devoir_2 ?? null,
      s1_tests: finalFormData.s1_tests ?? null,
      s1_homeworks: finalFormData.s1_homeworks ?? null,
      s1_evaluation: finalFormData.s1_evaluation ?? null,
      s1_exam: finalFormData.s1_exam ?? null,
      s1_average: finalFormData.s1_average ?? null,
      // -------- Semester 2 --------
      s2_devoir_1: finalFormData.s2_devoir_1 ?? null,
      s2_devoir_2: finalFormData.s2_devoir_2 ?? null,
      s2_tests: finalFormData.s2_tests ?? null,
      s2_homeworks: finalFormData.s2_homeworks ?? null,
      s2_evaluation: finalFormData.s2_evaluation ?? null,
      s2_exam: finalFormData.s2_exam ?? null,
      s2_average: finalFormData.s2_average ?? null,
      // -------- Semester 3 --------
      s3_devoir_1: finalFormData.s3_devoir_1 ?? null,
      s3_devoir_2: finalFormData.s3_devoir_2 ?? null,
      s3_tests: finalFormData.s3_tests ?? null,
      s3_homeworks: finalFormData.s3_homeworks ?? null,
      s3_evaluation: finalFormData.s3_evaluation ?? null,
      s3_exam: finalFormData.s3_exam ?? null,
      s3_average: finalFormData.s3_average ?? null,
    };
    const post_studentGrade_res = await teacher_dashboard_client.post_grades(
      post_studentGrade_payload,
      latest_csrf
    );
    if (post_studentGrade_res.ok) {
      console.log("post_studentGrade_res OK");
      RefetchGrades();
      setShowAddModal(false);
      // ✅ RESET FORM AFTER SUCCESS
      setPostStudentGradeForm({
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
        s3_devoir_1: 0,
        s3_devoir_2: 0,
        s3_tests: 0,
        s3_homeworks: 0,
        s3_evaluation: 0,
        s3_exam: 0,
        s3_average: 0,
      });
    }
  };

  //! PATCH : Edit Marks & Student Average ::
  const [showEditMarksModal, setShowEditMarksModal] = useState(false);
  const [last_selected_student, setLastSelectedStudent] = useState("");
  const [patchStudentGradeForm, setPatchStudentGradeForm] =
    useState<PatchStudentGradesPayload>({
      // -------- Semester 1 --------
      s1_devoir_1: undefined,
      s1_devoir_2: undefined,
      s1_tests: undefined,
      s1_homeworks: undefined,
      s1_evaluation: undefined,
      s1_exam: undefined,
      s1_average: undefined,
      // -------- Semester 2 --------
      s2_devoir_1: undefined,
      s2_devoir_2: undefined,
      s2_tests: undefined,
      s2_homeworks: undefined,
      s2_evaluation: undefined,
      s2_exam: undefined,
      s2_average: undefined,
      // -------- Semester 3 --------
      s3_devoir_1: undefined,
      s3_devoir_2: undefined,
      s3_tests: undefined,
      s3_homeworks: undefined,
      s3_evaluation: undefined,
      s3_exam: undefined,
      s3_average: undefined,
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
      s3_devoir_1: undefined,
      s3_devoir_2: undefined,
      s3_tests: undefined,
      s3_homeworks: undefined,
      s3_exam: undefined,
      s3_average: undefined,
      s3_evaluation: undefined,
      s1_evaluation: undefined,
    });
  }

  const handleStudentGradePatchFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const updatedForm = {
      ...patchStudentGradeForm,
      [e.target.name]: e.target.value,
    };
    
    // ✅ AUTO-CALCULATE AVERAGE BASED ON CURRENT SEMESTER FOR PATCH
    const semesterPrefix = gradeSemester as 's1' | 's2' | 's3';
    
    const gradesMapToFormula: Record<string, number> = {
      evaluation: updatedForm[`${semesterPrefix}_evaluation`] || 0,
      devoir_1: updatedForm[`${semesterPrefix}_devoir_1`] || 0,
      devoir_2: updatedForm[`${semesterPrefix}_devoir_2`] || 0,
      homeworks: updatedForm[`${semesterPrefix}_homeworks`] || 0,
      tests: updatedForm[`${semesterPrefix}_tests`] || 0,
      exam: updatedForm[`${semesterPrefix}_exam`] || 0,
    };
    
    if (currentFormula) {
      const calculatedAverage = calculateAverageFromFormula(gradesMapToFormula, currentFormula);
      updatedForm[`${semesterPrefix}_average`] = calculatedAverage;
    }
    
    setPatchStudentGradeForm(updatedForm);
  };

  //! API CALL
  const handlePatchStudentGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ RECALCULATE AVERAGE BEFORE SENDING (PATCH)
    let finalPatchForm = { ...patchStudentGradeForm };
    const semesterPrefix = gradeSemester as 's1' | 's2' | 's3';
    
    const gradesMapToFormula: Record<string, number> = {
      evaluation: finalPatchForm[`${semesterPrefix}_evaluation`] || 0,
      devoir_1: finalPatchForm[`${semesterPrefix}_devoir_1`] || 0,
      devoir_2: finalPatchForm[`${semesterPrefix}_devoir_2`] || 0,
      homeworks: finalPatchForm[`${semesterPrefix}_homeworks`] || 0,
      tests: finalPatchForm[`${semesterPrefix}_tests`] || 0,
      exam: finalPatchForm[`${semesterPrefix}_exam`] || 0,
    };
    
    if (currentFormula) {
      const calculatedAverage = calculateAverageFromFormula(gradesMapToFormula, currentFormula);
      finalPatchForm = {
        ...finalPatchForm,
        [`${semesterPrefix}_average`]: calculatedAverage,
      };
    }
    
    console.log("handlePatchStudentGrade payload:");
    console.log(finalPatchForm);
    const latest_csrf = getCSRFToken()!;
    const last_selected_student_grades_id =
      students_grades.find(
        (grade) =>
          grade.student.student_id === last_selected_student &&
          grade.module === selectedModule
      )?.id ?? -1;

    const patch_grade_payload: PatchStudentGradesPayload = {
      // -------- Semester 1 --------
      s1_devoir_1: finalPatchForm.s1_devoir_1,
      s1_devoir_2: finalPatchForm.s1_devoir_2,
      s1_tests: finalPatchForm.s1_tests,
      s1_homeworks: finalPatchForm.s1_homeworks,
      s1_evaluation: finalPatchForm.s1_evaluation,
      s1_exam: finalPatchForm.s1_exam,
      s1_average: finalPatchForm.s1_average,
      // -------- Semester 2 --------
      s2_devoir_1: finalPatchForm.s2_devoir_1,
      s2_devoir_2: finalPatchForm.s2_devoir_2,
      s2_tests: finalPatchForm.s2_tests,
      s2_homeworks: finalPatchForm.s2_homeworks,
      s2_evaluation: finalPatchForm.s2_evaluation,
      s2_exam: finalPatchForm.s2_exam,
      s2_average: finalPatchForm.s2_average,
      // -------- Semester 3 --------
      s3_devoir_1: finalPatchForm.s3_devoir_1,
      s3_devoir_2: finalPatchForm.s3_devoir_2,
      s3_tests: finalPatchForm.s3_tests,
      s3_homeworks: finalPatchForm.s3_homeworks,
      s3_evaluation: finalPatchForm.s3_evaluation,
      s3_exam: finalPatchForm.s3_exam,
      s3_average: finalPatchForm.s3_average,
    };
    const patch_grades_res = await teacher_dashboard_client.patch_grades(
      last_selected_student_grades_id,
      patch_grade_payload,
      latest_csrf
    );
    if (patch_grades_res.ok) {
      console.log("patch_grades_res OK");
      RefetchGrades();
      setShowEditMarksModal(false);
    }
  };

  //! RECALCULATE ALL AVERAGES
  const recalculateAllAverages = async () => {
    try {
      // ✅ UPDATED: Directly refresh grades after recalculation
      // The formula was already recalculated by the backend endpoint in GradingFormulaBuilder
      // Now we just need to fetch the updated data to show the new averages
      console.log("Refreshing student grades with updated averages...");
      RefetchGrades();
    } catch (error) {
      console.error("Error refreshing grades:", error);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation("gradesManagement", language)}
        </h2>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>{getTranslation("export", language)}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{getTranslation("addGrade", language)}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {getTranslation("class", language)}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {classes.map((cls) => {
                return (
                  <option key={cls} value={cls}>
                    {
                      modules_class_groups.find(
                        (modules_class_groups) =>
                          modules_class_groups.class_group.class_group_id ===
                          cls
                      )?.class_group.name ?? ""
                    }
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {getTranslation("Subject", language)}
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {unique_modules.map((module) => (
                <option key={module} value={module}>
                  {
                    modules.find((m) => m.module.module_id === module)?.module
                      .module_name ?? ""
                  }
                </option>
              ))}
            </select>
          </div>
          {/* ✅ SEMESTER SELECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {getTranslation("semester", language)}
            </label>
            <select
              value={selectedSemester}
              onChange={(e) =>
                setSelectedSemester(e.target.value as "s1" | "s2" | "s3")
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="s1">
                {getTranslation("firstSemester", language)}
              </option>
              <option value="s2">
                {getTranslation("secondSemester", language)}
              </option>
              <option value="s3">
                {getTranslation("thirdSemester", language)}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Formula Builder - Now with semester prop */}
      {selectedModule && selectedClass && (
        <div className="mt-6">
          <GradingFormulaBuilder
            moduleId={selectedModule}
            classGroupId={selectedClass}
            semester={selectedSemester}
            onSave={() => recalculateAllAverages()}
          />
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getTranslation("marks", language)}{" "}
            {
              modules_class_groups.find(
                (module_class_group) =>
                  module_class_group.class_group.class_group_id ==
                  selectedClass
              )?.class_group.name ?? ""
            }{" "}
            -{" "}
            {
              modules.find((m) => m.module.module_id === selectedModule)?.module
                .module_name ?? " "
            }
            {appliedModuleFilter && ` - ${appliedModuleFilter}`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("student", language)}
                </th>
                {/* First semester */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("firstSemesterAssessment", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("firstSemesterExam1", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("firstSemesterExam2", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("firstSemesterHomework", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'الاختبارات القصيرة' : 'Short Tests'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("firstSemesterAverage", language)}
                </th>
                {/* Second semester */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("secondSemesterAssessment", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("secondSemesterExam1", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("secondSemesterExam2", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("secondSemesterHomework", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'الاختبارات القصيرة' : 'Short Tests'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("secondSemesterAverage", language)}
                </th>
                {/* Third semester */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("thirdSemesterAssessment", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("thirdSemesterExam1", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("thirdSemesterExam2", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("thirdSemesterHomework", language)}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'الاختبارات القصيرة' : 'Short Tests'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("thirdSemesterAverage", language)}
                </th>
                {/* Actions */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation("actions", language)}
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
                  {gradeKeys.map((key) =>
                    key === "معدل الفصل الأول" ||
                    key === "معدل الفصل الثاني" ||
                    key === "معدل الفصل الثالث" ? (
                      <td
                        key={key}
                        className="px-6 py-4 whitespace-nowrap text-center"
                      >
                        <span
                          className={`text-sm font-bold ${(
                            student.grades[key]!.score ?? 0
                          ) >= 16
                            ? "text-green-600"
                            : (student.grades[key]!.score ?? 0) >= 12
                              ? "text-primary-600"
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
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {student.grades[key]?.note
                            ? `${
                                student.grades[key]!.note.substring(0, 20)
                              }${
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
        <div className="!mt-0 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="h-5/6 overflow-y-auto  bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <form onSubmit={handlePostStudentGrade}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation("addNewGrade", language)}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("student", language)}
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
                    <option value="">
                      {getTranslation("selectStudent", language)}
                    </option>
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
                    {getTranslation("Subject", language)}
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
                    <option value="">
                      {getTranslation("selectSubject", language)}
                    </option>
                    {unique_modules.map((module_id) => (
                      <option key={module_id} value={module_id}>
                        {
                          modules.find(
                            (m) => m.module.module_id == module_id
                          )?.module.module_name ?? ""
                        }
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("semester", language)}
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
                    {getTranslation("firstSemester", language)}
                  </option>
                  <option key={"s2"} value={"s2"}>
                    {getTranslation("secondSemester", language)}
                  </option>
                  <option key={"s3"} value={"s3"}>
                    {getTranslation("thirdSemester", language)}
                  </option>
                </select>
              </div>
              {gradeSemester === "s1" ? (
                <div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("firstSemesterAssessment", language)}
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
                      {getTranslation("firstSemesterExam1", language)}
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
                      {getTranslation("firstSemesterExam2", language)}
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
                      {getTranslation("firstSemesterHomework", language)}
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
                      {language === 'ar' ? 'الاختبارات القصيرة' : 'Quizzes & Unit Tests'}
                    </label>
                    <input
                      name="s1_tests"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={postStudentGradeForm.s1_tests ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}
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
                      {getTranslation("firstSemesterAverage", language)} ✨ {language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'}
                    </label>
                    <div className="w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white font-semibold flex items-center justify-center">
                      {(postStudentGradeForm.s1_average ?? 0).toFixed(2)} / {gradeSystem}
                    </div>
                  </div>
                </div>
              ) : gradeSemester === "s2" ? (
                <div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("secondSemesterAssessment", language)}
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
                      {getTranslation("secondSemesterExam1", language)}
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
                      {getTranslation("secondSemesterExam2", language)}
                    </label>
                    {/* ✅ FIXED: was s1_devoir_2 */}
                    <input
                      name="s2_devoir_2"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={postStudentGradeForm.s2_devoir_2 ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("secondSemesterHomework", language)}
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
                      {language === 'ar' ? 'الاختبارات القصيرة' : 'Quizzes & Unit Tests'}
                    </label>
                    <input
                      name="s2_tests"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={postStudentGradeForm.s2_tests ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}
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
                      {getTranslation("secondSemesterAverage", language)} ✨ {language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'}
                    </label>
                    <div className="w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white font-semibold flex items-center justify-center">
                      {(postStudentGradeForm.s2_average ?? 0).toFixed(2)} / {gradeSystem}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterAssessment", language)}
                    </label>
                    <input
                      name="s3_evaluation"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={postStudentGradeForm.s3_evaluation ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterExam1", language)}
                    </label>
                    <input
                      name="s3_devoir_1"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={postStudentGradeForm.s3_devoir_1 ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterExam2", language)}
                    </label>
                    <input
                      name="s3_devoir_2"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={postStudentGradeForm.s3_devoir_2 ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterHomework", language)}
                    </label>
                    <input
                      name="s3_homeworks"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={postStudentGradeForm.s3_homeworks ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الاختبارات القصيرة' : 'Quizzes & Unit Tests'}
                    </label>
                    <input
                      name="s3_tests"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={postStudentGradeForm.s3_tests ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}
                    </label>
                    <input
                      name="s3_exam"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={postStudentGradeForm.s3_exam ?? 0}
                      onChange={handleStudentGradeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterAverage", language)} ✨ {language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'}
                    </label>
                    <div className="w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white font-semibold flex items-center justify-center">
                      {(postStudentGradeForm.s3_average ?? 0).toFixed(2)} / {gradeSystem}
                    </div>
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
                  {getTranslation("cancel", language)}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {getTranslation("save", language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit marks & average modal */}
      {showEditMarksModal && (
        <div className="!mt-0 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="h-5/6 overflow-y-auto  bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <form onSubmit={handlePatchStudentGrade}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation("editGrade", language)}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("student", language)}
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
                    {getTranslation("subject", language)}
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
                      {
                        modules_class_groups.find(
                          (modules_class_groups) =>
                            modules_class_groups.module.module_id ===
                            selectedModule
                        )?.module.module_name ?? ""
                      }
                    </option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation("semester", language)}
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
                    {getTranslation("firstSemester", language)}
                  </option>
                  <option key={"s2"} value={"s2"}>
                    {getTranslation("secondSemester", language)}
                  </option>
                  <option key={"s3"} value={"s3"}>
                    {getTranslation("thirdSemester", language)}
                  </option>
                </select>
              </div>
              {gradeSemester === "s1" ? (
                <div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("firstSemesterAssessment", language)}
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
                      {getTranslation("firstSemesterExam1", language)}
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
                      {getTranslation("firstSemesterExam2", language)}
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
                      {getTranslation("firstSemesterHomework", language)}
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
                      {language === 'ar' ? 'الاختبارات القصيرة' : 'Quizzes & Unit Tests'}
                    </label>
                    <input
                      name="s1_tests"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={patchStudentGradeForm.s1_tests ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}
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
                      {getTranslation("firstSemesterAverage", language)} ✨ {language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'}
                    </label>
                    <div className="w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white font-semibold flex items-center justify-center">
                      {(patchStudentGradeForm.s1_average ?? 0).toFixed(2)} / {gradeSystem}
                    </div>
                  </div>
                </div>
              ) : gradeSemester === "s2" ? (
                <div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("secondSemesterAssessment", language)}
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
                      {getTranslation("secondSemesterExam1", language)}
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
                      {getTranslation("secondSemesterExam2", language)}
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
                      {getTranslation("secondSemesterHomework", language)}
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
                      {language === 'ar' ? 'الاختبارات القصيرة' : 'Quizzes & Unit Tests'}
                    </label>
                    <input
                      name="s2_tests"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={patchStudentGradeForm.s2_tests ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}
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
                      {getTranslation("secondSemesterAverage", language)} ✨ {language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'}
                    </label>
                    <div className="w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white font-semibold flex items-center justify-center">
                      {(patchStudentGradeForm.s2_average ?? 0).toFixed(2)} / {gradeSystem}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterAssessment", language)}
                    </label>
                    <input
                      name="s3_evaluation"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={patchStudentGradeForm.s3_evaluation ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterExam1", language)}
                    </label>
                    <input
                      name="s3_devoir_1"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={patchStudentGradeForm.s3_devoir_1 ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterExam2", language)}
                    </label>
                    <input
                      name="s3_devoir_2"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={patchStudentGradeForm.s3_devoir_2 ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterHomework", language)}
                    </label>
                    <input
                      name="s3_homeworks"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={patchStudentGradeForm.s3_homeworks ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الاختبارات القصيرة' : 'Quizzes & Unit Tests'}
                    </label>
                    <input
                      name="s3_tests"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={patchStudentGradeForm.s3_tests ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}
                    </label>
                    <input
                      name="s3_exam"
                      type="number"
                      min="0"
                      max={gradeSystem}
                      step="0.01"
                      value={patchStudentGradeForm.s3_exam ?? 0}
                      onChange={handleStudentGradePatchFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("thirdSemesterAverage", language)} ✨ {language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'}
                    </label>
                    <div className="w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white font-semibold flex items-center justify-center">
                      {(patchStudentGradeForm.s3_average ?? 0).toFixed(2)} / {gradeSystem}
                    </div>
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
                  {getTranslation("cancel", language)}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {getTranslation("save", language)}
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