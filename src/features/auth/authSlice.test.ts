import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authReducer, login, logout } from './authSlice'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: {
    post: vi.fn(),
    defaults: { headers: { common: {} as Record<string, string> } },
  },
}))

describe('authSlice', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.mocked(api.post).mockReset()
    delete api.defaults.headers.common.Authorization
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('login.fulfilled stores token and persists to sessionStorage', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { accessToken: 'jwt-123' },
    })

    const store = configureStore({ reducer: { auth: authReducer } })
    await store.dispatch(login({ email: 'a@b.com', password: 'password1' }))

    expect(store.getState().auth.token).toBe('jwt-123')
    expect(sessionStorage.getItem('auth_token')).toBe('jwt-123')
    expect(api.defaults.headers.common.Authorization).toBe('Bearer jwt-123')
  })

  it('login.rejected sets error message', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    })

    const store = configureStore({ reducer: { auth: authReducer } })
    await store.dispatch(login({ email: 'a@b.com', password: 'password1' }))

    expect(store.getState().auth.error).toBe('Invalid credentials')
    expect(store.getState().auth.token).toBeNull()
  })

  it('logout clears token and storage', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { token: 'x' } })
    const store = configureStore({ reducer: { auth: authReducer } })
    await store.dispatch(login({ email: 'a@b.com', password: 'pw' }))
    store.dispatch(logout())
    expect(store.getState().auth.token).toBeNull()
    expect(sessionStorage.getItem('auth_token')).toBeNull()
  })
})
