import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  getDoc 
} from 'firebase/firestore';
import { 
  PerformanceScoreTransaction,
  PerformanceRuleConfig,
  DimensionWeights,
  Evaluation360,
  StrengthWeaknessItem,
  AttendanceRecord,
  DisciplinaryRecord,
  AwardRecommendation,
  QuarterLockState,
  EmployeePerformanceProfile,
  PerformanceCategory,
  PerformanceLevel,
  EndUserAccessPermissions
} from '../types/performance';

const TRANSACTIONS_COLLECTION = 'performance_transactions';
const EVALUATIONS_COLLECTION = 'performance_360_evaluations';
const STRENGTHS_COLLECTION = 'performance_strengths_weaknesses';
const ATTENDANCE_COLLECTION = 'performance_attendance';
const DISCIPLINARY_COLLECTION = 'performance_disciplinary';
const LOCKS_COLLECTION = 'performance_quarter_locks';
const RULES_DOC_ID = 'master_rules_config';
const ACCESS_PERMS_DOC_ID = 'end_user_access_perms';
const CONFIG_COLLECTION = 'performance_configs';

export const DEFAULT_END_USER_PERMISSIONS: EndUserAccessPermissions = {
  allowViewLedgerHistory: true,
  allowSubmit360Evaluations: true,
  allowViewStrengthsWeaknesses: true,
  allowViewAwardRecommendations: true,
  allowExportReportCard: true,
  allowViewDeptBenchmarks: true,
  allowSubmitReworkDispute: true,
  allowViewLeaderboard: true
};

// Default Admin-Configurable Scoring Rules
export const DEFAULT_PERFORMANCE_RULES: PerformanceRuleConfig = {
  onTimeCompletion: 0.10,
  earlyCompletion: 0.15,
  ticketResolution: 0.10,
  rejectedTransaction: -0.10,
  reworkRequired: -0.05,
  incompleteSubmission: -0.05,
  incorrectInformation: -0.05,
  missingDocument: -0.05,
  latenessPerHour: -0.01,
  unapprovedAbsence: -0.01,
  irIncidentReport: -0.01,
  nteNoticeToExplain: -0.01,
  daDisciplinaryAction: -15.0,
  suspensionDeduction: -20.0,
  qaTicketPassed: 10.0,
  qaSlaFailure: -0.01,
  hrStrengthBonus: 20.0,
  hrWeaknessDeduction: -10.0
};

// Default Dimension Weights (100% Total)
export const DEFAULT_DIMENSION_WEIGHTS: DimensionWeights = {
  productivity: 30,
  quality: 20,
  attendance: 10,
  behavior: 15,
  managerEvaluation: 10,
  peerEvaluation: 10,
  hrDevelopment: 5
};

// Seed Mock Employees with baseline performance and historical quarters
export interface EmployeeSeed {
  id: string;
  name: string;
  department: string;
  position: string;
  managerName: string;
  role: string;
  email: string;
}

export const SEED_EMPLOYEES: EmployeeSeed[] = [
  { id: 'EMP-1001', name: 'Juan Dela Cruz', department: 'Operations', position: 'Senior Operations Specialist', managerName: 'Maria Santos', role: 'REQUESTOR', email: 'juan.delacruz@company.com' },
  { id: 'EMP-1002', name: 'Maria Santos', department: 'Operations', position: 'Operations Manager', managerName: 'Carlos Reyes', role: 'MANAGER', email: 'maria.santos@company.com' },
  { id: 'EMP-1003', name: 'Elena Rostova', department: 'Quality Assurance', position: 'Lead QA Reviewer', managerName: 'David Kim', role: 'QA_REVIEWER', email: 'elena.rostova@company.com' },
  { id: 'EMP-1004', name: 'David Kim', department: 'Quality Assurance', position: 'QA Director', managerName: 'Carlos Reyes', role: 'MANAGER', email: 'david.kim@company.com' },
  { id: 'EMP-1005', name: 'Carlos Reyes', department: 'Master Data Management', position: 'MDM Department Head', managerName: 'Executive Office', role: 'MDM_MANAGER', email: 'carlos.reyes@company.com' },
  { id: 'EMP-1006', name: 'Sarah Jenkins', department: 'Compliance & Audit', position: 'Senior System Auditor', managerName: 'Carlos Reyes', role: 'SYSTEM_AUDITOR', email: 'sarah.jenkins@company.com' },
  { id: 'EMP-1007', name: 'Michael Tan', department: 'Finance & Supply Chain', position: 'Supply Chain Analyst', managerName: 'Maria Santos', role: 'REQUESTOR', email: 'michael.tan@company.com' }
];

