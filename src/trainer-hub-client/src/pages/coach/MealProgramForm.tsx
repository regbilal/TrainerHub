import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2, Loader2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../lib/api';
import type { MealProgram } from '../../types';

interface ItemInput {
  key: string;
  name: string;
  description: string;
  calories: string;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
  notes: string;
}

interface DayInput {
  key: string;
  title: string;
  items: ItemInput[];
}

function blankItem(): ItemInput {
  return {
    key: crypto.randomUUID(),
    name: '',
    description: '',
    calories: '',
    proteinGrams: '',
    carbsGrams: '',
    fatGrams: '',
    notes: '',
  };
}

function blankDay(): DayInput {
  return {
    key: crypto.randomUUID(),
    title: '',
    items: [blankItem()],
  };
}

export default function CoachMealProgramForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<DayInput[]>([blankDay()]);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get<MealProgram>(`/meal-programs/${id}`);
        const p = res.data;
        setName(p.name);
        setDescription(p.description ?? '');
        if (p.days.length > 0) {
          const mapped = p.days
            .sort((a, b) => a.order - b.order)
            .map((day) => ({
              key: day.id,
              title: day.title,
              items:
                day.items.length > 0
                  ? day.items
                      .sort((a, b) => a.order - b.order)
                      .map((item) => ({
                        key: item.id,
                        name: item.name,
                        description: item.description ?? '',
                        calories: item.calories?.toString() ?? '',
                        proteinGrams: item.proteinGrams?.toString() ?? '',
                        carbsGrams: item.carbsGrams?.toString() ?? '',
                        fatGrams: item.fatGrams?.toString() ?? '',
                        notes: item.notes ?? '',
                      }))
                  : [blankItem()],
            }));
          setDays(mapped);
          const expanded: Record<string, boolean> = {};
          mapped.forEach((d) => { expanded[d.key] = true; });
          setExpandedDays(expanded);
        }
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function toggleDay(key: string) {
    setExpandedDays((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateDay(key: string, field: 'title', value: string) {
    setDays((prev) => prev.map((d) => (d.key === key ? { ...d, [field]: value } : d)));
  }

  function removeDay(key: string) {
    setDays((prev) => prev.filter((d) => d.key !== key));
  }

  function addDay() {
    const nd = blankDay();
    setDays((prev) => [...prev, nd]);
    setExpandedDays((prev) => ({ ...prev, [nd.key]: true }));
  }

  function updateItem(dayKey: string, itemKey: string, field: keyof ItemInput, value: string) {
    setDays((prev) =>
      prev.map((d) =>
        d.key === dayKey
          ? { ...d, items: d.items.map((it) => (it.key === itemKey ? { ...it, [field]: value } : it)) }
          : d,
      ),
    );
  }

  function removeItem(dayKey: string, itemKey: string) {
    setDays((prev) =>
      prev.map((d) =>
        d.key === dayKey ? { ...d, items: d.items.filter((it) => it.key !== itemKey) } : d,
      ),
    );
  }

  function addItem(dayKey: string) {
    setDays((prev) =>
      prev.map((d) =>
        d.key === dayKey ? { ...d, items: [...d.items, blankItem()] } : d,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name,
      description: description || undefined,
      days: days.map((day, dIdx) => ({
        title: day.title,
        order: dIdx + 1,
        items: day.items.map((item, iIdx) => ({
          name: item.name,
          description: item.description || undefined,
          calories: item.calories ? Number(item.calories) : undefined,
          proteinGrams: item.proteinGrams ? Number(item.proteinGrams) : undefined,
          carbsGrams: item.carbsGrams ? Number(item.carbsGrams) : undefined,
          fatGrams: item.fatGrams ? Number(item.fatGrams) : undefined,
          notes: item.notes || undefined,
          order: iIdx + 1,
        })),
      })),
    };

    try {
      if (isEdit) {
        await api.put(`/meal-programs/${id}`, payload);
      } else {
        await api.post('/meal-programs', payload);
      }
      navigate('/coach/meals');
    } catch (err: any) {
      setError(err.response?.data?.message ?? t('coach.meals.failedSave'));
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
        onClick={() => navigate('/coach/meals')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('coach.meals.backToMeals')}
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? t('coach.meals.editMealProgram') : t('coach.meals.newProgram')}
      </h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Program details */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('coach.meals.programDetails')}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('coach.meals.programName')} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              placeholder={t('coach.meals.namePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
              placeholder={t('coach.meals.descPlaceholder')}
            />
          </div>
        </div>

        {/* Days */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('coach.meals.daysSection')}
              <span className="ml-2 text-sm font-normal text-gray-400">({days.length})</span>
            </h2>
          </div>

          <div className="space-y-4">
            {days.map((day, idx) => (
              <div
                key={day.key}
                className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden"
              >
                {/* Day header */}
                <div className="flex items-center justify-between p-4">
                  <button
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    {expandedDays[day.key] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {t('coach.meals.dayNum', { num: idx + 1 })}
                  </button>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateDay(day.key, 'title', e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white w-48"
                      placeholder={t('coach.meals.dayTitlePlaceholder')}
                    />
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(day.key)}
                        className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('common.remove')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible items section */}
                {expandedDays[day.key] && (
                  <div className="border-t border-gray-200 p-4 space-y-4">
                    <h4 className="text-sm font-medium text-gray-600">{t('coach.meals.mealItems')}</h4>

                    {day.items.map((item, iIdx) => (
                      <div
                        key={item.key}
                        className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500">
                            <GripVertical className="h-4 w-4" />
                            {t('coach.meals.itemNum', { num: iIdx + 1 })}
                          </span>
                          {day.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(day.key, item.key)}
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
                              {t('coach.meals.itemName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              required
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(day.key, item.key, 'name', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                              placeholder={t('coach.meals.itemNamePlaceholder')}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {t('common.description')}
                            </label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(day.key, item.key, 'description', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                              placeholder={t('coach.meals.itemDescPlaceholder')}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {t('coach.meals.calories')}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.calories}
                              onChange={(e) => updateItem(day.key, item.key, 'calories', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {t('coach.meals.protein')}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.proteinGrams}
                              onChange={(e) => updateItem(day.key, item.key, 'proteinGrams', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {t('coach.meals.carbs')}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.carbsGrams}
                              onChange={(e) => updateItem(day.key, item.key, 'carbsGrams', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {t('coach.meals.fat')}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.fatGrams}
                              onChange={(e) => updateItem(day.key, item.key, 'fatGrams', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                              placeholder="0"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {t('common.notes')}
                            </label>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => updateItem(day.key, item.key, 'notes', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                              placeholder={t('coach.meals.itemDescPlaceholder')}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addItem(day.key)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors w-full justify-center"
                    >
                      <Plus className="h-4 w-4" />
                      {t('coach.meals.addItem')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addDay}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors w-full justify-center"
          >
            <Plus className="h-4 w-4" />
            {t('coach.meals.addDay')}
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/coach/meals')}
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
            {isEdit ? t('coach.meals.updateProgram') : t('coach.meals.createProgram')}
          </button>
        </div>
      </form>
    </div>
  );
}
