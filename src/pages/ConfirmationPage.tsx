import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { auth_http_client } from '../services/http_api/auth/auth_http_client';
import { getCSRFToken } from '../lib/get_CSRFToken';
import { RegisterParentPayload, RegisterSchoolPayload, VefiryEmailPayload } from '../services/http_api/payloads_types/school_client_payload_types';

interface ConfirmationCodeProps {
  isOpen?: boolean;
  onClose?: () => void;
  email?: string;
}

const ConfirmationCode: React.FC<ConfirmationCodeProps> = ({ isOpen = true, onClose, email }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();

  // Timer for resend functionality
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    setSuccess('');

    // Move to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && value) {
      setTimeout(() => handleSubmit(newCode.join('')), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Move to next input on arrow right
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Move to previous input on arrow left
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError('');
      setSuccess('');
      // Auto-submit pasted code
      setTimeout(() => handleSubmit(pastedData), 100);
    }
  };

  const handleSubmit = async (codeToSubmit?: string) => {
    const finalCode = codeToSubmit || code.join('');
    
    if (finalCode.length !== 6) {
      setError(t('incompleteCode') || 'يرجى إدخال الرمز المكون من 6 أرقام كاملاً');
      return;
    }

    setIsLoading(true);
    //! API CALL : Verify Email
    const csrfToken= getCSRFToken()!
    const verify_payload:VefiryEmailPayload={
      key:finalCode
    }  
    const res = await auth_http_client.verify_email(verify_payload,csrfToken)

    setError('');
    setSuccess('');
    
    try {
      const role = localStorage.getItem("role")
      
      if (res.ok) {
        //? Case Of Valid Key-Code 
        setSuccess(t('emailConfirmed') || 'تم تأكيد البريد الإلكتروني بنجاح!');
        setTimeout(() => {
          navigate(`/${role}-dashboard`);
        }, 1500);
      }
      const isCreatingSchool = role ==="school"
      const userData = JSON.parse(localStorage.getItem('user_data')??"")

      if (isCreatingSchool) {
      const school_payload: RegisterSchoolPayload = {
        school_name: userData.name,
        email: userData.email,
        phone_number: userData.phone,
        school_level: userData.school_level,
        website: "",
        address: "",
        wilaya: "",
        commun: "",
        school_type: "",
        established_year: 0,
        description: "",
      };

      const latest_csrf = getCSRFToken()!

      const school_result = await auth_http_client.register_school(
        school_payload,
        latest_csrf
      );
    } else {
      const parent_payload: RegisterParentPayload = {
        full_name: userData.email,
        phone_number: userData.phone,
        address: "",
        relationship_to_student: "",
      };
      const latest_csrf = getCSRFToken()!
      const parent_result = await auth_http_client.register_parent(
        parent_payload,
        latest_csrf
      );
    }

    } catch (error) {
      console.error('Confirmation failed:', error);
      setError(t('invalidCode') || 'رمز غير صحيح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.');
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      if (success) {
        setSuccess(t('codeResent') || 'تم إرسال رمز تأكيد جديد إلى بريدك الإلكتروني');
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        // Clear current code
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Resend failed:', error);
      setError(t('resendFailed') || 'فشل إرسال الرمز. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img
              src="/assets/logo.jpg"
              alt="Platform Logo"
              className="w-10 h-10 object-contain rounded-lg"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('confirmEmail') || 'تأكيد البريد الإلكتروني'}
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
          <div className="mx-6 mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Email Icon and Message */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#39789b]/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#39789b]" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-900 dark:text-white font-medium">
                {t('checkYourEmail') || 'تحقق من بريدك الإلكتروني'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('confirmationCodeSent') || 'لقد أرسلنا رمز تأكيد مكون من 6 أرقام إلى'}
              </p>
              <p className="text-sm font-medium text-[#39789b]">
                {email || 'عنوان بريدك الإلكتروني'}
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
                  className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#39789b] focus:border-[#39789b] bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Timer and Resend */}
          <div className="text-center space-y-3">
            {!canResend ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('resendCodeIn') || 'إعادة إرسال الرمز خلال'} {formatTime(timeLeft)}
              </p>
            ) : (
              <button
                onClick={handleResendCode}
                disabled={isResending}
                className="text-sm text-[#39789b] hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 rtl:space-x-reverse mx-auto"
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
            onClick={() => handleSubmit()}
            disabled={isLoading || code.some(digit => digit === '')}
            className={`w-full py-3 px-4 bg-[#39789b] text-white rounded-lg hover:bg-[#2f6a85] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? 'text-right' : 'text-left'}`}
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
              className="text-[#39789b] hover:underline"
            >
              {t('backToLogin') || 'العودة لتسجيل الدخول'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationCode;