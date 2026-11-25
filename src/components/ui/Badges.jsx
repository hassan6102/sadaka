import { CheckCircle2, EyeOff, HandHeart, PauseCircle, Star } from 'lucide-react';
import { FUNDING_STATUS, VISIBILITY } from '../../lib/constants';

export function FundingBadge({ status }) {
  const done = status === 'completed';
  const Icon = done ? CheckCircle2 : HandHeart;
  return (
    <span className={`badge ${done ? 'bg-done-soft text-done' : 'bg-support-soft text-support'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {FUNDING_STATUS[status] ?? status}
    </span>
  );
}

export function VisibilityBadge({ visibility }) {
  const map = {
    published: 'bg-brand-soft text-brand-dark',
    hidden: 'bg-slate-200 text-slate-700',
    paused: 'bg-support-soft text-support',
  };
  const Icon = visibility === 'paused' ? PauseCircle : visibility === 'hidden' ? EyeOff : CheckCircle2;
  return (
    <span className={`badge ${map[visibility] ?? map.hidden}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {VISIBILITY[visibility] ?? visibility}
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="badge bg-brand-soft text-brand-dark">
      <Star className="h-3.5 w-3.5" aria-hidden="true" />
      مميزة
    </span>
  );
}
