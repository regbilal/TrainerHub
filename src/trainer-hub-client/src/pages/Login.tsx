import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { Dumbbell, Loader2, Search } from 'lucide-react';
import LanguagePicker from '../components/LanguagePicker';
import type { User } from '../types';

function readStoredUserRole(): 'Coach' | 'Client' | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw) as User;
    return u.role === 'Coach' || u.role === 'Client' ? u.role : null;
  } catch {
    return null;
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const role = readStoredUserRole();
      navigate(role === 'Coach' ? '/coach' : '/client');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1B2D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-4">
          <LanguagePicker variant="dark" />
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold">{t('common.trainerHub')}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{t('login.welcome')}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                placeholder={t('common.email')}
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                placeholder={t('common.password')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('login.logIn')}
            </button>
          </form>

          <div className="text-center space-y-2">
            <Link to="/register" className="text-teal-500 font-semibold text-sm hover:text-teal-600 block">
              {t('login.signUp')}
            </Link>
            <p className="text-gray-400 text-xs">{t('login.forgotPassword')}</p>
          </div>
        </div>

        <Link
          to="/search"
          className="mt-6 flex items-center justify-center gap-2 text-white/70 text-sm hover:text-white transition-colors"
        >
          <Search className="h-4 w-4" />
          {t('login.findCoach')}
        </Link>
      </div>
    </div>
  );
}
