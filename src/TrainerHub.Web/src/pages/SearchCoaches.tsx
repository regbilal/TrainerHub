import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Dumbbell,
  Loader2,
  Send,
  ArrowLeft,
  CheckCircle,
  User,
  X,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../lib/api';
import LanguagePicker from '../components/LanguagePicker';
import type { CoachSearchResult, Review } from '../types';

export default function SearchCoaches() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [coaches, setCoaches] = useState<CoachSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [connectingCoachId, setConnectingCoachId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [successCoachId, setSuccessCoachId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [expandedReviewsCoachId, setExpandedReviewsCoachId] = useState<string | null>(null);
  const [coachReviews, setCoachReviews] = useState<Record<string, Review[]>>({});
  const [loadingReviews, setLoadingReviews] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setConnectingCoachId(null);
    setSuccessCoachId(null);
    try {
      const res = await api.get<CoachSearchResult[]>('/coaches/search', {
        params: { q: query.trim() || undefined },
      });
      setCoaches(res.data);
    } catch {
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  }

  function openConnectForm(coachId: string) {
    setConnectingCoachId(coachId);
    setError('');
    setFormData({ firstName: '', lastName: '', phoneNumber: '', email: '', message: '' });
  }

  async function handleSendRequest(coachId: string) {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phoneNumber.trim()) {
      setError(t('search.namePhoneRequired'));
      return;
    }
    setSending(true);
    setError('');
    try {
      await api.post('/coaches/connect', {
        coachId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        message: formData.message.trim() || undefined,
      });
      setConnectingCoachId(null);
      setSuccessCoachId(coachId);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || t('search.failedRequest'));
    } finally {
      setSending(false);
    }
  }

  async function toggleReviews(coachId: string) {
    if (expandedReviewsCoachId === coachId) {
      setExpandedReviewsCoachId(null);
      return;
    }
    setExpandedReviewsCoachId(coachId);
    if (!coachReviews[coachId]) {
      setLoadingReviews(coachId);
      try {
        const res = await api.get<Review[]>(`/coaches/${coachId}/reviews`);
        setCoachReviews((prev) => ({ ...prev, [coachId]: res.data }));
      } catch {
        setCoachReviews((prev) => ({ ...prev, [coachId]: [] }));
      } finally {
        setLoadingReviews(null);
      }
    }
  }

  function renderStars(rating: number, size: 'sm' | 'md' = 'sm') {
    const cls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${cls} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B2A4A] pt-12 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-end mb-2"><LanguagePicker variant="dark" /></div>
          <Link to="/login" className="inline-flex items-center gap-1 text-white/60 text-sm hover:text-white transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            {t('search.backToLogin')}
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-6 w-6 text-teal-400" />
            <span className="text-white font-bold text-lg">{t('common.trainerHub')}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('search.findCoach')}</h1>
          <p className="text-white/60 text-sm">{t('search.subtitle')}</p>

          <form onSubmit={handleSearch} className="mt-5 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={t('search.placeholder')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-500 text-white px-5 rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {t('search.searchBtn')}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        )}

        {!loading && searched && coaches.length === 0 && (
          <div className="text-center py-16">
            <User className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t('search.noCoaches')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('search.tryDifferent')}</p>
          </div>
        )}

        {!loading && coaches.length > 0 && (
          <div className="space-y-3">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="p-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {coach.firstName[0]}{coach.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {coach.firstName} {coach.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{coach.email}</p>
                    {coach.reviewCount > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        {renderStars(Math.round(coach.averageRating ?? 0))}
                        <span className="text-xs text-gray-500">
                          {coach.averageRating?.toFixed(1)} ({coach.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                  {successCoachId === coach.id ? (
                    <div className="flex items-center gap-1 text-teal-600 text-sm font-medium">
                      <CheckCircle className="h-5 w-5" />
                      {t('search.sent')}
                    </div>
                  ) : connectingCoachId === coach.id ? (
                    <button
                      onClick={() => setConnectingCoachId(null)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => openConnectForm(coach.id)}
                      className="inline-flex items-center gap-1.5 bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {t('search.connect')}
                    </button>
                  )}
                </div>

                {/* Inline connect form */}
                {connectingCoachId === coach.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                    {error && (
                      <div className="bg-red-50 text-red-600 text-sm p-2.5 rounded-lg">{error}</div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder={t('search.firstNameRequired')}
                        className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder={t('search.lastNameRequired')}
                        className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    </div>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder={t('search.phoneRequired')}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('search.emailOptional')}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t('search.messageOptional')}
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white resize-none"
                    />
                    <button
                      onClick={() => handleSendRequest(coach.id)}
                      disabled={sending}
                      className="w-full bg-teal-500 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {t('search.sendRequest')}
                    </button>
                  </div>
                )}

                {/* Reviews toggle */}
                {coach.reviewCount > 0 && (
                  <>
                    <button
                      onClick={() => toggleReviews(coach.id)}
                      className="w-full border-t border-gray-100 px-4 py-2.5 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 hover:bg-gray-50 transition-colors"
                    >
                      {expandedReviewsCoachId === coach.id ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          {t('search.hideReviews')}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          {t('search.viewReviews', { count: coach.reviewCount })}
                        </>
                      )}
                    </button>

                    {expandedReviewsCoachId === coach.id && (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-3">
                        {loadingReviews === coach.id ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                          </div>
                        ) : (coachReviews[coach.id] || []).length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-2">{t('common.noReviewsYet')}</p>
                        ) : (
                          (coachReviews[coach.id] || []).map((review) => (
                            <div key={review.id} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">{review.reviewerName}</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {renderStars(review.rating)}
                              {review.comment && (
                                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-16">
            <Search className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t('search.searchForCoach')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('search.browseAll')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
