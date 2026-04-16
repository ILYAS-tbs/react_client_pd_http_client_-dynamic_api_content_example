import React, { useCallback, useEffect, useState } from "react";
import { Calendar, Edit, Trash2, Plus, Search } from "lucide-react";
import { ActivitiesManagementProps } from "../../types";
import { Event } from "../../models/Event";
import {
  PatchEventPayload,
  PostEventPayload,
} from "../../services/http_api/payloads_types/school_client_payload_types";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { useModalFormReset } from "../../hooks/useModalFormReset";
import { FilePreview } from "../shared/file_preview";
import { isAllowedSchoolUpload, SCHOOL_FILE_ACCEPT } from "../../utils/fileUploads";

interface Activity {
  event_id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  desc: string;
  place: string;
  file?: string | null;
}

const ActivitiesManagement: React.FC<ActivitiesManagementProps> = ({
  events_list,
  school_id,
  RefetchEvents,
}) => {
  //  mock data event shape : { id: 'a1', title: 'يوم رياضي', date: '2025-06-25', time: '09:00', category: 'رياضية', description: 'مسابقات رياضية للطلاب', location: 'ملعب المدرسة' },
  //! translation : 
  const { language } = useLanguage()

  const [activities, setActivities] = useState<Event[]>(events_list);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCalendar, setViewCalendar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [postEventFile, setPostEventFile] = useState<File | null>(null);
  const [patchEventFile, setPatchEventFile] = useState<File | null>(null);
  const [postFileError, setPostFileError] = useState("");
  const [patchFileError, setPatchFileError] = useState("");

  // const handleAddActivity = () => {
  //   if (
  //     newActivity.title &&
  //     newActivity.date &&
  //     newActivity.time &&
  //     newActivity.category &&
  //     newActivity.description &&
  //     newActivity.location
  //   ) {
  //     setActivities([...activities, { id: `a-${Date.now()}`, ...newActivity }]);
  //     setNewActivity({
  //       title: "",
  //       date: "",
  //       time: "",
  //       category: "",
  //       description: "",
  //       location: "",
  //     });
  //     setShowAddModal(false);
  //   }
  // };

  // const handleUpdateActivity = () => {
  //   if (
  //     editingActivity &&
  //     newActivity.title &&
  //     newActivity.date &&
  //     newActivity.time &&
  //     newActivity.category &&
  //     newActivity.description &&
  //     newActivity.location
  //   ) {
  //     setActivities(
  //       activities.map((act) =>
  //         act.event_id === editingActivity.id ? { ...act, ...newActivity } : act
  //       )
  //     );
  //     setEditingActivity(null);
  //     setNewActivity({
  //       title: "",
  //       date: "",
  //       time: "",
  //       category: "",
  //       description: "",
  //       location: "",
  //     });
  //     setShowAddModal(false);
  //   }
  // };

  const filteredActivities = activities.filter(
    (act) =>
      (act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.place.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "all" || act.category === selectedCategory)
  );

  function formatDjangoDate(date: string) {
    const djangoTime = date; // eg : "15:06:53.909623";
    const [hours, minutes] = djangoTime.split(":");
    const formatted = `${hours}:${minutes}`;
    return formatted;
  }

  //! Post Event ::
  const createPostEventForm = useCallback(
    () => ({
      title: "",
      category: "",
      date: "",
      time: "",
      place: "",
      desc: "",
      school_id: school_id,
    }),
    [school_id]
  );
  const [postEventForm, setPostEventForm] = useState<PostEventPayload>({
    ...createPostEventForm(),
  });

  const [postModalError, setPostModalError] = useState("");
  function showPostError(error: string) {
    setPostModalError(error);
    setTimeout(() => {
      setPostModalError("");
    }, 7000);
  }

  const resetPostEventForm = useCallback(() => {
    setPostEventForm(createPostEventForm());
    setPostModalError("");
    setPostEventFile(null);
    setPostFileError("");
    setEditingActivity(null);
  }, [createPostEventForm]);

  const { formKey: addActivityFormKey } = useModalFormReset({
    isOpen: showAddModal,
    mode: "add",
    resetForm: resetPostEventForm,
  });

  const handlePostFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setPostEventForm({
      ...postEventForm,
      [e.target.name]: e.target.value,
    });
  };
  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ActivitiesManagement payload:");
    console.log(postEventForm);

    //! API CALL
    const latest_csrf = getCSRFToken()!;
    const post_event_payload: PostEventPayload = {
      title: postEventForm.title ?? "",
      category: postEventForm.category ?? "",
      date: postEventForm.date ?? "",
      time: postEventForm.time ?? "",
      place: postEventForm.place ?? "",
      desc: postEventForm.desc ?? "",
      school_id: school_id,
      file: postEventFile,
    };

    const post_event_res = await school_dashboard_client.post_event(
      post_event_payload,
      latest_csrf
    );

    if (post_event_res.ok) {
      console.log("post_event_res OK");
      //? Update Events
      RefetchEvents();

      resetPostEventForm();
      setShowAddModal(false);
    } else {
      showPostError("حدث خطأ، يرجى ملء جميع الحقول");
    }
  };
  //! DeleteEvent
  const handleDeleteEvent = async (event_id: string) => {
    await school_dashboard_client.delete_event(
      event_id,
      getCSRFToken()!
    );
    //? Refresh data :
    RefetchEvents();
  };

  //! PATCH EVENT
  const [last_selected_event, set_last_selected_event] = useState<Event | null>(
    null
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const createPatchEventForm = useCallback(
    () => ({
      title: "",
      category: "",
      date: "",
      time: "",
      place: "",
      desc: "",
      school_id: school_id,
    }),
    [school_id]
  );
  const [patchEventForm, setPatchEventForm] = useState<PostEventPayload>({
    ...createPatchEventForm(),
  });

  const [patchModalError, setPatchModalError] = useState("");
  function showPatchError(error: string) {
    setPatchModalError(error);
    setTimeout(() => {
      setPatchModalError("");
    }, 7000);
  }

  const resetPatchEventForm = useCallback(() => {
    setPatchEventForm(createPatchEventForm());
    setPatchModalError("");
    setPatchEventFile(null);
    setPatchFileError("");
    set_last_selected_event(null);
  }, [createPatchEventForm]);

  const populatePatchEventForm = useCallback((event: Event) => {
    setPatchEventForm({
      title: event.title ?? "",
      category: event.category ?? "",
      date: event.date ?? "",
      time: event.time ?? "",
      place: event.place ?? "",
      desc: event.desc ?? "",
      school_id: school_id,
    });
  }, [school_id]);

  const { formKey: editActivityFormKey } = useModalFormReset({
    isOpen: showEditModal,
    mode: last_selected_event ? "edit" : "add",
    selectedItem: last_selected_event,
    selectedKey: last_selected_event?.event_id ?? null,
    resetForm: resetPatchEventForm,
    populateForm: populatePatchEventForm,
  });

  const handlePatchFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setPatchEventForm({
      ...patchEventForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePatchEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    const latest_csrf = getCSRFToken()!;
    const patch_event_payload: PatchEventPayload = {
      title: patchEventForm.title,
      category: patchEventForm.category,
      date: patchEventForm.date,
      time: patchEventForm.time,
      place: patchEventForm.place,
      desc: patchEventForm.desc,
      file: patchEventFile,
    };
    const event_id = last_selected_event?.event_id ?? "";

    const patch_event_res = await school_dashboard_client.patch_event(
      event_id,
      patch_event_payload,
      latest_csrf
    );

    if (patch_event_res.ok) {
      console.log("patch_event_res OK");
      //? Refresh data
      RefetchEvents();
      resetPatchEventForm();
      setShowEditModal(false);
    } else {
      showPatchError("حدث خطأ، يرجى ملء جميع الحقول");
    }
  };

  //? Syncing the local state with parent props state
  useEffect(() => {
    setActivities(events_list);
  }, [events_list]);

  const handleEventFileSelection = (
    file: File | null,
    onSelect: (nextFile: File | null) => void,
    onError: (message: string) => void
  ) => {
    if (!file) {
      onSelect(null);
      onError("");
      return;
    }

    if (!isAllowedSchoolUpload(file)) {
      onSelect(null);
      onError(getTranslation("pdfOrImageOnlyError", language));
      return;
    }

    onSelect(file);
    onError("");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation('eventManagement', language)}
        </h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{getTranslation('all', language)}</option>
            <option value="رياضية">{getTranslation('sports', language)}</option>
            <option value="علمية">{getTranslation('science', language)}</option>
            <option value="ثقافية">{getTranslation('cultural', language)}</option>
          </select>
          <button
            onClick={() => setViewCalendar(!viewCalendar)}
            className="bg-primary-500 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Calendar className="h-5 w-5" />
            <span>{viewCalendar ? getTranslation('ViewSchedule', language) : getTranslation('viewCalendar', language)}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="h-5 w-5" />
            <span>{getTranslation('addActivity', language)}</span>
          </button>
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
                placeholder={getTranslation('searchActivity', language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activities Table or Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {viewCalendar ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {getTranslation('eventsCalendar', language)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.event_id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow flex flex-col h-32 justify-between"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.category}
                    </p>
                  </div>
                  <div className="text-sm text-primary-500 dark:text-primary-400 mt-2">
                    {activity.date} - {activity.date} ({activity.place})
                  </div>
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
                    {getTranslation('titleColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('categoryColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('dateColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('timeColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('locationColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('attachment', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('actionsColumn', language)}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredActivities.map((activity) => (
                  <tr
                    key={activity.event_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDjangoDate(activity.time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.place}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.file ? (
                        <FilePreview url={activity.file} filename={activity.file} compact />
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => {
                            set_last_selected_event(activity);
                            setShowEditModal(true);
                          }}
                          className="text-primary-600 hover:bg-primary-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(activity.event_id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        {/* for now : now eye */}
                        {/* <button className="text-primary-500 hover:bg-primary-300">
                          <Eye className="h-4 w-4" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Activity Modal - Improved UX with Scrollable Sections */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
            {/* Sticky Header */}
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 py-5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTranslation('addActivity', language)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getTranslation('fillAllFieldsBelow', language) || 'ملء جميع الحقول المطلوبة'}
              </p>
            </div>

            {/* Scrollable Content */}
            <form key={addActivityFormKey} className="flex-1 overflow-y-auto px-6 py-6 space-y-6" onSubmit={handlePostEvent}>
              {/* ========== SECTION 1: BASIC INFO ========== */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                  {getTranslation('basicInfo', language) || 'معلومات أساسية'}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العنوان *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={postEventForm.title}
                    onChange={handlePostFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="مثال: يوم رياضي"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الفئة *
                    </label>
                    <select
                      name="category"
                      value={postEventForm.category}
                      onChange={handlePostFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">اختر الفئة</option>
                      <option value="رياضية">رياضية</option>
                      <option value="علمية">علمية</option>
                      <option value="ثقافية">ثقافية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      التاريخ *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={postEventForm.date}
                      onChange={handlePostFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الوقت *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={postEventForm.time}
                      onChange={handlePostFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الموقع *
                    </label>
                    <input
                      type="text"
                      name="place"
                      value={postEventForm.place}
                      onChange={handlePostFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: ملعب المدرسة"
                    />
                  </div>
                </div>
              </div>

              {/* ========== SECTION 2: CONTENT ========== */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                  {getTranslation('content', language) || 'المحتوى'}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوصف *
                  </label>
                  <textarea
                    name="desc"
                    value={postEventForm.desc}
                    onChange={handlePostFormChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="صف الفعالية والأنشطة المخطط لها..."
                  />
                </div>
              </div>

              {/* ========== SECTION 3: ATTACHMENTS ========== */}
              <div className="space-y-4 pb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                  {getTranslation('optionalFields', language) || 'حقول اختيارية'}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getTranslation('attachment', language)} (PDF / JPG / PNG / WEBP)
                  </label>
                  <input
                    type="file"
                    accept={SCHOOL_FILE_ACCEPT}
                    onChange={(e) =>
                      handleEventFileSelection(
                        e.target.files?.[0] ?? null,
                        setPostEventFile,
                        setPostFileError
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {postEventFile ? (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
                        ✓ {postEventFile.name}
                      </p>
                      <FilePreview url={URL.createObjectURL(postEventFile)} filename={postEventFile.name} compact />
                    </div>
                  ) : null}
                  {postFileError ? (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                      ⚠ {postFileError}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Error Message */}
              {postModalError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    ⚠ {postModalError}
                  </p>
                </div>
              )}
            </form>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetPostEventForm();
                }}
                className="px-5 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors font-medium"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form={addActivityFormKey}
                onClick={handlePostEvent}
                className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                إضافة الفعالية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Activity Modal - Improved UX with Scrollable Sections */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
            {/* Sticky Header */}
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 py-5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                تعديل الفعالية
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                حدّث معلومات الفعالية أدناه
              </p>
            </div>

            {/* Scrollable Content */}
            <form key={editActivityFormKey} className="flex-1 overflow-y-auto px-6 py-6 space-y-6" onSubmit={handlePatchEvent}>
              {/* ========== SECTION 1: BASIC INFO ========== */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                  معلومات أساسية
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العنوان
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={patchEventForm.title}
                    onChange={handlePatchFormChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="اسم الفعالية"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الفئة
                    </label>
                    <select
                      name="category"
                      value={patchEventForm.category}
                      onChange={handlePatchFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">اختر الفئة</option>
                      <option value="رياضية">رياضية</option>
                      <option value="علمية">علمية</option>
                      <option value="ثقافية">ثقافية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      التاريخ
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={patchEventForm.date}
                      onChange={handlePatchFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الوقت
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={patchEventForm.time}
                      onChange={handlePatchFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الموقع
                    </label>
                    <input
                      type="text"
                      name="place"
                      value={patchEventForm.place}
                      onChange={handlePatchFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مكان الفعالية"
                    />
                  </div>
                </div>
              </div>

              {/* ========== SECTION 2: CONTENT ========== */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                  المحتوى
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوصف
                  </label>
                  <textarea
                    name="desc"
                    value={patchEventForm.desc}
                    onChange={handlePatchFormChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="صف الفعالية والأنشطة..."
                  />
                </div>
              </div>

              {/* ========== SECTION 3: ATTACHMENTS ========== */}
              <div className="space-y-4 pb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                  الملفات المرفقة
                </h3>

                {last_selected_event?.file ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">
                      الملف الحالي:
                    </p>
                    <FilePreview url={last_selected_event.file} filename={last_selected_event.file} />
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getTranslation('attachment', language)} (PDF / JPG / PNG / WEBP)
                  </label>
                  <input
                    type="file"
                    accept={SCHOOL_FILE_ACCEPT}
                    onChange={(e) =>
                      handleEventFileSelection(
                        e.target.files?.[0] ?? null,
                        setPatchEventFile,
                        setPatchFileError
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {patchEventFile ? (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
                        ✓ {patchEventFile.name}
                      </p>
                      <FilePreview url={URL.createObjectURL(patchEventFile)} filename={patchEventFile.name} compact />
                    </div>
                  ) : null}
                  {patchFileError ? (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                      ⚠ {patchFileError}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Error Message */}
              {patchModalError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    ⚠ {patchModalError}
                  </p>
                </div>
              )}
            </form>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  resetPatchEventForm();
                }}
                className="px-5 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors font-medium"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form={editActivityFormKey}
                onClick={handlePatchEvent}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesManagement;
