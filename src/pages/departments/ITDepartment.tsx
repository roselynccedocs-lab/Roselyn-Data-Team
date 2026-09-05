import React, { useState, useEffect } from 'react';
import { 
  BarChart3,
  PlusCircle,
  BookOpen,
  Users, 
  Shield, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2,
  CheckCircle2, 
  XCircle, 
  Mail, 
  Chrome, 
  Key, 
  Building2, 
  ShieldCheck,
  UserCheck,
  Plus,
  LogIn,
  LogOut,
  Radio,
  Laptop,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  Power,
  Clock,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile, UserRole, ActiveUserSession, SecurityAuditEntry } from '../../types';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { INITIAL_IT_USERS } from '../../data/itStaffUsersData';
import { 
  subscribeActiveSessions, 
  subscribeAuditLogs, 
  forceTerminateSession, 
  recordLoginEvent, 
  recordLogoutEvent,
  formatDuration
} from '../../services/securityAuditService';
import { 
  submitCentralSupportTicket, 
  submitBatchImportedSupportTickets, 
  deleteCentralSupportTicket,
  deleteBatchSupportTickets,
  updateCentralSupportTicket
} from '../../lib/ticketingSystem';
import { SubmitSupportButton } from '../../components/ui/SubmitSupportButton';

// IT Department Views created from user screenshots
import { ITDashboard, ITTicket, INITIAL_TICKETS } from '../../components/it/ITDashboard';
import { ITSupportForm } from '../../components/it/ITSupportForm';
import { ITKnowledgeBase } from '../../components/it/ITKnowledgeBase';

const DEPARTMENTS = [
  'Management Office',
  'Human Resources',
  'HR',
  'Operations',
  'Sales',
  'Asset and Data',
  'Asset',
  'Purchasing',
  'Purchasing & Logistics',
  'IT Department',
  'IT',
  'Finance',
  'Accounting',
  'Driver',
  'Messenger',
  'Utility Staff',
  'General'
];

