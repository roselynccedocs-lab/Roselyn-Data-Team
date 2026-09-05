import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2,
  Users, 
  Package, 
  CreditCard, 
  Briefcase, 
  Factory, 
  Truck, 
  Ticket, 
  BarChart3, 
  Settings,
  UserCircle,
  HeartHandshake,
  UserPlus,
  Target,
  ShoppingCart,
  Receipt
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { CentaurLogo } from '../common/CentaurLogo';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Management Office', icon: Building2, path: '/management-office' },
  { name: 'Human Resources', icon: Briefcase, path: '/hr' },
  { name: 'Operations', icon: Factory, path: '/operations' },
  { name: 'Sales', icon: Users, path: '/sales' },
  { name: 'Asset and Data', icon: Package, path: '/data-asset' },
  { name: 'Purchasing & Logistics', icon: Truck, path: '/purchasing-logistics' },
  { name: 'IT Department', icon: Ticket, path: '/it' },
  { name: 'Finance (Acct, Treasury)', icon: BarChart3, path: '/finance-dept' },
];

export function Sidebar() {
  const { profile } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="p-1 bg-emerald-950/80 rounded-xl border border-emerald-800 flex items-center justify-center shrink-0 shadow-md">
          <CentaurLogo size={32} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-extrabold text-xs text-white tracking-wide uppercase leading-tight truncate">Centaur Chem</h1>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Enterprise Systems</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Enterprise Modules
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
              isActive 
                ? "bg-blue-600 text-white shadow-sm font-bold" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/60">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center text-xs">
              AC
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{profile?.displayName || 'Dr. Arnold Cortina'}</p>
            <p className="text-[10px] text-slate-400 truncate">{profile?.role || 'Lead Formulation Chemist'}</p>
          </div>
          <Settings className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
}
