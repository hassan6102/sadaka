import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { usePublishedCases } from '../../hooks/usePublicData';
import CaseCard from '../../components/public/CaseCard';
import Pagination from '../../components/public/Pagination';
import { EmptyState, ErrorState, Spinner } from '../../components/ui/Feedback';
import { FUNDING_STATUS, PAGE_SIZE } from '../../lib/constants';
import { millis, normalizeAr } from '../../lib/format';

export default function CasesPage() {
  const { loading, error, value } = usePublishedCases();
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const type = params.get('type') ?? '';
  const status = params.get('status') ?? '';
  const sort = params.get('sort') === 'admin' ? 'admin' : 'new';
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);

  const update = (patch, keepPage = false) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!keepPage) next.delete('page');
    setParams(next, { replace: true });
  };

  const all = value ?? [];
  const types = useMemo(() => [...new Set(all.map((c) => c.type))].sort((a, b) => a.localeCompare(b, 'ar')), [all]);

  const filtered = useMemo(() => {
    const needle = normalizeAr(q);
    const out = all.filter((c) => {
      if (type && c.type !== type) return false;
      if (status && c.fundingStatus !== status) return false;
      if (!needle) return true;
      return [c.title, c.code, c.summary].some((f) => normalizeAr(f).includes(needle));
    });
    out.sort((a, b) =>
      sort === 'admin'
        ? b.sortOrder - a.sortOrder || millis(b.createdAt) - millis(a.createdAt)
        : millis(b.createdAt) - millis(a.createdAt),
    );
    return out;
  }, [all, q, type, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const hasFilters = Boolean(q || type || status);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [current]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl">جميع الحالات</h1>
      <p className="mt-2 text-muted">ابحث عن حالة بالاسم أو الكود، أو صفِّ الحالات حسب النوع وحالة التبرع.</p>

      <form className="card mt-6 grid gap-3 p-4 md:grid-cols-4" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="relative md:col-span-4 lg:col-span-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="ابحث بالاسم أو الكود"
            aria-label="بحث"
            className="input ps-9"
          />
        </div>
        <select className="input" value={type} onChange={(e) => update({ type: e.target.value })} aria-label="نوع الحالة">
          <option value="">كل الأنواع</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input" value={status} onChange={(e) => update({ status: e.target.value })} aria-label="حالة التبرع">
          <option value="">كل حالات التبرع</option>
          {Object.entries(FUNDING_STATUS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
        <select
          className="input"
          value={sort}
          onChange={(e) => update({ sort: e.target.value === 'admin' ? 'admin' : '' })}
          aria-label="الترتيب"
        >
          <option value="new">الأحدث أولًا</option>
          <option value="admin">ترتيب الإدارة</option>
        </select>
      </form>

      <div className="mt-5 flex min-h-8 items-center justify-between text-sm text-muted">
        {!loading && !error && <span>{filtered.length} حالة</span>}
        {hasFilters && (
          <button type="button" className="inline-flex items-center gap-1 font-bold text-brand hover:underline" onClick={() => setParams({}, { replace: true })}>
            <X className="h-4 w-4" aria-hidden="true" />
            مسح الفلاتر
          </button>
        )}
      </div>

      <div className="mt-3">
        {loading && <Spinner />}
        {error && <ErrorState error={error} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={hasFilters ? 'لا توجد حالات مطابقة' : 'لا توجد حالات منشورة حاليًا'}
            text={hasFilters ? 'جرّب تغيير كلمات البحث أو الفلاتر.' : 'ستظهر الحالات هنا بمجرد نشرها من الإدارة.'}
          />
        )}
        {!loading && !error && visible.length > 0 && (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((c) => <CaseCard key={c.id} c={c} />)}
            </div>
            <Pagination page={current} totalPages={totalPages} onChange={(p) => update({ page: p > 1 ? String(p) : '' }, true)} />
          </>
        )}
      </div>
    </div>
  );
}
