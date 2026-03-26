import React from "react";
import { Loader, AlertCircle, AlertTriangle } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader className={`${sizeClasses[size]} animate-spin text-primary-500`} />
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );
};

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          ✕
        </button>
      )}
    </div>
  );
};

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 flex items-start gap-3">
      <div className="h-5 w-5 rounded-full bg-primary-600 dark:bg-primary-400 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs">✓</span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-primary-600 dark:text-primary-400">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-primary-600 dark:text-primary-400 hover:bg-primary-300"
        >
          ✕
        </button>
      )}
    </div>
  );
};

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmClassName = "bg-red-600 hover:bg-red-700 text-white",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${confirmClassName}`}
            >
              {isLoading ? "..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600">
      {icon && <div className="mb-3 opacity-50">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  );
};
