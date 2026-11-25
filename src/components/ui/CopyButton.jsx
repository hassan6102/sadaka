import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    try {
      document.execCommand('copy');
    } catch {
      /* لا شيء */
    }
    t.remove();
  }
}

export default function CopyButton({ text, label = 'نسخ', className = '' }) {
  const [done, setDone] = useState(false);
  const onCopy = async () => {
    await copyText(text);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };
  return (
    <button type="button" onClick={onCopy} className={`btn btn-outline btn-sm ${className}`} aria-live="polite">
      {done ? <Check className="h-4 w-4 text-done" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {done ? 'تم النسخ' : label}
    </button>
  );
}
