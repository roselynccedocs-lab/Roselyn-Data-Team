import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface FleetAsset {
  id: string;
  serialNo: string;
  deviceName: string;
  category: string;
  location: string;
  custodian: string;
  department: string;
  timestamp: string;
  status: 'IN STOCK' | 'IN USE' | 'ISSUED' | 'RETIRED';
  balanceQty?: number;
  balanceValue?: number;
  isEditing?: boolean;
}

export interface OfficeSupply {
  sku: string;
  name: string;
  group: string;
  warehouse: string;
  uom: string;
  balanceQty: number;
  balanceValue: number;
  lowStock: boolean;
  isEditing?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  dateObj: Date;
  docId: string;
  module: 'General Items Issuance' | 'Material Request' | 'Purchase Receipt' | 'Employee Onboarding' | 'Employee offboarding' | 'General Items Return';
  action: string;
  performer: string;
  targetDept: string;
  details: string;
  status: string;
}

export interface HealthCategoryItem {
  category: string;
  available: number;
  total: number;
  status: 'OUT OF STOCK' | 'CRITICAL LOW' | 'MONITORING' | 'HEALTHY';
  highlight: 'red' | 'yellow' | 'white';
}

interface AssetContextType {
  fleetAssets: FleetAsset[];
  officeSupplies: OfficeSupply[];
  auditTrail: AuditLogItem[];
  healthCategories: HealthCategoryItem[];
  selectedItemForQR: any | null;
  openQRModal: (item: any) => void;
  closeQRModal: () => void;
  addFleetAsset: (asset: Omit<FleetAsset, 'id'>) => void;
  updateFleetAsset: (id: string, updated: Partial<FleetAsset>) => void;
  deleteFleetAsset: (id: string) => void;
  bulkDeleteFleetAssets: (ids: string[]) => void;
  addOfficeSupply: (supply: OfficeSupply) => void;
  updateOfficeSupply: (sku: string, updated: Partial<OfficeSupply>) => void;
  deleteOfficeSupply: (sku: string) => void;
  bulkDeleteOfficeSupplies: (skus: string[]) => void;
  deleteAuditLog: (id: string) => void;
  bulkDeleteAuditLogs: (ids: string[]) => void;
  importFleetAssetsFromCSV: (csvText: string) => { count: number; error?: string };
  importToSelectedTab: (csvText: string, tab: 'fleet' | 'supplies' | 'health' | 'audit', categoryFilter?: string | null) => { count: number; targetTabName: string; error?: string };
  exportFleetAssetsToCSV: () => void;
  exportSelectedTabToCSV: (tab: 'fleet' | 'supplies' | 'health' | 'audit', categoryFilter?: string | null) => void;
}

const STORAGE_KEY_FLEET = 'cce_fleet_assets_v3';
const STORAGE_KEY_SUPPLIES = 'cce_office_supplies_v3';
const STORAGE_KEY_AUDIT = 'cce_audit_trail_v3';

const INITIAL_FLEET_ASSETS: FleetAsset[] = [
  { id: '1', serialNo: '2024-NUB1822', deviceName: "1X20' CHASSIS TRAILER", category: 'ASSET - TRANSPORT EQUIPMENT', location: 'Centa', custodian: 'Allan Qu', department: 'Operation', timestamp: '8/20/2026, 2:23:49 PM', status: 'RETIRED', balanceQty: 1, balanceValue: 350000 },
  { id: '2', serialNo: '2024-NUB1812', deviceName: "40' CHASSIS TRAILER HEAVY", category: 'ASSET - TRANSPORT EQUIPMENT', location: 'Centa', custodian: 'Allan Qu', department: 'Operation', timestamp: '8/20/2026, 2:23:49 PM', status: 'RETIRED', balanceQty: 1, balanceValue: 480000 },
  { id: '3', serialNo: '2024-NUB1809', deviceName: 'FORD CARGO TRUCK 10W', category: 'ASSET - TRANSPORT EQUIPMENT', location: 'Laguna Plant', custodian: 'Engr. Jerome Daypuyart', department: 'Operation', timestamp: '8/20/2026, 2:21:00 PM', status: 'IN STOCK', balanceQty: 1, balanceValue: 1250000 },
  { id: '4', serialNo: 'C02XG5K1JG5H', deviceName: 'MacBook Pro M3 Max 16-inch', category: 'IT ASSET', location: 'BGC Taguig Lab', custodian: 'Dr. Arnold Cortina', department: 'R&D', timestamp: '8/19/2026, 11:14:22 AM', status: 'IN USE', balanceQty: 1, balanceValue: 185000 },
  { id: '5', serialNo: 'AGI-99281', deviceName: 'Agilent HPLC Chromatography System', category: 'LABORATORY EQUIPMENT', location: 'BGC Taguig Lab', custodian: 'Dr. Arnold Cortina', department: 'R&D', timestamp: '8/18/2026, 09:30:15 AM', status: 'IN USE', balanceQty: 1, balanceValue: 1450000 },
  { id: '6', serialNo: 'DEL-88231', deviceName: 'Dell PowerEdge R750 Enterprise Server', category: 'IT ASSET', location: 'BGC Server Room', custodian: 'Tech Guy', department: 'IT Department', timestamp: '8/15/2026, 04:12:00 PM', status: 'ISSUED', balanceQty: 1, balanceValue: 320000 },
];

