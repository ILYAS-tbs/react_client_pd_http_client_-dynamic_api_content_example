import React, { useMemo, useState } from "react";
import { Search, Star, Eye } from "lucide-react";
import { ActivitiesViewProps } from "../../types";
import { ParentStudentEvent } from "../../models/ParentStudentEvent";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { FilePreview } from "../shared/file_preview";

interface Activity {
  id: string;
  title: string;
  date: Date;
  time: string;
  category: string;
  description: string;
  location: string;
  file?: string | null;
  // ? Additinal data to store about each event
  student: string;
  school: string;
}

const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  parentStudentsEvents,
}) => {

  //! Translations :: 
  const { language } = useLanguage()

  //! mock data to map the api to :
  // const [activities] = useState<Activity[]>([
  //   {
  //     id: "a1",
  //     title: "يوم رياضي",
  //     date: "2025-06-25",
  //     time: "09:00",
  //     category: "رياضية",
  //     description: "مسابقات رياضية للطلاب تشمل سباقات الجري والقفز وكرة القدم.",
  //     location: "ملعب المدرسة",
  //   },
  //   {
  //     id: "a2",
  //     title: "معرض علمي",
  //     date: "2025-06-27",
  //     time: "10:00",
  //     category: "علمية",
  //     description:
  //       "عرض للمشاريع العلمية التي أعدها الطلاب في مواضيع الفيزياء والكيمياء.",
  //     location: "قاعة 5",
  //   },
  //   {
  //     id: "a3",
  //     title: "حفل تخرج",
  //     date: "2025-06-30",
  //     time: "14:00",
  //     category: "ثقافية",
  //     description: "احتفال بتخرج الصف السادس مع عروض فنية وتوزيع شهادات.",
  //     location: "المسرح",
  //   },
  // ]);

  // {
  //     id: event.events,
  //     title: "حفل تخرج",
  //     date: "2025-06-30",
  //     time: "14:00",
  //     category: "ثقافية",
  //     description: "احتفال بتخرج الصف السادس مع عروض فنية وتوزيع شهادات.",
  //     location: "المسرح",
  //   }

  //   {
  //       "student_id": "10d3acbb-7659-4898-b9d5-4edf820aa30f",
  //       "student": "هاجر مداح هاجر",
  //       "school_id": "146fb0fe-c0ee-44e4-bb2c-513b8790f52e",
  //       "school": "مدرسة الامل",
  //       "events": [
  //           {
  //               "event_id": "1d7e47ca-521b-4308-bf23-316c2ffa5162",
  //               "title": "club event 1",
  //               "category": "sientific",
  //               "date": "2025-09-08",
  //               "time": "10:04:25",
  //               "place": "المكتبة"
  //           }
  //       ]
  //   },
  function mapTpActivities(
    parentStudentsEvents: ParentStudentEvent[]
  ): Activity[] {
    return parentStudentsEvents.flatMap((parentEvent) =>
      parentEvent.events.map((event) => ({
        id: event.event_id,
        title: event.title,
        date: new Date(event.date), // keep as string, or format if needed
        time: event.time,
        category: event.category,
        description: event.desc ?? event.title,
        location: event.place,
        file: event.file ?? null,
        // additional data for each event (student, school)
        student: parentEvent.student,
        school: parentEvent.school,
      }))
    );
  }

  const activities = useMemo(
    () => mapTpActivities(parentStudentsEvents),
    [parentStudentsEvents]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [viewCalendar] = useState(false);
  const [selectedCategory] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  const filteredActivities = activities.filter(
    (act) =>
      (act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "all" || act.category === selectedCategory)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation('schoolEvents', language)}
        </h2>
        {/* <div className="flex space-x-2 rtl:space-x-reverse">
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
        </div> */}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={getTranslation('searchPlaceholder', language)}
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
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>{getTranslation('noEventsAvailable', language)}</p>
          </div>
        ) : viewCalendar ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {getTranslation('eventsCalendar', language)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow flex flex-col h-32 justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => setSelectedActivity(activity)}
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
                    {activity.date.toLocaleDateString()} - {activity.time} (
                    {activity.location})
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('titleColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('categoryColumn', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('description', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('student', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('school', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('Date', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('Time', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('location', language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('Details', language)}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredActivities.map((activity) => (
                  <tr
                    key={activity.id}
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
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-normal line-clamp-3">
                        {activity.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.student}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.school}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.date.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedActivity(activity)}
                        className="text-primary-500 hover:bg-primary-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Details Modal - Improved UX */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Sticky Header */}
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 py-5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedActivity.title}
              </h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="inline-block bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-200 text-xs font-semibold px-3 py-1 rounded-full">
                  {selectedActivity.category}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedActivity.date.toLocaleDateString('ar-DZ')}
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Date & Time Section */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                  {getTranslation('Date', language)}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {getTranslation('Date', language)}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedActivity.date.toLocaleDateString('ar-DZ', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {getTranslation('Time', language)}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedActivity.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-2">
                  {getTranslation('location', language)}
                </h3>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedActivity.location}
                </p>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                  {getTranslation('description', language)}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedActivity.description || getTranslation('noDescription', language)}
                </p>
              </div>

              {/* Student & School Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                    {getTranslation('student', language)}
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedActivity.student}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                    {getTranslation('school', language)}
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedActivity.school}
                  </p>
                </div>
              </div>

              {/* Attachment Section */}
              {selectedActivity.file ? (
                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 border-l-4 border-orange-500">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-3">
                    {getTranslation('attachment', language)}
                  </h3>
                  <div className="flex justify-center">
                    <FilePreview url={selectedActivity.file} filename={selectedActivity.file} />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                {getTranslation('close', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesView;
