import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { ITTicket } from '../components/it/ITDashboard';
import { UserProfile } from '../types';

export interface TicketingScheduleStatus {
  isAvailable: boolean;
  status: 'OPEN' | 'LUNCH_CLOSED' | 'AFTER_HOURS_CLOSED';
  reason: string;
  nextOpeningTimeText: string;
}

/**
 * Checks if support requests are currently open based on user role and schedule rules:
 * - Admin users: 24/7 access
 * - End users:
 *   - Closed during lunch break: 12:00 PM to 1:00 PM daily
 *   - Grayed out / Closed after hours: 5:00 PM to 8:00 AM next morning
 *   - Open during working hours: 8:00 AM - 12:00 PM and 1:00 PM - 5:00 PM
 */
export function checkSupportRequestAvailability(
  userRole?: string,
  userEmail?: string,
  currentTime: Date = new Date()
): TicketingScheduleStatus {
  const normalizedEmail = (userEmail || '').toLowerCase();
  const isAdmin = userRole === 'ADMIN' || 
                  userRole === 'IT_ADMIN' || 
                  normalizedEmail.includes('arnoldcortina');

  // Admins have 24/7 access
  if (isAdmin) {
    return {
      isAvailable: true,
      status: 'OPEN',
      reason: 'Admin 24/7 Access Active',
      nextOpeningTimeText: 'Always Open for Admins'
    };
  }

  const hours = currentTime.getHours(); // 0 to 23

  // Rule 1: Closed during lunch break (12:00 PM to 1:00 PM)
  if (hours === 12) {
    return {
      isAvailable: false,
      status: 'LUNCH_CLOSED',
      reason: 'Ticketing system is closed during lunch break (12:00 PM to 1:00 PM daily).',
      nextOpeningTimeText: 'Reopens at 1:00 PM today'
    };
  }

  // Rule 2: Grayed out / Closed after hours (5:00 PM to 8:00 AM)
  if (hours >= 17 || hours < 8) {
    return {
      isAvailable: false,
      status: 'AFTER_HOURS_CLOSED',
      reason: 'Support ticket requests are closed after hours (5:00 PM to 8:00 AM).',
      nextOpeningTimeText: 'Reopens at 8:00 AM next morning'
    };
  }

  // Normal Working Hours (8 AM - 12 PM, 1 PM - 5 PM)
  return {
    isAvailable: true,
    status: 'OPEN',
    reason: 'System Open for Support Submissions',
    nextOpeningTimeText: ''
  };
}

export interface ActiveWorkingTimeResult {
  totalMinutes: number;
  idleDeductedMinutes: number;
  overnightDeductedMinutes: number;
  lunchDeductedMinutes: number;
  netActiveMinutes: number;
  formattedDuration: string;
  isWithinWorkingHours: boolean;
  currentWindowStatus: 'WORKING_HOURS' | 'LUNCH_BREAK' | 'AFTER_HOURS';
}

/**
 * Calculates active working duration in minutes between two timestamps:
 * - Active working hours: 8:00 AM - 12:00 PM and 1:00 PM - 5:00 PM daily (8 active hours / 480 mins/day)
 * - Idle time deducted / not counted:
 *   1. Overnight idle time from 5:00 PM to 8:00 AM the next day (15 hours / 900 mins per night)
 *   2. Lunch break idle time from 12:00 PM to 1:00 PM daily (1 hour / 60 mins)
 */
