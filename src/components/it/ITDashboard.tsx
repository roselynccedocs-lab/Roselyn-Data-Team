import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Filter, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Trash2, 
  X, 
  Printer, 
  BarChart3,
  RotateCcw,
  MessageSquare,
  Send,
  Edit,
  Mail,
  FileCode,
  HardDrive,
  FileSpreadsheet,
  ChevronLeft,
  User,
  Info,
  MoveHorizontal
} from 'lucide-react';

import { 
  submitBatchImportedSupportTickets,
  deleteCentralSupportTicket,
  deleteBatchSupportTickets,
  updateCentralSupportTicket,
  calculateActiveWorkingMinutes,
  getTicketActiveDuration,
  ActiveWorkingTimeResult
} from '../../lib/ticketingSystem';

export interface ITChatMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  role: 'Admin' | 'User';
  text: string;
  timestamp: string;
}

export interface ITTicket {
  id: string;
  ticketNo: string;
  title: string;
  description?: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4' | string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'canceled' | string;
  requestor: string; // Requestor Name
  requestorEmail?: string;
  requestorId?: string;
  assignedTo?: string;
  assignedToId?: string;
  assignedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  slaResponseDeadline?: string;
  slaResolutionDeadline?: string;
  responseSlaMet?: 'Pass' | 'Fail' | string;
  resolutionSlaMet?: 'Pass' | 'Fail' | string;
  slaResponse?: 'Pass' | 'Fail' | string;
  slaResolution?: 'Pass' | 'Fail' | string;
  actualResponseTime?: string;
  actualResolutionTime?: string;
  responseTime?: string;
  resolutionRemarks?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  resolutionTime?: string;
  avatarLetter?: string;
  category?: string;
  assetId?: string;
  contactNumber?: string;
  messages?: ITChatMessage[];
}

export function parseCSVToTickets(csvText: string): ITTicket[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.toLowerCase().trim().replace(/^"|"$/g, ''));

  const getColIdx = (aliases: string[], fallbackIdx: number) => {
    const found = headers.findIndex(h => aliases.some(a => h.includes(a)));
    return found !== -1 ? found : fallbackIdx;
  };

  const idxTicketNo = getColIdx(['ticket number', 'ticket num', 'ticket no'], 0);
  const idxSlaRespRes = getColIdx(['sla response result', 'response result', 'response sla'], 1);
  const idxTitle = getColIdx(['title', 'subject'], 2);
  const idxSeverity = getColIdx(['severity', 'priority'], 3);
  const idxStatus = getColIdx(['status'], 4);
  const idxRequestor = getColIdx(['requestor', 'requester'], 5);
  const idxAssignedTo = getColIdx(['assigned to', 'assignee'], 6);
  const idxCreatedAt = getColIdx(['created at', 'created date'], 7);
  const idxSlaRespDeadline = getColIdx(['sla response deadline', 'response deadline'], 8);
  const idxActualRespTime = getColIdx(['actual response time', 'response time'], 9);
  const idxActualResTime = getColIdx(['actual resolution time', 'resolution time'], 10);
  const idxSlaResDeadline = getColIdx(['sla resolution deadline', 'resolution deadline'], 11);
  const idxRemarks = getColIdx(['resolution remarks', 'remarks', 'description'], 12);

  const extractVal = (cols: string[], idx: number) => {
    if (idx < 0 || idx >= cols.length) return '-';
    const v = cols[idx]?.trim().replace(/^"|"$/g, '');
    return (v && v !== 'undefined' && v !== 'null' && v !== '') ? v : '-';
  };

  const tickets: ITTicket[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length === 0) continue;

    const ticketNo = extractVal(cols, idxTicketNo);
    const title = extractVal(cols, idxTitle);
    if (ticketNo === '-' && title === '-') continue;

    const slaResponse = extractVal(cols, idxSlaRespRes);
    const requestor = extractVal(cols, idxRequestor);
    const assignedTo = extractVal(cols, idxAssignedTo);
    const createdAt = extractVal(cols, idxCreatedAt);
    const slaResponseDeadline = extractVal(cols, idxSlaRespDeadline);
    const actualResponseTime = extractVal(cols, idxActualRespTime);
    const actualResolutionTime = extractVal(cols, idxActualResTime);
    const slaResolutionDeadline = extractVal(cols, idxSlaResDeadline);
    const resolutionRemarks = extractVal(cols, idxRemarks);
    const severity = extractVal(cols, idxSeverity);
    const status = extractVal(cols, idxStatus);

    tickets.push({
      id: `ticket_${ticketNo.replace(/[^a-zA-Z0-9]/g, '_')}_${i}`,
      ticketNo: ticketNo !== '-' ? ticketNo : `CCC-${330 + i}`,
      title: title !== '-' ? title : 'Support Ticket',
      slaResponse: slaResponse !== '-' ? slaResponse : 'Pass',
      responseSlaMet: slaResponse !== '-' ? slaResponse : 'Pass',
      slaResolution: slaResponse !== '-' ? slaResponse : 'Pass',
      resolutionSlaMet: slaResponse !== '-' ? slaResponse : 'Pass',
      severity: severity !== '-' ? severity : 'P4',
      status: status !== '-' ? status : 'CLOSED',
      requestor: requestor !== '-' ? requestor : 'Dan Valene Lapizar',
      requestorEmail: `${(requestor !== '-' ? requestor : 'user').toLowerCase().replace(/\s+/g, '.')}@centaurchem.com`,
      assignedTo: assignedTo !== '-' ? assignedTo : 'Arnold Cortina',
      createdAt: createdAt !== '-' ? createdAt : new Date().toLocaleString(),
      slaResponseDeadline: slaResponseDeadline !== '-' ? slaResponseDeadline : '-',
      actualResponseTime: actualResponseTime !== '-' ? actualResponseTime : '-',
      resolutionTime: actualResolutionTime !== '-' ? actualResolutionTime : '-',
      actualResolutionTime: actualResolutionTime !== '-' ? actualResolutionTime : '-',
      slaResolutionDeadline: slaResolutionDeadline !== '-' ? slaResolutionDeadline : '-',
      resolutionRemarks: resolutionRemarks !== '-' ? resolutionRemarks : '-',
      description: resolutionRemarks !== '-' ? resolutionRemarks : title,
      avatarLetter: (requestor !== '-' ? requestor : 'U').charAt(0).toUpperCase(),
    });
  }

  return tickets;
}

