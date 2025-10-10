import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, Users } from 'lucide-react';

const AnnouncementManager: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const announcements = [
    {
      id: 1,
      title: 'موعد امتحانات الفصل الأول',
      content: 'تبدأ امتحانات الفصل الأول يوم الأحد الموافق 15 يناير 2024. يرجى من جميع الطلاب الاستعداد جيداً.',
      type: 'امتحانات',
      targetAudience: 'جميع الطلاب',
      date: '2024-01-10',
      status: 'منشور',
      views: 245
    },
    {
      id: 2,
      title: 'إجازة عيد الفطر',
      content: 'تعلن إدارة المدرسة عن إجازة عيد الفطر المبارك من تاريخ 20 إلى 25 أبريل 2024.',
      type: 'إجازة',
      targetAudience: 'الجميع',
      date: '2024-01-08',
      status: 'منشور',
      views: 189
    },
    {
      id: 3,
      title: 'اجتماع أولياء الأمور',
      content: 'يسر إدارة المدرسة دعوة أولياء الأمور لحضور الاجتماع الدوري يوم السبت الموافق 20 يناير.',
      type: 'اجتماع',
      targetAudience: 'أولياء الأمور',
      date: '2024-01-05',
      status: 'مسودة',
      views: 0
    }
  ];

  const announcementTypes = ['عام', 'امتحانات', 'إجازة', 'اجتماع', 'نشاط', 'تحذير'];
  const targetAudiences = ['الجميع', 'جميع الطلاب', 'أولياء الأمور', 'المعلمين', 'صف محدد'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الإعلانات</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>إعلان جديد</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    announcement.type === 'امتحانات' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                    announcement.type === 'إجازة' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    announcement.type === 'اجتماع' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {announcement.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    announcement.status === 'منشور' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {announcement.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{announcement.content}</p>
                <div className="flex items-center space-x-6 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Calendar className="h-4 w-4" />
                    <span>{announcement.date}</span>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Users className="h-4 w-4" />
                    <span>{announcement.targetAudience}</span>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Eye className="h-4 w-4" />
                    <span>{announcement.views} مشاهدة</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إعلان جديد</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  عنوان الإعلان
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="عنوان الإعلان"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نوع الإعلان
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    {announcementTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الجمهور المستهدف
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    {targetAudiences.map((audience) => (
                      <option key={audience} value={audience}>{audience}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  محتوى الإعلان
                </label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اكتب محتوى الإعلان هنا..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تاريخ النشر
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="urgent"
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="urgent" className="text-sm text-gray-700 dark:text-gray-300">
                  إعلان عاجل
                </label>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                حفظ كمسودة
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                نشر الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManager;