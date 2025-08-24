import React, { useState } from 'react';
import { Upload, FileText, Video, BookOpen, Download, Eye, Trash2, Plus } from 'lucide-react';

const ResourceManager: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const resourceTypes = [
    { value: 'all', label: 'الكل', icon: FileText },
    { value: 'document', label: 'مستندات', icon: FileText },
    { value: 'video', label: 'فيديوهات', icon: Video },
    { value: 'book', label: 'كتب', icon: BookOpen }
  ];

  const resources = [
    {
      id: 1,
      title: 'شرح الكسور العادية',
      type: 'document',
      format: 'PDF',
      size: '2.5 MB',
      uploadDate: '2024-01-15',
      downloads: 45,
      classes: ['5أ', '5ب'],
      description: 'شرح مفصل لدرس الكسور العادية مع أمثلة تطبيقية'
    },
    {
      id: 2,
      title: 'فيديو: حل المعادلات',
      type: 'video',
      format: 'MP4',
      size: '125 MB',
      uploadDate: '2024-01-12',
      downloads: 32,
      classes: ['6أ'],
      description: 'فيديو تعليمي لشرح طرق حل المعادلات البسيطة'
    },
    {
      id: 3,
      title: 'كتاب التمارين المحلولة',
      type: 'book',
      format: 'PDF',
      size: '8.2 MB',
      uploadDate: '2024-01-10',
      downloads: 78,
      classes: ['4أ', '5أ', '6أ'],
      description: 'مجموعة شاملة من التمارين المحلولة في الرياضيات'
    },
    {
      id: 4,
      title: 'ورقة عمل: الهندسة',
      type: 'document',
      format: 'DOCX',
      size: '1.8 MB',
      uploadDate: '2024-01-08',
      downloads: 23,
      classes: ['5أ'],
      description: 'ورقة عمل تفاعلية لدرس الأشكال الهندسية'
    }
  ];

  const filteredResources = resources.filter(resource => 
    selectedType === 'all' || resource.type === selectedType
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'book':
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'book':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">المواد التعليمية</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          <span>رفع مادة جديدة</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {resourceTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                selectedType === type.value
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <type.icon className="h-4 w-4" />
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const TypeIcon = getTypeIcon(resource.type);
          return (
            <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}>
                    <TypeIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {resource.format} • {resource.size}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {resource.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">تاريخ الرفع:</span>
                  <span className="text-gray-900 dark:text-white">{resource.uploadDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">التحميلات:</span>
                  <span className="text-gray-900 dark:text-white">{resource.downloads}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">الفصول:</span>
                  <span className="text-gray-900 dark:text-white">{resource.classes.join(', ')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(resource.type)}`}>
                  {resourceTypes.find(t => t.value === resource.type)?.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">رفع مادة تعليمية جديدة</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  عنوان المادة
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="عنوان المادة التعليمية"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  نوع المادة
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="document">مستند</option>
                  <option value="video">فيديو</option>
                  <option value="book">كتاب</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الفصول المستهدفة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['4أ', '5أ', '5ب', '6أ'].map((cls) => (
                    <label key={cls} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cls}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  وصف المادة
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="وصف مختصر للمادة التعليمية..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رفع الملف
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    اسحب الملف هنا أو انقر للاختيار
                  </p>
                  <input type="file" className="hidden" />
                </div>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                رفع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;