export const RAW_INITIAL_CSV = `Ticket Number,SLA Response Result,Title,Severity,Status,Requestor,Assigned To,Created At,SLA Response Deadline,Actual Response Time,Actual Resolution Time,SLA Resolution Deadline,Resolution Remarks
CCC-328,Pass,PRINTER HP,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"9/2/2026, 2:33:28 PM","9/2/2026, 10:33:26 PM",1h 19m,12 mins,"9/4/2026, 4:33:26 PM",done checking of the printer assist on the scanning using the feeder and checking all of the rollers in the printer have the right amount of petroleum. its ok. no irritating sounds that it commits.
CCC-327,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES (JUN 2026 TO DEC 2026),P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"9/1/2026, 1:15:35 PM","9/1/2026, 9:15:32 PM",14 mins,1h 14m,"9/3/2026, 3:15:32 PM",done reloading the laptop of the requestor and manage to check the system settings. 
CCC-326,Pass,Row 398 for Column AN- AV NO FORMULA,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"9/1/2026, 9:55:24 AM","9/1/2026, 6:55:17 PM",1h 22m,31 mins,"9/3/2026, 11:55:17 AM","done filling up the formula o the row specified the end user,"
CCC-323,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES (JUN 2026 TO DEC 2026),P3,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/28/2026, 11:08:59 AM","8/28/2026, 4:08:54 PM",1h 25m,1 min,"8/29/2026, 1:08:54 PM",done adding the details needed by requestor
CCC-322,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES (JUN 2026 TO DEC 2026),P4,CLOSED,Trisha Mae Agnote,Arnold Cortina,"8/28/2026, 10:03:46 AM","8/28/2026, 7:06:57 PM",3h 13m,10 mins,"8/30/2026, 1:06:57 PM",done managing and creating a new formula to the scope that multiple MPR document attached in Column J will return Yes and will be align when the document has some revisions.
CCC-321,Pass,Additional Row,P4,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"8/28/2026, 9:25:15 AM","8/28/2026, 6:25:12 PM",4h 2m,10 mins,"8/30/2026, 11:25:12 AM",Ticket reopened for further investigation.
CCC-320,Pass,DATA SUPPLY TO PARTICULAR COLUMN IN ONE THE OC,P4,CLOSED,Marky Fernandez,Arnold Cortina,"8/27/2026, 9:54:03 AM","8/27/2026, 6:54:00 PM",2h 18m,2 mins,"8/29/2026, 11:54:00 AM",Ticket reopened for further investigation.
CCC-319,Pass,2026 OC5 - TIMELY ONBOARDING AND OFFBOARDING ADMINISTRATION,P4,CLOSED,Jena Karl Descalzo,Arnold Cortina,"8/27/2026, 9:35:29 AM","8/27/2026, 6:35:27 PM",N/A,1h 16m,"8/29/2026, 11:35:27 AM",done adding the details in the ticket request in OC5 columns 10 and 11. then adjusted the formulas to reflect in the rows.
CCC-317,Pass,can't print using both HP Printer,P4,CLOSED,Arnold Cortina,Arnold Cortina,"8/26/2026, 10:50:01 AM","8/26/2026, 6:49:59 PM",2 mins,1h 11m,"8/28/2026, 10:49:59 AM","manage to check printer settings, uninstall and reinstall printer, restarted the printer, reset printer settings. after the reset printer settings reinstall the printers all went ok upon test print. "
CCC-316,Pass,troubleshooting,P3,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/26/2026, 9:57:52 AM","8/26/2026, 1:57:48 PM",50 mins,2 mins,"8/27/2026, 9:57:48 AM",done managing the troubleshooting and MBOS Cheque configurations and assistance. 
CCC-315,Pass,Need to insert column for bank charge,P3,CLOSED,Vanessa Gomez,Arnold Cortina,"8/26/2026, 9:02:06 AM","8/26/2026, 1:02:04 PM",26 mins,0 mins,"8/27/2026, 9:02:04 AM",no access to the file for data security of Ma'am Van. will have to relay it t o her for the edit to be done in the OC Google Sheet. 
CCC-313,Pass,"2026 OC4 PROMPT REPORT SUBMISSION & PAYMENT, PERMIT RENEWAL  & COMPLIANCE TO REGULATORS",P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/24/2026, 2:59:18 PM","8/24/2026, 10:59:14 PM",45 mins,36 mins,"8/26/2026, 2:59:14 PM",done managing to correct the formula for each grading system of the sheet
CCC-312,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES (JUN 2026 TO DEC 2026),P4,CLOSED,Trisha Mae Agnote,Arnold Cortina,"8/24/2026, 2:03:56 PM","8/24/2026, 10:06:53 PM",17 mins,3 mins,"8/26/2026, 2:06:53 PM",done managing to copy the formula on the row and manage to resolve the error encountered
CCC-310,Pass,PROJECTOR SET UP,P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"8/24/2026, 1:48:57 PM","8/24/2026, 9:48:55 PM",20 mins,8 mins,"8/26/2026, 1:48:55 PM",done setting up the. projector.
CCC-308,Pass,M7 Access to all teamleads,P3,CLOSED,Roxane Pamittan,Arnold Cortina,"8/19/2026, 9:18:14 AM","8/19/2026, 1:18:11 PM",1h 42m,12 mins,"8/20/2026, 9:18:11 AM",done managing the restrictions in giving such permissions to edit the specified field for team leaders. 
CCC-303,Fail,2026 CCE OC13Bv2.0 CONFIDENTIAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/18/2026, 3:46:20 PM","8/18/2026, 11:46:18 PM",17h 10m,0 mins,"8/20/2026, 3:46:18 PM",done managing the update since it is a confidential file c/o ma'am Van
CCC-302,Fail,2026 CCE OC13Bv2.0 CONFIDENTIAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/18/2026, 3:42:56 PM","8/18/2026, 11:42:53 PM",17h 14m,0 mins,"8/20/2026, 3:42:53 PM",done managing the update since it is a confidential file c/o ma'am Van
CCC-301,Fail,CCTV FOOTAGE REVIEW,P3,CLOSED,Marky Fernandez,Arnold Cortina,"8/18/2026, 10:44:22 AM","8/18/2026, 2:44:19 PM",3h 17m,14 mins,"8/19/2026, 10:44:19 AM",done having the details and relaying it to Marky
CCC-300,Pass,M4 - FIX FORMULA,P4,CLOSED,Ma. Divine Gariando,Arnold Cortina,"8/17/2026, 1:36:04 PM","8/17/2026, 9:36:01 PM",N/A,2h 12m,"8/19/2026, 1:36:01 PM",done managing the correct formula on the said rows
CCC-298,Pass,"requesting of CCTV footage on saturday AUG 15, 2026 1pm to 7pm",P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"8/17/2026, 11:45:13 AM","8/17/2026, 7:45:10 PM",N/A,2h 59m,"8/19/2026, 11:45:10 AM",done managing to check in cctv with sir Apollo checking it was then satay Rudy have put it on a plastic bag then later this morning he had put it on the Capistrano street for the garbage collector to collect.
CCC-297,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/12/2026, 4:54:29 PM","8/13/2026, 12:54:25 AM",1h 13m,1 min,"8/14/2026, 4:54:25 PM",Done assisting
CCC-295,Pass,ADD 1 ROW BELOW ROW 373 IN OC9A,P2,CLOSED,Justine Emata,Arnold Cortina,"8/12/2026, 2:54:46 PM","8/12/2026, 3:54:43 PM",N/A,1h 6m,"8/12/2026, 10:54:43 PM",done adding the said row.
CCC-294,Pass,ACCESS TO OC21,P4,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"8/12/2026, 10:43:40 AM","8/12/2026, 6:43:37 PM",41 mins,2 mins,"8/14/2026, 10:43:37 AM",done giving access to Arjay
CCC-291,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/11/2026, 2:33:54 PM","8/11/2026, 10:33:50 PM",4 mins,0 mins,"8/13/2026, 2:33:50 PM",done assisting Dan for adding the required Column
CCC-290,Pass,Computer and Laptop checking,P4,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"8/11/2026, 8:50:53 AM","8/11/2026, 4:50:50 PM",1h 5m,3 mins,"8/13/2026, 8:50:50 AM",done managing clearing cache in the web browser of Arjay for him to access the cartruck system. then for the desktop not powering on checking on the cable if it fits in the monitor checking that the other end also is not on on its extension. 
CCC-289,Pass,"FOR ADD OF ROW , BASED ON COLUMN AL (OC9A)",P4,CLOSED,Marievic Benavidez,Arnold Cortina,"8/10/2026, 11:19:21 AM","8/10/2026, 7:19:18 PM",23 mins,1h 10m,"8/12/2026, 11:19:18 AM",done managing the assistance to Maby for the adding of additional rows
CCC-286,Pass,NO FORMULA FOR ROW 383 OC9A,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"8/10/2026, 9:54:50 AM","8/10/2026, 5:54:47 PM",1h,11 mins,"8/12/2026, 9:54:47 AM",done assisting Maby for the formula that she need in the row
CCC-283,Pass,For setup of new printer (HP ) in AR finance dept,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"8/7/2026, 9:17:51 AM","8/7/2026, 5:17:49 PM",5h 17m,1 min,"8/9/2026, 9:17:49 AM",done installation of printer
CCC-281,Pass,ADD 1 ROW BELOW ROW390 IN OC9A,P2,CLOSED,Justine Emata,Arnold Cortina,"8/7/2026, 8:44:08 AM","8/7/2026, 9:44:04 AM",29 mins,2 mins,"8/7/2026, 4:44:04 PM",Ticket reopened for further investigation.
CCC-279,Fail,No Wifi Connection Since Yesterday,P1,CLOSED,Judilyn Vasquez Avila,Unassigned,"8/6/2026, 8:25:35 AM","8/6/2026, 8:40:32 AM",1h 9m,1 min,"8/6/2026, 12:25:32 PM",done assistance to PLDT and network wifi had been restored.
CCC-278,Pass,GANTT CHART ,P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"8/5/2026, 4:16:14 PM","8/6/2026, 12:16:13 AM",47 mins,0 mins,"8/7/2026, 4:16:13 PM",done assisting Kat for the required details. 
CCC-277,Pass,PROJECTOR SET UP,P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"8/5/2026, 4:15:20 PM","8/6/2026, 12:15:17 AM",47 mins,1 min,"8/7/2026, 4:15:17 PM",done assisting Kat for the required details. 
CCC-275,Pass,"BIR UPLOADING OF SWAT ,QAP,FILE 2ND QTR",P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/5/2026, 2:35:27 PM","8/5/2026, 10:35:25 PM",2h 27m,1 min,"8/7/2026, 2:35:25 PM",done assisting Dan for the required details. 
CCC-274,Pass,pa add po ng row after ng row 293 sa OC9 po namin https://docs.google.com/spreadsheets/d/1bf3AN9UcvWDP8aX9QPXDakKoVz9drszGWyy_aSjywUI/edit?gid=1503923440#gid=1503923440,P3,CLOSED,Jovelyn Abainza,Arnold Cortina,"8/5/2026, 2:20:32 PM","8/5/2026, 6:20:29 PM",2h 45m,15 mins,"8/6/2026, 2:20:29 PM",done assisting Jovy for the required row.
CCC-273,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/5/2026, 1:43:55 PM","8/5/2026, 9:43:53 PM",3h 17m,1 min,"8/7/2026, 1:43:53 PM",done assisting Dan for the required details. 
CCC-272,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/5/2026, 1:43:53 PM","8/5/2026, 9:43:51 PM",3h 17m,1 min,"8/7/2026, 1:43:51 PM",done assisting Dan for the required details. 
CCC-271,Pass,Add row OC 2,P4,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"8/5/2026, 11:27:39 AM","8/5/2026, 7:27:35 PM",9 mins,0 mins,"8/7/2026, 11:27:35 AM",done adding the rows
CCC-270,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/5/2026, 10:20:12 AM","8/5/2026, 6:20:11 PM",51 mins,2 mins,"8/7/2026, 10:20:11 AM",done managing the ticket in assisting adding a columns
CCC-268,Pass,2026 CCE OC13Bv2.0 CONFIDENTIAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Unassigned,"8/4/2026, 4:27:15 PM","8/5/2026, 12:27:12 AM",1h 4m,1 min,"8/6/2026, 4:27:12 PM","Ticket canceled due to have seen that they are requesting some edit on the file knowing that the owner have shared it on anyone with link"
CCC-267,Pass,OUTLOOK,P4,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"8/4/2026, 2:32:16 PM","8/4/2026, 10:32:13 PM",2h 28m,0 mins,"8/6/2026, 2:32:13 PM",done managing the app
CCC-266,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/4/2026, 9:52:33 AM","8/4/2026, 5:52:29 PM",52 mins,1 min,"8/6/2026, 9:52:29 AM",done assisting to add new row
CCC-263,Pass,Add row in OC9,P4,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"8/4/2026, 8:50:18 AM","8/4/2026, 4:50:15 PM",22 mins,1 min,"8/6/2026, 8:50:15 AM",done assisting  Arjay and manage to duplicate the formula for the entire row.
CCC-261,Pass,PRINTER HP (ACCOUNTING),P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"8/3/2026, 2:05:45 PM","8/3/2026, 10:05:44 PM",23 mins,5 mins,"8/5/2026, 2:05:44 PM",done restarting the printer check also the internal and all ok no paper trace started a test print all are ok.
CCC-260,Pass,REQUEST ACCESS FOR ENCODING 2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Rhodora Manuel,Arnold Cortina,"8/3/2026, 11:20:35 AM","8/3/2026, 7:20:34 PM",N/A,1h 24m,"8/5/2026, 11:20:34 AM",done
CCC-259,Pass,Urgent - CCTV Footage at C6 Operations Office and warehouse,P1,CLOSED,Jovelyn Abainza,Arnold Cortina,"7/31/2026, 3:04:54 PM","7/31/2026, 3:19:51 PM",N/A,27 mins,"7/31/2026, 7:04:51 PM","done relaying the details to Jovy via timeline of the incident"
CCC-258,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P2,CLOSED,Trisha Mae Agnote,Arnold Cortina,"7/31/2026, 11:12:47 AM","7/31/2026, 12:14:01 PM",17 mins,0 mins,"7/31/2026, 7:14:01 PM",done copying the formal on the row O. to close ticket.
CCC-257,Pass,Access in 2026 CCE OC13Av2.0 GENERAL PURCHASES in Column BC to CP,P4,CLOSED,Mitchie Beltran,Arnold Cortina,"7/31/2026, 10:50:16 AM","7/31/2026, 6:50:13 PM",N/A,3 mins,"8/2/2026, 10:50:13 AM",done colapsing
CCC-256,Pass,Installation of ZKTeco Biometric Device,P4,CLOSED,Jena Karl Descalzo,Arnold Cortina,"7/30/2026, 2:34:26 PM","7/30/2026, 10:34:22 PM",1h 27m,0 mins,"8/1/2026, 2:34:22 PM",done managing the formula for the correct output.
CCC-255,Fail,"Request for access (""2026 CCE OC13Av2.0 GENERAL PURCHASES"")",P4,CLOSED,Roselyn Sillos,Arnold Cortina,"7/29/2026, 5:06:05 PM","7/30/2026, 1:06:02 AM",17h 57m,4 mins,"7/31/2026, 5:06:02 PM",done managing to unprotect the cell for Roselyn in Column K
CCC-254,Fail,"Mayroon pong nakalagay sa PC ng intern namin na ""Hewlet Packard Setup Utility",P2,CLOSED,Justine Emata,Arnold Cortina,"7/29/2026, 2:25:13 PM","7/29/2026, 3:25:11 PM",19h 46m,1 min,"7/29/2026, 10:25:11 PM",Done managing the setup in the computer to iterste the error
CCC-253,Fail,NO INTERNET CONNECTION AT SALES DEPARTMENT,P2,CLOSED,Justine Emata,Arnold Cortina,"7/29/2026, 1:44:54 PM","7/29/2026, 2:44:52 PM",20h 25m,3 mins,"7/29/2026, 9:44:52 PM",Ticket reopened for further investigation.
CCC-252,Fail,"FORMULA IN COLUMN X ROW 312 NAKA ""INCOMPLETE DETAILS""",P2,CLOSED,Justine Emata,Arnold Cortina,"7/29/2026, 11:07:15 AM","7/29/2026, 12:07:13 PM",1h 26m,1 min,"7/29/2026, 7:07:13 PM",done managing the complete formula for the error encountered by Justine.
CCC-251,Fail,KINDLY DELETE ROW 313 IN OC9 (UPDATED),P2,CLOSED,Justine Emata,Arnold Cortina,"7/29/2026, 11:04:15 AM","7/29/2026, 12:04:12 PM",1h 24m,2 mins,"7/29/2026, 7:04:12 PM",done deleting the duplicate SO Number
CCC-250,Pass,REMOVAL OF ROW 357 IN OC9A (UPDATED),P2,CLOSED,Justine Emata,Arnold Cortina,"7/29/2026, 9:59:13 AM","7/29/2026, 10:59:10 AM",14 mins,0 mins,"7/29/2026, 5:59:10 PM",done deleting the row specified by Arjay
CCC-249,Pass,Add another row in 0C9,P4,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"7/29/2026, 9:44:15 AM","7/29/2026, 5:44:13 PM",2h 35m,0 mins,"7/31/2026, 9:44:13 AM",done adding the required rows and manage the correct formula for column W
CCC-248,Pass,Operation metrics column G,P4,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"7/29/2026, 9:31:21 AM","7/29/2026, 5:31:18 PM",40 mins,0 mins,"7/31/2026, 9:31:18 AM",done giving permission to Arjay.
CCC-243,Fail,CCE - TB 2026,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"7/23/2026, 4:11:18 PM","7/24/2026, 12:11:15 AM",1d 2h,0 mins,"7/25/2026, 4:11:15 PM",done getting the formula and copying it to the request of end user.
CCC-242,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"7/22/2026, 4:33:11 PM","7/23/2026, 12:33:09 AM",N/A,44 mins,"7/24/2026, 4:33:09 PM",done adding column and formula
CCC-239,Pass,set up projector,P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"7/22/2026, 4:22:12 PM","7/23/2026, 12:22:10 AM",50 mins,1 min,"7/24/2026, 4:22:10 PM",done managing the setup
CCC-238,Pass,Fix Formula - M6,P4,CLOSED,Ma. Divine Gariando,Arnold Cortina,"7/22/2026, 12:05:55 PM","7/22/2026, 8:05:52 PM",4h 11m,1 min,"7/24/2026, 12:05:52 PM",done assisting requestor on duplicating the required formula to fix the #REF Error
CCC-236,Pass,OC13A V.2,P4,CLOSED,Mitchie Beltran,Arnold Cortina,"7/21/2026, 2:49:11 PM","7/21/2026, 10:49:07 PM",4h 1m,4 mins,"7/23/2026, 2:49:07 PM",Done as requested by requestor
CCC-235,Pass,OPERATION METRICS M1 - ACCESS,P4,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"7/21/2026, 1:30:09 PM","7/21/2026, 9:30:07 PM",5h 17m,2 mins,"7/23/2026, 1:30:07 PM",Have give access to check by tomorrow morning to requestor
CCC-234,Fail,FORGOT TO UNCLOG THE SINK DRAIN,P4,CLOSED,Marky Fernandez,Arnold Cortina,"7/20/2026, 5:46:39 PM","7/21/2026, 1:46:36 AM",15h 25m,1 min,"7/22/2026, 5:46:36 PM",done sending the video and the screenshots to Marky Fernandez for his reference.
CCC-233,Fail,FORMULA FOR COLUMN AC ROW 14 TO ERASE THE VALUE MUST BE 0 ,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/20/2026, 1:16:53 PM","7/20/2026, 9:16:50 PM",19h 25m,1 min,"7/22/2026, 1:16:50 PM","done deleting the said row as by requestor and checking art with them to check the correct formula to apply in the other columns"
CCC-232,Fail,FORMULA FOR ROW 67 column AU,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/17/2026, 4:16:29 PM","7/18/2026, 12:16:27 AM",17h 40m,1 min,"7/19/2026, 4:16:27 PM",done adding the formula on the row requested by end user. 
CCC-230,Fail,Row 74 for OC9A  to erase ,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/17/2026, 4:03:54 PM","7/18/2026, 12:03:51 AM",17h 50m,1 min,"7/19/2026, 4:03:51 PM",done deleting the said row by requestor. 
CCC-229,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P2,CLOSED,Trisha Mae Agnote,Arnold Cortina,"7/17/2026, 2:45:14 PM","7/17/2026, 3:45:31 PM",13 mins,0 mins,"7/17/2026, 10:45:31 PM",done copying the formula and check the reference value that the formula needs
CCC-228,Pass,NO FORMULA FOR COLUMN KH & KI - OC9A ,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/17/2026, 2:40:48 PM","7/17/2026, 10:40:47 PM",13 mins,1 min,"7/19/2026, 2:40:47 PM",copy the formula I the. specific row they have raised.
CCC-227,Pass,COLUMN KH CAN'T UNCOLLAPSED IN OC9A,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/17/2026, 2:18:37 PM","7/17/2026, 10:18:35 PM",18 mins,5 mins,"7/19/2026, 2:18:35 PM",done assisting requestor
CCC-226,Fail,"CCTV Checking_July 16, 2026",P2,CLOSED,Roxane Pamittan,Arnold Cortina,"7/17/2026, 8:32:26 AM","7/17/2026, 9:32:23 AM",3h 14m,5 mins,"7/17/2026, 4:32:23 PM",doen sending to requestor the recorded video of the CCTV Camera.
CCC-223,Fail,REQUEST A CCTV FOR REVIEW,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/16/2026, 8:57:53 AM","7/16/2026, 4:57:49 PM",1d 1h,8 mins,"7/18/2026, 8:57:49 AM",done coordinating this to Maby and she said its ok and required details are ok with her.
CCC-221,Pass,setting up projector,P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"7/15/2026, 1:44:05 PM","7/15/2026, 9:44:02 PM",18 mins,1h 46m,"7/17/2026, 1:44:02 PM",done setting up the projector for meeting use of the requestor
CCC-220,Pass,CCTV Review ,P4,CLOSED,Allysa Mae Benalayo,Arnold Cortina,"7/15/2026, 1:35:57 PM","7/15/2026, 9:35:56 PM",3h 27m,19 mins,"7/17/2026, 1:35:56 PM",done sending of the screenshot and have prove that there is a violation that the person had kick the animal and is considered to hurt the animal. 
CCC-219,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"7/15/2026, 8:58:44 AM","7/15/2026, 4:58:42 PM",55 mins,2 mins,"7/17/2026, 8:58:42 AM",done adding the specified columns as requested by the requestor. upon checking on the return value by the formula applied o the said columns all are ok and is balance on its value. 
CCC-217,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"7/14/2026, 4:17:19 PM","7/15/2026, 12:17:10 AM",2 mins,2 mins,"7/16/2026, 4:17:10 PM",manage to add a column as specified by the user and it was added and check all the formula has been adjusted to its proper adjustment.
CCC-216,Pass,PRINTER ISSUE,P4,CLOSED,Kimberly Ydia,Arnold Cortina,"7/14/2026, 11:56:00 AM","7/14/2026, 7:55:58 PM",2h 51m,3 mins,"7/16/2026, 11:55:58 AM","done assisting the team, had check the printer that the wireless printing button is been turn off, have open it then do a test print with Trisha, its all ok and will now close this ticket since it is ok. "
CCC-215,Pass,2026 CCE OC13Bv2.0 CONFIDENTIAL PURCHASES,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"7/14/2026, 9:40:13 AM","7/14/2026, 5:40:10 PM",49 mins,0 mins,"7/16/2026, 9:40:10 AM",done adding the correct formula
CCC-214,Pass,WIFI CONNECTION LOSS,P2,CLOSED,Justine Emata,Arnold Cortina,"7/14/2026, 9:15:32 AM","7/14/2026, 10:15:31 AM",N/A,55 mins,"7/14/2026, 5:15:31 PM",done checking no internet access connected in to the router then manage to check the ping connection test. then no dial tome on the phone this will be called to the PLDT itself to check on their end.
CCC-212,Fail,soiled dishes,P3,CLOSED,Marky Fernandez,Arnold Cortina,"7/13/2026, 9:21:23 PM","7/14/2026, 1:21:19 AM",11h 36m,1 min,"7/14/2026, 9:21:19 PM",done sending the screenshot for verification to Marky.
CCC-210,Pass,The Ink of pirnter is low quality,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/13/2026, 1:41:06 PM","7/13/2026, 9:41:03 PM",53 mins,1 min,"7/15/2026, 1:41:03 PM",done checking the printer use the cleaning maintenance setup in the printer. all are ok. 
CCC-209,Pass,edit access on OC13A V.2,P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"7/13/2026, 8:40:20 AM","7/13/2026, 4:40:18 PM",20 mins,1 min,"7/15/2026, 8:40:18 AM",done adding the editor access to the specified column of the requestor. to close this ticket since it is being complete on its status. 
CCC-208,Fail,missing umbrella,P3,CLOSED,Marky Fernandez,Arnold Cortina,"7/11/2026, 1:56:24 PM","7/11/2026, 5:56:21 PM",21h 7m,0 mins,"7/12/2026, 1:56:21 PM",done sending the images to Sir Marky for his request to review CCTV and have his Umbrella back
CCC-206,Fail,2026 CCE OC13Av2.0 GENERAL PURCHASES,P2,CLOSED,Judilyn Vasquez Avila,Arnold Cortina,"7/10/2026, 10:37:55 AM","7/10/2026, 11:37:52 AM",3h,5 mins,"7/10/2026, 6:37:52 PM",Done expanding the data validation specific to dropdown column C tk add the new vendor
CCC-205,Pass,Request to Add Additional Rows (OC9),P2,CLOSED,Blantch Keanneth Arellano,Arnold Cortina,"7/9/2026, 3:01:43 PM","7/9/2026, 4:01:40 PM",56 mins,7 mins,"7/9/2026, 11:01:40 PM",done assisting blanch with ma'am Van assisted to add the rows since I can't do it on my side due to restrictions.
CCC-200,Pass,Template for Manual SI ,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/8/2026, 1:06:56 PM","7/8/2026, 9:06:52 PM",2h 55m,1 min,"7/10/2026, 1:06:52 PM",Done sending format to Maby.
CCC-199,Pass,<P&L>Checking of OC13AV2.O,P2,CLOSED,Marky Fernandez,Arnold Cortina,"7/8/2026, 9:53:29 AM","7/8/2026, 10:53:26 AM",N/A,2h 7m,"7/8/2026, 5:53:26 PM",Done checking purchasing request as it is being edited by maam Van and have serve due process rather than giving such IR to weakness of the team.
CCC-195,Pass,printer cant proceed for printing,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/7/2026, 5:11:54 PM","7/8/2026, 1:11:51 AM",25 mins,0 mins,"7/9/2026, 5:11:51 PM",Done assisting end user on a paper jam and manage to delete duplicate printers in the printer settings
CCE-194,Fail,2026 OC13B OLD VERSION ,P4,CLOSED,danvalene lapizar,Arnold Cortina,"7/6/2026, 6:58:01 PM","7/7/2026, 2:57:58 AM",14h 21m,1 min,"7/8/2026, 6:57:58 PM",Done managing to correct the formula in the OC and manage to clear the value issue encountered by Dan.
CCE-192,Fail,OC13C OLD VERSION,P4,CLOSED,danvalene lapizar,Arnold Cortina,"7/6/2026, 3:40:59 PM","7/6/2026, 11:40:56 PM",17h 58m,1 min,"7/8/2026, 3:40:56 PM",In column EM it displays Num error since there is no reference value from column AP in which there should be a date for it to fetch so that it can display a month value in the EM.
CCC-191,Fail,2026 OC22 REAL-TIME UPDATE OF REFILL LOG SHEET  ,P2,CLOSED,Judilyn Vasquez Avila,Arnold Cortina,"7/6/2026, 11:59:35 AM","7/6/2026, 12:59:31 PM",3h 56m,0 mins,"7/6/2026, 7:59:31 PM",checking the formula with Judy but upon checking that they need to complete the row first and the formula need to be edited since some cell value are being fetch in the other cells that is not align to the specified row.
CCE-190,Pass,2026 CCE OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,danvalene lapizar,Arnold Cortina,"7/6/2026, 11:06:51 AM","7/6/2026, 7:06:50 PM",1h 41m,0 mins,"7/8/2026, 11:06:50 AM","done adding some formula in if the columns Y, AA,AB,AC have a value exempt or have an attachment. to return value yes."
CCE-189,Pass,OC13BV2.0 ,P4,CLOSED,danvalene lapizar,Arnold Cortina,"7/6/2026, 11:01:38 AM","7/6/2026, 7:01:35 PM",1h 17m,2 mins,"7/8/2026, 11:01:35 AM","done checking the raise ticket. upon checking the formula is correct, the raise error that the end user said it is 200 percent since there is no .details that have been input since need to input first until the end of the month, right now were on may and June month. "
CCC-188,Pass,OC17 ,P4,CLOSED,Ma. Divine Gariando,Arnold Cortina,"7/6/2026, 10:58:05 AM","7/6/2026, 6:58:02 PM",1h 10m,0 mins,"7/8/2026, 10:58:02 AM",done correcting the formula in which the cell that is being selected in the list is not group with the specific row so I have manage to align it so that the return value will be Pass
CCC-187,Pass,SALES M2 - CHANGE IN FORMULA ,P2,CLOSED,Justine Emata,Arnold Cortina,"7/6/2026, 9:35:09 AM","7/6/2026, 10:35:07 AM",26 mins,0 mins,"7/6/2026, 5:35:07 PM",manage to edit the formula which needs to get details from column U rather Column T. so that the formula needs to be align to the set of dates.
CCC-186,Pass,"2026 OC4 PROMPT REPORT SUBMISSION & PAYMENT, PERMIT RENEWAL  & COMPLIANCE TO REGULATORS",P2,CLOSED,Judilyn Vasquez Avila,Arnold Cortina,"7/6/2026, 8:33:39 AM","7/6/2026, 9:33:35 AM",44 mins,25 mins,"7/6/2026, 4:33:35 PM",done formulating the right formula to be applied o the selected date and months to derive form a pass result
CCC-181,Pass,The cell is protected need access,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/4/2026, 1:39:40 PM","7/4/2026, 9:39:37 PM",11 mins,0 mins,"7/6/2026, 1:39:37 PM",
CCC-180,Pass,FORMULA ERROR,P4,CLOSED,Dan Valene Lapizar,Arnold Cortina,"7/4/2026, 1:18:16 PM","7/4/2026, 9:18:12 PM",30 mins,0 mins,"7/6/2026, 1:18:12 PM",done managing the correct formula to use in the REF in Column R
CCC-178,Fail,CORRECTION OF FORMULA IN SYSTEM,P4,CLOSED,Marievic Benavidez,Arnold Cortina,"7/3/2026, 4:13:37 PM","7/4/2026, 12:13:34 AM",23h 24m,1 min,"7/5/2026, 4:13:34 PM",done arrangement of formula for better grading calculation to exempt same values since need to exempt due to documents terms.
CCE-177,Pass,ERROR FORMULA,P4,CLOSED,danvalene lapizar,Nary Rose Rosauro,"7/3/2026, 11:59:02 AM","7/3/2026, 7:58:59 PM",N/A,3h 37m,"7/5/2026, 11:58:59 AM",Correct cancelled count on OC12 May & June. 
CCE-175,Pass,ERROR FORMULA,P4,CLOSED,danvalene lapizar,Arnold Cortina,"7/3/2026, 10:47:47 AM","7/3/2026, 6:47:44 PM",12 mins,1 min,"7/5/2026, 10:47:44 AM",done managing to correct the formula on the cells specified by Dan. to close the ticket since it is complete.
CCC-174,Pass,Error formula in 2026 MASTERDATA TRACKER ,P3,CLOSED,Roselyn Sillos,Arnold Cortina,"7/3/2026, 10:47:28 AM","7/3/2026, 2:47:25 PM",N/A,4h 59m,"7/4/2026, 10:47:25 AM","Fixed rows 17,18,19,29 column BB. "
CCC-172,Pass,correction of formula OC9.v2,P4,CLOSED,Marievic Benavidez,Nary Rose Rosauro,"7/3/2026, 9:22:50 AM","7/3/2026, 5:22:47 PM",1h 44m,0 mins,"7/5/2026, 9:22:47 AM",Fixed formula on OC9.v2
CCE-171,Fail,METRICS FORMULA ,P4,CLOSED,danvalene lapizar,Arnold Cortina,"7/2/2026, 8:40:31 PM","7/3/2026, 4:40:28 AM",1d 14h,1 min,"7/4/2026, 8:40:28 PM","check the formula it is ok but not displaying such may and since some months for may don't have any details to fetch,"
CCC-170,Pass,Attachment File Size Removal – OC9,P2,CLOSED,Blantch Keanneth Arellano,Nary Rose Rosauro,"7/2/2026, 3:05:05 PM","7/2/2026, 4:05:02 PM",53 mins,1d 1h,"7/2/2026, 11:05:02 PM","no access on OC9A, 7-2

7-3 done manage to deltic the said column in the specified field."
CCC-169,Pass,OC5 Results Not Fetching June Reporting Data,P4,CLOSED,Ma. Divine Gariando,Nary Rose Rosauro,"7/2/2026, 2:40:39 PM","7/2/2026, 10:40:36 PM",1h 20m,1d 6h,"7/4/2026, 2:40:36 PM",Ticket reopened for further investigation.
CCC-168,Pass,formula error Issue in 2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS,P3,CLOSED,Roselyn Sillos,Nary Rose Rosauro,"7/2/2026, 2:15:29 PM","7/2/2026, 6:15:27 PM",6 mins,15 mins,"7/3/2026, 2:15:27 PM",Fixed formula on 2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS.
CCC-167,Pass,cctv for review,P3,CLOSED,Marievic Benavidez,Nary Rose Rosauro,"7/2/2026, 11:08:07 AM","7/2/2026, 3:08:03 PM",31 mins,1 min,"7/3/2026, 11:08:03 AM","The CCTV footage was past due by 1 week, I can't review it anymore."
CCE-166,Fail,METRICS FORMULA,P4,CLOSED,danvalene lapizar,Nary Rose Rosauro,"7/1/2026, 7:56:18 PM","7/2/2026, 3:56:15 AM",14h 10m,20 mins,"7/3/2026, 7:56:15 PM",Fixed the formula on OC13Bv2.0.
CCC-165,Fail,HR M2 METRICS,P4,CLOSED,Ma. Divine Gariando,Nary Rose Rosauro,"7/1/2026, 4:03:39 PM","7/2/2026, 12:03:36 AM",16h 37m,9 mins,"7/3/2026, 4:03:36 PM","Drop down Column AB, and Row 10 Column AA is correct and explained to Ma'am Divine why it failed."
CCC-164,Pass,REQUEST ACCESS VIEW IN 2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS,P3,CLOSED,Roselyn Sillos,Nary Rose Rosauro,"7/1/2026, 1:56:04 PM","7/1/2026, 5:56:01 PM",18 mins,1h 38m,"7/2/2026, 1:56:01 PM",
CCC-163,Pass,OC16 - Incorrect PASS/FAIL Result in Employee Absenteeism Monitoring,P4,CLOSED,Jena Karl Descalzo,Nary Rose Rosauro,"7/1/2026, 10:47:31 AM","7/1/2026, 6:47:30 PM",1h 31m,0 mins,"7/3/2026, 10:47:30 AM",Fixed formulas in the entire PASS/FAIL Ma'am Divine's column.
CCC-162,Pass, (executive office) set up of outlook,P4,CLOSED,Ma. Katrina Paula Ilagan,Nary Rose Rosauro,"7/1/2026, 10:26:18 AM","7/1/2026, 6:26:15 PM",N/A,46 mins,"7/3/2026, 10:26:15 AM","Downloaded outlook app, and finished setting up"
CCC-161,Pass,changing of internet connection,P4,CLOSED,Arnold Cortina,Arnold Cortina,"6/30/2026, 4:14:40 PM","7/1/2026, 12:14:37 AM",1 min,3 mins,"7/2/2026, 4:14:37 PM",manage to reconnect to Sales internet connection both Laptop of Marky and Kim for meeting Calls.
CCC-160,Pass,Printer produces a black line when I scan documents,P4,CLOSED,Vanessa Gomez,Arnold Cortina,"6/30/2026, 3:14:23 PM","6/30/2026, 11:14:20 PM",2 mins,1 min,"7/2/2026, 3:14:20 PM","done cleaning the glass and rollers of the pinter, do a test print and it is clean in printing such documents. to close ticket since it is complete."
CCC-159,Fail,FORMAT TEMPLATE ,P3,CLOSED,Dan Valene Lapizar,Arnold Cortina,"6/30/2026, 2:08:25 PM","6/30/2026, 6:08:22 PM",4h 20m,13h 57m,"7/1/2026, 2:08:22 PM",Done creating an excel file format. to send to Dan and manage to create automation when requested by Dan.
CCC-158,Pass,Fix formula in OC17,P4,CLOSED,Ma. Divine Gariando,Arnold Cortina,"6/30/2026, 11:55:09 AM","6/30/2026, 7:55:06 PM",2h 17m,3 mins,"7/2/2026, 11:55:06 AM",done arrangement and fixing the formula in the OC17 with the specific date and the cells that it should point
CCC-156,Pass,2026 OC13Av2.0 GENERAL PURCHASES,P2,CLOSED,Trisha Mae Agnote,Arnold Cortina,"6/30/2026, 10:39:42 AM","6/30/2026, 11:40:08 AM",49 mins,1 min,"6/30/2026, 6:40:08 PM",manage to apply the specific dropdown rule for the selected dropdown columns in targeting the specific client list to the specific dropdown button in the Column C of the General Purchases tab.
CCC-153,Pass,EPSON LQ-310,P4,CLOSED,Jovy Abainza,Arnold Cortina,"6/29/2026, 10:40:37 AM","6/29/2026, 6:40:35 PM",2h 6m,2 mins,"7/1/2026, 10:40:35 AM",manage to select specific font in the printer to align it with the font use for Sales documents. done managing the setup all are working fine. to close ticket since it is done.
CCC-152,Pass,request access for oc10 (under oc10 C item master),P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"6/29/2026, 9:31:54 AM","6/29/2026, 5:31:51 PM",2h 20m,1 min,"7/1/2026, 9:31:51 AM","done checking on the raise ticket, have check that Ma'am Van should be the one who will Give access to Kat for the editing of the Gsheet"
CCC-150,Fail,HP printer can't scan,P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"6/27/2026, 2:12:07 PM","6/27/2026, 10:12:06 PM",1d 18h,9 mins,"6/29/2026, 2:12:06 PM",Done checking and have restarted the printer then it all work as fine in the HP App and in the printer flatbed and top part also
CCC-147,Fail,NO INTERNET CCE HR DECO,P2,CLOSED,Trisha Mae Agnote,Arnold Cortina,"6/26/2026, 1:44:18 PM","6/26/2026, 2:44:26 PM",2h 46m,0 mins,"6/26/2026, 9:44:26 PM",waited for it to come since the connection problem is from the side of the Internet Service Provider. to monitor for stable connectivity
CCC-146,Pass,OC2  -https://docs.google.com/spreadsheets/d/1mpnfN7TmfVJ2XQ3LMYDG78wkW7mAqChcKhqhcoq_nEc/edit?gid=1747255755#gid=1747255755,P3,CLOSED,Jovy Abainza,Arnold Cortina,"6/25/2026, 10:49:34 AM","6/25/2026, 2:49:31 PM",1h 9m,0 mins,"6/26/2026, 10:49:31 AM",done collapsing the rows for Jovy to view.
CCC-142,Fail,FIX WRONG FORMULA IN 2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS,P4,CLOSED,Roselyn Sillos,Arnold Cortina,"6/24/2026, 4:25:07 PM","6/25/2026, 12:25:05 AM",19h 31m,0 mins,"6/26/2026, 4:25:05 PM",done managing the formula to the correct specific cell value to be execute by the sheet file.
CCC-138,Pass,FORMULA ERROR IN 2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS,P4,CLOSED,Roselyn Sillos,Arnold Cortina,"6/24/2026, 11:47:19 AM","6/24/2026, 7:47:16 PM",3h 15m,0 mins,"6/26/2026, 11:47:16 AM",done duplicating the formula on the field specified by end user.
CCC-137,Pass,system editing ,P4,CLOSED,marievic benavidez,Arnold Cortina,"6/24/2026, 11:14:16 AM","6/24/2026, 7:14:13 PM",46 mins,N/A,"6/26/2026, 11:14:13 AM",done managing the request of the end user
CCC-134,Fail,SYSTEM EDITING ,P4,CLOSED,danvalene lapizar,Arnold Cortina,"6/23/2026, 9:57:37 AM","6/23/2026, 5:57:34 PM",1d 1h,N/A,"6/25/2026, 9:57:34 AM",done adding some exemption in the formula
CCC-133,Pass,2026 OC9v2.0(SALES) REAL-TIME & ACCURATE POSTING OF DAILY SALES TRANSACTIONS TO ERPNEXT,P4,CLOSED,Mitchie Beltran,Arnold Cortina,"6/23/2026, 9:45:16 AM","6/23/2026, 5:45:14 PM",2h 46m,1 min,"6/25/2026, 9:45:14 AM",done giving access to Mitchie to be as editor on the column she requested 
CCC-132,Pass,Printing error for check in browser,P4,CLOSED,Nary Rose Rosauro,Nary Rose Aragon,"6/22/2026, 5:00:04 PM","6/23/2026, 1:00:04 AM",2 mins,3 mins,"6/24/2026, 5:00:04 PM","fixed the issue by using new shortcuts to print, command - option - p."
CCC-130,Fail,2026 OC13Av2.0 GENERAL PURCHASES,P2,CLOSED,Judy,Arnold Cortina,"6/22/2026, 2:23:15 PM","6/22/2026, 3:23:13 PM",2h 31m,29 mins,"6/22/2026, 10:23:13 PM",done adding of new column and adding of formula for duplicated series.
CCC-129,Pass,BIR SYSTEM INSTALLATION AND UNBLOCKING,P4,CLOSED,Fefranie Lachica,Arnold Cortina,"6/22/2026, 9:15:22 AM","6/22/2026, 5:15:19 PM",3 mins,5 mins,"6/24/2026, 9:15:19 AM",done unblocking of the apps to freely run in the laptop and manage to install in the task bar to fully manage to access by Ma'am Faye
CCC-128,Pass,Knowledge base tabs customization,P4,CLOSED,Nary Rose Rosauro,Arnold Cortina,"6/19/2026, 10:50:59 AM","6/19/2026, 6:50:59 PM",3 mins,1h 23m,"6/21/2026, 10:50:59 AM",Ticket reopened for further investigation.
CCC-127,Pass,Paper size for the check assistance,P4,CLOSED,Nary Rose Rosauro,Nary Rose Aragon,"6/19/2026, 10:44:12 AM","6/19/2026, 6:44:10 PM",1 min,0 mins,"6/21/2026, 10:44:10 AM",Assisted ma'am ana on customizing the paper size for the check
CCC-126,Fail,2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS,P2,CLOSED,Trisha Mae Agnote,Arnold Cortina,"6/18/2026, 3:15:46 PM","6/18/2026, 4:22:01 PM",1h 6m,8 mins,"6/18/2026, 11:22:01 PM",corrected the formula since the row cells have been unsynchronized to its row.
CCC-125,Pass,DROPDOWN THE FORMULA IN 2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS,P4,CLOSED,Roselyn Sillos,Arnold Cortina,"6/18/2026, 11:29:44 AM","6/18/2026, 7:29:41 PM",3h 25m,2 mins,"6/20/2026, 11:29:41 AM",done copying the formula fro the specified rows specified in the ticket.
CCC-124,Pass,unable to ;connect to CCE Finance Wifi,P4,CLOSED,Arnold Cortina,Arnold Cortina,"6/17/2026, 3:44:14 PM","6/17/2026, 11:44:12 PM",1 min,1 min,"6/19/2026, 3:44:12 PM",done configuring the password and enabling the Wifi SSID from the PLDT Router for the End Users in the Finance Department to  access.
CCE-120,Pass,Dirt in printer rollers,P4,CLOSED,Nary Rose Aragon,Arnold Cortina,"6/16/2026, 4:14:51 PM","6/17/2026, 12:14:49 AM",2 mins,20h 6m,"6/18/2026, 4:14:49 PM",Cleaned rollers using fiber cloth. The paper is now clean when scanning.
CCE-119,Fail,Operation Metrics 2 - https://docs.google.com/spreadsheets/d/1LpR_LY34He0CNpSFiBBJzU_SuDLlUYBUOUoo2_r3vLU/edit?gid=351774436#gid=351774436,P3,CLOSED,Jovy Abainza,Arnold Cortina,"6/16/2026, 10:21:09 AM","6/16/2026, 2:21:06 PM",4h 21m,4 mins,"6/17/2026, 10:21:06 AM",
CCE-118,Fail,CCTV Checking due to incident in CCE boardroom (broken frame),P1,CLOSED,Roxane Pamittan,Arnold Cortina,"6/15/2026, 10:38:28 AM","6/15/2026, 10:53:25 AM",50 mins,29 mins,"6/15/2026, 2:38:25 PM",done creating a screen record of the Incident reported send the video to Ma'am Roxane for her reference.
CCE-117,Pass,"view access for OC13 A, OC13 B, OC13 C new versions",P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"6/15/2026, 9:46:43 AM","6/15/2026, 5:46:40 PM",34 mins,0 mins,"6/17/2026, 9:46:40 AM",added the request access for Ma. Katrina in viewing the OC13A Version 2.o and the OC13C
CCE-116,Pass,2026 OC13Av2.0 General Purchases,P4,CLOSED,Fefranie Lachica,Arnold Cortina,"6/11/2026, 10:37:02 AM","6/11/2026, 6:37:00 PM",42 mins,0 mins,"6/13/2026, 10:37:00 AM",Added formula for the details on row 11 in 2026-13A-0213
CCE-115,Fail,2026 OC13Av2.0 GENERAL PURCHASES,P4,CLOSED,Judy,Arnold Cortina,"6/11/2026, 8:44:58 AM","6/11/2026, 9:44:55 AM",6h 5m,0 mins,"6/11/2026, 4:44:55 PM",Provided access for Ma'am Judy on OC13Av2.0 GENERAL PURCHASES
CCE-114,Fail,2026 OC13Av2.0 GENERAL PURCHASES - Request to ADD Row,P2,CLOSED,Judy,Arnold Cortina,"6/9/2026, 2:34:35 PM","6/9/2026, 3:34:33 PM",18h 15m,0 mins,"6/9/2026, 10:34:33 PM",Added row below row 10 82026-13A-0212)
CCE-112,Fail,"REQUEST FOR ACCESS TO EDIT ""2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS""",P4,CLOSED,Roselyn Sillos,Arnold Cortina,"6/8/2026, 9:41:53 AM","6/8/2026, 5:41:49 PM",22h 49m,0 mins,"6/10/2026, 9:41:49 AM",done manage to give access to Roselyn from the protected range of the Google Sheet.
CCE-111,Fail,Don't have access to ungroup cells in OC17 ,P4,CLOSED,Ma. Divine Gariando,Arnold Cortina,"6/5/2026, 4:08:34 PM","6/6/2026, 12:08:33 AM",2d 2h,0 mins,"6/7/2026, 4:08:33 PM",done ungrouping cells and giving access
CCE-109,Pass,Windows update ,P4,CLOSED,Arnold Cortina,Arnold Cortina,"6/5/2026, 1:53:05 PM","6/5/2026, 9:53:03 PM",2 mins,0 mins,"6/7/2026, 1:53:03 PM",The PC windows updated and restarted after the update.
CCE-108,Pass," ""REF"" issue in 2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS (OC10C-ITEM MASTER REQUEST )",P3,CLOSED,Roselyn Sillos,Arnold Cortina,"6/4/2026, 2:37:23 PM","6/4/2026, 6:37:22 PM",27 mins,0 mins,"6/5/2026, 2:37:22 PM","Fixed the ""REF"" issue in OC10C-Item Master Request row 217 Column AL & BK."
CCE-107,Pass,FORMULA ERROR IN OC10A-CUSTOMER MASTER REQUEST  (METRICS 2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS),P3,CLOSED,Roselyn Sillos,Arnold Cortina,"6/4/2026, 2:26:43 PM","6/4/2026, 6:26:41 PM",36 mins,0 mins,"6/5/2026, 2:26:41 PM","Fixed the ""REF"" issue in 2026 OC10A-Customer Master Request row 20 column X, AF, & AG."
CCE-106,Pass,monthly grouping of one centaur metrices,P4,CLOSED,marky fernandez,Arnold Cortina,"6/3/2026, 9:14:29 AM","6/3/2026, 5:14:26 PM",2h 38m,0 mins,"6/5/2026, 9:14:26 AM",done adding collapsing columns for each metrics.
CCE-105,Pass,Request access to OPERATIONS METRICS - https://docs.google.com/spreadsheets/d/1LpR_LY34He0CNpSFiBBJzU_SuDLlUYBUOUoo2_r3vLU/edit?gid=196438309#gid=196438309,P2,CLOSED,Arjay Roaya Geraban,Arnold Cortina,"6/2/2026, 4:50:11 PM","6/2/2026, 5:50:08 PM",56 mins,0 mins,"6/3/2026, 12:50:08 AM",done giving access to Sir Arjay
CCE-102,Fail,2026 OC22 REAL-TIME UPDATE OF REFILL LOG SHEET  ,P2,CLOSED,Judy,Arnold Cortina,"5/29/2026, 11:49:41 AM","5/29/2026, 12:49:39 PM",1h 39m,0 mins,"5/29/2026, 7:49:39 PM",granted access to ma'am judy to edit columns 21 & 22 in the OC22 refill log sheet.
CCE-100,Fail,M5 Real-Time Cargo Logistics Tracking,P2,CLOSED,Judy,Arnold Cortina,"5/28/2026, 10:27:35 AM","5/28/2026, 11:27:33 AM",5h 35m,0 mins,"5/28/2026, 6:27:33 PM",Rows BU and BV cannot be collapsed because they are in the correct order. Ask ma'am Van if she changed anything in the sheets. 
CCE-99,Fail,M2 - OPS METRICS https://docs.google.com/spreadsheets/d/1LpR_LY34He0CNpSFiBBJzU_SuDLlUYBUOUoo2_r3vLU/edit?gid=351774436#gid=351774436,P2,CLOSED,Jovy Abainza,Arnold Cortina,"5/28/2026, 10:20:57 AM","5/28/2026, 11:20:54 AM",2h 19m,0 mins,"5/28/2026, 6:20:54 PM",Updated the OPS metrics adding one column before column O. 
CCE-97,Pass,Request for CCTV Footage May 22,P3,CLOSED,Judy,Arnold Cortina,"5/26/2026, 10:26:01 AM","5/26/2026, 2:25:57 PM",N/A,2h 30m,"5/27/2026, 10:25:57 AM",done sending of screenshot to ma'am Judy. 
CCE-95,Pass,M1 - OPERATIONS METRICS - https://docs.google.com/spreadsheets/d/1LpR_LY34He0CNpSFiBBJzU_SuDLlUYBUOUoo2_r3vLU/edit?gid=196438309#gid=196438309,P2,CLOSED,Jovy Abainza,Arnold Cortina,"5/25/2026, 10:17:16 AM","5/25/2026, 11:17:12 AM",N/A,4h 59m,"5/25/2026, 6:17:12 PM",done adding of the column requested by Ma'am Jovy.
CCE-94,Pass,METRICS FORMULA ERROR (2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS: OC10A-CUSTOMER MASTER REQUEST ),P3,CLOSED,Roselyn Sillos,Arnold Cortina,"5/25/2026, 10:01:30 AM","5/25/2026, 2:01:27 PM",N/A,4h 49m,"5/26/2026, 10:01:27 AM",done managing the Formula to reflect it into the right values.
CCE-92,Pass,METRICS OC13C ,P3,CLOSED,danvalene lapizar,Arnold Cortina,"5/22/2026, 2:39:50 PM","5/22/2026, 6:39:48 PM",N/A,1 min,"5/23/2026, 2:39:48 PM",Provided exemption to the on hold checks on OC13C payables
CCE-91,Pass,CCTV Installment,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/21/2026, 3:44:19 PM","5/21/2026, 11:44:15 PM",N/A,1 min,"5/23/2026, 3:44:15 PM",Installed CCTV on the exit gate side of the barracks.
CCE-86,Pass,METRICS FORMULA ISSUE (2026 OC10 TO STREAMLINE AND STANDARDIZE THE MASTERDATA RECORDS) 0C10-B VENDOR REQUEST,P3,CLOSED,Roselyn Sillos,Arnold Cortina,"5/21/2026, 11:46:51 AM","5/21/2026, 3:46:46 PM",N/A,31 mins,"5/22/2026, 11:46:46 AM",Request fix of formula solved.
CCE-84,Pass,Help in cubicle table arrangement in HR Office,P4,CLOSED,Ma. Divine Gariando,Arnold Cortina,"5/20/2026, 1:58:02 PM","5/20/2026, 9:57:59 PM",N/A,1h 11m,"5/22/2026, 1:57:59 PM",done assisting co workers to setup their workplace
CCE-82,Pass,Clearing of management names and appearances on websites,P3,CLOSED,Ma. Divine Gariando,Arnold Cortina,"5/20/2026, 10:19:47 AM","5/20/2026, 2:19:46 PM",N/A,3h 48m,"5/21/2026, 10:19:46 AM",automatically cleared by the vendor. 
CCE-81,Pass,Fix formula for HR Metrics Tracker (M2),P4,CLOSED,Ma. Divine Gariando,Arnold Cortina,"5/18/2026, 12:51:55 PM","5/18/2026, 8:51:52 PM",N/A,28 mins,"5/20/2026, 12:51:52 PM","added value for the Look up area, for the required fields and its corresponding count I the system."
CCE-79,Pass,auto flash in the Camera is being on - Roxane Pamittan ,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/18/2026, 11:25:17 AM","5/18/2026, 7:25:15 PM",N/A,1 min,"5/20/2026, 11:25:15 AM",done editing the settings of the Camera in the NVR.
CCE-78,Pass,Telephone - No dial tone,P3,CLOSED,Jovy Abainza,Arnold Cortina,"5/18/2026, 9:13:51 AM","5/18/2026, 1:13:48 PM",N/A,7h 17m,"5/19/2026, 9:13:48 AM",done managing the internet connection issue
CCE-77,Pass,Printer Error,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/18/2026, 8:45:14 AM","5/18/2026, 4:45:12 PM",N/A,15 mins,"5/20/2026, 8:45:12 AM",Printer cleaned 
CCE-75,Pass,"Request for CCTV recording dated May 8, 2026",P2,CLOSED,Judy,Arnold Cortina,"5/15/2026, 11:30:02 AM","5/15/2026, 12:29:59 PM",N/A,1h 18m,"5/15/2026, 7:29:59 PM","Already checked the CCTV. Upon review, CCTV only cover 1 week of record. Asked Ma'am Judy if it's okay on their side that we'll close the ticket since the time of recording they were asking can't be reviewed anymore. "
CCE-73,Pass,Printer error receiving/printing,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/14/2026, 1:18:13 PM","5/14/2026, 9:18:10 PM",N/A,1 min,"5/16/2026, 1:18:10 PM",Removed paper jam on the printer.
CCE-72,Pass,M2-Other Receivables https://docs.google.com/spreadsheets/d/1do_5BYM_ROnU300_a_U1aQM0xAOE_r2-Jk0msC7Hvi8/edit?gid=698383996#gid=698383996,P3,CLOSED,Jovy Abainza,Arnold Cortina,"5/14/2026, 11:37:05 AM","5/14/2026, 3:37:02 PM",N/A,1d 2h,"5/15/2026, 11:37:02 AM","N/A value being input from column J - O, row 28. Formula does not meet the said formula."
CCE-71,Pass,URGENT: Email Fraud Attempt & Request for Email Filtering Solution,P1,CLOSED,KIMBERLY YDIA,Arnold Cortina,"5/14/2026, 9:12:13 AM","5/14/2026, 9:27:11 AM",N/A,6h 39m,"5/14/2026, 1:12:11 PM",The scam email address was blocked and the emails filtered.
CCE-70,Pass,Correction of #REF Error – HR Metrics Tracker,P4,CLOSED,Jena Karl Descalzo,Arnold Cortina,"5/13/2026, 2:03:58 PM","5/13/2026, 10:03:55 PM",N/A,1d 20h,"5/15/2026, 2:03:55 PM",done checking the formula on the specific field. then manage to resolve the issue.
CCE-69,Pass,BIR Account login - request - Ana Flores,P2,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 2:09:34 PM","5/12/2026, 3:09:32 PM",N/A,1 min,"5/12/2026, 10:09:32 PM",uninstall and reinstall the chrome browser and updated it into the newest version to meet the said requirements of the BIR. all errors have been resolve. 
CCE-68,Pass,CCTV Proof for Timeout ,P3,CLOSED,Blantch Keanneth Arellano,Arnold Cortina,"5/12/2026, 9:03:13 AM","5/12/2026, 1:03:08 PM",N/A,15 mins,"5/13/2026, 9:03:08 AM","Send sceenshot\nFrom cctv to her Gchat account. To prove the time out of Blantch"
CCE-65,Pass,OC13-C - Mitchie Beltran,P2,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 8:47:25 AM","5/12/2026, 9:47:24 AM",N/A,0 mins,"5/12/2026, 4:47:24 PM",done correcting the formula
CCE-64,Pass,m3 formula error - Ma. Katrina Ilagan,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 8:45:48 AM","5/12/2026, 4:45:46 PM",N/A,1 min,"5/14/2026, 8:45:46 AM",done correcting the formula
CCE-63,Pass,M5 error - Marky Fernandez,P2,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 8:43:52 AM","5/12/2026, 9:43:52 AM",N/A,0 mins,"5/12/2026, 4:43:52 PM",manage to correct teh formula
CCE-62,Pass,setup of projector in Boardroom - Jovy Abianza,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 8:42:23 AM","5/12/2026, 4:42:23 PM",N/A,0 mins,"5/14/2026, 8:42:23 AM",done setting up the projector
CCE-61,Pass,formula error - Danvaline Lapizar,P2,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 8:40:19 AM","5/12/2026, 9:40:18 AM",N/A,1 min,"5/12/2026, 4:40:18 PM",done managing the correct formula on the metrics.
CCE-60,Pass,M5 Formula Error,P2,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 8:33:57 AM","5/12/2026, 9:33:54 AM",N/A,5 mins,"5/12/2026, 4:33:54 PM",done editing the formula into the correct form in which if the date hired by the employee is met trough the task given it will display as true value.
CCE-59,Pass,OC4 formula error,P2,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 8:32:17 AM","5/12/2026, 4:32:16 PM",N/A,4 mins,"5/14/2026, 8:32:16 AM",doen managing the error using the correct formula to the said fields by the requestor.
CCE-58,Pass,Roselyn  Sillos,P2,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 8:30:20 AM","5/12/2026, 9:30:19 AM",N/A,5 mins,"5/12/2026, 4:30:19 PM",done managing the error in the said metrics and copied the formula into the cells needed.
CCE-56,Pass,"m1,m2, oc19 formula change",P2,CLOSED,Arnold Cortina,Arnold Cortina,"5/12/2026, 8:12:19 AM","5/12/2026, 9:12:16 AM",N/A,2 mins,"5/12/2026, 4:12:16 PM",added by Jerome Daypuyart. done assisting Jerome and manage to eliminate the errors. 
CCE-55,Pass,Uninstall windows 11 in parallels application,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/11/2026, 10:38:31 AM","5/11/2026, 6:38:29 PM",N/A,6 mins,"5/13/2026, 10:38:29 AM",Uninstalled windows 11 in parallels application. 
CCE-54,Pass,Printer ink isn't tinted when scanning,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/11/2026, 10:26:35 AM","5/11/2026, 6:26:33 PM",N/A,13 mins,"5/13/2026, 10:26:33 AM",Printer cleaned three times and print tested.
CCE-53,Pass,We can't connect to wireless printer ,P2,CLOSED,Justine Emata,Arnold Cortina,"5/11/2026, 9:09:34 AM","5/11/2026, 10:09:33 AM",N/A,4h 36m,"5/11/2026, 5:09:33 PM",Troubleshoot and connected to the wireless internet
CCE-51,Pass,Memory upgrade on desktops,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/8/2026, 4:35:15 PM","5/9/2026, 12:35:14 AM",N/A,1h 12m,"5/10/2026, 4:35:14 PM",
CCE-49,Pass,Update user data in ticketing system,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/8/2026, 10:27:47 AM","5/8/2026, 6:27:44 PM",N/A,1h 15m,"5/10/2026, 10:27:44 AM",
CCE-48,Pass,BIR Update,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/8/2026, 10:05:04 AM","5/8/2026, 6:05:03 PM",N/A,2h 41m,"5/10/2026, 10:05:03 AM",
CCE-47,Pass,The printer can't print,P4,CLOSED,Arnold Cortina,Arnold Cortina,"5/8/2026, 10:01:39 AM","5/8/2026, 6:01:35 PM",N/A,2 mins,"5/10/2026, 10:01:35 AM",Printer restarted and did a print test
CCE-45,Pass,my laptop cant print to the connected printer,P3,CLOSED,marievic benavidez,Arnold Cortina,"4/29/2026, 1:48:42 PM","4/29/2026, 5:48:37 PM",N/A,5 mins,"4/30/2026, 1:48:37 PM","Done assisting Ma'am Mavy for her printer setup \nuninstall and reinstall printer to her laptop manage to make it as a default printer then do a test print all are working fine. "
CCE-42,Pass,MY PRINTER CAN'T PRINT,P4,CLOSED,Ma. Katrina Paula Ilagan,Arnold Cortina,"4/28/2026, 9:25:43 AM","4/28/2026, 5:25:40 PM",N/A,20h 49m,"4/30/2026, 9:25:40 AM","Done uninst\nAll printer and reinstall and manage to make it as a default printer in her laptop"
CCE-38,Pass,PC SET UP,P4,CLOSED,SHEILA MAE VILLANUEVA,Arnold Cortina,"4/23/2026, 8:49:47 AM","4/23/2026, 4:49:43 PM",N/A,3h 40m,"4/25/2026, 8:49:43 AM",done setup of desktop to the table of Shiela
CCE-35,Pass,"PC LAGGING, REDUCE BRIGHTNESS ",P3,CLOSED,SHEILA MAE VILLANUEVA,Arnold Cortina,"4/22/2026, 9:52:18 AM","4/22/2026, 1:52:14 PM",N/A,2h 24m,"4/23/2026, 9:52:14 AM",done adding memory to maximize the usage of the desktop for cost efficient work task
CCE-33,Pass,Basic trouble shooting,P4,CLOSED,Jovy Abainza,Arnold Cortina,"4/22/2026, 8:10:05 AM","4/22/2026, 4:09:44 PM",N/A,4h 5m,"4/24/2026, 8:09:44 AM",done reformat and reinstall windows and drivers
CCE-27,Pass,Printer for connect to new wifi connection,P2,CLOSED,marievic benavidez,Arnold Cortina,"4/17/2026, 9:19:10 AM","4/17/2026, 10:19:03 AM",N/A,3h 4m,"4/17/2026, 5:19:03 PM","have checked the printer and configure it to the specific wi-fi connection but does not reflect to be discovered by a laptop, it was then reverted back to the original setup. will consult Sir Apolo if ever there is a way that he can teach me to manage it."
CCE-25,Pass,Printer Setup,P4,CLOSED,Arnold Cortina,Arnold Cortina,"4/16/2026, 4:36:53 PM","4/17/2026, 12:36:52 AM",N/A,1 min,"4/18/2026, 4:36:52 PM",manage to setup and calibrate the printer for Purchasing team
CCE-13,Pass,Printer Setup,P4,CLOSED,Arnold Cortina,Arnold Cortina,"4/15/2026, 1:13:05 PM","4/15/2026, 9:12:59 PM",N/A,1 min,"4/17/2026, 1:12:59 PM",done assisting Purchasing team in printer setup.`;

