import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { MEAL_TYPE_LABELS, todayLocal, type Meal } from '../types'
import MealForm from './MealForm'

export default function Dashboard({ userId }: { userId: string }) {
  const [date, setDate] = useState(todayLocal())
  const [meals, setMeals] = useState<Meal[]>([])
  const [goal, setGoal] = useState(2000)
  const [showForm, setShowForm] = useState(false)
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

  const totals = meals.reduce(
    (t, m) => ({
      calories: t.calories + Number(m.calories),
      protein: t.protein + Number(m.protein),
      carbs: t.carbs + Number(m.carbs),
      fat: t.fat + Number(m.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
  const pct = Math.min(100, Math.round((totals.calories / goal) * 100))

  return (
    <div>
      <div className="row-between">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <label className="goal-input">
          Meta:{' '}
          <input
            type="number"
            min="1"
            value={goal}
            onChange={(e) => saveGoal(Number(e.target.value) || 2000)}
          />{' '}
          kcal
        </label>
      </div>

      <div className="card summary">
        <div className="big-number">
          {Math.round(totals.calories)} <span className="muted">/ {goal} kcal</span>
        </div>
        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${pct}%`, background: totals.calories > goal ? '#e53935' : '#4CAF50' }}
          />
        </div>
        <div className="macros">
          <span>P: {Math.round(totals.protein)}g</span>
          <span>C: {Math.round(totals.carbs)}g</span>
          <span>G: {Math.round(totals.fat)}g</span>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm || editing ? (
        <MealForm
          userId={userId}
          date={date}
          meal={editing}
          onSaved={() => {
            setShowForm(false)
            setEditing(undefined)
            loadMeals()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditing(undefined)
          }}
        />
      ) : (
        <button className="full-width" onClick={() => setShowForm(true)}>
          + Agregar comida
        </button>
      )}

      <ul className="meal-list">
        {meals.map((m) => (
          <li key={m.id} className="card meal-item">
            <div>
              <strong>{m.name}</strong>
              <div className="muted small">
                {MEAL_TYPE_LABELS[m.meal_type]} · {Math.round(Number(m.calories))} kcal
              </div>
            </div>
            <div className="button-row">
              <button className="small" onClick={() => setEditing(m)}>
                ✏️
              </button>
              <button className="small" onClick={() => deleteMeal(m.id)}>
                🗑️
              </button>
            </div>
          </li>
        ))}
        {meals.length === 0 && <p className="muted centered-text">Sin comidas registradas este día.</p>}
      </ul>
    </div>
  )
}
