import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await API.post('/api/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again!')
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
            Your friends<br />
            <span style={{ color: '#bbf7d0' }}>are waiting</span><br />
            for this.
          </h1>
          <p className="text-lg" style={{ color: '#dcfce7' }}>
            Stop chasing people for money. Add your group, split expenses, and let SplitEasy handle the math.
          </p>

          {/* Steps */}
          <div className="space-y-4 pt-2">
            {[
              { step: '1', title: 'Create your account', desc: 'Takes less than a minute' },
              { step: '2', title: 'Add your group', desc: 'Friends, roommates, trip crew' },
              { step: '3', title: 'Split & settle', desc: 'Zero awkward conversations' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4 rounded-2xl p-3"
                style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: '#bbf7d0', color: '#166534' }}>
                  {item.step}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-xs" style={{ color: '#86efac' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm" style={{ color: '#86efac' }}>
          Free forever. No credit card. No drama. 💚
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

          <h2 className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>Create account</h2>
          <p className="mb-8" style={{ color: '#6b7280' }}>
            Join the group. Stop being the one who forgets to pay back. 😄
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Your name
              </label>
              <input
                type="text"
                name="name"
                placeholder="What do your friends call you?"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
                onFocus={e => e.target.style.borderColor = '#16a34a'}
                onBlur={e => e.target.style.borderColor = '#d1fae5'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
                onFocus={e => e.target.style.borderColor = '#16a34a'}
                onBlur={e => e.target.style.borderColor = '#d1fae5'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Make it a good one"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
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
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#16a34a' }}>
              Log in
            </Link>
          </p>

          {/* Trust badges */}
          <div className="mt-8 pt-6 grid grid-cols-3 gap-3"
            style={{ borderTop: '1px solid #f3f4f6' }}>
            {[
              { icon: '🔒', label: 'Secure' },
              { icon: '⚡', label: 'Instant setup' },
              { icon: '🆓', label: 'Always free' },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-1 py-2 rounded-xl"
                style={{ background: '#f0fdf4' }}>
                <span className="text-lg">{badge.icon}</span>
                <span className="text-xs font-medium" style={{ color: '#166534' }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}