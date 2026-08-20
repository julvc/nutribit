import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { todayLocal } from '../types'

const DAYS = 14

interface DayTotal {
  date: string
  label: string
  calories: number
}

export default function History({ userId }: { userId: string }) {
  const [days, setDays] = useState<DayTotal[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const end = todayLocal()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (DAYS - 1))
    const start = startDate.toLocaleDateString('sv')

    supabase
      .from('meals')
      .select('meal_date, calories')
      .gte('meal_date', start)
      .lte('meal_date', end)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
          return
        }
        const byDate = new Map<string, number>()
        for (const row of data) {
          byDate.set(row.meal_date, (byDate.get(row.meal_date) ?? 0) + Number(row.calories))
        }
        const result: DayTotal[] = []
        for (let i = 0; i < DAYS; i++) {
          const d = new Date(startDate)
          d.setDate(startDate.getDate() + i)
          const iso = d.toLocaleDateString('sv')
          result.push({
            date: iso,
            label: d.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
            calories: Math.round(byDate.get(iso) ?? 0),
          })
        }
        setDays(result)
      })
  }, [userId])

  const withData = days.filter((d) => d.calories > 0)
  const avg = withData.length
    ? Math.round(withData.reduce((s, d) => s + d.calories, 0) / withData.length)
    : 0

  return (
    <div>
      <h2>Últimos {DAYS} días</h2>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <p className="muted">
          Promedio (días con registro): <strong>{avg} kcal</strong>
        </p>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={days} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="calories" name="kcal" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
