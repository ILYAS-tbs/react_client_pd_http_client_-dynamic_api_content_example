import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle, Mail, RefreshCw, X } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import { auth_http_client } from "../../services/http_api/auth/auth_http_client";
import { VefiryEmailPayload } from "../../services/http_api/payloads_types/school_client_payload_types";

const VerificationBanner: React.FC = () => {
  const { user, refreshVerificationStatus } = useAuth();
  const { t, isRTL } = useLanguage();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  if (!user || user.is_verified !== false) {
    return null;
  }

  const startCooldown = (seconds?: number) => {
    const nextValue = Math.max(0, Number(seconds) || 0);
    setTimeLeft(nextValue);
    setCanResend(nextValue === 0);
  };

  const resetOtpInput = () => {
    setOtpCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1 || !/^[0-9]*$/.test(value)) {
      return;
    }

    const nextCode = [...otpCode];
    nextCode[index] = value;
    setOtpCode(nextCode);
    setError("");

    if (value && index < nextCode.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && nextCode.every((digit) => digit !== "")) {
      window.setTimeout(() => {
        void handleVerify(nextCode.join(""));
      }, 100);
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedValue.length !== 6) {
      return;
    }

    setOtpCode(pastedValue.split(""));
    window.setTimeout(() => {
      void handleVerify(pastedValue);
    }, 100);
  };

  const handleVerify = async (codeStr?: string) => {
    const finalCode = codeStr || otpCode.join("");
    if (finalCode.length !== 6) {
      setError(t("incompleteCode") || "Please enter the complete 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const csrfToken = getCSRFToken()!;
      const payload: VefiryEmailPayload = { key: finalCode };
      const response = await auth_http_client.verify_email(payload, csrfToken);

      if (!response.ok) {
        setError(response.data?.detail || t("invalidCode") || "Invalid or expired code. Please try again.");
        resetOtpInput();
        return;
      }

      setSuccess(t("emailVerifiedLoginSuccess") || "Email verified successfully!");
      await refreshVerificationStatus();
      window.setTimeout(() => {
        setShowOtpModal(false);
        window.location.reload();
      }, 1200);
    } catch {
      setError(t("invalidCode") || "Invalid or expired code. Please try again.");
      resetOtpInput();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
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
        setSuccess(t("codeResent") || "A new code has been sent to your email");
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

      setError(response.data?.detail || t("resendFailed") || "Failed to resend code.");
    } catch {
      setError(t("resendFailed") || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const openVerifyModal = () => {
    setShowOtpModal(true);
    setError("");
    setSuccess("");
    resetOtpInput();
  };

  return (
    <>
      {toast && (
        <div className="fixed top-5 right-5 z-[10000] rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="bg-amber-500 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md z-50">
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            {t("accountNotVerifiedBanner") ||
              "Your account is not verified. Please check your email and enter the OTP code to activate your account."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openVerifyModal}
            className="px-4 py-1.5 bg-white text-amber-600 font-semibold text-sm rounded-lg hover:bg-amber-50 transition-colors"
          >
            {t("verifyNow") || "Verify Now"}
          </button>
          <button
            onClick={() => {
              void handleResend();
            }}
            disabled={!canResend || isResending}
            className="px-4 py-1.5 bg-amber-600 text-white font-semibold text-sm rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {isResending
              ? t("resending") || "Resending..."
              : t("resendCode") || "Resend OTP"}
          </button>
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 space-y-6">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-primary-500/10 rounded-full flex items-center justify-center">
                  <Mail className="w-7 h-7 text-primary-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("verifyYourEmail") || "Verify Your Email"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("confirmationCodeSent") || "We have sent a 6-digit code to"}{" "}
                <span className="font-medium text-primary-500">{user.email}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("checkSpamIfNotReceived") || "Check spam if not received."}
              </p>
            </div>

            <div className="flex justify-center gap-2" dir="ltr">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                />
              ))}
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                void handleVerify();
              }}
              disabled={isVerifying || otpCode.some((digit) => digit === "")}
              className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying
                ? t("verifying") || "Verifying..."
                : t("verifyCode") || "Verify code"}
            </button>

            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleResend();
                  }}
                  disabled={isResending}
                  className="inline-flex items-center gap-1 text-sm text-primary-500 hover:text-primary-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                  {isResending
                    ? t("resending") || "Resending..."
                    : t("resendCode") || "Resend code"}
                </button>
              ) : timeLeft > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("resendAvailableIn") || "Resend available in"} {timeLeft}s
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerificationBanner;
