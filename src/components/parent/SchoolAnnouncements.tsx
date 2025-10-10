import React, { useState } from 'react';
import { Bell, Calendar, User, Filter, Search, Eye, Download, Pin } from 'lucide-react';

const SchoolAnnouncements: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const announcements = [
    {
      id: 1,
      title: 'موعد امتحانات الفصل الأول',
      content: 'تبدأ امتحانات الفصل الأول يوم الأحد الموافق 28 يناير 2024. يرجى من جميع الطلاب الاستعداد جيداً والحضور في الوقت المحدد. سيتم توزيع جدول الامتحانات على الطلاب هذا الأسبوع.',
      type: 'امتحانات',
      date: '2024-01-15',
      author: 'إدارة المدرسة',
      priority: 'عالي',
      pinned: true,
      targetAudience: 'جميع الطلاب',
      readStatus: false,
      attachments: ['جدول_الامتحانات.pdf']
    },
    {
      id: 2,
      title: 'إجازة عيد المولد النبوي',
      content: 'تعلن إدارة المدرسة عن إجازة عيد المولد النبوي الشريف يومي الاثنين والثلاثاء الموافق 15-16 فبراير 2024. نتمنى لكم إجازة سعيدة ومباركة.',
      type: 'إجازة',
      date: '2024-01-12',
      author: 'إدارة المدرسة',
      priority: 'متوسط',
      pinned: false,
      targetAudience: 'الجميع',
      readStatus: true,
      attachments: []
    },
    {
      id: 3,
      title: 'اجتماع أولياء الأمور',
      content: 'يسر إدارة المدرسة دعوة أولياء الأمور لحضور الاجتماع الدوري يوم السبت الموافق 20 يناير 2024 في الساعة 10:00 صباحاً في قاعة المدرسة الكبرى لمناقشة أداء الطلاب والخطط المستقبلية.',
      type: 'اجتماع',
      date: '2024-01-10',
      author: 'قسم شؤون الطلاب',
      priority: 'عالي',
      pinned: true,
      targetAudience: 'أولياء الأمور',
      readStatus: true,
      attachments: ['جدول_الأعمال.pdf']
    },
    {
      id: 4,
      title: 'مسابقة العلوم والرياضيات',
      content: 'تنظم المدرسة مسابقة في العلوم والرياضيات لجميع طلاب المرحلة الابتدائية. التسجيل مفتوح حتى 25 يناير 2024. الجوائز قيمة والمشاركة مجانية.',
      type: 'نشاط',
      date: '2024-01-08',
      author: 'قسم الأنشطة',
      priority: 'متوسط',
      pinned: false,
      targetAudience: 'جميع الطلاب',
      readStatus: false,
      attachments: ['نموذج_التسجيل.pdf']
    },
    {
      id: 5,
      title: 'تحديث نظام التقييم',
      content: 'نود إعلامكم بتحديث نظام التقييم ليصبح أكثر شمولية ووضوحاً. سيتم شرح النظام الجديد في اجتماع أولياء الأمور القادم.',
      type: 'تعديل',
      date: '2024-01-05',
      author: 'الإدارة الأكاديمية',
      priority: 'عالي',
      pinned: false,
      targetAudience: 'أولياء الأمور',
      readStatus: true,
      attachments: ['دليل_النظام_الجديد.pdf']
    }
  ];

  const announcementTypes = ['الكل', 'امتحانات', 'إجازة', 'اجتماع', 'نشاط', 'تعديل'];

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesFilter = filter === 'all' || filter === 'الكل' || announcement.type === filter;
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.pinned);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عالي':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'متوسط':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'امتحانات':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'إجازة':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'اجتماع':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'نشاط':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const unreadCount = announcements.filter(a => !a.readStatus).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إعلانات المدرسة</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              لديك {unreadCount} إعلان غير مقروء
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Bell className="h-4 w-4" />
            <span>تفعيل الإشعارات</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث في الإعلانات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {announcementTypes.map((type) => (
                <option key={type} value={type === 'الكل' ? 'all' : type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الإعلانات', value: announcements.length, color: 'bg-blue-500' },
          { label: 'غير مقروء', value: unreadCount, color: 'bg-red-500' },
          { label: 'مثبت', value: announcements.filter(a => a.pinned).length, color: 'bg-yellow-500' },
          { label: 'عالي الأولوية', value: announcements.filter(a => a.priority === 'عالي').length, color: 'bg-purple-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 rtl:space-x-reverse">
            <Pin className="h-5 w-5 text-yellow-600" />
            <span>الإعلانات المثبتة</span>
          </h3>
          <div className="space-y-4">
            {pinnedAnnouncements.map((announcement) => (
              <div key={announcement.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                      {!announcement.readStatus && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(announcement.type)}`}>
                        {announcement.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{announcement.targetAudience}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Pin className="h-4 w-4 text-yellow-600" />
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">{announcement.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Calendar className="h-4 w-4" />
                      <span>{announcement.date}</span>
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <User className="h-4 w-4" />
                      <span>{announcement.author}</span>
                    </div>
                  </div>
                  {announcement.attachments.length > 0 && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Download className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {announcement.attachments.length} مرفق
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">جميع الإعلانات</h3>
        <div className="space-y-4">
          {regularAnnouncements.map((announcement) => (
            <div key={announcement.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                    {!announcement.readStatus && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{announcement.targetAudience}</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">{announcement.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Calendar className="h-4 w-4" />
                    <span>{announcement.date}</span>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <User className="h-4 w-4" />
                    <span>{announcement.author}</span>
                  </div>
                </div>
                {announcement.attachments.length > 0 && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Download className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {announcement.attachments.length} مرفق
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد إعلانات</h3>
          <p className="text-gray-600 dark:text-gray-400">لا توجد إعلانات تطابق معايير البحث المحددة</p>
        </div>
      )}
    </div>
  );
};

export default SchoolAnnouncements;