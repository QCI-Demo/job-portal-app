import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import { api } from '../../services/api'

const TOKEN_KEY = 'auth_token'

export type LoginCredentials = {
  email: string
  password: string
}

type LoginResponseBody = {
  token?: string
  accessToken?: string
  access_token?: string
}

function extractToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const body = data as LoginResponseBody
  if (typeof body.token === 'string') return body.token
  if (typeof body.accessToken === 'string') return body.accessToken
  if (typeof body.access_token === 'string') return body.access_token
  return null
}

function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function persistToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore quota / private mode */
  }
}

function setApiAuthHeader(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

const stored = readStoredToken()
if (stored) setApiAuthHeader(stored)

export const login = createAsyncThunk<
  LoginResponseBody,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post<LoginResponseBody>('/auth/login', credentials)
    return data
  } catch (err: unknown) {
    const ax = err as {
      response?: { data?: { message?: string; error?: string } }
      message?: string
    }
    const msg =
      ax.response?.data?.message ??
      ax.response?.data?.error ??
      ax.message ??
      'Sign in failed. Please try again.'
    return rejectWithValue(typeof msg === 'string' ? msg : 'Sign in failed.')
  }
})

export type AuthState = {
  token: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

type AuthRoot = { auth: AuthState }

const initialState: AuthState = {
  token: readStoredToken(),
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.status = 'idle'
      state.error = null
      persistToken(null)
      setApiAuthHeader(null)
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const token = extractToken(action.payload)
        state.token = token
        persistToken(token)
        if (token) setApiAuthHeader(token)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Sign in failed.'
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export const authReducer = authSlice.reducer

export const selectAuthToken = (s: AuthRoot) => s.auth.token
export const selectAuthStatus = (s: AuthRoot) => s.auth.status
export const selectAuthError = (s: AuthRoot) => s.auth.error
export const selectIsAuthenticated = (s: AuthRoot) => Boolean(s.auth.token)
