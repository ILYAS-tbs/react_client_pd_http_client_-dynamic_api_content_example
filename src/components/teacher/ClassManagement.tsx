import React, { useState } from 'react';
import { Users, BookOpen, Calendar, Plus, Eye, Edit } from 'lucide-react';

const ClassManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('5أ');

  const classes = [
    {
      id: '5أ',
      name: 'الصف الخامس أ',
      subject: 'الرياضيات',
      students: 32,
      schedule: [
        { day: 'الأحد', time: '08:00 - 08:45' },
        { day: 'الثلاثاء', time: '09:30 - 10:15' },
        { day: 'الخميس', time: '08:00 - 08:45' }
      ],
      recentGrades: '16.5/20',
      attendance: '94%'
    },
    {
      id: '4أ',
      name: 'الصف الرابع أ',
      subject: 'الرياضيات',
      students: 28,
      schedule: [
        { day: 'الاثنين', time: '08:45 - 09:30' },
        { day: 'الأربعاء', time: '10:15 - 11:00' }
      ],
      recentGrades: '15.8/20',
      attendance: '96%'
    },
    {
      id: '6أ',
      name: 'الصف السادس أ',
      subject: 'الرياضيات',
      students: 30,
      schedule: [
        { day: 'الاثنين', time: '10:15 - 11:00' },
        { day: 'الأربعاء', time: '08:00 - 08:45' },
        { day: 'الجمعة', time: '08:45 - 09:30' }
      ],
      recentGrades: '17.2/20',
      attendance: '92%'
    }
  ];

  const students = [
    { id: 1, name: 'أحمد محمد علي', lastGrade: '18/20', attendance: '95%', status: 'ممتاز' },
    { id: 2, name: 'فاطمة حسن', lastGrade: '16/20', attendance: '98%', status: 'جيد جداً' },
    { id: 3, name: 'عمر السعيد', lastGrade: '15/20', attendance: '92%', status: 'جيد' },
    { id: 4, name: 'زينب العلي', lastGrade: '19/20', attendance: '97%', status: 'ممتاز' },
    { id: 5, name: 'يوسف الأمين', lastGrade: '14/20', attendance: '89%', status: 'مقبول' }
  ];

  const currentClass = classes.find(c => c.id === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الفصول</h2>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Overview */}
      {currentClass && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{currentClass.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentClass.subject}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">عدد الطلاب:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{currentClass.students}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">متوسط الدرجات:</span>
                <span className="text-sm font-medium text-green-600">{currentClass.recentGrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">معدل الحضور:</span>
                <span className="text-sm font-medium text-blue-600">{currentClass.attendance}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">الجدول الأسبوعي</h3>
            </div>
            <div className="space-y-2">
              {currentClass.schedule.map((session, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{session.day}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{session.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">إجراءات سريعة</h3>
            </div>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-2 rtl:space-x-reverse p-2 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
                <Plus className="h-4 w-4" />
                <span>إضافة درجة</span>
              </button>
              <button className="w-full flex items-center space-x-2 rtl:space-x-reverse p-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                <Edit className="h-4 w-4" />
                <span>تسجيل الحضور</span>
              </button>
              <button className="w-full flex items-center space-x-2 rtl:space-x-reverse p-2 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
                <Eye className="h-4 w-4" />
                <span>عرض التقارير</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            طلاب {currentClass?.name}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الطالب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  آخر درجة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحضور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {student.lastGrade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {student.attendance}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'ممتاز' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      student.status === 'جيد جداً' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                      student.status === 'جيد' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;