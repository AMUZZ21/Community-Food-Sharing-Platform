import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Browse from './pages/Browse'
import DonorDashboard from './pages/donor/DonorDashboard'
import RecipientDashboard from './pages/recipient/RecipientDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--cream)',
              border: '1px solid var(--border)',
              fontSize: 14
            },
            success: { iconTheme: { primary: 'var(--amber)', secondary: 'var(--bg)' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/donor" element={
            <ProtectedRoute role="donor">
              <DonorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/recipient" element={
            <ProtectedRoute role="recipient">
              <RecipientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--cream)', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 64 }}>🍃</div>
              <h2 style={{ fontFamily: 'var(--font-display)' }}>Page not found</h2>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}