import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { auth_http_client } from "../services/http_api/auth/auth_http_client";
import { getCSRFToken } from "../lib/get_CSRFToken";
import { VefiryEmailPayload } from "../services/http_api/payloads_types/school_client_payload_types";

interface LoginProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Login: React.FC<LoginProps> = ({ isOpen = true, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const { login, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  // OTP verification state (shown when user has unverified email)
  const [showVerification, setShowVerification] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showVerification) {
      setCanResend(true);
    }
  }, [timeLeft, showVerification]);

  function showError(duration: number, error: string) {
    setError(error)

    setTimeout(() => {
      setError("")
    }, duration);
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Call 00 : logout first - removing the session_id if it was there from signup
      await logout();

      // call 01 - authenticate user
      const success_result = await login(email, password);

      if (!success_result.ok) {
        // Check if the issue is unverified email
        if (success_result.emailNotVerified) {
          // allauth already set the session — user can now verify.
          // Resend OTP so they get a fresh code.
          const csrf = getCSRFToken()!;
          await auth_http_client.verify_email_resend(csrf);
          setShowVerification(true);
          setTimeLeft(60);
          setCanResend(false);
          setError("");
          setIsLoading(false);
          return;
        }
        showError(5000, t("loginFailed") || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }

      const user_role = success_result?.user?.role;
      if (success_result.ok && user_role) {
        navigate(`/${user_role}-dashboard`);
        onClose?.();
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(t("loginFailed") || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1 || !/^[0-9]*$/.test(value)) return;
    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);
    setError("");
    setVerifySuccess("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newCode.every(d => d !== '') && value) {
      setTimeout(() => handleVerifyOtp(newCode.join('')), 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpCode(pasted.split(''));
      setTimeout(() => handleVerifyOtp(pasted), 100);
    }
  };

  const handleVerifyOtp = async (codeStr?: string) => {
    const finalCode = codeStr || otpCode.join('');
    if (finalCode.length !== 6) {
      setError(t('incompleteCode') || 'Please enter the complete 6-digit code');
      return;
    }
    setIsVerifying(true);
    setError("");
    try {
      const csrf = getCSRFToken()!;
      const payload: VefiryEmailPayload = { key: finalCode };
      const res = await auth_http_client.verify_email(payload, csrf);
      if (res.ok) {
        setVerifySuccess(t('emailVerifiedLoginSuccess') || 'Email verified! Logging in...');
        // Now re-login since email is verified
        await logout();
        const result = await login(email, password);
        const role = result?.user?.role;
        if (result.ok && role) {
          setTimeout(() => {
            navigate(`/${role}-dashboard`);
            onClose?.();
          }, 1000);
        }
      } else {
        setError(t('invalidCode') || 'Invalid or expired code. Please try again.');
        setOtpCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(t('invalidCode') || 'Invalid or expired code. Please try again.');
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError("");
    try {
      const csrf = getCSRFToken()!;
      const res = await auth_http_client.verify_email_resend(csrf);
      if (res.ok) {
        setVerifySuccess(t('codeResent') || 'A new code has been sent to your email');
        setTimeout(() => setVerifySuccess(""), 4000);
        setTimeLeft(60);
        setCanResend(false);
        setOtpCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(t('resendFailed') || 'Failed to resend code.');
      }
    } catch {
      setError(t('resendFailed') || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };


  if (!isOpen) return null;


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/pedaconnect-removebg.png"
              alt="PedaConnect Logo"
              className="w-28 h-28 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {showVerification ? (t('confirmEmail') || 'Confirm Email') : t("login")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {showVerification
              ? (t('confirmEmailSlogan') || 'Verify your account')
              : (t("loginSlogan") || "Connect with Education")}
          </p>
        </div>


        {/* ── Email Verification View ── */}
        {showVerification ? (
          <div className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Info banner */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className={`text-sm text-amber-800 dark:text-amber-300 ${isRTL ? "text-right" : "text-left"}`}>
                <p className="font-medium">{t('emailNotVerified') || 'Your email is not verified yet. Please verify to access your account.'}</p>
                <p className="mt-1 text-amber-600 dark:text-amber-400">
                  {t('otpSentToEmail') || 'A verification code has been sent to your email'}
                </p>
              </div>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2" dir="ltr">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                />
              ))}
            </div>

            {/* Success message */}
            {verifySuccess && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm text-center">
                {verifySuccess}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Verify button */}
            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={isVerifying || otpCode.some(d => d === '')}
              className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (t('verifying') || 'Verifying...') : (t('verifyCode') || 'Verify code')}
            </button>

            {/* Resend code */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="inline-flex items-center gap-1 text-sm text-primary-500 hover:text-primary-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? (t('resending') || 'Resending...') : (t('resendCode') || 'Resend code')}
                </button>
              ) : timeLeft > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('resendCodeIn') || 'Resend code in'} {`0:${timeLeft.toString().padStart(2, '0')}`}
                </p>
              ) : null}
            </div>

            {/* Back to login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setShowVerification(false); setError(""); setVerifySuccess(""); setOtpCode(['', '', '', '', '', '']); }}
                className="text-sm text-primary-500 hover:underline"
              >
                {t('backToLogin') || 'Back to login'}
              </button>
            </div>
          </div>
        ) : (
        /* ── Normal Login Form ── */
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">

          {/* Email */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"
                }`}
            >
              {t("email") || "Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"
                }`}
              placeholder={t("emailPlaceholder") || "example@school.dz"}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${isRTL ? "text-right" : "text-left"
                }`}
            >
              {t("password") || "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 rtl:pr-3 rtl:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"
                  }`}
                placeholder={t("password") || "Password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className=" mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? "text-right" : "text-left"
              }`}
          >
            {isLoading ? t("loading") || "Loading..." : t("login") || "Login"}
          </button>

          {/* Register Link */}
          <div
            className={`text-center text-sm text-gray-600 dark:text-gray-400 ${isRTL ? "text-right" : "text-left"
              }`}
          >
            {t("noAccount") || "Don’t have an account?"}{" "}
            <Link to="/register" className="text-primary-500 hover:underline">
              {t("signUp") || "Sign Up"}
            </Link>
          </div>
          <div
            className={`text-center text-sm text-gray-600 dark:text-gray-400 ${isRTL ? "text-right" : "text-left"
              }`}
          >
            <Link to="/" className="text-primary-500 hover:underline">
              {t("cancel") || "Go Back"}
            </Link>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default Login;
