import { AlertCircle, CheckCircle2, Loader2, Inbox } from 'lucide-react';

export function Spinner({ label = 'جارٍ التحميل…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted" role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Spinner />
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <Inbox className="mb-3 h-9 w-9 text-muted" aria-hidden="true" />
      <h3 className="text-lg">{title}</h3>
      {text && <p className="mt-1 max-w-md text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, text = 'تعذر تحميل البيانات.' }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center" role="alert">
      <AlertCircle className="mb-3 h-9 w-9 text-danger" aria-hidden="true" />
      <h3 className="text-lg">{text}</h3>
      {error?.code === 'permission-denied' && (
        <p className="mt-1 text-sm text-muted">قد تكون قواعد Firestore لم تُنشر بعد.</p>
      )}
      <button type="button" className="btn btn-outline mt-5" onClick={() => window.location.reload()}>
        إعادة المحاولة
      </button>
    </div>
  );
}

export function Notice({ tone = 'info', children }) {
  const tones = {
    info: 'border-brand/30 bg-brand-soft text-brand-dark',
    success: 'border-done/30 bg-done-soft text-done',
    error: 'border-danger/30 bg-danger-soft text-danger',
  };
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
