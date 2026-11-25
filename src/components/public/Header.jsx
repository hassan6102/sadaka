import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HeartHandshake, Menu, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const links = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/cases', label: 'جميع الحالات' },
];

export default function Header() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const linkCls = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
      isActive ? 'bg-brand-soft text-brand-dark' : 'text-muted hover:text-brand'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <HeartHandshake className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-extrabold">{settings.logoText || settings.siteName}</span>
            {settings.logoText && settings.logoText !== settings.siteName && (
              <span className="block text-xs text-muted">{settings.siteName}</span>
            )}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="icon-btn md:hidden"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-white px-4 py-3 md:hidden" aria-label="التنقل الرئيسي">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkCls} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
