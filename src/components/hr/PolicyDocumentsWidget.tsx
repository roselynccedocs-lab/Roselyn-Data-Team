import * as React from 'react';
import { useState } from 'react';
import { initialPolicyDocuments } from '../../data/mockHrData';
import { PolicyDocument } from '../../types';
import { FileText, Search, Star, CheckCircle, ShieldAlert, ArrowDownAZ, ArrowUpZA, ExternalLink } from 'lucide-react';

export function PolicyDocumentsWidget() {
  const [documents, setDocuments] = useState<PolicyDocument[]>(initialPolicyDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'A-Z' | 'Z-A'>('Z-A');
  const [activeDocPreview, setActiveDocPreview] = useState<PolicyDocument | null>(null);

  const toggleAccept = (id: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, status: doc.status === 'ACCEPTED' ? 'PENDING' : 'ACCEPTED' } : doc
    ));
  };

  const sortedDocs = [...documents].sort((a, b) => {
    if (sortOrder === 'A-Z') return a.title.localeCompare(b.title);
    return b.title.localeCompare(a.title);
  });

  const filteredDocs = sortedDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="policy-documents-widget" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Policy Documents</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Company standards & safety sign-offs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'A-Z' ? 'Z-A' : 'A-Z')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 hover:bg-slate-200 transition-colors"
              title="Toggle sort order"
            >
              {sortOrder === 'A-Z' ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpZA className="w-3.5 h-3.5" />}
              {sortOrder}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search or click on a Policy Document to view"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Document list matching mockup */}
        <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors"
            >
              <div className="flex items-start gap-2 flex-1">
                <Star className={`w-4 h-4 mt-0.5 shrink-0 ${doc.id === 'POL-01' ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      onClick={() => setActiveDocPreview(doc)}
                      className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 cursor-pointer"
                    >
                      {doc.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{doc.version}</span>
                    <span>•</span>
                    <span>Updated: {doc.lastUpdated}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-500">{doc.category}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {doc.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                      <ShieldAlert className="w-3 h-3" /> Acceptance Required
                    </span>
                    <button
                      onClick={() => toggleAccept(doc.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-3 h-3" /> Accept
                    </button>
                  </div>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Acknowledged
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document View Modal */}
      {activeDocPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeDocPreview.title}</h3>
              </div>
              <button 
                onClick={() => setActiveDocPreview(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl text-xs space-y-3 text-slate-600 dark:text-slate-300 max-h-60 overflow-y-auto leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-100">Centaur Chem Enterprise Mandatory Compliance Document ({activeDocPreview.version})</p>
              <p>
                All laboratory chemists, plant operators, and corporate personnel are required to adhere to occupational health, chemical segregation protocols, and statutory safety mandates at all times.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Personal Protective Equipment (PPE) is mandatory in all Class 1 and Class 2 chemical zones.</li>
                <li>All chemical spillage must be reported immediately through the ERP Safety Incident Form.</li>
                <li>Digital signatures recorded via this portal hold legal validity under the Electronic Commerce Act.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Document ID: {activeDocPreview.id}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveDocPreview(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
                {activeDocPreview.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      toggleAccept(activeDocPreview.id);
                      setActiveDocPreview(null);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Sign & Accept Policy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
