// اختبارات قواعد Firestore — تحتاج Firebase Emulator (و Java). التشغيل: npm run test:rules
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where,
} from 'firebase/firestore';

let env;

const validCase = (code, extra = {}) => ({
  code, title: 'علاج طفل', type: 'علاج', summary: 'وصف مختصر', details: 'تفاصيل كاملة',
  requiredAmount: 5000, collectedAmount: null, showCollected: false,
  visibility: 'published', fundingStatus: 'needs_support', featured: false, sortOrder: 1,
  includeGeneralMethods: true, methodIds: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  ...extra,
});

const validMethod = (extra = {}) => ({
  name: 'Vodafone Cash', type: 'vodafone_cash', value: '01000000000', accountHolder: '',
  instructions: '', isGeneral: true, active: true,
  createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-cases',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});
afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'admins/adminUid'), { email: 'a@a.com' });
    await setDoc(doc(db, 'cases/HC-PUB111'), validCase('HC-PUB111'));
    await setDoc(doc(db, 'cases/HC-HID111'), validCase('HC-HID111', { visibility: 'hidden' }));
    await setDoc(doc(db, 'case_contacts/HC-PUB111'), { name: '', phone: '0100', whatsapp: '', show: true, updatedAt: new Date() });
    await setDoc(doc(db, 'case_contacts/HC-HID111'), { name: '', phone: '0100', whatsapp: '', show: true, updatedAt: new Date() });
    await setDoc(doc(db, 'donation_methods/m1'), validMethod());
    await setDoc(doc(db, 'donation_methods/m2'), validMethod({ active: false }));
  });
});

const visitor = () => env.unauthenticatedContext().firestore();
const stranger = () => env.authenticatedContext('someUser').firestore();
const admin = () => env.authenticatedContext('adminUid').firestore();

describe('الزوار', () => {
  test('يقرؤون الحالة المنشورة فقط', async () => {
    await assertSucceeds(getDoc(doc(visitor(), 'cases/HC-PUB111')));
    await assertFails(getDoc(doc(visitor(), 'cases/HC-HID111')));
  });
  test('استعلام المنشورة ينجح، واستعلام الكل يفشل', async () => {
    await assertSucceeds(getDocs(query(collection(visitor(), 'cases'), where('visibility', '==', 'published'))));
    await assertFails(getDocs(collection(visitor(), 'cases')));
  });
  test('لا يكتبون ولا يحذفون', async () => {
    await assertFails(setDoc(doc(visitor(), 'cases/HC-NEW111'), validCase('HC-NEW111')));
    await assertFails(updateDoc(doc(visitor(), 'cases/HC-PUB111'), { title: 'تعديل' }));
    await assertFails(deleteDoc(doc(visitor(), 'cases/HC-PUB111')));
  });
  test('بيانات التواصل: تظهر للمنشورة المسموحة فقط', async () => {
    await assertSucceeds(getDoc(doc(visitor(), 'case_contacts/HC-PUB111')));
    await assertFails(getDoc(doc(visitor(), 'case_contacts/HC-HID111')));
  });
  test('وسائل التبرع: المفعّلة فقط', async () => {
    await assertSucceeds(getDoc(doc(visitor(), 'donation_methods/m1')));
    await assertFails(getDoc(doc(visitor(), 'donation_methods/m2')));
  });
  test('إعدادات الموقع قراءة عامة وكتابة ممنوعة', async () => {
    await assertSucceeds(getDoc(doc(visitor(), 'site_settings/main')));
    await assertFails(setDoc(doc(visitor(), 'site_settings/main'), { siteName: 'x' }));
  });
  test('لا يقرؤون admins', async () => {
    await assertFails(getDoc(doc(visitor(), 'admins/adminUid')));
  });
});

describe('مستخدم مسجّل ليس مسؤولًا', () => {
  test('لا يكتب ولا يقرأ المخفي', async () => {
    await assertFails(setDoc(doc(stranger(), 'cases/HC-NEW111'), validCase('HC-NEW111')));
    await assertFails(getDoc(doc(stranger(), 'cases/HC-HID111')));
  });
  test('لا يستطيع إنشاء مستند admins لنفسه', async () => {
    await assertFails(setDoc(doc(stranger(), 'admins/someUser'), { email: 'x' }));
  });
});

describe('المسؤول', () => {
  test('ينشئ حالة صحيحة ويقرأ المخفية', async () => {
    await assertSucceeds(setDoc(doc(admin(), 'cases/HC-NEW111'), validCase('HC-NEW111')));
    await assertSucceeds(getDoc(doc(admin(), 'cases/HC-HID111')));
  });
  test('يُرفض: كود لا يطابق المعرّف، حقل زائد، حالة نشر غير معروفة، مبلغ سالب', async () => {
    await assertFails(setDoc(doc(admin(), 'cases/HC-NEW111'), validCase('HC-OTHER1')));
    await assertFails(setDoc(doc(admin(), 'cases/HC-NEW111'), validCase('HC-NEW111', { extra: 1 })));
    await assertFails(setDoc(doc(admin(), 'cases/HC-NEW111'), validCase('HC-NEW111', { visibility: 'x' })));
    await assertFails(setDoc(doc(admin(), 'cases/HC-NEW111'), validCase('HC-NEW111', { requiredAmount: -5 })));
  });
  test('يعدّل ويحذف', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'cases/HC-PUB111'), { visibility: 'paused', updatedAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(doc(admin(), 'cases/HC-PUB111')));
  });
  test('وسيلة تبرع: صحيحة تنجح، نوع غير معروف يفشل', async () => {
    await assertSucceeds(setDoc(doc(admin(), 'donation_methods/m3'), validMethod()));
    await assertFails(setDoc(doc(admin(), 'donation_methods/m4'), validMethod({ type: 'paypal' })));
  });
  test('إعدادات: رابط غير https يُرفض', async () => {
    const base = {
      siteName: 'موقع', logoText: '', description: '', phone: '', whatsapp: '', facebook: '', instagram: '',
      x: '', youtube: '', telegram: '', email: '', address: '', footerText: '', updatedAt: serverTimestamp(),
    };
    await assertSucceeds(setDoc(doc(admin(), 'site_settings/main'), base));
    await assertFails(setDoc(doc(admin(), 'site_settings/main'), { ...base, facebook: 'javascript:alert(1)' }));
  });
  test('لا يكتب في admins من العميل', async () => {
    await assertFails(setDoc(doc(admin(), 'admins/another'), { email: 'x' }));
  });
});
