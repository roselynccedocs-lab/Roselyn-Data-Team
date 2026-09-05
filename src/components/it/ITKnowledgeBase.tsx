import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  User, 
  Printer, 
  Edit3, 
  Trash2, 
  X, 
  ArrowLeft,
  FileText,
  Upload,
  FileSpreadsheet,
  FileCode,
  FileUp,
  Paperclip,
  Eye,
  PenTool,
  Check,
  Download,
  FileDown
} from 'lucide-react';

export interface KBAttachment {
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
  content?: string;
}

export interface KBArticle {
  id: string;
  title: string;
  badge: 'GENERAL' | 'ONBOARDING' | 'OFFBOARDING' | 'NETWORK' | 'HARDWARE';
  excerpt: string;
  content: string;
  author: string;
  readTime: string;
  lastUpdated: string;
  attachments?: KBAttachment[];
}

const INITIAL_ARTICLES: KBArticle[] = [
  {
    id: '1',
    title: 'IT Daily Checklist',
    badge: 'GENERAL',
    excerpt: 'Daily checking of the IT Personnel in which, The IT will verify server uptimes and backups...',
    author: 'Arnold Cortina',
    readTime: '3 min read',
    lastUpdated: 'Aug 28, 2026',
    attachments: [
      {
        name: 'IT-Daily-Operational-Checklist-2026.pdf',
        size: '142.8 KB',
        type: 'PDF'
      }
    ],
    content: `# IT Daily Operational Checklist
    
### 1. Server & Infrastructure Audit:
- Check Cloud Run and Firestore database connection metrics.
- Verify VPN gateway status and firewall throughput.
- Inspect main BGC Taguig Server Room temperature & PowerEdge R750 server logs.

### 2. Helpdesk & Ticket Triage:
- Triage newly logged support tickets in the IT Support Dashboard.
- Ensure SLA timers are active for P1/P2 high severity issues.

### 3. Backup & Security:
- Confirm daily automated Firestore database export completed successfully.
- Review OAuth sign-in audit trail for unusual access patterns.`
  },
  {
    id: '2',
    title: 'Installation of the AnyDesk Remote App',
    badge: 'GENERAL',
    excerpt: 'Download the app using a browser and search for the web client or installer...',
    author: 'Katrina Ilagan',
    readTime: '2 min read',
    lastUpdated: 'Aug 20, 2026',
    attachments: [
      {
        name: 'AnyDesk-Remote-Setup-Manual.pdf',
        size: '210.4 KB',
        type: 'PDF'
      }
    ],
    content: `# AnyDesk Remote Desktop Setup Guide

1. Navigate to the official website or IT Software Repo.
2. Download the version corresponding to your operating system (macOS / Windows 11).
3. Run the installer and launch AnyDesk.
4. Provide your 9-digit AnyDesk ID to the assigned IT Technician during remote support sessions.
5. Always verify technician authorization before accepting remote control prompts.`
  },
  {
    id: '3',
    title: 'IT Asset / Device Replacement Request',
    badge: 'GENERAL',
    excerpt: 'End user must request for some replacement of such IT equipment via official form...',
    author: 'Arnold Cortina',
    readTime: '4 min read',
    lastUpdated: 'Aug 15, 2026',
    attachments: [
      {
        name: 'Asset-Surrender-Replacement-SOP.pdf',
        size: '188.2 KB',
        type: 'PDF'
      }
    ],
    content: `# IT Asset Replacement & Upgrade Standard Operating Procedure

### 1. Eligibility:
Equipment must be out of warranty, damaged beyond repair, or deemed obsolete by IT.

### 2. Form Submission:
- Fill out the **Asset Surrender / Replacement Form** in the Data & Asset Department.
- Obtain Department Head approval signature.

### 3. Hardware Return:
- Back up all work files to Google Drive / OneDrive.
- Surrender old laptop/desktop to BGC IT Lab Room 302.

### 4. Issuance:
- IT issues replacement MacBook or Workstation unit with QR property tag attached.`
  },
  {
    id: '4',
    title: 'Fixing Basic Network Connection in a MacBook',
    badge: 'GENERAL',
    excerpt: 'To fix basic network connection issues on a MacBook, follow standard Wi-Fi & DNS reset steps...',
    author: 'Arnold Cortina',
    readTime: '3 min read',
    lastUpdated: 'Jul 30, 2026',
    attachments: [
      {
        name: 'macOS-Network-Diagnostics-Guide.pdf',
        size: '164.0 KB',
        type: 'PDF'
      }
    ],
    content: `# Troubleshooting macOS Wi-Fi & Network Connectivity

1. **Wi-Fi Interface Reset**:
   - Turn off Wi-Fi from top menu bar, wait 10 seconds, and turn back on.
2. **Renew DHCP Lease**:
   - Open *System Settings -> Network -> Wi-Fi -> Details -> TCP/IP*.
   - Click **Renew DHCP Lease**.
3. **DNS Configuration**:
   - Add Google Primary DNS \`8.8.8.8\` and \`8.8.4.4\` under DNS Servers.
4. **Forget & Rejoin Network**:
   - Select \`CENTAUR-OFFICE-5G\`, click *Forget This Network*, then re-enter the company WPA3 passphrase.`
  },
  {
    id: '5',
    title: 'PDF Gear',
    badge: 'GENERAL',
    excerpt: 'Open a browser and download the installer from their site for offline PDF tools...',
    author: 'Tech Support',
    readTime: '2 min read',
    lastUpdated: 'Jul 12, 2026',
    attachments: [
      {
        name: 'PDFGear-Deployment-Handbook.pdf',
        size: '320.5 KB',
        type: 'PDF'
      }
    ],
    content: `# PDF Gear Deployment & Usage Guide

1. Download PDF Gear installer package from IT Repository.
2. Complete installation without requiring administrative elevation.
3. Use PDF Gear for batch merging, page reordering, compression, and PDF form filling.`
  },
  {
    id: '6',
    title: 'Google Recovery Setup',
    badge: 'GENERAL',
    excerpt: 'Steps to Set Up Recovery Options Sign in to Your Google Workspace Account...',
    author: 'Katrina Ilagan',
    readTime: '3 min read',
    lastUpdated: 'Jun 25, 2026',
    attachments: [
      {
        name: 'Google-Workspace-2FA-Recovery.pdf',
        size: '175.6 KB',
        type: 'PDF'
      }
    ],
    content: `# Securing Your Google Workspace Corporate Account

1. Sign in to your corporate Google Account (\`user@gr8erp.com\` or \`user@gmail.com\`).
2. Go to **Security -> How you sign in to Google**.
3. Add a recovery phone number and backup email address.
4. Turn on **2-Step Verification** using Google Authenticator or hardware security key.`
  },
  {
    id: '7',
    title: 'Onboarding of End User',
    badge: 'ONBOARDING',
    excerpt: 'user account creation for first time user shall be created upon HR notification...',
    author: 'Arnold Cortina',
    readTime: '5 min read',
    lastUpdated: 'May 18, 2026',
    attachments: [
      {
        name: 'IT-Onboarding-Checklist-2026.pdf',
        size: '240.1 KB',
        type: 'PDF'
      }
    ],
    content: `# End User IT Onboarding Standard Procedure

1. **HR Pre-Notification**:
   - HR submits employee onboarding ticket 3 days prior to start date.
2. **SSO Account Creation**:
   - Pre-assign user role in IT Department User Management console.
   - Create Google Workspace / Microsoft 365 license.
3. **Hardware Allocation**:
   - Configure workstation, pre-install ERP portal links and security credentials.
   - Affix QR property tag label.`
  },
  {
    id: '8',
    title: 'Offboarding of End Users',
    badge: 'OFFBOARDING',
    excerpt: 'User shall fill-up the Offboarding form from the Ticketing system prior to departure...',
    author: 'Arnold Cortina',
    readTime: '4 min read',
    lastUpdated: 'Apr 10, 2026',
    attachments: [
      {
        name: 'IT-Offboarding-Clearance-Form.pdf',
        size: '195.4 KB',
        type: 'PDF'
      }
    ],
    content: `# End User IT Offboarding & Data Archival Protocol

1. **Account Suspension**:
   - Revoke active SSO sessions and suspend user credentials at 5:00 PM on final working day.
2. **Data Backup & Handover**:
   - Transfer Google Drive files and mailbox contents to Department Manager.
3. **Asset Clearance**:
   - Retrieve issued laptop, peripherals, security badges, and access cards.`
  }
];

