import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, microsoftProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { recordLoginEvent, recordLogoutEvent } from '../services/securityAuditService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  loginAsUserProfile: (profile: UserProfile) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there is an active local user profile session
    try {
      const cached = localStorage.getItem('cc_current_user_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.email) {
          setProfile(parsed);
          setUser({
            uid: parsed.id || parsed.uid || parsed.email,
            email: parsed.email,
            displayName: parsed.displayName
          } as any);
        }
      }
    } catch (e) {}

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userEmail = (firebaseUser.email || '').toLowerCase();
          const isAdminEmail = userEmail === 'arnoldcortina.cce@gmail.com' || userEmail === 'arnoldcortina.cce.docs@gmail.com' || userEmail === 'arnold.cortina@cce.com';
          
          const providerId = firebaseUser.providerData[0]?.providerId || '';
          const providerName = providerId.includes('google') ? 'Google Workspace OAuth' : providerId.includes('microsoft') ? 'Microsoft 365 SSO' : 'OAuth SSO';

          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const existingData = docSnap.data() as UserProfile;
            const updatedProfile: UserProfile = {
              ...existingData,
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email || existingData.email,
              displayName: firebaseUser.displayName || existingData.displayName || 'User',
              role: isAdminEmail ? 'ADMIN' : (existingData.role || 'EMPLOYEE'),
              department: isAdminEmail ? 'IT Department' : (existingData.department || 'General'),
              photoURL: firebaseUser.photoURL || existingData.photoURL,
              provider: providerName,
              status: existingData.status || 'ACTIVE',
              lastLogin: Date.now()
            };
            await setDoc(docRef, updatedProfile, { merge: true });
            setProfile(updatedProfile);
            try {
              localStorage.setItem('cc_current_user_profile', JSON.stringify(updatedProfile));
            } catch (e) {}
            recordLoginEvent(updatedProfile, providerName);
          } else {
            // Create default profile for new user
            const newProfile: UserProfile = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: isAdminEmail ? 'ADMIN' : 'EMPLOYEE',
              department: isAdminEmail ? 'IT Department' : 'General',
              photoURL: firebaseUser.photoURL || undefined,
              provider: providerName,
              status: 'ACTIVE',
              createdAt: Date.now(),
              lastLogin: Date.now()
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
            try {
              localStorage.setItem('cc_current_user_profile', JSON.stringify(newProfile));
            } catch (e) {}
            recordLoginEvent(newProfile, providerName);
          }
        } catch (error) {
          console.warn("Auth profile sync error:", error);
          // Fallback profile if Firestore is unavailable
          const isUserAdmin = (firebaseUser.email || '').toLowerCase().includes('arnoldcortina');
          const fallbackProfile: UserProfile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            role: isUserAdmin ? 'ADMIN' : 'EMPLOYEE',
            department: isUserAdmin ? 'IT Department' : 'General',
            photoURL: firebaseUser.photoURL || undefined,
            provider: 'Google/Microsoft',
            status: 'ACTIVE',
            createdAt: Date.now(),
            lastLogin: Date.now()
          };
          setProfile(fallbackProfile);
          try {
            localStorage.setItem('cc_current_user_profile', JSON.stringify(fallbackProfile));
          } catch (e) {}
          recordLoginEvent(fallbackProfile, 'SSO OAuth');
        }
      } else {
        // If not logged in via Firebase, keep local profile if exists, else clear
        const cached = localStorage.getItem('cc_current_user_profile');
        if (!cached) {
          setProfile(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      if (error?.code === 'auth/operation-not-allowed') {
        alert("Google Authentication is not yet enabled in your Firebase Console. Please enable Google Sign-In in Firebase Console > Authentication > Sign-in method, or use the Enterprise User Directory below.");
      } else {
        alert(`Authentication Error: ${error.message || error}`);
      }
    }
  };

  const loginWithMicrosoft = async () => {
    try {
      await signInWithPopup(auth, microsoftProvider);
    } catch (error: any) {
      console.error("Microsoft Sign-In error:", error);
      alert(`Microsoft Auth Error: ${error.message || error}`);
    }
  };

  const loginAsUserProfile = async (userProfile: UserProfile) => {
    const updated: UserProfile = {
      ...userProfile,
      lastLogin: Date.now()
    };
    setProfile(updated);
    setUser({
      uid: userProfile.id || userProfile.uid || userProfile.email,
      email: userProfile.email,
      displayName: userProfile.displayName
    } as any);
    try {
      localStorage.setItem('cc_current_user_profile', JSON.stringify(updated));
    } catch (e) {}
    await recordLoginEvent(updated, 'Enterprise User Management SSO');
  };

  const loginAsDemo = () => {
    const demoProfile: UserProfile = {
      id: 'usr_arnold_cortina',
      uid: 'usr_arnold_cortina',
      email: 'arnoldcortina.cce@gmail.com',
      displayName: 'Arnold Cortina (Chief Administrator)',
      role: 'ADMIN',
      department: 'IT Department',
      provider: 'Enterprise SSO',
      status: 'ACTIVE',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      createdAt: Date.now(),
      lastLogin: Date.now()
    };
    loginAsUserProfile(demoProfile);
  };

  const logout = async () => {
    try {
      if (profile) {
        await recordLogoutEvent(profile, 'User Initiated Sign-Out');
      }
    } catch (e) {
      console.error(e);
    }
    try {
      await signOut(auth);
    } catch (e) {}
    localStorage.removeItem('cc_current_user_profile');
    setProfile(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, loginWithMicrosoft, loginAsUserProfile, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
