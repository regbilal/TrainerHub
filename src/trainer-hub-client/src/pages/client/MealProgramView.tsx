import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, UtensilsCrossed } from 'lucide-react';
import api from '../../lib/api';
import type { MealProgramAssignment } from '../../types';

export default function MealProgramView() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { t } = useTranslation();
  const [assignment, setAssignment] = useState<MealProgramAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<MealProgramAssignment[]>('/meal-programs/assignments');
        const match = res.data.find((a) => a.id === assignmentId);
        setAssignment(match ?? null);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    })();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!assignment?.mealProgram) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <UtensilsCrossed className="mx-auto h-10 w-10 text-gray-300 mb-3" />
        <p className="text-gray-500 mb-4">{t('client.mealView.assignmentNotFound')}</p>
        <Link
          to="/client"
          className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.backToDashboard')}
        </Link>
      </div>
    );
  }

  const program = assignment.mealProgram;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/client"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.backToDashboard')}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h1>
      {program.description && (
        <p className="text-gray-500 mb-6">{program.description}</p>
      )}

      <div className="space-y-6">
        {[...program.days]
          .sort((a, b) => a.order - b.order)
          .map((day) => (
            <div
              key={day.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="bg-teal-50 px-5 py-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-teal-700">
                  {day.title}
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {[...day.items]
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div key={item.id} className="px-5 py-4">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.calories != null && (
                          <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                            {item.calories} {t('coach.meals.calories')}
                          </span>
                        )}
                        {item.proteinGrams != null && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {item.proteinGrams}g {t('coach.meals.protein')}
                          </span>
                        )}
                        {item.carbsGrams != null && (
                          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                            {item.carbsGrams}g {t('coach.meals.carbs')}
                          </span>
                        )}
                        {item.fatGrams != null && (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            {item.fatGrams}g {t('coach.meals.fat')}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-sm italic text-gray-400 mt-2">{item.notes}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>

      {program.days.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <UtensilsCrossed className="mx-auto h-10 w-10 mb-3" />
          <p className="text-sm">{t('client.mealView.mealPlan')}</p>
        </div>
      )}
    </div>
  );
}
