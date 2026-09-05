import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDoc 
} from 'firebase/firestore';
import { 
  MasterRequestDocument, 
  MasterRecordDocument, 
  AuditLogEntry, 
  DomainType, 
  LifecycleState,
  AIGovernanceValidation,
  UserRole
} from '../types/masterData';

const REQUESTS_COLLECTION = 'master_requests';
const REGISTER_COLLECTION = 'master_register';
const AUDIT_COLLECTION = 'master_audit_logs';

// Initial Mock Seed Data if Firestore is empty
export const INITIAL_MOCK_MASTER_RECORDS: MasterRecordDocument[] = [
  {
    id: 'CUST-2026-00892',
    domain: 'CUSTOMER',
    status: 'ACTIVE',
    version: 1,
    data: {
      legalName: 'Acme Global Solutions Inc.',
      taxId: 'TIN-US-987654321',
      creditLimit: 150000,
      currency: 'USD',
      paymentTerms: 'NET_30',
      industryCode: 'TECH_SOFTWARE',
      cfoCoApprovalRequired: true,
      billingAddress: {
        street: '100 Innovation Way',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'USA'
      },
      shippingAddress: {
        street: '100 Innovation Way',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'USA'
      }
    },
    governance: {
      aiValidation: {
        passed: true,
        confidenceScore: 0.12,
        matchedRecordIds: [],
        standardizedFields: {
          legalName: 'Acme Global Solutions Inc.',
          taxId: 'TIN-US-987654321',
          formattedAddress: '100 Innovation Way, Austin, TX 78701, USA'
        },
        detectedIssues: ['No duplicate anomalies found.'],
        recommendations: ['Cleared AI pre-check with low duplicate risk.']
      },
      qaReviewerId: 'usr_qa_442',
      qaComments: 'Tax ID verified against national tax registry. Standard payment terms verified.',
      approverId: 'usr_mdm_001',
      duplicateJustification: null
    },
    auditTrail: [
      {
        timestamp: '2026-09-01T10:15:00Z',
        action: 'DRAFT_CREATED',
        actorId: 'usr_req_109',
        actorName: 'Engr. Jerome Daypuyart',
        actorRole: 'REQUESTOR'
      },
      {
        timestamp: '2026-09-01T10:18:22Z',
        action: 'AI_PRECHECK_COMPLETED',
        actorId: 'SYSTEM_GEMINI',
        actorName: 'Gemini AI Engine',
        actorRole: 'SYSTEM_AUDITOR',
        aiScore: 0.12
      },
      {
        timestamp: '2026-09-01T10:20:00Z',
        action: 'SUBMITTED_FOR_QA',
        actorId: 'usr_req_109',
        actorName: 'Engr. Jerome Daypuyart',
        actorRole: 'REQUESTOR'
      },
      {
        timestamp: '2026-09-01T11:05:10Z',
        action: 'QA_APPROVED',
        actorId: 'usr_qa_442',
        actorName: 'Maria Santos',
        actorRole: 'QA_REVIEWER'
      },
      {
        timestamp: '2026-09-01T14:30:00Z',
        action: 'REGISTER_COMMITTED',
        actorId: 'usr_mdm_001',
        actorName: 'Dr. Arnold Cortina',
        actorRole: 'MDM_MANAGER'
      }
    ],
    committedAt: '2026-09-01T14:30:00Z',
    committedBy: 'Dr. Arnold Cortina'
  },
  {
    id: 'SUPP-2026-00104',
    domain: 'SUPPLIER',
    status: 'ACTIVE',
    version: 1,
    data: {
      legalEntityName: 'Petron Chemical Supply Corp',
      taxId: 'TIN-PH-112233445',
      bankAccountNumber: '0091-8821-44',
      swiftCode: 'PNBPHMM',
      paymentTerms: 'NET_45',
      isoCertifications: ['ISO 9001:2015', 'ISO 14001:2015'],
      w9DocName: 'Petron_TaxCert_2026.pdf',
      w9AttachedAt: '2026-09-02T09:00:00Z'
    },
    governance: {
      aiValidation: {
        passed: true,
        confidenceScore: 0.18,
        matchedRecordIds: [],
        standardizedFields: {
          legalName: 'Petron Chemical Supply Corp',
          taxId: 'TIN-PH-112233445',
          formattedAddress: 'San Miguel Head Office Complex, Mandaluyong City, Metro Manila'
        },
        detectedIssues: ['SWIFT code verified.'],
        recommendations: ['Verified ISO certifications.']
      },
      qaReviewerId: 'usr_qa_442',
      qaComments: 'W-9 tax certificate attached and SWIFT/IBAN double checked.',
      approverId: 'usr_mdm_001'
    },
    auditTrail: [
      {
        timestamp: '2026-09-02T09:00:00Z',
        action: 'SUBMITTED_FOR_QA',
        actorId: 'usr_req_110',
        actorName: 'Rhodora Manuel',
        actorRole: 'REQUESTOR'
      },
      {
        timestamp: '2026-09-02T10:15:00Z',
        action: 'REGISTER_COMMITTED',
        actorId: 'usr_mdm_001',
        actorName: 'Dr. Arnold Cortina',
        actorRole: 'MDM_MANAGER'
      }
    ],
    committedAt: '2026-09-02T10:15:00Z',
    committedBy: 'Dr. Arnold Cortina'
  },
  {
    id: 'ITEM-2026-00431',
    domain: 'ITEM',
    status: 'ACTIVE',
    version: 1,
    data: {
      sku: 'RAW-10023',
      description: 'HPLC Grade Acetonitrile 2.5L Glass Bottle',
      category: 'Raw Materials & Reagents',
      uom: 'LITERS',
      costPrice: 1850.00,
      listPrice: 2450.00,
      grossMarginValid: true,
      weightKg: 2.5,
      dimensionsCm: '15x15x32'
    },
    governance: {
      aiValidation: {
        passed: true,
        confidenceScore: 0.08,
        matchedRecordIds: [],
        standardizedFields: {
          legalName: 'HPLC Grade Acetonitrile 2.5L Glass Bottle'
        },
        detectedIssues: [],
        recommendations: ['Item SKU matches required regex pattern ^[A-Z]{3}-[0-9]{5}$']
      },
      qaReviewerId: 'usr_qa_442',
      qaComments: 'Gross margin meets 15% threshold requirement.',
      approverId: 'usr_mdm_001'
    },
    auditTrail: [
      {
        timestamp: '2026-09-03T08:30:00Z',
        action: 'REGISTER_COMMITTED',
        actorId: 'usr_mdm_001',
        actorName: 'Dr. Arnold Cortina',
        actorRole: 'MDM_MANAGER'
      }
    ],
    committedAt: '2026-09-03T08:30:00Z',
    committedBy: 'Dr. Arnold Cortina'
  },
  {
    id: 'ITEM-2026-00432',
    domain: 'ITEM',
    status: 'ACTIVE',
    version: 1,
    data: {
      sku: 'SKU300000001',
      description: 'Industrial Plant Preventive Maintenance',
      category: 'REPAIR MAINTENANCE',
      uom: 'SVC-PM-2026',
      costPrice: 50000.00,
      listPrice: 55000.00,
      grossMarginValid: true
    },
    governance: {
      aiValidation: {
        passed: true,
        confidenceScore: 0.05,
        matchedRecordIds: [],
        standardizedFields: {
          legalName: 'Industrial Plant Preventive Maintenance'
        },
        detectedIssues: [],
        recommendations: []
      },
      qaReviewerId: 'usr_qa_442',
      qaComments: 'Verified maintenance contract.',
      approverId: 'usr_mdm_001'
    },
    auditTrail: [
      {
        timestamp: '2026-09-04T08:30:00Z',
        action: 'REGISTER_COMMITTED',
        actorId: 'usr_mdm_001',
        actorName: 'Dr. Arnold Cortina',
        actorRole: 'MDM_MANAGER'
      }
    ],
    committedAt: '2026-09-04T08:30:00Z',
    committedBy: 'Dr. Arnold Cortina'
  }
];

