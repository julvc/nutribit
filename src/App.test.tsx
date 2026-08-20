import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Auth from './components/Auth'
import { todayLocal } from './types'

describe('todayLocal', () => {
  it('devuelve fecha local en formato YYYY-MM-DD', () => {
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const now = new Date()
    expect(todayLocal()).toBe(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    )
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
