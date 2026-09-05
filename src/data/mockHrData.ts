import { 
  Employee, 
  LeaveBalance, 
  HRRequest, 
  PolicyDocument, 
  BirthdayWish, 
  TrainingCourse, 
  EmployeeBenefit, 
  BenefitClaim, 
  JobVacancy, 
  Candidate, 
  PerformanceEvaluation 
} from '../types';
import { masterCentaurChemEmployees } from './centaurChemEmployees';

export const initialEmployees: Employee[] = masterCentaurChemEmployees;


export const sampleLeaveBalance: LeaveBalance = {
  employeeId: 'EMP-001',
  totalBalance: 15.0,
  additions: 20.0,
  deductions: 5.0,
  awarded: 15.0,
  pending: 3.0,
  carryOver: 4.0,
  taken: 2.0,
  adjustments: 1.0,
  carryOverExpires: 'Feb-28-2027',
};

export const initialBirthdayWishes: BirthdayWish[] = [
  {
    id: 'BW-1',
    employeeId: 'EMP-004',
    employeeName: 'Ernesto Calderon',
    avatar: 'EC',
    birthDateText: '10th April',
    daysAway: 3,
    isVisibleToOthers: true,
    wishes: [
      { from: 'Maria Santos', message: 'Happy upcoming Birthday Ernesto! Thank you for keeping the plant operations running smoothly!', timestamp: '2 hours ago' },
      { from: 'Dr. Arnold Cortina', message: 'Have a great celebration and fruitful year ahead!', timestamp: 'Yesterday' }
    ]
  },
  {
    id: 'BW-2',
    employeeId: 'EMP-002',
    employeeName: 'Maria Santos',
    avatar: 'MS',
    birthDateText: '15th September',
    daysAway: 14,
    isVisibleToOthers: true,
    wishes: [
      { from: 'Juan Dela Cruz', message: 'Advance happy birthday Maria! Best wishes from the QA lab.', timestamp: '3 days ago' }
    ]
  }
];

export const initialHRRequests: HRRequest[] = [
  {
    id: 'REQ-1082',
    employeeName: 'Maria Santos',
    employeeId: 'EMP-002',
    type: 'Leave Request',
    appliedDate: 'Aug 29, 2026',
    expectedDate: 'Sept 04, 2026',
    status: 'PENDING',
    notes: 'Vacation leave for annual family wellness gathering.',
    department: 'R&D',
  },
  {
    id: 'REQ-1081',
    employeeName: 'Rafael Alcantara',
    employeeId: 'EMP-006',
    type: 'Equipment Requisition',
    appliedDate: 'Aug 28, 2026',
    expectedDate: 'Sept 02, 2026',
    status: 'FORWARDED',
    notes: 'New barcode scanner and thermal label printer for North Warehouse.',
    department: 'Logistics',
  },
  {
    id: 'REQ-1079',
    employeeName: 'Juan Dela Cruz',
    employeeId: 'EMP-003',
    type: 'Overtime Approval',
    appliedDate: 'Aug 25, 2026',
    expectedDate: 'Aug 26, 2026',
    status: 'COMPLETED',
    notes: 'Overtime 4.5 hours for batch certification of sanitizer production line.',
    department: 'Quality Assurance',
  },
  {
    id: 'REQ-1075',
    employeeName: 'Ernesto Calderon',
    employeeId: 'EMP-004',
    type: 'COE Certificate',
    appliedDate: 'Aug 20, 2026',
    expectedDate: 'Aug 22, 2026',
    status: 'COMPLETED',
    notes: 'Certificate of Employment with compensation breakdown for home loan.',
    department: 'Manufacturing',
  },
  {
    id: 'REQ-1070',
    employeeName: 'Beatriz Gomez',
    employeeId: 'EMP-005',
    type: 'Training Request',
    appliedDate: 'Aug 15, 2026',
    expectedDate: 'Aug 18, 2026',
    status: 'COMPLETED',
    notes: 'Philippine DOLE / Labor Code 2026 Compliance Certification Seminar.',
    department: 'Human Resources',
  },
  {
    id: 'REQ-1065',
    employeeName: 'Rafael Alcantara',
    employeeId: 'EMP-006',
    type: 'Cash Advance',
    appliedDate: 'Aug 10, 2026',
    expectedDate: 'Aug 12, 2026',
    status: 'REJECTED',
    notes: 'Emergency cash advance requested prior to standard 6-month tenure threshold.',
    department: 'Logistics',
  }
];

export const initialPolicyDocuments: PolicyDocument[] = [
  {
    id: 'POL-01',
    title: 'Health and Safety Policy (Chemical Lab Safety Standards)',
    category: 'Safety',
    version: 'v4.2 - 2026',
    lastUpdated: 'Aug 15, 2026',
    required: true,
    status: 'PENDING',
  },
  {
    id: 'POL-02',
    title: 'Centaur Chem Code of Business Conduct & Ethics',
    category: 'Conduct',
    version: 'v3.1 - 2026',
    lastUpdated: 'Jan 10, 2026',
    required: true,
    status: 'ACCEPTED',
  },
  {
    id: 'POL-03',
    title: 'Remote GPS Timekeeping & Geofencing Protocol',
    category: 'Compliance',
    version: 'v2.0 - 2026',
    lastUpdated: 'Jul 01, 2026',
    required: true,
    status: 'ACCEPTED',
  },
  {
    id: 'POL-04',
    title: 'Employee Benefits & Health Maintenance (HMO) Guidelines',
    category: 'Benefits',
    version: 'v2.4 - 2026',
    lastUpdated: 'Mar 12, 2026',
    required: false,
    status: 'ACCEPTED',
  },
  {
    id: 'POL-05',
    title: 'Data Privacy & Intellectual Property Agreement',
    category: 'Compliance',
    version: 'v3.0 - 2026',
    lastUpdated: 'Feb 18, 2026',
    required: true,
    status: 'PENDING',
  }
];

export const initialPerformanceEvaluations: PerformanceEvaluation[] = [
  {
    id: 'PE-2026-01',
    employeeName: 'Dr. Arnold Cortina',
    employeeId: 'EMP-001',
    period: 'ACME General Performance Evaluation (180) - 2026',
    evaluationType: '180 Evaluation',
    kpiAchievementRate: 94,
    status: 'REVIEWED',
    reviewer: 'Executive Board',
    kpis: [
      { name: 'R&D Product Formulation Milestones', target: 100, achieved: 96, weight: 35, score: 33.6 },
      { name: 'ISO Chemical Quality Compliance Score', target: 100, achieved: 98, weight: 25, score: 24.5 },
      { name: 'Department Budget & Cost Optimization', target: 100, achieved: 90, weight: 20, score: 18.0 },
      { name: 'Team Mentorship & Laboratory Safety', target: 100, achieved: 95, weight: 20, score: 19.0 },
    ]
  },
  {
    id: 'PE-2026-02',
    employeeName: 'Maria Santos',
    employeeId: 'EMP-002',
    period: 'ACME General Performance Evaluation (180) - 2026',
    evaluationType: '180 Evaluation',
    kpiAchievementRate: 89,
    status: 'REVIEWED',
    reviewer: 'Dr. Arnold Cortina',
    kpis: [
      { name: 'New Polymer Compound Research', target: 100, achieved: 92, weight: 40, score: 36.8 },
      { name: 'Batch Testing Turnaround Time', target: 100, achieved: 88, weight: 30, score: 26.4 },
      { name: 'Cross-functional QA Collaboration', target: 100, achieved: 90, weight: 30, score: 27.0 },
    ]
  }
];

export const initialBenefits: EmployeeBenefit[] = [
  {
    id: 'BEN-01',
    benefitName: 'Executive Health & Medical Plan (Maxicare VIP)',
    type: 'HMO Medical',
    provider: 'Maxicare Healthcare PH',
    coverageAmount: 300000,
    monthlyDeduction: 0, // Fully subsidized by company
    companyContribution: 3500,
    status: 'ACTIVE',
    dependentsCount: 2,
    eligibleSince: '2021-03-15',
  },
  {
    id: 'BEN-02',
    benefitName: 'Group Term Life & Accidental Dismemberment',
    type: 'Life Insurance',
    provider: 'Sun Life Financial PH',
    coverageAmount: 1500000,
    monthlyDeduction: 0,
    companyContribution: 1200,
    status: 'ACTIVE',
    dependentsCount: 2,
    eligibleSince: '2021-03-15',
  },
  {
    id: 'BEN-03',
    benefitName: 'Monthly Flexi-Wellness & Medical Allowance',
    type: 'Flex Allowance',
    provider: 'Centaur Chem Enterprise Benefit Fund',
    coverageAmount: 5000,
    monthlyDeduction: 0,
    companyContribution: 5000,
    status: 'ACTIVE',
    dependentsCount: 0,
    eligibleSince: '2021-06-01',
  },
  {
    id: 'BEN-04',
    benefitName: 'Philippine Statutory Social Protection (SSS, PhilHealth, Pag-IBIG)',
    type: 'Statutory (SSS/PhilHealth/Pag-IBIG)',
    provider: 'Republic of the Philippines Government Agencies',
    coverageAmount: 200000,
    monthlyDeduction: 2450,
    companyContribution: 3850,
    status: 'ENROLLED',
    dependentsCount: 2,
    eligibleSince: '2021-03-15',
  },
  {
    id: 'BEN-05',
    benefitName: 'Dental Care & Optical Vision Subsidy',
    type: 'Dental & Optical',
    provider: 'Medicard Preferred Network',
    coverageAmount: 20000,
    monthlyDeduction: 0,
    companyContribution: 650,
    status: 'ACTIVE',
    dependentsCount: 2,
    eligibleSince: '2021-09-01',
  }
];

export const initialBenefitClaims: BenefitClaim[] = [
  {
    id: 'CLM-501',
    employeeName: 'Dr. Arnold Cortina',
    benefitType: 'Dental & Optical Subsidy',
    claimAmount: 4500,
    approvedAmount: 4500,
    dateSubmitted: 'Aug 24, 2026',
    status: 'REIMBURSED',
  },
  {
    id: 'CLM-502',
    employeeName: 'Maria Santos',
    benefitType: 'Flex Allowance - Prescription Medicine',
    claimAmount: 2850,
    approvedAmount: 2850,
    dateSubmitted: 'Aug 28, 2026',
    status: 'APPROVED',
  },
  {
    id: 'CLM-503',
    employeeName: 'Ernesto Calderon',
    benefitType: 'HMO Outpatient Consultation',
    claimAmount: 1800,
    approvedAmount: 1800,
    dateSubmitted: 'Aug 30, 2026',
    status: 'UNDER_REVIEW',
  }
];

export const initialVacancies: JobVacancy[] = [
  {
    id: 'VAC-01',
    title: 'Senior Industrial Chemist',
    department: 'Research & Development',
    location: 'BGC Taguig HQ / Plant',
    type: 'Full-Time',
    openings: 2,
    applicantsCount: 14,
    status: 'OPEN',
    postedDate: 'Aug 10, 2026',
    salaryRange: '₱65,000 - ₱85,000 / mo',
    experienceLevel: '5+ years R&D / Chemical manufacturing'
  },
  {
    id: 'VAC-02',
    title: 'Plant Quality Assurance Officer',
    department: 'Quality Assurance',
    location: 'Laguna Technopark Facility',
    type: 'Full-Time',
    openings: 1,
    applicantsCount: 9,
    status: 'INTERVIEWING',
    postedDate: 'Aug 15, 2026',
    salaryRange: '₱45,000 - ₱55,000 / mo',
    experienceLevel: '3+ years ISO 9001 audit experience'
  },
  {
    id: 'VAC-03',
    title: 'Chemical Sales & Business Development Executive',
    department: 'CRM & Commercial Sales',
    location: 'Metro Manila / Field Visits',
    type: 'Full-Time',
    openings: 3,
    applicantsCount: 22,
    status: 'OPEN',
    postedDate: 'Aug 01, 2026',
    salaryRange: '₱50,000 - ₱70,000 + Commissions',
    experienceLevel: 'B2B Technical Sales background'
  },
  {
    id: 'VAC-04',
    title: 'Warehouse & Inventory Lead',
    department: 'Logistics & Supply Chain',
    location: 'Bulacan Distribution Hub',
    type: 'Full-Time',
    openings: 1,
    applicantsCount: 7,
    status: 'OFFER_MADE',
    postedDate: 'Aug 05, 2026',
    salaryRange: '₱40,000 - ₱48,000 / mo',
    experienceLevel: 'ERP/WMS inventory experience'
  }
];

