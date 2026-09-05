import React, { useState, useRef } from 'react';
import { 
  Info, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  CheckCircle2, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { ITTicket } from './ITDashboard';

interface ITSupportFormProps {
  onSubmitTicket: (ticket: ITTicket) => void;
  onCancel: () => void;
}

export function ITSupportForm({ onSubmitTicket, onCancel }: ITSupportFormProps) {
  const [subject, setSubject] = useState('');
  const [severity, setSeverity] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P4');
  const [category, setCategory] = useState('Hardware (Laptop, Monitor, Mouse, Keyboard)');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  // File upload attachment state
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success Toast Banner State
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        alert('File size exceeds the maximum limit of 200MB.');
        return;
      }
      setAttachedFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please complete the subject and issue description fields.');
      return;
    }

    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const newTicket: ITTicket = {
      id: String(Date.now()),
      ticketNo: `CCC-X${randomSuffix}`,
      title: subject.trim(),
      status: 'open',
      severity: severity,
      slaResolution: 'Pass',
      resolutionTime: 'Pending',
      requestor: 'Arnold Cortina',
      avatarLetter: 'A',
      category: category,
      assetId: assetId.trim() || undefined,
      contactNumber: contactNumber.trim() || undefined,
      description: description.trim(),
      createdAt: new Date().toISOString()
    };

    setSubmittedSuccess(true);
    setTimeout(() => {
      onSubmitTicket(newTicket);
    }, 1200);
  };

  // Dynamic SLA response time estimation text
  const getSlaEstimateText = () => {
    switch (severity) {
      case 'P1': return 'P1 Critical Severity: Response SLA within 1 Hour, Resolution SLA within 4 Hours.';
      case 'P2': return 'P2 High Severity: Response SLA within 2 Hours, Resolution SLA within 8 Hours.';
      case 'P3': return 'P3 Medium Severity: Response SLA within 4 Hours, Resolution SLA within 24 Hours.';
      case 'P4': default: return 'P4 Low Severity: Response SLA within 8 Hours, Resolution SLA within 48 Hours.';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Form Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Submit a Support Request</h2>
        <p className="text-xs text-slate-500 mt-1">Please provide as much detail as possible to help our IT team assist you faster.</p>
      </div>

      {submittedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-extrabold text-sm block">Support Request Submitted Successfully!</span>
            <span className="text-xs">Your request has been logged and assigned to the IT Helpdesk team. Redirecting to dashboard...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* CARD 1: ISSUE OVERVIEW */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">ISSUE OVERVIEW</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject / Short Summary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Laptop won't connect to office Wi-Fi"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Impact Level (Severity)
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="P4">P4 - Low (Informational / Request)</option>
                  <option value="P3">P3 - Medium (Standard Issue)</option>
                  <option value="P2">P2 - High (Significant Business Impact)</option>
                  <option value="P1">P1 - Critical (Total Work Stoppage)</option>
                </select>
                <p className="text-[10px] text-slate-400 italic mt-1 leading-normal">
                  Select P1 only for total work stoppage. Note: P1 & P2 options are only available until 1:30 PM daily.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Hardware (Laptop, Monitor, Mouse, Keyboard)</option>
                  <option>Software / Applications (ERP, Office 365, Browsers)</option>
                  <option>Network & Connectivity (Wi-Fi, VPN, Firewall)</option>
                  <option>Account & Access (Password reset, SSO, Permissions)</option>
                  <option>Printers & Accessories (HP Printers, Scanner)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: DETAILED INFORMATION */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">DETAILED INFORMATION</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Description of the Issue <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  required
                  placeholder="What happened? What steps have you already tried? Are there any error codes?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* Attach Image button inside bottom right of textarea card matching Image 1 */}
                <div className="mt-2 flex items-center justify-between">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileAttach}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {attachedFileName ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                      <Paperclip className="w-3.5 h-3.5" /> {attachedFileName}
                      <button 
                        type="button" 
                        onClick={() => setAttachedFileName(null)}
                        className="text-indigo-400 hover:text-indigo-600 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : <div></div>}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-500" /> Attach Image (Max 200MB)
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Asset ID / Device Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., LPT-12345"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Best Contact Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., +1 (555) 000-0000"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons matching Image 1 */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all text-center"
          >
            Submit Support Request
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-sm rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* SLA ESTIMATE BANNER matching Image 1 */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-extrabold text-xs text-blue-950 dark:text-blue-200">Estimated Response Time</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {getSlaEstimateText()} Based on your selected severity, our team aims to respond within the SLA timeframe. You will receive a notification once an agent is assigned.
          </p>
        </div>
      </div>
    </div>
  );
}
