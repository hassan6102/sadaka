import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ExternalLink, FileText, HeartHandshake, LayoutDashboard, LogOut, Menu, Settings, Wallet, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FullPageSpinner } from '../ui/Feedback';

const nav = [
  { to: '/admin', label: 'الرئيسية', Icon: LayoutDashboard, end: true },
  { to: '/admin/cases', label: 'الحالات', Icon: FileText },
  { to: '/admin/methods', label: 'وسائل التبرع', Icon: Wallet },
  { to: '/admin/settings', label: 'إعدادات الموقع', Icon: Settings },
];

export function RequireAdmin({ children }) {
  const { loading, user, isAdmin } = useAuth();
  const loc = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  return children;
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex';
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
  useEffect(() => setOpen(false), [loc.pathname]);

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
      isActive ? 'bg-brand text-white' : 'text-ink hover:bg-brand-soft'
    }`;

  return (
    <div className="min-h-screen md:flex">
      <header className="flex h-14 items-center justify-between border-b border-line bg-white px-4 md:hidden">
        <span className="flex items-center gap-2 font-display font-extrabold">
          <HeartHandshake className="h-5 w-5 text-brand" aria-hidden="true" /> لوحة التحكم
        </span>
        <button type="button" className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="القائمة" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <aside className={`${open ? 'block' : 'hidden'} border-line bg-white p-4 md:sticky md:top-0 md:block md:h-screen md:w-64 md:shrink-0 md:border-e`}>
        <div className="mb-6 hidden items-center gap-2 font-display text-lg font-extrabold md:flex">
          <HeartHandshake className="h-6 w-6 text-brand" aria-hidden="true" /> لوحة التحكم
        </div>
        <nav className="space-y-1" aria-label="قائمة الإدارة">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkCls}>
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
            </NavLink>
          ))}
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-ink hover:bg-brand-soft">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> عرض الموقع
          </a>
        </nav>
        <div className="mt-6 border-t border-line pt-4">
          <p className="mb-2 truncate text-xs text-muted" dir="ltr">{user?.email}</p>
          <button type="button" className="btn btn-outline w-full" onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden="true" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
