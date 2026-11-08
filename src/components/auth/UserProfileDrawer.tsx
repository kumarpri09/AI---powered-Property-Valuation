import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, User, Phone, MapPin, ShieldCheck, LogOut, Calendar, Award } from 'lucide-react';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAuthModal,
}) => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              {user ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {user ? user.name : 'Guest User'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.role || 'Sign in to access saved valuations'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {isAuthenticated && user ? (
            <>
              {/* Account Status Badge */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Authentication Status
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Mobile OTP Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Age</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{user.age} Years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gender</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{user.gender}</span>
                  </div>
                </div>
              </div>

              {/* Contact & Mobile */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                    <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Registered Mobile</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        +91 {user.mobileNumber}
                      </span>
                    </div>
                  </div>

                  {user.email && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                      <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Official Email</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{user.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Registered Address */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Registered Address
                </h4>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5 leading-relaxed">
                    <p className="font-medium text-slate-900 dark:text-white">{user.address.line1}</p>
                    <p>{user.address.locality}</p>
                    <p>{user.address.city}, {user.address.state} - {user.address.pinCode}</p>
                  </div>
                </div>
              </div>

              {/* Registration timestamp */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Account created {new Date(user.registeredAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  No Active Session
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                  Authenticate using your mobile number and OTP to save appraisals, print certified reports, and manage portfolios.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal('login');
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
                >
                  Sign In with Mobile OTP / Password
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal('register');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-xl transition-colors"
                >
                  Register New Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out from Device
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
