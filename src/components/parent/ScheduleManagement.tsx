import React, { useState } from 'react';
import { Calendar, Edit, Trash2, Plus, Search, Eye, Upload } from 'lucide-react';

interface ScheduleItem {
  id: string;
  childName: string; // e.g., "أحمد محمد علي"
  className: string; // e.g., "الصف الخامس أ"
  pdfUrl: string | null; // URL or base64 of the uploaded PDF
  uploadedAt: string; // Timestamp of upload
}

const ScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { id: 's1', childName: 'أحمد محمد علي', className: 'الصف الخامس أ', pdfUrl: null, uploadedAt: '' },
    { id: 's2', childName: 'فاطمة محمد علي', className: 'الصف الثالث ب', pdfUrl: null, uploadedAt: '' },
  ]);
  const [newSchedule, setNewSchedule] = useState<Omit<ScheduleItem, 'id' | 'uploadedAt'>>({ childName: '', className: '', pdfUrl: null });
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Predefined children for selection (aligned with other components)
  const children = [
    { id: 'child1', name: 'أحمد محمد علي', className: 'الصف الخامس أ' },
    { id: 'child2', name: 'فاطمة محمد علي', className: 'الصف الثالث ب' },
  ];

  const handleFileUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('يرجى رفع ملف بصيغة PDF فقط');
      return;
    }

    // Convert file to base64 for storage (simulating upload)
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const uploadedAt = new Date().toISOString();

      if (editingSchedule) {
        // Update existing schedule
        setSchedules(
          schedules.map((sch) =>
            sch.id === editingSchedule.id ? { ...sch, pdfUrl: base64String, uploadedAt } : sch
          )
        );
      } else {
        // Add new schedule
        const newId = `s${schedules.length + 1}`;
        setSchedules([
          ...schedules,
          { ...newSchedule, id: newId, pdfUrl: base64String, uploadedAt },
        ]);
      }

      // Reset modal state
      setShowUploadModal(false);
      setEditingSchedule(null);
      setNewSchedule({ childName: '', className: '', pdfUrl: null });
      setSelectedFile(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEditSchedule = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setNewSchedule({ childName: schedule.childName, className: schedule.className, pdfUrl: schedule.pdfUrl });
    setShowUploadModal(true);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الجدول؟')) {
      setSchedules(schedules.filter((sch) => sch.id !== id));
    }
  };

  const handleViewSchedule = (pdfUrl: string | null) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      alert('لا يوجد ملف جدول مرفوع لهذا الفصل');
    }
  };

  const filteredSchedules = schedules.filter(
    (sch) =>
      sch.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">جدول التوقيت</h2>
        
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن الطفل أو الفصل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">جداول الأطفال</h3>
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد جداول متاحة. يرجى إضافة جدول جديد.</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">اسم الطفل</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">الفصل</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">حالة الرفع</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">تاريخ الرفع</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">{schedule.childName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">{schedule.className}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                      {schedule.pdfUrl ? (
                        <span className="text-green-600">تم الرفع</span>
                      ) : (
                        <span className="text-red-600">لم يتم الرفع</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      {schedule.uploadedAt ? new Date(schedule.uploadedAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleViewSchedule(schedule.pdfUrl)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          disabled={!schedule.pdfUrl}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Upload className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;