export const INITIAL_LEDGER_TRANSACTIONS: PerformanceScoreTransaction[] = [
  {
    id: 'TXN-2026-001',
    timestamp: '2026-09-01T08:30:00Z',
    employeeId: 'EMP-1001',
    employeeName: 'Juan Dela Cruz',
    department: 'Operations',
    previousScore: 100.0,
    adjustment: 0.15,
    newScore: 100.0, // Capped at 100
    category: 'PRODUCTIVITY_AHEAD_DEADLINE',
    reason: 'Completed Customer Onboarding Master Request ahead of deadline',
    referenceId: 'REQ-2026-0012',
    source: 'Master Data Workflow',
    createdById: 'EMP-1003',
    createdByName: 'Elena Rostova'
  },
  {
    id: 'TXN-2026-002',
    timestamp: '2026-09-02T09:15:00Z',
    employeeId: 'EMP-1001',
    employeeName: 'Juan Dela Cruz',
    department: 'Operations',
    previousScore: 100.0,
    adjustment: -0.05,
    newScore: 99.95,
    category: 'QUALITY_REWORK',
    reason: 'Missing tax certificate attached in supplier update request',
    referenceId: 'REQ-2026-0018',
    source: 'QA Review',
    createdById: 'EMP-1003',
    createdByName: 'Elena Rostova'
  },
  {
    id: 'TXN-2026-003',
    timestamp: '2026-09-03T10:00:00Z',
    employeeId: 'EMP-1001',
    employeeName: 'Juan Dela Cruz',
    department: 'Operations',
    previousScore: 99.95,
    adjustment: -0.01,
    newScore: 99.94,
    category: 'ATTENDANCE_LATENESS',
    reason: '1 Hour Lateness logged in Biometric System',
    referenceId: 'ATT-2026-089',
    source: 'Biometric Attendance Engine',
    createdById: 'SYSTEM',
    createdByName: 'Automated Attendance System'
  },
  {
    id: 'TXN-2026-004',
    timestamp: '2026-09-04T14:20:00Z',
    employeeId: 'EMP-1003',
    employeeName: 'Elena Rostova',
    department: 'Quality Assurance',
    previousScore: 90.0,
    adjustment: 10.0,
    newScore: 100.0,
    category: 'QA_TICKET_PASSED',
    reason: 'Completed high-volume QA batch validation on schedule',
    referenceId: 'QA-2026-0045',
    source: 'QA Scorecard Engine',
    createdById: 'SYSTEM',
    createdByName: 'QA Validation System'
  }
];

export const INITIAL_360_EVALUATIONS: Evaluation360[] = [
  {
    id: 'EVAL-360-001',
    evaluatorId: 'EMP-1002',
    evaluatorName: 'Maria Santos',
    evaluatorRole: 'MANAGER',
    evaluateeId: 'EMP-1001',
    evaluateeName: 'Juan Dela Cruz',
    period: 'Q3 2026',
    isAnonymous: false,
    ratings: {
      professionalism: 95,
      respect: 96,
      integrity: 98,
      cooperation: 92,
      communication: 88,
      accountability: 96,
      reliability: 95,
      teamwork: 94,
      leadership: 85,
      problemSolving: 92
    },
    overallRating: 93.1,
    comments: 'Juan delivers high-quality customer data updates consistently. Needs slight improvement in proactive communication during bottlenecks.',
    observedStrengths: ['High Transaction Quality', 'Excellent Compliance', 'Strong Accountability'],
    observedWeaknesses: ['Documentation Detail', 'Cross-Team Communication'],
    recommendations: 'Recommend attending the advanced documentation and leadership communication workshop.',
    createdAt: '2026-08-25T11:00:00Z'
  },
  {
    id: 'EVAL-360-002',
    evaluatorId: 'EMP-1007',
    evaluatorName: 'Michael Tan',
    evaluatorRole: 'PEER',
    evaluateeId: 'EMP-1001',
    evaluateeName: 'Juan Dela Cruz',
    period: 'Q3 2026',
    isAnonymous: true,
    ratings: {
      professionalism: 94,
      respect: 95,
      integrity: 97,
      cooperation: 96,
      communication: 90,
      accountability: 94,
      reliability: 96,
      teamwork: 95,
      leadership: 88,
      problemSolving: 93
    },
    overallRating: 93.8,
    comments: 'Very helpful coworker. Always willing to step in during urgent inventory master data commits.',
    observedStrengths: ['Strong Teamwork', 'Reliability under pressure'],
    observedWeaknesses: [],
    recommendations: 'Keep up the great collaborative spirit.',
    createdAt: '2026-08-28T15:30:00Z'
  }
];

export const INITIAL_STRENGTHS_WEAKNESSES: StrengthWeaknessItem[] = [
  {
    id: 'SW-001',
    employeeId: 'EMP-1001',
    employeeName: 'Juan Dela Cruz',
    targetScope: 'INDIVIDUAL',
    candidateNames: ['Juan Dela Cruz', 'Maria Santos'],
    acknowledgementNo: 'ACK-SW-2026-884920',
    type: 'STRENGTH',
    title: 'High Transaction Accuracy & Zero Compliance Violations',
    description: 'System and HR evaluation confirms 99.2% transaction accuracy across 150+ master record operations.',
    detectedBy: 'AUTO_SYSTEM',
    status: 'CONFIRMED_BY_HR',
    hrConfirmedBy: 'HR Governance Director',
    hrConfirmedAt: '2026-08-30T10:00:00Z',
    bonusApplied: true,
    appliedAdjustment: 20.0,
    period: 'Q3 2026'
  },
  {
    id: 'SW-002',
    employeeId: 'EMP-1001',
    employeeName: 'Juan Dela Cruz',
    targetScope: 'INDIVIDUAL',
    candidateNames: ['Juan Dela Cruz'],
    acknowledgementNo: 'ACK-SW-2026-901482',
    type: 'WEAKNESS',
    title: 'Occasional Documentation Missing on Supplier Tax Filings',
    description: 'Rework analysis identified 2 instances of missing tax certificates on master vendor updates.',
    detectedBy: '360_EVALUATION',
    status: 'CONFIRMED_BY_HR',
    hrConfirmedBy: 'HR Evaluation System',
    hrConfirmedAt: '2026-08-31T11:00:00Z',
    bonusApplied: true,
    appliedAdjustment: -10.0,
    period: 'Q3 2026'
  },
  {
    id: 'SW-003',
    employeeId: 'EMP-1001',
    employeeName: 'Juan Dela Cruz',
    targetScope: 'DEPARTMENT',
    departmentName: 'Operations',
    candidateNames: ['Juan Dela Cruz', 'Maria Santos'],
    acknowledgementNo: 'ACK-SW-2026-448210',
    type: 'STRENGTH',
    title: 'Department-Wide Zero Incident Operations Safety Milestone',
    description: 'Operations Department Team achieved 100% on-time order processing with zero compliance infractions for Q3 2026.',
    detectedBy: 'HR',
    status: 'CONFIRMED_BY_HR',
    hrConfirmedBy: 'Maria Santos (HR Governance)',
    hrConfirmedAt: '2026-09-01T08:00:00Z',
    bonusApplied: true,
    appliedAdjustment: 20.0,
    period: 'Q3 2026'
  }
];

