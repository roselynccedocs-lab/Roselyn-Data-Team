export type PerformanceUserRole = 
  | 'EMPLOYEE'
  | 'TEAM_LEAD'
  | 'MANAGER'
  | 'QA'
  | 'HR'
  | 'ADMIN'
  | 'MANAGEMENT';

export type PerformanceCategory =
  | 'PRODUCTIVITY_ON_TIME'
  | 'PRODUCTIVITY_AHEAD_DEADLINE'
  | 'PRODUCTIVITY_TICKET_RESOLVED'
  | 'PRODUCTIVITY_LATE'
  | 'QUALITY_REJECTED'
  | 'QUALITY_REWORK'
  | 'QUALITY_INCOMPLETE'
  | 'QUALITY_INCORRECT'
  | 'QUALITY_MISSING_DOC'
  | 'ATTENDANCE_LATENESS'
  | 'ATTENDANCE_ABSENCE'
  | 'DISCIPLINARY_IR'
  | 'DISCIPLINARY_NTE'
  | 'DISCIPLINARY_DA'
  | 'DISCIPLINARY_SUSPENSION'
  | 'QA_TICKET_PASSED'
  | 'QA_SLA_FAILURE'
  | 'HR_STRENGTH_BONUS'
  | 'HR_WEAKNESS_DEDUCTION'
  | 'EVALUATION_PEER_CONTRIBUTION'
  | 'EVALUATION_MANAGER_CONTRIBUTION'
  | 'MANUAL_OVERRIDE';

export interface PerformanceScoreTransaction {
  id: string;
  timestamp: string;
  employeeId: string;
  employeeName: string;
  department: string;
  previousScore: number;
  adjustment: number;
  newScore: number;
  category: PerformanceCategory;
  reason: string;
  referenceId: string;
  source: string;
  createdById: string;
  createdByName: string;
  approvedBy?: string;
  isOverride?: boolean;
  overrideReason?: string;
}

export interface PerformanceRuleConfig {
  onTimeCompletion: number;       // e.g. +0.10
  earlyCompletion: number;        // e.g. +0.15
  ticketResolution: number;       // e.g. +0.10
  rejectedTransaction: number;   // e.g. -0.10
  reworkRequired: number;        // e.g. -0.05
  incompleteSubmission: number;  // e.g. -0.05
  incorrectInformation: number;  // e.g. -0.05
  missingDocument: number;       // e.g. -0.05
  latenessPerHour: number;       // e.g. -0.01
  unapprovedAbsence: number;     // e.g. -0.01
  irIncidentReport: number;      // e.g. -0.01
  nteNoticeToExplain: number;    // e.g. -0.01
  daDisciplinaryAction: number;  // e.g. -15.0
  suspensionDeduction: number;   // e.g. -20.0
  qaTicketPassed: number;        // e.g. +10.0
  qaSlaFailure: number;          // e.g. -0.01
  hrStrengthBonus: number;       // e.g. +20.0
  hrWeaknessDeduction: number;   // e.g. -10.0
}

export interface DimensionWeights {
  productivity: number;     // e.g. 30
  quality: number;          // e.g. 20
  attendance: number;       // e.g. 10
  behavior: number;         // e.g. 15
  managerEvaluation: number;// e.g. 10
  peerEvaluation: number;   // e.g. 10
  hrDevelopment: number;    // e.g. 5
}

export interface Evaluation360 {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: 'PEER' | 'MANAGER' | 'SUBORDINATE' | 'HR';
  evaluateeId: string;
  evaluateeName: string;
  period: string; // e.g. "Q1 2026"
  isAnonymous: boolean;
  ratings: {
    professionalism: number; // 1-100
    respect: number;
    integrity: number;
    cooperation: number;
    communication: number;
    accountability: number;
    reliability: number;
    teamwork: number;
    leadership: number;
    problemSolving: number;
  };
  overallRating: number;
  comments: string;
  observedStrengths: string[];
  observedWeaknesses: string[];
  recommendations: string;
  createdAt: string;
}

