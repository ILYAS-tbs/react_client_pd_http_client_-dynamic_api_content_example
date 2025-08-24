import React, { useState } from 'react';
import { BookOpen, Users, MessageCircle, FileText, Calendar, TrendingUp, Upload, Edit } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ClassManagement from '../../components/teacher/ClassManagement';
import GradeManager from '../../components/teacher/GradeManager';
import ResourceManager from '../../components/teacher/ResourceManager';
import ParentChat from '../../components/shared/ParentChat';

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'طلابي', value: '32', icon: Users, color: 'bg-blue-500' },
    { title: 'الفصول', value: '3', icon: BookOpen, color: 'bg-green-500' },
    { title: 'الرسائل الجديدة', value: '7', icon: MessageCircle, color: 'bg-purple-500' },
    { title: 'المواد المرفوعة', value: '15', icon: Upload, color: 'bg-orange-500' }
  ];

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
    { id: 'classes', label: 'فصولي', icon: Users },
    { id: 'grades', label: 'الدرجات', icon: FileText },
    { id: 'resources', label: 'المواد التعليمية', icon: BookOpen },
    { id: 'chat', label: 'التواصل', icon: MessageCircle },
    { id: 'schedule', label: 'الجدول', icon: Calendar }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'classes':
        return <ClassManagement />;
      case 'grades':
        return <GradeManager />;
      case 'resources':
        return <ResourceManager />;
      case 'chat':
        return <ParentChat userType="teacher" />;
      case 'schedule':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">الجدول الأسبوعي</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">الوقت</th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">الأحد</th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">الاثنين</th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">الثلاثاء</th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">الأربعاء</th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-2">الخميس</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: '08:00 - 08:45', classes: ['رياضيات 5أ', 'عربي 4ب', 'علوم 6أ', 'رياضيات 5ب', 'عربي 4أ'] },
                    { time: '08:45 - 09:30', classes: ['عربي 4أ', 'رياضيات 5أ', 'رياضيات 5ب', 'علوم 6أ', 'عربي 4ب'] },
                    { time: '10:00 - 10:45', classes: ['علوم 6أ', 'عربي 4أ', 'رياضيات 5أ', 'عربي 4ب', 'رياضيات 5ب'] }
                  ].map((slot, index) => (
                    <tr key={index}>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                        {slot.time}
                      </td>
                      {slot.classes.map((cls, clsIndex) => (
                        <td key={clsIndex} className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-center text-sm text-gray-700 dark:text-gray-300">
                          {cls}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Today's Classes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">حصص اليوم</h3>
              <div className="space-y-3">
                {[
                  { time: '08:00 - 08:45', subject: 'رياضيات', class: '5أ', room: 'غرفة 201' },
                  { time: '08:45 - 09:30', subject: 'عربي', class: '4أ', room: 'غرفة 102' },
                  { time: '10:00 - 10:45', subject: 'علوم', class: '6أ', room: 'مختبر العلوم' }
                ].map((lesson, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{lesson.subject} - {lesson.class}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.room}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lesson.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إجراءات سريعة</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
                    <Edit className="h-5 w-5" />
                    <span>إدخال درجات جديدة</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                    <Upload className="h-5 w-5" />
                    <span>رفع مادة تعليمية</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>إرسال إشعار للأولياء</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">رسائل جديدة</h3>
                <div className="space-y-3">
                  {[
                    { from: 'أم أحمد', message: 'استفسار عن درجات الرياضيات', time: 'منذ ساعة' },
                    { from: 'أبو فاطمة', message: 'طلب موعد لقاء', time: 'منذ 2 ساعة' },
                    { from: 'أم محمد', message: 'شكر على المجهود', time: 'منذ 3 ساعات' }
                  ].map((msg, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{msg.from}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{msg.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      title="لوحة تحكم المعلم"
      subtitle="مرحباً أستاذ أحمد، إليك ملخص أنشطتك اليومية"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default TeacherDashboard;