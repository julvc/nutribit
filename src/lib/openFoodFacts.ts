// Ejemplo/demo de búsqueda de alimentos. Pasa por la Edge Function
// supabase/functions/food-search porque search.openfoodfacts.org no tiene CORS
// abierto. Solo funciona si esa función está desplegada en el proyecto Supabase
// del usuario (ver NUTRIBIT_PLAN.md); si falla, el registro manual sigue intacto.

export interface FoodResult {
  name: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
}

export interface OffHit {
  product_name?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    proteins_100g?: number
    carbohydrates_100g?: number
    fat_100g?: number
  }
}

/** Descarta resultados sin nombre o sin energía (agua, datos incompletos). */
export function parseHits(hits: OffHit[]): FoodResult[] {
  return hits
    .filter((h) => h.product_name && h.nutriments?.['energy-kcal_100g'])
    .map((h) => ({
      name: h.product_name!,
      caloriesPer100g: h.nutriments!['energy-kcal_100g']!,
      proteinPer100g: h.nutriments!.proteins_100g ?? 0,
      carbsPer100g: h.nutriments!.carbohydrates_100g ?? 0,
      fatPer100g: h.nutriments!.fat_100g ?? 0,
    }))
}

export async function searchFoods(query: string): Promise<FoodResult[]> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/food-search?q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Búsqueda no disponible')
  const data: { hits?: OffHit[] } = await res.json()
  return parseHits(data.hits ?? [])
}
