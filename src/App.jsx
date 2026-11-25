import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { isFirebaseConfigured } from './lib/firebase';
import { SettingsProvider } from './context/SettingsContext';
import PublicLayout from './components/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import CasesPage from './pages/public/CasesPage';
import CaseDetailsPage from './pages/public/CaseDetailsPage';
import NotFoundPage from './pages/public/NotFoundPage';
import { FullPageSpinner } from './components/ui/Feedback';

// لوحة التحكم (مع Firebase Auth) تُحمَّل عند الحاجة فقط لتبقى حزمة الموقع العام خفيفة
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function ConfigMissing() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl">إعدادات Firebase غير مكتملة</h1>
      <p className="mt-3 text-muted">
        أنشئ ملف <span dir="ltr" className="font-mono">.env.local</span> بنفس متغيرات <span dir="ltr" className="font-mono">.env.example</span> ثم أعد تشغيل المشروع. التفاصيل في README.
      </p>
    </div>
  );
}

export default function App() {
  if (!isFirebaseConfigured) return <ConfigMissing />;
  return (
    <SettingsProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:id" element={<CaseDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<FullPageSpinner />}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </SettingsProvider>
  );
}