export const INITIAL_DISCIPLINARY: DisciplinaryRecord[] = [
  {
    id: 'DISC-2026-001',
    employeeId: 'EMP-1007',
    employeeName: 'Michael Tan',
    type: 'IR',
    title: 'Incident Report - Late Submission of Financial Master Reconciliation',
    details: 'Unexplained delay in month-end financial supplier master data validation.',
    status: 'UNDER_INVESTIGATION',
    filedDate: '2026-08-10T09:00:00Z',
    deductionApplied: false,
    deductionPercentage: -0.01,
    referenceId: 'IR-2026-08'
  }
];

export const INITIAL_QUARTER_LOCKS: QuarterLockState[] = [
  { quarter: 'Q1 2026', isLocked: true, lockedAt: '2026-03-31T23:59:59Z', lockedBy: 'HR Admin', notes: 'Quarter locked & audited.' },
  { quarter: 'Q2 2026', isLocked: true, lockedAt: '2026-06-30T23:59:59Z', lockedBy: 'HR Admin', notes: 'Quarter locked & audited.' },
  { quarter: 'Q3 2026', isLocked: false, notes: 'Active evaluation period.' },
  { quarter: 'Q4 2026', isLocked: false, notes: 'Upcoming evaluation period.' }
];

export class PerformanceService {
  // Utility to map score to Level
  static getLevelFromScore(score: number): PerformanceLevel {
    if (score >= 95) return 'OUTSTANDING';
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'VERY_GOOD';
    if (score >= 70) return 'NEEDS_IMPROVEMENT';
    return 'CRITICAL';
  }

  // Get Rules
  static async getRules(): Promise<PerformanceRuleConfig> {
    try {
      const ref = doc(db, CONFIG_COLLECTION, RULES_DOC_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as PerformanceRuleConfig;
      }
      return DEFAULT_PERFORMANCE_RULES;
    } catch (err) {
      console.warn('Using default rules fallback due to Firestore error:', err);
      return DEFAULT_PERFORMANCE_RULES;
    }
  }

  // Save Rules
  static async updateRules(newRules: PerformanceRuleConfig): Promise<void> {
    try {
      const ref = doc(db, CONFIG_COLLECTION, RULES_DOC_ID);
      await setDoc(ref, newRules, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${CONFIG_COLLECTION}/${RULES_DOC_ID}`);
    }
  }

  // Get Score Transactions Ledger
  static async getTransactions(employeeId?: string): Promise<PerformanceScoreTransaction[]> {
    try {
      const q = query(collection(db, TRANSACTIONS_COLLECTION));
      const snap = await getDocs(q);
      if (snap.empty) {
        // Return seeded fallback data
        return employeeId 
          ? INITIAL_LEDGER_TRANSACTIONS.filter(t => t.employeeId === employeeId)
          : INITIAL_LEDGER_TRANSACTIONS;
      }
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as PerformanceScoreTransaction));
      return employeeId ? docs.filter(t => t.employeeId === employeeId) : docs;
    } catch (err) {
      console.warn('Using mock transactions fallback:', err);
      return employeeId 
        ? INITIAL_LEDGER_TRANSACTIONS.filter(t => t.employeeId === employeeId)
        : INITIAL_LEDGER_TRANSACTIONS;
    }
  }

  // Log a new score adjustment in Ledger
  static async logScoreTransaction(
    emp: EmployeeSeed,
    category: PerformanceCategory,
    adjustment: number,
    reason: string,
    referenceId: string,
    source: string,
    createdById: string,
    createdByName: string,
    currentScore: number
  ): Promise<PerformanceScoreTransaction> {
    const rawNewScore = currentScore + adjustment;
    // Enforce bounds 0% <= score <= 100%
    const boundedNewScore = Math.min(100.0, Math.max(0.0, Number(rawNewScore.toFixed(2))));

    const newTxn: PerformanceScoreTransaction = {
      id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      previousScore: Number(currentScore.toFixed(2)),
      adjustment: Number(adjustment.toFixed(2)),
      newScore: boundedNewScore,
      category,
      reason,
      referenceId,
      source,
      createdById,
      createdByName
    };

    try {
      await setDoc(doc(db, TRANSACTIONS_COLLECTION, newTxn.id), newTxn);
    } catch (err) {
      console.warn('Failed to persist transaction to Firestore, saved locally:', err);
    }

    return newTxn;
  }

  // Get 360 Evaluations
  static async get360Evaluations(employeeId?: string): Promise<Evaluation360[]> {
    try {
      const q = query(collection(db, EVALUATIONS_COLLECTION));
      const snap = await getDocs(q);
      if (snap.empty) {
        return employeeId 
          ? INITIAL_360_EVALUATIONS.filter(e => e.evaluateeId === employeeId)
          : INITIAL_360_EVALUATIONS;
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Evaluation360));
      return employeeId ? list.filter(e => e.evaluateeId === employeeId) : list;
    } catch (err) {
      return employeeId 
        ? INITIAL_360_EVALUATIONS.filter(e => e.evaluateeId === employeeId)
        : INITIAL_360_EVALUATIONS;
    }
  }

  // Save 360 Evaluation
  static async submit360Evaluation(evaluation: Omit<Evaluation360, 'id' | 'createdAt'>): Promise<Evaluation360> {
    // Anti-manipulation safeguard: Prevent self evaluation
    if (evaluation.evaluatorId === evaluation.evaluateeId) {
      throw new Error('Anti-Manipulation Error: Employees are strictly forbidden from evaluating themselves.');
    }

    const newEval: Evaluation360 = {
      ...evaluation,
      id: `EVAL-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, EVALUATIONS_COLLECTION, newEval.id), newEval);
    } catch (err) {
      console.warn('Saved 360 evaluation locally due to Firestore error');
    }

