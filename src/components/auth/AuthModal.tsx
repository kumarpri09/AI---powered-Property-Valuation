import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Gender, UserAddress } from '../../types/auth';
import {
  X,
  Smartphone,
  Lock,
  ShieldCheck,
  User,
  MapPin,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  Radio,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const {
    isPendingOtp,
    activeOtpCode,
    otpCountdown,
    pendingMobile,
    smsReceipt,
    sendOtpForLogin,
    verifyOtpAndLogin,
    loginWithPassword,
    initiateRegistration,
    verifyOtpAndCompleteRegistration,
    resendOtp,
    clearPendingOtp,
  } = useAuth();

  const [authTab, setAuthTab] = useState<'login' | 'register'>(defaultMode);
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');

  // Login form state
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState<number | ''>('');
  const [regGender, setRegGender] = useState<Gender>('Male');
  const [regMobile, setRegMobile] = useState('');
  const [regAddress, setRegAddress] = useState<UserAddress>({
    line1: '',
    locality: '',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '',
  });

  // OTP inputs
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus on first input when entering OTP screen
  useEffect(() => {
    if (isPendingOtp) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isPendingOtp]);

  if (!isOpen) return null;

  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const clean = mobileNumber.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    try {
      await sendOtpForLogin(clean);
      setOtpDigits(['', '', '', '', '', '']);
    } catch {
      setErrorMsg('Failed to dispatch SMS OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const clean = mobileNumber.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await loginWithPassword(clean, password);
      onClose();
    } catch {
      setErrorMsg('Invalid mobile number or credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!regName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!regAge || Number(regAge) < 18 || Number(regAge) > 100) {
      setErrorMsg('Please enter a valid age (18+)');
      return;
    }
    const clean = regMobile.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (
      !regAddress.line1.trim() ||
      !regAddress.locality.trim() ||
      !regAddress.city.trim() ||
      !regAddress.pinCode.trim()
    ) {
      setErrorMsg('Please complete all address fields');
      return;
    }

    setIsLoading(true);
    try {
      await initiateRegistration({
        name: regName.trim(),
        age: Number(regAge),
        gender: regGender,
        address: regAddress,
        mobileNumber: clean,
      });
      setOtpDigits(['', '', '', '', '', '']);
    } catch {
      setErrorMsg('Failed to dispatch SMS verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Pasted full code
      const pasted = val.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const next = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          next[i] = pasted[i] || '';
        }
        setOtpDigits(next);
        const nextFocus = Math.min(pasted.length, 5);
        otpInputRefs.current[nextFocus]?.focus();
        if (pasted.length === 6) {
          triggerVerificationWithCode(pasted);
        }
      }
      return;
    }

    const clean = val.replace(/\D/g, '');
    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    if (clean && index === 5) {
      const full = next.join('');
      if (full.length === 6) {
        triggerVerificationWithCode(full);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const triggerVerificationWithCode = async (codeToVerify: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      let success = false;
      if (authTab === 'login') {
        success = await verifyOtpAndLogin(codeToVerify);
      } else {
        success = await verifyOtpAndCompleteRegistration(codeToVerify);
      }

      if (success) {
        onClose();
      } else {
        setErrorMsg('Invalid or expired OTP code. Use code from SMS or sandbox 123456.');
      }
    } catch {
      setErrorMsg('Error verifying code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP received on mobile');
      return;
    }
    await triggerVerificationWithCode(fullOtp);
  };

  const handleAutoFillOtp = () => {
    if (activeOtpCode) {
      const digits = activeOtpCode.split('');
      setOtpDigits(digits);
      triggerVerificationWithCode(activeOtpCode);
    }
  };

  const handleCopyOtp = () => {
    if (activeOtpCode) {
      navigator.clipboard.writeText(activeOtpCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleResend = async () => {
    try {
      setErrorMsg(null);
      await resendOtp();
      setOtpDigits(['', '', '', '', '', '']);
    } catch {
      setErrorMsg('Failed to resend SMS OTP.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isPendingOtp
                ? 'Mobile OTP Verification'
                : authTab === 'login'
                ? 'Sign In to ValuMetric'
                : 'Register Valuer Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isPendingOtp
                ? `SMS dispatched to +91 ${pendingMobile}`
                : 'Certified Real Estate Valuation & Market Analytics Engine'}
            </p>
          </div>
          <button
            onClick={() => {
              clearPendingOtp();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realistic Mobile Incoming SMS Push Notification Heads-up */}
        {isPendingOtp && activeOtpCode && (
          <div className="mx-6 mt-4 p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700/80 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      MESSAGES · {smsReceipt?.senderId || 'VM-APPRAISE'}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> now
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100">
                    To: +91 {pendingMobile} ({smsReceipt?.carrier || 'Carrier Network'})
                  </p>
                  <p className="text-xs text-slate-300 leading-snug font-mono pt-0.5">
                    &lt;#&gt; <strong className="text-amber-400 font-bold tracking-wider">{activeOtpCode}</strong> is your ValuMetric verification code. Valid for 5 mins.
                  </p>
                </div>
              </div>

              {/* Action Buttons right inside the SMS notification */}
              <div className="flex flex-col gap-1.5 shrink-0 pt-1">
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Fill</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {isPendingOtp ? (
            /* OTP Verification Screen with Mobile SMS message verification */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Enter SMS Verification Code
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  We sent a 6-digit verification message to{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    +91 {pendingMobile}
                  </strong>
                  .
                </p>

                {/* Carrier Network Live Pulse */}
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Carrier Delivered via {smsReceipt?.carrier || 'Mobile Network'}
                  </span>
                </div>
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all shadow-xs"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Digits auto-advance · Paste 6-digit code directly or use Auto-Fill
                </p>
              </div>

              {/* Resend & Countdown */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>
                  {otpCountdown > 0 ? (
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Resend SMS in {otpCountdown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend SMS Code to Mobile
                    </button>
                  )}
                </span>
                <button
                  type="button"
                  onClick={clearPendingOtp}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Change Mobile Number
                </button>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verify OTP & Authenticate
                  </>
                )}
              </button>

              {/* Collapsible Telecom SMS Delivery Telemetry */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTelemetry(!showTelemetry)}
                  className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-indigo-500" />
                    <span>Telecom SMS Dispatch Telemetry</span>
                  </span>
                  {showTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showTelemetry && (
                  <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-mono space-y-1 text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Message ID:</span>
                      <strong className="text-slate-900 dark:text-white">{smsReceipt?.messageId || 'MSG-SMS-ACTIVE'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Sender ID:</span>
                      <strong className="text-slate-900 dark:text-white">{smsReceipt?.senderId || 'VM-APPRAISE'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Carrier Gateway:</span>
                      <span>{smsReceipt?.carrier || 'National DLT Route'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">DELIVRD (0.72s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sandbox Master Code:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">123456</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tabs: Login vs Register */
            <div>
              {/* Segmented Switcher */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authTab === 'login'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authTab === 'register'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Register New Account
                </button>
              </div>

              {authTab === 'login' ? (
                /* Login Tab */
                <div>
                  {/* Method toggle: OTP vs Password */}
                  <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('otp')}
                      className={`text-xs font-semibold pb-1 border-b-2 transition-all cursor-pointer ${
                        loginMethod === 'otp'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Login via Mobile SMS OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('password')}
                      className={`text-xs font-semibold pb-1 border-b-2 transition-all cursor-pointer ${
                        loginMethod === 'password'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Login with Password
                    </button>
                  </div>

                  {loginMethod === 'otp' ? (
                    <form onSubmit={handleSendLoginOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Mobile Number (SMS verification will be sent)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="9876543210"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          A 6-digit verification code will be sent to your mobile phone.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Smartphone className="w-4 h-4" />
                            <span>Send OTP Message to Mobile</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="9876543210"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sign In with Password'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Registration Tab with Name, Age, Gender, Address, Mobile + OTP */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Arun Sharma"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Age *
                        </label>
                        <input
                          type="number"
                          placeholder="32"
                          min={18}
                          max={100}
                          value={regAge}
                          onChange={(e) => setRegAge(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Gender *
                        </label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value as Gender)}
                          className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number (Requires SMS OTP verification) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-500 font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9812345678"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Address Details</span>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Flat / House No., Building Name, Street *"
                        value={regAddress.line1}
                        onChange={(e) => setRegAddress({ ...regAddress, line1: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Locality / Sector *"
                        value={regAddress.locality}
                        onChange={(e) => setRegAddress({ ...regAddress, locality: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="City *"
                        value={regAddress.city}
                        onChange={(e) => setRegAddress({ ...regAddress, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="State *"
                        value={regAddress.state}
                        onChange={(e) => setRegAddress({ ...regAddress, state: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="PIN Code *"
                        maxLength={6}
                        value={regAddress.pinCode}
                        onChange={(e) =>
                          setRegAddress({
                            ...regAddress,
                            pinCode: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Send SMS OTP to Mobile & Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
