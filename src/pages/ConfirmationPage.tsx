import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Mail, RefreshCw, X } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { getCSRFToken } from "../lib/get_CSRFToken";
import { auth_http_client } from "../services/http_api/auth/auth_http_client";
import { VefiryEmailPayload } from "../services/http_api/payloads_types/school_client_payload_types";

interface ConfirmationCodeProps {
  isOpen?: boolean;
  onClose?: () => void;
  email?: string;
}

const ConfirmationCode: React.FC<ConfirmationCodeProps> = ({ isOpen = true, onClose, email }) => {
  const { user, refreshVerificationStatus } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const currentEmail = email || user?.email || "";

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = window.setTimeout(() => setTimeLeft((current) => current - 1), 1000);
      return () => window.clearTimeout(timer);
    }

    if (!canResend) {
      setCanResend(true);
    }

    return undefined;
  }, [timeLeft, canResend]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const startCooldown = (seconds?: number) => {
    const nextValue = Math.max(0, Number(seconds) || 0);
    setTimeLeft(nextValue);
    setCanResend(nextValue === 0);
  };

  const resetOtpInput = () => {
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1 || !/^[0-9]*$/.test(value)) {
      return;
    }

    const nextCode = [...code];
    nextCode[index] = value;
    setCode(nextCode);
    setError("");
    setSuccess("");

    if (value && index < nextCode.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && nextCode.every((digit) => digit !== "")) {
      window.setTimeout(() => {
        void handleSubmit(nextCode.join(""));
      }, 100);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedValue.length !== 6) {
      return;
    }

    setCode(pastedValue.split(""));
    setError("");
    setSuccess("");
    window.setTimeout(() => {
      void handleSubmit(pastedValue);
    }, 100);
  };

  const handleSubmit = async (submittedCode?: string) => {
    const finalCode = submittedCode || code.join("");
    if (finalCode.length !== 6) {
      setError(t("incompleteCode") || "Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const csrfToken = getCSRFToken()!;
      const payload: VefiryEmailPayload = { key: finalCode };
      const response = await auth_http_client.verify_email(payload, csrfToken);

      if (!response.ok) {
        setError(response.data?.detail || t("invalidCode") || "Invalid or expired code. Please try again.");
        resetOtpInput();
        return;
      }

      setSuccess(t("emailConfirmed") || "Email confirmed successfully!");
      await refreshVerificationStatus();
      window.setTimeout(() => {
        if (user?.role) {
          navigate(`/${user.role}-dashboard`);
        } else {
          navigate("/login");
        }
        onClose?.();
      }, 1200);
    } catch {
      setError(t("invalidCode") || "Invalid or expired code. Please try again.");
      resetOtpInput();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isResending) {
      return;
    }

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const csrfToken = getCSRFToken()!;
      const response = await auth_http_client.resend_otp(csrfToken);

      if (response.ok) {
        setSuccess(t("codeResent") || "A new confirmation code has been sent to your email");
        setToast(t("newOtpSent") || "New OTP sent.");
        startCooldown(response.data?.cooldown);
        resetOtpInput();
        return;
      }

      if (response.status === 429) {
        setError(response.data?.detail || t("waitBeforeAnotherOtp") || "Please wait before requesting another OTP.");
        startCooldown(response.data?.cooldown_remaining);
        return;
      }

      setError(response.data?.detail || t("resendFailed") || "Failed to resend code. Please try again.");
    } catch {
      setError(t("resendFailed") || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {toast && (
        <div className="fixed top-5 right-5 z-[10000] rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img
              src="/assets/pedaconnect-removebg.png"
              alt="Platform Logo"
              className="w-14 h-14 object-contain rounded-lg"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('verifyYourEmail') || 'Verify Your Email'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('confirmEmailSlogan') || 'تحقق من حسابك'}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="text-gray-600 dark:text-white" size={20} />
            </button>
          )}
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Email Icon and Message */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-900 dark:text-white font-medium">
                {t('checkYourEmail') || 'تحقق من بريدك الإلكتروني'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('confirmationCodeSent') || 'لقد أرسلنا رمز تأكيد مكون من 6 أرقام إلى'}
              </p>
              <p className="text-sm font-medium text-primary-500">
                {currentEmail || 'عنوان بريدك الإلكتروني'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('checkSpamIfNotReceived') || 'Check spam if not received.'}
              </p>
            </div>
          </div>

          {/* Code Input */}
          <div className="space-y-4">
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 text-center`}>
              {t('enterConfirmationCode') || 'أدخل رمز التأكيد'}
            </label>
            <div className="flex justify-center space-x-2 rtl:space-x-reverse" dir='ltr'>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Timer and Resend */}
          <div className="text-center space-y-3">
            {!canResend ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('resendAvailableIn') || 'Resend available in'} {timeLeft}s
              </p>
            ) : (
              <button
                onClick={() => {
                  void handleResendCode();
                }}
                disabled={isResending}
                className="text-sm text-primary-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 rtl:space-x-reverse mx-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {isResending
                    ? (t('resending') || 'جاري الإرسال...')
                    : (t('resendCode') || 'إعادة إرسال الرمز')
                  }
                </span>
              </button>
            )}
          </div>

          {/* Manual Submit Button (for accessibility) */}
          <button
            onClick={() => {
              void handleSubmit();
            }}
            disabled={isLoading || code.some(digit => digit === '')}
            className={`w-full py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('verifying') || 'جاري التحقق...'}</span>
              </div>
            ) : (
              t('verifyCode') || 'تأكيد الرمز'
            )}
          </button>

          {/* Back to Login Link */}
          <div className={`text-center text-sm text-gray-600 dark:text-gray-400`}>
            {t('wrongEmail') || 'بريد إلكتروني خاطئ؟'}{' '}
            <Link
              to="/login"
              className="text-primary-500 hover:underline"
            >
              {t('backToLogin') || 'العودة لتسجيل الدخول'}
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ConfirmationCode;