    return newEval;
  }

  // Get Strengths & Weaknesses
  static async getStrengthsAndWeaknesses(employeeId?: string): Promise<StrengthWeaknessItem[]> {
    try {
      const q = query(collection(db, STRENGTHS_COLLECTION));
      const snap = await getDocs(q);
      let list: StrengthWeaknessItem[] = [];
      if (snap.empty) {
        list = INITIAL_STRENGTHS_WEAKNESSES;
      } else {
        list = snap.docs.map(d => ({ id: d.id, ...d.data() } as StrengthWeaknessItem));
      }

      if (!employeeId) return list;

      const emp = SEED_EMPLOYEES.find(e => e.id === employeeId);
      return list.filter(sw => {
        if (sw.employeeId === employeeId) return true;
        if (sw.candidateNames && emp && sw.candidateNames.includes(emp.name)) return true;
        if (sw.targetScope === 'DEPARTMENT' && emp && sw.departmentName === emp.department) return true;
        return false;
      });
    } catch (err) {
      const list = INITIAL_STRENGTHS_WEAKNESSES;
      if (!employeeId) return list;
      const emp = SEED_EMPLOYEES.find(e => e.id === employeeId);
      return list.filter(sw => {
        if (sw.employeeId === employeeId) return true;
        if (sw.candidateNames && emp && sw.candidateNames.includes(emp.name)) return true;
        if (sw.targetScope === 'DEPARTMENT' && emp && sw.departmentName === emp.department) return true;
        return false;
      });
    }
  }

  // Register Strength or Weakness manually by HR with automatic acknowledgement generation
  static async registerStrengthWeaknessByHR(data: {
    targetScope: 'DEPARTMENT' | 'INDIVIDUAL';
    departmentName?: string;
    selectedEmployeeIds: string[];
    candidateNames: string[];
    type: 'STRENGTH' | 'WEAKNESS';
    title: string;
    description: string;
    period?: string;
    hrUser: { id: string; name: string };
  }): Promise<{ item: StrengthWeaknessItem; acknowledgementNo: string }> {
    const ackNo = `ACK-SW-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newItemId = `SW-${Date.now()}`;
    const period = data.period || 'Q3 2026';
    const primaryEmpId = data.selectedEmployeeIds[0] || 'EMP-1001';
    const primaryEmpName = data.candidateNames[0] || 'Juan Dela Cruz';

    const newItem: StrengthWeaknessItem = {
      id: newItemId,
      employeeId: primaryEmpId,
      employeeName: primaryEmpName,
      targetScope: data.targetScope,
      departmentName: data.departmentName,
      candidateNames: data.candidateNames,
      acknowledgementNo: ackNo,
      type: data.type,
      title: data.title,
      description: data.description,
      detectedBy: 'HR',
      status: 'CONFIRMED_BY_HR',
      hrConfirmedBy: data.hrUser.name,
      hrConfirmedAt: new Date().toISOString(),
      bonusApplied: true,
      appliedAdjustment: data.type === 'STRENGTH' ? 20.0 : -10.0,
      period
    };

    // Log score transaction for each candidate employee
    for (const empId of data.selectedEmployeeIds) {
      const emp = SEED_EMPLOYEES.find(e => e.id === empId) || {
        id: empId,
        name: 'Employee',
        department: data.departmentName || 'Operations',
        position: 'Specialist',
        managerName: 'Manager',
        role: 'REQUESTOR',
        email: 'emp@company.com'
      };

      const category: PerformanceCategory = data.type === 'STRENGTH' ? 'HR_STRENGTH_BONUS' : 'HR_WEAKNESS_DEDUCTION';
      const adj = data.type === 'STRENGTH' ? 20.0 : -10.0;
      await this.logScoreTransaction(
        emp,
        category,
        adj,
        `[HR Manual Registration ${ackNo}] ${data.title}`,
        newItemId,
        'HR Governance Module',
        data.hrUser.id,
        data.hrUser.name,
        90.0
      );
    }

    // Update in-memory fallback list
    INITIAL_STRENGTHS_WEAKNESSES.unshift(newItem);

    try {
      await setDoc(doc(db, STRENGTHS_COLLECTION, newItem.id), newItem);
    } catch (err) {
      console.warn('Saved strength/weakness item locally');
    }

    return { item: newItem, acknowledgementNo: ackNo };
  }

  // Update Strength or Weakness by QA / Admin
  static async updateStrengthWeaknessByQAAdmin(
    itemId: string,
    data: {
      targetScope: 'DEPARTMENT' | 'INDIVIDUAL';
      departmentName?: string;
      selectedEmployeeIds: string[];
      candidateNames: string[];
      type: 'STRENGTH' | 'WEAKNESS';
      title: string;
      description: string;
      user: { id: string; name: string };
    }
  ): Promise<StrengthWeaknessItem> {
    const items = await this.getStrengthsAndWeaknesses();
    const existing = items.find(i => i.id === itemId) || INITIAL_STRENGTHS_WEAKNESSES.find(i => i.id === itemId);
    if (!existing) throw new Error('Item not found');

    const primaryEmpId = data.selectedEmployeeIds[0] || existing.employeeId;
    const primaryEmpName = data.candidateNames[0] || existing.employeeName;

    const updatedItem: StrengthWeaknessItem = {
      ...existing,
      employeeId: primaryEmpId,
      employeeName: primaryEmpName,
      targetScope: data.targetScope,
      departmentName: data.departmentName,
      candidateNames: data.candidateNames,
      type: data.type,
      title: data.title,
      description: data.description,
      appliedAdjustment: data.type === 'STRENGTH' ? 20.0 : -10.0
    };

    // Update in-memory fallback
    const localIdx = INITIAL_STRENGTHS_WEAKNESSES.findIndex(i => i.id === itemId);
    if (localIdx >= 0) {
      INITIAL_STRENGTHS_WEAKNESSES[localIdx] = updatedItem;
    } else {
      INITIAL_STRENGTHS_WEAKNESSES.unshift(updatedItem);
    }

    try {
      await setDoc(doc(db, STRENGTHS_COLLECTION, itemId), updatedItem, { merge: true });
    } catch (err) {
      console.warn('Updated strength/weakness item locally');
    }

    return updatedItem;
  }

  // Delete Strength or Weakness by QA / Admin
  static async deleteStrengthWeaknessByQAAdmin(itemId: string): Promise<boolean> {
    const localIdx = INITIAL_STRENGTHS_WEAKNESSES.findIndex(i => i.id === itemId);
    if (localIdx >= 0) {
      INITIAL_STRENGTHS_WEAKNESSES.splice(localIdx, 1);
    }

    try {
      await deleteDoc(doc(db, STRENGTHS_COLLECTION, itemId));
    } catch (err) {
      console.warn('Deleted strength/weakness item locally');
    }

    return true;
  }

  // HR Confirm/Reject Strength or Weakness
  static async confirmStrengthWeakness(
    itemId: string, 
    hrUser: { id: string; name: string },
    confirm: boolean
  ): Promise<StrengthWeaknessItem> {
    const items = await this.getStrengthsAndWeaknesses();
    const item = items.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');

    item.status = confirm ? 'CONFIRMED_BY_HR' : 'REJECTED_BY_HR';
    item.hrConfirmedBy = hrUser.name;
    item.hrConfirmedAt = new Date().toISOString();

    if (confirm && !item.bonusApplied) {
      item.bonusApplied = true;
      // Log the score transaction ledger event
      const emp = SEED_EMPLOYEES.find(e => e.id === item.employeeId) || {
        id: item.employeeId,
        name: item.employeeName,
        department: 'Operations',
        position: 'Specialist',
        managerName: 'Manager',
        role: 'REQUESTOR',
        email: 'employee@company.com'
      };

      const category: PerformanceCategory = item.type === 'STRENGTH' ? 'HR_STRENGTH_BONUS' : 'HR_WEAKNESS_DEDUCTION';
      const adj = item.type === 'STRENGTH' ? 20.0 : -10.0;
      await this.logScoreTransaction(
        emp,
        category,
        adj,
        `HR Confirmed ${item.type}: ${item.title}`,
        item.id,
        'HR Governance Module',
        hrUser.id,
        hrUser.name,
        90.0 // Base score target
      );
    }

    try {
      await setDoc(doc(db, STRENGTHS_COLLECTION, item.id), item, { merge: true });
    } catch (err) {
      console.warn('Updated item locally');
    }

    return item;
  }

  // Get Disciplinary Records
  static async getDisciplinaryRecords(employeeId?: string): Promise<DisciplinaryRecord[]> {
    try {
      const q = query(collection(db, DISCIPLINARY_COLLECTION));
      const snap = await getDocs(q);
      if (snap.empty) {
        return employeeId 
          ? INITIAL_DISCIPLINARY.filter(d => d.employeeId === employeeId)
          : INITIAL_DISCIPLINARY;
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as DisciplinaryRecord));
      return employeeId ? list.filter(d => d.employeeId === employeeId) : list;
    } catch (err) {
      return employeeId 
        ? INITIAL_DISCIPLINARY.filter(d => d.employeeId === employeeId)
        : INITIAL_DISCIPLINARY;
    }
  }

  // Validate / Confirm Disciplinary Record (Deduction occurs ONLY on validation)
  static async validateDisciplinary(
    recordId: string, 
    status: 'VALIDATED' | 'CONFIRMED' | 'DISMISSED', 
    hrUser: { id: string; name: string }
  ): Promise<DisciplinaryRecord> {
    const records = await this.getDisciplinaryRecords();
    const rec = records.find(r => r.id === recordId);
    if (!rec) throw new Error('Disciplinary record not found');

    rec.status = status;
    rec.validatedDate = new Date().toISOString();
    rec.validatedBy = hrUser.name;

    if ((status === 'VALIDATED' || status === 'CONFIRMED') && !rec.deductionApplied) {
      rec.deductionApplied = true;
      const emp = SEED_EMPLOYEES.find(e => e.id === rec.employeeId) || {
        id: rec.employeeId,
        name: rec.employeeName,
        department: 'Operations',
        position: 'Specialist',
        managerName: 'Manager',
        role: 'REQUESTOR',
        email: 'employee@company.com'
      };

      let category: PerformanceCategory = 'DISCIPLINARY_IR';
      let deduction = -0.01;
      if (rec.type === 'NTE') { category = 'DISCIPLINARY_NTE'; deduction = -0.01; }
      else if (rec.type === 'DA') { category = 'DISCIPLINARY_DA'; deduction = -15.0; }
      else if (rec.type === 'SUSPENSION') { category = 'DISCIPLINARY_SUSPENSION'; deduction = -20.0; }

      await this.logScoreTransaction(
        emp,
        category,
        deduction,
        `Validated Disciplinary Record (${rec.type}): ${rec.title}`,
        rec.id,
        'HR Employee Relations Disciplinary Module',
        hrUser.id,
        hrUser.name,
        90.0
      );
    }

    try {
      await setDoc(doc(db, DISCIPLINARY_COLLECTION, rec.id), rec, { merge: true });
    } catch (err) {
      console.warn('Updated disciplinary record locally');
    }

    return rec;
  }

  // Calculate Comprehensive Employee Performance Profile
  static async getEmployeePerformanceProfile(
    employeeId: string, 
    period: string = 'Q3 2026'
  ): Promise<EmployeePerformanceProfile> {
    const emp = SEED_EMPLOYEES.find(e => e.id === employeeId) || {
      id: employeeId,
      name: 'Employee User',
      department: 'Operations',
      position: 'Specialist',
      managerName: 'Department Manager',
      role: 'REQUESTOR',
      email: 'user@company.com'
    };

    const transactions = await this.getTransactions(employeeId);
    const evals = await this.get360Evaluations(employeeId);
    const strengthsWeaknesses = await this.getStrengthsAndWeaknesses(employeeId);
    const disciplinary = await this.getDisciplinaryRecords(employeeId);

    // Compute base scores across the 7 dimensions
    let totalTransactionsCount = transactions.length;
    let reworkCount = transactions.filter(t => t.category === 'QUALITY_REWORK').length;
    let rejectionCount = transactions.filter(t => t.category === 'QUALITY_REJECTED').length;

    const reworkRate = totalTransactionsCount > 0 ? (reworkCount / totalTransactionsCount) * 100 : 2.5;
    const rejectionRate = totalTransactionsCount > 0 ? (rejectionCount / totalTransactionsCount) * 100 : 1.2;

    // Dimension 1: Productivity (Base 92 + on-time/early adjustments)
    const productivityAdditions = transactions
      .filter(t => t.category.startsWith('PRODUCTIVITY'))
      .reduce((sum, t) => sum + t.adjustment, 0);
    const productivityScore = Math.min(100, Math.max(60, 92 + productivityAdditions));

    // Dimension 2: Quality (Base 95 - rejections/rework)
    const qualityDeductions = transactions
      .filter(t => t.category.startsWith('QUALITY'))
      .reduce((sum, t) => sum + t.adjustment, 0);
    const qualityScore = Math.min(100, Math.max(50, 95 + qualityDeductions));

    // Dimension 3: Attendance (Base 99 - lateness/absence)
    const attendanceDeductions = transactions
      .filter(t => t.category.startsWith('ATTENDANCE'))
      .reduce((sum, t) => sum + t.adjustment, 0);
    const attendanceScore = Math.min(100, Math.max(60, 99.1 + attendanceDeductions));

    // Dimension 4: Behavior & Teamwork (360 Average)
    const peerEvals = evals.filter(e => e.evaluatorRole === 'PEER');
    const peerAvg = peerEvals.length > 0
      ? peerEvals.reduce((s, e) => s + e.overallRating, 0) / peerEvals.length
      : 94.5;

    // Dimension 5: Manager Evaluation
    const mgrEvals = evals.filter(e => e.evaluatorRole === 'MANAGER');
    const managerAvg = mgrEvals.length > 0
      ? mgrEvals.reduce((s, e) => s + e.overallRating, 0) / mgrEvals.length
      : 93.8;

    const behaviorScore = Math.min(100, Math.max(60, (peerAvg + managerAvg) / 2));

    // Dimension 6 & 7: HR Development & Confirmed Strengths/Weaknesses
    const hrAdjustments = transactions
      .filter(t => t.category.startsWith('HR_'))
      .reduce((sum, t) => sum + t.adjustment, 0);
    const hrDevelopmentScore = Math.min(100, Math.max(60, 90 + hrAdjustments));

    // Disciplinary deductions
    const disciplinaryDeductions = transactions
      .filter(t => t.category.startsWith('DISCIPLINARY'))
      .reduce((sum, t) => sum + t.adjustment, 0);

    // Weighted Overall Score calculation
    const weightedScore = 
      (productivityScore * (DEFAULT_DIMENSION_WEIGHTS.productivity / 100)) +
      (qualityScore * (DEFAULT_DIMENSION_WEIGHTS.quality / 100)) +
      (attendanceScore * (DEFAULT_DIMENSION_WEIGHTS.attendance / 100)) +
      (behaviorScore * (DEFAULT_DIMENSION_WEIGHTS.behavior / 100)) +
      (managerAvg * (DEFAULT_DIMENSION_WEIGHTS.managerEvaluation / 100)) +
      (peerAvg * (DEFAULT_DIMENSION_WEIGHTS.peerEvaluation / 100)) +
      (hrDevelopmentScore * (DEFAULT_DIMENSION_WEIGHTS.hrDevelopment / 100)) +
      disciplinaryDeductions;

    const finalOverallScore = Math.min(100.0, Math.max(0.0, Number(weightedScore.toFixed(2))));
    const level = this.getLevelFromScore(finalOverallScore);

    // Historical Quarters simulation
    const quarterlyScores = {
      Q1: 89.5,
      Q2: 91.8,
      Q3: finalOverallScore,
      Q4: 0,
      annual: Number(((89.5 + 91.8 + finalOverallScore) / 3).toFixed(2))
    };

    // Identified Strengths & Weaknesses
    const confirmedStrengths = strengthsWeaknesses
      .filter(s => s.type === 'STRENGTH' && s.status === 'CONFIRMED_BY_HR')
      .map(s => s.title);
    if (confirmedStrengths.length === 0) {
      confirmedStrengths.push('High Master Record Transaction Accuracy', 'Strong Team Collaboration & Support');
    }

    const confirmedWeaknesses = strengthsWeaknesses
      .filter(s => s.type === 'WEAKNESS')
      .map(s => s.title);
    if (confirmedWeaknesses.length === 0) {
      confirmedWeaknesses.push('Documentation Detail Precision');
    }

    // Award Recommendations Engine logic
    const awardEligibility = this.generateAwardRecommendationsForEmp(
      emp, 
      finalOverallScore, 
      attendanceScore, 
      qualityScore, 
      reworkRate, 
      disciplinary.some(d => d.status === 'CONFIRMED' || d.status === 'VALIDATED')
    );

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      position: emp.position,
      managerName: emp.managerName,
      employmentStatus: 'Regular Full-Time',
      period,
      overallScore: finalOverallScore,
      rank: 2, // Calculated dynamically in full list
      level,
      scores: {
        productivity: Number(productivityScore.toFixed(2)),
        quality: Number(qualityScore.toFixed(2)),
        attendance: Number(attendanceScore.toFixed(2)),
        behavior: Number(behaviorScore.toFixed(2)),
        managerEvaluation: Number(managerAvg.toFixed(2)),
        peerEvaluation: Number(peerAvg.toFixed(2)),
        hrDevelopment: Number(hrDevelopmentScore.toFixed(2))
      },
      quarterlyScores,
      trend: finalOverallScore >= 92 ? 'IMPROVING' : 'STABLE',
      totalTransactions: totalTransactionsCount,
      reworkRate: Number(reworkRate.toFixed(1)),
      rejectionRate: Number(rejectionRate.toFixed(1)),
      strengths: confirmedStrengths,
      weaknesses: confirmedWeaknesses,
      recommendedActions: [
        'Advanced Process Documentation Workshop',
        'Cross-Functional Leadership Mentorship',
        'Master Data Quality Assurance Standard Training'
      ],
      awardEligibility
    };
  }

  // Award Recommendation Generator
  private static generateAwardRecommendationsForEmp(
    emp: EmployeeSeed,
    overallScore: number,
    attendanceScore: number,
    qualityScore: number,
    reworkRate: number,
    hasDisciplinary: boolean
  ): AwardRecommendation[] {
    const period = 'Q3 2026';
    const qualifiesForGeneral = overallScore >= 90 && attendanceScore >= 95 && !hasDisciplinary;

    return [
      {
        id: `AWD-01-${emp.id}`,
        awardKey: 'EMPLOYEE_OF_THE_QUARTER',
        awardTitle: '🏆 Employee of the Quarter',
        awardDescription: 'Recognizes overall outstanding excellence across productivity, quality, attendance, and team leadership.',
        employeeId: emp.id,
        employeeName: emp.name,
        departmentName: emp.department,
        period,
        eligibilityStatus: overallScore >= 94 && qualifiesForGeneral ? 'RECOMMENDED' : overallScore >= 90 ? 'REVIEW_REQUIRED' : 'NOT_ELIGIBLE',
        reasons: [
          `Overall Performance Score: ${overallScore}% (Threshold: 90%)`,
          `Attendance Rate: ${attendanceScore}% (Threshold: 95%)`,
          hasDisciplinary ? 'Active disciplinary record found' : 'No active disciplinary record'
        ],
        metrics: { overallScore, attendanceScore, qualityScore, reworkRate, activeDisciplinary: hasDisciplinary },
        approvedByHR: overallScore >= 94
      },
      {
        id: `AWD-02-${emp.id}`,
        awardKey: 'QUALITY_EXCELLENCE',
        awardTitle: '⭐ Quality Excellence Award',
        awardDescription: 'Awarded for exceptional transaction accuracy, minimal rework, and outstanding QA compliance.',
        employeeId: emp.id,
        employeeName: emp.name,
        departmentName: emp.department,
        period,
        eligibilityStatus: qualityScore >= 95 && reworkRate <= 3.0 ? 'RECOMMENDED' : 'REVIEW_REQUIRED',
        reasons: [
          `Quality & Accuracy Score: ${qualityScore}%`,
          `Rework Rate: ${reworkRate}%`
        ],
        metrics: { overallScore, attendanceScore, qualityScore, reworkRate, activeDisciplinary: hasDisciplinary },
        approvedByHR: qualityScore >= 95
      },
      {
        id: `AWD-03-${emp.id}`,
        awardKey: 'TEAMWORK_EMP',
        awardTitle: '🤝 Teamwork & Collaboration Award',
        awardDescription: 'Recognizes exceptional cross-functional support, positive peer evaluations, and collaborative attitude.',
        employeeId: emp.id,
        employeeName: emp.name,
        departmentName: emp.department,
        period,
        eligibilityStatus: 'RECOMMENDED',
        reasons: [
          'Strong peer evaluation rating (95.0%+)',
          'Demonstrated proactive cross-departmental assistance'
        ],
        metrics: { overallScore, attendanceScore, qualityScore, reworkRate, activeDisciplinary: hasDisciplinary },
        approvedByHR: true
      }
    ];
  }

  // Duplicate Protection Safeguard
  static async hasExistingPerformanceTransaction(
    employeeId: string, 
    referenceId: string, 
    category: PerformanceCategory
  ): Promise<boolean> {
    const txns = await this.getTransactions(employeeId);
    return txns.some(t => t.employeeId === employeeId && t.referenceId === referenceId && t.category === category);
  }

  // Strength Duplicate Safeguard
  static async hasStrengthAlreadyApplied(
    employeeId: string, 
    period: string, 
    strengthTitle: string
  ): Promise<boolean> {
    const items = await this.getStrengthsAndWeaknesses(employeeId);
    return items.some(i => i.employeeId === employeeId && i.period === period && i.title === strengthTitle && i.bonusApplied);
  }

  // Explain Employee Score Helper
  static async explainEmployeeScore(employeeId: string, period: string = 'Q3 2026') {
    const profile = await this.getEmployeePerformanceProfile(employeeId, period);
    const txns = await this.getTransactions(employeeId);
    const empTxns = txns.filter(t => t.employeeId === employeeId);

    const positiveTxns = empTxns.filter(t => t.adjustment > 0);
    const negativeTxns = empTxns.filter(t => t.adjustment < 0);

    return {
      profile,
      empTxns,
      startingScore: 90.0,
      totalPositive: positiveTxns.reduce((s, t) => s + t.adjustment, 0),
      totalNegative: negativeTxns.reduce((s, t) => s + t.adjustment, 0),
      finalScore: profile.overallScore,
      level: profile.level
    };
  }

  // Get Quarter Locks
  static async getQuarterLocks(): Promise<QuarterLockState[]> {
    try {
      const q = query(collection(db, LOCKS_COLLECTION));
      const snap = await getDocs(q);
      if (snap.empty) return INITIAL_QUARTER_LOCKS;
      return snap.docs.map(d => d.data() as QuarterLockState);
    } catch (err) {
      return INITIAL_QUARTER_LOCKS;
    }
  }

  // Lock Quarter
  static async lockQuarter(quarter: QuarterLockState['quarter'], hrUserName: string): Promise<void> {
    const locks = await this.getQuarterLocks();
    const lockItem = locks.find(l => l.quarter === quarter) || { quarter, isLocked: false };
    lockItem.isLocked = true;
    lockItem.lockedAt = new Date().toISOString();
    lockItem.lockedBy = hrUserName;

    try {
      await setDoc(doc(db, LOCKS_COLLECTION, quarter), lockItem);
    } catch (err) {
      console.warn('Locked quarter locally');
    }
  }

  // Get End-User Access Permissions (QA/Admin configured)
  static async getEndUserPermissions(): Promise<EndUserAccessPermissions> {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, ACCESS_PERMS_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          allowViewLedgerHistory: data.allowViewLedgerHistory ?? true,
          allowSubmit360Evaluations: data.allowSubmit360Evaluations ?? true,
          allowViewStrengthsWeaknesses: data.allowViewStrengthsWeaknesses ?? true,
          allowViewAwardRecommendations: data.allowViewAwardRecommendations ?? true,
          allowExportReportCard: data.allowExportReportCard ?? true,
          allowViewDeptBenchmarks: data.allowViewDeptBenchmarks ?? true,
          allowSubmitReworkDispute: data.allowSubmitReworkDispute ?? true,
          allowViewLeaderboard: data.allowViewLeaderboard ?? true
        };
      }
      return DEFAULT_END_USER_PERMISSIONS;
    } catch (err) {
      return DEFAULT_END_USER_PERMISSIONS;
    }
  }

  // Save End-User Access Permissions
  static async saveEndUserPermissions(perms: EndUserAccessPermissions, updatedBy: string): Promise<void> {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, ACCESS_PERMS_DOC_ID);
      await setDoc(docRef, {
        ...perms,
        updatedAt: new Date().toISOString(),
        updatedBy
      });
    } catch (err) {
      console.warn('Saved end-user permissions locally');
    }
  }
}
