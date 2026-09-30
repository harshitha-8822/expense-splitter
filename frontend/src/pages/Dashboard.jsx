import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

export default function Dashboard() {
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    let ignore = false
    API.get('/api/groups')
      .then(res => {
        if (!ignore) setGroups(res.data)
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/login')
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => { ignore = true }
  }, [navigate])

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    try {
      await API.post('/api/groups', newGroup)
      setNewGroup({ name: '', description: '' })
      setShowModal(false)
      const res = await API.get('/api/groups')
      setGroups(res.data)
    } catch {
      alert('Could not create group. Try again!')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const groupColors = ['#16a34a', '#15803d', '#166534', '#4ade80', '#22c55e']

  return (
    <div className="min-h-screen" style={{ background: '#f9fafb', fontFamily: "'Inter', sans-serif" }}>

      {/* NAVBAR */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">💸</span>
          <span className="font-bold text-lg" style={{ color: '#166534' }}>SplitEasy</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: '#16a34a' }}>
            {getInitials(user.name || user.email)}
          </div>
          <span className="text-sm font-medium" style={{ color: '#374151' }}>
            {user.name || user.email}
          </span>
          <button onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg font-medium"
            style={{ color: '#6b7280', border: '1px solid #e5e7eb' }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
              Hey {user.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
              Here are all your groups
            </p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #166534, #16a34a)' }}>
            + New Group
          </button>
        </div>

        {/* GROUPS */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 animate-spin"
              style={{ borderColor: '#16a34a', borderTopColor: 'transparent' }} />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>No groups yet</h3>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
              Create your first group and add your friends!
            </p>
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #166534, #16a34a)' }}>
              Create a group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group, i) => (
              <Link to={`/groups/${group.id}`} key={group.id}
                className="bg-white rounded-2xl p-5 block hover:shadow-md transition-all"
                style={{ border: '1px solid #e5e7eb' }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: groupColors[i % groupColors.length], flexShrink: 0 }}>
                    {getInitials(group.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="font-semibold text-base truncate" style={{ color: '#111827' }}>
                      {group.name}
                    </h3>
                    <p className="text-sm mt-0.5 truncate" style={{ color: '#6b7280' }}>
                      {group.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <span style={{ color: '#9ca3af' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-1" style={{ color: '#111827' }}>New Group</h2>
            <p className="text-sm mb-5" style={{ color: '#6b7280' }}>
              Give your group a name your friends will recognize
            </p>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Group name
                </label>
                <input type="text"
                  placeholder="e.g. Goa Trip, Flat 4B, Pizza Gang"
                  value={newGroup.name}
                  onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#d1fae5'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Description <span style={{ color: '#9ca3af' }}>(optional)</span>
                </label>
                <input type="text"
                  placeholder="What's this group for?"
                  value={newGroup.description}
                  onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#d1fae5'}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ border: '1.5px solid #e5e7eb', color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl font-semibold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #166534, #16a34a)' }}>
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}