import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2, Loader2, GripVertical } from 'lucide-react';
import api from '../../lib/api';
import type { TrainingProgram } from '../../types';

interface ExerciseInput {
  key: string;
  name: string;
  description: string;
  sets: string;
  reps: string;
  durationSeconds: string;
  restSeconds: string;
  notes: string;
}

function blankExercise(): ExerciseInput {
  return {
    key: crypto.randomUUID(),
    name: '',
    description: '',
    sets: '',
    reps: '',
    durationSeconds: '',
    restSeconds: '',
    notes: '',
  };
}

export default function CoachProgramForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<ExerciseInput[]>([blankExercise()]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get<TrainingProgram>(`/programs/${id}`);
        const p = res.data;
        setName(p.name);
        setDescription(p.description ?? '');
        if (p.exercises.length > 0) {
          setExercises(
            p.exercises
              .sort((a, b) => a.order - b.order)
              .map((ex) => ({
                key: ex.id,
                name: ex.name,
                description: ex.description ?? '',
                sets: ex.sets?.toString() ?? '',
                reps: ex.reps?.toString() ?? '',
                durationSeconds: ex.durationSeconds?.toString() ?? '',
                restSeconds: ex.restSeconds?.toString() ?? '',
                notes: ex.notes ?? '',
              })),
          );
        }
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function updateExercise(key: string, field: keyof ExerciseInput, value: string) {
    setExercises((prev) =>
      prev.map((ex) => (ex.key === key ? { ...ex, [field]: value } : ex)),
    );
  }

  function removeExercise(key: string) {
    setExercises((prev) => prev.filter((ex) => ex.key !== key));
  }

  function addExercise() {
    setExercises((prev) => [...prev, blankExercise()]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name,
      description: description || undefined,
      exercises: exercises.map((ex, i) => ({
        name: ex.name,
        description: ex.description || undefined,
        sets: ex.sets ? Number(ex.sets) : undefined,
        reps: ex.reps ? Number(ex.reps) : undefined,
        durationSeconds: ex.durationSeconds ? Number(ex.durationSeconds) : undefined,
        restSeconds: ex.restSeconds ? Number(ex.restSeconds) : undefined,
        notes: ex.notes || undefined,
        order: i + 1,
      })),
    };

    try {
      if (isEdit) {
        await api.put(`/programs/${id}`, payload);
      } else {
        await api.post('/programs', payload);
      }
      navigate('/coach/programs');
    } catch (err: any) {
      setError(err.response?.data?.message ?? t('coach.programForm.failedSave'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate('/coach/programs')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('coach.programForm.backToPrograms')}
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? t('coach.programForm.editProgram') : t('coach.programForm.newProgram')}
      </h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Program details */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('coach.programForm.programDetails')}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('coach.programForm.programName')} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              placeholder={t('coach.programForm.namePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
              placeholder={t('coach.programForm.descPlaceholder')}
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('coach.programForm.exercises')}
              <span className="ml-2 text-sm font-normal text-gray-400">({exercises.length})</span>
            </h2>
          </div>

          <div className="space-y-4">
            {exercises.map((ex, idx) => (
              <div
                key={ex.key}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500">
                    <GripVertical className="h-4 w-4" />
                    {t('coach.programForm.exerciseNum', { num: idx + 1 })}
                  </span>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(ex.key)}
                      className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('common.remove')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {t('common.name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={ex.name}
                      onChange={(e) => updateExercise(ex.key, 'name', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      placeholder={t('coach.programForm.exNamePlaceholder')}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {t('common.description')}
                    </label>
                    <input
                      type="text"
                      value={ex.description}
                      onChange={(e) => updateExercise(ex.key, 'description', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      placeholder={t('coach.programForm.exDescPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('common.sets')}</label>
                    <input
                      type="number"
                      min="0"
                      value={ex.sets}
                      onChange={(e) => updateExercise(ex.key, 'sets', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('common.reps')}</label>
                    <input
                      type="number"
                      min="0"
                      value={ex.reps}
                      onChange={(e) => updateExercise(ex.key, 'reps', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {t('common.durationSec')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={ex.durationSeconds}
                      onChange={(e) => updateExercise(ex.key, 'durationSeconds', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {t('common.restSec')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={ex.restSeconds}
                      onChange={(e) => updateExercise(ex.key, 'restSeconds', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      placeholder="90"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('common.notes')}</label>
                    <input
                      type="text"
                      value={ex.notes}
                      onChange={(e) => updateExercise(ex.key, 'notes', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      placeholder={t('coach.programForm.notesPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addExercise}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors w-full justify-center"
          >
            <Plus className="h-4 w-4" />
            {t('coach.programForm.addExercise')}
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/coach/programs')}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? t('coach.programForm.updateProgram') : t('coach.programForm.createProgram')}
          </button>
        </div>
      </form>
    </div>
  );
}