export function ITDepartment() {
  const { profile, user } = useAuth();
  // Default tab set to 'dashboard' (2nd image view as requested)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submit-ticket' | 'user-management' | 'knowledge-base' | 'audit-logs'>('dashboard');
  
  // Shared Ticket State - loaded from persistent local cache or initial dataset
  const [ticketsList, setTicketsList] = useState<ITTicket[]>(() => {
    try {
      const cached = localStorage.getItem('gr8_support_tickets_cached');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_TICKETS;
  });

  // User Management State
  const [usersList, setUsersList] = useState<UserProfile[]>(INITIAL_IT_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [savingLoading, setSavingLoading] = useState(false);

  // Security Audit & Active Sessions State
  const [activeSessions, setActiveSessions] = useState<ActiveUserSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEntry[]>([]);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditEventFilter, setAuditEventFilter] = useState<'ALL' | 'LOGIN' | 'LOGOUT' | 'SESSION_TERMINATED'>('ALL');
  const [auditDeptFilter, setAuditDeptFilter] = useState<string>('ALL');
  const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);
  const [simulatingUserId, setSimulatingUserId] = useState<string>('');
  const [simulatingAction, setSimulatingAction] = useState<'LOGIN' | 'LOGOUT'>('LOGIN');

  // Subscriptions for active sessions and audit logs
  useEffect(() => {
    const unsubSessions = subscribeActiveSessions((sessions) => {
      setActiveSessions(sessions);
    });
    const unsubLogs = subscribeAuditLogs((logs) => {
      setAuditLogs(logs);
    });
    return () => {
      unsubSessions();
      unsubLogs();
    };
  }, []);

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingSessionId(sessionId);
    try {
      await forceTerminateSession(sessionId, profile?.displayName || 'Admin');
    } catch (e) {
      console.error(e);
    } finally {
      setTerminatingSessionId(null);
    }
  };

  const handleSimulateUserSession = async () => {
    const targetUser = usersList.find(u => u.id === simulatingUserId || u.email === simulatingUserId) || usersList[0];
    if (!targetUser) return;
    if (simulatingAction === 'LOGIN') {
      await recordLoginEvent(targetUser, 'Admin Simulated User Login');
    } else {
      await recordLogoutEvent(targetUser, 'Admin Simulated User Logout');
    }
  };

  // Edit User Modal State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEmployeeNo, setEditEmployeeNo] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editDepartment, setEditDepartment] = useState('General');
  const [editEmploymentStatus, setEditEmploymentStatus] = useState('REGULAR');
  const [editDateHired, setEditDateHired] = useState('N/A');
  const [editPersonInCharge, setEditPersonInCharge] = useState('N/A');
  const [editRole, setEditRole] = useState<string>('User');
  const [editContact, setEditContact] = useState('N/A');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete User Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Add New User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmployeeNo, setNewEmployeeNo] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newDepartment, setNewDepartment] = useState('General');
  const [newEmploymentStatus, setNewEmploymentStatus] = useState('REGULAR');
  const [newDateHired, setNewDateHired] = useState('');
  const [newPersonInCharge, setNewPersonInCharge] = useState('N/A');
  const [newRole, setNewRole] = useState<string>('User');
  const [newContact, setNewContact] = useState('');

  // Check current user email
  const userEmail = (user?.email || profile?.email || '').toLowerCase();

  // Firestore live collection sync for users
  useEffect(() => {
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreUsers: UserProfile[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            uid: docSnap.id,
            email: data.email || '',
            displayName: data.displayName || data.email?.split('@')[0] || 'User',
            employeeNo: data.employeeNo || 'N/A',
            position: data.position || 'N/A',
            department: data.department || 'General',
            employmentStatus: data.employmentStatus || 'N/A',
            dateHired: data.dateHired || 'N/A',
            personInCharge: data.personInCharge || 'N/A',
            role: data.role || 'User',
            contact: data.contact || 'N/A',
            provider: data.provider || 'Google',
            status: data.status || 'ACTIVE',
            photoURL: data.photoURL || undefined,
            createdAt: data.createdAt || Date.now(),
            lastLogin: data.lastLogin || Date.now()
          };
        });

        const mergedMap = new Map<string, UserProfile>();
        INITIAL_IT_USERS.forEach(u => mergedMap.set(u.email.toLowerCase(), u));
        firestoreUsers.forEach(u => mergedMap.set(u.email.toLowerCase(), u));

        setUsersList(Array.from(mergedMap.values()));
      }
    }, (error) => {
      console.warn("Firestore users read notice:", error);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for central support tickets
  useEffect(() => {
    try {
      const ticketsCol = collection(db, 'support_tickets');
      const unsubscribe = onSnapshot(ticketsCol, async (snapshot) => {
        if (!snapshot.empty) {
          const firestoreTickets: ITTicket[] = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as ITTicket));

          // Sort tickets: newest / highest ticket numbers first (e.g. CCC-328, CCC-327, ...)
          firestoreTickets.sort((a, b) => {
            const numA = parseInt(a.ticketNo?.replace(/\D/g, '') || '0', 10);
            const numB = parseInt(b.ticketNo?.replace(/\D/g, '') || '0', 10);
            if (numA !== numB) return numB - numA;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          });

          // Deduplicate by ID and ticketNo
          const map = new Map<string, ITTicket>();
          firestoreTickets.forEach(t => {
            if (t && t.id && !map.has(t.id)) {
              map.set(t.id, t);
            }
          });
          const deduplicated = Array.from(map.values());

          try {
            localStorage.setItem('gr8_support_tickets_cached', JSON.stringify(deduplicated));
          } catch (e) {}

          setTicketsList(deduplicated);
        } else {
          // If Firestore is empty (e.g., all deleted)
          setTicketsList([]);
          try {
            localStorage.setItem('gr8_support_tickets_cached', JSON.stringify([]));
          } catch (e) {}
        }
      }, (error) => {
        console.warn("Firestore support_tickets read notice:", error);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("support_tickets listener error:", err);
    }
  }, []);

  // Ticket handlers
  const handleTicketSubmitted = async (newTicket: ITTicket) => {
    const savedTicket = await submitCentralSupportTicket(newTicket, profile);
    setTicketsList(prev => {
      const updated = [savedTicket, ...prev.filter(t => t.id !== savedTicket.id)];
      try {
        localStorage.setItem('gr8_support_tickets_cached', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setActiveTab('dashboard');
  };

  const handleDeleteTicket = async (id: string, ticketNo?: string) => {
    await deleteCentralSupportTicket(id, ticketNo);
    setTicketsList(prev => {
      const filtered = prev.filter(t => t.id !== id && (ticketNo ? t.ticketNo !== ticketNo : true));
      try {
        localStorage.setItem('gr8_support_tickets_cached', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });
  };

  const handleDeleteTickets = async (ids: string[]) => {
    const targetTickets = ticketsList.filter(t => ids.includes(t.id));
    const ticketNos = targetTickets.map(t => t.ticketNo).filter(Boolean);
    await deleteBatchSupportTickets(ids, ticketNos);
    setTicketsList(prev => {
      const filtered = prev.filter(t => !ids.includes(t.id));
      try {
        localStorage.setItem('gr8_support_tickets_cached', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });
  };

  const handleUpdateTicket = async (ticket: ITTicket) => {
    await updateCentralSupportTicket(ticket);
    setTicketsList(prev => {
      const updated = prev.map(t => t.id === ticket.id ? ticket : t);
      try {
        localStorage.setItem('gr8_support_tickets_cached', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleImportTickets = async (newTickets: ITTicket[]) => {
    await submitBatchImportedSupportTickets(newTickets);
    setTicketsList(prev => {
      const map = new Map<string, ITTicket>();
      newTickets.forEach(t => { if (t && t.id) map.set(t.id, t); });
      prev.forEach(t => { if (t && t.id && !map.has(t.id)) map.set(t.id, t); });
      const merged = Array.from(map.values());
      try {
        localStorage.setItem('gr8_support_tickets_cached', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });
  };

  // Open Edit User Modal
  const handleOpenEdit = (usr: UserProfile) => {
    setSelectedUser(usr);
    setEditName(usr.displayName || '');
    setEditEmail(usr.email || '');
    setEditEmployeeNo(usr.employeeNo || 'N/A');
    setEditPosition(usr.position || 'N/A');
    setEditDepartment(usr.department || 'General');
    setEditEmploymentStatus(usr.employmentStatus || 'REGULAR');
    setEditDateHired(usr.dateHired || 'N/A');
    setEditPersonInCharge(usr.personInCharge || 'N/A');
    setEditRole(usr.role || 'User');
    setEditContact(usr.contact || 'N/A');
    setIsEditModalOpen(true);
  };

  // Save User Updates
  const handleSaveUserUpdate = async () => {
    if (!selectedUser) return;
    setSavingLoading(true);

    const updatedProfile: UserProfile = {
      ...selectedUser,
      displayName: editName,
      email: editEmail,
      employeeNo: editEmployeeNo,
      position: editPosition,
      department: editDepartment,
      employmentStatus: editEmploymentStatus,
      dateHired: editDateHired,
      personInCharge: editPersonInCharge,
      role: editRole,
      contact: editContact,
    };

    try {
      setUsersList(prev => prev.map(u => u.id === selectedUser.id ? updatedProfile : u));

      const targetDocId = selectedUser.uid || selectedUser.id;
      const docRef = doc(db, 'users', targetDocId);
      await setDoc(docRef, {
        displayName: editName,
        email: editEmail,
        employeeNo: editEmployeeNo,
        position: editPosition,
        department: editDepartment,
        employmentStatus: editEmploymentStatus,
        dateHired: editDateHired,
        personInCharge: editPersonInCharge,
        role: editRole,
        contact: editContact,
        updatedBy: userEmail,
        updatedAt: Date.now()
      }, { merge: true });

      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error saving user profile to Firestore:", err);
      setIsEditModalOpen(false);
    } finally {
      setSavingLoading(false);
    }
  };

  // Delete User handler
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setSavingLoading(true);
    try {
      setUsersList(prev => prev.filter(u => u.id !== userToDelete.id && u.email.toLowerCase() !== userToDelete.email.toLowerCase()));

      const targetDocId = userToDelete.uid || userToDelete.id;
      const docRef = doc(db, 'users', targetDocId);
      await deleteDoc(docRef);

      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setSavingLoading(false);
    }
  };

  // Add New User Handler
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    setSavingLoading(true);
    const generatedId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const newUserRecord: UserProfile = {
      id: generatedId,
      uid: generatedId,
      displayName: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      employeeNo: newEmployeeNo.trim() || 'N/A',
      position: newPosition.trim() || 'N/A',
      department: newDepartment,
      employmentStatus: newEmploymentStatus || 'REGULAR',
      dateHired: newDateHired.trim() || 'N/A',
      personInCharge: newPersonInCharge.trim() || 'N/A',
      role: newRole,
      contact: newContact.trim() || 'N/A',
      provider: 'Google',
      status: 'ACTIVE',
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    try {
      setUsersList(prev => [newUserRecord, ...prev.filter(u => u.email.toLowerCase() !== newUserRecord.email)]);

      const docRef = doc(db, 'users', generatedId);
      await setDoc(docRef, {
        displayName: newUserRecord.displayName,
        email: newUserRecord.email,
        employeeNo: newUserRecord.employeeNo,
        position: newUserRecord.position,
        department: newUserRecord.department,
        employmentStatus: newUserRecord.employmentStatus,
        dateHired: newUserRecord.dateHired,
        personInCharge: newUserRecord.personInCharge,
        role: newUserRecord.role,
        contact: newUserRecord.contact,
        provider: 'Google',
        status: 'ACTIVE',
        createdBy: userEmail,
        createdAt: Date.now()
      }, { merge: true });

      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewEmployeeNo('');
      setNewPosition('');
      setNewDateHired('');
      setNewContact('');
    } catch (err) {
      console.error("Error adding user:", err);
    } finally {
      setSavingLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter(usr => {
    const matchesSearch = 
      (usr.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usr.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usr.employeeNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usr.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usr.department || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || (usr.role || '').toLowerCase() === roleFilter.toLowerCase();
    const matchesDept = departmentFilter === 'ALL' || (usr.department || '').toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesDept;
  });

  const getRoleBadge = (role: string) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-700 shadow-xs">
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
        User
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'REGULAR') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          REGULAR
        </span>
      );
    }
    if (s === 'PROBATIONARY') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
          PROBATIONARY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        {s || 'N/A'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-6 h-6 p-1 bg-red-600/10 text-red-600 rounded-lg" /> IT Department Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Support Dashboard, Ticketing, Knowledge Base, & User Roster Management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {/* 2nd Image set as default Dashboard View */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> IT Support Dashboard
            </button>

            <button
              onClick={() => setActiveTab('submit-ticket')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'submit-ticket' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Submit Support Request
            </button>

            <button
              onClick={() => setActiveTab('user-management')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'user-management' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> User Management
            </button>

            <button
              onClick={() => setActiveTab('knowledge-base')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'knowledge-base' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Knowledge Base
            </button>

            <button
              onClick={() => setActiveTab('audit-logs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'audit-logs' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Security Audit
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: IT SUPPORT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <ITDashboard 
          tickets={ticketsList}
          onOpenSubmitForm={() => setActiveTab('submit-ticket')}
          onDeleteTicket={handleDeleteTicket}
          onDeleteTickets={handleDeleteTickets}
          onUpdateTicket={handleUpdateTicket}
          onImportTickets={handleImportTickets}
        />
      )}

      {/* TAB 2: SUBMIT SUPPORT REQUEST FORM */}
      {activeTab === 'submit-ticket' && (
        <ITSupportForm 
          onSubmitTicket={handleTicketSubmitted}
          onCancel={() => setActiveTab('dashboard')}
        />
      )}

      {/* TAB 3: USER MANAGEMENT & IT STAFF & USERS */}
      {activeTab === 'user-management' && (
        <div className="space-y-6">
          {/* Top Header & Add User Controls */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" /> IT Staff & Users
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage user access permissions, position titles, department roles, and staff details.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by CC-ticket number, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Add New User
              </button>
            </div>
          </div>

          {/* User Roster Table with Exact Columns from Image 1 & 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                Total Authorized Users: {filteredUsers.length}
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">NAME & EMAIL</th>
                    <th className="p-3.5">EMPLOYEE NO.</th>
                    <th className="p-3.5">POSITION</th>
                    <th className="p-3.5">DEPARTMENT</th>
                    <th className="p-3.5">EMPLOYMENT STATUS</th>
                    <th className="p-3.5">DATE HIRED</th>
                    <th className="p-3.5">PERSON IN CHARGE</th>
                    <th className="p-3.5">ROLE</th>
                    <th className="p-3.5">CONTACT</th>
                    <th className="p-3.5 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* NAME & EMAIL */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {usr.displayName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {usr.email}
                          </p>
                        </div>
                      </td>

                      {/* EMPLOYEE NO. */}
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {usr.employeeNo || 'N/A'}
                      </td>

                      {/* POSITION */}
                      <td className="p-3.5 text-slate-800 dark:text-slate-200 font-medium">
                        {usr.position || 'N/A'}
                      </td>

                      {/* DEPARTMENT */}
                      <td className="p-3.5 text-slate-800 dark:text-slate-200 font-semibold">
                        {usr.department || 'General'}
                      </td>

                      {/* EMPLOYMENT STATUS */}
                      <td className="p-3.5">
                        {getStatusBadge(usr.employmentStatus || 'REGULAR')}
                      </td>

                      {/* DATE HIRED */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">
                        {usr.dateHired || 'N/A'}
                      </td>

                      {/* PERSON IN CHARGE */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {usr.personInCharge || 'N/A'}
                      </td>

                      {/* ROLE */}
                      <td className="p-3.5">
                        {getRoleBadge(usr.role)}
                      </td>

                      {/* CONTACT */}
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {usr.contact || 'N/A'}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(usr)}
                            title="Edit User Details"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(usr)}
                            title="Delete User"
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* TAB 4: KNOWLEDGE BASE */}
      {activeTab === 'knowledge-base' && (
        <ITKnowledgeBase />
      )}

      {/* TAB 5: SECURITY AUDIT & LIVE SESSION MONITORING */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-6">
          {/* Security Audit Banner & Metrics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Security Audit & Live User Session Monitoring
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time monitoring of currently logged-in users, authentication history, and immutable session audit logs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {activeSessions.length} Active {activeSessions.length === 1 ? 'Session' : 'Sessions'} Online
                </span>
                <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {auditLogs.length} Total Audit Records
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Currently Logged In</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  {activeSessions.length}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Live enterprise sessions</span>
              </div>

              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Total Logins Recorded</span>
                  <LogIn className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
                  {auditLogs.filter(l => l.eventType === 'LOGIN').length}
                </div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Verified authentication events</span>
              </div>

              <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">User Sign-Outs</span>
                  <LogOut className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                  {auditLogs.filter(l => l.eventType === 'LOGOUT').length}
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Graceful session ends</span>
              </div>

              <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Terminated by Admin</span>
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
                  {auditLogs.filter(l => l.eventType === 'SESSION_TERMINATED').length}
                </div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Enforced session revocations</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: CURRENTLY LOGGED-IN USERS (LIVE ACTIVE SESSIONS) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Currently Logged In User Profiles
                </h4>
                <p className="text-xs text-slate-500">
                  Real-time active connections. Admin users can monitor and enforce session terminations.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                Active Pool: {activeSessions.length}
              </span>
            </div>

            {activeSessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-xs text-slate-500">No active sessions detected at this moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSessions.map((sess) => (
                  <div 
                    key={sess.sessionId}
                    className="p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {sess.photoURL ? (
                            <img src={sess.photoURL} alt={sess.displayName} className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-600" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                              {sess.displayName.charAt(0)}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                            {sess.displayName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {sess.email}
                          </div>
                        </div>
                      </div>

                      {sess.role === 'Admin' || sess.role === 'ADMIN' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          User
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                        <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Department</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{sess.department}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                        <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Employee No</span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5">{sess.employeeNo || 'N/A'}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                        <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Logged In At</span>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold truncate block mt-0.5">
                          {new Date(sess.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                        <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Duration</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block mt-0.5">
                          {formatDuration(Date.now() - sess.loginTime)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 space-y-0.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Laptop className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{sess.device}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span>IP: {sess.ipAddress} • {sess.location}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Session
                      </span>

                      <button
                        onClick={() => handleTerminateSession(sess.sessionId)}
                        disabled={terminatingSessionId === sess.sessionId}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Power className="w-3 h-3" />
                        {terminatingSessionId === sess.sessionId ? 'Terminating...' : 'Force Logout'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: AUDIT LOG TRAIL (IMMUTABLE LOGINS & LOGOUTS) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  User Logins & Logouts Audit Trail
                </h4>
                <p className="text-xs text-slate-500">
                  Comprehensive security log of all authentication attempts, sign-ins, and session terminations.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="Search name, email, IP..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 w-48"
                  />
                </div>

                {/* Event Type Filter */}
                <select
                  value={auditEventFilter}
                  onChange={(e) => setAuditEventFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Events</option>
                  <option value="LOGIN">Logins Only</option>
                  <option value="LOGOUT">Logouts Only</option>
                  <option value="SESSION_TERMINATED">Terminated Sessions</option>
                </select>

                {/* Department Filter */}
                <select
                  value={auditDeptFilter}
                  onChange={(e) => setAuditDeptFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            {(() => {
              const filteredLogs = auditLogs.filter(log => {
                const q = auditSearchQuery.toLowerCase();
                const matchesSearch = 
                  (log.displayName || '').toLowerCase().includes(q) ||
                  (log.email || '').toLowerCase().includes(q) ||
                  (log.employeeNo || '').toLowerCase().includes(q) ||
                  (log.ipAddress || '').toLowerCase().includes(q) ||
                  (log.department || '').toLowerCase().includes(q);

                const matchesEvent = auditEventFilter === 'ALL' || log.eventType === auditEventFilter;
                const matchesDept = auditDeptFilter === 'ALL' || (log.department || '').toLowerCase() === auditDeptFilter.toLowerCase();

                return matchesSearch && matchesEvent && matchesDept;
              });

              if (filteredLogs.length === 0) {
                return (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No security audit logs match the current filters.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Timestamp</th>
                        <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">User Profile</th>
                        <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Department & Position</th>
                        <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Event Type</th>
                        <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Duration</th>
                        <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Auth Method & Origin</th>
                        <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {log.displayName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {log.email}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {log.department}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              EMP: {log.employeeNo || 'N/A'} • {log.position || 'Staff'}
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {log.eventType === 'LOGIN' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <LogIn className="w-3.5 h-3.5 text-emerald-600" /> LOGIN
                              </span>
                            )}
                            {log.eventType === 'LOGOUT' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <LogOut className="w-3.5 h-3.5 text-amber-600" /> LOGOUT
                              </span>
                            )}
                            {log.eventType === 'SESSION_TERMINATED' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> TERMINATED
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                            {log.duration || (log.eventType === 'LOGIN' ? 'Active' : '—')}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                              {log.method}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              IP: {log.ipAddress} • {log.device}
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {log.status === 'SUCCESS' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                                <XCircle className="w-3.5 h-3.5" /> Revoked
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL: Edit User Details */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" /> Edit User Record
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Employee No.</label>
                  <input
                    type="text"
                    value={editEmployeeNo}
                    onChange={(e) => setEditEmployeeNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Position</label>
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Employment Status</label>
                  <select
                    value={editEmploymentStatus}
                    onChange={(e) => setEditEmploymentStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="REGULAR">REGULAR</option>
                    <option value="PROBATIONARY">PROBATIONARY</option>
                    <option value="CONTRACTUAL">CONTRACTUAL</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date Hired</label>
                  <input
                    type="text"
                    value={editDateHired}
                    onChange={(e) => setEditDateHired(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Person In Charge</label>
                  <input
                    type="text"
                    value={editPersonInCharge}
                    onChange={(e) => setEditPersonInCharge(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserUpdate}
                disabled={savingLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {savingLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete User Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete User Profile</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              Are you sure you want to remove <span className="font-bold">{userToDelete.displayName}</span> (<span className="font-mono">{userToDelete.email}</span>) from the system roster?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={savingLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {savingLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add New User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddUser} className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Add New User
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user.cce.docs@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Employee No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-CCE088"
                    value={newEmployeeNo}
                    onChange={(e) => setNewEmployeeNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Position</label>
                  <input
                    type="text"
                    placeholder="e.g. IT Specialist"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Employment Status</label>
                  <select
                    value={newEmploymentStatus}
                    onChange={(e) => setNewEmploymentStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="REGULAR">REGULAR</option>
                    <option value="PROBATIONARY">PROBATIONARY</option>
                    <option value="CONTRACTUAL">CONTRACTUAL</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date Hired</label>
                  <input
                    type="text"
                    placeholder="e.g. 01/15/2026"
                    value={newDateHired}
                    onChange={(e) => setNewDateHired(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Person In Charge</label>
                  <input
                    type="text"
                    placeholder="e.g. Arnold Cortina"
                    value={newPersonInCharge}
                    onChange={(e) => setNewPersonInCharge(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 09123456789"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {savingLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

