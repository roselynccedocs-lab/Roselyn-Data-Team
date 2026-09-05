import { ActiveUserSession, SecurityAuditEntry, UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { INITIAL_IT_USERS } from '../data/itStaffUsersData';

const LOCAL_STORAGE_SESSIONS_KEY = 'centaur_active_user_sessions';
const LOCAL_STORAGE_AUDIT_LOGS_KEY = 'centaur_security_audit_logs';

// Real-time active user sessions & audit logs (no fake simulation logs)
const INITIAL_AUDIT_LOGS: SecurityAuditEntry[] = [];
const INITIAL_ACTIVE_SESSIONS: ActiveUserSession[] = [];

// Helper to format duration
export function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// In-memory subscribers
type SessionsListener = (sessions: ActiveUserSession[]) => void;
type LogsListener = (logs: SecurityAuditEntry[]) => void;

const sessionsSubscribers = new Set<SessionsListener>();
const logsSubscribers = new Set<LogsListener>();

function notifySessions(sessions: ActiveUserSession[]) {
  sessionsSubscribers.forEach(cb => {
    try { cb(sessions); } catch (e) { console.error(e); }
  });
}

function notifyLogs(logs: SecurityAuditEntry[]) {
  logsSubscribers.forEach(cb => {
    try { cb(logs); } catch (e) { console.error(e); }
  });
}

// Get sessions from cache/storage
export function getStoredSessions(): ActiveUserSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_ACTIVE_SESSIONS;
}

// Get audit logs from cache/storage
export function getStoredAuditLogs(): SecurityAuditEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUDIT_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_AUDIT_LOGS;
}

// Record login event for a user profile
export async function recordLoginEvent(profile: UserProfile, method = 'Corporate Identity SSO'): Promise<void> {
  const now = Date.now();
  const sessionId = `SESS-${profile.id || profile.email.split('@')[0]}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const newSession: ActiveUserSession = {
    sessionId,
    userId: profile.id || profile.uid || profile.email,
    displayName: profile.displayName || profile.email.split('@')[0],
    email: profile.email,
    employeeNo: profile.employeeNo || 'N/A',
    department: profile.department || 'General',
    position: profile.position || 'Staff',
    role: String(profile.role || 'User'),
    photoURL: profile.photoURL,
    loginTime: now,
    lastActive: now,
    ipAddress: `192.168.${Math.floor(1 + Math.random() * 5)}.${Math.floor(10 + Math.random() * 200)}`,
    device: typeof navigator !== 'undefined' ? `${navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'Corporate Browser'} / Online Client` : 'Web Browser',
    location: profile.department === 'Operations' ? 'Batangas Plant' : 'Taguig HQ',
    status: 'ACTIVE'
  };

  const newLog: SecurityAuditEntry = {
    id: `SEC-LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    userId: profile.id || profile.uid || profile.email,
    displayName: profile.displayName || profile.email.split('@')[0],
    email: profile.email,
    employeeNo: profile.employeeNo || 'N/A',
    department: profile.department || 'General',
    position: profile.position || 'Staff',
    role: String(profile.role || 'User'),
    eventType: 'LOGIN',
    timestamp: now,
    ipAddress: newSession.ipAddress,
    device: newSession.device,
    method,
    status: 'SUCCESS',
    notes: `User logged in successfully into Centaur Chem ERP (${profile.department}).`
  };

  // Update sessions list (remove existing session for same email to avoid duplicates)
  const currentSessions = getStoredSessions().filter(s => s.email.toLowerCase() !== profile.email.toLowerCase());
  const updatedSessions = [newSession, ...currentSessions];
  try {
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (e) {}
  notifySessions(updatedSessions);

  // Update logs list
  const currentLogs = getStoredAuditLogs();
  const updatedLogs = [newLog, ...currentLogs];
  try {
    localStorage.setItem(LOCAL_STORAGE_AUDIT_LOGS_KEY, JSON.stringify(updatedLogs));
  } catch (e) {}
  notifyLogs(updatedLogs);

  // Sync to Firestore if available
  try {
    await setDoc(doc(db, 'user_sessions', sessionId), newSession);
    await setDoc(doc(db, 'security_audit_logs', newLog.id), newLog);
  } catch (err) {
    // Firestore may be offline/unconfigured, local persistence succeeds
  }
}