export function calculateActiveWorkingMinutes(
  startTimeInput: Date | string | number,
  endTimeInput: Date | string | number = new Date()
): ActiveWorkingTimeResult {
  const start = new Date(startTimeInput);
  const end = new Date(endTimeInput);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return {
      totalMinutes: 0,
      idleDeductedMinutes: 0,
      overnightDeductedMinutes: 0,
      lunchDeductedMinutes: 0,
      netActiveMinutes: 0,
      formattedDuration: '0m',
      isWithinWorkingHours: true,
      currentWindowStatus: 'WORKING_HOURS'
    };
  }

  const totalMs = end.getTime() - start.getTime();
  const totalMinutes = Math.floor(totalMs / (1000 * 60));

  let activeMs = 0;
  let lunchMs = 0;

  // Iterate day by day across calendar dates from start to end
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
  const endLimit = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);

  while (cur <= endLimit) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    const d = cur.getDate();

    // Morning active shift: 8:00 AM to 12:00 PM
    const shift1Start = new Date(y, m, d, 8, 0, 0, 0).getTime();
    const shift1End = new Date(y, m, d, 12, 0, 0, 0).getTime();
    const o1Start = Math.max(start.getTime(), shift1Start);
    const o1End = Math.min(end.getTime(), shift1End);
    if (o1End > o1Start) {
      activeMs += (o1End - o1Start);
    }

    // Lunch break idle window: 12:00 PM to 1:00 PM
    const lunchStart = new Date(y, m, d, 12, 0, 0, 0).getTime();
    const lunchEnd = new Date(y, m, d, 13, 0, 0, 0).getTime();
    const lStart = Math.max(start.getTime(), lunchStart);
    const lEnd = Math.min(end.getTime(), lunchEnd);
    if (lEnd > lStart) {
      lunchMs += (lEnd - lStart);
    }

    // Afternoon active shift: 1:00 PM to 5:00 PM
    const shift2Start = new Date(y, m, d, 13, 0, 0, 0).getTime();
    const shift2End = new Date(y, m, d, 17, 0, 0, 0).getTime();
    const o2Start = Math.max(start.getTime(), shift2Start);
    const o2End = Math.min(end.getTime(), shift2End);
    if (o2End > o2Start) {
      activeMs += (o2End - o2Start);
    }

    cur.setDate(cur.getDate() + 1);
  }

  const netActiveMinutes = Math.max(0, Math.floor(activeMs / (1000 * 60)));
  const lunchDeductedMinutes = Math.floor(lunchMs / (1000 * 60));
  const idleDeductedMinutes = Math.max(0, totalMinutes - netActiveMinutes);
  const overnightDeductedMinutes = Math.max(0, idleDeductedMinutes - lunchDeductedMinutes);

  // Format human-readable string
  const h = Math.floor(netActiveMinutes / 60);
  const min = netActiveMinutes % 60;
  let formattedDuration = '';
  if (h > 0) {
    formattedDuration = `${h}h ${min}m`;
  } else {
    formattedDuration = `${min}m`;
  }

  // Determine current window status for the end time (usually now)
  const endHours = end.getHours();
  let isWithinWorkingHours = false;
  let currentWindowStatus: 'WORKING_HOURS' | 'LUNCH_BREAK' | 'AFTER_HOURS' = 'WORKING_HOURS';

  if (endHours >= 17 || endHours < 8) {
    isWithinWorkingHours = false;
    currentWindowStatus = 'AFTER_HOURS';
  } else if (endHours === 12) {
    isWithinWorkingHours = false;
    currentWindowStatus = 'LUNCH_BREAK';
  } else {
    isWithinWorkingHours = true;
    currentWindowStatus = 'WORKING_HOURS';
  }

  return {
    totalMinutes,
    idleDeductedMinutes,
    overnightDeductedMinutes,
    lunchDeductedMinutes,
    netActiveMinutes,
    formattedDuration,
    isWithinWorkingHours,
    currentWindowStatus
  };
}

/**
 * Calculates active counting duration for an IT Ticket starting from when an administrator assigned it.
 * If the ticket is not yet assigned by an administrator, the counter has not started.
 */
export function getTicketActiveDuration(
  ticket: ITTicket,
  nowDate: Date = new Date()
): {
  isAssigned: boolean;
  assignedAtDisplay: string;
  netActiveMinutes: number;
  formattedDuration: string;
  idleDeductedMinutes: number;
  statusText: string;
  timingDetails: ActiveWorkingTimeResult;
} {
  const hasAssignee = Boolean(
    ticket.assignedTo && 
    ticket.assignedTo !== 'Unassigned' && 
    ticket.assignedTo !== '-' && 
    ticket.assignedTo !== 'None' &&
    ticket.assignedTo.trim() !== ''
  );
  const isAssigned = Boolean(ticket.assignedAt || hasAssignee);

  if (!isAssigned) {
    return {
      isAssigned: false,
      assignedAtDisplay: 'Pending Assignment',
      netActiveMinutes: 0,
      formattedDuration: 'Pending Assignment',
      idleDeductedMinutes: 0,
      statusText: 'Waiting for Admin Assignment',
      timingDetails: {
        totalMinutes: 0,
        idleDeductedMinutes: 0,
        overnightDeductedMinutes: 0,
        lunchDeductedMinutes: 0,
        netActiveMinutes: 0,
        formattedDuration: '0m',
        isWithinWorkingHours: true,
        currentWindowStatus: 'WORKING_HOURS'
      }
    };
  }

  const startTime = ticket.assignedAt || ticket.startedAt || ticket.createdAt || new Date().toISOString();
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';
  const endTime = isClosed ? (ticket.resolvedAt || ticket.closedAt || ticket.updatedAt || nowDate) : nowDate;

  const timing = calculateActiveWorkingMinutes(startTime, endTime);

  return {
    isAssigned: true,
    assignedAtDisplay: ticket.assignedAt 
      ? new Date(ticket.assignedAt).toLocaleString() 
      : (ticket.createdAt || 'Assigned'),
    netActiveMinutes: timing.netActiveMinutes,
    formattedDuration: timing.formattedDuration,
    idleDeductedMinutes: timing.idleDeductedMinutes,
    statusText: isClosed 
      ? 'Completed' 
      : timing.currentWindowStatus === 'AFTER_HOURS' 
        ? 'Idle (5:00 PM - 8:00 AM Next Day)' 
        : timing.currentWindowStatus === 'LUNCH_BREAK' 
          ? 'Idle (12:00 PM - 1:00 PM Lunch)' 
          : 'Active Working Window (8AM-5PM)',
    timingDetails: timing
  };
}

