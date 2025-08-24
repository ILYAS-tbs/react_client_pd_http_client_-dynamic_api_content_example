import React, { useState } from 'react';
import { FileText, Video, BookOpen, Download, Eye, Search, Tag } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  type: string;
  format: string;
  size: string;
  uploadDate: string;
  downloads: number;
  classes: string[];
  description: string;
  price: number | null; // null for free, number for paid
  originalPrice?: number; // for promotions
}

const ResourceLibrary: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const resourceTypes = [
    { value: 'all', label: 'الكل', icon: FileText },
    { value: 'document', label: 'مستندات', icon: FileText },
    { value: 'video', label: 'دورات فيديو', icon: Video },
    { value: 'book', label: 'كتب', icon: BookOpen },
  ];

  const resources: Resource[] = [
    {
      id: 1,
      title: 'شرح الكسور العادية',
      type: 'document',
      format: 'PDF',
      size: '2.5 MB',
      uploadDate: '2024-01-15',
      downloads: 45,
      classes: ['5أ', '5ب'],
      description: 'شرح مفصل لدرس الكسور العادية مع أمثلة تطبيقية للطلاب في الصف الخامس.',
      price: null, // Free
    },
    {
      id: 2,
      title: 'دورة حل المعادلات',
      type: 'video',
      format: 'MP4',
      size: '125 MB',
      uploadDate: '2024-01-12',
      downloads: 32,
      classes: ['6أ'],
      description: 'دورة فيديو تعليمية لشرح طرق حل المعادلات البسيطة مع تمارين تفاعلية.',
      price: 1750, // Paid (50 SAR * 35 = 1750 DZD)
      originalPrice: 2625, // (75 SAR * 35 = 2625 DZD)
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
      description: 'مجموعة شاملة من التمارين المحلولة في الرياضيات لدعم المنهج الدراسي.',
      price: null, // Free
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
      description: 'ورقة عمل تفاعلية لدرس الأشكال الهندسية مع أسئلة متنوعة.',
      price: 700, // Paid (20 SAR * 35 = 700 DZD)
    },
  ];

  const filteredResources = resources.filter(
    (resource) =>
      (selectedType === 'all' || resource.type === selectedType) &&
      (resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.classes.some((cls) => cls.includes(searchTerm)))
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

  const handleAction = (resource: Resource) => {
    if (resource.price === null) {
      console.log(`Downloading free resource: ${resource.title}`);
      // Implement download logic
    } else {
      console.log(`Initiating purchase for: ${resource.title} at ${resource.price} DZD`);
      // Implement payment logic
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">المكتبة التعليمية</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {resourceTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="البحث عن عنوان، وصف، أو فصل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد مواد تعليمية</h3>
          <p className="text-gray-600 dark:text-gray-400">لم يتم العثور على مواد تطابق معايير البحث</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <div
                key={resource.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
              >
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
                    <span className="text-gray-600 dark:text-gray-400">الفصول:</span>
                    <span className="text-gray-900 dark:text-white">{resource.classes.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">السعر:</span>
                    <span className="text-gray-900 dark:text-white flex items-center">
                      {resource.price === null ? (
                        'مجاني'
                      ) : (
                        <>
                          {resource.originalPrice && (
                            <span className="text-red-600 line-through ml-2">
                              {resource.originalPrice} دج
                            </span>
                          )}
                          {resource.price} دج
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => setSelectedResource(resource)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAction(resource)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(resource.type)}`}>
                    {resourceTypes.find((t) => t.value === resource.type)?.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resource Details Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تفاصيل المادة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">العنوان</label>
                <p className="text-gray-900 dark:text-white">{selectedResource.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">النوع</label>
                <p className="text-gray-900 dark:text-white">
                  {resourceTypes.find((t) => t.value === selectedResource.type)?.label}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الصيغة</label>
                <p className="text-gray-900 dark:text-white">{selectedResource.format}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الحجم</label>
                <p className="text-gray-900 dark:text-white">{selectedResource.size}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الفصول</label>
                <p className="text-gray-900 dark:text-white">{selectedResource.classes.join(', ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">السعر</label>
                <p className="text-gray-900 dark:text-white flex items-center">
                  {selectedResource.price === null ? (
                    'مجاني'
                  ) : (
                    <>
                      {selectedResource.originalPrice && (
                        <span className="text-red-600 line-through ml-2">
                          {selectedResource.originalPrice} دج
                        </span>
                      )}
                      {selectedResource.price} دج
                    </>
                  )}
                  {selectedResource.originalPrice && (
                    <Tag className="h-4 w-4 text-green-600 mr-2" />
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
                <p className="text-gray-600 dark:text-gray-400">{selectedResource.description}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  handleAction(selectedResource);
                  setSelectedResource(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {selectedResource.price === null ? 'تحميل' : 'شراء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;