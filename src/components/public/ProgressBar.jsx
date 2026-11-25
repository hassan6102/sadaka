export default function ProgressBar({ percent }) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-brand-soft"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label="نسبة المبلغ المجموع"
    >
      <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
    </div>
  );
}