const INITIAL_OFFICE_SUPPLIES: OfficeSupply[] = [
  { sku: 'SKU000000969', name: 'HP Bond Paper 80gsm Letter', group: 'SUPPLIES-OFFICE', warehouse: 'TAGUIG OFFICE - FINANCE INVENTORY & FIXED ASSET', uom: 'REAM', balanceQty: 1, balanceValue: 210.00, lowStock: true },
  { sku: 'SKU000000883', name: 'Ballpoint Pen Blue 0.7mm Box of 12', group: 'SUPPLIES-OFFICE', warehouse: 'TAGUIG OFFICE - FINANCE INVENTORY & FIXED ASSET', uom: 'BOX', balanceQty: 3, balanceValue: 180.00, lowStock: true },
  { sku: 'SKU000000512', name: 'Nitrile Gloves Powder-Free Large', group: 'SUPPLIES-MRO', warehouse: 'LAGUNA PLANT - RAW MATERIALS DEPOT', uom: 'BOX', balanceQty: 120, balanceValue: 42000.00, lowStock: false },
  { sku: 'SKU000000304', name: 'Chemical Sanitizer Grade A 20L', group: 'SUPPLIES-LAB', warehouse: 'CEBU WAREHOUSE - LOGISTICS', uom: 'DRUM', balanceQty: 15, balanceValue: 48000.00, lowStock: false },
  { sku: 'SKU000000119', name: 'Multi-Surface Cleaner 1 Gallon', group: 'SUPPLIES-CLEANING', warehouse: 'TAGUIG OFFICE - FINANCE INVENTORY & FIXED ASSET', uom: 'GALLON', balanceQty: 0, balanceValue: 0.00, lowStock: true },
];