export interface StrengthWeaknessItem {
  id: string;
  employeeId: string;
  employeeName: string;
  targetScope?: 'DEPARTMENT' | 'INDIVIDUAL';
  departmentName?: string;
  candidateNames?: string[];
  acknowledgementNo?: string;
  type: 'STRENGTH' | 'WEAKNESS';
  title: string;
  description: string;
  detectedBy: 'AUTO_SYSTEM' | '360_EVALUATION' | 'MANAGER' | 'HR';
  status: 'SUGGESTED' | 'CONFIRMED_BY_HR' | 'REJECTED_BY_HR';
  hrConfirmedBy?: string;
  hrConfirmedAt?: string;
  bonusApplied: boolean;
  appliedAdjustment: number;
  period: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_DEPARTURE' | 'APPROVED_LEAVE';
  lateHours: number;
  isApprovedLeave: boolean;
  leaveType?: 'VACATION' | 'SICK' | 'EMERGENCY' | 'OFFICIAL_BUSINESS';
  impactPercentage: number;
  referenceId: string;
}

export interface DisciplinaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'IR' | 'NTE' | 'DA' | 'SUSPENSION';
  title: string;
  details: string;
  status: 'FILED' | 'UNDER_INVESTIGATION' | 'VALIDATED' | 'DISMISSED' | 'CLOSED' | 'CONFIRMED';
  filedDate: string;
  validatedDate?: string;
  validatedBy?: string;
  deductionApplied: boolean;
  deductionPercentage: number;
  referenceId: string;
}

export interface AwardRecommendation {
  id: string;
  awardKey: 
    | 'SAFETY_FIRST'
    | 'INTEGRITY_ETHICS'
    | 'ACCOUNTABILITY'
    | 'INNOVATION'
    | 'TEAMWORK_DEPT'
    | 'TEAMWORK_EMP'
    | 'QUALITY_EXCELLENCE'
    | 'RESPECT_INCLUSIVITY'
    | 'TRANSPARENCY'
    | 'EMPLOYEE_OF_THE_QUARTER';
  awardTitle: string;
  awardDescription: string;
  employeeId?: string;
  employeeName?: string;
  departmentName?: string;
  period: string;
  eligibilityStatus: 'RECOMMENDED' | 'REVIEW_REQUIRED' | 'NOT_ELIGIBLE';
  reasons: string[];
  metrics: {
    overallScore: number;
    attendanceScore: number;
    qualityScore: number;
    reworkRate: number;
    activeDisciplinary: boolean;
  };
  approvedByHR: boolean;
}

export interface QuarterLockState {
  quarter: 'Q1 2026' | 'Q2 2026' | 'Q3 2026' | 'Q4 2026';
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  notes?: string;
}

export type PerformanceLevel = 'OUTSTANDING' | 'EXCELLENT' | 'VERY_GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';

export interface EndUserAccessPermissions {
  allowViewLedgerHistory: boolean;
  allowSubmit360Evaluations: boolean;
  allowViewStrengthsWeaknesses: boolean;
  allowViewAwardRecommendations: boolean;
  allowExportReportCard: boolean;
  allowViewDeptBenchmarks: boolean;
  allowSubmitReworkDispute: boolean;
  allowViewLeaderboard: boolean;
}

export interface EmployeePerformanceProfile {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  managerName: string;
  employmentStatus: string;
  period: string;
  overallScore: number; // 0 - 100
  rank: number;
  level: PerformanceLevel;
  scores: {
    productivity: number;
    quality: number;
    attendance: number;
    behavior: number;
    managerEvaluation: number;
    peerEvaluation: number;
    hrDevelopment: number;
  };
  quarterlyScores: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
    annual: number;
  };
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'CRITICAL';
  totalTransactions: number;
  reworkRate: number;
  rejectionRate: number;
  strengths: string[];
  weaknesses: string[];
  recommendedActions: string[];
  awardEligibility: AwardRecommendation[];
}
