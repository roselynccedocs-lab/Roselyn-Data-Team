import React, { useState, useEffect } from 'react';
import { LifeBuoy, Clock, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { checkSupportRequestAvailability } from '../../lib/ticketingSystem';
import { GlobalSupportModal } from '../modals/GlobalSupportModal';

interface SubmitSupportButtonProps {
  className?: string;
  variant?: 'primary' | 'header' | 'compact';
  departmentName?: string;
}

export function SubmitSupportButton({
  className = '',
  variant = 'primary',
  departmentName
}: SubmitSupportButtonProps) {
  const { profile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [schedule, setSchedule] = useState(() => 
    checkSupportRequestAvailability(profile?.role, profile?.email)
  );

  // Auto-refresh schedule check every 30 seconds
  useEffect(() => {
    const checkSchedule = () => {
      setSchedule(checkSupportRequestAvailability(profile?.role, profile?.email));
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [profile]);

  const isAdmin = profile?.role === 'ADMIN' || 
                  profile?.role === 'IT_ADMIN' || 
                  (profile?.email || '').toLowerCase().includes('arnoldcortina');

  // Determine button state and styles
  const isAfterHours = !schedule.isAvailable && schedule.status === 'AFTER_HOURS_CLOSED' && !isAdmin;
  const isLunchClosed = !schedule.isAvailable && schedule.status === 'LUNCH_CLOSED' && !isAdmin;

  let buttonContent = (
    <>
      <LifeBuoy className="w-4 h-4 shrink-0 text-white" />
      <span>Submit Support Request</span>
    </>
  );

  let buttonClass = '';

  if (isAfterHours) {
    // Grayed out after hours (5 PM - 8 AM) for non-admin end users
    buttonClass = `bg-slate-200 dark:bg-slate-800/90 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-80`;
    buttonContent = (
      <>
        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="line-through opacity-70">Support Request</span>
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-md ml-1">
          Closed (5 PM - 8 AM)
        </span>
      </>
    );
  } else if (isLunchClosed) {
    // Lunch break warning style (12 PM - 1 PM) for non-admin end users
    buttonClass = `bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100`;
    buttonContent = (
      <>
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
        <span>Support Request</span>
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md">
          Lunch Break (12-1 PM)
        </span>
      </>
    );
  } else if (isAdmin) {
    // Admin 24/7 privilege style
    buttonClass = `bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/10`;
    buttonContent = (
      <>
        <LifeBuoy className="w-4 h-4 shrink-0 text-purple-200" />
        <span>Submit Support Request</span>
        <span className="text-[9px] font-extrabold bg-purple-900/50 text-purple-100 px-1.5 py-0.5 rounded-full border border-purple-400/40 flex items-center gap-0.5">
          <ShieldCheck className="w-2.5 h-2.5" /> 24/7
        </span>
      </>
    );
  } else {
    // Standard working hours style
    buttonClass = `bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm`;
    buttonContent = (
      <>
        <LifeBuoy className="w-4 h-4 shrink-0" />
        <span>Submit Support Request</span>
      </>
    );
  }

  // Variant adjustments
  let sizeClasses = 'px-4 py-2.5 text-xs font-extrabold rounded-2xl flex items-center gap-2 transition-all shrink-0';
  if (variant === 'compact') {
    sizeClasses = 'px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shrink-0';
  } else if (variant === 'header') {
    sizeClasses = 'px-3.5 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shrink-0';
  }

  const tooltipText = isAfterHours
    ? 'Support ticket submissions are closed after hours (5:00 PM - 8:00 AM). Reopens at 8:00 AM.'
    : isLunchClosed
    ? 'Support ticket submissions are closed during lunch break (12:00 PM - 1:00 PM).'
    : isAdmin
    ? '24/7 IT Admin Access Active'
    : 'Click to open the Central IT Support Request form';

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        title={tooltipText}
        className={`${sizeClasses} ${buttonClass} ${className}`}
      >
        {buttonContent}
      </button>

      {/* Global Support Modal Popup */}
      <GlobalSupportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDepartment={departmentName}
      />
    </>
  );
}