const INITIAL_AUDIT_TRAIL: AuditLogItem[] = [
  {
    id: 'log-1',
    timestamp: 'Sep 2, 2026 01:55 PM',
    dateObj: new Date('2026-09-02T13:55:00'),
    docId: 'CCE-000435',
    module: 'General Items Issuance',
    action: 'General Items Issued',
    performer: 'rhodora manuel',
    targetDept: 'OPERATIONS DEPARTMENT',
    details: 'HP BOND PAPER (LETTER) [S/N: SKU000000883] (Qty: 3)',
    status: 'COMPLETED'
  },
  {
    id: 'log-2',
    timestamp: 'Sep 2, 2026 01:40 PM',
    dateObj: new Date('2026-09-02T13:40:00'),
    docId: 'CCE-MR-20260902-00004',
    module: 'Material Request',
    action: 'Material Request Approved',
    performer: 'arnold cortina',
    targetDept: 'PURCHASING AND LOGISTICS',
    details: '20L HDPE Heavy-Duty Blue Drum (Qty: 50)',
    status: 'COMPLETED'
  },
  {
    id: 'log-3',
    timestamp: 'Sep 2, 2026 10:15 AM',
    dateObj: new Date('2026-09-02T10:15:00'),
    docId: 'CENTAUR-RET-2026-05',
    module: 'General Items Return',
    action: 'Equipment Returned to Taguig Depot',
    performer: 'allan qu',
    targetDept: 'OPERATIONS DEPARTMENT',
    details: "1X20' CHASSIS TRAILER [S/N: 2024-NUB1822] (Qty: 1)",
    status: 'COMPLETED'
  },
  {
    id: 'log-4',
    timestamp: 'Sep 1, 2026 04:15 PM',
    dateObj: new Date('2026-09-01T16:15:00'),
    docId: 'CCE-PR000132',
    module: 'Purchase Receipt',
    action: 'Purchase Order Received',
    performer: 'katrina ilagan',
    targetDept: 'PURCHASING AND LOGISTICS',
    details: 'Nitrile Gloves Powder-Free Large [S/N: SKU000000512] (Qty: 21)',
    status: 'COMPLETED'
  },
  {
    id: 'log-5',
    timestamp: 'Aug 30, 2026 10:00 AM',
    dateObj: new Date('2026-08-30T10:00:00'),
    docId: 'CENTAUR-ONB-2026-03',
    module: 'Employee Onboarding',
    action: 'Asset Handover Signed',
    performer: 'ronalyn custodio',
    targetDept: 'HR DEPARTMENT',
    details: 'Dell PowerEdge R750 Server & Workstation Kit (Qty: 3)',
    status: 'COMPLETED'
  },
  {
    id: 'log-6',
    timestamp: 'Aug 29, 2026 03:45 PM',
    dateObj: new Date('2026-08-29T15:45:00'),
    docId: 'CENTAUR-OFF-2026-01',
    module: 'Employee offboarding',
    action: 'Clearance & IT Asset Surrender',
    performer: 'ronalyn custodio',
    targetDept: 'HR DEPARTMENT',
    details: 'Lenovo ThinkPad P16 Workstation & Security Token returned',
    status: 'COMPLETED'
  },
  {
    id: 'log-7',
    timestamp: 'Aug 28, 2026 02:20 PM',
    dateObj: new Date('2026-08-28T14:20:00'),
    docId: 'CENTAUR-RET-2026-04',
    module: 'General Items Return',
    action: 'Asset Returned to Inventory',
    performer: 'jerome daypuyart',
    targetDept: 'OPERATIONS DEPARTMENT',
    details: 'Forklift Electric 3-Ton [S/N: FL-30911] (Qty: 1)',
    status: 'COMPLETED'
  },
  {
    id: 'log-8',
    timestamp: 'Aug 26, 2026 11:10 AM',
    dateObj: new Date('2026-08-26T11:10:00'),
    docId: 'CENTAUR-ONB-2026-02',
    module: 'Employee Onboarding',
    action: 'New Hire Hardware Provisioning',
    performer: 'arnold cortina',
    targetDept: 'R&D',
    details: 'MacBook Pro M3 Max [S/N: C02XG5K1JG5H] issued to Dr. Arnold Cortina',
    status: 'COMPLETED'
  },
  {
    id: 'log-9',
    timestamp: 'Aug 24, 2026 09:30 AM',
    dateObj: new Date('2026-08-24T09:30:00'),
    docId: 'CENTAUR-RET-2026-03',
    module: 'General Items Return',
    action: 'Warehouse Tool Surrender',
    performer: 'allan qu',
    targetDept: 'OPERATIONS DEPARTMENT',
    details: 'Digital Torque Wrench & Calibrator kit',
    status: 'COMPLETED'
  }
];

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: React.ReactNode }) {
  // Initialize from LocalStorage for instant hydration upon page refresh
  const [fleetAssets, setFleetAssets] = useState<FleetAsset[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FLEET);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Fleet assets local hydration notice:', e);
    }
    return INITIAL_FLEET_ASSETS;
  });

  const [officeSupplies, setOfficeSupplies] = useState<OfficeSupply[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUPPLIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Office supplies local hydration notice:', e);
    }
    return INITIAL_OFFICE_SUPPLIES;
  });

  const [auditTrail, setAuditTrail] = useState<AuditLogItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            dateObj: item.dateObj ? new Date(item.dateObj) : new Date(item.timestamp),
          }));
        }
      }
    } catch (e) {
      console.warn('Audit trail local hydration notice:', e);
    }
    return INITIAL_AUDIT_TRAIL;
  });

  const isInitialSyncDone = useRef(false);
  const isRemoteSyncRef = useRef(false);
  const isLocalChangeRef = useRef(false);
  const debounceTimerRef = useRef<any>(null);

  // Helper to mark changes originating from user actions
  const triggerLocalChange = () => {
    isLocalChangeRef.current = true;
  };

  // Firestore Realtime Synchronization
  useEffect(() => {
    try {
      const assetDocRef = doc(db, 'asset_registry', 'master_data');
      const unsubscribe = onSnapshot(assetDocRef, (snap) => {
        // Skip processing our own pending writes to prevent feedback loops
        if (snap.metadata && snap.metadata.hasPendingWrites) {
          return;
        }

        if (snap.exists()) {
          const data = snap.data();
          isRemoteSyncRef.current = true;

          if (Array.isArray(data.fleetAssets) && data.fleetAssets.length > 0) {
            setFleetAssets(data.fleetAssets);
            try { localStorage.setItem(STORAGE_KEY_FLEET, JSON.stringify(data.fleetAssets)); } catch (e) {}
          }
          if (Array.isArray(data.officeSupplies) && data.officeSupplies.length > 0) {
            setOfficeSupplies(data.officeSupplies);
            try { localStorage.setItem(STORAGE_KEY_SUPPLIES, JSON.stringify(data.officeSupplies)); } catch (e) {}
          }
          if (Array.isArray(data.auditTrail) && data.auditTrail.length > 0) {
            const rehydratedLogs = data.auditTrail.map((item: any) => ({
              ...item,
              dateObj: item.dateObj ? new Date(item.dateObj) : new Date(item.timestamp),
            }));
            setAuditTrail(rehydratedLogs);
            try { localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(rehydratedLogs)); } catch (e) {}
          }
        } else {
          // Push initial data to Firestore if not initialized (only once)
          if (!isInitialSyncDone.current) {
            setDoc(assetDocRef, {
              fleetAssets,
              officeSupplies,
              auditTrail: auditTrail.map(l => ({ ...l, dateObj: l.dateObj ? (l.dateObj instanceof Date ? l.dateObj.toISOString() : new Date(l.dateObj).toISOString()) : new Date().toISOString() })),
              lastUpdated: Date.now(),
            }, { merge: true }).catch(err => console.warn('Firestore initial seeding notice:', err));
          }
        }
        isInitialSyncDone.current = true;
      }, (err) => {
        console.warn('Firestore real-time sync notice:', err);
      });

      return () => {
        unsubscribe();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    } catch (e) {
      console.warn('Firestore asset registry connection notice:', e);
    }
  }, []);

  // Save to LocalStorage & Central Firestore Database on local user changes only (with debouncing)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FLEET, JSON.stringify(fleetAssets));
      localStorage.setItem(STORAGE_KEY_SUPPLIES, JSON.stringify(officeSupplies));
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditTrail));

      // If this state update came from a remote Firestore snapshot, consume the flag and DO NOT write back!
      if (isRemoteSyncRef.current) {
        isRemoteSyncRef.current = false;
        return;
      }

      // If initial sync is complete and this was a local user action, save to Firestore with debouncing
      if (isInitialSyncDone.current && isLocalChangeRef.current) {
        isLocalChangeRef.current = false;
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          const assetDocRef = doc(db, 'asset_registry', 'master_data');
          setDoc(assetDocRef, {
            fleetAssets,
            officeSupplies,
            auditTrail: auditTrail.map(l => ({
              ...l,
              dateObj: l.dateObj ? (l.dateObj instanceof Date ? l.dateObj.toISOString() : new Date(l.dateObj).toISOString()) : new Date().toISOString()
            })),
            lastUpdated: Date.now(),
          }, { merge: true }).catch(err => {
            console.warn('Central DB sync notice:', err);
          });
        }, 600);
      }
    } catch (e) {
      console.warn('Persistence save notice:', e);
    }
  }, [fleetAssets, officeSupplies, auditTrail]);

  // 4. Modal state for QR detail popup
  const [selectedItemForQR, setSelectedItemForQR] = useState<any | null>(null);

  const openQRModal = (item: any) => {
    setSelectedItemForQR(item);
  };

  const closeQRModal = () => {
    setSelectedItemForQR(null);
  };

  // 5. Dynamic Health Categories computation synchronized to database
  const healthCategories = useMemo<HealthCategoryItem[]>(() => {
    // Base catalog categories with real-time stock sync
    const categoriesMap: Record<string, { available: number; total: number }> = {
      'SUPPLIES - MEDICINE': { available: 2, total: 10 },
      'IT ASSET': { available: 0, total: 0 },
      'SUPPLIES - MRO': { available: 0, total: 0 },
      'ASSET - TRANSPORT EQUIPMENT': { available: 0, total: 0 },
      'OTHER': { available: 4, total: 15 },
      'ACCESSORY': { available: 21, total: 35 },
      'EMPLOYEE WELFARE & BENEFITS': { available: 6, total: 20 },
      'SUPPLIES - CLEANING': { available: 0, total: 0 },
      'MOBILE / PHONE': { available: 23, total: 30 },
      'ASSET - OFFICE EQUIPMENT': { available: 8, total: 15 },
      'SUPPLIES - WAREHOUSE': { available: 24, total: 30 },
      'PRINTER': { available: 1, total: 5 },
      'LABORATORY EQUIPMENT': { available: 28, total: 30 },
      'SUPPLIES - OFFICE': { available: 0, total: 0 },
    };

    // Calculate dynamic counts from fleetAssets
    fleetAssets.forEach(asset => {
      const cat = asset.category.toUpperCase();
      const inStock = asset.status === 'IN STOCK' || asset.status === 'IN USE' ? 1 : 0;
      if (categoriesMap[cat]) {
        categoriesMap[cat].total += 1;
        categoriesMap[cat].available += inStock;
      } else {
        categoriesMap[cat] = { available: inStock, total: 1 };
      }
    });

    // Calculate dynamic counts from officeSupplies
    officeSupplies.forEach(supply => {
      const cat = supply.group.toUpperCase().replace('-', ' - ');
      const mappedCat = categoriesMap[cat] ? cat : 'SUPPLIES - OFFICE';
      if (categoriesMap[mappedCat]) {
        categoriesMap[mappedCat].total += supply.balanceQty;
        categoriesMap[mappedCat].available += supply.balanceQty;
      } else {
        categoriesMap[mappedCat] = { available: supply.balanceQty, total: supply.balanceQty };
      }
    });

    return Object.entries(categoriesMap).map(([category, counts]) => {
      let highlight: 'red' | 'yellow' | 'white';
      let status: 'OUT OF STOCK' | 'CRITICAL LOW' | 'MONITORING' | 'HEALTHY';

      if (counts.available < 15) {
        highlight = 'red';
        status = counts.available === 0 ? 'OUT OF STOCK' : 'CRITICAL LOW';
      } else if (counts.available >= 15 && counts.available <= 25) {
        highlight = 'yellow';
        status = 'MONITORING';
      } else {
        highlight = 'white';
        status = 'HEALTHY';
      }

      return {
        category,
        available: counts.available,
        total: counts.total,
        status,
        highlight,
      };
    });
  }, [fleetAssets, officeSupplies]);

  // 6. Add Fleet Asset and log to Audit Trail
  const addFleetAsset = (newAssetData: Omit<FleetAsset, 'id'>) => {
    triggerLocalChange();
    const newId = String(Date.now());
    const newAsset: FleetAsset = {
      ...newAssetData,
      id: newId,
    };

    setFleetAssets(prev => [newAsset, ...prev]);

    // Synchronize to Audit Logs
    const now = new Date();
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      dateObj: now,
      docId: `CCE-AST-${newAsset.serialNo}`,
      module: 'General Items Issuance',
      action: 'Asset Registered & Added to Fleet',
      performer: 'arnold cortina',
      targetDept: newAsset.department.toUpperCase(),
      details: `${newAsset.deviceName} [S/N: ${newAsset.serialNo}] Location: ${newAsset.location} (Qty: 1)`,
      status: 'COMPLETED',
    };

    setAuditTrail(prev => [newLog, ...prev]);
  };

  const updateFleetAsset = (id: string, updated: Partial<FleetAsset>) => {
    triggerLocalChange();
    setFleetAssets(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const deleteFleetAsset = (id: string) => {
    triggerLocalChange();
    const target = fleetAssets.find(a => a.id === id);
    if (target) {
      const now = new Date();
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        timestamp: now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        dateObj: now,
        docId: `CCE-RET-${target.serialNo}`,
        module: 'General Items Return',
        action: 'Asset Decommissioned / Deleted from Registry',
        performer: 'rhodora manuel',
        targetDept: target.department.toUpperCase(),
        details: `Deleted Asset Record: ${target.deviceName} [S/N: ${target.serialNo}]`,
        status: 'COMPLETED',
      };
      setAuditTrail(prev => [newLog, ...prev]);
    }
    setFleetAssets(prev => prev.filter(a => a.id !== id));
  };

  const bulkDeleteFleetAssets = (ids: string[]) => {
    if (!ids.length) return;
    triggerLocalChange();
    const targets = fleetAssets.filter(a => ids.includes(a.id));
    if (targets.length > 0) {
      const now = new Date();
      const newLogs: AuditLogItem[] = targets.map((target, idx) => ({
        id: `log-bulk-${Date.now()}-${idx}`,
        timestamp: now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        dateObj: now,
        docId: `CCE-RET-${target.serialNo}`,
        module: 'General Items Return',
        action: 'Asset Decommissioned (Bulk Deletion)',
        performer: 'rhodora manuel',
        targetDept: target.department.toUpperCase(),
        details: `Bulk Deleted Asset: ${target.deviceName} [S/N: ${target.serialNo}]`,
        status: 'COMPLETED',
      }));
      setAuditTrail(prev => [...newLogs, ...prev]);
    }
    setFleetAssets(prev => prev.filter(a => !ids.includes(a.id)));
  };

  // 7. Add Office Supply and log to Audit Trail
  const addOfficeSupply = (supply: OfficeSupply) => {
    triggerLocalChange();
    setOfficeSupplies(prev => [supply, ...prev]);

    const now = new Date();
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      dateObj: now,
      docId: `CCE-SUP-${supply.sku}`,
      module: 'Material Request',
      action: 'Office Supply Registered into Stock',
      performer: 'arnold cortina',
      targetDept: 'TAGUIG FINANCE & ADMIN',
      details: `${supply.name} [SKU: ${supply.sku}] Qty: ${supply.balanceQty} ${supply.uom}`,
      status: 'COMPLETED',
    };
    setAuditTrail(prev => [newLog, ...prev]);
  };

  const updateOfficeSupply = (sku: string, updated: Partial<OfficeSupply>) => {
    triggerLocalChange();
    setOfficeSupplies(prev =>
      prev.map(s => (s.sku === sku ? { ...s, ...updated } : s))
    );
  };

  const deleteOfficeSupply = (sku: string) => {
    triggerLocalChange();
    const target = officeSupplies.find(s => s.sku === sku);
    if (target) {
      const now = new Date();
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        timestamp: now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        dateObj: now,
        docId: `CCE-SUP-DEL-${target.sku}`,
        module: 'Material Request',
        action: 'Office Supply Removed from Inventory',
        performer: 'rhodora manuel',
        targetDept: 'TAGUIG FINANCE & ADMIN',
        details: `Deleted Supply Record: ${target.name} [SKU: ${target.sku}]`,
        status: 'COMPLETED',
      };
      setAuditTrail(prev => [newLog, ...prev]);
    }
    setOfficeSupplies(prev => prev.filter(s => s.sku !== sku));
  };

  const bulkDeleteOfficeSupplies = (skus: string[]) => {
    if (!skus.length) return;
    triggerLocalChange();
    const targets = officeSupplies.filter(s => skus.includes(s.sku));
    if (targets.length > 0) {
      const now = new Date();
      const newLogs: AuditLogItem[] = targets.map((target, idx) => ({
        id: `log-bulk-sup-${Date.now()}-${idx}`,
        timestamp: now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        dateObj: now,
        docId: `CCE-SUP-DEL-${target.sku}`,
        module: 'Material Request',
        action: 'Office Supply Removed (Bulk Deletion)',
        performer: 'rhodora manuel',
        targetDept: 'TAGUIG FINANCE & ADMIN',
        details: `Bulk Deleted Supply: ${target.name} [SKU: ${target.sku}]`,
        status: 'COMPLETED',
      }));
      setAuditTrail(prev => [...newLogs, ...prev]);
    }
    setOfficeSupplies(prev => prev.filter(s => !skus.includes(s.sku)));
  };

  const deleteAuditLog = (id: string) => {
    triggerLocalChange();
    setAuditTrail(prev => prev.filter(l => l.id !== id));
  };

  const bulkDeleteAuditLogs = (ids: string[]) => {
    triggerLocalChange();
    setAuditTrail(prev => prev.filter(l => !ids.includes(l.id)));
  };

  // 8. Import Fleet Assets from CSV
  const importFleetAssetsFromCSV = (csvText: string): { count: number; error?: string } => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) {
        return { count: 0, error: 'CSV file is empty or missing headers.' };
      }

      const newAssets: FleetAsset[] = [];
      const newLogs: AuditLogItem[] = [];
      const now = new Date();

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Handle CSV split respecting basic quotes
        const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2) {
          const serialNo = cols[0] || `TAG-${Math.floor(1000 + Math.random() * 9000)}`;
          const deviceName = cols[1] || 'Imported Equipment Item';
          const category = cols[2] || 'IT ASSET';
          const location = cols[3] || 'BGC Taguig Lab';
          const custodian = cols[4] || 'Dr. Arnold Cortina';
          const department = cols[5] || 'R&D';
          const statusRaw = (cols[6] || 'IN STOCK').toUpperCase();
          const status = ['IN STOCK', 'IN USE', 'ISSUED', 'RETIRED'].includes(statusRaw)
            ? (statusRaw as FleetAsset['status'])
            : 'IN STOCK';

          const assetItem: FleetAsset = {
            id: `csv-${Date.now()}-${i}`,
            serialNo,
            deviceName,
            category,
            location,
            custodian,
            department,
            timestamp: now.toLocaleString(),
            status,
            balanceQty: 1,
            balanceValue: 15000,
          };

          newAssets.push(assetItem);

          newLogs.push({
            id: `log-import-${Date.now()}-${i}`,
            timestamp: now.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            dateObj: now,
            docId: `CCE-IMP-${serialNo}`,
            module: 'General Items Issuance',
            action: 'CSV Bulk Asset Imported & Synchronized',
            performer: 'arnold cortina',
            targetDept: department.toUpperCase(),
            details: `Imported ${deviceName} [S/N: ${serialNo}] (${category})`,
            status: 'COMPLETED',
          });
        }
      }

      if (newAssets.length > 0) {
        triggerLocalChange();
        setFleetAssets(prev => [...newAssets, ...prev]);
        setAuditTrail(prev => [...newLogs, ...prev]);
        return { count: newAssets.length };
      }

      return { count: 0, error: 'No valid records found in CSV.' };
    } catch (e: any) {
      return { count: 0, error: e.message || 'Failed to parse CSV file.' };
    }
  };

  // 8b. Universal CSV Importer for Specific Highlighted Sub-Tab
  const importToSelectedTab = (
    csvText: string, 
    tab: 'fleet' | 'supplies' | 'health' | 'audit', 
    categoryFilter?: string | null
  ): { count: number; targetTabName: string; error?: string } => {
    try {
      const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        return { count: 0, targetTabName: tab, error: 'CSV file is empty or missing headers.' };
      }

      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (ch === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += ch;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const now = new Date();
      const newLogs: AuditLogItem[] = [];

      // TAB 1 & 3: FLEET ASSET LIST OR INVENTORY HEALTH
      if (tab === 'fleet' || tab === 'health') {
        const newAssets: FleetAsset[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length >= 2 && cols[0]) {
            const serialNo = cols[0] || `TAG-${Math.floor(100000 + Math.random() * 900000)}`;
            const deviceName = cols[1] || 'Imported Asset Item';
            const category = cols[2] || categoryFilter || 'IT ASSET';
            const location = cols[3] || 'BGC Taguig Lab';
            const custodian = cols[4] || 'Dr. Arnold Cortina';
            const department = cols[5] || 'R&D';
            const statusRaw = (cols[6] || 'IN STOCK').toUpperCase();
            const status = ['IN STOCK', 'IN USE', 'ISSUED', 'RETIRED'].includes(statusRaw)
              ? (statusRaw as FleetAsset['status'])
              : 'IN STOCK';

            newAssets.push({
              id: `asset-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
              serialNo,
              deviceName,
              category,
              location,
              custodian,
              department,
              timestamp: now.toLocaleString(),
              status,
              balanceQty: Number(cols[7]) || 1,
              balanceValue: Number(cols[8]) || 25000,
            });

            newLogs.push({
              id: `log-import-fleet-${Date.now()}-${i}`,
              timestamp: now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
              dateObj: now,
              docId: `CCE-IMP-${serialNo}`,
              module: 'General Items Issuance',
              action: `Asset List Imported to [${category}]`,
              performer: 'arnold cortina',
              targetDept: department.toUpperCase(),
              details: `Imported ${deviceName} (${serialNo}) into ${category}`,
              status: 'COMPLETED',
            });
          }
        }

        if (newAssets.length > 0) {
          triggerLocalChange();
          setFleetAssets(prev => [...newAssets, ...prev]);
          setAuditTrail(prev => [...newLogs, ...prev]);
          return { count: newAssets.length, targetTabName: categoryFilter ? `Asset List (${categoryFilter})` : 'Asset List' };
        }
        return { count: 0, targetTabName: 'Asset List', error: 'No valid asset records found in CSV.' };
      }

      // TAB 2: OFFICE SUPPLIES
      if (tab === 'supplies') {
        const newSupplies: OfficeSupply[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length >= 2 && cols[0]) {
            const sku = cols[0].startsWith('SKU') ? cols[0] : `SKU${cols[0]}`;
            const name = cols[1] || 'Imported Office Supply';
            const group = cols[2] || categoryFilter || 'SUPPLIES-OFFICE';
            const warehouse = cols[3] || 'TAGUIG OFFICE - FINANCE INVENTORY & FIXED ASSET';
            const uom = cols[4] || 'BOX';
            const balanceQty = isNaN(Number(cols[5])) ? 10 : Number(cols[5]);
            const balanceValue = isNaN(Number(cols[6])) ? 1500.00 : Number(cols[6]);
            const lowStock = balanceQty <= 5;

            newSupplies.push({
              sku,
              name,
              group,
              warehouse,
              uom,
              balanceQty,
              balanceValue,
              lowStock,
            });

            newLogs.push({
              id: `log-import-sup-${Date.now()}-${i}`,
              timestamp: now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
              dateObj: now,
              docId: `CCE-SUP-${sku}`,
              module: 'Purchase Receipt',
              action: `Office Supplies CSV Bulk Import to [${group}]`,
              performer: 'arnold cortina',
              targetDept: 'ASSET AND DATA',
              details: `Imported ${name} (${sku}) - Qty: ${balanceQty} ${uom}`,
              status: 'COMPLETED',
            });
          }
        }

        if (newSupplies.length > 0) {
          triggerLocalChange();
          setOfficeSupplies(prev => [...newSupplies, ...prev]);
          setAuditTrail(prev => [...newLogs, ...prev]);
          return { count: newSupplies.length, targetTabName: categoryFilter ? `Office Supplies (${categoryFilter})` : 'Office Supplies' };
        }
        return { count: 0, targetTabName: 'Office Supplies', error: 'No valid office supply items found in CSV.' };
      }

      // TAB 4: AUDIT TRAIL LOG
      if (tab === 'audit') {
        const importedAuditLogs: AuditLogItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length >= 2) {
            importedAuditLogs.push({
              id: `log-csv-${Date.now()}-${i}`,
              timestamp: cols[0] || now.toLocaleString(),
              dateObj: now,
              docId: cols[1] || `DOC-${Date.now()}`,
              module: (cols[2] as any) || 'General Items Issuance',
              action: cols[3] || 'System Audit Record Imported',
              performer: cols[4] || 'arnold cortina',
              targetDept: cols[5] || 'ASSET AND DATA',
              details: cols[6] || 'Imported compliance audit trail record',
              status: cols[7] || 'COMPLETED',
            });
          }
        }

        if (importedAuditLogs.length > 0) {
          triggerLocalChange();
          setAuditTrail(prev => [...importedAuditLogs, ...prev]);
          return { count: importedAuditLogs.length, targetTabName: 'Audit Trail' };
        }
        return { count: 0, targetTabName: 'Audit Trail', error: 'No valid audit records found in CSV.' };
      }

      return { count: 0, targetTabName: tab, error: 'Unsupported tab selected for import.' };
    } catch (e: any) {
      return { count: 0, targetTabName: tab, error: e.message || 'Failed to process CSV.' };
    }
  };

  // 9. Export Fleet Assets to CSV
  const exportFleetAssetsToCSV = () => {
    exportSelectedTabToCSV('fleet', null);
  };

  // 9b. Universal CSV Exporter for Selected Sub-Tab & Filter
  const exportSelectedTabToCSV = (tab: 'fleet' | 'supplies' | 'health' | 'audit', categoryFilter?: string | null) => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `CentaurChem_${tab}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (tab === 'fleet' || tab === 'health') {
      headers = ['Serial Number', 'Device Name', 'Category', 'Location', 'Custodian', 'Department', 'Status', 'Balance Qty', 'Balance Value', 'Timestamp'];
      const data = categoryFilter 
        ? fleetAssets.filter(a => a.category.toLowerCase().includes(categoryFilter.toLowerCase()))
        : fleetAssets;
      rows = data.map(a => [
        `"${a.serialNo}"`,
        `"${a.deviceName.replace(/"/g, '""')}"`,
        `"${a.category}"`,
        `"${a.location}"`,
        `"${a.custodian}"`,
        `"${a.department}"`,
        `"${a.status}"`,
        `"${a.balanceQty || 1}"`,
        `"${a.balanceValue || 0}"`,
        `"${a.timestamp}"`,
      ]);
      filename = categoryFilter 
        ? `CentaurChem_Assets_${categoryFilter.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
        : `CentaurChem_Asset_Registry_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (tab === 'supplies') {
      headers = ['SKU', 'Item Name', 'Group / Category', 'Warehouse Location', 'UOM', 'Balance Qty', 'Balance Value (PHP)', 'Low Stock Alert'];
      const data = categoryFilter
        ? officeSupplies.filter(s => s.group.toLowerCase().includes(categoryFilter.toLowerCase()))
        : officeSupplies;
      rows = data.map(s => [
        `"${s.sku}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.group}"`,
        `"${s.warehouse}"`,
        `"${s.uom}"`,
        `"${s.balanceQty}"`,
        `"${s.balanceValue}"`,
        `"${s.lowStock ? 'YES' : 'NO'}"`,
      ]);
      filename = `CentaurChem_Office_Supplies_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (tab === 'audit') {
      headers = ['Timestamp', 'Document / Ref ID', 'Module', 'Action', 'Performer', 'Target Department', 'Details', 'Status'];
      rows = auditTrail.map(l => [
        `"${l.timestamp}"`,
        `"${l.docId}"`,
        `"${l.module}"`,
        `"${l.action.replace(/"/g, '""')}"`,
        `"${l.performer}"`,
        `"${l.targetDept}"`,
        `"${l.details.replace(/"/g, '""')}"`,
        `"${l.status}"`,
      ]);
      filename = `CentaurChem_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AssetContext.Provider
      value={{
        fleetAssets,
        officeSupplies,
        auditTrail,
        healthCategories,
        selectedItemForQR,
        openQRModal,
        closeQRModal,
        addFleetAsset,
        updateFleetAsset,
        deleteFleetAsset,
        bulkDeleteFleetAssets,
        addOfficeSupply,
        updateOfficeSupply,
        deleteOfficeSupply,
        bulkDeleteOfficeSupplies,
        deleteAuditLog,
        bulkDeleteAuditLogs,
        importFleetAssetsFromCSV,
        importToSelectedTab,
        exportFleetAssetsToCSV,
        exportSelectedTabToCSV,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
}

export function useAssetData() {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssetData must be used within an AssetProvider');
  }
  return context;
}
