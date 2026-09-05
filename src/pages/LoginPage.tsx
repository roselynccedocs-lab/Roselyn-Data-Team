import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Chrome, Mail, Shield, Users, UserCheck, ArrowRight, Search } from 'lucide-react';
import { INITIAL_IT_USERS } from '../data/itStaffUsersData';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { CentaurLogo } from '../components/common/CentaurLogo';

export default function LoginPage() {
  const { user, loginWithGoogle, loginWithMicrosoft, loginAsUserProfile } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>(INITIAL_IT_USERS);
  const [selectedUserId, setSelectedUserId] = useState<string>(INITIAL_IT_USERS[0].id);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Sync users with Firestore if available, otherwise INITIAL_IT_USERS is the source of truth
  useEffect(() => {
    async function loadUsers() {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const map = new Map<string, UserProfile>();
          INITIAL_IT_USERS.forEach(u => map.set(u.email.toLowerCase(), u));
          snap.docs.forEach(docSnap => {
            const data = docSnap.data() as UserProfile;
            if (data.email) map.set(data.email.toLowerCase(), { ...data, id: docSnap.id });
          });
          setUsersList(Array.from(map.values()));
        }
      } catch (e) {}
    }
    loadUsers();
  }, []);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleProfileLogin = async () => {
    const targetUser = usersList.find(u => u.id === selectedUserId || u.email === selectedUserId) || usersList[0];
    if (targetUser) {
      setIsSigningIn(true);
      await loginAsUserProfile(targetUser);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8"
      >
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-3 p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-md">
            <CentaurLogo size={64} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Centaur Chem Enterprise</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">Enterprise-grade asset management & integrated ERP systems.</p>
        </div>

        <div className="space-y-4">
          {/* RBAC Integration Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              Role-Based Access Control (RBAC)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              OAuth Single Sign-On and Enterprise Staff Profiles synchronized directly with the <strong className="text-slate-700 dark:text-slate-300">IT Department User Management Hub</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-xs"
            >
              <Chrome className="w-4 h-4 text-blue-500" />
              Google Workspace
            </button>

            <button 
              onClick={loginWithMicrosoft}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-xs"
            >
              <Mail className="w-4 h-4 text-sky-600" />
              Microsoft 365
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Or Sign In with IT Staff Profile
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          {/* IT Department User Management Profile Selector */}
          <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 p-4 rounded-xl text-left space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Select Authorized Staff Profile:
              </label>
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                {usersList.length} Registered Users
              </span>
            </div>

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              {usersList.map((usr) => (
                <option key={usr.id || usr.email} value={usr.id || usr.email}>
                  {usr.displayName} — {usr.department} ({usr.position || 'Staff'}) [{usr.role || 'User'}]
                </option>
              ))}
            </select>

            {(() => {
              const currentSel = usersList.find(u => u.id === selectedUserId || u.email === selectedUserId);
              if (!currentSel) return null;
              return (
                <div className="p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-blue-100 dark:border-blue-900/40 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{currentSel.displayName}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${currentSel.role === 'Admin' || currentSel.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {currentSel.role || 'User'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    <span>{currentSel.email}</span>
                    <span>EMP: {currentSel.employeeNo || 'N/A'}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 text-[10px]">
                    Department: <strong className="text-blue-600 dark:text-blue-400">{currentSel.department}</strong> | Title: {currentSel.position || 'Staff'}
                  </div>
                </div>
              );
            })()}

            <button
              onClick={handleProfileLogin}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              {isSigningIn ? 'Signing In...' : 'Sign In as Selected Staff Profile'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500 leading-relaxed">
          Security audit logging is enforced. All logins and logouts are monitored in the <span className="font-bold text-slate-700 dark:text-slate-300">IT Security Audit Hub</span>.
        </p>
      </motion.div>
    </div>
  );
}
