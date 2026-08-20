import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { configOk, supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import History from './components/History'
import Weight from './components/Weight'

type Tab = 'hoy' | 'historial' | 'peso'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('hoy')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!configOk)
    return (
      <div className="centered">
        <div className="card">
          <h2>Falta configuración</h2>
          <p>
            Copia <code>.env.example</code> a <code>.env.local</code> y completa las credenciales de
            Supabase.
          </p>
        </div>
      </div>
    )
  if (loading) return <div className="centered">Cargando…</div>
  if (!session) return <Auth />

  const userId = session.user.id

  return (
    <div className="app">
      <header className="app-header">
        <h1>🥗 NutriBit</h1>
        <button className="link" onClick={() => supabase.auth.signOut()}>
          Salir
        </button>
      </header>

      <main className="app-main">
        {tab === 'hoy' && <Dashboard userId={userId} />}
        {tab === 'historial' && <History userId={userId} />}
        {tab === 'peso' && <Weight userId={userId} />}
      </main>

      <nav className="tabs">
        <button className={tab === 'hoy' ? 'active' : ''} onClick={() => setTab('hoy')}>
          🍽️ Hoy
        </button>
        <button className={tab === 'historial' ? 'active' : ''} onClick={() => setTab('historial')}>
          📊 Historial
        </button>
        <button className={tab === 'peso' ? 'active' : ''} onClick={() => setTab('peso')}>
          ⚖️ Peso
        </button>
      </nav>
    </div>
  )
}
