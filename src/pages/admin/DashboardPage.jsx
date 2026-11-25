import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, EyeOff, FileText, HandHeart, Plus, Send } from 'lucide-react';
import { fetchAllCases } from '../../services/casesService';
import { ErrorState, Spinner } from '../../components/ui/Feedback';

export default function DashboardPage() {
  const [state, setState] = useState({ loading: true, error: null, cases: [] });

  useEffect(() => {
    fetchAllCases().then(
      (cases) => setState({ loading: false, error: null, cases }),
      (error) => setState({ loading: false, error, cases: [] }),
    );
  }, []);

  if (state.loading) return <Spinner />;
  if (state.error) return <ErrorState error={state.error} />;

  const c = state.cases;
  const stats = [
    { label: 'إجمالي الحالات', value: c.length, Icon: FileText },
    { label: 'الحالات المنشورة', value: c.filter((x) => x.visibility === 'published').length, Icon: Send },
    { label: 'منشورة وتحتاج دعمًا', value: c.filter((x) => x.visibility === 'published' && x.fundingStatus === 'needs_support').length, Icon: HandHeart },
    { label: 'حالات مكتملة', value: c.filter((x) => x.fundingStatus === 'completed').length, Icon: CheckCircle2 },
    { label: 'مخفية أو متوقفة', value: c.filter((x) => x.visibility !== 'published').length, Icon: EyeOff },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">الرئيسية</h1>
        <Link to="/admin/cases/new" className="btn btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> إضافة حالة</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-3xl font-extrabold leading-none">{value}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
