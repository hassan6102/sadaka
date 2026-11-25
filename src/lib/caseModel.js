import { toLatinDigits } from './format';

export const emptyCaseForm = {
  title: '', type: '', summary: '', details: '',
  requiredAmount: '', collectedAmount: '', showCollected: false,
  visibility: 'published', fundingStatus: 'needs_support', featured: false,
  includeGeneralMethods: true, methodIds: [],
  contactName: '', contactPhone: '', contactWhatsapp: '', contactShow: false,
};

export function toFormValues(c, contact) {
  return {
    title: c.title, type: c.type, summary: c.summary, details: c.details,
    requiredAmount: c.requiredAmount ?? '', collectedAmount: c.collectedAmount ?? '',
    showCollected: c.showCollected, visibility: c.visibility, fundingStatus: c.fundingStatus,
    featured: c.featured, includeGeneralMethods: c.includeGeneralMethods, methodIds: c.methodIds || [],
    contactName: contact?.name ?? '', contactPhone: contact?.phone ?? '',
    contactWhatsapp: contact?.whatsapp ?? '', contactShow: contact?.show ?? false,
  };
}

export function toNumberOrNull(v) {
  if (v === '' || v == null) return null;
  const n = Number(toLatinDigits(v).replace(/[,\s]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

export function fromFormValues(v) {
  return {
    data: {
      title: v.title.trim(),
      type: v.type.trim(),
      summary: v.summary.trim(),
      details: v.details.trim(),
      requiredAmount: toNumberOrNull(v.requiredAmount),
      collectedAmount: toNumberOrNull(v.collectedAmount),
      showCollected: v.showCollected,
      visibility: v.visibility,
      fundingStatus: v.fundingStatus,
      featured: v.featured,
      includeGeneralMethods: v.includeGeneralMethods,
      methodIds: v.methodIds,
    },
    contact: {
      name: v.contactName.trim(),
      phone: toLatinDigits(v.contactPhone).trim(),
      whatsapp: toLatinDigits(v.contactWhatsapp).trim(),
      show: v.contactShow,
    },
  };
}

const PHONE_RE = /^\+?[0-9\s-]{7,20}$/;

export function validateCase(v) {
  const e = {};
  if (v.title.trim().length < 3) e.title = 'اكتب عنوانًا من 3 أحرف على الأقل.';
  else if (v.title.trim().length > 150) e.title = 'العنوان أطول من 150 حرفًا.';
  if (!v.type.trim()) e.type = 'اختر نوع الحالة أو اكتبه.';
  else if (v.type.trim().length > 40) e.type = 'نوع الحالة أطول من 40 حرفًا.';
  if (!v.summary.trim()) e.summary = 'اكتب وصفًا مختصرًا.';
  else if (v.summary.trim().length > 300) e.summary = 'الوصف المختصر أطول من 300 حرف.';
  if (!v.details.trim()) e.details = 'اكتب تفاصيل الحالة.';
  else if (v.details.trim().length > 10000) e.details = 'التفاصيل أطول من 10000 حرف.';

  const req = toNumberOrNull(v.requiredAmount);
  const col = toNumberOrNull(v.collectedAmount);
  if (Number.isNaN(req) || (req !== null && req <= 0)) e.requiredAmount = 'أدخل مبلغًا صحيحًا أكبر من صفر، أو اتركه فارغًا.';
  if (Number.isNaN(col) || (col !== null && col < 0)) e.collectedAmount = 'أدخل مبلغًا صحيحًا (صفر أو أكبر)، أو اتركه فارغًا.';
  if (v.showCollected && col === null) e.collectedAmount = 'أدخل المبلغ المجموع أو ألغِ خيار عرضه.';

  const phone = toLatinDigits(v.contactPhone).trim();
  const wa = toLatinDigits(v.contactWhatsapp).trim();
  if (phone && !PHONE_RE.test(phone)) e.contactPhone = 'رقم الهاتف غير صحيح.';
  if (wa && !PHONE_RE.test(wa)) e.contactWhatsapp = 'رقم الواتساب غير صحيح.';
  if (v.contactShow && !phone && !wa) e.contactShow = 'أدخل رقم هاتف أو واتساب قبل السماح بعرض بيانات التواصل.';
  return e;
}
