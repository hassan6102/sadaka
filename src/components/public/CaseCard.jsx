import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { FundingBadge } from '../ui/Badges';
import ProgressBar from './ProgressBar';
import { formatAmount, progressPercent } from '../../lib/format';

export default function CaseCard({ c }) {
  const percent = progressPercent(c);
  return (
    <article className="card flex h-full flex-col overflow-hidden transition-colors hover:border-brand">
      <div className="flex items-center justify-between gap-2 border-b border-dashed border-line bg-paper px-4 py-2.5">
        <span className="font-mono text-xs font-bold text-brand-dark" dir="ltr">{c.code}</span>
        <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-muted ring-1 ring-line">{c.type}</span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg">{c.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{c.summary}</p>

        <div className="mt-4 space-y-2">
          {c.requiredAmount != null && (
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted">المبلغ المطلوب</span>
              <span className="font-display font-bold">{formatAmount(c.requiredAmount)}</span>
            </div>
          )}
          {percent !== null && (
            <>
              <ProgressBar percent={percent} />
              <p className="text-xs text-muted">تم جمع {formatAmount(c.collectedAmount)} ({percent}%)</p>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <FundingBadge status={c.fundingStatus} />
          <Link to={`/cases/${c.id}`} className="btn btn-primary btn-sm">
            عرض التفاصيل
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
