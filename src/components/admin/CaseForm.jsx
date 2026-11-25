import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CASE_TYPE_SUGGESTIONS, FUNDING_STATUS, METHOD_TYPES, VISIBILITY } from '../../lib/constants';
import { validateCase } from '../../lib/caseModel';
import { Field, Toggle } from '../ui/Field';

function Section({ title, children }) {
  return (
    <fieldset className="card space-y-4 p-5">
      <legend className="float-start mb-1 px-0 font-display text-lg font-bold">{title}</legend>
      <div className="clear-both space-y-4">{children}</div>
    </fieldset>
  );
}

export default function CaseForm({ initial, methods, code, onSubmit, saving }) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k) => (val) => setV((s) => ({ ...s, [k]: val }));
  const input = (k) => ({ id: k, className: 'input', value: v[k], onChange: (e) => set(k)(e.target.value) });

  const toggleMethod = (id) =>
    setV((s) => ({ ...s, methodIds: s.methodIds.includes(id) ? s.methodIds.filter((m) => m !== id) : [...s.methodIds, id] }));

  const submit = (e) => {
    e.preventDefault();
    const errs = validateCase(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    onSubmit(v);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Section title="بيانات الحالة">
        {code && <p className="text-sm text-muted">كود الحالة: <span className="font-mono font-bold text-ink" dir="ltr">{code}</span> (يُنشأ تلقائيًا ولا يتغير)</p>}
        <Field label="عنوان الحالة" htmlFor="title" required error={errors.title}>
          <input {...input('title')} maxLength={150} />
        </Field>
        <Field label="نوع الحالة" htmlFor="type" required error={errors.type} hint="اختر من الاقتراحات أو اكتب نوعًا آخر.">
          <input {...input('type')} list="case-types" maxLength={40} />
          <datalist id="case-types">{CASE_TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}</datalist>
        </Field>
        <Field label="وصف مختصر" htmlFor="summary" required error={errors.summary} hint="يظهر في كارت الحالة (حتى 300 حرف).">
          <textarea {...input('summary')} rows={3} maxLength={300} />
        </Field>
        <Field label="الوصف والتفاصيل الكاملة" htmlFor="details" required error={errors.details} hint="الظروف والاحتياجات. تُحفظ فواصل الأسطر.">
          <textarea {...input('details')} rows={9} maxLength={10000} />
        </Field>
      </Section>

      <Section title="المبالغ">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المبلغ المطلوب (ج.م) — اختياري" htmlFor="requiredAmount" error={errors.requiredAmount}>
            <input {...input('requiredAmount')} inputMode="decimal" dir="ltr" />
          </Field>
          <Field label="المبلغ الذي تم جمعه (ج.م) — اختياري" htmlFor="collectedAmount" error={errors.collectedAmount} hint="تحدّثه يدويًا.">
            <input {...input('collectedAmount')} inputMode="decimal" dir="ltr" />
          </Field>
        </div>
        <Toggle id="showCollected" checked={v.showCollected} onChange={set('showCollected')} label="عرض المبلغ المجموع والمتبقي للزوار" />
      </Section>

      <Section title="النشر والحالة">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="حالة النشر" htmlFor="visibility">
            <select {...input('visibility')}>{Object.entries(VISIBILITY).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </Field>
          <Field label="حالة التبرع" htmlFor="fundingStatus">
            <select {...input('fundingStatus')}>{Object.entries(FUNDING_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </Field>
        </div>
        <Toggle id="featured" checked={v.featured} onChange={set('featured')} label="تمييز الحالة في الصفحة الرئيسية (الأكثر احتياجًا)" />
      </Section>

      <Section title="وسائل التبرع">
        <Toggle id="includeGeneralMethods" checked={v.includeGeneralMethods} onChange={set('includeGeneralMethods')} label="عرض وسائل التبرع العامة للموقع في صفحة هذه الحالة" />
        {methods.length === 0 ? (
          <p className="text-sm text-muted">لا توجد وسائل تبرع. <Link to="/admin/methods" className="font-bold text-brand hover:underline">أضف وسيلة</Link> أولًا.</p>
        ) : (
          <div>
            <p className="label">وسائل خاصة بهذه الحالة</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {methods.map((m) => (
                <label key={m.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-line p-3 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-brand" checked={v.methodIds.includes(m.id)} onChange={() => toggleMethod(m.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{m.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {METHOD_TYPES[m.type]}{m.isGeneral ? ' • عامة' : ''}{m.active ? '' : ' • مخفية'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="بيانات التواصل (اختيارية)">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="اسم المسؤول" htmlFor="contactName"><input {...input('contactName')} maxLength={80} /></Field>
          <Field label="رقم الهاتف" htmlFor="contactPhone" error={errors.contactPhone}><input {...input('contactPhone')} dir="ltr" inputMode="tel" /></Field>
          <Field label="رقم الواتساب" htmlFor="contactWhatsapp" error={errors.contactWhatsapp}><input {...input('contactWhatsapp')} dir="ltr" inputMode="tel" /></Field>
        </div>
        <div>
          <Toggle id="contactShow" checked={v.contactShow} onChange={set('contactShow')} label="السماح بعرض بيانات التواصل للعامة" hint="إن لم تفعّله فلن تظهر هذه البيانات لأي زائر، وهي محمية بقواعد Firestore." />
          {errors.contactShow && <p className="mt-1 text-xs font-bold text-danger" role="alert">{errors.contactShow}</p>}
        </div>
      </Section>

      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'جارٍ الحفظ…' : 'حفظ الحالة'}</button>
        <Link to="/admin/cases" className="btn btn-outline">إلغاء</Link>
      </div>
    </form>
  );
}
