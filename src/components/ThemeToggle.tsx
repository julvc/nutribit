import { useEffect, useState } from 'react'
import { IconMoon, IconSun } from './icons'

type Theme = 'light' | 'dark'

const THEME_COLOR: Record<Theme, string> = { light: '#2D6A4F', dark: '#151815' }

/** null si el navegador bloquea localStorage o si el usuario no ha elegido. */
function storedTheme(): Theme | null {
  try {
    return (localStorage.theme as Theme) || null
  } catch {
    return null
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  // El meta por media-query no seguiría a la elección manual, así que se actualiza aquí.
  document.head.querySelector('meta[name=theme-color]')?.setAttribute('content', THEME_COLOR[theme])
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme) || 'light'
  )

  // Sin elección guardada, seguir los cambios del sistema en vivo.
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (storedTheme()) return
      const next: Theme = mq.matches ? 'dark' : 'light'
      applyTheme(next)
      setTheme(next)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.theme = next
    } catch {
      // Sin persistencia: el cambio vale solo para esta sesión.
    }
    applyTheme(next)
    setTheme(next)
  }

  return (
    <button
      className="icon-btn"
      onClick={toggle}
      aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      {theme === 'dark' ? <IconSun width={18} height={18} /> : <IconMoon width={18} height={18} />}
    </button>
  )
}
