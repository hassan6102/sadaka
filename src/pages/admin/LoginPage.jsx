import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Field } from '../../components/ui/Field';
import { Notice, FullPageSpinner } from '../../components/ui/Feedback';
import { errorMessage } from '../../lib/format';

export default function LoginPage() {
  const { login, loading, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <FullPageSpinner />;
  if (user && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <div className="text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
            <HeartHandshake className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-xl">تسجيل دخول الإدارة</h1>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <Field label="البريد الإلكتروني" htmlFor="email">
          <input id="email" type="email" dir="ltr" autoComplete="username" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="كلمة المرور" htmlFor="pw">
          <input id="pw" type="password" dir="ltr" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'جارٍ الدخول…' : 'دخول'}
        </button>
      </form>
    </div>
  );
}
