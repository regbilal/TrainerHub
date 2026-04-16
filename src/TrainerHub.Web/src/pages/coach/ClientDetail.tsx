import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Loader2,
  ClipboardList,
  Activity,
  Dumbbell,
  Plus,
  Calendar,
  Weight,
  ChevronDown,
  Check,
  Star,
  Pencil,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type {
  Client,
  ProgramAssignment,
  ProgressEntry,
  WorkoutLog,
  TrainingProgram,
  Review,
  MealProgramListItem,
  MealProgramAssignment,
} from '../../types';

type Tab = 'overview' | 'workouts' | 'stats' | 'reviews';

export default function CoachClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [assignments, setAssignments] = useState<ProgramAssignment[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [mealPrograms, setMealPrograms] = useState<MealProgramListItem[]>([]);
  const [mealAssignments, setMealAssignments] = useState<MealProgramAssignment[]>([]);
  const [selectedMealProgram, setSelectedMealProgram] = useState('');
  const [showMealAssign, setShowMealAssign] = useState(false);
  const [assigningMeal, setAssigningMeal] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Client>(`/clients/${id}`);
        setClient(res.data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const fetchTabData = useCallback(
    async (tab: Tab) => {
      setTabLoading(true);
      try {
        if (tab === 'overview') {
          const [assignRes, progressRes] = await Promise.all([
            api.get<ProgramAssignment[]>(`/clients/${id}/assignments`),
            api.get<ProgressEntry[]>(`/clients/${id}/progress`),
          ]);
          setAssignments(assignRes.data);
          setProgress(progressRes.data);
        } else if (tab === 'workouts') {
          const res = await api.get<WorkoutLog[]>(`/clients/${id}/workout-logs`);
          setLogs(res.data);
        } else if (tab === 'reviews') {
          const res = await api.get<Review[]>(`/reviews/client/${id}`);
          setReviews(res.data);
        } else {
          const res = await api.get<ProgressEntry[]>(`/clients/${id}/progress`);
          setProgress(res.data);
        }
      } catch {
        // silently handled
      } finally {
        setTabLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (id) fetchTabData(activeTab);
  }, [activeTab, id, fetchTabData]);

  async function handleAssign() {
    if (!selectedProgramId) return;
    setAssigning(true);
    try {
      await api.post(`/programs/${selectedProgramId}/assign`, { clientId: id });
      setShowAssign(false);
      setSelectedProgramId('');
      await fetchTabData('overview');
    } catch {
      // silently handled
    } finally {
      setAssigning(false);
    }
  }

  async function openAssignDropdown() {
    setShowAssign(true);
    if (programs.length === 0) {
      try {
        const res = await api.get<TrainingProgram[]>('/programs');
        setPrograms(res.data);
      } catch {
        // silently handled
      }
    }
  }

  async function openMealAssignDropdown() {
    setShowMealAssign(true);
    if (mealPrograms.length === 0) {
      try {
        const res = await api.get<MealProgramListItem[]>('/meal-programs');
        setMealPrograms(res.data);
      } catch {
        // silently handled
      }
    }
  }

  async function handleMealAssign() {
    if (!selectedMealProgram) return;
    setAssigningMeal(true);
    try {
      const res = await api.post<MealProgramAssignment>('/meal-programs/assign', {
        mealProgramId: selectedMealProgram,
        clientId: id,
      });
      setMealAssignments((prev) => [...prev, res.data]);
      setShowMealAssign(false);
      setSelectedMealProgram('');
    } catch {
      // silently handled
    } finally {
      setAssigningMeal(false);
    }
  }

  const myReview = reviews.find((r) => r.reviewerUserId === user?.id);
  const clientReview = reviews.find((r) => r.reviewerUserId !== user?.id);

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
          clientRelationshipId: id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        setReviews((prev) => prev.map((r) => (r.id === editingReviewId ? res.data : r)));
      } else {
        const res = await api.post<Review>('/reviews', {
          clientRelationshipId: id,
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

  const assignmentStatusColor: Record<string, string> = {
    Active: 'bg-teal-50 text-teal-600',
    Completed: 'bg-blue-100 text-blue-800',
    Paused: 'bg-gray-100 text-gray-600',
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('coach.clientDetail.overview') },
    { key: 'workouts', label: t('coach.clientDetail.workouts') },
    { key: 'stats', label: t('coach.clientDetail.stats') },
    { key: 'reviews', label: t('coach.clientDetail.reviews') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">
        {t('coach.clientDetail.clientNotFound')}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to="/coach"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('coach.clientDetail.backToClients')}
      </Link>

      {/* Client header */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{t('coach.clientDetail.weightLoss')}</p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1B2A4A] text-white font-bold text-lg">
            {client.firstName[0]}
            {client.lastName[0]}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        </div>
      ) : (
        <>
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Progress */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('coach.clientDetail.recentProgress')}</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-teal-500" />
                    </div>
                    <p className="text-sm text-gray-700">{t('coach.clientDetail.lastWorkout')}</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-teal-500" />
                    </div>
                    <p className="text-sm text-gray-700">
                      {progress.length > 0 && progress[0].weight != null
                        ? t('coach.clientDetail.currentWeight', { weight: progress[0].weight })
                        : t('coach.clientDetail.currentWeightDefault')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Program */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">{t('coach.clientDetail.assignedProgram')}</h2>
                  <button
                    onClick={openAssignDropdown}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    {t('coach.clientDetail.assignProgram')}
                  </button>
                </div>

                {showAssign && (
                  <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4 flex flex-col sm:flex-row items-start sm:items-end gap-3">
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('coach.clientDetail.selectProgram')}
                      </label>
                      <div className="relative">
                        <select
                          value={selectedProgramId}
                          onChange={(e) => setSelectedProgramId(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none appearance-none"
                        >
                          <option value="">{t('coach.clientDetail.chooseProgram')}</option>
                          {programs.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAssign}
                        disabled={!selectedProgramId || assigning}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50 transition-colors"
                      >
                        {assigning && <Loader2 className="h-4 w-4 animate-spin" />}
                        {t('coach.clientDetail.assign')}
                      </button>
                      <button
                        onClick={() => setShowAssign(false)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {assignments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ClipboardList className="mx-auto h-10 w-10 mb-3" />
                    <p className="text-sm">{t('coach.clientDetail.noProgramsAssigned')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {a.program?.name ?? t('common.program')}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{t('coach.clientDetail.threeDaysWeek')}</p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${assignmentStatusColor[a.status] ?? ''}`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <button
                          onClick={() => a.program?.id && navigate(`/coach/programs/${a.program.id}/edit`)}
                          className="mt-3 inline-flex items-center rounded-lg bg-teal-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
                        >
                          {t('coach.clientDetail.viewProgram')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assigned Meal Program */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">{t('coach.clientDetail.assignedMealProgram')}</h2>
                  <button
                    onClick={openMealAssignDropdown}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    {t('coach.clientDetail.assignMealProgram')}
                  </button>
                </div>

                {showMealAssign && (
                  <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4 flex flex-col sm:flex-row items-start sm:items-end gap-3">
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('coach.clientDetail.selectMealProgram')}
                      </label>
                      <div className="relative">
                        <select
                          value={selectedMealProgram}
                          onChange={(e) => setSelectedMealProgram(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none appearance-none"
                        >
                          <option value="">{t('coach.clientDetail.chooseMealProgram')}</option>
                          {mealPrograms.map((mp) => (
                            <option key={mp.id} value={mp.id}>
                              {mp.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleMealAssign}
                        disabled={!selectedMealProgram || assigningMeal}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50 transition-colors"
                      >
                        {assigningMeal && <Loader2 className="h-4 w-4 animate-spin" />}
                        {t('coach.clientDetail.assign')}
                      </button>
                      <button
                        onClick={() => setShowMealAssign(false)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {mealAssignments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <UtensilsCrossed className="mx-auto h-10 w-10 mb-3" />
                    <p className="text-sm">{t('coach.clientDetail.noMealProgramsAssigned')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mealAssignments.map((ma) => (
                      <div
                        key={ma.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {ma.mealProgram?.name ?? t('common.program')}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${assignmentStatusColor[ma.status] ?? ''}`}
                          >
                            {ma.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Workouts */}
          {activeTab === 'workouts' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('coach.clientDetail.workoutLogs')}</h2>
              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Dumbbell className="mx-auto h-10 w-10 mb-3" />
                  <p className="text-sm">{t('coach.clientDetail.noWorkoutLogs')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {log.exercise?.name ?? t('common.exercise')}
                        </p>
                        <span className="text-xs text-gray-400">
                          {new Date(log.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {log.setsCompleted != null && <span>{log.setsCompleted} sets</span>}
                        {log.repsCompleted != null && <span>{log.repsCompleted} reps</span>}
                        {log.weightUsed != null && <span>{log.weightUsed} kg</span>}
                        {log.durationSeconds != null && <span>{log.durationSeconds}s</span>}
                      </div>
                      {log.notes && (
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{log.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('coach.clientDetail.progressEntries')}</h2>
              {progress.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Activity className="mx-auto h-10 w-10 mb-3" />
                  <p className="text-sm">{t('coach.clientDetail.noProgressEntries')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {progress.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(p.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {p.weight != null && (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <Weight className="h-4 w-4 text-teal-500" />
                            {p.weight} kg
                          </span>
                        )}
                        {p.bodyFatPercentage != null && (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <Activity className="h-4 w-4 text-teal-500" />
                            {p.bodyFatPercentage}{t('coach.clientDetail.bodyFat')}
                          </span>
                        )}
                      </div>
                      {p.notes && (
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{p.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Your review of this client */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">{t('coach.clientDetail.yourReview')}</h2>
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

                {myReview && !showReviewForm && (
                  <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(myReview.rating)}
                      <span className="text-sm text-gray-600">{myReview.rating}/5</span>
                    </div>
                    {myReview.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{myReview.comment}</p>
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
                  <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
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
                        placeholder={t('coach.clientDetail.reviewPlaceholder')}
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

                {!myReview && !showReviewForm && (
                  <p className="text-sm text-gray-400">{t('coach.clientDetail.notReviewedYet')}</p>
                )}
              </div>

              {/* Client's review of you */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('coach.clientDetail.clientReview')}</h2>
                {clientReview ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {renderStars(clientReview.rating)}
                        <span className="text-sm text-gray-600">{clientReview.rating}/5</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(clientReview.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {clientReview.comment && (
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{clientReview.comment}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="mx-auto h-10 w-10 mb-3" />
                    <p className="text-sm">{t('coach.clientDetail.noClientReview')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
