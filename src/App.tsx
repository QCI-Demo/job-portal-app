import './App.css'
import { LoginForm } from './components/LoginForm/LoginForm'
import { useAppSelector } from './store/hooks'
import { selectAuthToken } from './features/auth/authSlice'

function App() {
  const token = useAppSelector(selectAuthToken)

  return (
    <main className="app-main">
      <h1 className="app-title">Sign in</h1>
      {token ? (
        <p className="app-status" role="status">
          You are signed in.
        </p>
      ) : null}
      <LoginForm />
    </main>
  )
}

export default App
