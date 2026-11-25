export function Field({ label, hint, error, htmlFor, required, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-bold text-danger" role="alert">{error}</p>}
    </div>
  );
}

export function Toggle({ id, checked, onChange, label, hint }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-line accent-brand"
      />
      <span>
        <span className="block text-sm font-bold">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}
