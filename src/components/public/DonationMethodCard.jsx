import { Landmark, Smartphone, Wallet } from 'lucide-react';
import CopyButton from '../ui/CopyButton';
import { METHOD_TYPES } from '../../lib/constants';

const icons = { vodafone_cash: Smartphone, instapay: Wallet, bank: Landmark, other: Wallet };

export default function DonationMethodCard({ m }) {
  const Icon = icons[m.type] ?? Wallet;
  const copyAll = [m.name, m.accountHolder && `باسم: ${m.accountHolder}`, m.value].filter(Boolean).join('\n');
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base">{m.name}</h3>
          {m.name !== METHOD_TYPES[m.type] && <p className="text-xs text-muted">{METHOD_TYPES[m.type]}</p>}
        </div>
      </div>

      <p className="mt-3 break-all rounded-lg bg-paper px-3 py-2 text-start font-mono text-base font-bold" dir="ltr">
        {m.value}
      </p>
      {m.accountHolder && (
        <p className="mt-2 text-sm"><span className="text-muted">اسم صاحب الحساب: </span>{m.accountHolder}</p>
      )}
      {m.instructions && <p className="mt-2 whitespace-pre-line text-sm text-muted">{m.instructions}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton text={m.value} label="نسخ الرقم" />
        {(m.accountHolder || m.type === 'bank') && <CopyButton text={copyAll} label="نسخ البيانات كاملة" />}
      </div>
    </div>
  );
}
