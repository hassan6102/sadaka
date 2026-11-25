import { useEffect, useState } from 'react';
import { fetchSettings, saveSettings } from '../../services/settingsService';
import { useSettings } from '../../context/SettingsContext';
import { Field } from '../../components/ui/Field';
import { ErrorState, Notice, Spinner } from '../../components/ui/Feedback';
import { errorMessage, toLatinDigits } from '../../lib/format';

const urlFields = [
  ['facebook', 'فيسبوك'], ['instagram', 'إنستجرام'], ['x', 'إكس (تويتر)'], ['youtube', 'يوتيوب'], ['telegram', 'تيليجرام'],
];

export default function SettingsAdminPage() {
  const { reload } = useSettings();
  const [v, setV] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ tone: '', text: '' });

  useEffect(() => { fetchSettings().then(setV, setLoadError); }, []);
  if (loadError) return <ErrorState error={loadError} />;
  if (!v) return <Spinner />;

  const bind = (k) => ({ id: k, className: 'input', value: v[k], onChange: (e) => setV((s) => ({ ...s, [k]: e.target.value })) });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (v.siteName.trim().length < 2) errs.siteName = 'اسم الموقع مطلوب.';
    urlFields.forEach(([k]) => { if (v[k].trim() && !/^https:\/\//.test(v[k].trim())) errs[k] = 'يجب أن يبدأ الرابط بـ https://'; });
    ['phone', 'whatsapp'].forEach((k) => { if (toLatinDigits(v[k]).length > 20) errs[k] = 'الرقم طويل جدًا.'; });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true); setMsg({ tone: '', text: '' });
    try {
      await saveSettings({ ...v, phone: toLatinDigits(v.phone), whatsapp: toLatinDigits(v.whatsapp) });
      reload();
      setMsg({ tone: 'success', text: 'تم حفظ الإعدادات.' });
    } catch (err) {
      setMsg({ tone: 'error', text: errorMessage(err) });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-5" noValidate>
      <h1 className="text-2xl">إعدادات الموقع</h1>
      {msg.text && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <fieldset className="card space-y-4 p-5">
        <legend className="float-start mb-1 font-display text-lg font-bold">الهوية</legend>
        <div className="clear-both grid gap-4 sm:grid-cols-2">
          <Field label="اسم الموقع" htmlFor="siteName" required error={errors.siteName}><input {...bind('siteName')} maxLength={60} /></Field>
          <Field label="الشعار النصي" htmlFor="logoText" hint="نص قصير يظهر بجانب الأيقونة في الهيدر."><input {...bind('logoText')} maxLength={30} /></Field>
        </div>
        <Field label="وصف الموقع" htmlFor="description" hint="يظهر في الصفحة الرئيسية."><textarea {...bind('description')} rows={3} maxLength={400} /></Field>
      </fieldset>

      <fieldset className="card space-y-4 p-5">
        <legend className="float-start mb-1 font-display text-lg font-bold">التواصل العام</legend>
        <div className="clear-both grid gap-4 sm:grid-cols-2">
          <Field label="رقم التواصل" htmlFor="phone" error={errors.phone}><input {...bind('phone')} dir="ltr" inputMode="tel" /></Field>
          <Field label="رقم الواتساب" htmlFor="whatsapp" error={errors.whatsapp}><input {...bind('whatsapp')} dir="ltr" inputMode="tel" /></Field>
          <Field label="البريد الإلكتروني" htmlFor="email"><input {...bind('email')} dir="ltr" type="email" maxLength={120} /></Field>
          <Field label="العنوان" htmlFor="address"><input {...bind('address')} maxLength={200} /></Field>
        </div>
      </fieldset>

      <fieldset className="card space-y-4 p-5">
        <legend className="float-start mb-1 font-display text-lg font-bold">روابط التواصل الاجتماعي</legend>
        <div className="clear-both grid gap-4 sm:grid-cols-2">
          {urlFields.map(([k, label]) => (
            <Field key={k} label={label} htmlFor={k} error={errors[k]}><input {...bind(k)} dir="ltr" placeholder="https://" /></Field>
          ))}
        </div>
      </fieldset>

      <fieldset className="card space-y-4 p-5">
        <legend className="float-start mb-1 font-display text-lg font-bold">الفوتر</legend>
        <div className="clear-both">
          <Field label="نص الفوتر" htmlFor="footerText"><textarea {...bind('footerText')} rows={2} maxLength={300} /></Field>
        </div>
      </fieldset>

      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'جارٍ الحفظ…' : 'حفظ الإعدادات'}</button>
    </form>
  );
}
