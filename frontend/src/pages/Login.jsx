import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await API.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      navigate('/dashboard')
    } catch (err) {
      setError('Wrong email or password. Try again!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">💸</span>
          </div>
          <span className="text-white font-bold text-xl">SplitEasy</span>
        </div>

        {/* Hero Text */}
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            No more<br />
            <span style={{ color: '#bbf7d0' }}>awkward</span><br />
            money talks.
          </h1>
          <p className="text-lg" style={{ color: '#dcfce7' }}>
            Split bills, track IOUs, and settle up — without the drama. Your friends will actually thank you.
          </p>

          {/* Activity Feed */}
          <div className="space-y-3 pt-2">
            {[
              { emoji: '🍕', msg: 'Priya paid ₹840 for pizza night', sub: 'Split 4 ways · just now' },
              { emoji: '✈️', msg: 'Goa Trip settled up!', sub: '6 people · ₹12,400 total' },
              { emoji: '🎬', msg: 'Rohit owes you ₹350', sub: 'Movie night · 2 days ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl p-3"
                style={{ background: 'rgba(255,255,255,0.12)' }}>
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="text-white font-medium text-sm">{item.msg}</p>
                  <p className="text-xs" style={{ color: '#86efac' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-sm" style={{ color: '#86efac' }}>
          Trusted by friend groups who still like each other 💚
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">💸</span>
            <span className="font-bold text-xl" style={{ color: '#166534' }}>SplitEasy</span>
          </div>

          <h2 className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>Welcome back!</h2>
          <p className="mb-8" style={{ color: '#6b7280' }}>
            Let's see who owes you money today 👀
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid #d1fae5',
                  background: '#f9fafb',
                  color: '#111827',
                }}
                onFocus={e => e.target.style.borderColor = '#16a34a'}
                onBlur={e => e.target.style.borderColor = '#d1fae5'}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: '#374151' }}>Password</label>
                <a href="#" className="text-sm font-medium" style={{ color: '#16a34a' }}>
                  Forgot it?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid #d1fae5',
                  background: '#f9fafb',
                  color: '#111827',
                }}
                onFocus={e => e.target.style.borderColor = '#16a34a'}
                onBlur={e => e.target.style.borderColor = '#d1fae5'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all mt-2"
              style={{
                background: loading ? '#86efac' : 'linear-gradient(135deg, #166534, #16a34a)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Logging in...' : 'Log in →'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#6b7280' }}>
            New here?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#16a34a' }}>
              Create an account
            </Link>
          </p>

          {/* Social proof */}
          <div className="mt-8 pt-6 flex items-center gap-3"
            style={{ borderTop: '1px solid #f3f4f6' }}>
            <div className="flex -space-x-2">
              {['P', 'R', 'S', 'A'].map((l, i) => (
                <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                  style={{ background: ['#16a34a', '#15803d', '#4ade80', '#166534'][i] }}>
                  {l}
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              Join 500+ friend groups who split smarter
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}