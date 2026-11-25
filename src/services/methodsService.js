import {
  addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const col = collection(db, 'donation_methods');
const withId = (s) => ({ id: s.id, ...s.data() });
const byNewest = (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);

/** للزوار: المفعّلة فقط */
export async function fetchActiveMethods() {
  const snap = await getDocs(query(col, where('active', '==', true)));
  return snap.docs.map(withId).sort(byNewest);
}

/** للإدارة: الكل */
export async function fetchAllMethods() {
  const snap = await getDocs(col);
  return snap.docs.map(withId).sort(byNewest);
}

export async function createMethod(data) {
  const ref = await addDoc(col, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateMethod(id, data) {
  await updateDoc(doc(col, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteMethod(id) {
  await deleteDoc(doc(col, id));
}
