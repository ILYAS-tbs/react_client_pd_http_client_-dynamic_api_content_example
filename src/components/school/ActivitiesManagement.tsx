import React, { useState } from 'react';
import { Calendar, Edit, Trash2, Plus, Search, Star, Eye } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  description: string;
  location: string;
}

const ActivitiesManagement: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([
    { id: 'a1', title: 'يوم رياضي', date: '2025-06-25', time: '09:00', category: 'رياضية', description: 'مسابقات رياضية للطلاب', location: 'ملعب المدرسة' },
    { id: 'a2', title: 'معرض علمي', date: '2025-06-27', time: '10:00', category: 'علمية', description: 'عرض للمشاريع العلمية', location: 'قاعة 5' },
    { id: 'a3', title: 'حفل تخرج', date: '2025-06-30', time: '14:00', category: 'ثقافية', description: 'احتفال بتخرج الصف السادس', location: 'المسرح' },
  ]);
  const [newActivity, setNewActivity] = useState({ title: '', date: '', time: '', category: '', description: '', location: '' });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCalendar, setViewCalendar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleAddActivity = () => {
    if (newActivity.title && newActivity.date && newActivity.time && newActivity.category && newActivity.description && newActivity.location) {
      setActivities([...activities, { id: `a-${Date.now()}`, ...newActivity }]);
      setNewActivity({ title: '', date: '', time: '', category: '', description: '', location: '' });
      setShowAddModal(false);
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setNewActivity({ title: activity.title, date: activity.date, time: activity.time, category: activity.category, description: activity.description, location: activity.location });
    setShowAddModal(true);
  };

  const handleUpdateActivity = () => {
    if (editingActivity && newActivity.title && newActivity.date && newActivity.time && newActivity.category && newActivity.description && newActivity.location) {
      setActivities(activities.map(act => act.id === editingActivity.id ? { ...act, ...newActivity } : act));
      setEditingActivity(null);
      setNewActivity({ title: '', date: '', time: '', category: '', description: '', location: '' });
      setShowAddModal(false);
    }
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(act => act.id !== id));
  };

  const filteredActivities = activities.filter(act =>
    (act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     act.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'all' || act.category === selectedCategory)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الفعاليات</h2>
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
            <span>{viewCalendar ? 'عرض جدول' : 'عرض تقويم'}</span>
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
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">تقويم الفعاليات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow flex flex-col h-32 justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.category}</p>
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    {activity.date} - {activity.time} ({activity.location})
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
                  <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{activity.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{activity.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{activity.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{activity.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button onClick={() => handleEditActivity(activity)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteActivity(activity.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editingActivity ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم الفعالية"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الفئة
                </label>
                <select
                  value={newActivity.category}
                  onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
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
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوقت
                </label>
                <input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوصف
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
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
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="مكان الفعالية"
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => { setShowAddModal(false); setEditingActivity(null); setNewActivity({ title: '', date: '', time: '', category: '', description: '', location: '' }); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={editingActivity ? handleUpdateActivity : handleAddActivity}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingActivity ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesManagement;