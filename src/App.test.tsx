import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import Auth from './components/Auth'
import ThemeToggle from './components/ThemeToggle'
import { parseHits } from './lib/openFoodFacts'
import { todayLocal } from './types'

// jsdom no implementa matchMedia; ThemeToggle lo necesita.
let systemPrefersDark = false

beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('dark') && systemPrefersDark,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList
})

// Vitest sin `globals` no registra el cleanup automático de testing-library.
afterEach(cleanup)

describe('todayLocal', () => {
  it('devuelve fecha local en formato YYYY-MM-DD', () => {
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const now = new Date()
    expect(todayLocal()).toBe(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    )
  })
})

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    systemPrefersDark = false
    document.documentElement.dataset.theme = 'light'
  })

  it('ofrece cambiar al tema contrario del que está activo', () => {
    document.documentElement.dataset.theme = 'dark'
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeDefined()
  })

  it('al pulsar cambia el tema y guarda la elección', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    render(<ThemeToggle />)

    await userEvent.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.theme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeDefined()
  })
})

describe('parseHits', () => {
  it('descarta resultados sin nombre o sin energía, y usa 0 para macros faltantes', () => {
    const result = parseHits([
      { product_name: 'Arroz', nutriments: { 'energy-kcal_100g': 350, proteins_100g: 7 } },
      { product_name: 'Agua mineral', nutriments: { 'energy-kcal_100g': 0 } },
      { nutriments: { 'energy-kcal_100g': 100 } },
      { product_name: 'Sin datos' },
    ])

    expect(result).toEqual([
      { name: 'Arroz', caloriesPer100g: 350, proteinPer100g: 7, carbsPer100g: 0, fatPer100g: 0 },
    ])
  })
})

describe('Auth', () => {
  it('renderiza login y cambia a registro', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    render(<Auth />)
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeDefined()
    await userEvent.click(screen.getByText(/Regístrate/))
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeDefined()
  })
})
