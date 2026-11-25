import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowDown, ArrowUp, CheckCircle2, Eye, EyeOff, HandHeart, PauseCircle, Pencil, Plus, Star, Trash2,
} from 'lucide-react';
import { deleteCase, fetchAllCases, patchCase, saveOrder } from '../../services/casesService';
import { invalidateCache } from '../../hooks/useCachedFetch';
import { FeaturedBadge, FundingBadge, VisibilityBadge } from '../../components/ui/Badges';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/Feedback';
import { VISIBILITY } from '../../lib/constants';
import { errorMessage, millis, normalizeAr } from '../../lib/format';

const byOrder = (a, b) => b.sortOrder - a.sortOrder || millis(b.createdAt) - millis(a.createdAt);

export default function CasesAdminPage() {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, error: null });
  const [cases, setCases] = useState([]);
  const [notice, setNotice] = useState(location.state?.notice ?? '');
  const [fail, setFail] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [q, setQ] = useState('');
  const [vis, setVis] = useState('');

  useEffect(() => {
    fetchAllCases().then(
      (list) => { setCases(list.sort(byOrder)); setState({ loading: false, error: null }); },
      (error) => setState({ loading: false, error }),
    );
  }, []);

  const filtering = Boolean(q || vis);
  const shown = useMemo(() => {
    const n = normalizeAr(q);
    return cases.filter(
      (c) => (!vis || c.visibility === vis) && (!n || [c.title, c.code].some((f) => normalizeAr(f).includes(n))),
    );
  }, [cases, q, vis]);

  const run = async (id, fn) => {
    setBusyId(id); setFail(''); setNotice('');
    try { await fn(); invalidateCache(); } catch (e) { setFail(errorMessage(e)); } finally { setBusyId(null); }
  };

  const patch = (c, p) => run(c.id, async () => {
    await patchCase(c.id, p);
    setCases((list) => list.map((x) => (x.id === c.id ? { ...x, ...p } : x)));
  });

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= cases.length) return;
    const next = [...cases];
    [next[index], next[target]] = [next[target], next[index]];
    run(next[index].id, async () => {
      await saveOrder(next);
      setCases(next.map((c, i) => ({ ...c, sortOrder: next.length - i })));
    });
  };

  const confirmDelete = () => run(toDelete.id, async () => {
    await deleteCase(toDelete.id);
    setCases((list) => list.filter((x) => x.id !== toDelete.id));
    setNotice('تم حذف الحالة.');
    setToDelete(null);
  });

  if (state.loading) return <Spinner />;
  if (state.error) return <ErrorState error={state.error} />;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">الحالات</h1>
        <Link to="/admin/cases/new" className="btn btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> إضافة حالة</Link>
      </div>

      <div className="space-y-3">
        {notice && <Notice tone="success">{notice}</Notice>}
        {fail && <Notice tone="error">{fail}</Notice>}
      </div>

      {cases.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="لا توجد حالات بعد" text="ابدأ بإضافة أول حالة لتظهر في الموقع." action={<Link to="/admin/cases/new" className="btn btn-primary">إضافة حالة</Link>} />
        </div>
      ) : (
        <>
          <div className="my-4 grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="ابحث بالعنوان أو الكود" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" />
            <select className="input" value={vis} onChange={(e) => setVis(e.target.value)} aria-label="حالة النشر">
              <option value="">كل حالات النشر</option>
              {Object.entries(VISIBILITY).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <p className="mb-3 text-xs text-muted">
            الترتيب هنا هو ترتيب الإدارة (الأعلى يظهر أولًا عند اختيار «ترتيب الإدارة» في الموقع). تُعطَّل أسهم الترتيب أثناء البحث أو الفلترة.
          </p>

          <ul className="space-y-3">
            {shown.map((c) => {
              const index = cases.findIndex((x) => x.id === c.id);
              const busy = busyId === c.id;
              return (
                <li key={c.id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-dark" dir="ltr">{c.code}</span>
                        <span className="text-xs text-muted">{c.type}</span>
                      </div>
                      <h2 className="truncate text-base">{c.title}</h2>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <VisibilityBadge visibility={c.visibility} />
                        <FundingBadge status={c.fundingStatus} />
                        {c.featured && <FeaturedBadge />}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" className="icon-btn" disabled={filtering || busy || index === 0} onClick={() => move(index, -1)} aria-label="نقل لأعلى" title="نقل لأعلى"><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" className="icon-btn" disabled={filtering || busy || index === cases.length - 1} onClick={() => move(index, 1)} aria-label="نقل لأسفل" title="نقل لأسفل"><ArrowDown className="h-4 w-4" /></button>
                      {c.visibility === 'published' ? (
                        <>
                          <button type="button" className="icon-btn" disabled={busy} onClick={() => patch(c, { visibility: 'hidden' })} aria-label="إخفاء" title="إخفاء"><EyeOff className="h-4 w-4" /></button>
                          <button type="button" className="icon-btn" disabled={busy} onClick={() => patch(c, { visibility: 'paused' })} aria-label="إيقاف مؤقت" title="إيقاف مؤقت"><PauseCircle className="h-4 w-4" /></button>
                        </>
                      ) : (
                        <button type="button" className="icon-btn" disabled={busy} onClick={() => patch(c, { visibility: 'published' })} aria-label="نشر" title="نشر"><Eye className="h-4 w-4" /></button>
                      )}
                      <button
                        type="button" className="icon-btn" disabled={busy}
                        onClick={() => patch(c, { fundingStatus: c.fundingStatus === 'completed' ? 'needs_support' : 'completed' })}
                        aria-label={c.fundingStatus === 'completed' ? 'إعادة إلى تحتاج دعم' : 'تحديد كمكتملة'}
                        title={c.fundingStatus === 'completed' ? 'إعادة إلى تحتاج دعم' : 'تحديد كمكتملة'}
                      >
                        {c.fundingStatus === 'completed' ? <HandHeart className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <button
                        type="button" className={`icon-btn ${c.featured ? 'border-brand text-brand' : ''}`} disabled={busy}
                        onClick={() => patch(c, { featured: !c.featured })}
                        aria-pressed={c.featured} aria-label="تمييز في الصفحة الرئيسية" title="تمييز في الصفحة الرئيسية"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      <Link to={`/admin/cases/${c.id}/edit`} className="icon-btn" aria-label="تعديل" title="تعديل"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" className="icon-btn hover:!border-danger hover:!text-danger" disabled={busy} onClick={() => setToDelete(c)} aria-label="حذف" title="حذف"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {shown.length === 0 && <p className="py-8 text-center text-muted">لا توجد نتائج مطابقة.</p>}
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="حذف الحالة نهائيًا؟"
        message={toDelete ? `سيتم حذف «${toDelete.title}» (${toDelete.code}) وبيانات التواصل الخاصة بها، ولا يمكن التراجع. إن أردت إخفاءها فقط فاستخدم زر الإخفاء.` : ''}
        confirmLabel="حذف نهائيًا"
        busy={busyId === toDelete?.id}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