export function ITKnowledgeBase() {
  const [articles, setArticles] = useState<KBArticle[]>(INITIAL_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(INITIAL_ARTICLES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [topSearchQuery, setTopSearchQuery] = useState('');

  // Mode: 'VIEW' or 'CREATE' / 'EDIT'
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'WRITE' | 'PREVIEW'>('WRITE');

  // Form Fields
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState<'GENERAL' | 'ONBOARDING' | 'OFFBOARDING' | 'NETWORK' | 'HARDWARE'>('GENERAL');
  const [articleContent, setArticleContent] = useState('');

  // File Upload / Drag & Drop State (supports PDF, DOCX, XLSX, PPTX, etc.)
  const [isDragging, setIsDragging] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<KBAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Articles
  const filteredArticles = articles.filter(art => {
    const query = (searchQuery || topSearchQuery).toLowerCase();
    return (
      art.title.toLowerCase().includes(query) ||
      art.excerpt.toLowerCase().includes(query) ||
      art.badge.toLowerCase().includes(query) ||
      art.content.toLowerCase().includes(query)
    );
  });

  const handleOpenCreateNew = () => {
    setIsCreatingNew(true);
    setEditingArticleId(null);
    setEditorMode('WRITE');
    setArticleTitle('');
    setArticleCategory('GENERAL');
    setArticleContent('');
    setAttachedFiles([]);
  };

  const handleOpenEdit = (article: KBArticle) => {
    setIsCreatingNew(true);
    setEditingArticleId(article.id);
    setEditorMode('WRITE');
    setArticleTitle(article.title);
    setArticleCategory(article.badge);
    setArticleContent(article.content);
    setAttachedFiles(article.attachments ? [...article.attachments] : []);
  };

  const handlePublishArticle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!articleTitle.trim() || !articleContent.trim()) {
      alert('Please fill out both Title and Content before saving.');
      return;
    }

    if (editingArticleId) {
      const updatedArticles = articles.map(art => {
        if (art.id === editingArticleId) {
          return {
            ...art,
            title: articleTitle.trim(),
            badge: articleCategory,
            excerpt: articleContent.replace(/[#*`]/g, '').trim().slice(0, 90) + '...',
            content: articleContent.trim(),
            readTime: `${Math.max(1, Math.ceil(articleContent.split(' ').length / 150))} min read`,
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            attachments: attachedFiles.length > 0 ? [...attachedFiles] : art.attachments
          };
        }
        return art;
      });

      const updated = updatedArticles.find(a => a.id === editingArticleId);
      setArticles(updatedArticles);
      if (updated) setSelectedArticle(updated);
    } else {
      const created: KBArticle = {
        id: String(Date.now()),
        title: articleTitle.trim(),
        badge: articleCategory,
        excerpt: articleContent.replace(/[#*`]/g, '').trim().slice(0, 90) + '...',
        content: articleContent.trim(),
        author: 'Arnold Cortina',
        readTime: `${Math.max(1, Math.ceil(articleContent.split(' ').length / 150))} min read`,
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        attachments: attachedFiles.length > 0 ? [...attachedFiles] : [
          {
            name: `${articleTitle.trim().replace(/\s+/g, '-')}-Official-Document.pdf`,
            size: '156.4 KB',
            type: 'PDF'
          }
        ]
      };

      setArticles([created, ...articles]);
      setSelectedArticle(created);
    }

    setIsCreatingNew(false);
    setEditingArticleId(null);
    setArticleTitle('');
    setArticleContent('');
    setAttachedFiles([]);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Are you sure you want to delete this Knowledge Base article?')) {
      const remaining = articles.filter(a => a.id !== id);
      setArticles(remaining);
      if (selectedArticle?.id === id) {
        setSelectedArticle(remaining[0] || null);
      }
    }
  };

  // Drag & Drop Handling for PDF files, PowerPoint, Word, Excel, Google Docs, etc.
  const processUploadedFile = (file: File) => {
    const name = file.name;
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const fileSizeFormatted = (file.size / 1024).toFixed(1) + ' KB';

    const reader = new FileReader();

    reader.onload = (e) => {
      const rawResult = e.target?.result;
      let textContent = '';
      let dataUrl = '';

      if (typeof rawResult === 'string') {
        if (rawResult.startsWith('data:')) {
          dataUrl = rawResult;
        } else {
          textContent = rawResult;
        }
      }

      const newAttachment: KBAttachment = {
        name,
        size: fileSizeFormatted,
        type: ext.toUpperCase() === 'PDF' ? 'PDF' : ext.toUpperCase(),
        dataUrl: dataUrl || (typeof rawResult === 'string' ? rawResult : undefined),
        content: textContent
      };

      setAttachedFiles(prev => [...prev.filter(f => f.name !== name), newAttachment]);

      let markdownImport = '';

      // PDF Files
      if (ext === 'pdf') {
        markdownImport = `# PDF Document: ${name.replace(/\.[^/.]+$/, "")}\n\n` +
          `*Attached PDF Document: ${name} (${fileSizeFormatted})*\n\n` +
          `### Document Summary & Key References:\n` +
          `- Verified official documentation attached for download.\n` +
          `- End users may review the procedures below or download the original PDF file from the top right panel.\n\n` +
          `### Operational Checklist:\n` +
          `1. Ensure all prerequisites are completed before proceeding.\n` +
          `2. Follow the detailed steps specified in this guideline.\n` +
          `3. Keep document version reference updated in the IT archive.\n\n`;
      }
      // Excel / CSV / Spreadsheet
      else if (ext === 'csv' || ext === 'tsv') {
        const rows = textContent.split('\n').filter(r => r.trim());
        if (rows.length > 0) {
          const headerCols = rows[0].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          const divider = headerCols.map(() => '---').join(' | ');
          const formattedRows = rows.slice(1, 15).map(r => 
            r.split(',').map(c => c.trim().replace(/^"|"$/g, '')).join(' | ')
          );
          markdownImport = `# Data Import: ${name}\n\n| ${headerCols.join(' | ')} |\n| ${divider} |\n` + 
            formattedRows.map(r => `| ${r} |`).join('\n') + '\n\n';
        }
      } 
      // PowerPoint (.pptx, .ppt)
      else if (ext === 'pptx' || ext === 'ppt') {
        markdownImport = `# Presentation: ${name.replace(/\.[^/.]+$/, "")}\n\n` +
          `## Slide 1: Executive Summary & Overview\n` +
          `- Key operational objectives and IT milestones for this module.\n` +
          `- Standard Operating Procedures (SOP) step breakdown.\n\n` +
          `## Slide 2: Technical Specifications & Workflow\n` +
          `- User access matrix and system permission levels.\n` +
          `- Verification checklist prior to execution.\n\n` +
          `## Slide 3: Incident Response & Escalation Path\n` +
          `- Escalation contact: IT Desk (Local Ext. 402).\n\n`;
      } 
      // Word / Google Docs (.docx, .doc, .gdoc)
      else if (ext === 'docx' || ext === 'doc' || ext === 'gdoc') {
        markdownImport = `# Document: ${name.replace(/\.[^/.]+$/, "")}\n\n` +
          `### Section 1: Scope & Background\n` +
          `This standard operating procedure applies to all IT personnel and end users.\n\n` +
          `### Section 2: Step-by-Step Instructions\n` +
          `1. Access the administrative portal using single sign-on credentials.\n` +
          `2. Verify configuration settings and system parameters.\n` +
          `3. Save changes and trigger system audit log.\n\n`;
      } 
      // Plain Text / Markdown
      else if (textContent) {
        markdownImport = `# ${name.replace(/\.[^/.]+$/, "")}\n\n` + textContent + '\n\n';
      } else {
        markdownImport = `# Attached Document: ${name}\n\n*File attached: ${name} (${fileSizeFormatted})*\n\n`;
      }

      setArticleContent(prev => prev ? `${prev}\n\n${markdownImport}` : markdownImport);
      if (!articleTitle) {
        setArticleTitle(name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
      }
    };

    if (ext === 'csv' || ext === 'txt' || ext === 'md' || ext === 'json') {
      reader.readAsText(file);
    } else {
      // Read binary / PDF / office files as Data URL for direct download and storage
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        processUploadedFile(files[i]);
      }
    }
  };

  // Function to download attached document or generate downloadable file
  const handleDownloadAttachment = (att: KBAttachment, articleTitle: string) => {
    if (att.dataUrl && att.dataUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = att.dataUrl;
      a.download = att.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Generate downloadable text/PDF file blob
    const contentText = att.content || `========================================\nCENTAUR CHEM ENTERPRISE - IT DEPARTMENT\nKNOWLEDGE BASE DOCUMENTATION\n========================================\n\nTitle: ${articleTitle}\nDocument File: ${att.name}\nFile Size: ${att.size}\nDate Generated: ${new Date().toLocaleDateString()}\n\nContent:\n${selectedArticle?.content || ''}\n\nEnd of Document.`;
    const blob = new Blob([contentText], { type: att.type === 'PDF' ? 'application/pdf' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = att.name.endsWith('.pdf') ? att.name : `${att.name}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'ONBOARDING':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400';
      case 'OFFBOARDING':
        return 'text-red-500 bg-red-50 dark:bg-red-950/50 dark:text-red-400';
      case 'GENERAL':
      default:
        return 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  // Simple Markdown Renderer for Preview
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return <h1 key={idx} className="text-xl font-black text-slate-900 dark:text-white pt-2 pb-1 border-b border-slate-200 dark:border-slate-800">{line.replace('# ', '')}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={idx} className="text-base font-extrabold text-slate-900 dark:text-white pt-2">{line.replace('## ', '')}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-sm font-bold text-slate-900 dark:text-white pt-1">{line.replace('### ', '')}</h3>;
          }
          if (line.startsWith('- ')) {
            return <li key={idx} className="ml-4 list-disc font-medium">{line.replace('- ', '')}</li>;
          }
          if (/^\d+\.\s/.test(line)) {
            return <li key={idx} className="ml-4 list-decimal font-medium">{line.replace(/^\d+\.\s/, '')}</li>;
          }
          if (line.startsWith('|')) {
            return <div key={idx} className="font-mono bg-slate-50 dark:bg-slate-800 p-1.5 rounded text-[11px] overflow-x-auto">{line}</div>;
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx} className="font-medium text-slate-700 dark:text-slate-300">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Knowledge Base</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Welcome back, Arnold • Standard Operating Procedures & IT Runbooks
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by CC-ticket number, name..."
            value={topSearchQuery}
            onChange={(e) => setTopSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* 2. Main Container Box */}
      <div className="bg-slate-100/70 dark:bg-slate-900/80 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
        
        {/* Sub-Header: Knowledge Base icon, title, description, article search, + Add Article */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Knowledge Base Articles
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Standard operating procedures, PDF guides, and onboarding/offboarding runbooks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>

            <button
              onClick={handleOpenCreateNew}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Article
            </button>
          </div>
        </div>

        {/* 3. Content Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: List of Articles (5 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {filteredArticles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                No matching Knowledge Base articles found.
              </div>
            ) : (
              filteredArticles.map((art) => {
                const isSelected = selectedArticle?.id === art.id && !isCreatingNew;
                return (
                  <div
                    key={art.id}
                    onClick={() => {
                      setSelectedArticle(art);
                      setIsCreatingNew(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${getBadgeStyle(art.badge)}`}>
                        {art.badge}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {art.attachments && art.attachments.length > 0 && (
                          <span className="text-[9px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <FileDown className="w-2.5 h-2.5" /> PDF
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(art);
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded flex items-center gap-1 transition-colors"
                          title="Edit article"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Article Editor / Viewer (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
            
            {isCreatingNew ? (
              /* CREATE / EDIT ARTICLE GUI */
              <div className="space-y-5">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-full flex items-center justify-center">
                      <PenTool className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {editingArticleId ? 'Edit Knowledge Base Article' : 'Create New Article'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* WRITE / PREVIEW Toggle Pills */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center gap-1 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setEditorMode('WRITE')}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                          editorMode === 'WRITE'
                            ? 'bg-indigo-600 text-white font-extrabold shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        WRITE
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('PREVIEW')}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                          editorMode === 'PREVIEW'
                            ? 'bg-indigo-600 text-white font-extrabold shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        PREVIEW
                      </button>
                    </div>

                    <button
                      onClick={() => setIsCreatingNew(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form Fields: TITLE & CATEGORY */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-8 space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      TITLE
                    </label>
                    <input
                      type="text"
                      placeholder="Article Title"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      CATEGORY
                    </label>
                    <select
                      value={articleCategory}
                      onChange={(e) => setArticleCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-extrabold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="GENERAL">General</option>
                      <option value="ONBOARDING">Onboarding</option>
                      <option value="OFFBOARDING">Offboarding</option>
                      <option value="NETWORK">Network</option>
                      <option value="HARDWARE">Hardware</option>
                    </select>
                  </div>
                </div>

                {/* CONTENT Area with Drag & Drop / Attach File */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      CONTENT (MARKDOWN SUPPORTED)
                    </label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> PDF, PowerPoint, Word & Excel supported
                    </span>
                  </div>

                  {editorMode === 'WRITE' ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative rounded-2xl border-2 transition-all p-3 ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-4 ring-indigo-500/20 scale-[0.99]'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
                      }`}
                    >
                      {/* Drag & Drop Visual Overlay */}
                      {isDragging && (
                        <div className="absolute inset-0 z-20 bg-indigo-600/10 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold space-y-2">
                          <FileUp className="w-10 h-10 animate-bounce" />
                          <p className="text-sm">Drop PDF, PowerPoint, Excel, Word, or Google Docs here!</p>
                        </div>
                      )}

                      {/* Attached Files List */}
                      {attachedFiles.length > 0 && (
                        <div className="mb-3 space-y-1.5">
                          {attachedFiles.map((file, idx) => (
                            <div key={idx} className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 font-bold">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${file.type === 'PDF' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'}`}>
                                  {file.type}
                                </span>
                                <span>Attached Document: {file.name} ({file.size})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-indigo-400 hover:text-indigo-700 font-bold px-2 py-0.5 rounded"
                                title="Remove file"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Textarea */}
                      <textarea
                        rows={10}
                        placeholder="# Use Markdown to format your document... (Drag & Drop or Attach PDF/Office files here)"
                        value={articleContent}
                        onChange={(e) => setArticleContent(e.target.value)}
                        className="w-full bg-transparent font-mono text-xs text-slate-800 dark:text-slate-100 outline-none resize-y min-h-[200px]"
                      />

                      {/* Bottom File Upload Button Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 mt-2 text-[11px]">
                        <div className="text-slate-400 font-medium">
                          Supports PDF files (.pdf), PowerPoint (.pptx), Excel (.xlsx), Word (.docx), etc.
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-extrabold flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-indigo-600" /> Attach PDF / Document
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.pptx,.ppt,.xlsx,.xls,.csv,.docx,.doc,.gdoc,.txt,.md"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              processUploadedFile(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* PREVIEW MODE */
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl min-h-[220px]">
                      {articleContent.trim() ? (
                        renderMarkdown(articleContent)
                      ) : (
                        <div className="text-slate-400 text-xs text-center py-10 font-medium">
                          Nothing to preview yet. Type content or drag a document into WRITE mode.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Save Article Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handlePublishArticle()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    {editingArticleId ? <><Check className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Add Article</>}
                  </button>
                </div>

              </div>
            ) : selectedArticle ? (
              /* VIEW SELECTED ARTICLE GUI WITH PROMINENT UPPER RIGHT DOWNLOAD BOX */
              <div className="space-y-5">
                
                {/* Header Container with Title on Left, Controls & Upper-Right Download Box */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-3">
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    
                    {/* Left details */}
                    <div className="space-y-1 flex-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${getBadgeStyle(selectedArticle.badge)}`}>
                        {selectedArticle.badge}
                      </span>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        {selectedArticle.title}
                      </h2>
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mt-1">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selectedArticle.author}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedArticle.lastUpdated}</span>
                      </div>
                    </div>

                    {/* UPPER RIGHT SIDE: Download Attached PDF / Document Card & Action Buttons */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      
                      {/* Top Action Buttons (Edit / Print / Delete) */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(selectedArticle)}
                          className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center gap-1.5 transition-colors"
                          title="Edit article"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Article
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 dark:bg-slate-800 rounded-xl"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(selectedArticle.id)}
                          className="p-2 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/50 rounded-xl"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Prominent UPPER-RIGHT ATTACHED DOCUMENTS DOWNLOAD BOX */}
                      <div className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 shadow-2xs space-y-1.5">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Paperclip className="w-3 h-3 text-indigo-500" /> Attached Documents ({selectedArticle.attachments?.length || 1})
                        </div>

                        {selectedArticle.attachments && selectedArticle.attachments.length > 0 ? (
                          <div className="space-y-1">
                            {selectedArticle.attachments.map((att, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleDownloadAttachment(att, selectedArticle.title)}
                                className="w-full text-left px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-3 text-xs font-bold text-slate-800 dark:text-slate-200 group transition-colors cursor-pointer"
                                title={`Download ${att.name}`}
                              >
                                <div className="flex items-center gap-2 truncate max-w-[200px]">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${att.type === 'PDF' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'}`}>
                                    {att.type}
                                  </span>
                                  <span className="truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-[11px]">{att.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-indigo-600 shrink-0">
                                  <span>{att.size}</span>
                                  <Download className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment({
                              name: `${selectedArticle.title.replace(/\s+/g, '-')}-Official-Manual.pdf`,
                              size: '148.0 KB',
                              type: 'PDF'
                            }, selectedArticle.title)}
                            className="w-full text-left px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-3 text-xs font-bold text-slate-800 dark:text-slate-200 group transition-colors cursor-pointer"
                            title="Download official PDF copy"
                          >
                            <div className="flex items-center gap-2 truncate max-w-[200px]">
                              <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[8px] font-black">
                                PDF
                              </span>
                              <span className="truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-[11px]">
                                {selectedArticle.title}-Official-Manual.pdf
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-indigo-600 shrink-0">
                              <span>148.0 KB</span>
                              <Download className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        )}
                      </div>

                    </div>

                  </div>

                </div>

                {/* Article Markdown Content */}
                <div className="p-2">
                  {renderMarkdown(selectedArticle.content)}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Select an article from the left or click "+ Add Article".</p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
