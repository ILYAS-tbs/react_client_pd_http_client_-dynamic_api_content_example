import React, { useEffect, useState } from "react";
import { Calendar, Edit, Trash2, Plus, Search, Star, Eye } from "lucide-react";
import { ActivitiesManagementProps } from "../../types";
import { Event } from "../../models/Event";
import {
  PatchEventPayload,
  PostEventPayload,
} from "../../services/http_api/payloads_types/school_client_payload_types";
import { school_dashboard_client } from "../../services/http_api/school-dashboard/school_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";

interface Activity {
  event_id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  desc: string;
  place: string;
}

const ActivitiesManagement: React.FC<ActivitiesManagementProps> = ({
  events_list,
  school_id,
  RefetchEvents,
}) => {
  //  mock data event shape : { id: 'a1', title: 'يوم رياضي', date: '2025-06-25', time: '09:00', category: 'رياضية', description: 'مسابقات رياضية للطلاب', location: 'ملعب المدرسة' },

  const [activities, setActivities] = useState<Event[]>(events_list);
  const [newActivity, setNewActivity] = useState({
    title: "",
    date: "",
    time: "",
    category: "",
    description: "",
    location: "",
  });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCalendar, setViewCalendar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setNewActivity({
      title: activity.title,
      date: activity.date,
      time: activity.time,
      category: activity.category,
      description: activity.desc,
      location: activity.place,
    });

    //? my implementation
    setShowEditModal(true);
  };

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

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter((act) => act.event_id !== id));
  };

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
  const [postEventForm, setPostEventForm] = useState<PostEventPayload>({
    title: "",
    category: "",
    date: "",
    time: "",
    place: "",
    desc: "",
    school_id: school_id,
  });

  const [postModalError, setPostModalError] = useState("");
  function showPostError(error: string) {
    setPostModalError(error);
    setTimeout(() => {
      setPostModalError("");
    }, 7000);
  }

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
    };

    const post_event_res = await school_dashboard_client.post_event(
      post_event_payload,
      latest_csrf
    );

    if (post_event_res.ok) {
      console.log("post_event_res OK");
      //? Update Events
      RefetchEvents();

      setShowAddModal(false);
    } else {
      showPostError("حدث خطأ، يرجى ملء جميع الحقول");
    }
  };
  //! DeleteEvent
  const handleDeleteEvent = async (event_id: string) => {
    const delete_event_res = await school_dashboard_client.delete_event(
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
  const [patchEventForm, setPatchEventForm] = useState<PostEventPayload>({
    title: last_selected_event?.title ?? "",
    category: last_selected_event?.category ?? "",
    date: last_selected_event?.date ?? "",
    time: last_selected_event?.time ?? "",
    place: last_selected_event?.place ?? "",
    desc: last_selected_event?.desc ?? "",
    school_id: school_id,
  });

  const [patchModalError, setPatchModalError] = useState("");
  function showPatchError(error: string) {
    setPatchModalError(error);
    setTimeout(() => {
      setPatchModalError("");
    }, 7000);
  }

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
      setShowEditModal(false);
    } else {
      showPatchError("حدث خطأ، يرجى ملء جميع الحقول");
    }
  };

  //? Syncing the local state with parent props state
  useEffect(() => {
    setActivities(events_list);
  }, [events_list]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة الفعاليات
        </h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">الكل</option>
            <option value="رياضية">رياضية</option>
            <option value="علمية">علمية</option>
            <option value="ثقافية">ثقافية</option>
          </select>
          <button
            onClick={() => setViewCalendar(!viewCalendar)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Calendar className="h-5 w-5" />
            <span>{viewCalendar ? "عرض جدول" : "عرض تقويم"}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="h-5 w-5" />
            <span>إضافة فعالية</span>
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
                placeholder="البحث عن العنوان أو الوصف أو الموقع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              تقويم الفعاليات
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
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
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
                    العنوان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الوقت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الموقع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراءات
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => {
                            set_last_selected_event(activity);
                            setShowEditModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
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
                        {/* <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
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

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingActivity ? "تعديل الفعالية" : "إضافة فعالية جديدة"}
            </h3>

            <form className="space-y-4" onSubmit={handlePostEvent}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  name="title"
                  value={postEventForm.title}
                  onChange={handlePostFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم الفعالية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الفئة
                </label>
                <select
                  name="category"
                  value={postEventForm.category}
                  onChange={handlePostFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">اختر الفئة</option>
                  <option value="رياضية">رياضية</option>
                  <option value="علمية">علمية</option>
                  <option value="ثقافية">ثقافية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  التاريخ
                </label>
                <input
                  type="date"
                  name="date"
                  value={postEventForm.date}
                  onChange={handlePostFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوقت
                </label>
                <input
                  type="time"
                  name="time"
                  value={postEventForm.time}
                  onChange={handlePostFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوصف
                </label>
                <textarea
                  name="desc"
                  value={postEventForm.desc}
                  onChange={handlePostFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="تفاصيل الفعالية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الموقع
                </label>
                <input
                  type="text"
                  name="place"
                  value={postEventForm.place}
                  onChange={handlePostFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="مكان الفعالية"
                />
              </div>

              {/* error */}
              {postModalError && (
                <div className="text text-red-600">{postModalError}</div>
              )}

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingActivity(null);
                    setNewActivity({
                      title: "",
                      date: "",
                      time: "",
                      category: "",
                      description: "",
                      location: "",
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  // onClick={
                  //   editingActivity ? handleUpdateActivity : handleAddActivity
                  // }
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {/* {editingActivity ? "تحديث" : "إضافة"} */}
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              تعديل الفعالية
            </h3>

            <form className="space-y-4" onSubmit={handlePatchEvent}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  name="title"
                  value={patchEventForm.title}
                  onChange={handlePatchFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم الفعالية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الفئة
                </label>
                <select
                  name="category"
                  value={patchEventForm.category}
                  onChange={handlePatchFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">اختر الفئة</option>
                  <option value="رياضية">رياضية</option>
                  <option value="علمية">علمية</option>
                  <option value="ثقافية">ثقافية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  التاريخ
                </label>
                <input
                  type="date"
                  name="date"
                  value={patchEventForm.date}
                  onChange={handlePatchFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوقت
                </label>
                <input
                  type="time"
                  name="time"
                  value={patchEventForm.time}
                  onChange={handlePatchFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوصف
                </label>
                <textarea
                  name="desc"
                  value={patchEventForm.desc}
                  onChange={handlePatchFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="تفاصيل الفعالية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الموقع
                </label>
                <input
                  type="text"
                  name="place"
                  value={patchEventForm.place}
                  onChange={handlePatchFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="مكان الفعالية"
                />
              </div>

              {/* error */}
              {patchModalError && (
                <div className="text text-red-600">{patchModalError}</div>
              )}

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingActivity(null);
                    setNewActivity({
                      title: "",
                      date: "",
                      time: "",
                      category: "",
                      description: "",
                      location: "",
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  // onClick={
                  //   editingActivity ? handleUpdateActivity : handleAddActivity
                  // }
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {/* {editingActivity ? "تحديث" : "إضافة"} */}
                  تحديث
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesManagement;
