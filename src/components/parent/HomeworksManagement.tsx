import React, { useState } from 'react';
import { FileText, Download, Search } from 'lucide-react';

interface ScheduleItem {
  id: string;
  childName: string; // e.g., "أحمد محمد علي"
  className: string; // e.g., "الصف الخامس أ"
  type: 'homework' | 'exam'; // Type of schedule
  subject: string; // e.g., "الرياضيات"
  dueDate: string; // e.g., "2024-01-20"
  pdfUrl: string; // URL to the PDF
}

const ParentScheduleTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data with schedules for each child
  const schedules: ScheduleItem[] = [
    {
      id: '1',
      childName: 'أحمد محمد علي',
      className: 'الصف الخامس أ',
      type: 'homework',
      subject: 'الرياضيات',
      dueDate: '2024-01-20',
      pdfUrl: '/path/to/ahmed_homework_math.pdf',
    },
    {
      id: '2',
      childName: 'أحمد محمد علي',
      className: 'الصف الخامس أ',
      type: 'exam',
      subject: 'العلوم',
      dueDate: '2024-01-25',
      pdfUrl: '/path/to/ahmed_exam_science.pdf',
    },
    {
      id: '3',
      childName: 'فاطمة محمد علي',
      className: 'الصف الثالث ب',
      type: 'homework',
      subject: 'اللغة العربية',
      dueDate: '2024-01-22',
      pdfUrl: '/path/to/fatima_homework_arabic.pdf',
    },
    {
      id: '4',
      childName: 'فاطمة محمد علي',
      className: 'الصف الثالث ب',
      type: 'exam',
      subject: 'التاريخ',
      dueDate: '2024-01-28',
      pdfUrl: '/path/to/fatima_exam_history.pdf',
    },
  ];

  // Filter schedules based on search term
  const filteredSchedules = schedules.filter(
    (sch) =>
      sch.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group schedules by childName for display
  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.childName]) {
      acc[schedule.childName] = [];
    }
    acc[schedule.childName].push(schedule);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const handleDownload = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">جدول الواجبات والاختبارات</h2>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="البحث عن الطفل، الفصل، المادة، أو النوع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Schedule Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">جداول الأطفال</h3>
          {Object.keys(groupedSchedules).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد جداول متاحة.</p>
            </div>
          ) : (
            Object.entries(groupedSchedules).map(([childName, childSchedules]) => (
              <div key={childName} className="mb-6">
                <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">{childName}</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">الفصل</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">النوع</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">المادة</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">تاريخ التسليم</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">تحميل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {childSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">{schedule.className}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {schedule.type === 'homework' ? 'واجب منزلي' : 'اختبار'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">{schedule.subject}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">{schedule.dueDate}</td>
                        <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => handleDownload(schedule.pdfUrl)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentScheduleTable;