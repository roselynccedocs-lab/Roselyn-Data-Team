export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'IT_ADMIN' | 'Admin' | 'User';

export interface UserProfile {
  id: string;
  uid?: string;
  email: string;
  displayName: string;
  role: UserRole | string;
  department: string;
  provider?: 'Google' | 'Microsoft' | 'Demo' | string;
  status?: 'ACTIVE' | 'SUSPENDED';
  photoURL?: string;
  createdAt: number;
  lastLogin?: number;
  employeeNo?: string;
  position?: string;
  employmentStatus?: string;
  dateHired?: string;
  personInCharge?: string;
  contact?: string;
}

export interface ActiveUserSession {
  sessionId: string;
  userId: string;
  email: string;
  displayName: string;
  employeeNo?: string;
  department: string;
  position?: string;
  role: string;
  photoURL?: string;
  loginTime: number;
  lastActive: number;
  ipAddress: string;
  device: string;
  location: string;
  status: 'ACTIVE' | 'IDLE' | 'TERMINATED';
}

export interface SecurityAuditEntry {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  employeeNo?: string;
  department: string;
  position?: string;
  role: string;
  eventType: 'LOGIN' | 'LOGOUT' | 'ROLE_CHANGE' | 'SESSION_TERMINATED';
  timestamp: number;
  ipAddress: string;
  device: string;
  method: string;
  status: 'SUCCESS' | 'TERMINATED' | 'FAILED';
  duration?: string;
  notes?: string;
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  path: string;
  roles: UserRole[];
}

// CRM & Sales
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'LEAD' | 'OPPORTUNITY' | 'CUSTOMER';
  assignedTo: string;
  createdAt: number;
}

export interface SalesOrder {
  id: string;
  customerName: string;
  quotationNumber: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  totalAmount: number; // in PHP
  status: 'QUOTATION' | 'CONFIRMED' | 'RESERVED' | 'IN_PACKING' | 'SHIPPED' | 'COLLECTED';
  createdAt: number;
}

// Inventory & Purchasing (PO to Payment)
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  minQuantity: number;
  warehouse: string;
  price: number; // in PHP
  lastUpdated: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  items: { name: string; qty: number; cost: number }[];
  totalCost: number; // in PHP
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'PAID';
  createdAt: number;
}

// HRIS / Core HR / Employee Lifecycle
export type EmployeeStatus = 
  | 'REGULAR' 
  | 'PROBATIONARY' 
  | 'CONTRACTUAL' 
  | 'RESIGNED' 
  | 'TERMINATED' 
  | 'END_OF_CONTRACT' 
  | 'AWOL' 
  | 'ACTIVE' 
  | 'ON_LEAVE';

export type EmploymentCategory = 
  | 'OWNER' 
  | 'MANAGERIAL' 
  | 'SUPERVISORY' 
  | 'RANK AND FILE' 
  | 'CONTRACTOR';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  nickname?: string;
  fullName?: string;
  email: string;
  cceEmail?: string;
  position: string;
  department: string;
  category?: EmploymentCategory | string;
  salary: number; // in PHP
  hireDate: number;
  dateOfEntry?: string;
  regularizationDate?: string;
  workingYears?: string;
  workingTime?: string;
  status: EmployeeStatus;
  lifeCycleStage?: 'ONBOARDING' | 'PROBATION' | 'REGULARIZED' | 'PROMOTED' | 'EXITING' | 'SEPARATED';
  contactNumber?: string;
  unionBankNumber?: string;
  sssNumber?: string;
  philHealthNumber?: string;
  pagIbigNumber?: string;
  tinNumber?: string;
  sunLifePolicy?: string;
  sunLifeEffDate?: string;
  philCareNo?: string;
  mediCardNo?: string;
  hmoClass?: string;
  gender?: 'MALE' | 'FEMALE' | string;
  birthDate?: string;
  age?: number;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'SEPARATED' | string;
  residentialAddress?: string;
  degreeLevel?: string;
  degreeEarned?: string;
  school?: string;
  emergencyContactPerson?: string;
  emergencyContactRelationship?: string;
  emergencyContactNumber?: string;
  previousEmployer?: string;
  departureDate?: string;
  departureReason?: string;
  remarks?: string;
  remainingLeave?: number;
  manager?: string;
  photoUrl?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface LeaveBalance {
  employeeId: string;
  totalBalance: number;
  additions: number;
  deductions: number;
  awarded: number;
  pending: number;
  carryOver: number;
  taken: number;
  adjustments: number;
  carryOverExpires: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Annual Leave' | 'Vacation Leave' | 'Sick Leave' | 'Emergency Leave' | 'Maternity/Paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FORWARDED';
  appliedDate: string;
  expectedResolution?: string;
}

