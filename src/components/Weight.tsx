import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { todayLocal, type WeightEntry } from '../types'
import { IconTrash } from './icons'

export default function Weight({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(todayLocal())
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('weight_log').select('*').order('log_date')
    if (error) setError(error.message)
    else setEntries(data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addEntry(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await supabase
      .from('weight_log')
      .insert({ user_id: userId, weight: Number(weight), log_date: date })
    setBusy(false)
    if (error) setError(error.message)
    else {
      setWeight('')
      load()
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm('¿Eliminar este registro?')) return
    const { error } = await supabase.from('weight_log').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  const chartData = entries.map((e) => ({
    label: new Date(e.log_date + 'T00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' }),
    weight: Number(e.weight),
  }))

  return (
    <div>
      <h2>Peso</h2>

      <form className="card weight-form" onSubmit={addEntry}>
        <label>
          Peso (kg)
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="any"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </label>
        <label>
          Fecha
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? '…' : 'Registrar'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {chartData.length > 1 && (
        <div className="card">
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" name="kg" stroke="#2D6A4F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <ul className="meal-list">
        {[...entries].reverse().map((e) => (
          <li key={e.id} className="card meal-item">
            <div>
              <strong>{Number(e.weight)} kg</strong>
              <div className="muted small">{e.log_date}</div>
            </div>
            <button
              className="icon-btn danger"
              aria-label="Eliminar registro"
              onClick={() => deleteEntry(e.id)}
            >
              <IconTrash width={17} height={17} />
            </button>
          </li>
        ))}
        {entries.length === 0 && <p className="muted centered-text">Sin registros de peso.</p>}
      </ul>
    </div>
  )
}
