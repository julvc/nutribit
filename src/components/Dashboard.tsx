import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { MEAL_TYPE_LABELS, todayLocal, type Meal, type MealType } from '../types'
import MealForm from './MealForm'
import { IconApple, IconBowl, IconCoffee, IconMoon, IconPencil, IconPlus, IconTrash } from './icons'

const MEAL_ICONS: Record<MealType, ReactNode> = {
  breakfast: <IconCoffee width={19} height={19} />,
  lunch: <IconBowl width={19} height={19} />,
  dinner: <IconMoon width={19} height={19} />,
  snack: <IconApple width={19} height={19} />,
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

function shiftDate(date: string, days: number): string {
  const d = new Date(date + 'T00:00')
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('sv')
}

function Ring({ consumed, goal }: { consumed: number; goal: number }) {
  const over = consumed > goal
  const pct = Math.min(1, consumed / goal)
  const R = 62
  const C = 2 * Math.PI * R
  const remaining = Math.round(goal - consumed)
  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 160 160" className="ring">
        <circle cx="80" cy="80" r={R} stroke="var(--ring-track)" strokeWidth="11" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={R}
          stroke={over ? 'var(--terra)' : 'var(--pine)'}
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 80 80)"
          className="ring-value"
        />
      </svg>
      <div className="ring-center">
        <strong>{Math.abs(remaining)}</strong>
        <span>{over ? 'kcal de exceso' : 'kcal restantes'}</span>
      </div>
    </div>
  )
}

export default function Dashboard({ userId }: { userId: string }) {
  const [date, setDate] = useState(todayLocal())
  const [meals, setMeals] = useState<Meal[]>([])
  const [goal, setGoal] = useState(2000)
  const [adding, setAdding] = useState<MealType | null>(null)
  const [editing, setEditing] = useState<Meal | undefined>()
  const [error, setError] = useState<string | null>(null)

  const loadMeals = useCallback(async () => {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('meal_date', date)
      .order('created_at')
    if (error) setError(error.message)
    else setMeals(data)
  }, [date])

  useEffect(() => {
    loadMeals()
  }, [loadMeals])

  useEffect(() => {
    supabase
      .from('user_profiles')
      .select('daily_calorie_goal')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setGoal(Number(data.daily_calorie_goal))
      })
  }, [userId])

  async function saveGoal(value: number) {
    setGoal(value)
    await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, daily_calorie_goal: value, updated_at: new Date().toISOString() })
  }

  async function deleteMeal(id: string) {
    if (!confirm('¿Eliminar esta comida?')) return
    const { error } = await supabase.from('meals').delete().eq('id', id)
    if (error) setError(error.message)
    else loadMeals()
  }

  function closeForm() {
    setAdding(null)
    setEditing(undefined)
  }

  const totals = meals.reduce(
    (t, m) => ({
      calories: t.calories + Number(m.calories),
      protein: t.protein + Number(m.protein),
      carbs: t.carbs + Number(m.carbs),
      fat: t.fat + Number(m.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  // Distribución calórica por macro (4/4/9 kcal por gramo)
  const macroKcal = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9
  const share = (kcal: number) => (macroKcal > 0 ? Math.round((kcal / macroKcal) * 100) : 0)
  const macros = [
    { label: 'Proteína', grams: totals.protein, pct: share(totals.protein * 4), cls: 'protein' },
    { label: 'Carbos', grams: totals.carbs, pct: share(totals.carbs * 4), cls: 'carbs' },
    { label: 'Grasa', grams: totals.fat, pct: share(totals.fat * 9), cls: 'fat' },
  ]

  const isToday = date === todayLocal()
  const dateLabel = isToday
    ? 'Hoy'
    : new Date(date + 'T00:00').toLocaleDateString('es', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })

  const formOpen = adding !== null || editing !== undefined

  return (
    <div>
      <div className="date-nav">
        <button aria-label="Día anterior" onClick={() => setDate(shiftDate(date, -1))}>
          ‹
        </button>
        <label className="date-label">
          {dateLabel}
          <input
            type="date"
            aria-label="Elegir fecha"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button aria-label="Día siguiente" onClick={() => setDate(shiftDate(date, 1))}>
          ›
        </button>
      </div>

      <section className="card hero">
        <Ring consumed={totals.calories} goal={goal} />
        <div className="hero-side">
          <div className="hero-goal">
            <span className="muted small">Consumido</span>
            <strong>{Math.round(totals.calories)} kcal</strong>
            <label className="goal-input">
              Meta
              <input
                type="number"
                min="1"
                value={goal}
                onChange={(e) => saveGoal(Number(e.target.value) || 2000)}
              />
            </label>
          </div>
          <div className="macro-bars">
            {macros.map((m) => (
              <div key={m.cls} className="macro">
                <div className="macro-head">
                  <span>{m.label}</span>
                  <span className="muted">{Math.round(m.grams)} g</span>
                </div>
                <div className="macro-track">
                  <div className={`macro-fill ${m.cls}`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      {formOpen && (
        <MealForm
          userId={userId}
          date={date}
          meal={editing}
          defaultType={adding ?? undefined}
          onSaved={() => {
            closeForm()
            loadMeals()
          }}
          onCancel={closeForm}
        />
      )}

      {MEAL_ORDER.map((type) => {
        const items = meals.filter((m) => m.meal_type === type)
        const kcal = items.reduce((s, m) => s + Number(m.calories), 0)
        return (
          <section key={type} className="card meal-section">
            <header className="meal-section-head">
              <span className="meal-section-icon">{MEAL_ICONS[type]}</span>
              <h3>{MEAL_TYPE_LABELS[type]}</h3>
              <span className="muted small">{kcal > 0 ? `${Math.round(kcal)} kcal` : ''}</span>
              <button
                className="icon-btn add"
                aria-label={`Agregar a ${MEAL_TYPE_LABELS[type]}`}
                onClick={() => setAdding(type)}
              >
                <IconPlus width={16} height={16} />
              </button>
            </header>
            {items.length > 0 && (
              <ul className="meal-list">
                {items.map((m) => (
                  <li key={m.id} className="meal-item">
                    <div>
                      <strong>{m.name}</strong>
                      <div className="muted small">{Math.round(Number(m.calories))} kcal</div>
                    </div>
                    <div className="button-row">
                      <button
                        className="icon-btn"
                        aria-label="Editar comida"
                        onClick={() => setEditing(m)}
                      >
                        <IconPencil width={16} height={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        aria-label="Eliminar comida"
                        onClick={() => deleteMeal(m.id)}
                      >
                        <IconTrash width={16} height={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
