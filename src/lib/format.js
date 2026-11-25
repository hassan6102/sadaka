const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** يحوّل الأرقام العربية/الفارسية إلى لاتينية */
export function toLatinDigits(value) {
  return String(value ?? '').replace(/[٠-٩۰-۹]/g, (d) => {
    const i = AR_DIGITS.indexOf(d);
    return String(i >= 0 ? i : FA_DIGITS.indexOf(d));
  });
}

const amountFmt = new Intl.NumberFormat('ar-EG-u-nu-latn', { maximumFractionDigits: 2 });
export const formatAmount = (n) => `${amountFmt.format(n)} ج.م`;

const dateFmt = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { dateStyle: 'medium' });
export function formatDate(ts) {
  const d = ts?.toDate ? ts.toDate() : null;
  return d ? dateFmt.format(d) : '';
}

export const millis = (ts) => (ts?.toMillis ? ts.toMillis() : 0);

/** نسبة المبلغ المجموع (0-100) أو null إن لم تتوفر البيانات */
export function progressPercent(c) {
  if (!c.showCollected || !(c.requiredAmount > 0) || c.collectedAmount == null) return null;
  return Math.min(100, Math.round((c.collectedAmount / c.requiredAmount) * 100));
}

/** تطبيع نص عربي للبحث: يزيل التشكيل ويوحّد الألف والياء والتاء المربوطة */
export function normalizeAr(s) {
  return toLatinDigits(s)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

/** رقم واتساب بصيغة دولية لرابط wa.me (يفترض مصر للأرقام المحلية) */
export function whatsappNumber(raw) {
  let n = toLatinDigits(raw).replace(/[^\d]/g, '');
  if (n.startsWith('00')) n = n.slice(2);
  else if (n.startsWith('0')) n = `20${n.slice(1)}`;
  return n;
}

export const telHref = (raw) => `tel:${toLatinDigits(raw).replace(/[^\d+]/g, '')}`;

export function whatsappHref(raw, message) {
  return `https://wa.me/${whatsappNumber(raw)}?text=${encodeURIComponent(message)}`;
}

/** رسالة خطأ عربية مفهومة من خطأ Firebase */
export function errorMessage(e) {
  switch (e?.code) {
    case 'permission-denied':
      return 'ليست لديك صلاحية لتنفيذ هذا الإجراء، أو رُفضت البيانات من قواعد الأمان.';
    case 'unavailable':
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    case 'auth/too-many-requests':
      return 'محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.';
    default:
      return e?.message && /[\u0600-\u06FF]/.test(e.message)
        ? e.message
        : 'حدث خطأ غير متوقع. حاول مرة أخرى.';
  }
}
