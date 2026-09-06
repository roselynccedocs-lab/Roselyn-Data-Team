import React, { useState, useEffect } from 'react';
import { MasterRequestDocument, MasterRecordDocument } from '../types/masterData';
import { MasterDataService } from '../services/masterDataService';
import { EmployeeKPIDashboard } from '../components/masterdata/EmployeeKPIDashboard';
import { Loader2 } from 'lucide-react';

export default function PerformancePage() {
  const [requests, setRequests] = useState<MasterRequestDocument[]>([]);
  const [masterRecords, setMasterRecords] = useState<MasterRecordDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const reqs = await MasterDataService.getRequests();
        const records = await MasterDataService.getMasterRegister();
        setRequests(reqs);
        setMasterRecords(records);
      } catch (err) {
        console.error('Failed to load performance data', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('mdm_update', handleUpdate);
    return () => window.removeEventListener('mdm_update', handleUpdate);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-500 font-medium">Loading Performance Data...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <EmployeeKPIDashboard 
        requests={requests}
        masterRecords={masterRecords}
      />
    </div>
  );
}
