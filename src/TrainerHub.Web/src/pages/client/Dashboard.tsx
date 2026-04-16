import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Scale,
  TrendingUp,
  Loader2,
  FolderOpen,
  ClipboardList,
  Activity,
  Star,
  Pencil,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { ProgramAssignment, ProgressEntry, Review, MealProgramAssignment } from '../../types';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState<ProgramAssignment[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [mealAssignments, setMealAssignments] = useState<MealProgramAssignment[]>([]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [assignRes, progressRes, mealRes] = await Promise.all([
          api.get<ProgramAssignment[]>('/progress/assignments'),
          api.get<ProgressEntry[]>('/progress'),
          api.get<MealProgramAssignment[]>('/meal-programs/assignments'),
        ]);
        setAssignments(assignRes.data);
        setProgressEntries(progressRes.data);
        setMealAssignments(mealRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!user?.clientId) return;
    (async () => {
      try {
        const res = await api.get<Review[]>(`/reviews/client/${user.clientId}`);
        setReviews(res.data);
      } catch { }
    })();
  }, [user?.clientId]);

  const myReview = reviews.find((r) => r.reviewerUserId === user?.id);
  const coachReview = reviews.find((r) => r.reviewerUserId !== user?.id);

  function startEditReview(review: Review) {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    setShowReviewForm(true);
    setReviewError('');
  }

  function startNewReview() {
    setEditingReviewId(null);
    setReviewRating(0);
    setReviewComment('');
    setShowReviewForm(true);
    setReviewError('');
  }

  async function handleSubmitReview() {
    if (reviewRating === 0) {
      setReviewError(t('common.selectRating'));
      return;
    }
    setSubmittingReview(true);
    setReviewError('');
    try {
      if (editingReviewId) {
        const res = await api.put<Review>(`/reviews/${editingReviewId}`, {
          clientRelationshipId: user!.clientId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        setReviews((prev) => prev.map((r) => (r.id === editingReviewId ? res.data : r)));
      } else {
        const res = await api.post<Review>('/reviews', {
          clientRelationshipId: user!.clientId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        setReviews((prev) => [...prev, res.data]);
      }
      setShowReviewForm(false);
      setEditingReviewId(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setReviewError(message || t('common.failedReview'));
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch { }
  }

  function renderStars(rating: number, interactive = false) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setReviewRating(i)}
            onMouseEnter={() => interactive && setReviewHover(i)}
            onMouseLeave={() => interactive && setReviewHover(0)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                i <= (interactive ? reviewHover || reviewRating : rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  }

  const activePrograms = assignments.filter((a) => a.status === 'Active').length;
  const sorted = [...progressEntries]
    .filter((e) => e.weight != null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latestWeight = sorted[0]?.weight;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  const mainAssignment = assignments.find((a) => a.status === 'Active');

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <ClipboardList className="h-5 w-5 text-teal-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-[#1B2A4A]">{activePrograms}</p>
          <p className="text-xs text-gray-400">{t('client.dashboard.programs')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <Activity className="h-5 w-5 text-teal-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-[#1B2A4A]">0</p>
          <p className="text-xs text-gray-400">{t('client.dashboard.thisWeek')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <Scale className="h-5 w-5 text-teal-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-[#1B2A4A]">{latestWeight ?? '—'}</p>
          <p className="text-xs text-gray-400">{t('client.dashboard.weightKg')}</p>
        </div>
      </div>

      {/* Review Your Coach */}
      {user?.clientId && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#1B2A4A]">{t('client.dashboard.coachReview')}</h2>
            {!myReview && !showReviewForm && (
              <button
                onClick={startNewReview}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
              >
                <Star className="h-4 w-4" />
                {t('common.writeReview')}
              </button>
            )}
          </div>

          {coachReview && (
            <div className="mb-3 rounded-lg bg-gray-50 p-3 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{t('client.dashboard.coachReviewOfYou')}</p>
              <div className="flex items-center gap-2 mb-1">
                {renderStars(coachReview.rating)}
                <span className="text-sm text-gray-600">{coachReview.rating}/5</span>
              </div>
              {coachReview.comment && (
                <p className="text-sm text-gray-600 leading-relaxed">{coachReview.comment}</p>
              )}
            </div>
          )}

          {myReview && !showReviewForm && (
            <div className="rounded-lg bg-teal-50/50 p-3 border border-teal-100">
              <p className="text-xs text-gray-400 mb-1">{t('client.dashboard.yourReview')}</p>
              <div className="flex items-center gap-2 mb-1">
                {renderStars(myReview.rating)}
                <span className="text-sm text-gray-600">{myReview.rating}/5</span>
              </div>
              {myReview.comment && (
                <p className="text-sm text-gray-600 leading-relaxed mb-2">{myReview.comment}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => startEditReview(myReview)}
                  className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                >
                  <Pencil className="h-3 w-3" />
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDeleteReview(myReview.id)}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                  {t('common.delete')}
                </button>
              </div>
            </div>
          )}

          {showReviewForm && (
            <div className="space-y-3">
              {reviewError && (
                <div className="bg-red-50 text-red-600 text-sm p-2.5 rounded-lg">{reviewError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.rating')}</label>
                {renderStars(reviewRating, true)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.comment')}</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder={t('client.dashboard.reviewPlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50 transition-colors"
                >
                  {submittingReview && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingReviewId ? t('common.updateReview') : t('common.submitReview')}
                </button>
                <button
                  onClick={() => { setShowReviewForm(false); setEditingReviewId(null); }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {!myReview && !showReviewForm && !coachReview && (
            <p className="text-sm text-gray-400">{t('client.dashboard.noReviews')}</p>
          )}
        </div>
      )}

      {/* Featured program */}
      {mainAssignment?.program && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1B2A4A]">{mainAssignment.program.name}</h2>
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>

          <Link
            to={`/client/programs/${mainAssignment.id}`}
            className="flex items-center justify-between bg-teal-500 text-white rounded-xl p-3 mb-3"
          >
            <span className="font-semibold text-sm">{t('client.dashboard.day1Workout')}</span>
            <ChevronRight className="h-5 w-5" />
          </Link>

          <div className="space-y-3">
            {(mainAssignment.program.exercises || []).slice(0, 3).map((ex) => (
              <div key={ex.id} className="flex items-center gap-3 py-2">
                <Dumbbell className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{ex.name}</p>
                  <p className="text-xs text-gray-400">
                    {ex.sets && ex.reps
                      ? `• sets ${ex.sets} - ${ex.reps} reps`
                      : ex.durationSeconds
                        ? `• ${ex.durationSeconds}s`
                        : ''}
                  </p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">
                  {ex.sets ? `Sets ${ex.sets}` : ''} {ex.reps ? `${ex.reps} Reps` : ''}
                </span>
              </div>
            ))}
          </div>

          <Link
            to={`/client/programs/${mainAssignment.id}`}
            className="block w-full bg-teal-500 text-white text-center py-3 rounded-xl font-semibold mt-4 hover:bg-teal-600 transition-colors"
          >
            {t('client.dashboard.startWorkout')}
          </Link>
        </div>
      )}

      {/* All programs */}
      {assignments.length > 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('client.dashboard.allPrograms')}</h2>
          <div className="space-y-3">
            {assignments.map((a) => (
              <Link
                key={a.id}
                to={`/client/programs/${a.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-teal-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{a.program?.name ?? t('common.program')}</p>
                  <p className="text-xs text-gray-400">
                    {a.program?.exercises?.length ?? 0} exercises
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    a.status === 'Active'
                      ? 'bg-teal-50 text-teal-600'
                      : a.status === 'Completed'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {a.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">{t('client.dashboard.noProgramsAssigned')}</p>
        </div>
      )}

      {/* Meal Programs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <UtensilsCrossed className="h-5 w-5 text-teal-500" />
          <h2 className="text-lg font-semibold text-gray-900">{t('client.dashboard.mealPrograms')}</h2>
        </div>

        {mealAssignments.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
            <UtensilsCrossed className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">{t('client.dashboard.noMealProgramsAssigned')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mealAssignments.map((ma) => (
              <div
                key={ma.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
              >
                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
                  <UtensilsCrossed className="h-5 w-5 text-teal-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {ma.mealProgram?.name ?? t('common.program')}
                  </p>
                </div>
                <Link
                  to={`/client/meals/${ma.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
                >
                  {t('client.dashboard.viewMealPlan')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
