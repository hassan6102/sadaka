import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useActiveMethods, usePublishedCases } from '../../hooks/usePublicData';
import CaseCard from '../../components/public/CaseCard';
import DonationMethodCard from '../../components/public/DonationMethodCard';
import { EmptyState, ErrorState, Spinner } from '../../components/ui/Feedback';
import { millis } from '../../lib/format';

function Pattern() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-brand/15">
      <defs>
        <pattern id="star" width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M24 4l8.5 11.5L44 24l-11.5 8.5L24 44l-8.5-11.5L4 24l11.5-8.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#star)" />
    </svg>
  );
}

function Section({ title, action, children, id }) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  const { settings } = useSettings();
  const cases = usePublishedCases();
  const methods = useActiveMethods();

  const list = cases.value ?? [];
  const latest = [...list].sort((a, b) => millis(b.createdAt) - millis(a.createdAt)).slice(0, 6);
  const featured = list
    .filter((c) => c.featured && c.fundingStatus !== 'completed')
    .sort((a, b) => b.sortOrder - a.sortOrder || millis(b.createdAt) - millis(a.createdAt))
    .slice(0, 3);
  const general = (methods.value ?? []).filter((m) => m.isGeneral);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="pointer-events-none absolute inset-y-0 start-0 hidden w-2/5 md:block">
          <Pattern />
          <div className="absolute inset-0 bg-gradient-to-l from-white to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="md:me-auto md:ms-0 md:max-w-xl">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">حالات إنسانية تنتظر دعمك</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">{settings.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/cases" className="btn btn-primary px-6 py-3 text-base">
                تصفح جميع الحالات
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
              {general.length > 0 && (
                <a href="#donate" className="btn btn-outline px-6 py-3 text-base">طرق التبرع</a>
              )}
            </div>
            <p className="mt-6 flex items-start gap-2 text-sm text-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              الموقع يعرض الحالات فقط ولا يستقبل أموالًا. التبرع يتم مباشرة عبر وسائل التبرع المعلنة.
            </p>
          </div>
        </div>
      </section>

      {cases.loading && <Spinner />}
      {cases.error && <div className="mx-auto max-w-6xl px-4 pt-14"><ErrorState error={cases.error} /></div>}

      {!cases.loading && !cases.error && (
        <>
          {featured.length > 0 && (
            <Section title="الحالات الأكثر احتياجًا">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((c) => <CaseCard key={c.id} c={c} />)}
              </div>
            </Section>
          )}

          <Section
            title="أحدث الحالات"
            action={
              latest.length > 0 && (
                <Link to="/cases" className="text-sm font-bold text-brand hover:underline">عرض الكل</Link>
              )
            }
          >
            {latest.length === 0 ? (
              <EmptyState title="لا توجد حالات منشورة حاليًا" text="ستظهر الحالات هنا بمجرد نشرها من الإدارة." />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {latest.map((c) => <CaseCard key={c.id} c={c} />)}
              </div>
            )}
          </Section>
        </>
      )}

      {general.length > 0 && (
        <Section title="طرق التبرع العامة" id="donate">
          <p className="mb-5 max-w-2xl text-sm text-muted">
            يمكنك التبرع بشكل عام عبر الوسائل التالية. لتخصيص تبرعك لحالة بعينها، افتح صفحة الحالة وتواصل مع المسؤول عنها إن كانت بيانات التواصل متاحة.
          </p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {general.map((m) => <DonationMethodCard key={m.id} m={m} />)}
          </div>
        </Section>
      )}
    </>
  );
}
