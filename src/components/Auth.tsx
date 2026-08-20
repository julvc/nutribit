import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { LogoMark } from './icons'

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else if (!data.session) setInfo('Revisa tu correo para confirmar la cuenta.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="centered">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <LogoMark size={52} />
        </div>
        <h1>NutriBit</h1>
        <p className="muted">Tu registro de calorías y peso</p>

        <label>
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {error && <p className="error">{error}</p>}
        {info && <p className="info">{info}</p>}

        <button type="submit" disabled={busy}>
          {busy ? '…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>
        <button
          type="button"
          className="link"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
        </button>
      </form>
    </div>
  )
}
