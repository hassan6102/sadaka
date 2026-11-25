import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'تأكيد', busy, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => !busy && onCancel()}>
      <div
        className="card w-full max-w-md p-6"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg">{title}</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>
            إلغاء
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'جارٍ التنفيذ…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
