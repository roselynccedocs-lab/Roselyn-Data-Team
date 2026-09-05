import React, { useState } from 'react';
import { DomainType, MasterRecordDocument, CustomerData, SupplierData, ItemData } from '../../types/masterData';
import { MasterDataService } from '../../services/masterDataService';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  RefreshCw, 
  Database, 
  Layers, 
  FileText 
} from 'lucide-react';

interface BatchImportModalProps {
  domain: DomainType;
  existingRecords: MasterRecordDocument[];
  currentUser: { id: string; name: string; email: string };
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedBatchRow {
  id: number;
  data: Partial<CustomerData & SupplierData & ItemData>;
  rawRow: Record<string, string>;
  isValid: boolean;
  validationErrors: string[];
  aiScore?: number;
  duplicateMatch?: string;
  status: 'PENDING' | 'VALID' | 'WARNING' | 'ERROR';
}

export function BatchImportModal({
  domain,
  existingRecords,
  currentUser,
  onClose,
  onSuccess
}: BatchImportModalProps) {
  const [csvText, setCsvText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedBatchRow[]>([]);
  const [importMode, setImportMode] = useState<'DIRECT_COMMIT' | 'SUBMIT_QA'>('DIRECT_COMMIT');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; failCount: number } | null>(null);

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    let headers: string[] = [];
    let sampleRow: string[] = [];

    if (domain === 'CUSTOMER') {
      headers = ['Legal Name', 'Tax ID (BIR/TIN)', 'Credit Limit', 'Payment Terms', 'Industry', 'Street', 'City', 'State/Province', 'ZIP/Postal', 'Country'];
      sampleRow = ['Aura Chemical Philippines Corp', 'TIN-PH-10928374', '250000', 'NET_30', 'CHEMICAL_MFG', '45 Industry Blvd', 'Mandaluyong City', 'Metro Manila', '1550', 'Philippines'];
    } else if (domain === 'SUPPLIER') {
      headers = ['Legal Entity Name', 'Tax ID (BIR/TIN)', 'Bank Account Number', 'SWIFT Code', 'Payment Terms', 'ISO Certifications'];
      sampleRow = ['BASF South East Asia Pte Ltd', 'TIN-PH-88273641', '109283746501', 'BASFPHMM', 'NET_60', 'ISO 9001, ISO 14001'];
    } else {
      headers = ['SKU', 'Description', 'Category', 'UOM', 'Cost Price', 'List Price'];
      sampleRow = ['RAW-88201', 'Ethylene Glycol Tech Grade 99.5%', 'RAW_CHEMICALS', 'KG', '45.00', '58.50'];
    }

    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Batch_Import_Template_${domain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to parse CSV string
  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const rows: ParsedBatchRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rawRow: Record<string, string> = {};
      
      headers.forEach((h, idx) => {
        rawRow[h] = values[idx] || '';
      });

      const errors: string[] = [];
      const rowData: any = {};

      if (domain === 'CUSTOMER') {
        const legalName = rawRow['legal name'] || rawRow['legalname'] || rawRow['name'] || values[0] || '';
        const taxId = rawRow['tax id (bir/tin)'] || rawRow['tax id'] || rawRow['taxid'] || rawRow['tin'] || values[1] || '';
        const creditLimit = parseFloat(rawRow['credit limit'] || rawRow['creditlimit'] || values[2] || '0') || 50000;
        const paymentTerms = rawRow['payment terms'] || rawRow['paymentterms'] || values[3] || 'NET_30';
        const industryCode = rawRow['industry'] || values[4] || 'CHEMICAL_MFG';

        if (!legalName.trim()) errors.push('Missing Legal Name');
        if (!taxId.trim()) errors.push('Missing Tax ID');

        rowData.legalName = legalName;
        rowData.taxId = taxId;
        rowData.creditLimit = creditLimit;
        rowData.currency = 'PHP';
        rowData.paymentTerms = paymentTerms;
        rowData.industryCode = industryCode;
        rowData.billingAddress = {
          street: rawRow['street'] || values[5] || 'Industrial Zone',
          city: rawRow['city'] || rawRow['city/province'] || values[6] || 'Manila',
          state: rawRow['state/province'] || values[7] || 'Metro Manila',
          postalCode: rawRow['zip/postal'] || values[8] || '1000',
          country: rawRow['country'] || values[9] || 'Philippines'
        };
        rowData.shippingAddress = { ...rowData.billingAddress };
      } else if (domain === 'SUPPLIER') {
        const legalEntityName = rawRow['legal entity name'] || rawRow['supplier name'] || rawRow['name'] || values[0] || '';
        const taxId = rawRow['tax id (bir/tin)'] || rawRow['tax id'] || rawRow['tin'] || values[1] || '';
        const bankAccountNumber = rawRow['bank account number'] || rawRow['bank account'] || values[2] || '100000000000';
        const swiftCode = rawRow['swift code'] || rawRow['swift'] || values[3] || 'BDOOPHMM';
        const paymentTerms = rawRow['payment terms'] || values[4] || 'NET_60';

        if (!legalEntityName.trim()) errors.push('Missing Legal Entity Name');
        if (!taxId.trim()) errors.push('Missing Tax ID');

        rowData.legalEntityName = legalEntityName;
        rowData.taxId = taxId;
        rowData.bankAccountNumber = bankAccountNumber;
        rowData.swiftCode = swiftCode;
        rowData.paymentTerms = paymentTerms;
        rowData.isoCertifications = (rawRow['iso certifications'] || values[5] || 'ISO 9001').split(',').map(s => s.trim());
      } else {
        const sku = rawRow['sku'] || values[0] || '';
        const description = rawRow['description'] || values[1] || '';
        const category = rawRow['category'] || values[2] || 'RAW_CHEMICALS';
        const uom = rawRow['uom'] || values[3] || 'KG';
        const costPrice = parseFloat(rawRow['cost price'] || values[4] || '0') || 10;
        const listPrice = parseFloat(rawRow['list price'] || values[5] || '0') || 15;

        if (!sku.trim()) errors.push('Missing SKU');
        if (!description.trim()) errors.push('Missing Description');
        if (listPrice < costPrice) errors.push('List Price must be higher than Cost Price');

        rowData.sku = sku;
        rowData.description = description;
        rowData.category = category;
        rowData.uom = uom;
        rowData.costPrice = costPrice;
        rowData.listPrice = listPrice;
        rowData.grossMarginValid = listPrice >= costPrice * 1.15;
      }

      rows.push({
        id: i,
        data: rowData,
        rawRow,
        isValid: errors.length === 0,
        validationErrors: errors,
        status: errors.length === 0 ? 'VALID' : 'ERROR'
      });
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    parseCSV(text);
  };

  // Run AI Pre-Check on parsed rows against existing records
  const handleRunBatchAiCheck = async () => {
    setIsAnalyzing(true);

    const updatedRows = [...parsedRows];
    for (let row of updatedRows) {
      if (!row.isValid) continue;

      try {
        const res = await fetch('/api/governance/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            record: row.data,
            existingRecords
          })
        });

        if (res.ok) {
          const evalResult = await res.json();
          row.aiScore = evalResult.confidenceScore ?? (evalResult.isDuplicate ? 0.85 : 0.05);
          if (evalResult.isDuplicate || (row.aiScore && row.aiScore >= 0.70)) {
            row.status = 'WARNING';
            row.duplicateMatch = evalResult.matchedRecordIds?.[0] || 'Similar master record detected';
            row.validationErrors.push(`Possible duplicate: ${row.duplicateMatch}`);
          } else {
            row.status = 'VALID';
          }
        }
      } catch (err) {
        console.error('Batch AI check notice:', err);
      }
    }

    setParsedRows(updatedRows);
    setIsAnalyzing(false);
  };

  // Execute Batch Import
  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (let row of validRows) {
      try {
        if (importMode === 'DIRECT_COMMIT') {
          // Generate Master ID based on domain
          const prefix = domain === 'CUSTOMER' ? 'CUST' : domain === 'SUPPLIER' ? 'SUPP' : 'ITEM';
          const randomNum = Math.floor(10000 + Math.random() * 90000);
          const masterId = `${prefix}-2026-${randomNum}`;

          const tempRequest: any = {
            id: `REQ-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            domain,
            status: 'PENDING_MDM',
            version: 1,
            data: row.data,
            governance: {
              aiValidation: {
                passed: true,
                confidenceScore: row.aiScore ?? 0.05,
                matchedRecordIds: [],
                standardizedFields: {},
                detectedIssues: [],
                recommendations: ['Batch imported directly into register.']
              },
              qaReviewerId: currentUser.id,
              qaComments: 'Batch import approved'
            },
            auditTrail: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: currentUser
          };

          await MasterDataService.commitToMasterRegister(
            tempRequest,
            currentUser
          );
          successCount++;
        } else {
          // Save as Intake Request in PENDING_QA status
          const reqId = `REQ-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          const reqDoc: any = {
            id: reqId,
            domain,
            status: 'PENDING_QA',
            version: 1,
            data: row.data,
            governance: {
              aiValidation: {
                passed: true,
                confidenceScore: row.aiScore ?? 0.05,
                matchedRecordIds: [],
                standardizedFields: {},
                detectedIssues: [],
                recommendations: ['Batch imported for QA queue.']
              }
            },
            auditTrail: [
              {
                timestamp: new Date().toISOString(),
                action: 'SUBMITTED_FOR_QA',
                actorId: currentUser.id,
                actorName: currentUser.name,
                actorRole: 'REQUESTOR',
                details: `Batch imported from CSV`
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: currentUser
          };

          await MasterDataService.saveDraft(reqDoc, currentUser);
          successCount++;
        }
      } catch (err) {
        console.error('Batch import row error:', err);
        failCount++;
      }
    }

    setIsImporting(false);
    setImportResult({ successCount, failCount });

    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1200);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const warningCount = parsedRows.filter(r => r.status === 'WARNING').length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full font-extrabold text-[10px] mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Bulk Master Data Intake Engine</span>
            </div>
            <h2 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              Batch Import {domain} Master Records
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Download Template & CSV Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <span className="font-bold text-slate-900 dark:text-white block">1. Download Template</span>
            <p className="text-slate-500 text-[11px]">
              Use our standardized enterprise schema template to ensure seamless tax ID & SKU field mapping.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">2. Upload File or Paste CSV Data</span>
              <label className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[11px] flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload CSV / File</span>
                <input
                  type="file"
                  accept=".csv,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={4}
              value={csvText}
              onChange={handleTextareaChange}
              placeholder={`Paste raw CSV here...
Legal Name, Tax ID, Credit Limit, Payment Terms
Acme Chemicals Inc, TIN-1029384, 150000, NET_30`}
              className="w-full p-3 font-mono text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Step 2: Parsed Rows Table & Stats */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800/80 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  Parsed Records: <span className="font-mono text-indigo-600">{parsedRows.length}</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded font-bold">
                  {validCount} Valid
                </span>
                {warningCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded font-bold">
                    {warningCount} Warnings
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded font-bold">
                    {errorCount} Errors
                  </span>
                )}
              </div>

              <button
                onClick={handleRunBatchAiCheck}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Running AI Duplicate Check...' : 'Run AI Batch Pre-Check'}</span>
              </button>
            </div>

            {/* Preview Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto max-h-56">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-500">
                    <th className="p-2.5">Row #</th>
                    <th className="p-2.5">Entity Title / SKU</th>
                    <th className="p-2.5">Tax ID / Description</th>
                    <th className="p-2.5">Validation / AI Score</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {parsedRows.map(row => {
                    const title = row.data.legalName || row.data.legalEntityName || row.data.sku || 'N/A';
                    const subText = row.data.taxId || row.data.description || 'N/A';

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-2.5 text-slate-400 font-bold">#{row.id}</td>
                        <td className="p-2.5 font-sans font-bold text-slate-900 dark:text-white">{title}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{subText}</td>
                        <td className="p-2.5">
                          {row.validationErrors.length > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-sans text-[10px]">
                              {row.validationErrors.join(', ')}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-sans flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                              {row.aiScore !== undefined && (
                                <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                                  (S_match: {(row.aiScore * 100).toFixed(0)}%)
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            row.status === 'VALID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                            row.status === 'WARNING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import Target Options & Execute */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-700 dark:text-slate-300">Import Mode:</span>
            <label className="flex items-center gap-1.5 font-bold cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'DIRECT_COMMIT'}
                onChange={() => setImportMode('DIRECT_COMMIT')}
                className="accent-indigo-600"
              />
              <span>Direct Commit to Master Register</span>
            </label>

            <label className="flex items-center gap-1.5 font-bold cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'SUBMIT_QA'}
                onChange={() => setImportMode('SUBMIT_QA')}
                className="accent-indigo-600"
              />
              <span>Submit as Intake Requests (QA Queue)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl font-bold"
            >
              Cancel
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={validCount === 0 || isImporting}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold transition-all disabled:opacity-50 shadow-md"
            >
              <Database className="w-4 h-4" />
              <span>{isImporting ? 'Processing Batch Import...' : `Execute Import (${validCount} Records)`}</span>
            </button>
          </div>
        </div>

        {importResult && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Successfully processed {importResult.successCount} master records into the database!
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
