import React, { useEffect, useMemo, useState } from "react";

import { Upload } from "lucide-react";

import { useLanguage } from "../../contexts/LanguageContext";
import type { Schedule, ScheduleType } from "../../models/Schedule";
import { getTranslation } from "../../utils/translations";
import { isAllowedSchoolUpload, SCHOOL_FILE_ACCEPT } from "../../utils/fileUploads";
import { FilePreview } from "./file_preview";

type ClassOption = {
  id: string;
  name: string;
};

type ScheduleUploadModalProps = {
  isOpen: boolean;
  scheduleType: Extract<ScheduleType, "devoir" | "exam">;
  schedule: Schedule | null;
  defaultClassGroupId?: string;
  classOptions: ClassOption[];
  onClose: () => void;
  onSubmit: (payload: { classGroupId: string; title: string; file: File | null }) => Promise<void> | void;
};

const ScheduleUploadModal: React.FC<ScheduleUploadModalProps> = ({
  isOpen,
  scheduleType,
  schedule,
  defaultClassGroupId = "",
  classOptions,
  onClose,
  onSubmit,
}) => {
  const { language } = useLanguage();
  const [classGroupId, setClassGroupId] = useState(defaultClassGroupId);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setClassGroupId(schedule?.class_group_info?.class_group_id ?? defaultClassGroupId);
    setTitle(schedule?.title ?? "");
    setSelectedFile(null);
    setFileError(null);
    setSubmitting(false);
  }, [defaultClassGroupId, isOpen, schedule]);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      return;
    }

    if (!isAllowedSchoolUpload(file)) {
      setSelectedFile(null);
      setFileError(getTranslation("pdfOrImageOnlyError", language));
      return;
    }

    setSelectedFile(file);
    setFileError(null);
  };

  const handleSubmit = async () => {
    if (!classGroupId) return;
    if (!schedule && !selectedFile) return;

    setSubmitting(true);
    try {
      await onSubmit({
        classGroupId,
        title,
        file: selectedFile,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900" dir="rtl">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {schedule ? getTranslation("editScheduleFile", language) : getTranslation("uploadScheduleFile", language)}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {getTranslation(scheduleType, language)}
          </p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {getTranslation("scheduleType", language)}
            </label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {getTranslation(scheduleType, language)}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {getTranslation("className", language)}
            </label>
            <select
              value={classGroupId}
              onChange={(event) => setClassGroupId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-primary-900"
            >
              <option value="">{getTranslation("selectClass", language)}</option>
              {classOptions.map((classOption) => (
                <option key={classOption.id} value={classOption.id}>
                  {classOption.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {getTranslation("title", language)}
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={getTranslation("scheduleTitlePlaceholder", language)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-primary-900"
            />
          </div>

          {schedule?.has_file && schedule.view_url ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {getTranslation("currentFile", language)}
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <FilePreview url={schedule.view_url} filename={schedule.file_name ?? schedule.schedule_file} />
              </div>
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {getTranslation("fileColumn", language)}
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600 transition hover:border-primary-300 hover:bg-primary-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-800 dark:hover:bg-primary-950/30">
              <Upload className="h-5 w-5" />
              <span>{getTranslation("pdfImagePreviewHint", language)}</span>
              <input
                type="file"
                accept={SCHOOL_FILE_ACCEPT}
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>

            {previewUrl && selectedFile ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <FilePreview url={previewUrl} filename={selectedFile.name} />
              </div>
            ) : null}

            {fileError ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fileError}</p>
            ) : null}
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {getTranslation("cancel", language)}
          </button>
          <button
            type="button"
            disabled={submitting || !classGroupId || (!schedule && !selectedFile)}
            onClick={handleSubmit}
            className="rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {schedule ? getTranslation("update", language) : getTranslation("upload", language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleUploadModal;