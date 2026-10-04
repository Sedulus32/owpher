import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070a12] p-4 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(194,181,163,0.08), transparent 60%)' }} />
      <div className="relative w-full max-w-[420px] bg-[#0f141f]/90 backdrop-blur rounded-[20px] p-7 flex flex-col gap-4 border border-white/10">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-[11px] tracking-[0.2em] uppercase text-[#8a95a8] hover:text-[#e8e6e1]">← Home</Link>
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#c2b5a3]">Owpher</span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#e8e6e1]">{isRegister ? 'Create Account' : 'Login'}</h2>
          <p className="text-xs text-[#8a95a8]">Local device only. No email or backend auth.</p>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="bg-[#070a12] text-[#e8e6e1] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c2b5a3]/30" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="bg-[#070a12] text-[#e8e6e1] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c2b5a3]/30" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="bg-[#e8e6e1] text-[#0a0c14] rounded-xl py-3 text-sm font-semibold hover:bg-white transition-colors">{isRegister ? 'Create' : 'Enter'}</button>
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="border border-white/10 text-[#e8e6e1] rounded-xl py-2.5 text-xs font-medium hover:border-white/20 transition-colors self-start px-4">{isRegister ? 'Have an account? Login' : 'New here? Create account'}</button>
        </form>
      </div>
    </div>
  )
}
