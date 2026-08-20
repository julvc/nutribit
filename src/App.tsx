import { lazy, Suspense, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { configOk, supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import ThemeToggle from './components/ThemeToggle'
import { IconBody, IconChart, IconLogout, IconPlate, LogoMark } from './components/icons'

// recharts (~500KB min) solo se descarga al abrir estas pestañas
const History = lazy(() => import('./components/History'))
const Weight = lazy(() => import('./components/Weight'))

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
        <div className="brand">
          <LogoMark size={30} />
          <h1>NutriBit</h1>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <button className="link icon-label" onClick={() => supabase.auth.signOut()}>
            <IconLogout width={18} height={18} /> Salir
          </button>
        </div>
      </header>

      <main className="app-main">
        <Suspense fallback={<p className="muted centered-text">Cargando…</p>}>
          {tab === 'hoy' && <Dashboard userId={userId} />}
          {tab === 'historial' && <History userId={userId} />}
          {tab === 'peso' && <Weight userId={userId} />}
        </Suspense>
      </main>

      <nav className="tabs">
        <button
          className={tab === 'hoy' ? 'active' : ''}
          aria-current={tab === 'hoy' ? 'page' : undefined}
          onClick={() => setTab('hoy')}
        >
          <IconPlate /> Hoy
        </button>
        <button
          className={tab === 'historial' ? 'active' : ''}
          aria-current={tab === 'historial' ? 'page' : undefined}
          onClick={() => setTab('historial')}
        >
          <IconChart /> Historial
        </button>
        <button
          className={tab === 'peso' ? 'active' : ''}
          aria-current={tab === 'peso' ? 'page' : undefined}
          onClick={() => setTab('peso')}
        >
          <IconBody /> Peso
        </button>
      </nav>
    </div>
  )
}
