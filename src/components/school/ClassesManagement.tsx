import React, { useState } from 'react';
import { Layers, Edit, Trash2, Plus, FileText, X, Search } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  students: number;
  teachersPdf: { url: string; name: string } | null;
}

const ClassesManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([
    { id: '1a', name: 'الصف الأول - أ', students: 25, teachersPdf: null },
    { id: '1b', name: 'الصف الأول - ب', students: 23, teachersPdf: null },
    { id: '2a', name: 'الصف الثاني - أ', students: 27, teachersPdf: null },
    { id: '2b', name: 'الصف الثاني - ب', students: 20, teachersPdf: null },
    { id: '3a', name: 'الصف الثالث - أ', students: 22, teachersPdf: null },
    { id: '3b', name: 'الصف الثالث - ب', students: 24, teachersPdf: null },
    { id: '4a', name: 'الصف الرابع - أ', students: 26, teachersPdf: null },
    { id: '4b', name: 'الصف الرابع - ب', students: 21, teachersPdf: null },
  ]);
  const [newClass, setNewClass] = useState({ name: '', students: 0, teachersPdf: null as { url: string; name: string } | null });
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddClass = () => {
    if (newClass.name && newClass.students >= 0) {
      setClasses([...classes, { id: `new-${Date.now()}`, ...newClass }]);
      setNewClass({ name: '', students: 0, teachersPdf: null });
      setShowAddModal(false);
    }
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setNewClass({ name: cls.name, students: cls.students, teachersPdf: cls.teachersPdf });
    setShowAddModal(true);
  };

  const handleUpdateClass = () => {
    if (editingClass && newClass.name && newClass.students >= 0) {
      setClasses(classes.map(cls => cls.id === editingClass.id ? { ...cls, ...newClass } : cls));
      setEditingClass(null);
      setNewClass({ name: '', students: 0, teachersPdf: null });
      setShowAddModal(false);
    }
  };

  const handleDeleteClass = (id: string) => {
    setClasses(classes.filter(cls => cls.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setClasses(classes.map(cls => cls.id === id ? { ...cls, teachersPdf: { url, name: file.name } } : cls));
    }
  };

  const handleRemovePdf = (id: string) => {
    setClasses(classes.map(cls => cls.id === id ? { ...cls, teachersPdf: null } : cls));
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.students.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الصفوف</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة صف</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن الصفوف أو عدد الطلاب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  عدد الطلاب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  قائمة المعلمين
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{cls.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{cls.students}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cls.teachersPdf ? (
                      <div className="flex items-center space-x-2 justify-end rtl:space-x-reverse">
                        <a href={cls.teachersPdf.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          {cls.teachersPdf.name}
                        </a>
                        <button onClick={() => handleRemovePdf(cls.id)} className="text-red-400 hover:text-red-300">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleFileUpload(e, cls.id)}
                          className="hidden"
                          id={`pdfUpload-${cls.id}`}
                        />
                        <label htmlFor={`pdfUpload-${cls.id}`} className="flex items-center justify-center w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition duration-200 text-sm">
                          <Plus className="h-4 w-4 mr-1" />
                          رفع ملف
                        </label>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button onClick={() => handleEditClass(cls)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteClass(cls.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editingClass ? 'تعديل الصف' : 'إضافة صف جديد'}</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الصف
                </label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم الصف (مثل: الصف الأول - أ)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  عدد الطلاب
                </label>
                <input
                  type="number"
                  value={newClass.students}
                  onChange={(e) => setNewClass({ ...newClass, students: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="عدد الطلاب"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  قائمة المعلمين (PDF)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e, editingClass?.id || `new-${Date.now()}`)}
                    className="hidden"
                    id="pdfUploadModal"
                  />
                  <label htmlFor="pdfUploadModal" className="flex items-center justify-center w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition duration-200 text-sm">
                    <Plus className="h-4 w-4 mr-1" />
                    رفع ملف PDF
                  </label>
                </div>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => { setShowAddModal(false); setEditingClass(null); setNewClass({ name: '', students: 0, teachersPdf: null }); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={editingClass ? handleUpdateClass : handleAddClass}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingClass ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesManagement;