import React, { useState } from "react";
import {
  Upload,
  FileText,
  Video,
  BookOpen,
  Download,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import { ResourceManagerProps } from "../../types";
import { TeacherUpload } from "../../models/TeacherUpload";
import { TeacherModuleClassGroup } from "../../models/TeacherModuleClassGroup";
import { teacher_dashboard_client } from "../../services/http_api/teacher-dashboard/teacher_dashboard_client";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { SERVER_BASE_URL } from "../../services/http_api/server_constants";
import { handleDownload } from "../../lib/download_script";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

const ResourceManager: React.FC<ResourceManagerProps> = ({
  modules_class_groups,
  teacher_uploads,
  setTeacherUploads,
}) => {

  //! Translations :
  const {language} = useLanguage()

  const [selectedType, setSelectedType] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const resourceTypes = [
    { value: "all", label: getTranslation('all',language), icon: FileText },
    { value: "document", label: getTranslation('Documents',language), icon: FileText },
    { value: "video", label: getTranslation('videos',language), icon: Video },
    { value: "book", label: getTranslation('books',language), icon: BookOpen },
  ];

  //? Mock Respousrce data
  // const resources = [
  //   {
  //     id: 1,
  //     title: "شرح الكسور العادية",
  //     type: "document",
  //     format: "PDF",
  //     size: "2.5 MB",
  //     uploadDate: "2024-01-15",
  //     downloads: 45,
  //     classes: ["5أ", "5ب"],
  //     description: "شرح مفصل لدرس الكسور العادية مع أمثلة تطبيقية",
  //   },
  //   {
  //     id: 2,
  //     title: "فيديو: حل المعادلات",
  //     type: "video",
  //     format: "MP4",
  //     size: "125 MB",
  //     uploadDate: "2024-01-12",
  //     downloads: 32,
  //     classes: ["6أ"],
  //     description: "فيديو تعليمي لشرح طرق حل المعادلات البسيطة",
  //   },
  //   {
  //     id: 3,
  //     title: "كتاب التمارين المحلولة",
  //     type: "book",
  //     format: "PDF",
  //     size: "8.2 MB",
  //     uploadDate: "2024-01-10",
  //     downloads: 78,
  //     classes: ["4أ", "5أ", "6أ"],
  //     description: "مجموعة شاملة من التمارين المحلولة في الرياضيات",
  //   },
  //   {
  //     id: 4,
  //     title: "ورقة عمل: الهندسة",
  //     type: "document",
  //     format: "DOCX",
  //     size: "1.8 MB",
  //     uploadDate: "2024-01-08",
  //     downloads: 23,
  //     classes: ["5أ"],
  //     description: "ورقة عمل تفاعلية لدرس الأشكال الهندسية",
  //   },
  // ];
  const fileTypeMap: Record<string, { type: string; format: string }> = {
    pdf: { type: "book", format: "PDF" },
    doc: { type: "document", format: "DOC" },
    docx: { type: "document", format: "DOCX" },
    ppt: { type: "document", format: "PPT" },
    pptx: { type: "document", format: "PPTX" },
    xls: { type: "document", format: "XLS" },
    xlsx: { type: "document", format: "XLSX" },
    mp4: { type: "video", format: "MP4" },
    avi: { type: "video", format: "AVI" },
    mkv: { type: "video", format: "MKV" },
    mov: { type: "video", format: "MOV" },
    epub: { type: "book", format: "EPUB" },
    mobi: { type: "book", format: "MOBI" },
    txt: { type: "document", format: "TXT" },
  };
  function getFileInfo(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    return (
      fileTypeMap[ext] || {
        type: "document",
        format: ext.toUpperCase() || "UNKNOWN",
      }
    );
  }

  const resources = teacher_uploads.map((upload: TeacherUpload) => {
    const fileInfo = getFileInfo(upload.upload_file || "");

    return {
      id: upload.pk,
      title: upload.title,
      type: fileInfo.type,
      upload_file: upload.upload_file,
      format: fileInfo.format,
      size: `${Number(upload.size).toFixed(1)} - ${upload.size_unit}`,
      uploadDate: new Date(upload.created_at.toString().split("T")[0]),
      downloads: 23,
      classes: upload.class_groups.map((cls) => cls.name),
      description: upload.description,
    };
  });

  const filteredResources = resources.filter(
    (resource) => selectedType === "all" || resource.type === selectedType
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "book":
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "book":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      default:
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    }
  };

  // Deduplicate class groups by id - to avoid duplicated in the upload modal
  const uniqueClassGroups = Array.from(
    new Map(
      modules_class_groups.map((cls) => [
        cls.class_group.class_group_id,
        cls.class_group,
      ])
    ).values()
  );

  // ! Teacher Upload
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [upload_file, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");

  const [selectedClassGroups, setSelectedClassGroups] = useState<string[]>([]);

  function showError(error_text: string) {
    setUploadError(error_text);
    setTimeout(() => {
      setUploadError("");
    }, 7000);
  }
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    if (!title) {
      // error - error ui
      showError("حقل العنوان مطلوب");
      return;
    }
    formData.append("title", title);

    if (!description) {
      // error - error ui for later
      showError("حقل الوصف مطلوب");

      return;
    }
    formData.append("description", description);

    if (!upload_file) {
      // error - error ui for later
      showError("حقل الملف مطلوب");

      return;
    }
    formData.append("upload_file", upload_file);

    if (!selectedClassGroups) {
      // error - error ui for later
      showError("الأقسام المستهدفة مطلوبة");

      return;
    }
    formData.append("class_groups", JSON.stringify(selectedClassGroups));

    console.log("handleUploadSubmit payload:");
    console.log(Object.fromEntries(formData.entries()));

    //! API CALL
    const latest_csrf = getCSRFToken()!;
    const post_upload_res =
      await teacher_dashboard_client.create_teacher_upload(
        formData,
        latest_csrf
      );

    if (!post_upload_res.ok) {
      return;
    }
    setShowUploadModal(false);
    // Refresh data
    const new_uploads_res =
      await teacher_dashboard_client.get_current_teacher_uploads();

    if (new_uploads_res.ok) {
      const new_uploads_list: TeacherUpload[] = new_uploads_res.data;
      setTeacherUploads(new_uploads_list);
    }
  };

  //! Delete Teacher upload
  const handleDeleteUpload = async (id: number) => {
    const latest_csrf = getCSRFToken()!;
    const delete_res = await teacher_dashboard_client.delete_teacher_upload(
      id,
      latest_csrf
    );

    // Refresh Data
    const uploads_res =
      await teacher_dashboard_client.get_current_teacher_uploads();

    if (uploads_res.ok) {
      const new_uploads_list: TeacherUpload[] = uploads_res.data;
      setTeacherUploads(new_uploads_list);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTranslation('educationalMaterials',language)}
        </h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          <span>{getTranslation('uploadNewMaterial',language)}</span>
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
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-500"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
            <div
              key={resource.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div
                    className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}
                  >
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
                  <span className="text-gray-600 dark:text-gray-400">
                    {getTranslation('uploadDate',language)} :
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {resource.uploadDate.toLocaleDateString("ar")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {getTranslation('downloads',language)}:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {resource.downloads}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {getTranslation('Classes',language)} :
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {resource.classes.join(", ")}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1">
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDownload(resource)}
                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteUpload(resource.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                    resource.type
                  )}`}
                >
                  {resourceTypes.find((t) => t.value === resource.type)?.label}
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {getTranslation('uploadNewMaterial',language)}
            </h3>

            <form className="space-y-4" onSubmit={handleUploadSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation('materialTitle',language)}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={getTranslation('educationalMaterialTitle',language)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation('materialType',language)}
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="document">{getTranslation('document',language)}</option>
                  <option value="video">{getTranslation('video',language)}</option>
                  <option value="book">{getTranslation('book',language)}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="class_groups"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {getTranslation('targetedClasses',language)}
                </label>

                <select
                  id="class_groups"
                  multiple
                  // value={selectedClassGroups} // state: array of selected ids
                  onChange={(e) =>
                    setSelectedClassGroups(
                      Array.from(e.target.selectedOptions, (opt) => opt.value)
                    )
                  }
                  className="w-full border border-gray-300 rounded-md p-2 h-40" // h-40 gives room for multiple
                >
                  {uniqueClassGroups.map((cls) => (
                    <option key={cls.class_group_id} value={cls.class_group_id}>
                      {cls.name}
                    </option>
                  ))}
                </select>

                {/* inspect the Selected IDs */}
                {/* <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <strong>المختارة:</strong>{" "}
                  {selectedClassGroups.length > 0
                    ? selectedClassGroups.join(", ")
                    : "لا شيء"}
                </div> */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 {getTranslation('materialDescription',language)}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={getTranslation('shortMaterialDescription',language)}
                />
              </div>

              <div>
                {/* Title */}
                <label
                  htmlFor="upload_file"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                 {getTranslation('uploadFile',language)}
                </label>

                {/* Clickable upload area */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer relative">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                   {getTranslation('dragOrClickToSelect',language)}
                  </p>

                  {/* Invisible file input overlay */}
                  <input
                    type="file"
                    onChange={(e) =>
                      setUploadFile(e.target.files ? e.target.files[0] : null)
                    }
                    name="upload_file"
                    id="upload_file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* ERROR UI */}
              {uploadError && (
                <div className="text text-red-500">{uploadError}</div>
              )}

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {getTranslation('cancel',language)}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {getTranslation('save',language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
