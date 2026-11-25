import { useEffect, useState } from 'react';
import { Eye, EyeOff, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import { createMethod, deleteMethod, fetchAllMethods, updateMethod } from '../../services/methodsService';
import { invalidateCache } from '../../hooks/useCachedFetch';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Field, Toggle } from '../../components/ui/Field';
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/Feedback';
import { METHOD_TYPES } from '../../lib/constants';
import { errorMessage } from '../../lib/format';

const empty = { name: '', type: 'vodafone_cash', value: '', accountHolder: '', instructions: '', isGeneral: true, active: true };
const pick = (m) => ({
  name: m.name, type: m.type, value: m.value, accountHolder: m.accountHolder,
  instructions: m.instructions, isGeneral: m.isGeneral, active: m.active,
});

function MethodForm({ initial, onSave, onCancel, saving }) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const bind = (k) => ({ id: `m-${k}`, className: 'input', value: v[k], onChange: (e) => setV((s) => ({ ...s, [k]: e.target.value })) });

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (v.name.trim().length < 2) errs.name = 'اكتب اسم الوسيلة.';
    if (!v.value.trim()) errs.value = 'اكتب الرقم أو بيانات التحويل.';
    setErrors(errs);
    if (!Object.keys(errs).length)
      onSave({ ...v, name: v.name.trim(), value: v.value.trim(), accountHolder: v.accountHolder.trim(), instructions: v.instructions.trim() });
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم الوسيلة" htmlFor="m-name" required error={errors.name}><input {...bind('name')} maxLength={60} /></Field>
        <Field label="النوع" htmlFor="m-type">
          <select {...bind('type')}>{Object.entries(METHOD_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </Field>
      </div>
      <Field label="رقم الهاتف / الحساب / بيانات التحويل" htmlFor="m-value" required error={errors.value}>
        <input {...bind('value')} dir="ltr" maxLength={120} />
      </Field>
      <Field label="اسم صاحب الحساب" htmlFor="m-accountHolder"><input {...bind('accountHolder')} maxLength={80} /></Field>
      <Field label="تعليمات مختصرة" htmlFor="m-instructions"><textarea {...bind('instructions')} rows={2} maxLength={300} /></Field>
      <div className="space-y-3">
        <Toggle id="m-isGeneral" checked={v.isGeneral} onChange={(x) => setV((s) => ({ ...s, isGeneral: x }))} label="وسيلة عامة للموقع" hint="تظهر في الصفحة الرئيسية وفي الحالات التي تعرض الوسائل العامة." />
        <Toggle id="m-active" checked={v.active} onChange={(x) => setV((s) => ({ ...s, active: x }))} label="مفعّلة (ظاهرة للزوار)" />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'جارٍ الحفظ…' : 'حفظ'}</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  );
}

export default function MethodsAdminPage() {
  const [state, setState] = useState({ loading: true, error: null });
  const [methods, setMethods] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | method
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState('');
  const [fail, setFail] = useState('');

  const load = () =>
    fetchAllMethods().then(
      (list) => { setMethods(list); setState({ loading: false, error: null }); },
      (error) => setState({ loading: false, error }),
    );
  useEffect(() => { load(); }, []);

  const run = async (fn, okMsg) => {
    setSaving(true); setFail(''); setNotice('');
    try { await fn(); invalidateCache(); await load(); if (okMsg) setNotice(okMsg); return true; }
    catch (e) { setFail(errorMessage(e)); return false; }
    finally { setSaving(false); }
  };

  const save = async (values) => {
    const ok = await run(
      () => (editing === 'new' ? createMethod(values) : updateMethod(editing.id, values)),
      editing === 'new' ? 'تمت إضافة الوسيلة.' : 'تم حفظ التعديلات.',
    );
    if (ok) setEditing(null);
  };

  if (state.loading) return <Spinner />;
  if (state.error) return <ErrorState error={state.error} />;

  return (
    <div className="max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl">وسائل التبرع</h1>
        {!editing && <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden="true" /> إضافة وسيلة</button>}
      </div>
      <div className="mb-4 space-y-3">
        {notice && <Notice tone="success">{notice}</Notice>}
        {fail && <Notice tone="error">{fail}</Notice>}
      </div>

      {editing && (
        <div className="mb-6">
          <MethodForm initial={editing === 'new' ? empty : pick(editing)} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
        </div>
      )}

      {methods.length === 0 && !editing ? (
        <EmptyState title="لا توجد وسائل تبرع" text="أضف Vodafone Cash أو InstaPay أو حسابًا بنكيًا ليظهر للزوار." />
      ) : (
        <ul className="space-y-3">
          {methods.map((m) => (
            <li key={m.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-bold">{m.name} <span className="text-xs font-normal text-muted">({METHOD_TYPES[m.type]})</span></p>
                <p className="truncate text-sm text-muted" dir="ltr">{m.value}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`badge ${m.active ? 'bg-done-soft text-done' : 'bg-slate-200 text-slate-700'}`}>{m.active ? 'مفعّلة' : 'مخفية'}</span>
                  {m.isGeneral && <span className="badge bg-brand-soft text-brand-dark"><Globe className="h-3.5 w-3.5" aria-hidden="true" /> عامة</span>}
                </div>
              </div>
              <div className="flex gap-1.5">
                <button type="button" className="icon-btn" disabled={saving} onClick={() => run(() => updateMethod(m.id, { ...pick(m), active: !m.active }))} aria-label={m.active ? 'إخفاء' : 'تفعيل'} title={m.active ? 'إخفاء' : 'تفعيل'}>
                  {m.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button type="button" className={`icon-btn ${m.isGeneral ? 'border-brand text-brand' : ''}`} disabled={saving} aria-pressed={m.isGeneral} onClick={() => run(() => updateMethod(m.id, { ...pick(m), isGeneral: !m.isGeneral }))} aria-label="وسيلة عامة" title="وسيلة عامة">
                  <Globe className="h-4 w-4" />
                </button>
                <button type="button" className="icon-btn" onClick={() => { setEditing(m); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="تعديل" title="تعديل"><Pencil className="h-4 w-4" /></button>
                <button type="button" className="icon-btn hover:!border-danger hover:!text-danger" onClick={() => setToDelete(m)} aria-label="حذف" title="حذف"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="حذف وسيلة التبرع؟"
        message={toDelete ? `سيتم حذف «${toDelete.name}» نهائيًا، وتختفي من أي حالة مرتبطة بها.` : ''}
        confirmLabel="حذف"
        busy={saving}
        onConfirm={async () => { await run(() => deleteMethod(toDelete.id), 'تم حذف الوسيلة.'); setToDelete(null); }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
