import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] p-4">
      <div className="w-full max-w-[420px] bg-[#1e293b] rounded-[16px] p-7 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <Link to="/" className="text-xs text-[#94a3b8] underline">Back</Link>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#94a3b8]">Logged in as <span className="font-mono font-medium text-white">{user}</span></p>
          {installPrompt && (
            <button onClick={handleInstall} className="parchi-btn-primary">
              Install App
            </button>
          )}
          <button onClick={handleLogout} className="parchi-btn-secondary">
            Switch Account / Logout
          </button>
        </div>
        <p className="text-[10px] text-[#94a3b8] mt-4">
          One slip only. Next message replaces this.
        </p>
      </div>
    </div>
  )
}