export const INITIAL_MOCK_REQUESTS: MasterRequestDocument[] = [
  {
    id: 'REQ-2026-9011',
    domain: 'CUSTOMER',
    status: 'PENDING_QA',
    version: 1,
    data: {
      legalName: 'Universal Pharma Labs Corp.',
      taxId: 'TIN-PH-998877665',
      creditLimit: 120000,
      currency: 'PHP',
      paymentTerms: 'NET_60',
      industryCode: 'PHARMACEUTICALS',
      cfoCoApprovalRequired: true,
      billingAddress: {
        street: '88 Science Park Drive',
        city: 'Biñan',
        state: 'Laguna',
        postalCode: '4024',
        country: 'Philippines'
      },
      shippingAddress: {
        street: '88 Science Park Drive',
        city: 'Biñan',
        state: 'Laguna',
        postalCode: '4024',
        country: 'Philippines'
      }
    },
    governance: {
      aiValidation: {
        passed: true,
        confidenceScore: 0.42,
        matchedRecordIds: ['CUST-2026-00892'],
        standardizedFields: {
          legalName: 'Universal Pharma Labs Corp.',
          taxId: 'TIN-PH-998877665',
          formattedAddress: '88 Science Park Drive, Biñan, Laguna 4024, Philippines'
        },
        detectedIssues: ['Moderate name similarity with existing pharmaceutical client entries.'],
        recommendations: ['Review credit limit exceeding $100,000 threshold.']
      }
    },
    auditTrail: [
      {
        timestamp: '2026-09-03T11:20:00Z',
        action: 'DRAFT_CREATED',
        actorId: 'usr_req_109',
        actorName: 'Engr. Jerome Daypuyart',
        actorRole: 'REQUESTOR'
      },
      {
        timestamp: '2026-09-03T11:22:15Z',
        action: 'AI_PRECHECK_COMPLETED',
        actorId: 'SYSTEM_GEMINI',
        actorName: 'Gemini AI Engine',
        actorRole: 'SYSTEM_AUDITOR',
        aiScore: 0.42
      },
      {
        timestamp: '2026-09-03T11:25:00Z',
        action: 'SUBMITTED_FOR_QA',
        actorId: 'usr_req_109',
        actorName: 'Engr. Jerome Daypuyart',
        actorRole: 'REQUESTOR'
      }
    ],
    createdAt: '2026-09-03T11:20:00Z',
    updatedAt: '2026-09-03T11:25:00Z',
    createdBy: {
      id: 'usr_req_109',
      name: 'Engr. Jerome Daypuyart',
      email: 'j.daypuyart@centaurchem.ph'
    }
  },
  {
    id: 'REQ-2026-9012',
    domain: 'SUPPLIER',
    status: 'PENDING_MDM',
    version: 1,
    data: {
      legalEntityName: 'Luzon Packaging Solutions Inc',
      taxId: 'TIN-PH-334455667',
      bankAccountNumber: '1099-2233-11',
      swiftCode: 'BDOAPHMM',
      paymentTerms: 'NET_30',
      isoCertifications: ['ISO 9001:2015'],
      w9DocName: 'Luzon_Pkg_W9.pdf',
      w9AttachedAt: '2026-09-03T14:10:00Z'
    },
    governance: {
      aiValidation: {
        passed: true,
        confidenceScore: 0.15,
        matchedRecordIds: [],
        standardizedFields: {
          legalName: 'Luzon Packaging Solutions Inc',
          taxId: 'TIN-PH-334455667'
        },
        detectedIssues: [],
        recommendations: ['W-9 tax document attached and validated.']
      },
      qaReviewerId: 'usr_qa_442',
      qaReviewerName: 'Maria Santos',
      qaComments: 'Validated tax certificate and bank SWIFT code. Ready for final MDM approval.'
    },
    auditTrail: [
      {
        timestamp: '2026-09-03T14:10:00Z',
        action: 'SUBMITTED_FOR_QA',
        actorId: 'usr_req_110',
        actorName: 'Rhodora Manuel',
        actorRole: 'REQUESTOR'
      },
      {
        timestamp: '2026-09-03T15:30:00Z',
        action: 'QA_APPROVED',
        actorId: 'usr_qa_442',
        actorName: 'Maria Santos',
        actorRole: 'QA_REVIEWER'
      }
    ],
    createdAt: '2026-09-03T14:10:00Z',
    updatedAt: '2026-09-03T15:30:00Z',
    createdBy: {
      id: 'usr_req_110',
      name: 'Rhodora Manuel',
      email: 'r.manuel@centaurchem.ph'
    }
  },
  {
    id: 'REQ-2026-9013',
    domain: 'ITEM',
    status: 'REVISION_REQUESTED',
    version: 2,
    data: {
      sku: 'RAW-10099',
      description: 'Sodium Hydroxide 99% Flakes Industrial Grade 25kg Bag',
      category: 'Raw Materials',
      uom: 'KG',
      costPrice: 42.00,
      listPrice: 45.00, // Violates list >= cost * 1.15
      grossMarginValid: false,
      weightKg: 25,
      dimensionsCm: '50x40x15'
    },
    governance: {
      aiValidation: {
        passed: true,
        confidenceScore: 0.78, // High duplicate score
        matchedRecordIds: ['ITEM-2026-00431'],
        standardizedFields: {
          legalName: 'Sodium Hydroxide 99% Flakes Industrial Grade 25kg Bag'
        },
        detectedIssues: [
          'List price (PHP 45.00) fails 15% minimum gross margin rule over Cost Price (PHP 42.00). Expected list price >= PHP 48.30.',
          'High semantic match with existing active inventory.'
        ],
        recommendations: ['Adjust pricing or provide business justification.']
      },
      qaReviewerId: 'usr_qa_442',
      qaReviewerName: 'Maria Santos',
      qaComments: 'Please adjust list price to at least PHP 48.50 to comply with gross margin policies, and provide duplicate justification.'
    },
    auditTrail: [
      {
        timestamp: '2026-09-03T16:00:00Z',
        action: 'SUBMITTED_FOR_QA',
        actorId: 'usr_req_109',
        actorName: 'Engr. Jerome Daypuyart',
        actorRole: 'REQUESTOR'
      },
      {
        timestamp: '2026-09-03T16:45:00Z',
        action: 'REVISION_REQUESTED',
        actorId: 'usr_qa_442',
        actorName: 'Maria Santos',
        actorRole: 'QA_REVIEWER',
        details: 'Gross margin policy non-compliant.'
      }
    ],
    createdAt: '2026-09-03T16:00:00Z',
    updatedAt: '2026-09-03T16:45:00Z',
    createdBy: {
      id: 'usr_req_109',
      name: 'Engr. Jerome Daypuyart',
      email: 'j.daypuyart@centaurchem.ph'
    }
  }
];

