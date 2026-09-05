import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, ShieldCheck, CheckCircle2, LifeBuoy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ITSupportForm } from '../it/ITSupportForm';
import { ITTicket } from '../it/ITDashboard';
import { checkSupportRequestAvailability, submitCentralSupportTicket } from '../../lib/ticketingSystem';

interface GlobalSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: ITTicket) => void;
  defaultDepartment?: string;
}

export function GlobalSupportModal({
  isOpen,
  onClose,
  onTicketCreated,
  defaultDepartment
}: GlobalSupportModalProps) {
  const { profile } = useAuth();
  const [scheduleStatus, setScheduleStatus] = useState(() => 
    checkSupportRequestAvailability(profile?.role, profile?.email)
  );

  // Re-check schedule status whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setScheduleStatus(checkSupportRequestAvailability(profile?.role, profile?.email));
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleTicketSubmitted = async (ticket: ITTicket) => {
    const enrichedTicket: ITTicket = {
      ...ticket,
      requestor: profile?.displayName || ticket.requestor || 'Arnold Cortina',
      requestorEmail: profile?.email || 'user@centaurchem.com',
      avatarLetter: (profile?.displayName || 'A').charAt(0).toUpperCase(),
      category: ticket.category || 'General IT Support'
    };

    // Sync to Firestore central database & create IT Admin notification
    const savedTicket = await submitCentralSupportTicket(enrichedTicket, profile);

    if (onTicketCreated) {
      onTicketCreated(savedTicket);
    }

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Central IT Support Ticket Desk
                {profile?.role === 'ADMIN' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                    <ShieldCheck className="w-3 h-3" /> 24/7 Admin Privileges
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {defaultDepartment ? `Requesting support for ${defaultDepartment}` : 'Submit an IT support ticket automatically synced with Central Database'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* If Submissions are closed due to Lunch or After-Hours for non-admin user */}
          {!scheduleStatus.isAvailable && profile?.role !== 'ADMIN' ? (
            <div className="py-8 px-4 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {scheduleStatus.status === 'LUNCH_CLOSED' 
                    ? 'Ticketing System Closed (Lunch Break 12 PM - 1 PM)'
                    : 'Support Desk Closed After Hours (5 PM - 8 AM)'
                  }
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {scheduleStatus.reason}
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 max-w-md mx-auto text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-extrabold flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  {scheduleStatus.nextOpeningTimeText}
                </div>
                <p className="text-[11px] opacity-90">
                  Support ticket requests are open daily from 8:00 AM to 12:00 PM and 1:00 PM to 5:00 PM. Urgent tickets submitted during lunch or after hours will be processed immediately at 8:00 AM / 1:00 PM.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-xs rounded-xl transition-all shadow-md"
                >
                  Close Notice
                </button>
              </div>
            </div>
          ) : (
            /* Render Full Support Ticket Request Form */
            <ITSupportForm
              onSubmitTicket={handleTicketSubmitted}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
