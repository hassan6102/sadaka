import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import AdminLayout, { RequireAdmin } from '../../components/admin/AdminLayout';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import CasesAdminPage from './CasesAdminPage';
import CaseEditPage from './CaseEditPage';
import MethodsAdminPage from './MethodsAdminPage';
import SettingsAdminPage from './SettingsAdminPage';

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<DashboardPage />} />
          <Route path="cases" element={<CasesAdminPage />} />
          <Route path="cases/new" element={<CaseEditPage />} />
          <Route path="cases/:id/edit" element={<CaseEditPage />} />
          <Route path="methods" element={<MethodsAdminPage />} />
          <Route path="settings" element={<SettingsAdminPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
