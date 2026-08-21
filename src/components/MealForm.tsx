import { useEffect, useRef, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { searchFoods, type FoodResult } from '../lib/openFoodFacts'
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
  const [suggestions, setSuggestions] = useState<FoodResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchId = useRef(0)

  // Búsqueda de alimentos (ejemplo con Open Food Facts, ver openFoodFacts.ts).
  // Solo al agregar: editar una comida ya guardada no necesita sugerencias.
  useEffect(() => {
    if (meal || name.trim().length < 2) {
      setSuggestions([])
      return
    }
    const id = ++searchId.current
    const timer = setTimeout(() => {
      searchFoods(name.trim())
        .then((results) => {
          if (id === searchId.current) setSuggestions(results)
        })
        .catch(() => {
          if (id === searchId.current) setSuggestions([])
        })
    }, 350)
    return () => clearTimeout(timer)
  }, [name, meal])

  function pickSuggestion(food: FoodResult) {
    setName(food.name)
    setCalories(String(Math.round(food.caloriesPer100g)))
    setProtein(String(Math.round(food.proteinPer100g)))
    setCarbs(String(Math.round(food.carbsPer100g)))
    setFat(String(Math.round(food.fatPer100g)))
    setSuggestions([])
    setShowSuggestions(false)
  }

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
      <label className="food-search">
        Nombre
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          required
          maxLength={255}
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="food-suggestions">
            {suggestions.map((food, i) => (
              <li key={i}>
                <button type="button" onMouseDown={() => pickSuggestion(food)}>
                  <span>{food.name}</span>
                  <span className="muted small">{Math.round(food.caloriesPer100g)} kcal/100g</span>
                </button>
              </li>
            ))}
            <li className="food-suggestions-credit muted small">Datos: Open Food Facts</li>
          </ul>
        )}
        {!meal && <span className="muted small">Escribe 2+ letras para buscar (valores por 100 g)</span>}
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
