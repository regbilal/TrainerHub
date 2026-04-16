import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  ChevronRight,
  Dumbbell,
  Loader2,
  Plus,
  Scale,
  TrendingDown,
  TrendingUp,
  X,
  FileText,
} from 'lucide-react';
import api from '../../lib/api';
import type { ProgressEntry, WorkoutLog } from '../../types';

export default function ClientProgress() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [entryRes, logsRes] = await Promise.all([
          api.get<ProgressEntry[]>('/progress'),
          api.get<WorkoutLog[]>('/progress/workouts'),
        ]);
        setEntries(entryRes.data);
        setWorkoutLogs(logsRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleEntrySubmit(e: FormEvent) {
    e.preventDefault();
    if (!weight && !bodyFat && !notes.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (weight) payload.weight = Number(weight);
      if (bodyFat) payload.bodyFatPercentage = Number(bodyFat);
      if (notes.trim()) payload.notes = notes.trim();

      const res = await api.post<ProgressEntry>('/progress/entry', payload);
      setEntries((prev) => [res.data, ...prev]);
      setWeight('');
      setBodyFat('');
      setNotes('');
      setShowEntryForm(false);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const withWeight = sortedEntries.filter((e) => e.weight != null);
  const latestWeight = withWeight[0]?.weight;
  const previousWeight = withWeight[1]?.weight;
  const weightTrend =
    latestWeight != null && previousWeight != null
      ? latestWeight > previousWeight
        ? 'up'
        : latestWeight < previousWeight
          ? 'down'
          : 'same'
      : null;

  const weightPoints = withWeight
    .slice(0, 10)
    .reverse()
    .map((e) => e.weight!);
  const minW = weightPoints.length ? Math.min(...weightPoints) : 0;
  const maxW = weightPoints.length ? Math.max(...weightPoints) : 1;

  const sortedLogs = [...workoutLogs].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  const recentLogs = sortedLogs.slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('client.progress.title')}</h1>
        <button
          type="button"
          onClick={() => setShowEntryForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600 transition"
        >
          {showEntryForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showEntryForm ? t('common.cancel') : t('client.progress.logEntry')}
        </button>
      </div>

      {/* Inline form */}
      {showEntryForm && (
        <form
          onSubmit={handleEntrySubmit}
          className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('common.weightKg')}</label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('client.progress.bodyFatPercent')} <span className="text-gray-400">{t('common.optional')}</span>
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('common.notes')} <span className="text-gray-400">{t('common.optional')}</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || (!weight && !bodyFat && !notes.trim())}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600 disabled:opacity-50 transition"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('client.progress.saveEntry')}
          </button>
        </form>
      )}

      {/* Weight display card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
            <Scale className="h-5 w-5 text-teal-500" />
            {t('client.progress.weight')}
          </h2>
          <span className="text-sm text-gray-400">{t('client.progress.thisWeek')}</span>
        </div>
        <div className="flex items-end gap-3">
          <p className="text-4xl font-bold text-[#1B2A4A]">
            {latestWeight ?? '—'} <span className="text-lg font-normal text-gray-400">{t('common.kg')}</span>
          </p>
          {weightTrend === 'up' && (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-rose-600 mb-1.5">
              <TrendingUp className="h-4 w-4" />+{(latestWeight! - previousWeight!).toFixed(1)}
            </span>
          )}
          {weightTrend === 'down' && (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 mb-1.5">
              <TrendingDown className="h-4 w-4" />-{(previousWeight! - latestWeight!).toFixed(1)}
            </span>
          )}
        </div>

        {/* SVG weight chart */}
        {weightPoints.length > 1 && (
          <div className="mt-4 h-24">
            <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                points={weightPoints
                  .map(
                    (p, i) =>
                      `${(i / (weightPoints.length - 1)) * 300},${80 - ((p - minW) / (maxW - minW || 1)) * 70}`,
                  )
                  .join(' ')}
              />
              {weightPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={(i / (weightPoints.length - 1)) * 300}
                  cy={80 - ((p - minW) / (maxW - minW || 1)) * 70}
                  r="3"
                  fill="#14b8a6"
                />
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Body metric entries */}
      {sortedEntries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[#1B2A4A]">{t('client.progress.bodyMetrics')}</h2>
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(entry.createdAt).toLocaleDateString(undefined, {
                    dateStyle: 'medium',
                  })}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {entry.weight != null && (
                  <span className="inline-flex items-center gap-1 font-medium text-gray-900">
                    <Scale className="h-4 w-4 text-teal-500" />
                    {entry.weight} kg
                  </span>
                )}
                {entry.bodyFatPercentage != null && (
                  <span className="text-gray-600">{entry.bodyFatPercentage}{t('client.progress.bodyFat')}</span>
                )}
              </div>
              {entry.notes && (
                <p className="mt-2 text-sm text-gray-500 italic">{entry.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {sortedEntries.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
          <Scale className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            {t('client.progress.noEntries')}
          </p>
        </div>
      )}

      {/* Recent Logs */}
      <div>
        <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2 mb-3">
          <Dumbbell className="h-5 w-5 text-teal-500" />
          {t('client.progress.recentLogs')}
        </h2>

        {recentLogs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
            <Dumbbell className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              {t('client.progress.noWorkouts')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <Dumbbell className="h-4 w-4 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {log.exercise?.name ?? t('common.exercise')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.completedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' — '}
                    {log.setsCompleted != null && `${log.setsCompleted} sets `}
                    {log.repsCompleted != null && `${log.repsCompleted} reps `}
                    {log.weightUsed != null && `@ ${log.weightUsed}kg `}
                    {log.durationSeconds != null && `${log.durationSeconds}s`}
                  </p>
                  {log.notes && (
                    <p className="text-xs text-gray-400 italic flex items-center gap-1 mt-0.5">
                      <FileText className="h-3 w-3 shrink-0" />
                      {log.notes}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
