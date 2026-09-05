import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X, 
  FileSpreadsheet, 
  Layers, 
  Building2, 
  User, 
  Edit, 
  Trash2, 
  PieChart as PieChartIcon, 
  BarChart3, 
  ShieldAlert,
  ArrowRight,
  Check,
  QrCode,
  FileDown,
  FileUp,
  Printer,
  Box
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { PreciseQRCode } from './PreciseQRCode';
import { useAssetData, FleetAsset, OfficeSupply } from '../../context/AssetContext';
import { AssetDetailModal } from './AssetDetailModal';
import { BatchQRPrintModal, BatchPrintQRItem } from './BatchQRPrintModal';
import { INITIAL_IT_USERS } from '../../data/itStaffUsersData';

const STANDARD_UOMS = ['UNIT', 'PCS', 'SET', 'BOX', 'PACK', 'ROLL', 'KG', 'LITERS', 'METER', 'PAIR', 'DRUM', 'BOTTLE', 'CAN', 'VIAL', 'BUNDLE', 'REAM', 'LOT', 'BAG', 'TUBE', 'PAIL'];

const ASSET_CATEGORIES = [
  'IT ASSET',
  'HARDWARE',
  'NETWORK',
  'COMMUNICATIONS',
  'FLEET VEHICLE',
  'OFFICE EQUIPMENT',
  'LAB EQUIPMENT',
  'BIOMETRICS & SECURITY',
  'TOOLS & APPARATUS',
  'ASSET - TRANSPORT EQUIPMENT'
];

const ASSET_LOCATIONS = [
  'BGC Taguig Lab',
  'Capistrano Main HQ (Taguig)',
  'C6 Operations Office & Warehouse',
  'Finance Dept Office',
  'HR & Executive Office',
  'Laguna Plant',
  'Cebu Warehouse',
  'Remote / Field Assignment'
];

const ASSET_DEPARTMENTS = [
  'IT Department',
  'Operations',
  'Human Resources',
  'Finance',
  'Purchasing & Logistics',
  'Asset and Data',
  'Sales',
  'Management Office',
  'R&D'
];

const SUPPLY_GROUPS = [
  'SUPPLIES-OFFICE',
  'SUPPLIES-MRO',
  'SUPPLIES-LAB',
  'SUPPLIES-CLEANING',
  'SUPPLIES-PACKAGING',
  'SUPPLIES-SAFETY'
];

const SUPPLY_WAREHOUSES = [
  'TAGUIG OFFICE - FINANCE INVENTORY & FIXED ASSET',
  'LAGUNA PLANT - RAW MATERIALS DEPOT',
  'CEBU WAREHOUSE - LOGISTICS',
  'BGC RESEARCH DEPOT - CHEMICAL STORE'
];

interface AssetRegistryListProps {
  initialCategory?: string | null;
  onClearFilter?: () => void;
}