export interface HRRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  type: 'Leave Request' | 'Overtime Approval' | 'Cash Advance' | 'COE Certificate' | 'Equipment Requisition' | 'Training Request';
  appliedDate: string;
  expectedDate: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'FORWARDED';
  notes: string;
  department: string;
}

export interface PolicyDocument {
  id: string;
  title: string;
  category: 'Safety' | 'Conduct' | 'Compliance' | 'Operations' | 'Benefits';
  version: string;
  lastUpdated: string;
  required: boolean;
  status: 'ACCEPTED' | 'PENDING' | 'REQUIRED';
  documentUrl?: string;
}

export interface BirthdayWish {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  birthDateText: string;
  daysAway: number;
  wishes: { from: string; message: string; timestamp: string }[];
  isVisibleToOthers: boolean;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  enrolledCount: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
}

// Benefits Management
export interface EmployeeBenefit {
  id: string;
  benefitName: string;
  type: 'HMO Medical' | 'Life Insurance' | 'Flex Allowance' | 'Statutory (SSS/PhilHealth/Pag-IBIG)' | 'Dental & Optical';
  provider: string;
  coverageAmount: number;
  monthlyDeduction: number;
  companyContribution: number;
  status: 'ACTIVE' | 'ENROLLED' | 'PENDING_RENEWAL';
  dependentsCount: number;
  eligibleSince: string;
}

export interface BenefitClaim {
  id: string;
  employeeName: string;
  benefitType: string;
  claimAmount: number;
  approvedAmount?: number;
  dateSubmitted: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REIMBURSED' | 'REJECTED';
  receiptUrl?: string;
}

// Recruitment & ATS
export interface JobVacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-Time' | 'Part-Time' | 'Contract';
  openings: number;
  applicantsCount: number;
  status: 'OPEN' | 'INTERVIEWING' | 'OFFER_MADE' | 'CLOSED';
  postedDate: string;
  salaryRange: string;
  experienceLevel: string;
}

export interface Candidate {
  id: string;
  vacancyId: string;
  name: string;
  email: string;
  phone: string;
  positionApplied: string;
  appliedDate: string;
  stage: 'APPLIED' | 'SCREENING' | 'TECHNICAL_INTERVIEW' | 'MANAGEMENT_INTERVIEW' | 'JOB_OFFER' | 'HIRED' | 'REJECTED';
  rating: number; // 1 to 5
  notes?: string;
  resumeUrl?: string;
}

// Performance & KPIs
export interface PerformanceEvaluation {
  id: string;
  employeeName: string;
  employeeId: string;
  period: string; // e.g. "ACME General Performance Evaluation (180) - 2026"
  evaluationType: '180 Evaluation' | '360 Evaluation' | 'Self Evaluation' | 'Quarterly KPI';
  kpiAchievementRate: number; // percentage
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'ACKNOWLEDGED';
  kpis: { name: string; target: number; achieved: number; weight: number; score: number }[];
  reviewer: string;
}

// Cloud POS System
export interface POSTransaction {
  id: string;
  receiptNumber: string;
  cashierName: string;
  customerName?: string;
  items: { productId: string; name: string; sku: string; price: number; qty: number; total: number }[];
  subtotal: number;
  taxAmount: number; // 12% VAT
  discountAmount: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'GCASH' | 'MAYA' | 'CHARGE_INVOICE';
  amountTendered: number;
  change: number;
  timestamp: number;
}

// IT Ticketing
export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdBy: string;
  assignedTo?: string;
  createdAt: number;
  updatedAt: number;
}

// Operations / Manufacturing (MRP, BOM, WIP, COGM/COGS)
export interface BillOfMaterials {
  id: string;
  itemName: string;
  version: string;
  components: { materialName: string; qtyRequired: number; unitCost: number }[];
  totalBOMCost: number;
}

export interface ManufacturingOrder {
  id: string;
  bomId: string;
  productName: string;
  quantity: number;
  status: 'PLANNED' | 'IN_PROCESS' | 'COMPLETED';
  wipStage: 'ASSEMBLY' | 'TESTING' | 'FINISHING' | 'READY';
  cogm: number; // Cost of Goods Manufactured
  startDate: number;
  endDate?: number;
}

// Logistics & Shipment Tracking
export interface Shipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  destination: string;
  carrier: string;
  status: 'PENDING_PICK' | 'PACKED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';
  backorderStatus: boolean;
  estimatedDelivery: string;
}

// Finance & Invoicing
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  dueDate: string;
  createdAt: number;
}

