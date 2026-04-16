import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { Loader2, ChevronRight } from 'lucide-react';

export default function Onboarding() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const { t } = useTranslation();

  const initialFirst = useMemo(() => searchParams.get('firstName')?.trim() || '', [searchParams]);
  const initialLast = useMemo(() => searchParams.get('lastName')?.trim() || '', [searchParams]);

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tokenMissing = !token || !token.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (tokenMissing) {
      setError(t('onboarding.invalidInvitation'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('onboarding.passwordsMismatch'));
      return;
    }
    setLoading(true);
    try {
      await completeOnboarding({
        invitationToken: token.trim(),
        password,
        ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
      });
      navigate('/client');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || t('onboarding.failed'));
    } finally {
      setLoading(false);
    }
  };

  if (tokenMissing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('onboarding.invalidLink')}</h1>
          <p className="text-gray-500 text-sm mb-4">{t('onboarding.invalidLinkDesc')}</p>
          <Link to="/login" className="text-teal-500 font-semibold hover:text-teal-600">
            {t('onboarding.goToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('onboarding.welcome')}</h1>
          <p className="text-gray-500 mt-2">{t('onboarding.completeProfile')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>}

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
            <div className="flex items-center px-4 py-3.5">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent" placeholder={t('onboarding.setPassword')} autoComplete="new-password" />
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 rtl:rotate-180" aria-hidden />
            </div>
            <div className="flex items-center px-4 py-3.5">
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent" placeholder={t('onboarding.confirmPassword')} autoComplete="new-password" />
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 rtl:rotate-180" aria-hidden />
            </div>
            <div className="flex items-center px-4 py-3.5">
              <input type="text" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent" placeholder={t('onboarding.ageOptional')} />
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 rtl:rotate-180" aria-hidden />
            </div>
            <div className="flex items-center px-4 py-3.5">
              <input type="text" inputMode="decimal" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent" placeholder={t('onboarding.weightOptional')} />
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 rtl:rotate-180" aria-hidden />
            </div>
            <div className="flex items-center px-4 py-3.5">
              <input type="text" inputMode="decimal" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent" placeholder={t('onboarding.heightOptional')} />
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 rtl:rotate-180" aria-hidden />
            </div>
            <div className="flex items-center px-4 py-3.5">
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent" placeholder={t('common.firstName')} autoComplete="given-name" />
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 rtl:rotate-180" aria-hidden />
            </div>
            <div className="flex items-center px-4 py-3.5">
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent" placeholder={t('common.lastName')} autoComplete="family-name" />
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 rtl:rotate-180" aria-hidden />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-teal-500 text-white py-3.5 rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 mt-6">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('onboarding.getStarted')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link to="/login" className="text-teal-500 font-semibold hover:text-teal-600">
            {t('onboarding.signInInstead')}
          </Link>
        </p>
      </div>
    </div>
  );
}