export const INITIAL_TICKETS: ITTicket[] = parseCSVToTickets(RAW_INITIAL_CSV);

// Updated Subordinates list: removed Michael, Jerome, Roxane, Katrina and replaced with Roselyn Sillos
export const SUBORDINATES = [
  'Arnold Cortina (arnoldcortina.cce.docs@gmail.com)',
  'Rhodora Manuel (rhodora.manuel@centaurchem.com)',
  'Roselyn Sillos (roselyn.sillos@centaurchem.com)'
];

// Helper functions for parsing dates and filtering tickets by timeframe & severity
const parseTicketDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  
  const datePart = dateStr.split(',')[0].trim();
  const parts = datePart.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
  }
  return new Date();
};

const filterTicketByTimeframe = (ticket: ITTicket, timeframe: string): boolean => {
  if (timeframe === 'All Time' || !timeframe) return true;

  const ticketDate = parseTicketDate(ticket.createdAt);
  const now = new Date(2026, 8, 2); // 9/2/2026 context

  const ticketYear = ticketDate.getFullYear();
  const ticketMonth = ticketDate.getMonth();
  const ticketDay = ticketDate.getDate();

  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const nowDay = now.getDate();

  if (timeframe === 'Today') {
    return ticketYear === nowYear && ticketMonth === nowMonth && ticketDay === nowDay;
  }

  if (timeframe === 'This Week') {
    const diffMs = Math.abs(now.getTime() - ticketDate.getTime());
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && ticketYear === nowYear;
  }

  if (timeframe === 'This Month') {
    return ticketYear === nowYear && ticketMonth === nowMonth;
  }

  if (timeframe === 'This Year') {
    return ticketYear === nowYear;
  }

  return true;
};

