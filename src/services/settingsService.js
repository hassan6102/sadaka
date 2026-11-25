import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_SETTINGS } from '../lib/constants';

const ref = doc(db, 'site_settings', 'main');

export async function fetchSettings() {
  const snap = await getDoc(ref);
  return { ...DEFAULT_SETTINGS, ...(snap.exists() ? snap.data() : {}) };
}

export async function saveSettings(values) {
  const data = {};
  Object.keys(DEFAULT_SETTINGS).forEach((k) => {
    data[k] = String(values[k] ?? '').trim();
  });
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() });
}
