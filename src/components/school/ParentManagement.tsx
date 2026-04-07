import React, { useCallback, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, X } from "lucide-react";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import {
  AddCurrectSchoolStudentsToParent,
  AddorRemoveParentToSchoolPayload,
  SearchParentResult,
} from "../../services/http_api/payloads_types/school_client_payload_types";
import { Parent, ParentJson } from "../../models/ParenAndStudent";
import { ParentManagementProps } from "../../types";
import { getTranslation } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { useModalFormReset } from "../../hooks/useModalFormReset";

const ParentManagement: React.FC<ParentManagementProps> = ({
  parentsList,
  setParentList,
  class_groups_list,
  studentsList,
  RefetchStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorAddParent, setErrorAddParent] = useState("");

  const {language}=useLanguage()

  // fake parent list :
  // const parents = [
  //   {
  //     id: 1,
  //     name: "محمد علي",
  //     phone: "0555123456",
  //     email: "mohammed.ali@example.com",
  //     students: ["أحمد محمد علي"],
  //     address: "شارع الملك، الرياض",
  //     classes: ["5أ"],
  //   },
  //   {
  //     id: 2,
  //     name: "حسن أحمد",
  //     phone: "0555234567",
  //     email: "hassan.ahmed@example.com",
  //     students: ["فاطمة حسن"],
  //     address: "حي النصر، جدة",
  //     classes: ["4ب"],
  //   },
  //   {
  //     id: 3,
  //     name: "السعيد محمد",
  //     phone: "0555345678",
  //     email: "said.mohammed@example.com",
  //     students: ["عمر السعيد"],
  //     address: "شارع السلام، مكة",
  //     classes: ["6أ"],
  //   },
  //   {
  //     id: 4,
  //     name: "علي حسن",
  //     phone: "0555456789",
  //     email: "ali.hassan@example.com",
  //     students: ["زينب العلي"],
  //     address: "حي الخالدية، الدمام",
  //     classes: ["5أ"],
  //   },
  //   {
  //     id: 5,
  //     name: "الأمين يوسف",
  //     phone: "0555567890",
  //     email: "amin.youssef@example.com",
  //     students: ["يوسف الأمين"],
  //     address: "شارع الرياض، المدينة",
  //     classes: ["3ب"],
  //   },
  // ];
  // real parent data
  const parents_real: Parent[] = parentsList;

  // const classes = ["الكل", "3أ", "3ب", "4أ", "4ب", "5أ", "5ب", "6أ", "6ب"];

  const filteredParents = parents_real.filter((parent) => {
    const matchesSearch =
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.students?.some((student) =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesClass =
      selectedClass === "all" ||
      selectedClass === "الكل" ||
      parent.students
        ?.map((s) => s.class_group?.class_group_id)
        .includes(selectedClass);
    return matchesSearch && matchesClass;
  });

  // Parent search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchParentResult[]>([]);
  const [selectedParentPk, setSelectedParentPk] = useState<number | null>(null);
  const [selectedParentName, setSelectedParentName] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Student selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const resetModalState = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedParentPk(null);
    setSelectedParentName("");
    setErrorAddParent("");
    setSelectedStudentIds([]);
    setStudentSearchQuery("");
  }, []);

  const { formKey: parentModalFormKey } = useModalFormReset({
    isOpen: showAddModal,
    mode: "add",
    resetForm: resetModalState,
  });

  // Filter students in modal by name or class
  const filteredModalStudents = useMemo(() => {
    const q = studentSearchQuery.toLowerCase().trim();
    if (!q) return studentsList;
    return studentsList.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        (s.class_group?.name ?? "").toLowerCase().includes(q)
    );
  }, [studentsList, studentSearchQuery]);

  // Group filtered students by class
  const groupedModalStudents = useMemo(() => {
    const groups: Record<string, typeof filteredModalStudents> = {};
    filteredModalStudents.forEach((s) => {
      const key = s.class_group?.name ?? "—";
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [filteredModalStudents]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSearchParents = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    setSelectedParentPk(null);
    setSelectedParentName("");
    setSelectedStudentIds([]);
    setErrorAddParent("");
    const res = await school_dashboard_client.search_parents(searchQuery);
    if (res.ok && res.data) {
      setSearchResults(res.data);
      if (res.data.length === 0) {
        setErrorAddParent("لم يتم العثور على نتائج مطابقة، حاول بكلمة أخرى");
      }
    } else {
      setErrorAddParent("حدث خطأ أثناء البحث، يرجى المحاولة لاحقًا");
    }
    setIsSearching(false);
  };

  const handleSelectParent = (pk: number, name: string) => {
    setSelectedParentPk(pk);
    setSelectedParentName(name);
    setErrorAddParent("");
    // Pre-fill students already assigned to this parent
    const parent = parentsList.find((p) => p.id === pk);
    if (parent?.students) {
      setSelectedStudentIds(parent.students.map((s) => s.student_id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  //! Parent Addition Logic: select parent from search -> add to school -> link students
  const handleAddParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedParentPk) {
      setErrorAddParent("الرجاء اختيار ولي أمر من نتائج البحث");
      return;
    }

    const latest_csrf = getCSRFToken()!;
    const add_payload: AddorRemoveParentToSchoolPayload = {
      parent_pk: selectedParentPk,
    };
    const add_parent_res = await school_dashboard_client.add_parent_to_school(
      add_payload,
      latest_csrf
    );

    if (add_parent_res.ok) {
      const latest_csrf2 = getCSRFToken()!;
      const students_payload: AddCurrectSchoolStudentsToParent = {
        parent_pk: String(selectedParentPk),
        students: selectedStudentIds,
      };
      const add_students_res =
        await school_dashboard_client.add_current_school_students_to_parent(
          students_payload,
          latest_csrf2
        );

      if (add_students_res.ok) {
        const new_res =
          await school_dashboard_client.get_current_school_parents();
        if (new_res.ok) {
          const new_parents_list: Parent[] = new_res.data.map(
            (p: ParentJson) => Parent.fromJson(p)
          );
          setParentList(new_parents_list);
          setShowAddModal(false);
          resetModalState();
        }
        RefetchStudents();
      } else {
        setErrorAddParent(
          "حدث خطأ غير متوقع أثناء معالجة طلبك، يرجى المحاولة لاحقًا. إذا استمر هذا الأمر، يرجى التواصل معنا."
        );
      }
    } else {
      setErrorAddParent(
        "حدث خطأ غير متوقع أثناء معالجة طلبك، يرجى المحاولة لاحقًا. إذا استمر هذا الأمر، يرجى التواصل معنا."
      );
      setTimeout(() => {
        setErrorAddParent("");
      }, 7000);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    const latest_csrf = getCSRFToken()!;
    const delete_payload: AddorRemoveParentToSchoolPayload = {
      parent_pk: id,
    };

    const delete_res = await school_dashboard_client.remove_parent_from_school(
      delete_payload,
      latest_csrf
    );

    if (!delete_res.ok) {
      return;
    }

    //* Fetch New Parents List
    const parents_res =
      await school_dashboard_client.get_current_school_parents();
    if (parents_res.ok) {
      const new_parents_list: Parent[] = parents_res.data.map((p: ParentJson) =>
        Parent.fromJson(p)
      );
      setParentList(new_parents_list);
    }
    //* Fetch New Students List :
    RefetchStudents();
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation('parentManagement',language)}
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span> {getTranslation('addParent',language)}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={getTranslation('searchParentsStudentsOrEmail',language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option key={"all"} value={"all"}>
                {"الكل"}
              </option>
              {class_groups_list.map((cls) => (
                <option key={cls.class_group_id} value={cls.class_group_id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="ltr:text-left px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('parent',language)}
                </th>
                <th className="ltr:text-left px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('email',language)}
                </th>
                <th className="ltr:text-left px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('phoneNumber',language)}
                </th>
                <th className="ltr:text-left px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('children',language)}
                </th>
                <th className="ltr:text-left px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {getTranslation('actions',language)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredParents.map((parent) => (
                <tr
                  key={parent.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {parent.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {parent.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {parent.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {/* {parent.students?.join(", ")} */}
                      {parent.students
                        ?.map((student) => student.full_name)
                        .join(", ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button className="text-primary-500 hover:bg-primary-300">
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* the parent has his data - can't be edited by school for now */}
                      <button
                        onClick={() => {
                          setSearchQuery(parent.email);
                          setShowAddModal(true);
                          handleSelectParent(parent.id, parent.name);
                        }}
                        className="text-primary-600 hover:bg-primary-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(parent.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add or Update Parent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إضافة ولي أمر جديد
            </h3>

            <form key={parentModalFormKey} className="space-y-4" onSubmit={handleAddParentSubmit}>
              {/* Search by name or email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ابحث بالاسم أو البريد الإلكتروني
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchParents();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="اسم ولي الأمر أو بريده الإلكتروني..."
                  />
                  <button
                    type="button"
                    onClick={handleSearchParents}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSearching ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نتائج البحث
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.user}
                        type="button"
                        onClick={() => handleSelectParent(result.user, result.full_name)}
                        className={`w-full text-right px-4 py-2 flex justify-between items-center text-sm hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedParentPk === result.user
                            ? "bg-primary-100 dark:bg-primary-900/40 border-r-2 border-primary-600"
                            : "bg-white dark:bg-gray-800"
                        }`}
                      >
                        <span className="text-gray-900 dark:text-white font-medium">
                          {result.full_name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {result.phone_number}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected parent confirmation */}
              {selectedParentPk && (
                <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-lg">
                  <span>✓</span>
                  <span>
                    تم اختيار: <strong>{selectedParentName}</strong>
                  </span>
                </div>
              )}

              {/* Error */}
              {errorAddParent && (
                <div className="text text-red-500 text-sm">
                  {errorAddParent}
                </div>
              )}

              {/* Students section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getTranslation("assignStudents", language)}
                  </label>
                  {selectedStudentIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds([])}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      {getTranslation("clearSelection", language)}
                    </button>
                  )}
                </div>

                {/* Selected student chips */}
                {selectedStudentIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 mb-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg">
                    {selectedStudentIds.map((id) => {
                      const s = studentsList.find((st) => st.student_id === id);
                      const isPreAssigned =
                        selectedParentPk !== null &&
                        parentsList
                          .find((p) => p.id === selectedParentPk)
                          ?.students?.some((st) => st.student_id === id);
                      return s ? (
                        <span
                          key={id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isPreAssigned
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                          }`}
                        >
                          {s.full_name}
                          {s.class_group && (
                            <span className="opacity-60">· {s.class_group.name}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleStudent(id)}
                            className="ml-0.5 hover:opacity-70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Search input */}
                <div className="relative mb-2">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder={getTranslation("searchByNameOrClass", language)}
                    className="w-full pr-9 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Grouped student list */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                  {Object.keys(groupedModalStudents).length === 0 ? (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                      {getTranslation("noStudentsMatchSearch", language)}
                    </p>
                  ) : (
                    Object.entries(groupedModalStudents).map(([className, students]) => (
                      <div key={className}>
                        {/* Class group header */}
                        <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0">
                          {className}
                        </div>
                        {students.map((student) => {
                          const isSelected = selectedStudentIds.includes(student.student_id);
                          const isPreAssigned =
                            selectedParentPk !== null &&
                            parentsList
                              .find((p) => p.id === selectedParentPk)
                              ?.students?.some((s) => s.student_id === student.student_id);
                          return (
                            <label
                              key={student.student_id}
                              className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                isSelected ? "bg-primary-50 dark:bg-primary-900/20" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleStudent(student.student_id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="flex-1 text-sm text-gray-900 dark:text-white">
                                {student.full_name}
                              </span>
                              {isPreAssigned && (
                                <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full">
                                  {getTranslation("alreadyAssigned", language)}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetModalState();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!selectedParentPk}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentManagement;
