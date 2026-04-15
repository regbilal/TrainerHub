import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { Dumbbell, Loader2 } from 'lucide-react';
import LanguagePicker from '../components/LanguagePicker';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('register.passwordsMismatch'));
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        ...(phoneNumber.trim() ? { phoneNumber: phoneNumber.trim() } : {}),
      });
      navigate('/coach');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || t('register.failed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1B2D] flex items-center justify-center px-4 py-10">
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
          <h1 className="text-3xl font-bold text-white">{t('register.title')}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} placeholder={t('common.firstName')} autoComplete="given-name" />
            </div>
            <div>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} placeholder={t('common.lastName')} autoComplete="family-name" />
            </div>
            <div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder={t('common.email')} autoComplete="email" />
            </div>
            <div>
              <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} placeholder={t('register.phoneOptional')} autoComplete="tel" />
            </div>
            <div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className={inputClass} placeholder={t('common.password')} autoComplete="new-password" />
            </div>
            <div>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} placeholder={t('register.confirmPassword')} autoComplete="new-password" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('register.createAccount')}
            </button>
          </form>

          <div className="text-center pt-1">
            <Link to="/login" className="text-teal-500 font-semibold text-sm hover:text-teal-600">
              {t('register.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
