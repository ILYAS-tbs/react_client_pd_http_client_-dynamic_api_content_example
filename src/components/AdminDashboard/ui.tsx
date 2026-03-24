import React from "react";
import { Loader, AlertCircle } from "lucide-react";

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
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
      <div className="h-5 w-5 rounded-full bg-green-600 dark:bg-green-400 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs">✓</span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
        >
          ✕
        </button>
      )}
    </div>
  );
};
