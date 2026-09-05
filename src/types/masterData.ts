export type DomainType = 'CUSTOMER' | 'SUPPLIER' | 'ITEM';

export type LifecycleState = 
  | 'DRAFT'
  | 'PENDING_AI_CHECK'
  | 'PENDING_QA'
  | 'PENDING_MDM'
  | 'REVISION_REQUESTED'
  | 'ACTIVE'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'INACTIVE';

export type UserRole = 'REQUESTOR' | 'QA_REVIEWER' | 'MDM_MANAGER' | 'SYSTEM_AUDITOR';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerData {
  legalName: string;
  taxId: string;
  creditLimit: number;
  currency: string; // ISO 4217
  paymentTerms: string;
  industryCode: string;
  billingAddress: Address;
  shippingAddress: Address;
  cfoCoApprovalRequired?: boolean;
}

export interface SupplierData {
  legalEntityName: string;
  taxId: string;
  bankAccountNumber: string;
  swiftCode: string;
  paymentTerms: string;
  isoCertifications: string[];
  w9DocName?: string;
  w9AttachedAt?: string;
}

export interface ItemData {
  sku: string; // Pattern: ^[A-Z]{3}-[0-9]{5}$
  description: string;
  category: string;
  uom: string; // ISO 80000-1 (KG, LITERS, PC, GALLON, DRUM, REAM)
  costPrice: number;
  listPrice: number;
  grossMarginValid?: boolean;
  weightKg?: number;
  dimensionsCm?: string;
}

export interface AIGovernanceValidation {
  passed: boolean;
  confidenceScore: number; // S_match in [0.0, 1.0]
  matchedRecordIds: string[];
  standardizedFields: {
    legalName?: string;
    taxId?: string;
    formattedAddress?: string;
  };
  detectedIssues: string[];
  recommendations: string[];
  checkedAt?: string;
}

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  action: 
    | 'DRAFT_CREATED'
    | 'DRAFT_UPDATED'
    | 'AI_PRECHECK_COMPLETED'
    | 'SUBMITTED_FOR_QA'
    | 'REVISION_REQUESTED'
    | 'QA_APPROVED'
    | 'REGISTER_COMMITTED'
    | 'REQUEST_REJECTED'
    | 'RECORD_DEACTIVATED';
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  details?: string;
  fieldDeltas?: Record<string, { oldVal: any; newVal: any }>;
  aiScore?: number;
}

export interface MasterRequestDocument {
  id: string;
  domain: DomainType;
  status: LifecycleState;
  version: number;
  data: CustomerData | SupplierData | ItemData;
  governance: {
    aiValidation?: AIGovernanceValidation;
    qaReviewerId?: string;
    qaReviewerName?: string;
    qaComments?: string;
    approverId?: string;
    approverName?: string;
    duplicateJustification?: string | null;
    rejectionCategory?: string;
    rejectionReason?: string;
  };
  auditTrail: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MasterRecordDocument {
  id: string; // e.g., CUST-2026-00892, SUPP-2026-00104, ITEM-2026-00431
  domain: DomainType;
  status: 'ACTIVE' | 'INACTIVE';
  version: number;
  data: CustomerData | SupplierData | ItemData;
  governance: {
    aiValidation?: AIGovernanceValidation;
    qaReviewerId?: string;
    qaComments?: string;
    approverId?: string;
    duplicateJustification?: string | null;
  };
  auditTrail: AuditLogEntry[];
  committedAt: string;
  committedBy: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
}