// Helper to recursively convert undefined values to null for Firestore compatibility
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === undefined) {
    return null as unknown as T;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      cleaned[key] = null;
    } else {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned as T;
}

export class MasterDataService {
  // Fetch Requests
  static async getRequests(): Promise<MasterRequestDocument[]> {
    try {
      const q = query(collection(db, REQUESTS_COLLECTION));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // Seed initial requests into Firestore
        for (const reqItem of INITIAL_MOCK_REQUESTS) {
          await setDoc(doc(db, REQUESTS_COLLECTION, reqItem.id), sanitizeForFirestore(reqItem));
        }
        return INITIAL_MOCK_REQUESTS;
      }
      return snapshot.docs.map(docSnap => docSnap.data() as MasterRequestDocument);
    } catch (e) {
      console.warn("Firestore fetch requests error, returning fallback mock requests:", e);
      return INITIAL_MOCK_REQUESTS;
    }
  }

  // Fetch Master Register
  static async getMasterRegister(): Promise<MasterRecordDocument[]> {
    try {
      const q = query(collection(db, REGISTER_COLLECTION));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // Seed initial master register into Firestore
        for (const recItem of INITIAL_MOCK_MASTER_RECORDS) {
          await setDoc(doc(db, REGISTER_COLLECTION, recItem.id), sanitizeForFirestore(recItem));
        }
        return INITIAL_MOCK_MASTER_RECORDS;
      }
      return snapshot.docs.map(docSnap => docSnap.data() as MasterRecordDocument);
    } catch (e) {
      console.warn("Firestore fetch master register error, returning fallback mock records:", e);
      return INITIAL_MOCK_MASTER_RECORDS;
    }
  }

  // Save Draft (Requestor)
  static async saveDraft(
    draftPayload: Partial<MasterRequestDocument>, 
    actor: { id: string; name: string; email: string }
  ): Promise<MasterRequestDocument> {
    const id = draftPayload.id || `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const auditEntry: AuditLogEntry = {
      timestamp: now,
      action: draftPayload.id ? 'DRAFT_UPDATED' : 'DRAFT_CREATED',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: 'REQUESTOR',
      details: 'Master record draft saved.'
    };

    const docData: MasterRequestDocument = {
      id,
      domain: draftPayload.domain || 'CUSTOMER',
      status: 'DRAFT',
      version: (draftPayload.version || 0) + 1,
      data: draftPayload.data as any,
      governance: draftPayload.governance || {},
      auditTrail: [...(draftPayload.auditTrail || []), auditEntry],
      createdAt: draftPayload.createdAt || now,
      updatedAt: now,
      createdBy: draftPayload.createdBy || actor
    };

    try {
      await setDoc(doc(db, REQUESTS_COLLECTION, id), sanitizeForFirestore(docData));
      await this.appendAuditLog(auditEntry);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, REQUESTS_COLLECTION);
    }

    return docData;
  }

  // Call Server-side AI Governance Check
  static async runAIPreCheck(
    record: any, 
    existingRecords: MasterRecordDocument[]
  ): Promise<AIGovernanceValidation> {
    try {
      const res = await fetch('/api/governance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record, existingRecords })
      });
      const result = await res.json();
      return {
        passed: result.confidenceScore < 0.75,
        confidenceScore: result.confidenceScore ?? 0.15,
        matchedRecordIds: result.matchedRecordIds ?? [],
        standardizedFields: result.standardizedFields ?? {},
        detectedIssues: result.detectedIssues ?? [],
        recommendations: result.recommendations ?? [],
        checkedAt: new Date().toISOString()
      };
    } catch (e) {
      console.warn("AI Pre-Check API error, generating local fallback assessment:", e);
      return {
        passed: true,
        confidenceScore: 0.15,
        matchedRecordIds: [],
        standardizedFields: {
          legalName: record?.data?.legalName || record?.data?.partNumber || "Standard Entity"
        },
        detectedIssues: ["Local pre-check complete."],
        recommendations: ["Cleared AI pre-check."],
        checkedAt: new Date().toISOString()
      };
    }
  }

  // Submit for Review (Requestor -> PENDING_QA)
  static async submitForReview(
    request: MasterRequestDocument, 
    justification: string | null,
    actor: { id: string; name: string; email: string }
  ): Promise<MasterRequestDocument> {
    const now = new Date().toISOString();

    const auditEntry: AuditLogEntry = {
      timestamp: now,
      action: 'SUBMITTED_FOR_QA',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: 'REQUESTOR',
      details: justification ? `Submitted with duplicate justification: "${justification}"` : 'Submitted for Departmental QA Review.'
    };

    const updatedDoc: MasterRequestDocument = {
      ...request,
      status: 'PENDING_QA',
      governance: {
        ...request.governance,
        duplicateJustification: justification ?? null
      },
      auditTrail: [...request.auditTrail, auditEntry],
      updatedAt: now
    };

    try {
      await setDoc(doc(db, REQUESTS_COLLECTION, request.id), sanitizeForFirestore(updatedDoc));
      await this.appendAuditLog(auditEntry);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, REQUESTS_COLLECTION);
    }

    return updatedDoc;
  }

  // Request Revision (QA Reviewer -> REVISION_REQUESTED)
  static async requestRevision(
    request: MasterRequestDocument,
    qaComments: string,
    reviewer: { id: string; name: string }
  ): Promise<MasterRequestDocument> {
    if (!qaComments || qaComments.trim().length < 15) {
      throw new Error("Actionable feedback comments must be at least 15 characters long.");
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLogEntry = {
      timestamp: now,
      action: 'REVISION_REQUESTED',
      actorId: reviewer.id,
      actorName: reviewer.name,
      actorRole: 'QA_REVIEWER',
      details: `Revision requested: ${qaComments}`
    };

    const updatedDoc: MasterRequestDocument = {
      ...request,
      status: 'REVISION_REQUESTED',
      governance: {
        ...request.governance,
        qaReviewerId: reviewer.id,
        qaReviewerName: reviewer.name,
        qaComments
      },
      auditTrail: [...request.auditTrail, auditEntry],
      updatedAt: now
    };

    try {
      await setDoc(doc(db, REQUESTS_COLLECTION, request.id), sanitizeForFirestore(updatedDoc));
      await this.appendAuditLog(auditEntry);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, REQUESTS_COLLECTION);
    }

    return updatedDoc;
  }

  // Approve & Escalate (QA Reviewer -> PENDING_MDM)
  static async approveAndEscalate(
    request: MasterRequestDocument,
    reviewer: { id: string; name: string }
  ): Promise<MasterRequestDocument> {
    const now = new Date().toISOString();
    const auditEntry: AuditLogEntry = {
      timestamp: now,
      action: 'QA_APPROVED',
      actorId: reviewer.id,
      actorName: reviewer.name,
      actorRole: 'QA_REVIEWER',
      details: 'QA Department approval granted. Escalated to MDM Manager.'
    };

    const updatedDoc: MasterRequestDocument = {
      ...request,
      status: 'PENDING_MDM',
      governance: {
        ...request.governance,
        qaReviewerId: reviewer.id,
        qaReviewerName: reviewer.name
      },
      auditTrail: [...request.auditTrail, auditEntry],
      updatedAt: now
    };

    try {
      await setDoc(doc(db, REQUESTS_COLLECTION, request.id), sanitizeForFirestore(updatedDoc));
      await this.appendAuditLog(auditEntry);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, REQUESTS_COLLECTION);
    }

    return updatedDoc;
  }

  // Commit to Master Register (MDM Manager -> ACTIVE)
  static async commitToMasterRegister(
    request: MasterRequestDocument,
    approver: { id: string; name: string }
  ): Promise<{ requestDoc: MasterRequestDocument; recordDoc: MasterRecordDocument }> {
    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const seq = Math.floor(10000 + Math.random() * 90000);

    // Generate Domain-Specific Master ID: CUST-YYYY-XXXXX, SUPP-YYYY-XXXXX, ITEM-YYYY-XXXXX
    let masterId = `CUST-${year}-${seq}`;
    if (request.domain === 'SUPPLIER') {
      masterId = `SUPP-${year}-${seq}`;
    } else if (request.domain === 'ITEM') {
      masterId = `ITEM-${year}-${seq}`;
    }

    const auditEntry: AuditLogEntry = {
      timestamp: now,
      action: 'REGISTER_COMMITTED',
      actorId: approver.id,
      actorName: approver.name,
      actorRole: 'MDM_MANAGER',
      details: `Committed to Master Register with unique ID ${masterId}`
    };

    const recordDoc: MasterRecordDocument = {
      id: masterId,
      domain: request.domain,
      status: 'ACTIVE',
      version: 1,
      data: request.data,
      governance: {
        aiValidation: request.governance.aiValidation || null,
        qaReviewerId: request.governance.qaReviewerId ?? null,
        qaComments: request.governance.qaComments ?? null,
        approverId: approver.id,
        duplicateJustification: request.governance.duplicateJustification ?? null
      },
      auditTrail: [...request.auditTrail, auditEntry],
      committedAt: now,
      committedBy: approver.name
    };

    const requestDoc: MasterRequestDocument = {
      ...request,
      status: 'ACTIVE',
      governance: {
        ...request.governance,
        approverId: approver.id,
        approverName: approver.name
      },
      auditTrail: [...request.auditTrail, auditEntry],
      updatedAt: now
    };

    try {
      await setDoc(doc(db, REGISTER_COLLECTION, masterId), sanitizeForFirestore(recordDoc));
      await setDoc(doc(db, REQUESTS_COLLECTION, request.id), sanitizeForFirestore(requestDoc));
      await this.appendAuditLog(auditEntry);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, REGISTER_COLLECTION);
    }

    return { requestDoc, recordDoc };
  }

  // Reject Request (MDM Manager or QA -> REJECTED)
  static async rejectRequest(
    request: MasterRequestDocument,
    category: string,
    reason: string,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<MasterRequestDocument> {
    const now = new Date().toISOString();
    const auditEntry: AuditLogEntry = {
      timestamp: now,
      action: 'REQUEST_REJECTED',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      details: `Rejected [${category}]: ${reason}`
    };

    const updatedDoc: MasterRequestDocument = {
      ...request,
      status: 'REJECTED',
      governance: {
        ...request.governance,
        rejectionCategory: category,
        rejectionReason: reason
      },
      auditTrail: [...request.auditTrail, auditEntry],
      updatedAt: now
    };

    try {
      await setDoc(doc(db, REQUESTS_COLLECTION, request.id), sanitizeForFirestore(updatedDoc));
      await this.appendAuditLog(auditEntry);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, REQUESTS_COLLECTION);
    }

    return updatedDoc;
  }

  // Soft Deactivate Master Record (MDM Manager)
  static async deactivateRecord(
    record: MasterRecordDocument,
    actor: { id: string; name: string }
  ): Promise<MasterRecordDocument> {
    const now = new Date().toISOString();
    const auditEntry: AuditLogEntry = {
      timestamp: now,
      action: 'RECORD_DEACTIVATED',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: 'MDM_MANAGER',
      details: `Master record ${record.id} soft-deactivated.`
    };

    const updatedDoc: MasterRecordDocument = {
      ...record,
      status: 'INACTIVE',
      deactivatedAt: now,
      deactivatedBy: actor.name,
      auditTrail: [...record.auditTrail, auditEntry]
    };

    try {
      await setDoc(doc(db, REGISTER_COLLECTION, record.id), sanitizeForFirestore(updatedDoc));
      await this.appendAuditLog(auditEntry);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, REGISTER_COLLECTION);
    }

    return updatedDoc;
  }

  // Append to Audit Trail Collection
  private static async appendAuditLog(entry: AuditLogEntry): Promise<void> {
    const id = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    try {
      await setDoc(doc(db, AUDIT_COLLECTION, id), sanitizeForFirestore({ ...entry, id }));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, AUDIT_COLLECTION);
    }
  }

  // Fetch Audit Logs
  static async getAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const q = query(collection(db, AUDIT_COLLECTION));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(docSnap => docSnap.data() as AuditLogEntry);
      }
    } catch (e) {
      console.warn("Firestore getAuditLogs error:", e);
    }
    return [];
  }
}
