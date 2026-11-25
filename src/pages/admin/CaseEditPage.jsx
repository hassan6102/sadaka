import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CaseForm from '../../components/admin/CaseForm';
import { ErrorState, Notice, Spinner } from '../../components/ui/Feedback';
import { createCase, fetchCase, fetchContact, updateCase } from '../../services/casesService';
import { fetchAllMethods } from '../../services/methodsService';
import { invalidateCache } from '../../hooks/useCachedFetch';
import { emptyCaseForm, fromFormValues, toFormValues } from '../../lib/caseModel';
import { errorMessage, formatDate } from '../../lib/format';

export default function CaseEditPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: null, initial: emptyCaseForm, methods: [], caseItem: null });
  const [saving, setSaving] = useState(false);
  const [fail, setFail] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const methods = await fetchAllMethods();
        if (isNew) return alive && setState({ loading: false, error: null, initial: emptyCaseForm, methods, caseItem: null });
        const [c, contact] = await Promise.all([fetchCase(id), fetchContact(id)]);
        if (!c) throw new Error('الحالة غير موجودة.');
        return alive && setState({ loading: false, error: null, initial: toFormValues(c, contact), methods, caseItem: c });
      } catch (error) {
        return alive && setState({ loading: false, error, initial: emptyCaseForm, methods: [], caseItem: null });
      }
    })();
    return () => { alive = false; };
  }, [id, isNew]);

  const submit = async (values) => {
    const { data, contact } = fromFormValues(values);
    setSaving(true); setFail('');
    try {
      if (isNew) {
        const code = await createCase({ ...data, sortOrder: Math.floor(Date.now() / 1000) }, contact);
        invalidateCache();
        navigate('/admin/cases', { state: { notice: `تمت إضافة الحالة ${code}.` } });
      } else {
        await updateCase(id, data, contact);
        invalidateCache();
        navigate('/admin/cases', { state: { notice: 'تم حفظ التعديلات.' } });
      }
    } catch (e) {
      setFail(errorMessage(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (state.loading) return <Spinner />;
  if (state.error) return <ErrorState error={state.error} text={errorMessage(state.error)} />;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl">{isNew ? 'إضافة حالة' : 'تعديل الحالة'}</h1>
      {state.caseItem && <p className="mb-5 text-sm text-muted">تاريخ الإضافة: {formatDate(state.caseItem.createdAt)}</p>}
      {fail && <div className="mb-4"><Notice tone="error">{fail}</Notice></div>}
      <CaseForm initial={state.initial} methods={state.methods} code={state.caseItem?.code} onSubmit={submit} saving={saving} />
    </div>
  );
}
