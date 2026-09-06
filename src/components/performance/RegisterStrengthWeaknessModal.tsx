import React, { useState, useEffect } from 'react';
import { StrengthWeaknessItem } from '../../types/performance';
import { PerformanceService, SEED_EMPLOYEES } from '../../services/performanceService';
import { X, Award, AlertTriangle, Users, UserCheck, ShieldCheck, CheckCircle2, Sparkles, Hash, Edit3 } from 'lucide-react';

interface RegisterStrengthWeaknessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  currentUserId: string;
  currentUserName: string;
  editingItem?: StrengthWeaknessItem | null;
}

const DEPARTMENTS = [
  'Operations',
  'Quality Assurance',
  'Master Data Management',
  'Compliance & Audit',
  'Finance & Supply Chain'
];

export function RegisterStrengthWeaknessModal({
  isOpen,
  onClose,
  onUpdated,
  currentUserId,
  currentUserName,
  editingItem
}: RegisterStrengthWeaknessModalProps) {
  const [targetScope, setTargetScope] = useState<'DEPARTMENT' | 'INDIVIDUAL'>('DEPARTMENT');
  const [selectedDept, setSelectedDept] = useState<string>('Operations');
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>(['EMP-1001', 'EMP-1002']);
  const [type, setType] = useState<'STRENGTH' | 'WEAKNESS'>('STRENGTH');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedAckNo, setGeneratedAckNo] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Populate or auto-generate preview acknowledgement number
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setTargetScope(editingItem.targetScope || 'INDIVIDUAL');
        setSelectedDept(editingItem.departmentName || 'Operations');
        setType(editingItem.type);
        setTitle(editingItem.title);
        setDescription(editingItem.description);
        setGeneratedAckNo(editingItem.acknowledgementNo || `ACK-SW-2026-${Math.floor(100000 + Math.random() * 900000)}`);
        
        // Match employee IDs if candidate names exist
        if (editingItem.candidateNames && editingItem.candidateNames.length > 0) {
          const matchedIds = SEED_EMPLOYEES
            .filter(e => editingItem.candidateNames?.includes(e.name))
            .map(e => e.id);
          setSelectedEmpIds(matchedIds.length > 0 ? matchedIds : [editingItem.employeeId || 'EMP-1001']);
        } else {
          setSelectedEmpIds([editingItem.employeeId || 'EMP-1001']);
        }
      } else {
        const ack = `ACK-SW-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        setGeneratedAckNo(ack);
        setTargetScope('DEPARTMENT');
        setSelectedDept('Operations');
        setSelectedEmpIds(['EMP-1001', 'EMP-1002']);
        setType('STRENGTH');
        setTitle('');
        setDescription('');
      }
      setShowSuccessToast(false);
    }
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  // Get candidate names for selected department
  const deptEmployees = SEED_EMPLOYEES.filter(e => e.department === selectedDept);
  const deptCandidateNames = deptEmployees.map(e => e.name);

  // Get candidate names for selected individual employees
  const individualCandidates = SEED_EMPLOYEES.filter(e => selectedEmpIds.includes(e.id));
  const individualCandidateNames = individualCandidates.map(e => e.name);

  const toggleEmployeeSelection = (empId: string) => {
    if (selectedEmpIds.includes(empId)) {
      if (selectedEmpIds.length > 1) {
        setSelectedEmpIds(selectedEmpIds.filter(id => id !== empId));
      }
    } else {
      setSelectedEmpIds([...selectedEmpIds, empId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);

      const targetEmpIds = targetScope === 'DEPARTMENT' 
        ? deptEmployees.map(e => e.id)
        : selectedEmpIds;

      const candidateNames = targetScope === 'DEPARTMENT'
        ? deptCandidateNames
        : individualCandidateNames;

      if (editingItem) {
        await PerformanceService.updateStrengthWeaknessByQAAdmin(editingItem.id, {
          targetScope,
          departmentName: targetScope === 'DEPARTMENT' ? selectedDept : undefined,
          selectedEmployeeIds: targetEmpIds.length > 0 ? targetEmpIds : ['EMP-1001'],
          candidateNames: candidateNames.length > 0 ? candidateNames : ['Juan Dela Cruz'],
          type,
          title,
          description,
          user: { id: currentUserId, name: currentUserName }
        });
      } else {
        const result = await PerformanceService.registerStrengthWeaknessByHR({
          targetScope,
          departmentName: targetScope === 'DEPARTMENT' ? selectedDept : undefined,
          selectedEmployeeIds: targetEmpIds.length > 0 ? targetEmpIds : ['EMP-1001'],
          candidateNames: candidateNames.length > 0 ? candidateNames : ['Juan Dela Cruz'],
          type,
          title,
          description,
          period: 'Q3 2026',
          hrUser: { id: currentUserId, name: currentUserName }
        });
        setGeneratedAckNo(result.acknowledgementNo);
      }

      setShowSuccessToast(true);

      setTimeout(() => {
        onUpdated();
        onClose();
        setTitle('');
        setDescription('');
        setShowSuccessToast(false);
      }, 1200);

    } catch (err) {
      console.error('Failed to save strength/weakness entry:', err);
      alert('Error saving entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {editingItem ? 'Edit Strength / Weakness Record' : 'Register Strength & Weakness Entry'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingItem ? 'Update details for this recorded evaluation item' : 'Register and automatically record development items for department teams or individual candidates'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Toast Banner */}
        {showSuccessToast && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl flex items-center gap-3 text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-bold text-xs">Strength / Weakness Registered Successfully!</p>
              <p className="text-[11px] font-mono">
                Official Acknowledgement No: <strong className="text-emerald-200">{generatedAckNo}</strong>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* Scope Selector: Department vs Individual */}
          <div>
            <label className="block font-bold text-slate-300 mb-2">Target Scope Selection</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetScope('DEPARTMENT')}
                className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  targetScope === 'DEPARTMENT'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Department / Team Scope</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope('INDIVIDUAL')}
                className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  targetScope === 'INDIVIDUAL'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Individual Employees (1 or More)</span>
              </button>
            </div>
          </div>

          {/* Scope Content: Department Selector + Candidate List */}
          {targetScope === 'DEPARTMENT' ? (
            <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Department Team</label>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-medium"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Listed Candidate Names */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  Department Candidate Names ({deptCandidateNames.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {deptCandidateNames.map(name => (
                    <span key={name} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-lg font-medium text-[11px]">
                      👤 {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <label className="block text-slate-300 font-bold">Select Individual Employees (Select 2 or more candidates)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {SEED_EMPLOYEES.map(emp => {
                  const isChecked = selectedEmpIds.includes(emp.id);
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => toggleEmployeeSelection(emp.id)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition ${
                        isChecked 
                          ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-200 text-[11px]">{emp.name}</div>
                        <div className="text-[10px] text-slate-500">{emp.department} • {emp.position}</div>
                      </div>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-blue-500 border-blue-400 text-white font-bold' : 'border-slate-700'
                      }`}>
                        {isChecked ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Listed Candidate Names */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  Listed Candidates ({individualCandidateNames.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {individualCandidateNames.map(name => (
                    <span key={name} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg font-medium text-[11px]">
                      👤 {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Type Classification: Strength vs Weakness */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Classification & Score Impact</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('STRENGTH')}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  type === 'STRENGTH'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Strength (+20% Score Bonus)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('WEAKNESS')}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  type === 'WEAKNESS'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Weakness (-10% Development Area)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Title / Summary Header</label>
            <input
              type="text"
              required
              placeholder="e.g. Exceptional Transaction Accuracy & Compliance Discipline"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Detailed Description</label>
            <textarea
              required
              rows={3}
              placeholder="Provide specific details regarding observed strengths or areas needing growth..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-600 leading-relaxed"
            />
          </div>

          {/* Auto-Generated Acknowledgement Number Box */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-[11px]">Auto-Generated Acknowledgement No:</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 text-xs">
              {generatedAckNo}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register & Confirm Entry'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
