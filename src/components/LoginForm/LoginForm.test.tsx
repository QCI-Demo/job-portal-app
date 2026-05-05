import type { ReactElement } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LoginForm } from './LoginForm'
import { authReducer } from '../../features/auth/authSlice'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: {
    post: vi.fn(),
    defaults: { headers: { common: {} as Record<string, string> } },
  },
}))

function renderWithStore(ui: ReactElement) {
  const store = configureStore({ reducer: { auth: authReducer } })
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  }
}

describe('LoginForm', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.mocked(api.post).mockReset()
    sessionStorage.clear()
  })

  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup()
    renderWithStore(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('submits credentials to login endpoint on valid input', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { token: 't1' } })
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderWithStore(<LoginForm onLoginSuccess={onSuccess} />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password1')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'password1',
      })
    })
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('announces server error in an alert region', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { message: 'Bad login' } },
    })
    const user = userEvent.setup()
    renderWithStore(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'u@e.com')
    await user.type(screen.getByLabelText(/^password/i), 'password1')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Bad login')
  })
})
