export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
}

export interface Meal {
  id: string
  user_id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meal_type: MealType
  meal_date: string
  created_at: string
}

export interface MealInput {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meal_type: MealType
  meal_date: string
}

export interface WeightEntry {
  id: string
  user_id: string
  weight: number
  log_date: string
  created_at: string
}

/** Fecha local del cliente en formato YYYY-MM-DD (el locale sueco usa ISO). */
export function todayLocal(): string {
  return new Date().toLocaleDateString('sv')
}