/**
 * Saves support ticket to central Firestore database and creates alert notification for IT Admin
 */
export async function submitCentralSupportTicket(
  ticket: ITTicket,
  userProfile?: UserProfile | null
): Promise<ITTicket> {
  try {
    const ticketRef = doc(collection(db, 'support_tickets'), ticket.id);
    const ticketData = {
      ...ticket,
      requestorDepartment: userProfile?.department || 'General',
      requestorEmail: userProfile?.email || ticket.requestorEmail || 'user@centaurchem.com',
      syncedAt: new Date().toISOString()
    };

    await setDoc(ticketRef, ticketData, { merge: true });

    // Broadcast Admin Notification
    const notifRef = doc(collection(db, 'notifications'), `notif_${Date.now()}`);
    await setDoc(notifRef, {
      id: `notif_${Date.now()}`,
      type: 'new_ticket',
      title: `🚨 New Support Ticket: ${ticket.ticketNo}`,
      message: `${ticket.requestor} (${userProfile?.department || 'General'}) submitted "${ticket.title}" [${ticket.severity}]`,
      ticketId: ticket.id,
      createdAt: new Date().toISOString(),
      read: false,
      targetRole: 'ADMIN',
      targetEmail: 'arnoldcortina.cce.docs@gmail.com'
    });

    return ticketData;
  } catch (error) {
    console.warn('Central DB Sync Notice (Operating in fallback offline mode):', error);
    return ticket;
  }
}

/**
 * Saves batch imported tickets to central Firestore database so they persist across refreshes
 */
export async function submitBatchImportedSupportTickets(
  tickets: ITTicket[]
): Promise<ITTicket[]> {
  try {
    const savedTickets: ITTicket[] = [];
    for (const ticket of tickets) {
      const ticketRef = doc(collection(db, 'support_tickets'), ticket.id);
      const ticketData = {
        ...ticket,
        requestorEmail: ticket.requestorEmail || 'imported@centaurchem.com',
        syncedAt: new Date().toISOString()
      };
      await setDoc(ticketRef, ticketData, { merge: true });
      savedTickets.push(ticketData);
    }
    return savedTickets;
  } catch (error) {
    console.warn('Batch tickets save notice:', error);
    return tickets;
  }
}

/**
 * Updates a support ticket in central Firestore database
 */
export async function updateCentralSupportTicket(ticket: ITTicket): Promise<void> {
  try {
    const ticketRef = doc(collection(db, 'support_tickets'), ticket.id);
    await setDoc(ticketRef, {
      ...ticket,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Update ticket in DB notice:', error);
  }
}

/**
 * Deletes a ticket from central Firestore database by ID and ticket number
 */
export async function deleteCentralSupportTicket(ticketId: string, ticketNo?: string): Promise<void> {
  try {
    // 1. Direct document deletion
    const ticketRef = doc(collection(db, 'support_tickets'), ticketId);
    await deleteDoc(ticketRef);

    // 2. Also search and delete any document with matching ticketNo if provided
    if (ticketNo) {
      const q = query(collection(db, 'support_tickets'), where('ticketNo', '==', ticketNo));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        if (d.id !== ticketId) {
          await deleteDoc(d.ref);
        }
      }
    }
  } catch (error) {
    console.warn('Delete ticket from DB notice:', error);
  }
}

/**
 * Batch deletes multiple tickets from central Firestore database using atomic writeBatch
 */
export async function deleteBatchSupportTickets(
  ticketIds: string[],
  ticketNos?: string[]
): Promise<void> {
  try {
    if (ticketIds.length === 0) return;

    // Chunk size 400 to stay safely under Firestore's 500 operations batch limit
    const chunkSize = 400;
    for (let i = 0; i < ticketIds.length; i += chunkSize) {
      const chunk = ticketIds.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const id of chunk) {
        const ref = doc(collection(db, 'support_tickets'), id);
        batch.delete(ref);
      }
      await batch.commit();
    }

    // Also remove any documents that match ticketNos if specified
    if (ticketNos && ticketNos.length > 0) {
      const ticketNoSet = new Set(ticketNos);
      const snap = await getDocs(collection(db, 'support_tickets'));
      const extraDocIds: string[] = [];
      snap.docs.forEach(d => {
        const no = d.data().ticketNo;
        if (no && ticketNoSet.has(no) && !ticketIds.includes(d.id)) {
          extraDocIds.push(d.id);
        }
      });

      if (extraDocIds.length > 0) {
        for (let i = 0; i < extraDocIds.length; i += chunkSize) {
          const chunk = extraDocIds.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          for (const id of chunk) {
            batch.delete(doc(collection(db, 'support_tickets'), id));
          }
          await batch.commit();
        }
      }
    }
  } catch (error) {
    console.warn('Batch delete tickets from DB notice:', error);
  }
}
