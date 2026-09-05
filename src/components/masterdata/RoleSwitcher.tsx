import React from 'react';
import { UserRole } from '../../types/masterData';
import { UserCheck, ShieldCheck, Database, FileText } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  pendingQaCount: number;
  pendingMdmCount: number;
}

export function RoleSwitcher({ 
  currentRole, 
  onRoleChange, 
  pendingQaCount, 
  pendingMdmCount 
}: RoleSwitcherProps) {
  const roles: { role: UserRole; title: string; subtitle: string; icon: any; badge?: number }[] = [
    {
      role: 'REQUESTOR',
      title: 'Data Entry Clerk',
      subtitle: 'Initiate & Manage Drafts',
      icon: UserCheck
    },
    {
      role: 'QA_REVIEWER',
      title: 'QA Reviewer',
      subtitle: 'Departmental Inspection',
      icon: ShieldCheck,
      badge: pendingQaCount
    },
    {
      role: 'MDM_MANAGER',
      title: 'MDM Manager',
      subtitle: 'Final Master Sign-off',
      icon: Database,
      badge: pendingMdmCount
    },
    {
      role: 'SYSTEM_AUDITOR',
      title: 'System Auditor',
      subtitle: 'Immutable Audit Trail',
      icon: FileText
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Governance Role Perspective:</span>
          <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
            {roles.find(r => r.role === currentRole)?.title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = currentRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => onRoleChange(r.role)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.title}</span>
                {r.badge !== undefined && r.badge > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-black ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
                  }`}>
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
