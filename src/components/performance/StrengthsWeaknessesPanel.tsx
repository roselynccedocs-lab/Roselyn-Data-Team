import React, { useState } from 'react';
import { StrengthWeaknessItem } from '../../types/performance';
import { PerformanceService } from '../../services/performanceService';
import { RegisterStrengthWeaknessModal } from './RegisterStrengthWeaknessModal';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  Award, 
  AlertTriangle, 
  PlusCircle, 
  Users, 
  UserCheck, 
  Hash, 
  Pencil, 
  Trash2, 
  Lock, 
  Eye 
} from 'lucide-react';

interface StrengthsWeaknessesPanelProps {
  items: StrengthWeaknessItem[];
  employeeName: string;
  onUpdated: () => void;
  currentUserRole: string;
  currentUserId: string;
  currentUserName: string;
}

export function StrengthsWeaknessesPanel({
  items,
  employeeName,
  onUpdated,
  currentUserRole,
  currentUserId,
  currentUserName
}: StrengthsWeaknessesPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StrengthWeaknessItem | null>(null);

  const isQAOrAdmin = currentUserRole === 'QA' || currentUserRole === 'ADMIN';
  const isHR = currentUserRole === 'HR';

  const canAddOrEdit = isHR || isQAOrAdmin;
  const canDelete = isQAOrAdmin;

  const handleConfirm = async (itemId: string, confirm: boolean) => {
    try {
      setIsProcessing(true);
      await PerformanceService.confirmStrengthWeakness(
        itemId, 
        { id: currentUserId, name: currentUserName }, 
        confirm
      );
      onUpdated();
    } catch (err) {
      console.error('Failed to update strength/weakness status:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (item: StrengthWeaknessItem) => {
    setEditingItem(item);
    setIsRegisterModalOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!canDelete) return;
    if (window.confirm('Are you sure you want to delete this Strength/Weakness record?')) {
      try {
        setIsProcessing(true);
        await PerformanceService.deleteStrengthWeaknessByQAAdmin(itemId);
        onUpdated();
      } catch (err) {
        console.error('Failed to delete strength/weakness record:', err);
        alert('Failed to delete item.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsRegisterModalOpen(true);
  };

  const strengths = items.filter(i => i.type === 'STRENGTH');
  const weaknesses = items.filter(i => i.type === 'WEAKNESS');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-xl space-y-6">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">360° Strengths & Weaknesses Evaluation Engine</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated & HR-recorded development profiles for {employeeName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canAddOrEdit && (
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-900/30 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Register Strength / Weakness</span>
            </button>
          )}

          <div className="text-right hidden md:block">
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
              Automated Record List
            </span>
            <p className="text-[11px] text-slate-400">
              {isHR ? 'HR can Add & Edit records (Delete restricted)' : 'QA & Admin have full Add, Edit, and Delete access'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identified Strengths */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Identified Strengths (+20% Score Bonus)</span>
          </div>

          <div className="space-y-3">
            {strengths.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No specific strengths flagged for current evaluation period.</p>
            ) : (
              strengths.map(item => (
                <StrengthWeaknessCard 
                  key={item.id}
                  item={item}
                  canEdit={canAddOrEdit}
                  canDelete={canDelete}
                  isProcessing={isProcessing}
                  onConfirm={handleConfirm}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Identified Weaknesses */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Identified Areas for Development (-10% Score Deduction)</span>
          </div>

          <div className="space-y-3">
            {weaknesses.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No specific development weaknesses flagged for current period.</p>
            ) : (
              weaknesses.map(item => (
                <StrengthWeaknessCard 
                  key={item.id}
                  item={item}
                  canEdit={canAddOrEdit}
                  canDelete={canDelete}
                  isProcessing={isProcessing}
                  onConfirm={handleConfirm}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* QA / Admin / HR Modal */}
      <RegisterStrengthWeaknessModal 
        isOpen={isRegisterModalOpen}
        editingItem={editingItem}
        onClose={() => setIsRegisterModalOpen(false)}
        onUpdated={onUpdated}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />
    </div>
  );
}

function StrengthWeaknessCard({ 
  item, 
  canEdit,
  canDelete,
  isProcessing, 
  onConfirm,
  onEdit,
  onDelete
}: { 
  key?: string;
  item: StrengthWeaknessItem; 
  canEdit: boolean;
  canDelete: boolean;
  isProcessing: boolean; 
  onConfirm: (id: string, confirm: boolean) => void;
  onEdit: (item: StrengthWeaknessItem) => void;
  onDelete: (id: string) => void;
}) {
  const isStrength = item.type === 'STRENGTH';
  
  // Format listed candidate names
  const candidateList = item.candidateNames && item.candidateNames.length > 0 
    ? item.candidateNames 
    : [item.employeeName];

  // Acknowledgement Number (Auto-generated or fallback)
  const ackNo = item.acknowledgementNo || `ACK-SW-2026-${item.id.replace(/\D/g, '') || '91823'}`;

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 transition hover:border-slate-700 relative group">
      
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="pr-12">
          <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isStrength ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {item.status === 'CONFIRMED_BY_HR' ? 'RECORDED & CONFIRMED' : item.status.replace(/_/g, ' ')}
            </span>

            {/* Target Scope Badge */}
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
              {item.targetScope === 'DEPARTMENT' ? (
                <>
                  <Users className="w-3 h-3 text-blue-400" />
                  <span>Dept: {item.departmentName || 'Department Team'}</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span>Individual Candidates ({candidateList.length})</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Auto-Generated Acknowledgement Number Badge + Action Controls */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
          <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px] flex items-center gap-1">
            <Hash className="w-3 h-3 text-emerald-400" />
            <span>{ackNo}</span>
          </div>

          {/* Action Buttons: Edit (HR & QA/Admin), Delete (QA/Admin only) */}
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1 mt-0.5">
              {canEdit && (
                <button
                  disabled={isProcessing}
                  onClick={() => onEdit(item)}
                  title="Edit Record"
                  className="p-1 bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500/50 text-slate-300 hover:text-blue-300 rounded border border-slate-700 transition"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              {canDelete && (
                <button
                  disabled={isProcessing}
                  onClick={() => onDelete(item.id)}
                  title="Delete Record (QA/Admin only)"
                  className="p-1 bg-slate-800 hover:bg-rose-600/30 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 rounded border border-slate-700 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Candidate Names Section (Listed Names) */}
      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
          {item.targetScope === 'DEPARTMENT' ? `Department Candidates (${candidateList.length}):` : `Listed Employees / Candidates (${candidateList.length}):`}
        </span>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {candidateList.map((name, idx) => (
            <span 
              key={idx} 
              className="px-2 py-0.5 bg-slate-800 border border-slate-700/80 text-slate-200 rounded font-medium text-[10px] flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>{name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Description directly BELOW the names */}
      <div className="space-y-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Description:</span>
        <p className="text-[11px] text-slate-300 leading-relaxed font-normal bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
          {item.description}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
        <div className="flex items-center gap-2">
          <span>Source: <strong className="text-slate-300">{item.detectedBy}</strong></span>
          {item.hrConfirmedBy && (
            <span>• Confirmed By: <strong className="text-slate-300">{item.hrConfirmedBy}</strong></span>
          )}
        </div>

        <div>
          {item.bonusApplied ? (
            <span className={`font-bold ${isStrength ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isStrength ? '+20% Bonus Applied' : '-10% Deduction Applied'}
            </span>
          ) : (
            <span className="text-amber-400 font-semibold">Pending Confirmation</span>
          )}
        </div>
      </div>

      {/* Confirm/Dismiss Buttons if suggested */}
      {item.status === 'SUGGESTED' && canDelete && (
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <button 
            disabled={isProcessing}
            onClick={() => onConfirm(item.id, true)}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
              isStrength 
                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400'
            }`}
          >
            {isStrength ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{isStrength ? 'Confirm & Apply +20% Bonus' : 'Confirm & Apply -10% Deduction'}</span>
          </button>

          <button 
            disabled={isProcessing}
            onClick={() => onConfirm(item.id, false)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[11px] transition"
          >
            Dismiss
          </button>
        </div>
      )}

    </div>
  );
}