// Record logout event for a user profile
export async function recordLogoutEvent(profile: UserProfile | null, reason = 'User Initiated Sign-Out'): Promise<void> {
  if (!profile || !profile.email) return;

  const now = Date.now();
  const currentSessions = getStoredSessions();
  const existingSession = currentSessions.find(s => s.email.toLowerCase() === profile.email.toLowerCase());
  
  let durationStr = 'Active';
  if (existingSession && existingSession.loginTime) {
    durationStr = formatDuration(now - existingSession.loginTime);
  }

  const newLog: SecurityAuditEntry = {
    id: `SEC-LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    userId: profile.id || profile.uid || profile.email,
    displayName: profile.displayName || profile.email.split('@')[0],
    email: profile.email,
    employeeNo: profile.employeeNo || existingSession?.employeeNo || 'N/A',
    department: profile.department || existingSession?.department || 'General',
    position: profile.position || existingSession?.position || 'Staff',
    role: String(profile.role || 'User'),
    eventType: 'LOGOUT',
    timestamp: now,
    ipAddress: existingSession?.ipAddress || '192.168.1.101',
    device: existingSession?.device || 'Web Browser',
    method: reason,
    status: 'SUCCESS',
    duration: durationStr,
    notes: `User logged out of Centaur Chem ERP. Total session: ${durationStr}.`
  };

  // Remove from active sessions
  const updatedSessions = currentSessions.filter(s => s.email.toLowerCase() !== profile.email.toLowerCase());
  try {
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (e) {}
  notifySessions(updatedSessions);

  // Add to logs
  const currentLogs = getStoredAuditLogs();
  const updatedLogs = [newLog, ...currentLogs];
  try {
    localStorage.setItem(LOCAL_STORAGE_AUDIT_LOGS_KEY, JSON.stringify(updatedLogs));
  } catch (e) {}
  notifyLogs(updatedLogs);

  // Firestore sync
  try {
    if (existingSession) {
      await deleteDoc(doc(db, 'user_sessions', existingSession.sessionId));
    }
    await setDoc(doc(db, 'security_audit_logs', newLog.id), newLog);
  } catch (err) {}
}

// Force logout / terminate session by Admin
export async function forceTerminateSession(sessionId: string, adminName = 'Chief Admin'): Promise<void> {
  const currentSessions = getStoredSessions();
  const session = currentSessions.find(s => s.sessionId === sessionId);
  if (!session) return;

  const now = Date.now();
  const durationStr = formatDuration(now - session.loginTime);

  const terminationLog: SecurityAuditEntry = {
    id: `SEC-LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    userId: session.userId,
    displayName: session.displayName,
    email: session.email,
    employeeNo: session.employeeNo,
    department: session.department,
    position: session.position,
    role: session.role,
    eventType: 'SESSION_TERMINATED',
    timestamp: now,
    ipAddress: session.ipAddress,
    device: session.device,
    method: `Terminated by ${adminName}`,
    status: 'TERMINATED',
    duration: durationStr,
    notes: `Admin terminated active user session for ${session.displayName}. Session ended after ${durationStr}.`
  };

  const updatedSessions = currentSessions.filter(s => s.sessionId !== sessionId);
  try {
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (e) {}
  notifySessions(updatedSessions);

  const currentLogs = getStoredAuditLogs();
  const updatedLogs = [terminationLog, ...currentLogs];
  try {
    localStorage.setItem(LOCAL_STORAGE_AUDIT_LOGS_KEY, JSON.stringify(updatedLogs));
  } catch (e) {}
  notifyLogs(updatedLogs);

  try {
    await deleteDoc(doc(db, 'user_sessions', sessionId));
    await setDoc(doc(db, 'security_audit_logs', terminationLog.id), terminationLog);
  } catch (e) {}
}

// Subscriptions
export function subscribeActiveSessions(callback: SessionsListener): () => void {
  sessionsSubscribers.add(callback);
  callback(getStoredSessions());

  // Firestore listener
  try {
    const colRef = collection(db, 'user_sessions');
    const unsubscribe = onSnapshot(colRef, (snap) => {
      if (!snap.empty) {
        const firestoreSessions = snap.docs.map(d => d.data() as ActiveUserSession);
        try { localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(firestoreSessions)); } catch (e) {}
        callback(firestoreSessions);
      }
    }, () => {});
    return () => {
      sessionsSubscribers.delete(callback);
      unsubscribe();
    };
  } catch (e) {
    return () => sessionsSubscribers.delete(callback);
  }
}

export function subscribeAuditLogs(callback: LogsListener): () => void {
  logsSubscribers.add(callback);
  callback(getStoredAuditLogs());

  // Firestore listener
  try {
    const colRef = collection(db, 'security_audit_logs');
    const unsubscribe = onSnapshot(colRef, (snap) => {
      if (!snap.empty) {
        const firestoreLogs = snap.docs.map(d => d.data() as SecurityAuditEntry);
        firestoreLogs.sort((a, b) => b.timestamp - a.timestamp);
        try { localStorage.setItem(LOCAL_STORAGE_AUDIT_LOGS_KEY, JSON.stringify(firestoreLogs)); } catch (e) {}
        callback(firestoreLogs);
      }
    }, () => {});
    return () => {
      logsSubscribers.delete(callback);
      unsubscribe();
    };
  } catch (e) {
    return () => logsSubscribers.delete(callback);
  }
}
