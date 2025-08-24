import React, { useState } from 'react';
import { User, GraduationCap, MessageCircle, FileText, Calendar, TrendingUp, AlertTriangle, Clock, BookOpen, Star, LayoutGrid } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ChildrenOverview from '../../components/parent/ChildrenOverview';
import GradeReports from '../../components/parent/GradeReports';
import AbsenceManager from '../../components/parent/AbsenceManager';
import ScheduleManagement from '../../components/parent/ScheduleManagement';
import ActivitiesView from '../../components/parent/ActivitiesManagement';
import ParentScheduleTable from  '../../components/parent/HomeworksManagement.tsx'
import ResourceLibrary from '../../components/parent/ResourceLibrary';
import ParentChat from '../../components/shared/ParentChat';
import SchoolAnnouncements from '../../components/parent/SchoolAnnouncements';

const ParentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'أطفالي', value: '2', icon: User, color: 'bg-blue-500' },
    { title: 'معدل الحضور', value: '95%', icon: Calendar, color: 'bg-green-500' },
    { title: 'رسائل جديدة', value: '3', icon: MessageCircle, color: 'bg-purple-500' },
    { title: 'إشعارات', value: '5', icon: AlertTriangle, color: 'bg-orange-500' }
  ];

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
    { id: 'children', label: 'أطفالي', icon: User },
    { id: 'grades', label: 'المعدل', icon: FileText },
    { id: 'absences', label: 'تقارير وغيابات', icon: Calendar },
    { id: 'chat', label: 'دردشة', icon: MessageCircle },
    { id: 'announcements', label: 'إشعارات وتنبيهات', icon: AlertTriangle },
    { id: 'timetable', label: 'جدول التوقيت', icon: LayoutGrid },
    { id: 'homework', label: 'الواجبات', icon: BookOpen },
    { id: 'calendar', label: 'مكتبة رقمية', icon: Calendar },
    { id: 'events', label: 'فعاليات', icon: Star }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'children':
        return <ChildrenOverview />;
      case 'grades':
        return <GradeReports />;
      case 'absences':
        return <AbsenceManager />;
      case 'chat':
        return <ParentChat userType="parent" />;
      case 'announcements':
        return <SchoolAnnouncements />;
      case 'timetable':
        return <ScheduleManagement />;

      case 'homework':
        return <ParentScheduleTable />;
      case 'calendar':
        return <ResourceLibrary />
      case 'events':
        return <ActivitiesView />; 
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

            {/* Children Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: 'أحمد محمد', class: 'الصف الخامس أ', grade: '16/20', attendance: '96%', status: 'ممتاز' },
                { name: 'فاطمة محمد', class: 'الصف الثالث ب', grade: '17/20', attendance: '94%', status: 'ممتاز' }
              ].map((child, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{child.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{child.class}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">المعدل العام</p>
                      <p className="text-xl font-bold text-green-600">{child.grade}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">الحضور</p>
                      <p className="text-xl font-bold text-blue-600">{child.attendance}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">الحالة الأكاديمية</span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                      {child.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Updates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">آخر التحديثات</h3>
                <div className="space-y-4">
                  {[
                    { type: 'grade', message: 'درجة جديدة في الرياضيات - أحمد', time: 'منذ ساعة', child: 'أحمد' },
                    { type: 'message', message: 'رسالة من الأستاذة سارة', time: 'منذ 2 ساعة', child: 'فاطمة' },
                    { type: 'announcement', message: 'إعلان: موعد الامتحانات', time: 'منذ يوم', child: 'عام' }
                  ].map((update, index) => (
                    <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        update.type === 'grade' ? 'bg-green-100 dark:bg-green-900' :
                        update.type === 'message' ? 'bg-blue-100 dark:bg-blue-900' :
                        'bg-orange-100 dark:bg-orange-900'
                      }`}>
                        {update.type === 'grade' ? (
                          <FileText className="h-4 w-4 text-green-600" />
                        ) : update.type === 'message' ? (
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <GraduationCap className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{update.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{update.child}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{update.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">المهام المطلوبة</h3>
                <div className="space-y-3">
                  {[
                    { task: 'مراجعة درجات أحمد في الرياضيات', priority: 'عادي', dueDate: 'اليوم' },
                    { task: 'الرد على رسالة الأستاذة سارة', priority: 'مهم', dueDate: 'غداً' },
                    { task: 'تبرير غياب فاطمة يوم الثلاثاء', priority: 'عاجل', dueDate: 'منتهي الصلاحية' }
                  ].map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'عاجل' ? 'bg-red-500' :
                          task.priority === 'مهم' ? 'bg-orange-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{task.task}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{task.dueDate}</p>
                        </div>
                      </div>
                      <Clock className="h-4 w-4 text-gray-400" />
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
      title="لوحة تحكم ولي الأمر"
      subtitle="مرحباً بك، هنا يمكنك متابعة تقدم أطفالك الأكاديمي"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default ParentDashboard;