import { ChevronLeft, ChevronRight } from 'lucide-react';

function pagesToShow(page, total) {
  const set = new Set([1, total, page, page - 1, page + 1]);
  const list = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="التنقل بين الصفحات">
      <button type="button" className="icon-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="الصفحة السابقة">
        <ChevronRight className="h-4 w-4" />
      </button>
      {pagesToShow(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`g${i}`} className="px-1 text-muted" aria-hidden="true">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold ${
              p === page ? 'bg-brand text-white' : 'border border-line bg-white text-ink hover:border-brand'
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className="icon-btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="الصفحة التالية">
        <ChevronLeft className="h-4 w-4" />
      </button>
    </nav>
  );
}