export function AssetRegistryList({ initialCategory, onClearFilter }: AssetRegistryListProps) {
  const { 
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
    exportSelectedTabToCSV
  } = useAssetData();

  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'supplies' | 'health' | 'audit'>('fleet');
  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(initialCategory || null);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Checkbox row selection state
  const [selectedFleetIds, setSelectedFleetIds] = useState<Set<string>>(new Set());
  const [selectedSupplySkus, setSelectedSupplySkus] = useState<Set<string>>(new Set());
  const [selectedAuditIds, setSelectedAuditIds] = useState<Set<string>>(new Set());

  // Batch QR Print Preview Modal State
  const [batchPrintItems, setBatchPrintItems] = useState<BatchPrintQRItem[] | null>(null);
  const [batchPrintTitle, setBatchPrintTitle] = useState<string>('');

  // Add Item Modals State (clean, without sample item suggestions)
  const [showAddFleetModal, setShowAddFleetModal] = useState(false);
  const [showAddSupplyModal, setShowAddSupplyModal] = useState(false);

  // New fleet form inputs
  const [newFleetSerial, setNewFleetSerial] = useState('');
  const [newFleetName, setNewFleetName] = useState('');
  const [newFleetCategory, setNewFleetCategory] = useState(ASSET_CATEGORIES[0]);
  const [newFleetLocation, setNewFleetLocation] = useState(ASSET_LOCATIONS[0]);
  const [newFleetCustodian, setNewFleetCustodian] = useState(INITIAL_IT_USERS[0]?.displayName || 'Unassigned');
  const [newFleetDepartment, setNewFleetDepartment] = useState(ASSET_DEPARTMENTS[0]);
  const [newFleetStatus, setNewFleetStatus] = useState<'IN STOCK' | 'IN USE' | 'ISSUED' | 'RETIRED'>('IN STOCK');
  const [newFleetQty, setNewFleetQty] = useState(1);
  const [newFleetValue, setNewFleetValue] = useState(0);

  // New supply form inputs
  const [newSupplySku, setNewSupplySku] = useState('');
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyGroup, setNewSupplyGroup] = useState(SUPPLY_GROUPS[0]);
  const [newSupplyWarehouse, setNewSupplyWarehouse] = useState(SUPPLY_WAREHOUSES[0]);
  const [newSupplyUom, setNewSupplyUom] = useState(STANDARD_UOMS[0]);
  const [newSupplyQty, setNewSupplyQty] = useState(0);
  const [newSupplyValue, setNewSupplyValue] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategoryFilter(initialCategory);
      const matchesSupply = officeSupplies.some(s => s.group.toLowerCase().includes(initialCategory.toLowerCase()) || s.name.toLowerCase().includes(initialCategory.toLowerCase()));
      if (matchesSupply) {
        setActiveSubTab('supplies');
      } else {
        setActiveSubTab('fleet');
      }
    }
  }, [initialCategory, officeSupplies]);

  // Selection handlers for Fleet
  const toggleSelectFleet = (id: string) => {
    setSelectedFleetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFleet = () => {
    if (selectedFleetIds.size === filteredFleet.length && filteredFleet.length > 0) {
      setSelectedFleetIds(new Set());
    } else {
      setSelectedFleetIds(new Set(filteredFleet.map(f => f.id)));
    }
  };

  const handleBulkDeleteFleet = () => {
    if (selectedFleetIds.size === 0) return;
    const count = selectedFleetIds.size;
    bulkDeleteFleetAssets(Array.from(selectedFleetIds));
    setSelectedFleetIds(new Set());
    setImportNotification(`Successfully deleted ${count} asset item(s) in bulk and recorded to Audit Trail.`);
    setTimeout(() => setImportNotification(null), 5000);
  };

  // Open Batch QR Print for Selected Fleet Assets
  const handlePrintSelectedFleetQRs = () => {
    const selected = fleetAssets.filter(f => selectedFleetIds.has(f.id));
    if (selected.length === 0) return;
    const itemsToPrint: BatchPrintQRItem[] = selected.map(f => ({
      id: f.id,
      sku: f.serialNo, // SKU/Serial number printed under the QR Code
      name: f.deviceName,
      category: f.category,
      department: f.department,
      location: f.location,
      status: f.status
    }));
    setBatchPrintItems(itemsToPrint);
    setBatchPrintTitle('Selected Fleet & Hardware Assets QR Code Sheet');
  };

  // Selection handlers for Office Supplies
  const toggleSelectSupply = (sku: string) => {
    setSelectedSupplySkus(prev => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  };

  const toggleSelectAllSupplies = () => {
    if (selectedSupplySkus.size === filteredSupplies.length && filteredSupplies.length > 0) {
      setSelectedSupplySkus(new Set());
    } else {
      setSelectedSupplySkus(new Set(filteredSupplies.map(s => s.sku)));
    }
  };

  const handleBulkDeleteSupplies = () => {
    if (selectedSupplySkus.size === 0) return;
    const count = selectedSupplySkus.size;
    bulkDeleteOfficeSupplies(Array.from(selectedSupplySkus));
    setSelectedSupplySkus(new Set());
    setImportNotification(`Successfully deleted ${count} office supply item(s) in bulk and recorded to Audit Trail.`);
    setTimeout(() => setImportNotification(null), 5000);
  };

  // Open Batch QR Print for Selected Office Supplies
  const handlePrintSelectedSupplyQRs = () => {
    const selected = officeSupplies.filter(s => selectedSupplySkus.has(s.sku));
    if (selected.length === 0) return;
    const itemsToPrint: BatchPrintQRItem[] = selected.map(s => ({
      id: s.sku,
      sku: s.sku, // SKU number printed under the QR Code
      name: s.name,
      category: s.group,
      location: s.warehouse,
      status: s.balanceQty > 0 ? 'IN STOCK' : 'OUT OF STOCK'
    }));
    setBatchPrintItems(itemsToPrint);
    setBatchPrintTitle('Selected Office Supplies QR Code Sheet');
  };

  // Selection handlers for Audit Trail
  const toggleSelectAudit = (id: string) => {
    setSelectedAuditIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllAudit = () => {
    if (selectedAuditIds.size === auditTrail.length && auditTrail.length > 0) {
      setSelectedAuditIds(new Set());
    } else {
      setSelectedAuditIds(new Set(auditTrail.map(a => a.id)));
    }
  };

  const handleBulkDeleteAudit = () => {
    if (selectedAuditIds.size === 0) return;
    const count = selectedAuditIds.size;
    bulkDeleteAuditLogs(Array.from(selectedAuditIds));
    setSelectedAuditIds(new Set());
    setImportNotification(`Successfully deleted ${count} audit trail log(s) in bulk.`);
    setTimeout(() => setImportNotification(null), 5000);
  };

  // Handle CSV Import to the Highlighted / Selected Tab
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importToSelectedTab(content, activeSubTab, selectedCategoryFilter);
        if (result.error) {
          setImportNotification(`Import Warning: ${result.error}`);
        } else {
          setImportNotification(`Successfully imported ${result.count} items directly into [${result.targetTabName}] and synchronized with Audit Trail!`);
        }
        setTimeout(() => setImportNotification(null), 6000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download Template for Office Supplies
  const handleDownloadSuppliesTemplate = () => {
    const headers = ['SKU', 'Item Name', 'Group / Category', 'Warehouse Location', 'Standard UOM', 'Balance Qty', 'Balance Value (PHP)'];
    const sampleRows = [
      ['SKU000000990', 'Bond Paper A4 80GSM', 'SUPPLIES-OFFICE', 'TAGUIG OFFICE - FINANCE INVENTORY & FIXED ASSET', 'REAM', '50', '12500.00'],
      ['SKU000000991', 'Gel Pen 0.5mm Black', 'SUPPLIES-OFFICE', 'TAGUIG OFFICE - FINANCE INVENTORY & FIXED ASSET', 'BOX', '20', '3600.00'],
      ['SKU000000992', 'Safety Eyewear Anti-Fog', 'SUPPLIES-SAFETY', 'LAGUNA PLANT - RAW MATERIALS DEPOT', 'PCS', '45', '6750.00']
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'office_supplies_inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Submit Add Fleet Asset (Blank clean form - no sample item pre-fills)
  const handleSaveNewFleet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFleetName.trim()) {
      alert('Please enter an Asset / Device Name.');
      return;
    }
    const finalSerial = newFleetSerial.trim() || `2026-TAG${Math.floor(1000 + Math.random() * 9000)}`;
    addFleetAsset({
      serialNo: finalSerial,
      deviceName: newFleetName.trim(),
      category: newFleetCategory,
      location: newFleetLocation,
      custodian: newFleetCustodian,
      department: newFleetDepartment,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }),
      status: newFleetStatus,
      balanceQty: Number(newFleetQty) || 1,
      balanceValue: Number(newFleetValue) || 0
    });
    // Reset and close
    setNewFleetSerial('');
    setNewFleetName('');
    setNewFleetValue(0);
    setShowAddFleetModal(false);
    setImportNotification(`Successfully added "${newFleetName.trim()}" to the central database.`);
    setTimeout(() => setImportNotification(null), 5000);
  };

  // Submit Add Office Supply (Blank clean form - no sample item pre-fills)
  const handleSaveNewSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplyName.trim()) {
      alert('Please enter an Item Name.');
      return;
    }
    const finalSku = newSupplySku.trim() || `SKU${Math.floor(100000000 + Math.random() * 900000000)}`;
    const qty = Number(newSupplyQty) || 0;
    addOfficeSupply({
      sku: finalSku,
      name: newSupplyName.trim(),
      group: newSupplyGroup,
      warehouse: newSupplyWarehouse,
      uom: newSupplyUom,
      balanceQty: qty,
      balanceValue: Number(newSupplyValue) || 0,
      lowStock: qty <= 5
    });
    // Reset and close
    setNewSupplySku('');
    setNewSupplyName('');
    setNewSupplyQty(0);
    setNewSupplyValue(0);
    setShowAddSupplyModal(false);
    setImportNotification(`Successfully added supply "${newSupplyName.trim()}" to the central database.`);
    setTimeout(() => setImportNotification(null), 5000);
  };

  const handleHealthCategoryClick = (categoryName: string) => {
    setSelectedCategoryFilter(categoryName);
    const isSupply = officeSupplies.some(s => s.group.toLowerCase().includes(categoryName.toLowerCase()) || s.name.toLowerCase().includes(categoryName.toLowerCase()));
    if (isSupply) {
      setActiveSubTab('supplies');
    } else {
      setActiveSubTab('fleet');
    }
  };

  const filteredFleet = fleetAssets.filter(f => {
    const matchesSearch = f.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.custodian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategoryFilter) {
      const catLower = selectedCategoryFilter.toLowerCase();
      const matchesCategory = f.category.toLowerCase().includes(catLower) || 
        f.deviceName.toLowerCase().includes(catLower) ||
        catLower.includes(f.category.toLowerCase());
      return matchesSearch && matchesCategory;
    }
    return matchesSearch;
  });

  const filteredSupplies = officeSupplies.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.warehouse.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategoryFilter) {
      const catLower = selectedCategoryFilter.toLowerCase();
      matchesCategory = s.group.toLowerCase().includes(catLower) || 
        s.name.toLowerCase().includes(catLower) ||
        catLower.includes(s.group.toLowerCase());
    }

    return matchesSearch && matchesCategory;
  });

  // Calculate Office Supplies Totals
  const totalOfficeQty = officeSupplies.reduce((sum, s) => sum + (Number(s.balanceQty) || 0), 0);
  const totalOfficeValue = officeSupplies.reduce((sum, s) => sum + (Number(s.balanceValue) || 0), 0);
  const lowStockCount = officeSupplies.filter(s => s.lowStock || s.balanceQty <= 5).length;

  return (
    <div className="space-y-6">
      {/* Hidden File Input for CSV Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleCSVUpload} 
        accept=".csv" 
        className="hidden" 
      />

      {/* Notification Toast */}
      {importNotification && (
        <div className="p-3.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{importNotification}</span>
          </div>
          <button onClick={() => setImportNotification(null)} className="p-1 hover:bg-emerald-700 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Level Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('fleet')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'fleet'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Asset List ({fleetAssets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('supplies')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'supplies'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Office Supplies ({officeSupplies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('health')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'health'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span>Stock Health Status</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'audit'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Trail ({auditTrail.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FLEET & HARDWARE ASSET LIST (Aligned with Dashboard & Image 1) */}
      {activeSubTab === 'fleet' && (
        <div className="space-y-6">
          {/* Top Banner Header Aligned with Image 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  ASSET LIST REGISTRY
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage, track hardware assets, view instant QR property tags, and monitor equipment assignments.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Template [Outline Button] */}
              <button
                type="button"
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8,Serial No,Device Name,Category,Location,Custodian,Department,Status\n" + fleetAssets.map(f => `"${f.serialNo}","${f.deviceName}","${f.category}","${f.location}","${f.custodian}","${f.department}","${f.status}"`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "asset_list_template.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template</span>
              </button>

              {/* Import CSV */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Import CSV</span>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={() => exportSelectedTabToCSV('fleet', selectedCategoryFilter)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              {/* + Add Asset Item [Dark Button] */}
              <button
                type="button"
                onClick={() => setShowAddFleetModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Asset Item</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TOTAL LISTED ASSETS</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{fleetAssets.length.toLocaleString()}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Active hardware records</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">ACTIVE IN USE</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {fleetAssets.filter(f => f.status === 'IN USE' || f.status === 'ISSUED').length.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Deployed to personnel</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TOTAL ASSET VALUATION</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {formatCurrency(fleetAssets.reduce((sum, f) => sum + (f.balanceValue || 185000), 0))}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Equipment book value</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <span className="text-lg font-black">₱</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">UNDER REPAIR / ATTENTION</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                  {fleetAssets.filter(f => f.status === 'UNDER REPAIR').length.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Requires maintenance check</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">

            {/* Filter and Selection Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center justify-between text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assets by serial no, device name, custodian, location, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              {/* Action Buttons for Selection */}
              {selectedFleetIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintSelectedFleetQRs}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Open print preview window with compressed QR codes and SKU numbers underneath"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Print QR Code ({selectedFleetIds.size})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkDeleteFleet}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedFleetIds.size})</span>
                  </button>
                </div>
              )}

              {selectedCategoryFilter && (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 px-3 py-1 rounded-xl text-amber-900 dark:text-amber-200 font-bold text-xs">
                  <span>Filtered Category: <strong>{selectedCategoryFilter}</strong></span>
                  <button
                    onClick={() => { setSelectedCategoryFilter(null); onClearFilter?.(); }}
                    className="p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full cursor-pointer"
                    title="Clear category filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800/80 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={filteredFleet.length > 0 && selectedFleetIds.size === filteredFleet.length}
                        onChange={toggleSelectAllFleet}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        title="Select All"
                      />
                    </th>
                    <th className="p-3">QR Code (Click to View)</th>
                    <th className="p-3">Serial Number / Tag</th>
                    <th className="p-3">Device Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Custodian</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFleet.map((item) => (
                    <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${selectedFleetIds.has(item.id) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}`}>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedFleetIds.has(item.id)}
                          onChange={() => toggleSelectFleet(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => openQRModal(item)}
                          className="p-1 rounded-lg hover:ring-2 hover:ring-amber-500 hover:scale-105 transition-all cursor-pointer group flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          title="Click QR Code to view full item passport details"
                        >
                          <PreciseQRCode value={item.serialNo} size={30} showLabel={false} />
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 group-hover:underline">
                            View
                          </span>
                        </button>
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {item.isEditing ? (
                          <input
                            type="text"
                            value={item.serialNo}
                            onChange={(e) => updateFleetAsset(item.id, { serialNo: e.target.value })}
                            className="p-1 border rounded text-xs w-full"
                          />
                        ) : (
                          item.serialNo
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {item.isEditing ? (
                          <input
                            type="text"
                            value={item.deviceName}
                            onChange={(e) => updateFleetAsset(item.id, { deviceName: e.target.value })}
                            className="p-1 border rounded text-xs w-full"
                          />
                        ) : (
                          item.deviceName
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {item.isEditing ? (
                          <select
                            value={item.category}
                            onChange={(e) => updateFleetAsset(item.id, { category: e.target.value })}
                            className="p-1 border border-slate-300 dark:border-slate-600 rounded text-xs w-full bg-white dark:bg-slate-800 font-semibold"
                          >
                            {ASSET_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          item.category
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {item.isEditing ? (
                          <select
                            value={item.location}
                            onChange={(e) => updateFleetAsset(item.id, { location: e.target.value })}
                            className="p-1 border border-slate-300 dark:border-slate-600 rounded text-xs w-full bg-white dark:bg-slate-800 font-semibold"
                          >
                            {ASSET_LOCATIONS.map(loc => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </select>
                        ) : (
                          item.location
                        )}
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {item.isEditing ? (
                          <select
                            value={item.custodian}
                            onChange={(e) => updateFleetAsset(item.id, { custodian: e.target.value })}
                            className="p-1 border border-slate-300 dark:border-slate-600 rounded text-xs w-full bg-white dark:bg-slate-800 font-semibold"
                          >
                            {INITIAL_IT_USERS.map(u => (
                              <option key={u.id} value={u.displayName}>
                                {u.displayName} ({u.department || 'Staff'})
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.custodian
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {item.isEditing ? (
                          <select
                            value={item.department}
                            onChange={(e) => updateFleetAsset(item.id, { department: e.target.value })}
                            className="p-1 border border-slate-300 dark:border-slate-600 rounded text-xs w-full bg-white dark:bg-slate-800 font-semibold"
                          >
                            {ASSET_DEPARTMENTS.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        ) : (
                          item.department
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {item.isEditing ? (
                          <select
                            value={item.status}
                            onChange={(e) => updateFleetAsset(item.id, { status: e.target.value as any })}
                            className="p-1 border border-slate-300 dark:border-slate-600 rounded text-xs font-bold bg-white dark:bg-slate-800"
                          >
                            <option value="IN STOCK">IN STOCK</option>
                            <option value="ISSUED">ISSUED</option>
                            <option value="IN USE">IN USE</option>
                            <option value="UNDER REPAIR">UNDER REPAIR</option>
                            <option value="RETIRED">RETIRED</option>
                            <option value="DISPOSED">DISPOSED</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'IN USE' ? 'bg-emerald-100 text-emerald-700' :
                            item.status === 'IN STOCK' ? 'bg-blue-100 text-blue-700' :
                            item.status === 'ISSUED' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateFleetAsset(item.id, { isEditing: !item.isEditing })}
                            className={`p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer ${
                              item.isEditing ? 'bg-emerald-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title={item.isEditing ? 'Save edits' : 'Edit row'}
                          >
                            {item.isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFleetAsset(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete record & log to audit trail"
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

      {/* VIEW 2: OFFICE SUPPLIES REGISTRY (Aligned with Image 1: Header + 4 Metric Cards + Table) */}
      {activeSubTab === 'supplies' && (
        <div className="space-y-6">
          {/* Top Banner Header Aligned with Image 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
                <Box className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  OFFICE SUPPLIES REGISTRY
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage, track stock balances, import inventory sheets, and extract detailed office supply reports.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Template [Outline Button] */}
              <button
                type="button"
                onClick={handleDownloadSuppliesTemplate}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template</span>
              </button>

              {/* Import CSV */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Import CSV</span>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={() => exportSelectedTabToCSV('supplies', selectedCategoryFilter)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              {/* + Add Item [Dark Button] */}
              <button
                type="button"
                onClick={() => setShowAddSupplyModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Item</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Cards Aligned with Image 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: TOTAL LISTED ITEMS */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  TOTAL LISTED ITEMS
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {officeSupplies.length.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Active catalog records
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: TOTAL STOCK BALANCE QTY */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  TOTAL STOCK BALANCE QTY
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {totalOfficeQty.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Units in warehouse stock
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Box className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: TOTAL BALANCE VALUE */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  TOTAL BALANCE VALUE
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  ₱{totalOfficeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Inventory asset valuation
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl shrink-0">
                ₱
              </div>
            </div>

            {/* Card 4: REORDER WARNING (<= LEVEL) */}
            <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                  REORDER WARNING (≤ LEVEL)
                </span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                  {lowStockCount}
                </span>
                <span className="text-[11px] text-rose-500/90 dark:text-rose-400/80 mt-0.5 block">
                  Items needing replenishment
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Office Supplies Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center justify-between text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search supplies by SKU, item name, warehouse, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              {/* Action Buttons for Selection */}
              {selectedSupplySkus.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintSelectedSupplyQRs}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Open print preview window with compressed QR codes and SKU numbers underneath"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Print QR Code ({selectedSupplySkus.size})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkDeleteSupplies}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedSupplySkus.size})</span>
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800/80 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={filteredSupplies.length > 0 && selectedSupplySkus.size === filteredSupplies.length}
                        onChange={toggleSelectAllSupplies}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        title="Select All"
                      />
                    </th>
                    <th className="p-3">QR Code (Click to View)</th>
                    <th className="p-3">SKU / Item</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Item Group</th>
                    <th className="p-3">Warehouse Location</th>
                    <th className="p-3">Standard UOM</th>
                    <th className="p-3">Balance Qty</th>
                    <th className="p-3 text-right">Balance Value</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSupplies.map((s) => (
                    <tr key={s.sku} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${selectedSupplySkus.has(s.sku) ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedSupplySkus.has(s.sku)}
                          onChange={() => toggleSelectSupply(s.sku)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => openQRModal(s)}
                          className="p-1 rounded-lg hover:ring-2 hover:ring-indigo-500 hover:scale-105 transition-all cursor-pointer group flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          title="Click QR Code to view full supply details"
                        >
                          <PreciseQRCode value={s.sku} size={30} showLabel={false} />
                          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                            View
                          </span>
                        </button>
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {s.isEditing ? (
                          <input
                            type="text"
                            value={s.sku}
                            onChange={(e) => updateOfficeSupply(s.sku, { sku: e.target.value })}
                            className="p-1 border rounded text-xs w-full font-mono"
                          />
                        ) : (
                          s.sku
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {s.isEditing ? (
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => updateOfficeSupply(s.sku, { name: e.target.value })}
                            className="p-1 border rounded text-xs w-full font-bold"
                          />
                        ) : (
                          s.name
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {s.isEditing ? (
                          <select
                            value={s.group}
                            onChange={(e) => updateOfficeSupply(s.sku, { group: e.target.value })}
                            className="p-1 border rounded text-xs w-full"
                          >
                            {SUPPLY_GROUPS.map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        ) : (
                          s.group
                        )}
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs">
                        {s.isEditing ? (
                          <select
                            value={s.warehouse}
                            onChange={(e) => updateOfficeSupply(s.sku, { warehouse: e.target.value })}
                            className="p-1 border rounded text-xs w-full"
                          >
                            {SUPPLY_WAREHOUSES.map(w => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="truncate block">{s.warehouse}</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        {s.isEditing ? (
                          <select
                            value={s.uom}
                            onChange={(e) => updateOfficeSupply(s.sku, { uom: e.target.value })}
                            className="p-1 border rounded text-xs"
                          >
                            {STANDARD_UOMS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[10px]">
                            {s.uom}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {s.isEditing ? (
                          <input
                            type="number"
                            value={s.balanceQty}
                            onChange={(e) => updateOfficeSupply(s.sku, { balanceQty: parseFloat(e.target.value) || 0 })}
                            className="p-1 border rounded text-xs w-16"
                          />
                        ) : (
                          <span className={`font-black ${s.balanceQty <= 5 ? 'text-rose-600 font-extrabold' : 'text-slate-900 dark:text-white'}`}>
                            {s.balanceQty}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {s.isEditing ? (
                          <input
                            type="number"
                            value={s.balanceValue}
                            onChange={(e) => updateOfficeSupply(s.sku, { balanceValue: parseFloat(e.target.value) || 0 })}
                            className="p-1 border rounded text-xs w-24 text-right"
                          />
                        ) : (
                          formatCurrency(s.balanceValue)
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateOfficeSupply(s.sku, { isEditing: !s.isEditing })}
                            className={`p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer ${
                              s.isEditing ? 'bg-emerald-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'
                            }`}
                            title={s.isEditing ? 'Save edits' : 'Edit row'}
                          >
                            {s.isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteOfficeSupply(s.sku)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete supply record & log to audit trail"
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

      {/* VIEW 3: INVENTORY HEALTH & CATEGORY DRILL-DOWN */}
      {activeSubTab === 'health' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                CATEGORY STOCK STATUS MATRIX
              </h3>
              <p className="text-xs text-slate-500">
                Click on any category card below to drill down directly into its inventory items.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-extrabold text-xs rounded-full">
              Real-Time Stock Health
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthCategories.map((item, idx) => {
              const borderHighlight = item.highlight === 'red' ? 'border-red-400 dark:border-red-600 bg-red-50/20' :
                item.highlight === 'yellow' ? 'border-amber-400 dark:border-amber-600 bg-amber-50/20' :
                'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';

              return (
                <div 
                  key={idx} 
                  onClick={() => handleHealthCategoryClick(item.category)}
                  className={`p-5 rounded-2xl border ${borderHighlight} shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {item.category}
                      </h4>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Total Units: {item.total}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shrink-0 ${
                      item.status === 'OUT OF STOCK' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-300' :
                      item.status === 'CRITICAL LOW' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300' :
                      item.status === 'MONITORING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className={`font-black text-xs ${
                      item.available === 0 ? 'text-red-600 font-extrabold' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {item.available} AVAILABLE
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold">
                      <span>View Table</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: SYSTEM AUDIT LOG */}
      {activeSubTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                SYNCHRONIZED AUDIT TRAIL LOG
              </h3>
              <p className="text-xs text-slate-500">
                All item additions, edits, and deletions from the database are reflected here.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedAuditIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDeleteAudit}
                  className="px-3.5 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedAuditIds.size})</span>
                </button>
              )}
              <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-extrabold text-xs rounded-full">
                {auditTrail.length} Total Logs
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/80 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={auditTrail.length > 0 && selectedAuditIds.size === auditTrail.length}
                      onChange={toggleSelectAllAudit}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                      title="Select All"
                    />
                  </th>
                  <th className="p-3.5">Time Stamp</th>
                  <th className="p-3.5">Document ID</th>
                  <th className="p-3.5">Module</th>
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Performer</th>
                  <th className="p-3.5">Details & Notes</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditTrail.map((log) => (
                  <tr key={log.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${selectedAuditIds.has(log.id) ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''}`}>
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedAuditIds.has(log.id)}
                        onChange={() => toggleSelectAudit(log.id)}
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                      />
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[10px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3.5 font-mono font-bold text-purple-600 dark:text-purple-400">{log.docId}</td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{log.module}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{log.action}</td>
                    <td className="p-3.5 font-medium text-slate-700">{log.performer}</td>
                    <td className="p-3.5 text-slate-500">{log.details}</td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => deleteAuditLog(log.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded cursor-pointer"
                        title="Delete audit log record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Centered QR Detail Passport Modal */}
      {selectedItemForQR && (
        <AssetDetailModal item={selectedItemForQR} onClose={closeQRModal} />
      )}

      {/* Batch QR Compressed Print Modal */}
      {batchPrintItems && (
        <BatchQRPrintModal
          items={batchPrintItems}
          title={batchPrintTitle}
          onClose={() => setBatchPrintItems(null)}
        />
      )}

      {/* ADD FLEET ASSET MODAL (Clean, no pre-filled sample values) */}
      {showAddFleetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm uppercase">Add New Fleet / Hardware Asset</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddFleetModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewFleet} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Asset / Device Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFleetName}
                  onChange={(e) => setNewFleetName(e.target.value)}
                  placeholder="Enter device or asset title..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Serial No / Tag ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newFleetSerial}
                    onChange={(e) => setNewFleetSerial(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newFleetCategory}
                    onChange={(e) => setNewFleetCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  >
                    {ASSET_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={newFleetDepartment}
                    onChange={(e) => setNewFleetDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  >
                    {ASSET_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Custodian
                  </label>
                  <select
                    value={newFleetCustodian}
                    onChange={(e) => setNewFleetCustodian(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  >
                    {INITIAL_IT_USERS.map(u => (
                      <option key={u.id} value={u.displayName}>{u.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <select
                    value={newFleetLocation}
                    onChange={(e) => setNewFleetLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  >
                    {ASSET_LOCATIONS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newFleetStatus}
                    onChange={(e) => setNewFleetStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="IN STOCK">IN STOCK</option>
                    <option value="ISSUED">ISSUED</option>
                    <option value="IN USE">IN USE</option>
                    <option value="UNDER REPAIR">UNDER REPAIR</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newFleetQty}
                    onChange={(e) => setNewFleetQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asset Value (PHP ₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newFleetValue}
                    onChange={(e) => setNewFleetValue(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFleetModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Asset Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD OFFICE SUPPLY MODAL (Clean, no pre-filled sample values) */}
      {showAddSupplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                  <Box className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm uppercase">Add New Office Supply Item</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddSupplyModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewSupply} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSupplyName}
                  onChange={(e) => setNewSupplyName(e.target.value)}
                  placeholder="Enter office supply item title..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SKU Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={newSupplySku}
                    onChange={(e) => setNewSupplySku(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Group / Category
                  </label>
                  <select
                    value={newSupplyGroup}
                    onChange={(e) => setNewSupplyGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  >
                    {SUPPLY_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warehouse Location
                  </label>
                  <select
                    value={newSupplyWarehouse}
                    onChange={(e) => setNewSupplyWarehouse(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  >
                    {SUPPLY_WAREHOUSES.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Standard UOM
                  </label>
                  <select
                    value={newSupplyUom}
                    onChange={(e) => setNewSupplyUom(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  >
                    {STANDARD_UOMS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Balance Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSupplyQty}
                    onChange={(e) => setNewSupplyQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Balance Value (PHP ₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSupplyValue}
                    onChange={(e) => setNewSupplyValue(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplyModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Supply Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
