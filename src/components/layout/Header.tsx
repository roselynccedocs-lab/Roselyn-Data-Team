import { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Menu, LogOut, CheckCircle2, Ticket, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SubmitSupportButton } from '../ui/SubmitSupportButton';

export interface HeaderNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  ticketId?: string;
  createdAt: string;
  read: boolean;
}

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { profile, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Notifications state
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
  }, [isDark]);

  // Subscribe to real-time central notifications from Firestore
  useEffect(() => {
    try {
      const notifQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(15));
      const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
        const notifList: HeaderNotification[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as HeaderNotification));

        // Default initial notifications if empty
        if (notifList.length === 0) {
          setNotifications([
            {
              id: 'init_1',
              type: 'new_ticket',
              title: '🚨 Central IT Helpdesk Ready',
              message: 'Central DB synced. End-user support tickets will trigger instant alerts for IT ADMIN.',
              createdAt: new Date().toISOString(),
              read: false
            }
          ]);
        } else {
          setNotifications(notifList);
        }
      }, (error) => {
        console.warn('Notifications real-time listener notice:', error);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Notifications initialization error:', err);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative max-w-md hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input 
            type="text" 
            placeholder="Search records, tickets, or inventory..." 
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs w-72 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Submit Support Request Button - ALWAYS visible in Top Header across all department views */}
        <SubmitSupportButton variant="header" />

        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
        
        {/* Notification Bell Menu with Real-Time IT Admin Alerts */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
            title="IT Admin Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-scale-up">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">IT Admin Alerts & Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      className={`p-3.5 transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                          <Ticket className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 text-center bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">
                  Central DB active • Syncs automatically across IT Helpdesk
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* User Info Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            {(profile?.displayName || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="text-left leading-none hidden md:block">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {profile?.displayName || 'Arnold Cortina'}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block">
              {profile?.role === 'ADMIN' ? 'Chief Admin (24/7)' : (profile?.department || 'User')}
            </span>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors ml-1"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
