import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, runTransaction,
  serverTimestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const casesCol = collection(db, 'cases');
const withId = (snap) => ({ id: snap.id, ...snap.data() });
const isDenied = (e) => e?.code === 'permission-denied';

// ---------- قراءة عامة ----------
export async function fetchPublishedCases() {
  const snap = await getDocs(query(casesCol, where('visibility', '==', 'published')));
  return snap.docs.map(withId);
}

export async function fetchPublishedCase(id) {
  try {
    const snap = await getDoc(doc(casesCol, id));
    if (!snap.exists()) return null;
    const c = withId(snap);
    return c.visibility === 'published' ? c : null;
  } catch (e) {
    if (isDenied(e)) return null; // غير منشورة أو غير موجودة
    throw e;
  }
}

/** بيانات التواصل: تُرجَع فقط إن سمحت الإدارة (القواعد تفرض ذلك) */
export async function fetchPublicContact(id) {
  try {
    const snap = await getDoc(doc(db, 'case_contacts', id));
    const c = snap.exists() ? snap.data() : null;
    return c && c.show ? c : null;
  } catch (e) {
    if (isDenied(e)) return null;
    throw e;
  }
}

// ---------- الإدارة ----------
export async function fetchAllCases() {
  const snap = await getDocs(query(casesCol, orderBy('createdAt', 'desc')));
  return snap.docs.map(withId);
}

export async function fetchCase(id) {
  const snap = await getDoc(doc(casesCol, id));
  return snap.exists() ? withId(snap) : null;
}

export async function fetchContact(id) {
  const snap = await getDoc(doc(db, 'case_contacts', id));
  return snap.exists() ? snap.data() : null;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // بدون حروف متشابهة (I O 0 1)
function randomCode() {
  const bytes = new Uint32Array(6);
  crypto.getRandomValues(bytes);
  return `HC-${Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')}`;
}

/** ينشئ حالة بكود فريد (الكود هو معرّف المستند، والـ transaction يضمن عدم التكرار) */
export async function createCase(data, contact) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomCode();
    const caseRef = doc(casesCol, code);
    const contactRef = doc(db, 'case_contacts', code);
    try {
      await runTransaction(db, async (tx) => {
        if ((await tx.get(caseRef)).exists()) throw new Error('CODE_EXISTS');
        tx.set(caseRef, { ...data, code, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        tx.set(contactRef, { ...contact, updatedAt: serverTimestamp() });
      });
      return code;
    } catch (e) {
      if (e.message !== 'CODE_EXISTS') throw e;
    }
  }
  throw new Error('تعذر إنشاء كود فريد للحالة. حاول مرة أخرى.');
}

export async function updateCase(id, data, contact) {
  const batch = writeBatch(db);
  batch.update(doc(casesCol, id), { ...data, updatedAt: serverTimestamp() });
  batch.set(doc(db, 'case_contacts', id), { ...contact, updatedAt: serverTimestamp() });
  await batch.commit();
}

/** تعديل جزئي سريع (نشر/إخفاء/إكمال/تمييز) */
export async function patchCase(id, patch) {
  await updateDoc(doc(casesCol, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteCase(id) {
  const batch = writeBatch(db);
  batch.delete(doc(casesCol, id));
  batch.delete(doc(db, 'case_contacts', id));
  await batch.commit();
}

/** يعيد ترقيم sortOrder حسب الترتيب المعطى (الأول = أعلى قيمة = يظهر أولًا) */
export async function saveOrder(orderedCases) {
  const n = orderedCases.length;
  const changed = orderedCases
    .map((c, i) => ({ id: c.id, sortOrder: n - i, old: c.sortOrder }))
    .filter((x) => x.sortOrder !== x.old);
  for (let i = 0; i < changed.length; i += 400) {
    const batch = writeBatch(db);
    changed.slice(i, i + 400).forEach((x) =>
      batch.update(doc(casesCol, x.id), { sortOrder: x.sortOrder, updatedAt: serverTimestamp() }),
    );
    await batch.commit();
  }
  return changed;
}
