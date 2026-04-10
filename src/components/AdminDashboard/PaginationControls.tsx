import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  const { language } = useLanguage();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);
  const canGoPrev = currentPage > 1 && !isLoading;
  const canGoNext = currentPage < totalPages && !isLoading;

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center sm:gap-4">
        <span>
          {getTranslation("admin.showing", language)} {start}-{end} {getTranslation("admin.of", language)} {totalCount}
        </span>
        <label className="flex items-center gap-2">
          <span>{getTranslation("admin.perPage", language)}</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            {[10, 15, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getTranslation("admin.page", language)} {currentPage} {getTranslation("admin.of", language)} {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrev}
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
