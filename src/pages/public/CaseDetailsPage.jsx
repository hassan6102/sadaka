import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, Info } from 'lucide-react';
import { useActiveMethods, usePublicContact, usePublishedCase } from '../../hooks/usePublicData';
import { FundingBadge } from '../../components/ui/Badges';
import { ErrorState, Notice, Spinner } from '../../components/ui/Feedback';
import ProgressBar from '../../components/public/ProgressBar';
import ContactButtons from '../../components/public/ContactButtons';
import DonationMethodCard from '../../components/public/DonationMethodCard';
import NotFoundPage from './NotFoundPage';
import { formatAmount, formatDate, progressPercent } from '../../lib/format';

function Row({ label, value, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className={strong ? 'font-display text-lg font-bold' : 'font-bold'}>{value}</span>
    </div>
  );
}

export default function CaseDetailsPage() {
  const { id } = useParams();
  const caseQ = usePublishedCase(id);
  const contactQ = usePublicContact(id);
  const methodsQ = useActiveMethods();

  if (caseQ.loading) return <Spinner />;
  if (caseQ.error) return <div className="mx-auto max-w-3xl px-4 py-12"><ErrorState error={caseQ.error} /></div>;
  const c = caseQ.value;
  if (!c) return <NotFoundPage title="الحالة غير متاحة" text="قد تكون الحالة غير موجودة أو غير منشورة حاليًا." />;

  const contact = contactQ.value && (contactQ.value.phone || contactQ.value.whatsapp) ? contactQ.value : null;
  const percent = progressPercent(c);
  const remaining =
    c.showCollected && c.requiredAmount != null && c.collectedAmount != null
      ? Math.max(0, c.requiredAmount - c.collectedAmount)
      : null;
  const completed = c.fundingStatus === 'completed';

  const all = methodsQ.value ?? [];
  const specific = all.filter((m) => (c.methodIds ?? []).includes(m.id));
  const general = c.includeGeneralMethods ? all.filter((m) => m.isGeneral && !specific.some((s) => s.id === m.id)) : [];
  const methods = [...specific, ...general];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/cases" className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
        العودة إلى جميع الحالات
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white px-2.5 py-1 font-mono text-xs font-bold text-brand-dark ring-1 ring-line" dir="ltr">{c.code}</span>
            <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-muted ring-1 ring-line">{c.type}</span>
            <FundingBadge status={c.fundingStatus} />
          </div>
          <h1 className="mt-4 text-3xl leading-snug md:text-4xl">{c.title}</h1>
          {formatDate(c.createdAt) && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              أُضيفت في {formatDate(c.createdAt)}
            </p>
          )}

          <p className="mt-6 rounded-xl border border-line bg-white p-5 text-lg leading-relaxed">{c.summary}</p>

          <h2 className="mt-8 text-xl">تفاصيل الحالة واحتياجاتها</h2>
          <p className="mt-3 max-w-prose whitespace-pre-line leading-loose text-ink/90">{c.details}</p>

          <section className="mt-10" aria-labelledby="donate-title">
            <h2 id="donate-title" className="text-xl">وسائل التبرع</h2>
            {completed ? (
              <div className="mt-4"><Notice tone="success">اكتمل المبلغ المطلوب لهذه الحالة. شكرًا لكل من ساهم.</Notice></div>
            ) : methodsQ.loading ? (
              <Spinner />
            ) : methods.length === 0 ? (
              <div className="mt-4"><Notice>لم تُحدَّد وسائل تبرع لهذه الحالة بعد. يمكنك التواصل مع المسؤول عنها إن توفرت بياناته.</Notice></div>
            ) : (
              <>
                <p className="mt-2 flex items-start gap-2 text-sm text-muted">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  التبرع يتم خارج الموقع مباشرة عبر إحدى الوسائل التالية. اذكر كود الحالة ({c.code}) عند التحويل إن أمكن.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {methods.map((m) => <DonationMethodCard key={m.id} m={m} />)}
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-3 p-5">
            <h2 className="text-lg">حالة التبرع</h2>
            <FundingBadge status={c.fundingStatus} />
            {c.requiredAmount != null ? (
              <>
                <Row label="المبلغ المطلوب" value={formatAmount(c.requiredAmount)} strong />
                {c.showCollected && c.collectedAmount != null && (
                  <>
                    {percent !== null && <ProgressBar percent={percent} />}
                    <Row label="تم جمعه" value={formatAmount(c.collectedAmount)} />
                    {remaining !== null && <Row label="المتبقي" value={formatAmount(remaining)} />}
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">لم يُحدَّد مبلغ مطلوب لهذه الحالة.</p>
            )}
          </div>

          {contact && (
            <div className="card p-5">
              <h2 className="mb-3 text-lg">التواصل بخصوص الحالة</h2>
              <ContactButtons contact={contactQ.value} caseItem={c} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
