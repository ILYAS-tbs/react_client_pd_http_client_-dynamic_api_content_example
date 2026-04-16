import { ExternalLink, FileImage, FileText, Paperclip } from "lucide-react";

import { getFileNameFromPath, isImageFile, isPdfFile } from "../../utils/fileUploads";

type FilePreviewProps = {
  url: string;
  filename?: string | null;
  compact?: boolean;
};

export function FilePreview({ url, filename, compact = false }: FilePreviewProps) {
  const resolvedName = filename || getFileNameFromPath(url) || "attachment";

  if (isImageFile(filename || url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3">
        <img
          src={url}
          alt={resolvedName}
          className={compact
            ? "h-16 w-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
            : "max-h-56 w-full rounded-2xl object-cover border border-gray-200 dark:border-gray-700"
          }
        />
        {!compact ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-300">
            <FileImage className="h-4 w-4" />
            {resolvedName}
          </span>
        ) : null}
      </a>
    );
  }

  if (isPdfFile(filename || url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={compact
          ? "inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          : "inline-flex max-w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        }
      >
        <FileText className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{resolvedName}</span>
        <ExternalLink className="h-4 w-4 flex-shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={compact
        ? "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        : "inline-flex max-w-full items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      }
    >
      <Paperclip className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{resolvedName}</span>
      <ExternalLink className="h-4 w-4 flex-shrink-0" />
    </a>
  );
}
