import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Loader2,
  Save,
} from 'lucide-react';
import api from '../../lib/api';
import type { ProgramAssignment, WorkoutLog, Exercise } from '../../types';

interface WorkoutForm {
  setsCompleted: string;
  repsCompleted: string;
  weightUsed: string;
  durationSeconds: string;
  notes: string;
}

const emptyForm: WorkoutForm = {
  setsCompleted: '',
  repsCompleted: '',
  weightUsed: '',
  durationSeconds: '',
  notes: '',
};

export default function ClientProgramView() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { t } = useTranslation();
  const [assignment, setAssignment] = useState<ProgramAssignment | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkoutForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [assignRes, logsRes] = await Promise.all([
          api.get<ProgramAssignment[]>('/progress/assignments'),
          api.get<WorkoutLog[]>('/progress/workouts', { params: { assignmentId } }),
        ]);
        const match = assignRes.data.find((a) => a.id === assignmentId) ?? null;
        setAssignment(match);
        setWorkoutLogs(logsRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assignmentId]);

  const exercises = [...(assignment?.program?.exercises ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  const logsForExercise = (exerciseId: string) =>
    workoutLogs.filter((l) => l.exerciseId === exerciseId);

  const isCompleted = (exerciseId: string) => logsForExercise(exerciseId).length > 0;
  const completedCount = exercises.filter((e) => isCompleted(e.id)).length;

  function toggleExpand(exerciseId: string) {
    if (expandedId === exerciseId) {
      setExpandedId(null);
      setFormData(emptyForm);
    } else {
      setExpandedId(exerciseId);
      setFormData(emptyForm);
    }
  }

  async function handleSubmit(e: FormEvent, exercise: Exercise) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        programAssignmentId: assignmentId,
        exerciseId: exercise.id,
      };
      if (formData.setsCompleted) payload.setsCompleted = Number(formData.setsCompleted);
      if (formData.repsCompleted) payload.repsCompleted = Number(formData.repsCompleted);
      if (formData.weightUsed) payload.weightUsed = Number(formData.weightUsed);
      if (formData.durationSeconds) payload.durationSeconds = Number(formData.durationSeconds);
      if (formData.notes.trim()) payload.notes = formData.notes.trim();

      const res = await api.post<WorkoutLog>('/progress/workout', payload);
      setWorkoutLogs((prev) => [...prev, res.data]);
      setExpandedId(null);
      setFormData(emptyForm);
    } catch {
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

  if (!assignment) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t('client.programView.assignmentNotFound')}</p>
        <Link to="/client" className="mt-4 inline-block text-teal-600 hover:underline">
          {t('common.backToDashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/client"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> {t('common.backToDashboard')}
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            {assignment.program?.name ?? t('common.program')}
          </h1>
          <StatusBadge status={assignment.status} />
        </div>

        {assignment.program?.description && (
          <p className="mt-1 text-sm text-gray-500">{assignment.program.description}</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-[#1B2A4A]">{t('client.programView.progress')}</span>
          <span className="text-gray-500">
            {t('client.programView.exercisesCompleted', { completed: completedCount, total: exercises.length })}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100">
          <div
            className="h-2.5 rounded-full bg-teal-500 transition-all"
            style={{
              width: exercises.length ? `${(completedCount / exercises.length) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {exercises.map((exercise) => {
          const logs = logsForExercise(exercise.id);
          const done = logs.length > 0;
          const expanded = expandedId === exercise.id;

          return (
            <div
              key={exercise.id}
              className={`rounded-xl border bg-white shadow-sm transition ${
                done ? 'border-teal-200' : 'border-gray-200'
              }`}
            >
              {/* Exercise header */}
              <button
                type="button"
                onClick={() => toggleExpand(exercise.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    done ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${done ? 'text-teal-700' : 'text-gray-900'}`}>
                    {exercise.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {exercise.sets != null && exercise.reps != null && (
                      <span>
                        {t('client.programView.setsReps', { sets: exercise.sets, reps: exercise.reps })}
                      </span>
                    )}
                    {exercise.durationSeconds != null && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {exercise.durationSeconds}s
                      </span>
                    )}
                    {exercise.sets == null &&
                      exercise.reps == null &&
                      exercise.durationSeconds == null && <span>{t('client.programView.noTargetSet')}</span>}
                  </p>
                </div>

                {expanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                )}
              </button>

              {/* Expanded area */}
              {expanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
                  {/* Past logs */}
                  {logs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        {t('client.programView.previousLogs')}
                      </p>
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 space-y-0.5"
                        >
                          <p className="text-xs text-gray-400">
                            {new Date(log.completedAt).toLocaleDateString(undefined, {
                              dateStyle: 'medium',
                            })}
                          </p>
                          <p>
                            {log.setsCompleted != null && `${log.setsCompleted} sets`}
                            {log.repsCompleted != null && ` × ${log.repsCompleted} reps`}
                            {log.weightUsed != null && ` @ ${log.weightUsed} kg`}
                            {log.durationSeconds != null && ` — ${log.durationSeconds}s`}
                          </p>
                          {log.notes && <p className="italic text-gray-400">{log.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Log workout form */}
                  <form onSubmit={(e) => handleSubmit(e, exercise)} className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-gray-400">{t('client.programView.logWorkout')}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('common.sets')}</label>
                        <input
                          type="number"
                          min={0}
                          value={formData.setsCompleted}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, setsCompleted: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('common.reps')}</label>
                        <input
                          type="number"
                          min={0}
                          value={formData.repsCompleted}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, repsCompleted: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('common.weightKg')}</label>
                        <input
                          type="number"
                          min={0}
                          step="0.5"
                          value={formData.weightUsed}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, weightUsed: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('common.durationS')}</label>
                        <input
                          type="number"
                          min={0}
                          value={formData.durationSeconds}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, durationSeconds: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('common.notes')}</label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600 disabled:opacity-50 transition"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {t('common.save')}
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProgramAssignment['status'] }) {
  const styles: Record<string, string> = {
    Active: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    Completed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    Paused: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status] ?? ''}`}
    >
      {status}
    </span>
  );
}