export const initialCandidates: Candidate[] = [
  {
    id: 'CAN-101',
    vacancyId: 'VAC-01',
    name: 'Engr. Joshua Del Rosario',
    email: 'joshua.delrosario@email.com',
    phone: '+63 917 555 3821',
    positionApplied: 'Senior Industrial Chemist',
    appliedDate: 'Aug 18, 2026',
    stage: 'TECHNICAL_INTERVIEW',
    rating: 5,
    notes: 'Licensed Chemical Engineer, 6 years in polymer synthesis at Petron.'
  },
  {
    id: 'CAN-102',
    vacancyId: 'VAC-01',
    name: 'Patricia Mae Ramos',
    email: 'patricia.ramos@email.com',
    phone: '+63 928 444 8920',
    positionApplied: 'Senior Industrial Chemist',
    appliedDate: 'Aug 22, 2026',
    stage: 'SCREENING',
    rating: 4,
    notes: 'MSc Chemistry from UP Diliman with focus on eco-friendly solvents.'
  },
  {
    id: 'CAN-103',
    vacancyId: 'VAC-02',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+63 919 777 1290',
    positionApplied: 'Plant Quality Assurance Officer',
    appliedDate: 'Aug 16, 2026',
    stage: 'MANAGEMENT_INTERVIEW',
    rating: 5,
    notes: 'Certified Lead Auditor for ISO 9001 and ISO 14001.'
  },
  {
    id: 'CAN-104',
    vacancyId: 'VAC-04',
    name: 'Dominic Valdez',
    email: 'dominic.valdez@email.com',
    phone: '+63 905 333 7812',
    positionApplied: 'Warehouse & Inventory Lead',
    appliedDate: 'Aug 08, 2026',
    stage: 'JOB_OFFER',
    rating: 5,
    notes: 'Offer letter dispatched with starting date Sept 15, 2026.'
  }
];

export const initialTrainingCourses: TrainingCourse[] = [
  {
    id: 'TRN-01',
    title: 'ISO 9001:2015 & Chemical Quality Assurance Protocols',
    category: 'Quality & Compliance',
    instructor: 'Bureau Veritas Certified Trainer',
    duration: '16 Hours (4 Modules)',
    enrolledCount: 18,
    status: 'IN_PROGRESS',
    progress: 75,
  },
  {
    id: 'TRN-02',
    title: 'OSHA & DOLE Hazardous Material Handling & Safety',
    category: 'Environment, Health & Safety',
    instructor: 'Engr. Ramon Bautista',
    duration: '8 Hours',
    enrolledCount: 32,
    status: 'COMPLETED',
    progress: 100,
  },
  {
    id: 'TRN-03',
    title: 'Modern ERP & Cloud Inventory Optimization Masterclass',
    category: 'Operational Excellence',
    instructor: 'Centaur Chem IT & Systems Team',
    duration: '12 Hours',
    enrolledCount: 24,
    status: 'UPCOMING',
    progress: 0,
  }
];

export const peersOnLeaveToday = [
  { id: 'EMP-002', name: 'Maria Santos', role: 'Senior Chemist', type: 'Vacation Leave', avatar: 'MS', returnDate: 'Sept 04' }
];

export const upcomingLeaves = [
  { id: 'EMP-004', name: 'Ernesto Calderon', role: 'Plant Manager', type: 'Birthday Leave', dates: 'Sept 03 - 04', avatar: 'EC' },
  { id: 'EMP-003', name: 'Juan Dela Cruz', role: 'QA Supervisor', type: 'Sick Leave Checkup', dates: 'Sept 05', avatar: 'JD' },
  { id: 'EMP-006', name: 'Rafael Alcantara', role: 'Logistics Lead', type: 'Emergency Leave', dates: 'Sept 06', avatar: 'RA' },
];
