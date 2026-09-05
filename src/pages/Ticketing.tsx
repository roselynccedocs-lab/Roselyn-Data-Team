import { useState } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { Ticket } from '../types';
import { formatDate } from '../lib/utils';
import { Ticket as TicketIcon, Plus, Search, MessageSquare, Clock } from 'lucide-react';

const mockTickets: Ticket[] = [
  { id: '1', title: 'VPN Connection Issues', description: 'Cannot connect to the office VPN from home.', priority: 'HIGH', status: 'OPEN', createdBy: 'John Doe', createdAt: Date.now() - 3600000, updatedAt: Date.now() },
  { id: '2', title: 'Laptop Screen Flicker', description: 'Screen flickering on Dell Latitude.', priority: 'MEDIUM', status: 'IN_PROGRESS', createdBy: 'Jane Smith', assignedTo: 'IT Support', createdAt: Date.now() - 86400000, updatedAt: Date.now() },
  { id: '3', title: 'New Employee Software Setup', description: 'Need Photoshop and Illustrator for new designer.', priority: 'LOW', status: 'RESOLVED', createdBy: 'Mark Wilson', assignedTo: 'Admin', createdAt: Date.now() - 172800000, updatedAt: Date.now() },
];

export default function TicketingPage() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  const getPriorityBadge = (p: string) => {
    const colors: any = {
      LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
      MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colors[p]}`}>{p}</span>;
  };

  const getStatusBadge = (s: string) => {
    const colors: any = {
      OPEN: 'border border-blue-500 text-blue-500',
      IN_PROGRESS: 'border border-orange-500 text-orange-500',
      RESOLVED: 'border border-green-500 text-green-500',
      CLOSED: 'border border-slate-500 text-slate-500',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colors[s]}`}>{s.replace('_', ' ')}</span>;
  };

  const createTicket = async () => {
    // In a real app, this would be a form
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Support Request',
      description: 'Automatically generated for demo purposes.',
      priority: 'MEDIUM',
      status: 'OPEN',
      createdBy: 'Demo User',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setTickets([newTicket, ...tickets]);

    // Trigger notification
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@gr8erp.com',
          subject: `New Ticket: ${newTicket.title}`,
          message: `A new ticket has been created by ${newTicket.createdBy}. Priority: ${newTicket.priority}`
        })
      });
    } catch (e) {
      console.error("Notification failed", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IT Support & Ticketing</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage internal support requests and system maintenance.</p>
        </div>
        <button 
          onClick={createTicket}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Mean Time to Resolve</p>
            <p className="text-xl font-bold">4.2 Hours</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-2 bg-orange-500/10 text-orange-600 rounded-lg"><MessageSquare className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Unassigned Tickets</p>
            <p className="text-xl font-bold">8</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-2 bg-green-500/10 text-green-600 rounded-lg"><TicketIcon className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Resolution Rate</p>
            <p className="text-xl font-bold">92%</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <DataTable<Ticket> 
        data={tickets}
        columns={[
          { header: 'ID', accessor: (t) => <span className="font-mono text-xs opacity-50">#{t.id}</span> },
          { header: 'Title', accessor: (t) => (
            <div>
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-slate-500">{t.createdBy}</p>
            </div>
          )},
          { header: 'Priority', accessor: (t) => getPriorityBadge(t.priority) },
          { header: 'Status', accessor: (t) => getStatusBadge(t.status) },
          { header: 'Assigned To', accessor: (t) => t.assignedTo || <span className="text-slate-400 italic">Unassigned</span> },
          { header: 'Last Update', accessor: (t) => formatDate(t.updatedAt), className: 'text-slate-500 text-xs' },
        ]}
      />
    </div>
  );
}
