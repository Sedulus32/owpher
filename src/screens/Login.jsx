import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username || !password) return setError('Both fields required')
    try {
      if (isRegister) {
        await register(username, password)
      } else {
        await login(username, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] p-4">
      <div className="w-full max-w-[420px] bg-[#1e293b] rounded-[16px] p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white">{isRegister ? 'Create Account' : 'Login'}</h2>
          <p className="text-xs text-[#94a3b8]">Local device only. No email or backend auth.</p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#94a3b8]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#94a3b8]"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" className="parchi-btn-primary">
            {isRegister ? 'Create' : 'Enter'}
          </button>

          <button type="button" onClick={() => setIsRegister(!isRegister)} className="parchi-btn-secondary self-start">
            {isRegister ? 'Have an account? Login' : 'New here? Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}