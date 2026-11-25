import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../lib/auth';
import { db } from '../lib/firebase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// المسؤول = مستخدم لديه مستند admins/{uid}. القواعد في الخادم هي المرجع الفعلي للصلاحيات؛
// هذا الفحص هنا لتجربة الاستخدام فقط (إخفاء اللوحة عن غير المسؤولين).
async function checkAdmin(uid) {
  try {
    return (await getDoc(doc(db, 'admins', uid))).exists();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, isAdmin: false });

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) return setState({ loading: false, user: null, isAdmin: false });
        const isAdmin = await checkAdmin(user.uid);
        return setState({ loading: false, user, isAdmin });
      }),
    [],
  );

  const login = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!(await checkAdmin(cred.user.uid))) {
      await signOut(auth);
      throw new Error('هذا الحساب ليس حساب مسؤول. تأكد من إنشاء مستند admins الخاص به.');
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);
  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
