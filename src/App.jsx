import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import PublicSend from './screens/PublicSend'
import Settings from './screens/Settings'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/k/:key" element={<PublicSend />} />
      <Route path="/settings" element={
        <ProtectedRoute><Settings /></ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="w-full min-h-screen bg-[#0b1220] text-white flex flex-col">
        <div className="flex-1 flex flex-col w-full">
          <AppRoutes />
        </div>
      </div>
    </AuthProvider>
  )
}