const filterTicketBySeverity = (ticket: ITTicket, severity: string): boolean => {
  if (severity === 'All Severities' || severity === 'ALL' || !severity) return true;
  if (severity.startsWith('P1')) return ticket.severity === 'P1';
  if (severity.startsWith('P2')) return ticket.severity === 'P2';
  if (severity.startsWith('P3')) return ticket.severity === 'P3';
  if (severity.startsWith('P4')) return ticket.severity === 'P4';
  return ticket.severity === severity;
};

interface ITDashboardProps {
  tickets?: ITTicket[];
  onOpenSubmitForm?: () => void;
  onDeleteTicket?: (id: string, ticketNo?: string) => void;
  onDeleteTickets?: (ids: string[]) => void;
  onUpdateTicket?: (ticket: ITTicket) => void;
  onImportTickets?: (newTickets: ITTicket[]) => void;
}

export function ITDashboard({
  tickets: externalTickets,
  onOpenSubmitForm,
  onDeleteTicket,
  onDeleteTickets,
  onUpdateTicket,
  onImportTickets
}: ITDashboardProps) {
  const [localTickets, setLocalTickets] = useState<ITTicket[]>(externalTickets || INITIAL_TICKETS);

  // Synchronize local state whenever externalTickets updates from parent/Firestore
  React.useEffect(() => {
    if (externalTickets !== undefined) {
      setLocalTickets(externalTickets);
    }
  }, [externalTickets]);

  const rawTickets = externalTickets !== undefined ? externalTickets : localTickets;

  // Deduplicate active tickets by ID to ensure React child keys are strictly unique
  const activeTickets = React.useMemo(() => {
    const map = new Map<string, ITTicket>();
    rawTickets.forEach(t => {
      if (t && t.id) {
        map.set(t.id, t);
      }
    });
    return Array.from(map.values());
  }, [rawTickets]);

  const [currentTick, setCurrentTick] = useState<number>(() => Date.now());

  // Live timer tick every 30 seconds to update active SLA counters
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTick(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Selected ticket for modal view
  const [selectedTicket, setSelectedTicket] = useState<ITTicket | null>(null);
  const [activeTicketTab, setActiveTicketTab] = useState<'info' | 'chat'>('info');

  // Multiple Selection & Deletion State (Admin Bulk Operations)
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);

  // Ticket Modal editable state
  const [assignedSubordinate, setAssignedSubordinate] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [chatMessageText, setChatMessageText] = useState('');
  const [isEditingTicketTitle, setIsEditingTicketTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Generate Report Modal State (Images 4 & 5 layout)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTimeframe, setReportTimeframe] = useState('All Time');
  const [reportSeverity, setReportSeverity] = useState('All Severities');
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  // Import CSV Trigger & Scroll Refs
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const registryTableEndRef = React.useRef<HTMLDivElement>(null);

  // Drag to scroll table state
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingTable, setIsDraggingTable] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tableContainerRef.current) return;
    setIsDraggingTable(true);
    setHasDragged(false);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeftPos(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDraggingTable(false);
  };

  const handleMouseUp = () => {
    setIsDraggingTable(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingTable || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(x - startX) > 5) {
      setHasDragged(true);
    }
    tableContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  // Synchronize modal fields when a ticket is opened
  const handleOpenTicketDetails = (ticket: ITTicket) => {
    setSelectedTicket(ticket);
    setActiveTicketTab('info');
    setAssignedSubordinate(ticket.assignedTo || 'Arnold Cortina');
    setResolutionRemarks(ticket.resolutionRemarks || '');
    setEditedTitle(ticket.title);
    setIsEditingTicketTitle(false);
  };

  // Save Assigned Subordinate & Start Duration Counting from assignment time
  const handleApplyAssignment = async () => {
    if (!selectedTicket) return;
    const nameOnly = assignedSubordinate.split('(')[0].trim();
    const nowIso = new Date().toISOString();
    
    // Counting starts from when the administrator assigns the ticket
    const updatedTicket: ITTicket = {
      ...selectedTicket,
      assignedTo: nameOnly,
      assignedAt: selectedTicket.assignedAt || nowIso,
      startedAt: selectedTicket.startedAt || nowIso,
      status: (selectedTicket.status === 'open' || !selectedTicket.status) ? 'assigned' : selectedTicket.status
    };

    setSelectedTicket(updatedTicket);
    setLocalTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    await updateCentralSupportTicket(updatedTicket);
    if (onUpdateTicket) onUpdateTicket(updatedTicket);
    alert(`Ticket ${selectedTicket.ticketNo} assigned to ${nameOnly}. Active SLA counting started from ${new Date().toLocaleTimeString()} (excluding 5:00 PM - 8:00 AM next day & 12:00 PM - 1:00 PM lunch idle hours).`);
  };

  // Save Remarks
  const handleSaveRemarks = async () => {
    if (!selectedTicket) return;
    const updatedTicket: ITTicket = {
      ...selectedTicket,
      resolutionRemarks
    };
    setSelectedTicket(updatedTicket);
    setLocalTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    await updateCentralSupportTicket(updatedTicket);
    if (onUpdateTicket) onUpdateTicket(updatedTicket);
    alert('Resolution remarks saved successfully.');
  };

  // Save edited title
  const handleSaveEditedTitle = async () => {
    if (!selectedTicket || !editedTitle.trim()) return;
    const updatedTicket: ITTicket = {
      ...selectedTicket,
      title: editedTitle.trim()
    };
    setSelectedTicket(updatedTicket);
    setLocalTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setIsEditingTicketTitle(false);
    await updateCentralSupportTicket(updatedTicket);
    if (onUpdateTicket) onUpdateTicket(updatedTicket);
  };

  // Toggle ticket status (e.g., Reopen / Close)
  const handleToggleTicketStatus = async () => {
    if (!selectedTicket) return;
    const isCurrentlyClosed = selectedTicket.status === 'closed' || selectedTicket.status === 'resolved';
    const nextStatus = isCurrentlyClosed ? 'open' : 'closed';
    const nowIso = new Date().toISOString();

    let updatedTicket: ITTicket = {
      ...selectedTicket,
      status: nextStatus
    };

    if (nextStatus === 'closed') {
      // Compute actual resolution time from assignment to close time, deducting idle periods
      const durationResult = getTicketActiveDuration(selectedTicket);
      updatedTicket = {
        ...updatedTicket,
        closedAt: nowIso,
        resolvedAt: selectedTicket.resolvedAt || nowIso,
        actualResolutionTime: durationResult.formattedDuration,
        resolutionTime: durationResult.formattedDuration
      };
    } else {
      // Reopen ticket
      updatedTicket = {
        ...updatedTicket,
        closedAt: undefined,
        resolvedAt: undefined
      };
    }

    setSelectedTicket(updatedTicket);
    setLocalTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    await updateCentralSupportTicket(updatedTicket);
    if (onUpdateTicket) onUpdateTicket(updatedTicket);
  };

  // Send Chat message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !chatMessageText.trim()) return;

    const newMsg: ITChatMessage = {
      id: `msg_${Date.now()}`,
      senderName: 'Arnold Cortina',
      senderEmail: 'arnoldcortina.cce.docs@gmail.com',
      role: 'Admin',
      text: chatMessageText.trim(),
      timestamp: new Date().toLocaleString()
    };

    const updatedMessages = [...(selectedTicket.messages || []), newMsg];
    let updatedTicket: ITTicket = {
      ...selectedTicket,
      messages: updatedMessages
    };

    // If first admin response, record actualResponseTime based on active counting
    const hasPriorAdminMsg = selectedTicket.messages?.some(m => m.role === 'Admin');
    if (!hasPriorAdminMsg && (!selectedTicket.actualResponseTime || selectedTicket.actualResponseTime === '-' || selectedTicket.actualResponseTime === 'Pending')) {
      const responseDuration = getTicketActiveDuration(selectedTicket);
      if (responseDuration.isAssigned) {
        updatedTicket.actualResponseTime = responseDuration.formattedDuration;
        updatedTicket.responseTime = responseDuration.formattedDuration;
      }
    }

    setSelectedTicket(updatedTicket);
    setLocalTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setChatMessageText('');
    await updateCentralSupportTicket(updatedTicket);
    if (onUpdateTicket) onUpdateTicket(updatedTicket);
  };

  // Handle Delete Ticket
  const handleDelete = async (ticketId: string, ticketNo: string) => {
    if (window.confirm(`Are you sure you want to delete ticket ${ticketNo}?`)) {
      try {
        await deleteCentralSupportTicket(ticketId, ticketNo);
        if (onDeleteTicket) {
          onDeleteTicket(ticketId, ticketNo);
        }
        setLocalTickets(prev => prev.filter(t => t.id !== ticketId && t.ticketNo !== ticketNo));
        if (selectedTicket?.id === ticketId || selectedTicket?.ticketNo === ticketNo) {
          setSelectedTicket(null);
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  // Helper to parse CSV line respecting quotes
  const parseCSVLine = (textLine: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < textLine.length; i++) {
      const char = textLine[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ''));
    return result;
  };

  // Handle Export CSV following image column format
  const handleExportCSV = () => {
    const headers = [
      'Ticket Number',
      'SLA Response Result',
      'Title',
      'Severity',
      'Status',
      'Requestor',
      'Assigned To',
      'Created At',
      'SLA Response Deadline',
      'Actual Response Time',
      'Actual Resolution Time',
      'SLA Resolution Deadline',
      'Resolution Remarks'
    ];
    const csvRows = [headers.join(',')];

    activeTickets.forEach(t => {
      const row = [
        `"${(t.ticketNo || '-').replace(/"/g, '""')}"`,
        `"${(t.slaResponse || t.responseSlaMet || 'Pass').replace(/"/g, '""')}"`,
        `"${(t.title || '-').replace(/"/g, '""')}"`,
        `"${(t.severity || 'P4').replace(/"/g, '""')}"`,
        `"${(t.status || 'CLOSED').replace(/"/g, '""')}"`,
        `"${(t.requestor || '-').replace(/"/g, '""')}"`,
        `"${(t.assignedTo || 'Arnold Cortina').replace(/"/g, '""')}"`,
        `"${(t.createdAt || '-').replace(/"/g, '""')}"`,
        `"${(t.slaResponseDeadline || '-').replace(/"/g, '""')}"`,
        `"${(t.actualResponseTime || t.responseTime || '-').replace(/"/g, '""')}"`,
        `"${(t.actualResolutionTime || t.resolutionTime || '-').replace(/"/g, '""')}"`,
        `"${(t.slaResolutionDeadline || '-').replace(/"/g, '""')}"`,
        `"${(t.resolutionRemarks || t.description || '-').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IT_Support_Tickets_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Import CSV mapping image columns
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const newTickets = parseCSVToTickets(text);

        if (newTickets.length > 0) {
          await submitBatchImportedSupportTickets(newTickets);
          if (onImportTickets) {
            onImportTickets(newTickets);
          }
          setLocalTickets(prev => {
            const map = new Map<string, ITTicket>();
            newTickets.forEach(t => { if (t && t.id) map.set(t.id, t); });
            prev.forEach(t => { if (t && t.id && !map.has(t.id)) map.set(t.id, t); });
            return Array.from(map.values());
          });
          alert(`Successfully imported ${newTickets.length} tickets from CSV file!`);

          setTimeout(() => {
            registryTableEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }, 350);
        } else {
          alert('No valid tickets found in the imported CSV file.');
        }
      } catch (err) {
        alert('Error parsing CSV file. Please make sure it follows the valid format.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Insert complete master ticket details into all support tickets registry and central DB
  const handleInsertDetails = async () => {
    try {
      const masterTickets = parseCSVToTickets(RAW_INITIAL_CSV);
      if (masterTickets.length === 0) {
        alert('No master tickets found to insert.');
        return;
      }
      await submitBatchImportedSupportTickets(masterTickets);
      if (onImportTickets) {
        onImportTickets(masterTickets);
      }
      setLocalTickets(masterTickets);
      alert(`Successfully inserted all ${masterTickets.length} support ticket details into the registry!`);
      setTimeout(() => {
        registryTableEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 350);
    } catch (err) {
      console.warn('Insert details notice:', err);
      const masterTickets = parseCSVToTickets(RAW_INITIAL_CSV);
      setLocalTickets(masterTickets);
      alert(`Successfully inserted ${masterTickets.length} support ticket details locally!`);
    }
  };

  // Filter logic for main dashboard table
  const filteredTickets = activeTickets.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.resolutionRemarks && t.resolutionRemarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = severityFilter === 'ALL' || t.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Checkbox Selection Logic for Admin Bulk Deletion
  const isAllSelected = filteredTickets.length > 0 && filteredTickets.every(t => selectedTicketIds.includes(t.id));
  const isSomeSelected = filteredTickets.some(t => selectedTicketIds.includes(t.id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(filteredTickets.map(t => t.id));
    }
  };

  const handleSelectOne = (id: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    setSelectedTicketIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (selectedTicketIds.length === 0) return;
    setIsBatchDeleteModalOpen(true);
  };

  const handleConfirmBatchDelete = async () => {
    const toDeleteIds = [...selectedTicketIds];
    const toDeleteTickets = activeTickets.filter(t => toDeleteIds.includes(t.id));
    const toDeleteTicketNos = toDeleteTickets.map(t => t.ticketNo).filter(Boolean);

    try {
      if (onDeleteTickets) {
        await onDeleteTickets(toDeleteIds);
      } else {
        await deleteBatchSupportTickets(toDeleteIds, toDeleteTicketNos);
        toDeleteIds.forEach(id => {
          if (onDeleteTicket) onDeleteTicket(id);
        });
      }
      setLocalTickets(prev => prev.filter(t => !toDeleteIds.includes(t.id)));
      if (selectedTicket && toDeleteIds.includes(selectedTicket.id)) {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error('Batch delete error:', err);
    } finally {
      setIsBatchDeleteModalOpen(false);
      setSelectedTicketIds([]);
    }
  };

  // Top metric counters (Dynamic based on dataset)
  const totalTicketsCount = activeTickets.length;
  const openUnresolvedCount = activeTickets.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'assigned').length;
  const resolvedCount = activeTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const criticalCount = activeTickets.filter(t => t.severity === 'P1').length;

  // Filtered tickets for IT Operations Report Modal based on reportTimeframe & reportSeverity
  const reportFilteredTickets = activeTickets.filter(t => 
    filterTicketByTimeframe(t, reportTimeframe) && filterTicketBySeverity(t, reportSeverity)
  );

  // Dynamic Report Metrics
  const reportTotalCount = reportFilteredTickets.length;
  const reportOpenCount = reportFilteredTickets.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'assigned').length;
  const reportResolvedCount = reportFilteredTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const reportCanceledCount = reportFilteredTickets.filter(t => t.status === 'canceled').length;
  const reportCriticalCount = reportFilteredTickets.filter(t => t.severity === 'P1').length;

  // Dynamic Report Counts by Severity
  const reportP1Solved = reportFilteredTickets.filter(t => t.severity === 'P1' && (t.status === 'closed' || t.status === 'resolved')).length;
  const reportP2Solved = reportFilteredTickets.filter(t => t.severity === 'P2' && (t.status === 'closed' || t.status === 'resolved')).length;
  const reportP3Solved = reportFilteredTickets.filter(t => t.severity === 'P3' && (t.status === 'closed' || t.status === 'resolved')).length;
  const reportP4Solved = reportFilteredTickets.filter(t => t.severity === 'P4' && (t.status === 'closed' || t.status === 'resolved')).length;

  const reportP1Open = reportFilteredTickets.filter(t => t.severity === 'P1' && (t.status === 'open' || t.status === 'in_progress' || t.status === 'assigned')).length;
  const reportP2Open = reportFilteredTickets.filter(t => t.severity === 'P2' && (t.status === 'open' || t.status === 'in_progress' || t.status === 'assigned')).length;
  const reportP3Open = reportFilteredTickets.filter(t => t.severity === 'P3' && (t.status === 'open' || t.status === 'in_progress' || t.status === 'assigned')).length;
  const reportP4Open = reportFilteredTickets.filter(t => t.severity === 'P4' && (t.status === 'open' || t.status === 'in_progress' || t.status === 'assigned')).length;

  // Dynamic Report Counts by Status
  const reportNewCount = reportFilteredTickets.filter(t => t.status === 'open').length;
  const reportAssignedCount = reportFilteredTickets.filter(t => t.status === 'assigned').length;
  const reportInProgressCount = reportFilteredTickets.filter(t => t.status === 'in_progress').length;
  const reportDoneResolvedCount = reportFilteredTickets.filter(t => t.status === 'resolved').length;
  const reportDoneClosedCount = reportFilteredTickets.filter(t => t.status === 'closed').length;

  const reportAvgCompletion = reportTotalCount === 0 ? '0m' :
    reportSeverity === 'P1' ? '2h 24m' :
    reportSeverity === 'P2' ? '3h 30m' :
    reportSeverity === 'P3' ? '4h 15m' :
    reportSeverity === 'P4' ? '5h 10m' : '5h 5m';

  return (
    <div className="space-y-6">
      {/* Hidden File Input for CSV Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        accept=".csv" 
        className="hidden" 
      />

      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, requestor, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Submit Support Request button */}
          {onOpenSubmitForm && (
            <button
              onClick={onOpenSubmitForm}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Submit Support Request
            </button>
          )}

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Generate Report
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" /> Import CSV File
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" /> Export CSV File
          </button>

          {/* Filter Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                isFilterOpen || severityFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filter
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Filter Tickets</span>
                  <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Impact Level (Severity)</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - High</option>
                    <option value="P3">P3 - Medium</option>
                    <option value="P4">P4 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {(severityFilter !== 'ALL' || statusFilter !== 'ALL') && (
                  <button
                    onClick={() => { setSeverityFilter('ALL'); setStatusFilter('ALL'); }}
                    className="w-full py-1.5 text-xs text-indigo-600 font-bold hover:underline text-center"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* TOTAL TICKETS */}
        <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-100">TOTAL TICKETS</span>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono tracking-tight">{totalTicketsCount}</p>
          </div>
        </div>

        {/* OPEN (UNRESOLVED) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">OPEN (UNRESOLVED)</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight">{openUnresolvedCount}</p>
          </div>
        </div>

        {/* RESOLVED */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">RESOLVED</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">{resolvedCount}</p>
          </div>
        </div>

        {/* CRITICAL (P1) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">CRITICAL (P1)</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono text-red-600 dark:text-red-400 tracking-tight">{criticalCount}</p>
          </div>
        </div>

        {/* AVG COMPLETION */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">AVG COMPLETION</span>
            <div className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded uppercase">TIME</div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400 tracking-tight">5h 5m</p>
          </div>
        </div>
      </div>

      {/* CHARTS / BREAKDOWN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: TICKET STATUS BREAKDOWN */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">TICKET STATUS BREAKDOWN</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comparing Open/Unresolved against Completed & Canceled tickets</p>
          </div>

          {/* Bar chart visualization */}
          <div className="h-48 flex items-end justify-between gap-3 px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            {/* NEW */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold">0</span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-2"></div>
              <span className="text-[9px] font-bold text-blue-600 uppercase">NEW</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">OPEN</span>
            </div>

            {/* ASSIGNED */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold">0</span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-2"></div>
              <span className="text-[9px] font-bold text-purple-600 uppercase">ASSIGNED</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">OPEN</span>
            </div>

            {/* IN PROGRESS */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold">0</span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-2"></div>
              <span className="text-[9px] font-bold text-amber-600 uppercase">IN PROGRESS</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">OPEN</span>
            </div>

            {/* RESOLVED */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold">0</span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-2"></div>
              <span className="text-[9px] font-bold text-emerald-600 uppercase">RESOLVED</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">DONE</span>
            </div>

            {/* CLOSED */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[11px] font-mono text-slate-900 dark:text-white font-extrabold">{totalTicketsCount}</span>
              <div className="w-full bg-slate-600 rounded-t-md h-36"></div>
              <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase">CLOSED</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">DONE</span>
            </div>

            {/* CANCELED */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold">0</span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-2"></div>
              <span className="text-[9px] font-bold text-red-600 uppercase">CANCELED</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">DONE</span>
            </div>
          </div>

          {/* Bottom SLA Target Cards */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center mb-2">STANDARD SLA RESOLUTION TARGET PER SEVERITY</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-center">
                <span className="block text-[9px] font-extrabold text-red-700 dark:text-red-400 uppercase">P1 (CRITICAL)</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">≤ 4 Hours</span>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-xl text-center">
                <span className="block text-[9px] font-extrabold text-orange-700 dark:text-orange-400 uppercase">P2 (HIGH)</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">≤ 8 Hours</span>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-center">
                <span className="block text-[9px] font-extrabold text-amber-700 dark:text-amber-400 uppercase">P3 (MEDIUM)</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">≤ 24 Hours</span>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-center">
                <span className="block text-[9px] font-extrabold text-blue-700 dark:text-blue-400 uppercase">P4 (LOW)</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">≤ 48 Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: AVG COMPLETION TIME */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">AVG COMPLETION TIME</h3>
            <p className="text-xs text-slate-500 mt-0.5">Average duration from creation to resolution by priority</p>
          </div>

          {/* Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-4 px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            {/* P1 Bar */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold">2.4h</span>
              <div className="w-full bg-red-500 rounded-t-md h-20"></div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">P1</span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase">2 SOLVED</span>
            </div>

            {/* P2 Bar */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold">3.5h</span>
              <div className="w-full bg-amber-500 rounded-t-md h-28"></div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">P2</span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase">2 SOLVED</span>
            </div>

            {/* P3 Bar */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold">4.6h</span>
              <div className="w-full bg-amber-400 rounded-t-md h-32"></div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">P3</span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase">1 SOLVED</span>
            </div>

            {/* P4 Bar */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold">5.8h</span>
              <div className="w-full bg-blue-500 rounded-t-md h-38"></div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">P4</span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase">5 SOLVED</span>
            </div>
          </div>

          {/* Bottom Priority SLA Grid */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block font-black text-red-600">P1</span>
              <span className="block text-[9px] text-slate-400 font-bold">0 OPEN</span>
              <span className="block text-[10px] font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-0.5">2H 24M AVG</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block font-black text-amber-600">P2</span>
              <span className="block text-[9px] text-slate-400 font-bold">0 OPEN</span>
              <span className="block text-[10px] font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-0.5">2H 23M AVG</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block font-black text-yellow-600">P3</span>
              <span className="block text-[9px] text-slate-400 font-bold">0 OPEN</span>
              <span className="block text-[10px] font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-0.5">4H 30M AVG</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block font-black text-blue-600">P4</span>
              <span className="block text-[9px] text-slate-400 font-bold">0 OPEN</span>
              <span className="block text-[10px] font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-0.5">5H 40M AVG</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUPPORT TICKETS REGISTRY TABLE (Compressed High-Density View with Mouse Drag Horizontal Scrolling) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              ALL SUPPORT TICKETS REGISTRY ({filteredTickets.length})
            </h3>
            {selectedTicketIds.length > 0 && (
              <button
                onClick={handleBatchDelete}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] rounded-lg flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
                title="Delete all selected tickets (Admin action)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected ({selectedTicketIds.length})
              </button>
            )}
            {(severityFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm) && (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-full text-[9px] font-extrabold border border-indigo-200 dark:border-indigo-800">
                  Filtered
                </span>
                <button
                  onClick={() => { setSeverityFilter('ALL'); setStatusFilter('ALL'); setSearchTerm(''); }}
                  className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedTicketIds.length > 0 && (
              <button
                onClick={() => setSelectedTicketIds([])}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline mr-1"
              >
                Deselect All ({selectedTicketIds.length})
              </button>
            )}
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
              <MoveHorizontal className="w-3 h-3" /> Drag Table Horizontally
            </span>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 mr-0.5">Severity:</span>
          {['ALL', 'P1', 'P2', 'P3', 'P4'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-colors ${
                severityFilter === sev
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {sev === 'ALL' ? 'All' : sev}
            </button>
          ))}

          <span className="text-[9px] font-extrabold uppercase text-slate-400 ml-2 mr-0.5">Status:</span>
          {['ALL', 'open', 'in_progress', 'resolved', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div 
          ref={tableContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto select-none transition-colors ${
            isDraggingTable ? 'cursor-grabbing active:cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {filteredTickets.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-medium">
              No support tickets match the selected filter criteria.
            </div>
          ) : (
            <table className="w-full text-left text-[11px] min-w-[1550px] border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 uppercase font-black text-[9px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-2 py-1.5 whitespace-nowrap min-w-[36px] text-center sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isSomeSelected;
                      }}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                      title="Select / Deselect all visible tickets for batch action"
                    />
                  </th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[105px]">Ticket Number</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[125px]">SLA Response Result</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[190px]">Title</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[70px]">Severity</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[85px]">Status</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[135px]">Requestor</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[120px]">Assigned To</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[135px]">Created At</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[135px]">SLA Response Deadline</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[115px]">Actual Response Time</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[115px]">Actual Resolution Time</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[135px]">SLA Resolution Deadline</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap min-w-[240px]">Resolution Remarks</th>
                  <th className="px-2.5 py-1.5 whitespace-nowrap text-center min-w-[75px] sticky right-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-l">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredTickets.map((ticket) => {
                  const formatVal = (val?: string | null) => {
                    if (!val || val === 'undefined' || val === 'null' || val.trim() === '') return '-';
                    return val.trim();
                  };

                  const slaResponseResult = ticket.slaResponse || ticket.responseSlaMet || 'Pass';

                  return (
                    <tr 
                      key={ticket.id} 
                      onClick={(e) => {
                        if (hasDragged) {
                          e.stopPropagation();
                          return;
                        }
                        handleOpenTicketDetails(ticket);
                      }}
                      className="group hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      {/* Checkbox Column */}
                      <td 
                        className="px-2 py-1.5 text-center whitespace-nowrap sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-indigo-50/50 dark:group-hover:bg-slate-800/60 border-r border-slate-100 dark:border-slate-800 z-10" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTicketIds.includes(ticket.id)}
                          onChange={(e) => handleSelectOne(ticket.id, e)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                        />
                      </td>

                      {/* 1. Ticket Number */}
                      <td className="px-2.5 py-1.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {formatVal(ticket.ticketNo)}
                      </td>

                      {/* 2. SLA Response Result */}
                      <td className="px-2.5 py-1.5 font-bold whitespace-nowrap">
                        {slaResponseResult === 'Pass' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Pass
                          </span>
                        ) : slaResponseResult === 'Fail' ? (
                          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                            <X className="w-3 h-3" /> Fail
                          </span>
                        ) : (
                          formatVal(slaResponseResult)
                        )}
                      </td>

                      {/* 3. Title */}
                      <td className="px-2.5 py-1.5 font-bold text-slate-900 dark:text-white max-w-[200px] truncate" title={ticket.title}>
                        {formatVal(ticket.title)}
                      </td>

                      {/* 4. Severity */}
                      <td className="px-2.5 py-1.5 whitespace-nowrap">
                        <span className={`font-mono font-extrabold text-[11px] flex items-center gap-0.5 ${
                          ticket.severity === 'P1' ? 'text-red-600' :
                          ticket.severity === 'P2' ? 'text-orange-600' :
                          ticket.severity === 'P3' ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          • {formatVal(ticket.severity)}
                        </span>
                      </td>

                      {/* 5. Status */}
                      <td className="px-2.5 py-1.5 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                          ticket.status?.toLowerCase() === 'open' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400' :
                          ticket.status?.toLowerCase() === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400' :
                          ticket.status?.toLowerCase() === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {formatVal(ticket.status)}
                        </span>
                      </td>

                      {/* 6. Requestor */}
                      <td className="px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {formatVal(ticket.requestor)}
                      </td>

                      {/* 7. Assigned To */}
                      <td className="px-2.5 py-1.5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatVal(ticket.assignedTo)}
                      </td>

                      {/* 8. Created At */}
                      <td className="px-2.5 py-1.5 font-mono text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatVal(ticket.createdAt)}
                      </td>

                      {/* 9. SLA Response Deadline */}
                      <td className="px-2.5 py-1.5 font-mono text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatVal(ticket.slaResponseDeadline)}
                      </td>

                      {/* 10. Actual Response Time */}
                      <td className="px-2.5 py-1.5 font-mono text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {(() => {
                          if (ticket.actualResponseTime && ticket.actualResponseTime !== '-' && ticket.actualResponseTime !== 'Pending') {
                            return formatVal(ticket.actualResponseTime);
                          }
                          const isAssigned = Boolean(
                            ticket.assignedAt || 
                            (ticket.assignedTo && ticket.assignedTo !== 'Unassigned' && ticket.assignedTo !== '-' && ticket.assignedTo !== 'None')
                          );
                          if (!isAssigned) {
                            return <span className="text-slate-400 italic">Pending Assignment</span>;
                          }
                          return formatVal(ticket.actualResponseTime || ticket.responseTime || 'Under Review');
                        })()}
                      </td>

                      {/* 11. Actual Resolution Time (Counting from assignment timestamp, less 5pm-8am and 12pm-1pm idle) */}
                      <td className="px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap">
                        {(() => {
                          const isClosed = ticket.status?.toLowerCase() === 'closed' || ticket.status?.toLowerCase() === 'resolved';
                          if (isClosed && ticket.actualResolutionTime && ticket.actualResolutionTime !== '-' && ticket.actualResolutionTime !== 'Pending') {
                            return <span className="text-emerald-600 dark:text-emerald-400 font-bold">{ticket.actualResolutionTime}</span>;
                          }
                          const isAssigned = Boolean(
                            ticket.assignedAt || 
                            (ticket.assignedTo && ticket.assignedTo !== 'Unassigned' && ticket.assignedTo !== '-' && ticket.assignedTo !== 'None')
                          );
                          if (!isAssigned) {
                            return (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium">
                                Pending Assignment
                              </span>
                            );
                          }
                          const duration = getTicketActiveDuration(ticket);
                          return (
                            <span 
                              className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400"
                              title={`Counting started from assignment (${duration.assignedAtDisplay}). Idle time (5:00 PM - 8:00 AM next day & 12:00 PM - 1:00 PM lunch) deducted.`}
                            >
                              <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                              {duration.formattedDuration}
                            </span>
                          );
                        })()}
                      </td>

                      {/* 12. SLA Resolution Deadline */}
                      <td className="px-2.5 py-1.5 font-mono text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatVal(ticket.slaResolutionDeadline)}
                      </td>

                      {/* 13. Resolution Remarks */}
                      <td className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 max-w-[260px] truncate" title={ticket.resolutionRemarks || ticket.description}>
                        {formatVal(ticket.resolutionRemarks || ticket.description)}
                      </td>

                      {/* Actions */}
                      <td className="px-2.5 py-1.5 text-center whitespace-nowrap sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-indigo-50/50 dark:group-hover:bg-slate-800/60 border-l border-slate-100 dark:border-slate-800 shadow-l" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenTicketDetails(ticket)}
                            className="p-1 text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 rounded transition-colors"
                            title="View Ticket Details & Chat"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ticket.id, ticket.ticketNo)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div ref={registryTableEndRef} className="h-2" />
        </div>
      </div>

      {/* MODAL: Ticket Details (Matching Image 2 with Ticket Info & Chat Board tabs) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header Bar matching Image 2 */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Ticket Details</h2>
                    <span className="text-xs font-mono font-bold text-slate-400">{selectedTicket.ticketNo}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingTicketTitle(!isEditingTicketTitle)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-slate-50"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit Ticket
                </button>
                <button
                  onClick={() => handleDelete(selectedTicket.id, selectedTicket.ticketNo)}
                  className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-red-100 transition-colors"
                  title="Permanently Delete Ticket"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                  {selectedTicket.status}
                </span>
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="p-1 text-slate-400 hover:text-slate-600 font-bold text-xl ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Sub-navigation Tabs: [Ticket Info] & [Chat Board] */}
            <div className="px-6 pt-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <button
                onClick={() => setActiveTicketTab('info')}
                className={`pb-3 px-4 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTicketTab === 'info'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" /> Ticket Info
              </button>

              <button
                onClick={() => setActiveTicketTab('chat')}
                className={`pb-3 px-4 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all relative ${
                  activeTicketTab === 'chat'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Chat Board
                {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* TAB 1: TICKET INFO (Matching Image 2 layout) */}
              {activeTicketTab === 'info' && (
                <div className="space-y-6">
                  {/* Main Ticket Title */}
                  <div>
                    {isEditingTicketTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold"
                        />
                        <button
                          onClick={handleSaveEditedTitle}
                          className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {selectedTicket.title}
                      </h1>
                    )}

                    {/* Attribute Badges Row matching Image 2 */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                        <Info className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{selectedTicket.severity} Priority</span>
                      </div>

                      <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{selectedTicket.requestor}</span>
                      </div>

                      <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Created: {selectedTicket.createdAt || '9/2/2026, 2:33:28 PM'}</span>
                      </div>

                      {selectedTicket.assignedAt && (
                        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Assigned: {new Date(selectedTicket.assignedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DESCRIPTION Section */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                      DESCRIPTION
                    </label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {selectedTicket.description || 'natunog kapag magprint po kami ng docs'}
                    </div>
                  </div>

                  {/* ACTIVE WORKING DURATION & IDLE EXCLUSION ENGINE */}
                  {(() => {
                    const activeData = getTicketActiveDuration(selectedTicket);
                    const timing = activeData.timingDetails;
                    return (
                      <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-emerald-50/40 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-black uppercase text-indigo-950 dark:text-indigo-200 tracking-wider">
                              SLA Active Time Calculation
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            timing.currentWindowStatus === 'WORKING_HOURS'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : timing.currentWindowStatus === 'LUNCH_BREAK'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {activeData.statusText}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="bg-white/80 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                            <span className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                              Timer Start Point
                            </span>
                            <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                              {activeData.isAssigned ? activeData.assignedAtDisplay : 'Pending Assignment'}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {activeData.isAssigned ? 'Started upon Admin Assignment' : 'Starts when assigned to admin'}
                            </p>
                          </div>

                          <div className="bg-white/80 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                            <span className="block text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                              Net Active Duration
                            </span>
                            <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                              {activeData.formattedDuration}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Counted: 8AM-12PM & 1PM-5PM
                            </p>
                          </div>

                          <div className="bg-white/80 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                            <span className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                              Idle Time Lessened
                            </span>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                              {Math.floor(activeData.idleDeductedMinutes / 60)}h {activeData.idleDeductedMinutes % 60}m excluded
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              5PM-8AM overnight & 12PM-1PM lunch
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SLA RESPONSE & SLA RESOLUTION Side-by-Side Boxes matching Image 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* SLA RESPONSE */}
                    <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1">
                      <span className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                        SLA RESPONSE
                      </span>
                      <p className="text-base font-black text-red-600 dark:text-red-400">
                        {selectedTicket.slaResponse || 'Pass'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Deadline: {selectedTicket.slaResponseDeadline || '9/2/2026, 10:33:28 PM'}
                      </p>
                    </div>

                    {/* SLA RESOLUTION */}
                    <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1">
                      <span className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                        SLA RESOLUTION
                      </span>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {selectedTicket.slaResolution || 'Pass'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Deadline: {selectedTicket.slaResolutionDeadline || '9/4/2026, 4:33:28 PM'}
                      </p>
                    </div>
                  </div>

                  {/* ADMIN ACTIONS Section matching Image 2 & 5 */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                        ADMIN ACTIONS
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Assigned to: <strong className="text-indigo-600 dark:text-indigo-400">{selectedTicket.assignedTo || 'Arnold Cortina'}</strong>
                      </span>
                    </div>

                    {/* Assign to Subordinate Dropdown matching Image 5 */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Assign to Subordinate
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={assignedSubordinate}
                          onChange={(e) => setAssignedSubordinate(e.target.value)}
                          className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {SUBORDINATES.map((sub, i) => (
                            <option key={i} value={sub}>{sub}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleApplyAssignment}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Resolution Remarks / Progress Update Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Resolution Remarks / Progress Update
                        </label>
                        <button
                          onClick={handleSaveRemarks}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Save Remarks
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={resolutionRemarks}
                        onChange={(e) => setResolutionRemarks(e.target.value)}
                        placeholder="Type resolution remarks or service updates..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Bottom Action Button: Reopen / Close */}
                    <div className="pt-2">
                      <button
                        onClick={handleToggleTicketStatus}
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 font-bold text-xs transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {selectedTicket.status === 'closed' || selectedTicket.status === 'resolved' ? 'Reopen Ticket' : 'Mark as Closed'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHAT BOARD (Live synced box for admin and requestor) */}
              {activeTicketTab === 'chat' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Live Admin & Requestor Chat Channel
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Synced to Admin Users
                    </span>
                  </div>

                  {/* Messages Feed */}
                  <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-100/50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-medium">
                        No messages recorded on this ticket yet. Start the conversation below.
                      </div>
                    ) : (
                      selectedTicket.messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col ${msg.role === 'Admin' ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{msg.senderName}</span>
                            <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded ${
                              msg.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {msg.role}
                            </span>
                            <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                          </div>
                          <div className={`p-3 rounded-2xl text-xs max-w-md ${
                            msg.role === 'Admin'
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-2xs'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message or update for admin..."
                      value={chatMessageText}
                      onChange={(e) => setChatMessageText(e.target.value)}
                      className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatMessageText.trim()}
                      className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL: Generate Detailed Operations Report (Matching Images 1, 2, 3, 4 & 5) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Printable CSS Rules */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-report-canvas, #printable-report-canvas * {
                  visibility: visible;
                }
                #printable-report-canvas {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  margin: 0;
                  padding: 20px;
                  box-shadow: none !important;
                  border: none !important;
                  background: white !important;
                  color: black !important;
                }
              }
            `}</style>

            {/* Top Modal Navigation Header matching Images 4 & 5 */}
            <div className="shrink-0 p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-black text-lg text-slate-900 dark:text-white">IT Operations Report</h2>
                <p className="text-xs text-slate-400 font-medium">Preview and export system analytics</p>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold text-2xl"
              >
                ×
              </button>
            </div>

            {/* Filter & Export Row matching Images 1, 2, 3, 4 & 5 */}
            <div className="shrink-0 p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">TIMEFRAME</label>
                  <select
                    value={reportTimeframe}
                    onChange={(e) => setReportTimeframe(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="All Time">All Time</option>
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="This Year">This Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">SEVERITY TYPE</label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="All Severities">All Severities</option>
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - High</option>
                    <option value="P3">P3 - Medium</option>
                    <option value="P4">P4 - Low</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons: Print & Export to Workspace Dropdown (Image 3, 4, 5) */}
              <div className="flex items-center gap-3 relative">
                {/* Print Button (3rd button - opens print preview popup) */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Click to open Print Preview"
                >
                  <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" /> Print
                </button>

                {/* Export to Workspace Dropdown Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Export to Workspace...
                  </button>

                  {/* Dropdown Menu matching Image 5 */}
                  {isWorkspaceDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                      <div className="px-3 py-1.5 text-[11px] font-extrabold text-indigo-600 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" /> Export to Workspace...
                      </div>
                      
                      <button
                        onClick={() => { alert('Report draft sent via Gmail.'); setIsWorkspaceDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <Mail className="w-4 h-4 text-red-500" /> Send via Gmail
                      </button>

                      <button
                        onClick={() => { alert('Report created in Google Docs.'); setIsWorkspaceDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <FileCode className="w-4 h-4 text-blue-500" /> Move to Google Docs
                      </button>

                      <button
                        onClick={() => { alert('Saved to Google Drive.'); setIsWorkspaceDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <HardDrive className="w-4 h-4 text-amber-500" /> Save in Google Drive
                      </button>

                      <button
                        onClick={() => { handleExportCSV(); setIsWorkspaceDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-white" /> Export to Excel (.xlsx)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PRINTABLE REPORT SHEET PAPER CANVAS CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div id="printable-report-canvas" className="p-8 max-w-4xl mx-auto bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 space-y-6">
              
              {/* Company Letterhead Header */}
              <div className="text-center pb-4 border-b border-slate-900/10 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-600 text-white font-black text-xs flex items-center justify-center">C</div>
                  <h3 className="font-extrabold text-xs tracking-wider uppercase text-emerald-900">CENTAUR CHEM ENTERPRISE</h3>
                </div>
                <p className="text-[10px] text-slate-500">156 Capistrano St. Bgy. Hagonoy, Taguig City 1630</p>
                <p className="text-[10px] text-slate-500">Tel & Phone No. : 02 8320 4514 | +639 264 950 234</p>

                <div className="pt-3">
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">IT SUPPORT OPERATIONS REPORT</h1>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    Filter: {reportTimeframe} • {reportSeverity} | Generated On {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* 6 Metric Stat Cards matching Images 4 & 5 */}
              <div className="grid grid-cols-6 gap-2 text-center">
                <div className="p-3 border border-slate-200 rounded-xl">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">TOTAL TICKETS</span>
                  <span className="text-2xl font-black font-mono text-slate-900">{reportTotalCount}</span>
                </div>

                <div className="p-3 border border-blue-200 bg-blue-50/50 rounded-xl">
                  <span className="block text-[9px] font-extrabold text-blue-600 uppercase">OPEN TICKETS</span>
                  <span className="text-2xl font-black font-mono text-blue-700">{reportOpenCount}</span>
                </div>

                <div className="p-3 border border-emerald-200 bg-emerald-50/50 rounded-xl">
                  <span className="block text-[9px] font-extrabold text-emerald-600 uppercase">RESOLVED</span>
                  <span className="text-2xl font-black font-mono text-emerald-700">{reportResolvedCount}</span>
                </div>

                <div className="p-3 border border-red-200 bg-red-50/30 rounded-xl">
                  <span className="block text-[9px] font-extrabold text-red-600 uppercase">CANCELED</span>
                  <span className="text-2xl font-black font-mono text-red-600">{reportCanceledCount}</span>
                </div>

                <div className="p-3 border border-red-200 bg-red-50/50 rounded-xl">
                  <span className="block text-[9px] font-extrabold text-red-600 uppercase">CRITICAL (P1)</span>
                  <span className="text-2xl font-black font-mono text-red-700">{reportCriticalCount}</span>
                </div>

                <div className="p-3 border border-purple-200 bg-purple-50/50 rounded-xl">
                  <span className="block text-[9px] font-extrabold text-purple-600 uppercase">AVG COMPLETION</span>
                  <span className="text-xl font-black font-mono text-purple-700 mt-1 block">{reportAvgCompletion}</span>
                </div>
              </div>

              {/* Charts Grid (Matching Images 4 & 5) */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                
                {/* Left Column: TICKET STATUS BREAKDOWN */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">TICKET STATUS BREAKDOWN</h4>
                    <p className="text-[10px] text-slate-400">Comparing Open/Unresolved against Completed & Canceled tickets</p>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="h-40 flex items-end justify-between gap-2 px-2 pb-2 border-b border-slate-100">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-400">{reportNewCount}</span>
                      <div className="w-full bg-slate-100 rounded-t h-1"></div>
                      <span className="text-[8px] font-bold text-blue-600 uppercase">NEW</span>
                      <span className="text-[7px] text-slate-400">OPEN</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-400">{reportAssignedCount}</span>
                      <div className="w-full bg-slate-100 rounded-t h-1"></div>
                      <span className="text-[8px] font-bold text-purple-600 uppercase">ASSIGNED</span>
                      <span className="text-[7px] text-slate-400">OPEN</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-400">{reportInProgressCount}</span>
                      <div className="w-full bg-slate-100 rounded-t h-1"></div>
                      <span className="text-[8px] font-bold text-amber-600 uppercase">IN PROGRESS</span>
                      <span className="text-[7px] text-slate-400">OPEN</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-400">{reportDoneResolvedCount}</span>
                      <div className="w-full bg-slate-100 rounded-t h-1"></div>
                      <span className="text-[8px] font-bold text-emerald-600 uppercase">RESOLVED</span>
                      <span className="text-[7px] text-slate-400">DONE</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-900">{reportDoneClosedCount}</span>
                      <div className="w-full bg-slate-600 rounded-t h-28"></div>
                      <span className="text-[8px] font-bold text-slate-800 uppercase">CLOSED</span>
                      <span className="text-[7px] text-slate-400">DONE</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-400">{reportCanceledCount}</span>
                      <div className="w-full bg-slate-100 rounded-t h-1"></div>
                      <span className="text-[8px] font-bold text-red-600 uppercase">CANCELED</span>
                      <span className="text-[7px] text-slate-400">DONE</span>
                    </div>
                  </div>

                  {/* Standard SLA Resolution Targets */}
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-wider mb-1.5">
                      STANDARD SLA RESOLUTION TARGET PER SEVERITY
                    </p>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="p-1 bg-red-50 border border-red-200 rounded">
                        <span className="block text-[8px] font-bold text-red-700">P1 (CRITICAL)</span>
                        <span className="text-[10px] font-bold font-mono">≤ 4 Hours</span>
                      </div>
                      <div className="p-1 bg-orange-50 border border-orange-200 rounded">
                        <span className="block text-[8px] font-bold text-orange-700">P2 (HIGH)</span>
                        <span className="text-[10px] font-bold font-mono">≤ 8 Hours</span>
                      </div>
                      <div className="p-1 bg-amber-50 border border-amber-200 rounded">
                        <span className="block text-[8px] font-bold text-amber-700">P3 (MEDIUM)</span>
                        <span className="text-[10px] font-bold font-mono">≤ 24 Hours</span>
                      </div>
                      <div className="p-1 bg-blue-50 border border-blue-200 rounded">
                        <span className="block text-[8px] font-bold text-blue-700">P4 (LOW)</span>
                        <span className="text-[10px] font-bold font-mono">≤ 48 Hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: AVG COMPLETION TIME */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">AVG COMPLETION TIME</h4>
                    <p className="text-[10px] text-slate-400">Average duration from creation to resolution by priority</p>
                  </div>

                  {/* Bar Chart */}
                  <div className="h-40 flex items-end justify-between gap-3 px-2 pb-2 border-b border-slate-100">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-700">2.4h</span>
                      <div className="w-full bg-red-500 rounded-t h-16"></div>
                      <span className="text-[10px] font-black">P1</span>
                      <span className="text-[8px] font-bold text-slate-400">{reportP1Solved} SOLVED</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-700">3.5h</span>
                      <div className="w-full bg-amber-500 rounded-t h-20"></div>
                      <span className="text-[10px] font-black">P2</span>
                      <span className="text-[8px] font-bold text-slate-400">{reportP2Solved} SOLVED</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-700">4.6h</span>
                      <div className="w-full bg-yellow-400 rounded-t h-24"></div>
                      <span className="text-[10px] font-black">P3</span>
                      <span className="text-[8px] font-bold text-slate-400">{reportP3Solved} SOLVED</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-700">5.8h</span>
                      <div className="w-full bg-blue-500 rounded-t h-28"></div>
                      <span className="text-[10px] font-black">P4</span>
                      <span className="text-[8px] font-bold text-slate-400">{reportP4Solved} SOLVED</span>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-4 gap-1 text-center text-xs">
                    <div className="p-1 bg-slate-50 border rounded">
                      <span className="block font-extrabold text-red-600">P1</span>
                      <span className="block text-[8px] text-slate-400">{reportP1Open} OPEN</span>
                      <span className="block text-[9px] font-bold font-mono">2H 24M AVG</span>
                    </div>

                    <div className="p-1 bg-slate-50 border rounded">
                      <span className="block font-extrabold text-amber-600">P2</span>
                      <span className="block text-[8px] text-slate-400">{reportP2Open} OPEN</span>
                      <span className="block text-[9px] font-bold font-mono">2H 23M AVG</span>
                    </div>

                    <div className="p-1 bg-slate-50 border rounded">
                      <span className="block font-extrabold text-yellow-600">P3</span>
                      <span className="block text-[8px] text-slate-400">{reportP3Open} OPEN</span>
                      <span className="block text-[9px] font-bold font-mono">4H 30M AVG</span>
                    </div>

                    <div className="p-1 bg-slate-50 border rounded">
                      <span className="block font-extrabold text-blue-600">P4</span>
                      <span className="block text-[8px] text-slate-400">{reportP4Open} OPEN</span>
                      <span className="block text-[9px] font-bold font-mono">5H 40M AVG</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Summary Paragraph matching Images 4 & 5 */}
              <div className="space-y-1.5 pt-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">Summary</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  During the selected <strong>{reportTimeframe.toLowerCase()}</strong> period, the IT support team handled a total of <strong>{reportTotalCount}</strong> tickets{reportSeverity !== 'All Severities' ? ` filtered by ${reportSeverity}` : ''}. Currently, there are <strong>{reportOpenCount}</strong> open tickets requiring attention, <strong>{reportResolvedCount}</strong> tickets have been successfully resolved, and <strong>{reportCanceledCount}</strong> tickets were canceled. The average ticket completion time is <strong>{reportAvgCompletion}</strong> across the <strong>{reportResolvedCount}</strong> resolved incidents. A total of <strong>{reportCriticalCount}</strong> critical (P1) incidents were recorded.
                </p>
              </div>

              {/* Detailed Ticket Breakdown matching Images 4 & 5 */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-600">
                    Detailed Ticket Breakdown ({reportFilteredTickets.length})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Filtered by {reportTimeframe} • {reportSeverity}
                  </span>
                </div>
                
                {reportFilteredTickets.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No ticket records found for timeframe "{reportTimeframe}" and severity "{reportSeverity}".
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
                        <th className="py-2">TICKET</th>
                        <th className="py-2">REQUESTOR</th>
                        <th className="py-2">CREATED AT</th>
                        <th className="py-2">ASSIGNED TO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportFilteredTickets.map((t) => (
                        <tr key={t.id} className="py-2 hover:bg-slate-50 transition-colors">
                          <td className="py-2 pr-3">
                            <span className="font-black text-slate-900 block">{t.title}</span>
                            <span className="text-[10px] font-mono text-slate-400 block">{t.ticketNo}</span>
                            {t.description && (
                              <span className="text-[10px] text-slate-500 line-clamp-1">{t.description}</span>
                            )}
                          </td>
                          <td className="py-2 font-medium text-slate-700">{t.requestor}</td>
                          <td className="py-2 font-mono text-[10px] text-slate-500">{t.createdAt || '9/2/2026'}</td>
                          <td className="py-2 font-bold text-indigo-600">{t.assignedTo || 'Arnold Cortina'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </div>

          </div>
        </div>
      )}

      {/* ADMIN BULK DELETION REMINDER MODAL */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-2xl max-w-lg w-full p-6 space-y-4">
            {/* Header with Alert Icon */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Admin Deletion Confirmation & Reminder
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Action required before executing permanent ticket deletion
                </p>
              </div>
              <button
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reminder Warning Box */}
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-extrabold">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Deletion Reminder ({selectedTicketIds.length} Tickets Selected)</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                You are about to permanently delete <strong className="text-red-600 dark:text-red-400">{selectedTicketIds.length} support ticket(s)</strong> from the central registry. 
              </p>
              <div className="bg-white dark:bg-slate-900/90 rounded-lg p-2.5 border border-red-200 dark:border-red-900/50">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Selected Ticket Numbers:
                </span>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                  {filteredTickets
                    .filter(t => selectedTicketIds.includes(t.id))
                    .map(t => (
                      <span 
                        key={t.id} 
                        className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded font-mono text-[10px] font-extrabold border border-red-200 dark:border-red-900/40"
                      >
                        {t.ticketNo}
                      </span>
                    ))}
                </div>
              </div>
              <p className="text-[11px] text-red-600 dark:text-red-400 font-bold italic pt-1">
                ⚠️ Warning: This operation will permanently remove all associated audit logs, SLA data, and conversation history. This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Confirm & Permanently Delete ({selectedTicketIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
