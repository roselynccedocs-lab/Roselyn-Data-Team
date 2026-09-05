import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Send, 
  Printer, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  CheckCircle2, 
  User, 
  Building, 
  FileCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  History,
  Edit2,
  Check,
  X,
  AlertCircle,
  Truck,
  QrCode,
  Radio,
  FilePlus,
  Save,
  Scan,
  Download,
  Upload,
  RotateCcw,
  Camera,
  Image as ImageIcon,
  Eye,
  Sliders,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PreciseQRCode } from './PreciseQRCode';
import { INITIAL_IT_USERS } from '../../data/itStaffUsersData';
import { db } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../../types';
import { CentaurLogo } from '../common/CentaurLogo';

export const STANDARD_UOMS = [
  'BOX',
  'PCS',
  'SET',
  'ROLL',
  'REAM',
  'BOTTLE',
  'PACK',
  'CAN',
  'UNIT',
  'METER',
  'KG',
  'LITER',
  'BAG',
  'PAIR',
  'LOT',
  'DRUM',
  'TIN'
];

export function FormsAndRequests() {
  const [activeFormType, setActiveFormType] = useState<
    'issuance' | 'return' | 'transfer' | 'vehicle' | 'receipt' | 'material_req' | 'surrender' | 'radio'
  >('issuance');

  const [activeView, setActiveView] = useState<'form' | 'history'>('form');
  const [searchTerm, setSearchTerm] = useState('');

  // User Profiles synchronized directly from IT Department User Management Roster
  const [usersRoster, setUsersRoster] = useState<UserProfile[]>(INITIAL_IT_USERS);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'users'), (snap) => {
        if (!snap.empty) {
          const map = new Map<string, UserProfile>();
          INITIAL_IT_USERS.forEach(u => map.set(u.email.toLowerCase(), u));
          snap.docs.forEach(d => {
            const data = d.data() as UserProfile;
            if (data.email) map.set(data.email.toLowerCase(), { ...data, id: d.id });
          });
          setUsersRoster(Array.from(map.values()));
        }
      }, (err) => {
        console.warn('Users roster sync notice:', err);
      });
      return () => unsub();
    } catch (e) {
      // fallback to initial
    }
  }, []);

  const employees = usersRoster.map((u, idx) => ({
    id: u.id || u.email || `emp-${idx}`,
    name: u.displayName,
    dept: u.department,
    email: u.email,
    empNo: u.employeeNo || 'N/A',
    pos: u.position || 'Staff',
    dateHired: u.dateHired || 'N/A'
  }));

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || INITIAL_IT_USERS[0].id);
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0] || {
    id: 'usr_arnold_cortina_docs',
    name: 'Dr. Arnold Cortina',
    dept: 'Research & Development',
    email: 'arnoldcortina.cce.docs@gmail.com',
    empNo: 'EMP-1001',
    pos: 'Chief R&D Scientist',
    dateHired: '2021-03-15'
  };

  // Fullscreen/expanded preview modal state for images
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  // Client-side image compressor utility (creates lightweight base64 JPEG thumbnail)
  const compressImage = (file: File, callback: (compressedDataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 280;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          callback(canvas.toDataURL('image/jpeg', 0.82));
        }
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // ===================== FORM STATE ENGINES WITH ADD/EDIT/DELETE =====================

  // 1 & 2. Asset Issuance / Asset Return Row Setup (Image 2 & 3)
  const [issuanceRows, setIssuanceRows] = useState([
    { id: 1, itemDesc: 'MacBook Pro M3 Max 16-inch', serialNo: 'C02XG5K1JG5H', qty: 1, condition: 'Good / New', receivedBy: 'Arnold Cortina', dateRec: '09/02/2026', isEditing: false, photo: '' },
    { id: 2, itemDesc: 'Dell UltraSharp 32" 4K Monitor', serialNo: 'SN-MON-9981', qty: 1, condition: 'Good', receivedBy: 'Arnold Cortina', dateRec: '09/02/2026', isEditing: false, photo: '' },
    { id: 3, itemDesc: 'Agilent HPLC Chromatography Unit', serialNo: 'AGI-99281', qty: 1, condition: 'Good', receivedBy: 'Arnold Cortina', dateRec: '09/02/2026', isEditing: false, photo: '' },
    { id: 4, itemDesc: 'Motorola CP200 Two-Way Radio', serialNo: 'SN-89234912', qty: 1, condition: 'Good', receivedBy: 'Arnold Cortina', dateRec: '09/02/2026', isEditing: false, photo: '' },
  ]);

  // 3. Department Transfer / Issuance Form (Image 4)
  const [transferHeader, setTransferHeader] = useState({
    issuanceNo: 'CCE-000436',
    transferToDept: 'HR DEPARTMENT',
    date: '2026-09-02',
    preparedBy: 'Arnold Cortina',
    approvedBy: 'Ronalyn Custodio'
  });

  const [transferRows, setTransferRows] = useState([
    { id: 1, itemDesc: 'Ergonomic Executive Desk Chair', serialNo: 'OFF-CHR-102', qty: 2, uom: 'PCS', receivedBy: 'Ronalyn Custodio', dateRec: '09/02/2026', isEditing: false, photo: '' },
    { id: 2, itemDesc: 'Epson Heavy Duty Document Scanner', serialNo: 'EPS-SCN-401', qty: 1, uom: 'UNIT', receivedBy: 'Ronalyn Custodio', dateRec: '09/02/2026', isEditing: false, photo: '' },
  ]);

  // 4. Vehicle Repair Assessment Form (Image 5)
  const [vehicleForm, setVehicleForm] = useState({
    formNo: 'VAF-1001',
    date: '2026-09-02',
    vehicleType: 'SUV / Pick-Up',
    plateNo: 'NAI-8890',
    odometer: '45,210 KM',
    chassisNo: 'CHS-99821039',
    engineNo: 'ENG-442190',
    yearModel: '2022',
    natureOfRepair: { routinePMS: true, mechanical: true, electrical: false, bodyRepair: false, paintJob: false, others: false },
    estimatedCost: '15,000.00',
    targetDate: '2026-09-10',
    checklist: { spareTire: true, jackTools: true, stereo: true, dashcam: true, matting: true, emergencyLight: false, manualBook: true, registration: true },
    signatures: { requestedBy: 'Jerome Daypuyart', assessedBy: 'Jerome Daypuyart', receivedAsset: 'Arnold Cortina', approvedMgmt: 'Rhodora Manuel', receivedPurchasing: 'Katrina Ilagan', forwardedAsset: 'Arnold Cortina' }
  });

  const [vehicleIssues, setVehicleIssues] = useState([
    { id: 1, text: 'Engine oil replacement and filter change required', isEditing: false },
    { id: 2, text: 'Brake pad noise on front right wheel assembly', isEditing: false },
    { id: 3, text: 'Air conditioning belt tightening and filter cleaning', isEditing: false },
  ]);

  // 5. Purchase Receipt Form (Image 6)
  const [receiptHeader, setReceiptHeader] = useState({
    receiptNo: 'CCE-PR000132',
    supplier: 'MERCURY DRUG / WATERMART LAB SUPPLIES',
    deliveryNote: 'DR-99201-B',
    dateReceived: '2026-09-02',
    postingTime: '10:35:55 PM',
    remarks: 'Regular quarterly inventory replenishment for lab reagents & safety gear.',
    supplierAddress: '124 Industry Ave, Pasig City',
    contactNumber: '+632 8812 9900',
    deliveryAddress: 'Centaur Chem BGC Lab, Taguig City',
    currency: 'PHP',
    priceList: 'STANDARD BUYING PHP',
    preparedBy: 'Katrina Ilagan',
    approvedBy: 'Rhodora Manuel'
  });

  const [receiptRows, setReceiptRows] = useState([
    { id: 1, freeItem: false, itemCode: 'LAB-REAG-01', itemName: 'Ethanol 99.9% Absolute Grade 2.5L', acceptedQty: 10, uom: 'BOTTLE', remarks: 'Passed QC Inspection', isEditing: false, photo: '' },
    { id: 2, freeItem: false, itemCode: 'SAF-GLV-02', itemName: 'Nitrile Protective Gloves (Box of 100)', acceptedQty: 25, uom: 'BOX', remarks: 'Good condition', isEditing: false, photo: '' },
  ]);

  // 6. Material Request Form (Image 7)
  const [materialHeader, setMaterialHeader] = useState({
    series: 'CCE-MR-20260902-00005',
    transactionDate: '2026-09-02',
    requiredBy: '2026-09-09',
    type: 'Purchase',
    requestor: 'arnoldcortina.cce.docs@gmail.com',
    status: 'Draft',
    transferToDept: 'Research & Development',
    remarks: 'Urgent reagent replenishment for chemical synthesis line.',
    preparedBy: 'Arnold Cortina',
    approvedBy: 'Jerome Daypuyart',
    receivedBy: ''
  });

  const [materialRows, setMaterialRows] = useState([
    { id: 1, itemCode: 'CHEM-SLV-10', itemName: 'Distilled Acetone HPLC Grade', requiredBy: '2026-09-09', description: 'Solvent for lab testing', qty: 5, stockUom: 'LITERS', isEditing: false, photo: '' },
    { id: 2, itemCode: 'LAB-PIP-03', itemName: 'Digital Micropipette Set (0.5-10uL)', requiredBy: '2026-09-09', description: 'Precision liquid dispensing', qty: 2, stockUom: 'SETS', isEditing: false, photo: '' },
  ]);

  // 7. Asset Surrender Form (Image 8)
  const [surrenderHeader, setSurrenderHeader] = useState({
    documentId: 'CENTAUR-RST-2026-01',
    date: '2026-09-02',
    fromDept: 'IT DEPARTMENT',
    toDept: 'HR DEPARTMENT',
    preparedBy: 'Arnold Cortina',
    approvedBy: 'Ronalyn Custodio'
  });

  const [surrenderRows, setSurrenderRows] = useState([
    { id: 1, itemDesc: 'ThinkPad X1 Carbon Gen 10', serialNo: 'SN-TP-88219', qty: 1, condition: 'Returned / Good', receivedBy: 'Ronalyn Custodio', dateRec: '09/02/2026', isEditing: false, photo: '' },
    { id: 2, itemDesc: 'USB-C Thunderbolt Docking Station', serialNo: 'SN-DCK-102', qty: 1, condition: 'Complete with cables', receivedBy: 'Ronalyn Custodio', dateRec: '09/02/2026', isEditing: false, photo: '' },
  ]);

  // 8. Radio Phone Checklist & Handover Form (Image 9)
  const [radioHeader, setRadioHeader] = useState({
    controlNo: 'CENTAUR-RPC-2026-01',
    inspectionDate: '2026-09-02',
    inspectionTime: '10:35 PM',
    shiftSchedule: 'Day Shift (8:00 AM - 5:00 PM)',
    facilityLocation: 'Batangas Main Warehouse',
    department: 'UTILITIES',
    custodian: 'Arnold Cortina',
    radioId: 'Radio Unit #01',
    brandModel: 'Motorola Mag One / CP200',
    serialNo: 'SN-89234912 / CC-RA',
    channel: 'Channel 1 - Warehouse / Lab',
    overallStatus: 'Operational / Fit for Duty',
    remarks: 'Unit inspected and verified in good working condition.',
    inspectedBy: 'Arnold Cortina',
    issuedBy: 'Arnold Cortina',
    receivedBy: 'Arnold Cortina',
    approvedBy: 'Department Head / Admin'
  });

  const [radioChecklist, setRadioChecklist] = useState([
    { id: 1, category: 'Physical Condition', item: 'Antenna Condition (Straight, intact casing, no cracks)', status: 'Good', notes: '' },
    { id: 2, category: 'Physical Condition', item: 'Battery Casing & Locking Latch (Securely locked, no swelling)', status: 'Good', notes: '' },
    { id: 3, category: 'Physical Condition', item: 'Housing / Body & Belt Clip (Clean, sturdy clip attached)', status: 'Good', notes: '' },
    { id: 4, category: 'Power & Battery', item: 'Battery Charge Level (Full charge / Ready for full shift)', status: 'Good', notes: '' },
    { id: 5, category: 'Power & Battery', item: 'Charging Base Cradle & Power Cord (LED indicator working)', status: 'Good', notes: '' },
    { id: 6, category: 'Controls & Audio', item: 'Push-To-Talk (PTT) Button (Tactile click, responsive)', status: 'Good', notes: '' },
    { id: 7, category: 'Controls & Audio', item: 'Volume / Power Knob (Turns on/off cleanly, smooth sweep)', status: 'Good', notes: '' },
    { id: 8, category: 'Controls & Audio', item: 'Channel Selector Switch & Display (Accurate tuning)', status: 'Good', notes: '' },
    { id: 9, category: 'Audio Transmission', item: 'Microphone & TX Clarity (Clear voice transmission, no static)', status: 'Good', notes: '' },
    { id: 10, category: 'Audio Transmission', item: 'Speaker & RX Clarity (Loud, crisp receive audio)', status: 'Good', notes: '' },
    { id: 11, category: 'Accessories', item: 'External Mic / Earpiece / Headset (If issued, clean audio)', status: 'Good', notes: '' },
    { id: 12, category: 'Operational Test', item: 'Radio Check / Range Communication Test (Passes test)', status: 'Good', notes: '' },
  ]);

  // Form Submission History (Matching Screenshots 4 & 11)
  const [formHistory, setFormHistory] = useState([
    { id: 'CENTAUR-ONB-2026-03', uid: 'GEN-ISS-9921', holder: 'DR. ARNOLD CORTINA', email: 'arnoldcortina.cce.docs@gmail.com', dept: 'RESEARCH & DEVELOPMENT', type: 'ASSET ISSUANCE', items: '4 items', date: '9/2/2026, 1:55 PM' },
    { id: 'CENTAUR-OFF-2026-01', uid: 'GEN-RET-1022', holder: 'JEROME DAYPUYART', email: 'jerome.planning.cce@gmail.com', dept: 'OPERATIONS DEPARTMENT', type: 'ASSET RETURN', items: '2 items', date: '9/2/2026, 1:45 PM' },
    { id: 'CCE-000436', uid: 'DEP-TRS-4412', holder: 'HR DEPARTMENT', email: 'ronalyn.custodio@centaurchem.ph', dept: 'HUMAN RESOURCES', type: 'DEPT TRANSFER', items: '2 items', date: '9/2/2026, 1:40 PM' },
    { id: 'CCE-MR-20260902-00005', uid: 'MAT-REQ-8812', holder: 'PURCHASING AND LOGISTICS', email: 'katrina.ilagan@centaurchem.ph', dept: 'PURCHASING AND LOGISTICS', type: 'MATERIAL REQ', items: '2 items', date: '9/2/2026, 1:20 PM' },
    { id: 'CCE-PR000132', uid: 'PUR-REC-3310', holder: 'MERCURY DRUG SUPPLIES', email: 'supplier@mercurydrug.com', dept: 'RESEARCH & DEVELOPMENT', type: 'PURCHASE REC', items: '2 items', date: '9/1/2026, 4:15 PM' },
    { id: 'CENTAUR-RPC-2026-01', uid: 'RAD-HND-1001', holder: 'BATANGAS WAREHOUSE', email: 'arnoldcortina.cce.docs@gmail.com', dept: 'UTILITIES', type: 'RADIO HANDOVER', items: '12 checklist items', date: '8/30/2026, 10:00 AM' },
  ]);

  // Bulk History Selection & Delete Modal State
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteModalAction, setDeleteModalAction] = useState<'selected' | 'all' | string>('selected');

  // Live Series Slider State & Ref
  const [seriesSliderValue, setSeriesSliderValue] = useState(0);
  const seriesContainerRef = useRef<HTMLDivElement>(null);

  const handleSeriesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setSeriesSliderValue(Math.round((el.scrollLeft / maxScroll) * 100));
    }
  };

  const handleSliderChange = (newVal: number) => {
    setSeriesSliderValue(newVal);
    if (seriesContainerRef.current) {
      const maxScroll = seriesContainerRef.current.scrollWidth - seriesContainerRef.current.clientWidth;
      seriesContainerRef.current.scrollLeft = (newVal / 100) * maxScroll;
    }
  };

  // Permanent Delete Confirmation Handler
  const executePermanentDelete = () => {
    if (deleteModalAction === 'all') {
      setFormHistory([]);
      setSelectedHistoryIds([]);
    } else if (deleteModalAction === 'selected') {
      setFormHistory(formHistory.filter(h => !selectedHistoryIds.includes(h.id)));
      setSelectedHistoryIds([]);
    } else {
      setFormHistory(formHistory.filter(h => h.id !== deleteModalAction));
      setSelectedHistoryIds(selectedHistoryIds.filter(id => id !== deleteModalAction));
    }
    setShowDeleteConfirmModal(false);
  };

  // Handle generic form submission
  const handleSaveForm = () => {
    let docId = '';
    let formTypeName = '';
    let itemsCount = 0;

    switch(activeFormType) {
      case 'issuance': docId = 'CENTAUR-ONB-2026-03'; formTypeName = 'ASSET ISSUANCE'; itemsCount = issuanceRows.length; break;
      case 'return': docId = 'CENTAUR-OFF-2026-01'; formTypeName = 'ASSET RETURN'; itemsCount = issuanceRows.length; break;
      case 'transfer': docId = transferHeader.issuanceNo; formTypeName = 'ISSUANCE / TRANSFER'; itemsCount = transferRows.length; break;
      case 'vehicle': docId = vehicleForm.formNo; formTypeName = 'VEHICLE REPAIR'; itemsCount = vehicleIssues.length; break;
      case 'receipt': docId = receiptHeader.receiptNo; formTypeName = 'PURCHASE RECEIPT'; itemsCount = receiptRows.length; break;
      case 'material_req': docId = materialHeader.series; formTypeName = 'MATERIAL REQUEST'; itemsCount = materialRows.length; break;
      case 'surrender': docId = surrenderHeader.documentId; formTypeName = 'ASSET SURRENDER'; itemsCount = surrenderRows.length; break;
      case 'radio': docId = radioHeader.controlNo; formTypeName = 'RADIO HANDOVER'; itemsCount = radioChecklist.length; break;
    }

    const newRecord = {
      id: docId,
      uid: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      holder: selectedEmployee.name.toUpperCase(),
      email: selectedEmployee.email,
      dept: selectedEmployee.dept.toUpperCase(),
      type: formTypeName,
      items: `${itemsCount} record(s)`,
      date: new Date().toLocaleString()
    };

    setFormHistory([newRecord, ...formHistory]);
    alert(`Success! Record ${docId} saved and logged in Form History.`);
    setActiveView('history');
  };

  const filteredHistory = formHistory.filter(h => 
    h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const seriesItems = [
    { label: 'Issuance Form', code: 'CENTAUR-ONB-2026-03', color: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    { label: 'Return Form', code: 'CENTAUR-OFF-2026-01', color: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    { label: 'Transfer Form', code: 'CCE-000436', color: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
    { label: 'Vehicle Repair', code: 'VAF-1001', color: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
    { label: 'Purchase Receipt', code: 'CCE-PR000132', color: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    { label: 'Material Request', code: 'CCE-MR-20260902-00005', color: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    { label: 'Asset Surrender', code: 'SURR-2026-0881', color: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
    { label: 'Radio Handover', code: 'CENTAUR-RPC-2026-01', color: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner - Light Green Box */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-emerald-50 rounded-2xl p-6 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded text-[10px] font-mono font-bold tracking-wider uppercase">
              ORGANIZATION WORKSPACE & FORM GENERATOR
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">Forms, Material Requests & Asset Handovers</h2>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">Submit Asset Issuances, Returns, Vehicle Repairs, Purchase Receipts or Radio Handovers with real-time QR tagging.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setActiveFormType('issuance'); setActiveView('form'); }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Asset Issuance
            </button>
            <button
              onClick={() => { setActiveFormType('material_req'); setActiveView('form'); }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FilePlus className="w-3.5 h-3.5" /> Material Request
            </button>
            <button
              onClick={() => setActiveView('form')}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                activeView === 'form' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Interactive Forms
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                activeView === 'history' ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 hover:bg-purple-200 border border-purple-300 dark:border-purple-700'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Form History ({formHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* LIVE SERIES ACTIVE TRACKER WITH INTEGRATED INTERACTIVE SLIDER */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/40 text-slate-800 dark:text-emerald-100 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase text-emerald-800 dark:text-emerald-300">
            <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>LIVE SERIES ACTIVE TRACKER (AUTO-INCREMENTED ON SUBMIT)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSliderChange(Math.max(0, seriesSliderValue - 20))}
              className="p-1 rounded bg-white dark:bg-emerald-900/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 transition-colors"
              title="Slide Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSliderChange(Math.min(100, seriesSliderValue + 20))}
              className="p-1 rounded bg-white dark:bg-emerald-900/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 transition-colors"
              title="Slide Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Series Cards */}
        <div
          ref={seriesContainerRef}
          onScroll={handleSeriesScroll}
          className="flex items-center gap-2.5 overflow-x-auto text-[11px] font-mono whitespace-nowrap pb-1 scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-700"
        >
          {seriesItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-2xs shrink-0 hover:border-emerald-400 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">{item.label}:</span>
              <strong className={`${item.color} font-black font-mono`}>{item.code}</strong>
            </div>
          ))}
        </div>

        {/* Range Slider for Series Visibility Control */}
        <div className="pt-2 border-t border-emerald-200/70 dark:border-emerald-800/60 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase shrink-0">
            <Sliders className="w-3 h-3 text-emerald-600" />
            <span>Series Track Slider:</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={seriesSliderValue}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-1.5 bg-emerald-200 dark:bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
            title="Slide to scroll series numbers"
          />
          <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 shrink-0 w-8 text-right">
            {seriesSliderValue}%
          </span>
        </div>
      </div>

      {activeView === 'form' ? (
        <div className="space-y-6">
          {/* Printable Forms Selector Navigation Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs flex flex-wrap gap-1">
            {[
              { id: 'issuance', label: 'Employee On-Boarding' },
              { id: 'return', label: 'Employee Off-Boarding' },
              { id: 'transfer', label: 'Dept Transfer' },
              { id: 'vehicle', label: 'Vehicle Assessment' },
              { id: 'receipt', label: 'Purchase Receipt' },
              { id: 'material_req', label: 'Material Request' },
              { id: 'surrender', label: 'Asset Surrender' },
              { id: 'radio', label: 'Radio Phone Handover' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFormType(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFormType === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Context Top Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SELECT EMPLOYEE FOR FORM PRE-FILL:</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="block w-full sm:w-80 mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} — {e.dept} {e.pos ? `(${e.pos})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                title="Open Print Preview to print form"
              >
                <Printer className="w-4 h-4" /> Print Form
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-emerald-600" /> Save Record
              </button>
            </div>
          </div>

          {/* ================= FORM 1 & 2: ASSET ISSUANCE / ASSET RETURN FORM (Image 2 & 3) ================= */}
          {(activeFormType === 'issuance' || activeFormType === 'return') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
              {/* Form Header */}
              <div className="flex items-start justify-between border-b border-slate-300 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-700 shadow-md">
                    <CentaurLogo size={48} />
                  </div>
                  <div>
                    <h2 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wide">CENTAUR CHEM ENTERPRISE</h2>
                    <p className="text-[10px] text-slate-500 font-medium">156 Capistrano St. Bgy. Hagonoy, Taguig City 1630 | Tel & Phone No.: 02 8230 4514 | +639 264 950 334</p>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase">
                    {activeFormType === 'issuance' ? 'ASSET ISSUANCE' : 'ASSET RETURN FORM'}
                  </h3>
                  <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                    Document ID: {activeFormType === 'issuance' ? 'CENTAUR-ONB-2026-03' : 'CENTAUR-OFF-2026-01'}
                  </p>
                </div>
              </div>

              {/* Employee Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">EMPLOYEE NAME</label>
                  <p className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-300 dark:border-slate-600 pb-1 mt-1">{selectedEmployee.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">EMAIL / DEPARTMENT</label>
                  <p className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-300 dark:border-slate-600 pb-1 mt-1">{selectedEmployee.email} ({selectedEmployee.dept})</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">EMPLOYEE NUMBER / STATUS</label>
                  <p className="font-mono font-bold text-slate-900 dark:text-white text-sm border-b border-slate-300 dark:border-slate-600 pb-1 mt-1">{selectedEmployee.empNo} / REGULAR</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">POSITION</label>
                  <p className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-300 dark:border-slate-600 pb-1 mt-1">{selectedEmployee.pos}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">DATE HIRED</label>
                  <p className="font-mono font-bold text-slate-900 dark:text-white text-sm border-b border-slate-300 dark:border-slate-600 pb-1 mt-1">{selectedEmployee.dateHired}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">PERSON IN CHARGE ({activeFormType === 'issuance' ? 'ISSUANCE' : 'RECEIVE'})</label>
                  <p className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-300 dark:border-slate-600 pb-1 mt-1">Dr. Arnold Cortina (Asset Officer)</p>
                </div>
              </div>

              {/* ASSET DETAILS TABLE WITH ADD/EDIT/DELETE AND PRECISE QR CODE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    ASSET DETAILS
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIssuanceRows([...issuanceRows, { id: Date.now(), itemDesc: '', serialNo: '', qty: 1, condition: 'Good', receivedBy: selectedEmployee.name, dateRec: '09/02/2026', isEditing: true }])}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                    <button
                      onClick={() => { if(confirm('Clear all asset rows?')) setIssuanceRows([]); }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 dark:bg-red-950 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-emerald-600 rounded-xl shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#047857] text-white uppercase font-black text-[10px]">
                      <tr>
                        <th className="p-3 border-r border-emerald-600">ITEM DESCRIPTION</th>
                        <th className="p-3 border-r border-emerald-600">SERIAL / ASSET ID</th>
                        <th className="p-3 border-r border-emerald-600 w-16 text-center">QTY</th>
                        <th className="p-3 border-r border-emerald-600">CONDITION</th>
                        <th className="p-3 border-r border-emerald-600 text-center">ITEM PHOTO / QR CODE</th>
                        <th className="p-3 border-r border-emerald-600">RECEIVED BY</th>
                        <th className="p-3 border-r border-emerald-600">DATE REC.</th>
                        <th className="p-3 text-center w-24">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {issuanceRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.itemDesc}
                                onChange={(e) => {
                                  const updated = [...issuanceRows];
                                  updated[idx].itemDesc = e.target.value;
                                  setIssuanceRows(updated);
                                }}
                                className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold outline-none"
                              />
                            ) : (
                              <span className="font-bold text-slate-900 dark:text-white">{row.itemDesc || 'N/A'}</span>
                            )}
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.serialNo}
                                onChange={(e) => {
                                  const updated = [...issuanceRows];
                                  updated[idx].serialNo = e.target.value;
                                  setIssuanceRows(updated);
                                }}
                                className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono outline-none"
                              />
                            ) : (
                              <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{row.serialNo || 'N/A'}</span>
                            )}
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
                            {row.isEditing ? (
                              <input
                                type="number"
                                value={row.qty}
                                onChange={(e) => {
                                  const updated = [...issuanceRows];
                                  updated[idx].qty = parseInt(e.target.value) || 1;
                                  setIssuanceRows(updated);
                                }}
                                className="w-full p-1 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold text-center"
                              />
                            ) : (
                              row.qty
                            )}
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.condition}
                                onChange={(e) => {
                                  const updated = [...issuanceRows];
                                  updated[idx].condition = e.target.value;
                                  setIssuanceRows(updated);
                                }}
                                className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs"
                              />
                            ) : (
                              <span className="text-slate-600 dark:text-slate-400">{row.condition}</span>
                            )}
                          </td>

                          {/* PRECISE QR CODE & COMPRESSED PHOTO CELL */}
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              {row.photo ? (
                                <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                                  <div className="shrink-0 cursor-pointer" onClick={() => setPreviewModalImage(row.photo || null)} title="Click to view QR">
                                    <PreciseQRCode value={row.serialNo || row.itemDesc || `ITEM-${row.id}`} size={36} showLabel={false} />
                                  </div>
                                  <div className="relative group shrink-0">
                                    <img
                                      src={row.photo}
                                      alt="Item attachment"
                                      className="w-9 h-9 object-cover rounded border border-slate-300 dark:border-slate-600 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => setPreviewModalImage(row.photo || null)}
                                      title="Click to view full image"
                                    />
                                    {row.isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...issuanceRows];
                                          updated[idx].photo = '';
                                          setIssuanceRows(updated);
                                        }}
                                        title="Remove photo"
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <PreciseQRCode value={row.serialNo || row.itemDesc || `ITEM-${row.id}`} size={38} showLabel={false} />
                              )}

                              <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800 transition-colors">
                                <Camera className="w-3 h-3" />
                                <span>{row.photo ? 'Change' : 'Add Image'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      compressImage(file, (dataUrl) => {
                                        const updated = [...issuanceRows];
                                        updated[idx].photo = dataUrl;
                                        setIssuanceRows(updated);
                                      });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.receivedBy}
                                onChange={(e) => {
                                  const updated = [...issuanceRows];
                                  updated[idx].receivedBy = e.target.value;
                                  setIssuanceRows(updated);
                                }}
                                className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs"
                              />
                            ) : (
                              <span className="text-slate-800 dark:text-slate-200 font-medium">{row.receivedBy}</span>
                            )}
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-500">
                            {row.isEditing ? (
                              <input
                                type="date"
                                value={row.dateRec}
                                onChange={(e) => {
                                  const updated = [...issuanceRows];
                                  updated[idx].dateRec = e.target.value;
                                  setIssuanceRows(updated);
                                }}
                                className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                              />
                            ) : (
                              <span>{row.dateRec}</span>
                            )}
                          </td>

                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {row.isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...issuanceRows];
                                    updated[idx].isEditing = false;
                                    setIssuanceRows(updated);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                                  title="Save row"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...issuanceRows];
                                    updated[idx].isEditing = true;
                                    setIssuanceRows(updated);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                                  title="Edit row"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setIssuanceRows(issuanceRows.filter(r => r.id !== row.id))}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TERMS OF AGREEMENT SECTION */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                <h5 className="font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider">TERMS OF AGREEMENT</h5>
                <ol className="list-decimal list-inside space-y-1">
                  <li><strong>Professional Use Only:</strong> The IT assets listed above are provided solely for performing work-related duties. Personal use is strictly prohibited.</li>
                  <li><strong>Care and Maintenance:</strong> The employee is responsible for physical security and proper care of the assets. Any damage or loss must be reported to IT immediately.</li>
                  <li><strong>Surrender Policy:</strong> Upon termination of employment or request by the IT department, all assets must be returned in good working condition.</li>
                </ol>
              </div>

              {/* DEPARTMENTAL CLEARANCES (8 BOXES FROM IMAGE 2 & 3) */}
              <div>
                <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">DEPARTMENTAL CLEARANCES</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                  {['ACCOUNTING', 'IT', 'HR', 'FINANCE', 'ASSET AND DATA', 'OPERATIONS', 'SALES', 'PURCHASING'].map((dept) => (
                    <div key={dept} className="border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-white dark:bg-slate-900 shadow-2xs space-y-3">
                      <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tight block">{dept}</span>
                      <div className="border-b border-dashed border-slate-400 h-6"></div>
                      <span className="text-[9px] text-slate-400 italic block">Authorized Signature</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* EMPLOYEE SIGNATURE LINE */}
              <div className="pt-4 border-t border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-end justify-between gap-4">
                <div className="w-full sm:w-72 space-y-2">
                  <div className="border-b-2 border-slate-900 dark:border-slate-100 h-10 flex items-end font-mono font-bold text-xs">
                    {selectedEmployee.name}
                  </div>
                  <span className="font-extrabold text-[10px] text-slate-500 uppercase block">EMPLOYEE SIGNATURE</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">DATE SIGNED</span>
                  <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">9/2/2026</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= FORM 3: ISSUANCE / DEPARTMENT TRANSFER FORM (Image 4) ================= */}
          {activeFormType === 'transfer' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-300 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-700 shadow-md">
                    <CentaurLogo size={48} />
                  </div>
                  <div>
                    <h2 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wide">CENTAUR CHEM ENTERPRISE</h2>
                    <p className="text-[10px] text-slate-500 font-medium">156 Capistrano St. Bgy. Hagonoy, Taguig City 1630 | Tel & Phone No.: 02 8230 4514 | +639 264 950 334</p>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase">ISSUANCE FORM</h3>
                  <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">Document ID: {transferHeader.issuanceNo}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">ISSUANCE NO.</label>
                  <input
                    type="text"
                    value={transferHeader.issuanceNo}
                    onChange={(e) => setTransferHeader({ ...transferHeader, issuanceNo: e.target.value })}
                    className="w-full mt-1 p-1.5 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">TRANSFER TO / DEPARTMENT</label>
                  <select
                    value={transferHeader.transferToDept}
                    onChange={(e) => setTransferHeader({ ...transferHeader, transferToDept: e.target.value })}
                    className="w-full mt-1 p-1.5 border border-slate-300 dark:border-slate-700 rounded font-bold text-slate-900 dark:text-white"
                  >
                    <option>HR DEPARTMENT</option>
                    <option>OPERATIONS DEPARTMENT</option>
                    <option>PURCHASING AND LOGISTICS</option>
                    <option>RESEARCH & DEVELOPMENT</option>
                    <option>FINANCE & TREASURY</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">DATE</label>
                  <input
                    type="date"
                    value={transferHeader.date}
                    onChange={(e) => setTransferHeader({ ...transferHeader, date: e.target.value })}
                    className="w-full mt-1 p-1.5 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* ASSET DETAILS TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-emerald-600 uppercase tracking-wider">ASSET DETAILS</h4>
                  <button
                    onClick={() => setTransferRows([...transferRows, { id: Date.now(), itemDesc: '', serialNo: '', qty: 1, uom: 'PCS', receivedBy: 'Ronalyn Custodio', dateRec: '09/02/2026', isEditing: true }])}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="overflow-x-auto border border-emerald-600 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#047857] text-white uppercase font-black text-[10px]">
                      <tr>
                        <th className="p-3 border-r border-emerald-600">ITEM DESCRIPTION</th>
                        <th className="p-3 border-r border-emerald-600">SERIAL / ASSET ID</th>
                        <th className="p-3 border-r border-emerald-600 w-16 text-center">QTY</th>
                        <th className="p-3 border-r border-emerald-600 w-20">UOM</th>
                        <th className="p-3 border-r border-emerald-600 text-center">ITEM PHOTO / QR CODE</th>
                        <th className="p-3 border-r border-emerald-600">RECEIVED BY / SIGNATURE</th>
                        <th className="p-3 border-r border-emerald-600">DATE REC.</th>
                        <th className="p-3 text-center w-20">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {transferRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.itemDesc}
                                onChange={(e) => {
                                  const u = [...transferRows];
                                  u[idx].itemDesc = e.target.value;
                                  setTransferRows(u);
                                }}
                                className="w-full p-1 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold"
                              />
                            ) : (
                              <span className="font-bold text-slate-900 dark:text-white">{row.itemDesc}</span>
                            )}
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-mono">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.serialNo}
                                onChange={(e) => {
                                  const u = [...transferRows];
                                  u[idx].serialNo = e.target.value;
                                  setTransferRows(u);
                                }}
                                className="w-full p-1 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                              />
                            ) : (
                              <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{row.serialNo}</span>
                            )}
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
                            {row.isEditing ? (
                              <input
                                type="number"
                                value={row.qty}
                                onChange={(e) => {
                                  const u = [...transferRows];
                                  u[idx].qty = parseInt(e.target.value) || 1;
                                  setTransferRows(u);
                                }}
                                className="w-full p-1 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold text-center"
                              />
                            ) : (
                              row.qty
                            )}
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400">
                            {row.isEditing ? (
                              <select
                                value={row.uom}
                                onChange={(e) => {
                                  const u = [...transferRows];
                                  u[idx].uom = e.target.value;
                                  setTransferRows(u);
                                }}
                                className="w-full p-1 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold uppercase bg-white dark:bg-slate-800"
                              >
                                {STANDARD_UOMS.map((uom) => (
                                  <option key={uom} value={uom}>{uom}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold text-xs">
                                {row.uom}
                              </span>
                            )}
                          </td>

                          {/* PRECISE QR CODE & COMPRESSED PHOTO CELL */}
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              {row.photo ? (
                                <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                                  <div className="shrink-0 cursor-pointer" onClick={() => setPreviewModalImage(row.photo || null)}>
                                    <PreciseQRCode value={row.serialNo || row.itemDesc || `ITEM-${row.id}`} size={36} showLabel={false} />
                                  </div>
                                  <div className="relative group shrink-0">
                                    <img
                                      src={row.photo}
                                      alt="Item attachment"
                                      className="w-9 h-9 object-cover rounded border border-slate-300 dark:border-slate-600 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => setPreviewModalImage(row.photo || null)}
                                    />
                                    {row.isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const u = [...transferRows];
                                          u[idx].photo = '';
                                          setTransferRows(u);
                                        }}
                                        title="Remove photo"
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <PreciseQRCode value={row.serialNo || row.itemDesc || `ITEM-${row.id}`} size={38} showLabel={false} />
                              )}

                              <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800 transition-colors">
                                <Camera className="w-3 h-3" />
                                <span>{row.photo ? 'Change' : 'Add Image'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      compressImage(file, (dataUrl) => {
                                        const u = [...transferRows];
                                        u[idx].photo = dataUrl;
                                        setTransferRows(u);
                                      });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.receivedBy}
                                onChange={(e) => {
                                  const u = [...transferRows];
                                  u[idx].receivedBy = e.target.value;
                                  setTransferRows(u);
                                }}
                                className="w-full p-1 border border-slate-300 dark:border-slate-700 rounded text-xs"
                              />
                            ) : (
                              row.receivedBy
                            )}
                          </td>

                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-500">
                            {row.isEditing ? (
                              <input
                                type="date"
                                value={row.dateRec}
                                onChange={(e) => {
                                  const u = [...transferRows];
                                  u[idx].dateRec = e.target.value;
                                  setTransferRows(u);
                                }}
                                className="w-full p-1 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                              />
                            ) : (
                              row.dateRec
                            )}
                          </td>

                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {row.isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const u = [...transferRows];
                                    u[idx].isEditing = false;
                                    setTransferRows(u);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs"
                                  title="Save row"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const u = [...transferRows];
                                    u[idx].isEditing = true;
                                    setTransferRows(u);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md"
                                  title="Edit row"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setTransferRows(transferRows.filter(r => r.id !== row.id))}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 dark:border-slate-700">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PREPARED BY:</span>
                  <input
                    type="text"
                    value={transferHeader.preparedBy}
                    onChange={(e) => setTransferHeader({ ...transferHeader, preparedBy: e.target.value })}
                    className="w-full border-b-2 border-slate-800 dark:border-slate-200 font-bold text-xs pb-1 outline-none bg-transparent"
                  />
                  <p className="text-[9px] text-slate-400 italic">Name, Stamp, Signature and Date</p>
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">APPROVED BY:</span>
                  <input
                    type="text"
                    value={transferHeader.approvedBy}
                    onChange={(e) => setTransferHeader({ ...transferHeader, approvedBy: e.target.value })}
                    className="w-full border-b-2 border-slate-800 dark:border-slate-200 font-bold text-xs pb-1 outline-none bg-transparent"
                  />
                  <p className="text-[9px] text-slate-400 italic">Name, Stamp, Signature and Date</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= FORM 4: VEHICLE REPAIR ASSESSMENT FORM (Image 5) ================= */}
          {activeFormType === 'vehicle' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
              <div className="bg-indigo-50/80 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
                <Truck className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Vehicle Repair Assessment & Acceptance Form (Pre-Repair)</h3>
                  <p className="text-xs text-slate-500">Log vehicle repair inspections, damages, pre-repair inventory, and post-repair handovers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Form No.</label>
                  <input type="text" value={vehicleForm.formNo} onChange={(e) => setVehicleForm({ ...vehicleForm, formNo: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono font-bold" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Date</label>
                  <input type="date" value={vehicleForm.date} onChange={(e) => setVehicleForm({ ...vehicleForm, date: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                </div>
              </div>

              {/* SECTION I: VEHICLE INFORMATION */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="font-extrabold text-xs text-indigo-600 uppercase">I. VEHICLE INFORMATION</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Type</label>
                    <input type="text" value={vehicleForm.vehicleType} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })} className="w-full mt-1 p-2 border rounded font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Plate Number / CS No.</label>
                    <input type="text" value={vehicleForm.plateNo} onChange={(e) => setVehicleForm({ ...vehicleForm, plateNo: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Odometer Reading (KM)</label>
                    <input type="text" value={vehicleForm.odometer} onChange={(e) => setVehicleForm({ ...vehicleForm, odometer: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Chassis No.</label>
                    <input type="text" value={vehicleForm.chassisNo} onChange={(e) => setVehicleForm({ ...vehicleForm, chassisNo: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Engine No.</label>
                    <input type="text" value={vehicleForm.engineNo} onChange={(e) => setVehicleForm({ ...vehicleForm, engineNo: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Year Model</label>
                    <input type="text" value={vehicleForm.yearModel} onChange={(e) => setVehicleForm({ ...vehicleForm, yearModel: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                  </div>
                </div>
              </div>

              {/* SECTION II: DAMAGE ASSESSMENT */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
                <h4 className="font-extrabold text-xs text-indigo-600 uppercase">II. DAMAGE ASSESSMENT (TO BE FILLED BY ASSESSOR / REQUESTOR)</h4>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nature of Repair:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-2 text-xs">
                    {[
                      { key: 'routinePMS', label: 'Routine PMS' },
                      { key: 'mechanical', label: 'Mechanical Repair' },
                      { key: 'electrical', label: 'Electrical' },
                      { key: 'bodyRepair', label: 'Body Repair' },
                      { key: 'paintJob', label: 'Paint Job' },
                      { key: 'others', label: 'Others' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800">
                        <input
                          type="checkbox"
                          checked={(vehicleForm.natureOfRepair as any)[item.key]}
                          onChange={(e) => setVehicleForm({
                            ...vehicleForm,
                            natureOfRepair: { ...vehicleForm.natureOfRepair, [item.key]: e.target.checked }
                          })}
                          className="rounded text-indigo-600"
                        />
                        <span className="font-medium text-[11px]">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Description of Issues (Itemized):</label>
                    <button onClick={() => setVehicleIssues([...vehicleIssues, { id: Date.now(), text: '', isEditing: true }])} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Issue Row
                    </button>
                  </div>
                  {vehicleIssues.map((issue, idx) => (
                    <div key={issue.id} className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-400">{idx + 1}.</span>
                      <input
                        type="text"
                        value={issue.text}
                        onChange={(e) => { const u = [...vehicleIssues]; u[idx].text = e.target.value; setVehicleIssues(u); }}
                        className="flex-1 p-2 border rounded text-xs font-medium"
                      />
                      <button onClick={() => setVehicleIssues(vehicleIssues.filter(i => i.id !== issue.id))} className="text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated Cost of Repair (₱)</label>
                    <input type="text" value={vehicleForm.estimatedCost} onChange={(e) => setVehicleForm({ ...vehicleForm, estimatedCost: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Target Date of Completion</label>
                    <input type="date" value={vehicleForm.targetDate} onChange={(e) => setVehicleForm({ ...vehicleForm, targetDate: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                  </div>
                </div>
              </div>

              {/* SECTION III: PRE-REPAIR CHECKLIST */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="font-extrabold text-xs text-indigo-600 uppercase">III. PRE-REPAIR CHECKLIST (INVENTORY)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { key: 'spareTire', label: 'Spare Tire' },
                    { key: 'jackTools', label: 'Jack & Tools' },
                    { key: 'stereo', label: 'Stereo / Head Unit' },
                    { key: 'dashcam', label: 'Dashcam' },
                    { key: 'matting', label: 'Matting' },
                    { key: 'emergencyLight', label: 'Emergency Light' },
                    { key: 'manualBook', label: 'Manual Book' },
                    { key: 'registration', label: 'Registration' },
                  ].map(chk => (
                    <label key={chk.key} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={(vehicleForm.checklist as any)[chk.key]}
                        onChange={(e) => setVehicleForm({
                          ...vehicleForm,
                          checklist: { ...vehicleForm.checklist, [chk.key]: e.target.checked }
                        })}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-[11px]">{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION IV: REPAIR APPROVAL MANAGEMENT */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
                <h4 className="font-extrabold text-xs text-indigo-600 uppercase">IV. REPAIR APPROVAL (MANAGEMENT)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Requested by (Operations Team)</label>
                    <input type="text" value={vehicleForm.signatures.requestedBy} onChange={(e) => setVehicleForm({ ...vehicleForm, signatures: { ...vehicleForm.signatures, requestedBy: e.target.value } })} className="w-full mt-1 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Assessed and Verified by (Operations Head)</label>
                    <input type="text" value={vehicleForm.signatures.assessedBy} onChange={(e) => setVehicleForm({ ...vehicleForm, signatures: { ...vehicleForm.signatures, assessedBy: e.target.value } })} className="w-full mt-1 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Received by (Asset Management)</label>
                    <input type="text" value={vehicleForm.signatures.receivedAsset} onChange={(e) => setVehicleForm({ ...vehicleForm, signatures: { ...vehicleForm.signatures, receivedAsset: e.target.value } })} className="w-full mt-1 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Approved by (Top Management)</label>
                    <input type="text" value={vehicleForm.signatures.approvedMgmt} onChange={(e) => setVehicleForm({ ...vehicleForm, signatures: { ...vehicleForm.signatures, approvedMgmt: e.target.value } })} className="w-full mt-1 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Received by (Purchasing Head)</label>
                    <input type="text" value={vehicleForm.signatures.receivedPurchasing} onChange={(e) => setVehicleForm({ ...vehicleForm, signatures: { ...vehicleForm.signatures, receivedPurchasing: e.target.value } })} className="w-full mt-1 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Forwarded to (Asset Management)</label>
                    <input type="text" value={vehicleForm.signatures.forwardedAsset} onChange={(e) => setVehicleForm({ ...vehicleForm, signatures: { ...vehicleForm.signatures, forwardedAsset: e.target.value } })} className="w-full mt-1 p-2 border rounded" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= FORM 5: PURCHASE RECEIPT FORM (Image 6) ================= */}
          {activeFormType === 'receipt' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">New Purchase Receipt</h3>
                  <p className="text-xs text-slate-500">Record incoming inventory, goods, or items received from suppliers.</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full">Not Saved</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Receipt No. (PR No.) *</label>
                  <input type="text" value={receiptHeader.receiptNo} onChange={(e) => setReceiptHeader({ ...receiptHeader, receiptNo: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono font-bold text-rose-600" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Supplier *</label>
                  <input type="text" value={receiptHeader.supplier} onChange={(e) => setReceiptHeader({ ...receiptHeader, supplier: e.target.value })} className="w-full mt-1 p-2 border rounded font-bold" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Supplier Delivery Note</label>
                  <input type="text" value={receiptHeader.deliveryNote} onChange={(e) => setReceiptHeader({ ...receiptHeader, deliveryNote: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Date Received *</label>
                  <input type="date" value={receiptHeader.dateReceived} onChange={(e) => setReceiptHeader({ ...receiptHeader, dateReceived: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Posting Time *</label>
                  <input type="text" value={receiptHeader.postingTime} onChange={(e) => setReceiptHeader({ ...receiptHeader, postingTime: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Remarks</label>
                  <input type="text" value={receiptHeader.remarks} onChange={(e) => setReceiptHeader({ ...receiptHeader, remarks: e.target.value })} className="w-full mt-1 p-2 border rounded" />
                </div>
              </div>

              {/* ITEMS RECEIVED TABLE WITH ADD/EDIT/DELETE & QR CODE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase">ITEMS RECEIVED</h4>
                  <button
                    onClick={() => setReceiptRows([...receiptRows, { id: Date.now(), freeItem: false, itemCode: 'ITEM-NEW', itemName: '', acceptedQty: 1, uom: 'PCS', remarks: 'Passed QC', isEditing: true }])}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-[10px] text-slate-500">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">ITEM CODE</th>
                        <th className="p-3">ITEM NAME / DESCRIPTION</th>
                        <th className="p-3 text-center">ACCEPTED QTY</th>
                        <th className="p-3">UOM</th>
                        <th className="p-3 text-center">QR CODE</th>
                        <th className="p-3">REMARKS</th>
                        <th className="p-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {receiptRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.itemCode}
                                onChange={(e) => {
                                  const u = [...receiptRows];
                                  u[idx].itemCode = e.target.value;
                                  setReceiptRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs font-mono font-bold"
                              />
                            ) : (
                              row.itemCode
                            )}
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.itemName}
                                onChange={(e) => {
                                  const u = [...receiptRows];
                                  u[idx].itemName = e.target.value;
                                  setReceiptRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs font-bold"
                              />
                            ) : (
                              row.itemName
                            )}
                          </td>
                          <td className="p-3 text-center font-bold font-mono text-emerald-600">
                            {row.isEditing ? (
                              <input
                                type="number"
                                value={row.acceptedQty}
                                onChange={(e) => {
                                  const u = [...receiptRows];
                                  u[idx].acceptedQty = parseInt(e.target.value) || 1;
                                  setReceiptRows(u);
                                }}
                                className="w-16 p-1 border rounded text-xs font-bold text-center mx-auto block"
                              />
                            ) : (
                              row.acceptedQty
                            )}
                          </td>
                          <td className="p-3 font-bold">
                            {row.isEditing ? (
                              <select
                                value={row.uom}
                                onChange={(e) => {
                                  const u = [...receiptRows];
                                  u[idx].uom = e.target.value;
                                  setReceiptRows(u);
                                }}
                                className="w-20 p-1 border rounded text-xs font-bold uppercase bg-white dark:bg-slate-800"
                              >
                                {STANDARD_UOMS.map((uom) => (
                                  <option key={uom} value={uom}>{uom}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold text-xs">
                                {row.uom}
                              </span>
                            )}
                          </td>

                          {/* PRECISE QR CODE & COMPRESSED PHOTO CELL */}
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              {row.photo ? (
                                <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                                  <div className="shrink-0 cursor-pointer" onClick={() => setPreviewModalImage(row.photo || null)}>
                                    <PreciseQRCode value={`${row.itemCode}|${row.itemName}`} size={36} showLabel={false} />
                                  </div>
                                  <div className="relative group shrink-0">
                                    <img
                                      src={row.photo}
                                      alt="Item attachment"
                                      className="w-9 h-9 object-cover rounded border border-slate-300 dark:border-slate-600 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => setPreviewModalImage(row.photo || null)}
                                    />
                                    {row.isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const u = [...receiptRows];
                                          u[idx].photo = '';
                                          setReceiptRows(u);
                                        }}
                                        title="Remove photo"
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <PreciseQRCode value={`${row.itemCode}|${row.itemName}`} size={38} showLabel={false} />
                              )}

                              <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800 transition-colors">
                                <Camera className="w-3 h-3" />
                                <span>{row.photo ? 'Change' : 'Add Image'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      compressImage(file, (dataUrl) => {
                                        const u = [...receiptRows];
                                        u[idx].photo = dataUrl;
                                        setReceiptRows(u);
                                      });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </td>

                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.remarks}
                                onChange={(e) => {
                                  const u = [...receiptRows];
                                  u[idx].remarks = e.target.value;
                                  setReceiptRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs"
                              />
                            ) : (
                              row.remarks
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {row.isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const u = [...receiptRows];
                                    u[idx].isEditing = false;
                                    setReceiptRows(u);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs"
                                  title="Save row"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const u = [...receiptRows];
                                    u[idx].isEditing = true;
                                    setReceiptRows(u);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md"
                                  title="Edit row"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setReceiptRows(receiptRows.filter(r => r.id !== row.id))}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= FORM 6: MATERIAL REQUEST FORM (Image 7) ================= */}
          {activeFormType === 'material_req' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">New Material Request</h3>
                  <p className="text-xs text-slate-500">Submit requisition for purchase or departmental transfer of supplies.</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full">Draft</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Series *</label>
                  <input type="text" value={materialHeader.series} onChange={(e) => setMaterialHeader({ ...materialHeader, series: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono font-bold" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Transaction Date *</label>
                  <input type="date" value={materialHeader.transactionDate} onChange={(e) => setMaterialHeader({ ...materialHeader, transactionDate: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Required By *</label>
                  <input type="date" value={materialHeader.requiredBy} onChange={(e) => setMaterialHeader({ ...materialHeader, requiredBy: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Type *</label>
                  <select value={materialHeader.type} onChange={(e) => setMaterialHeader({ ...materialHeader, type: e.target.value })} className="w-full mt-1 p-2 border rounded font-bold">
                    <option>Purchase</option>
                    <option>Material Transfer</option>
                    <option>Material Issue</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Requestor *</label>
                  <input type="text" value={materialHeader.requestor} onChange={(e) => setMaterialHeader({ ...materialHeader, requestor: e.target.value })} className="w-full mt-1 p-2 border rounded font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Transfer To *</label>
                  <input type="text" value={materialHeader.transferToDept} onChange={(e) => setMaterialHeader({ ...materialHeader, transferToDept: e.target.value })} className="w-full mt-1 p-2 border rounded font-bold" />
                </div>
              </div>

              {/* BARCODE SCANNER BANNER */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <Scan className="w-5 h-5 text-indigo-600" />
                <input type="text" placeholder="Scan or type item barcode to auto-insert..." className="w-full bg-transparent text-xs font-mono outline-none" />
              </div>

              {/* ITEMS LIST TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase">ITEMS LIST ({materialRows.length})</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMaterialRows([...materialRows, { id: Date.now(), itemCode: 'ITEM-MR', itemName: '', requiredBy: materialHeader.requiredBy, description: '', qty: 1, stockUom: 'PCS', isEditing: true }])}
                      className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-emerald-600 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#047857] text-white uppercase font-black text-[10px]">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">ITEM CODE</th>
                        <th className="p-3">ITEM NAME *</th>
                        <th className="p-3">REQUIRED BY</th>
                        <th className="p-3 text-center">QUANTITY</th>
                        <th className="p-3">STOCK UOM</th>
                        <th className="p-3 text-center">QR CODE</th>
                        <th className="p-3 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {materialRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.itemCode}
                                onChange={(e) => {
                                  const u = [...materialRows];
                                  u[idx].itemCode = e.target.value;
                                  setMaterialRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs font-mono font-bold"
                              />
                            ) : (
                              row.itemCode
                            )}
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.itemName}
                                onChange={(e) => {
                                  const u = [...materialRows];
                                  u[idx].itemName = e.target.value;
                                  setMaterialRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs font-bold"
                              />
                            ) : (
                              row.itemName
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-500">
                            {row.isEditing ? (
                              <input
                                type="date"
                                value={row.requiredBy}
                                onChange={(e) => {
                                  const u = [...materialRows];
                                  u[idx].requiredBy = e.target.value;
                                  setMaterialRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs font-mono"
                              />
                            ) : (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {row.requiredBy}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold font-mono text-blue-600">
                            {row.isEditing ? (
                              <input
                                type="number"
                                value={row.qty}
                                onChange={(e) => {
                                  const u = [...materialRows];
                                  u[idx].qty = parseInt(e.target.value) || 1;
                                  setMaterialRows(u);
                                }}
                                className="w-16 p-1 border rounded text-xs font-bold text-center mx-auto block"
                              />
                            ) : (
                              row.qty
                            )}
                          </td>
                          <td className="p-3 font-bold">
                            {row.isEditing ? (
                              <select
                                value={row.stockUom}
                                onChange={(e) => {
                                  const u = [...materialRows];
                                  u[idx].stockUom = e.target.value;
                                  setMaterialRows(u);
                                }}
                                className="w-20 p-1 border rounded text-xs font-bold uppercase bg-white dark:bg-slate-800"
                              >
                                {STANDARD_UOMS.map((uom) => (
                                  <option key={uom} value={uom}>{uom}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold text-xs">
                                {row.stockUom}
                              </span>
                            )}
                          </td>

                          {/* PRECISE QR CODE & COMPRESSED PHOTO CELL */}
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              {row.photo ? (
                                <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                                  <div className="shrink-0 cursor-pointer" onClick={() => setPreviewModalImage(row.photo || null)}>
                                    <PreciseQRCode value={`${row.itemCode}|${row.itemName}`} size={36} showLabel={false} />
                                  </div>
                                  <div className="relative group shrink-0">
                                    <img
                                      src={row.photo}
                                      alt="Item attachment"
                                      className="w-9 h-9 object-cover rounded border border-slate-300 dark:border-slate-600 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => setPreviewModalImage(row.photo || null)}
                                    />
                                    {row.isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const u = [...materialRows];
                                          u[idx].photo = '';
                                          setMaterialRows(u);
                                        }}
                                        title="Remove photo"
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <PreciseQRCode value={`${row.itemCode}|${row.itemName}`} size={38} showLabel={false} />
                              )}

                              <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800 transition-colors">
                                <Camera className="w-3 h-3" />
                                <span>{row.photo ? 'Change' : 'Add Image'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      compressImage(file, (dataUrl) => {
                                        const u = [...materialRows];
                                        u[idx].photo = dataUrl;
                                        setMaterialRows(u);
                                      });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {row.isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const u = [...materialRows];
                                    u[idx].isEditing = false;
                                    setMaterialRows(u);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs"
                                  title="Save row"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const u = [...materialRows];
                                    u[idx].isEditing = true;
                                    setMaterialRows(u);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md"
                                  title="Edit row"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setMaterialRows(materialRows.filter(r => r.id !== row.id))}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= FORM 7: ASSET SURRENDER FORM (Image 8) ================= */}
          {activeFormType === 'surrender' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-300 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-700 shadow-md">
                    <CentaurLogo size={48} />
                  </div>
                  <div>
                    <h2 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wide">CENTAUR CHEM ENTERPRISE</h2>
                    <p className="text-[10px] text-slate-500 font-medium">156 Capistrano St. Bgy. Hagonoy, Taguig City 1630 | Tel & Phone No.: 02 8230 4514 | +639 264 950 334</p>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase">ASSET SURRENDER</h3>
                  <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">Document ID: {surrenderHeader.documentId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">DATE</label>
                  <input type="date" value={surrenderHeader.date} onChange={(e) => setSurrenderHeader({ ...surrenderHeader, date: e.target.value })} className="w-full mt-1 p-1.5 border rounded font-mono text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">FROM DEPARTMENT</label>
                  <input type="text" value={surrenderHeader.fromDept} onChange={(e) => setSurrenderHeader({ ...surrenderHeader, fromDept: e.target.value })} className="w-full mt-1 p-1.5 border rounded font-bold text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">TO DEPARTMENT</label>
                  <input type="text" value={surrenderHeader.toDept} onChange={(e) => setSurrenderHeader({ ...surrenderHeader, toDept: e.target.value })} className="w-full mt-1 p-1.5 border rounded font-bold text-slate-900 dark:text-white" />
                </div>
              </div>

              {/* Yellow Reminder Banner */}
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl p-3 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center">
                REMINDER! Please check if all items are complete before attaching your signature in the return form
              </div>

              {/* ASSET DETAILS TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-emerald-600 uppercase">ASSET DETAILS</h4>
                  <button onClick={() => setSurrenderRows([...surrenderRows, { id: Date.now(), itemDesc: '', serialNo: '', qty: 1, condition: 'Good', receivedBy: 'Ronalyn Custodio', dateRec: '09/02/2026', isEditing: true }])} className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="overflow-x-auto border border-emerald-600 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#047857] text-white uppercase font-black text-[10px]">
                      <tr>
                        <th className="p-3 border-r border-emerald-600">ITEM DESCRIPTION</th>
                        <th className="p-3 border-r border-emerald-600">SERIAL / ASSET ID</th>
                        <th className="p-3 border-r border-emerald-600 w-16 text-center">QTY</th>
                        <th className="p-3 border-r border-emerald-600">CONDITION</th>
                        <th className="p-3 border-r border-emerald-600 text-center">ITEM PHOTO / QR CODE</th>
                        <th className="p-3 border-r border-emerald-600">RECEIVED BY</th>
                        <th className="p-3 border-r border-emerald-600">DATE REC.</th>
                        <th className="p-3 text-center w-20">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {surrenderRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2 border-r font-bold text-slate-900 dark:text-white">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.itemDesc}
                                onChange={(e) => {
                                  const u = [...surrenderRows];
                                  u[idx].itemDesc = e.target.value;
                                  setSurrenderRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs font-bold"
                              />
                            ) : (
                              row.itemDesc
                            )}
                          </td>
                          <td className="p-2 border-r font-mono text-slate-700 dark:text-slate-300 font-bold">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.serialNo}
                                onChange={(e) => {
                                  const u = [...surrenderRows];
                                  u[idx].serialNo = e.target.value;
                                  setSurrenderRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs font-mono"
                              />
                            ) : (
                              row.serialNo
                            )}
                          </td>
                          <td className="p-2 border-r text-center font-bold">
                            {row.isEditing ? (
                              <input
                                type="number"
                                value={row.qty}
                                onChange={(e) => {
                                  const u = [...surrenderRows];
                                  u[idx].qty = parseInt(e.target.value) || 1;
                                  setSurrenderRows(u);
                                }}
                                className="w-14 p-1 border rounded text-xs font-bold text-center mx-auto block"
                              />
                            ) : (
                              row.qty
                            )}
                          </td>
                          <td className="p-2 border-r text-slate-600">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.condition}
                                onChange={(e) => {
                                  const u = [...surrenderRows];
                                  u[idx].condition = e.target.value;
                                  setSurrenderRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs"
                              />
                            ) : (
                              row.condition
                            )}
                          </td>

                          {/* PRECISE QR CODE & COMPRESSED PHOTO CELL */}
                          <td className="p-2 border-r text-center">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              {row.photo ? (
                                <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                                  <div className="shrink-0 cursor-pointer" onClick={() => setPreviewModalImage(row.photo || null)}>
                                    <PreciseQRCode value={row.serialNo || row.itemDesc} size={36} showLabel={false} />
                                  </div>
                                  <div className="relative group shrink-0">
                                    <img
                                      src={row.photo}
                                      alt="Item attachment"
                                      className="w-9 h-9 object-cover rounded border border-slate-300 dark:border-slate-600 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => setPreviewModalImage(row.photo || null)}
                                    />
                                    {row.isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const u = [...surrenderRows];
                                          u[idx].photo = '';
                                          setSurrenderRows(u);
                                        }}
                                        title="Remove photo"
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <PreciseQRCode value={row.serialNo || row.itemDesc} size={38} showLabel={false} />
                              )}

                              <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800 transition-colors">
                                <Camera className="w-3 h-3" />
                                <span>{row.photo ? 'Change' : 'Add Image'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      compressImage(file, (dataUrl) => {
                                        const u = [...surrenderRows];
                                        u[idx].photo = dataUrl;
                                        setSurrenderRows(u);
                                      });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </td>

                          <td className="p-2 border-r">
                            {row.isEditing ? (
                              <input
                                type="text"
                                value={row.receivedBy}
                                onChange={(e) => {
                                  const u = [...surrenderRows];
                                  u[idx].receivedBy = e.target.value;
                                  setSurrenderRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs"
                              />
                            ) : (
                              row.receivedBy
                            )}
                          </td>
                          <td className="p-2 border-r font-mono text-slate-500">
                            {row.isEditing ? (
                              <input
                                type="date"
                                value={row.dateRec}
                                onChange={(e) => {
                                  const u = [...surrenderRows];
                                  u[idx].dateRec = e.target.value;
                                  setSurrenderRows(u);
                                }}
                                className="w-full p-1 border rounded text-xs font-mono"
                              />
                            ) : (
                              row.dateRec
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {row.isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const u = [...surrenderRows];
                                    u[idx].isEditing = false;
                                    setSurrenderRows(u);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs"
                                  title="Save row"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const u = [...surrenderRows];
                                    u[idx].isEditing = true;
                                    setSurrenderRows(u);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md"
                                  title="Edit row"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSurrenderRows(surrenderRows.filter(r => r.id !== row.id))}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= FORM 8: RADIO PHONE CHECKLIST & HANDOVER FORM (Image 9) ================= */}
          {activeFormType === 'radio' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">Radio Phone Checklist & Handover</h3>
                    <p className="text-xs text-slate-500">Official physical condition, transmission quality & equipment handover verification.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-full">
                  Live Series: {radioHeader.controlNo}
                </span>
              </div>

              {/* TOP METADATA GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CONTROL NO / SERIES (AUTO)</label>
                  <p className="font-mono font-bold text-indigo-600 text-xs mt-1">{radioHeader.controlNo}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">INSPECTION DATE</label>
                  <input type="date" value={radioHeader.inspectionDate} onChange={(e) => setRadioHeader({ ...radioHeader, inspectionDate: e.target.value })} className="w-full mt-1 p-1 border rounded font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">INSPECTION TIME</label>
                  <input type="text" value={radioHeader.inspectionTime} onChange={(e) => setRadioHeader({ ...radioHeader, inspectionTime: e.target.value })} className="w-full mt-1 p-1 border rounded font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SHIFT SCHEDULE</label>
                  <input type="text" value={radioHeader.shiftSchedule} onChange={(e) => setRadioHeader({ ...radioHeader, shiftSchedule: e.target.value })} className="w-full mt-1 p-1 border rounded" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">FACILITY / LOCATION</label>
                  <input type="text" value={radioHeader.facilityLocation} onChange={(e) => setRadioHeader({ ...radioHeader, facilityLocation: e.target.value })} className="w-full mt-1 p-1 border rounded font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">DEPARTMENT</label>
                  <input type="text" value={radioHeader.department} onChange={(e) => setRadioHeader({ ...radioHeader, department: e.target.value })} className="w-full mt-1 p-1 border rounded font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CUSTODIAN NAME & ID</label>
                  <input type="text" value={radioHeader.custodian} onChange={(e) => setRadioHeader({ ...radioHeader, custodian: e.target.value })} className="w-full mt-1 p-1 border rounded font-bold" />
                </div>
              </div>

              {/* TECHNICAL SPECIFICATIONS CARD */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                <h4 className="font-extrabold text-xs text-indigo-600 uppercase flex items-center gap-1.5">
                  <Radio className="w-4 h-4" /> RADIO UNIT TECHNICAL SPECIFICATIONS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">RADIO ID / TAG</label>
                    <input type="text" value={radioHeader.radioId} onChange={(e) => setRadioHeader({ ...radioHeader, radioId: e.target.value })} className="w-full mt-1 p-1.5 border rounded font-mono font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">BRAND & MODEL</label>
                    <input type="text" value={radioHeader.brandModel} onChange={(e) => setRadioHeader({ ...radioHeader, brandModel: e.target.value })} className="w-full mt-1 p-1.5 border rounded font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">SERIAL NUMBER / ASSET TAG</label>
                    <input type="text" value={radioHeader.serialNo} onChange={(e) => setRadioHeader({ ...radioHeader, serialNo: e.target.value })} className="w-full mt-1 p-1.5 border rounded font-mono font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">ASSIGNED FREQUENCY / CHANNEL</label>
                    <input type="text" value={radioHeader.channel} onChange={(e) => setRadioHeader({ ...radioHeader, channel: e.target.value })} className="w-full mt-1 p-1.5 border rounded font-medium" />
                  </div>
                </div>
              </div>

              {/* 12 INSPECTION CHECKLIST ITEMS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase">
                    INSPECTION & OPERATIONAL QUALITY CHECKLIST (12 ITEMS)
                  </h4>
                  <button
                    onClick={() => setRadioChecklist(radioChecklist.map(c => ({ ...c, status: 'Good' })))}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset to All Good
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-[10px] text-slate-500">
                      <tr>
                        <th className="p-3 w-10">#</th>
                        <th className="p-3 w-36">CATEGORY</th>
                        <th className="p-3">CHECKLIST ITEM / CRITERIA</th>
                        <th className="p-3 w-48 text-center">CONDITION STATUS</th>
                        <th className="p-3">OBSERVATIONS / NOTES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {radioChecklist.map((chk, idx) => (
                        <tr key={chk.id}>
                          <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-600 dark:text-slate-400 text-[11px]">{chk.category}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{chk.item}</td>
                          <td className="p-3 text-center">
                            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                              {['Good', 'Defect', 'N/A'].map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => {
                                    const u = [...radioChecklist];
                                    u[idx].status = st as any;
                                    setRadioChecklist(u);
                                  }}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                                    chk.status === st
                                      ? st === 'Good'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : st === 'Defect'
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : 'bg-slate-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={chk.notes}
                              placeholder="Optional notes..."
                              onChange={(e) => {
                                const u = [...radioChecklist];
                                u[idx].notes = e.target.value;
                                setRadioChecklist(u);
                              }}
                              className="w-full p-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= SUBMITTED FORM DOCUMENT HISTORY VIEW ================= */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                <span>SUBMITTED FORM DOCUMENT HISTORY</span>
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded text-xs font-mono font-bold">
                  {formHistory.length} records
                </span>
              </h3>
              <p className="text-xs text-slate-500">Audit trail of all submitted forms with QR verification and permanent removal controls.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedHistoryIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalAction('selected');
                    setShowDeleteConfirmModal(true);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedHistoryIds.length})</span>
                </button>
              )}

              {formHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalAction('all');
                    setShowDeleteConfirmModal(true);
                  }}
                  className="px-3 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All</span>
                </button>
              )}

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Document ID, Employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/80 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredHistory.length > 0 && selectedHistoryIds.length === filteredHistory.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHistoryIds(filteredHistory.map(h => h.id));
                        } else {
                          setSelectedHistoryIds([]);
                        }
                      }}
                      className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      title="Select / Deselect all"
                    />
                  </th>
                  <th className="p-3.5">Document Details</th>
                  <th className="p-3.5">Employee / Holder</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Form Type</th>
                  <th className="p-3.5 text-center">QR Code</th>
                  <th className="p-3.5">Date Submitted</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      <p className="font-bold text-xs">No submitted form records found</p>
                      <p className="text-[11px] text-slate-500">Submitted forms from any interactive tab will be archived here.</p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => {
                    const isSelected = selectedHistoryIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-purple-50/60 dark:bg-purple-950/30'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedHistoryIds([...selectedHistoryIds, item.id]);
                              } else {
                                setSelectedHistoryIds(selectedHistoryIds.filter(id => id !== item.id));
                              }
                            }}
                            className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5">
                          <p className="font-mono font-bold text-purple-600 dark:text-purple-400">{item.id}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{item.uid}</span>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">{item.holder}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{item.email}</span>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{item.dept}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-extrabold text-[10px] rounded">
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <PreciseQRCode value={`${item.id}|${item.holder}`} size={36} showLabel={false} />
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 text-[10px]">{item.date}</td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                              title="Print document"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteModalAction(item.id);
                                setShowDeleteConfirmModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL FOR PERMANENT DELETION */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {deleteModalAction === 'all'
                    ? 'Confirm Delete All Records'
                    : deleteModalAction === 'selected'
                    ? `Delete ${selectedHistoryIds.length} Selected Record(s)`
                    : 'Confirm Permanent Deletion'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {deleteModalAction === 'all'
                    ? `Are you sure you want to permanently delete all ${formHistory.length} submitted form records from the database? This action is irreversible.`
                    : deleteModalAction === 'selected'
                    ? `Are you sure you want to permanently delete ${selectedHistoryIds.length} selected record(s) from the database? This action cannot be undone.`
                    : `Are you sure you want to delete form document "${deleteModalAction}" permanently from the database?`}
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 text-[11px] text-red-800 dark:text-red-300 font-mono flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Database write will remove the selected history log(s).</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePermanentDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Permanent Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
