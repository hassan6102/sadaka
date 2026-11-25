import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// قيم الإعداد عامة بطبيعتها (ليست أسرارًا). الحماية الفعلية تأتي من Firestore Rules.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export const app = initializeApp(config);
export const db = getFirestore(app);
