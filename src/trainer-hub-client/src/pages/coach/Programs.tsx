import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Plus, Loader2, BookOpen, Users } from 'lucide-react';
import api from '../../lib/api';
import type { TrainingProgram } from '../../types';

export default function CoachPrograms() {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<TrainingProgram[]>('/programs');
        setPrograms(res.data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusColor: Record<string, string> = {
    Active: 'bg-teal-50 text-teal-600',
    Archived: 'bg-gray-100 text-gray-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('coach.programs.title')}</h1>
        <Link
          to="/coach/programs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('coach.programs.newProgram')}
        </Link>
      </div>

      {/* Program list */}
      {programs.length === 0 ? (
        <div className="text-center py-20">
          <Dumbbell className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('coach.programs.noPrograms')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('coach.programs.noProgramsDesc')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((program) => (
            <Link
              key={program.id}
              to={`/coach/programs/${program.id}/edit`}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[program.status] ?? ''}`}
                >
                  {program.status}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                {program.name}
              </h3>
              {program.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{program.description}</p>
              )}

              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {t('coach.programs.exercises', { count: program.exercises?.length ?? 0 })}
                </span>
                {program.assignmentCount != null && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {t('coach.programs.assigned', { count: program.assignmentCount })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
