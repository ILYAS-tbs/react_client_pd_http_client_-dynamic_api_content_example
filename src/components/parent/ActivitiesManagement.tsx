import React, { useState } from "react";
import { Calendar, Search, Star, Eye } from "lucide-react";
import { ActivitiesViewProps } from "../../types";
import { ParentStudentEvent } from "../../models/ParentStudentEvent";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface Activity {
  id: string;
  title: string;
  date: Date;
  time: string;
  category: string;
  description: string;
  location: string;
  // ? Additinal data to store about each event
  student: string;
  school: string;
}

const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  parentStudentsEvents,
}) => {

  //! Translations :: 
  const {language} = useLanguage()

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
        description: event.title,
        location: event.place,
        // additional data for each event (student, school)
        student: parentEvent.student,
        school: parentEvent.school,
      }))
    );
  }

  const [activities] = useState<Activity[]>(
    mapTpActivities(parentStudentsEvents)
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [viewCalendar, setViewCalendar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
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
          {getTranslation('schoolEvents',language)}
        </h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">{getTranslation('all',language)}</option>
            <option value="رياضية">{getTranslation('sports',language)}</option>
            <option value="علمية">{getTranslation('science',language)}</option>
            <option value="ثقافية">{getTranslation('cultural',language)}</option>
          </select>
          <button
            onClick={() => setViewCalendar(!viewCalendar)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Calendar className="h-5 w-5" />
            <span>{viewCalendar ? getTranslation('ViewSchedule',language) : getTranslation('viewCalendar',language)}</span>
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
                placeholder={getTranslation('searchPlaceholder',language)}
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
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>{getTranslation('noEventsAvailable',language)}</p>
          </div>
        ) : viewCalendar ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
             {getTranslation('eventsCalendar',language)}
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
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
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
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('titleColumn',language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('categoryColumn',language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('student',language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('school',language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('Date',language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('Time',language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('location',language)}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation('actions',language)}
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
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
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

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {getTranslation('eventDetails',language)}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation('titleColumn',language)}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedActivity.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                   {getTranslation('categoryColumn',language)}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedActivity.category}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation('Date',language)}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedActivity.date.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation('location',language)}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedActivity.time}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation('location',language)}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedActivity.location}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getTranslation('description',language)}
                </label>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedActivity.description}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {getTranslation('close',language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesView;
