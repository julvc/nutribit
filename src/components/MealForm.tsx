import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { MEAL_TYPE_LABELS, type Meal, type MealInput, type MealType } from '../types'

interface Props {
  userId: string
  date: string
  meal?: Meal
  defaultType?: MealType
  onSaved: () => void
  onCancel: () => void
}

export default function MealForm({ userId, date, meal, defaultType, onSaved, onCancel }: Props) {
  const [name, setName] = useState(meal?.name ?? '')
  const [calories, setCalories] = useState(meal ? String(meal.calories) : '')
  const [protein, setProtein] = useState(meal ? String(meal.protein) : '')
  const [carbs, setCarbs] = useState(meal ? String(meal.carbs) : '')
  const [fat, setFat] = useState(meal ? String(meal.fat) : '')
  const [mealType, setMealType] = useState<MealType>(meal?.meal_type ?? defaultType ?? 'breakfast')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const input: MealInput = {
      name: name.trim(),
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      meal_type: mealType,
      meal_date: meal?.meal_date ?? date,
    }
    const query = meal
      ? supabase.from('meals').update(input).eq('id', meal.id)
      : supabase.from('meals').insert({ ...input, user_id: userId })
    const { error } = await query
    setBusy(false)
    if (error) setError(error.message)
    else onSaved()
  }

  return (
    <form className="card meal-form" onSubmit={handleSubmit}>
      <h3>{meal ? 'Editar comida' : 'Agregar comida'}</h3>
      <label>
        Nombre
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={255} />
      </label>
      <label>
        Tipo
        <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
          {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Calorías (kcal)
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          required
        />
      </label>
      <div className="macro-row">
        <label>
          Proteína (g)
          <input type="number" inputMode="decimal" min="0" step="any" value={protein} onChange={(e) => setProtein(e.target.value)} />
        </label>
        <label>
          Carbos (g)
          <input type="number" inputMode="decimal" min="0" step="any" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
        </label>
        <label>
          Grasa (g)
          <input type="number" inputMode="decimal" min="0" step="any" value={fat} onChange={(e) => setFat(e.target.value)} />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="button-row">
        <button type="submit" disabled={busy}>
          {busy ? '…' : 'Guardar'}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
