import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState(null)
  const [activeTab, setActiveTab] = useState('expenses')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: '', date: '' })
  const [loading, setLoading] = useState(true)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchAll = async () => {
    try {
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        API.get(`/api/groups/${id}`),
        API.get(`/api/expenses/group/${id}`),
        API.get(`/api/groups/${id}/balances`)
      ])
      setGroup(groupRes.data)
      setExpenses(expenseRes.data)
      setBalances(balanceRes.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear()
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [id])

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await API.post(`/api/groups/${id}/members?email=${memberEmail}`)
      setMemberEmail('')
      setShowMemberModal(false)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add member!')
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    try {
      await API.post('/api/expenses', {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        groupId: parseInt(id),
        date: newExpense.date || new Date().toISOString().split('T')[0]
      })
      setNewExpense({ title: '', amount: '', category: '', date: '' })
      setShowExpenseModal(false)
      fetchAll()
    } catch {
      alert('Could not add expense. Try again!')
    }
  }

  const handleSettle = async (payerId, receiverId, amount) => {
    try {
      await API.post('/api/settlements', {
        payerId, receiverId,
        groupId: parseInt(id),
        amount
      })
      fetchAll()
    } catch {
      alert('Settlement failed. Try again!')
    }
  }

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const categoryEmoji = {
    Food: '🍕', Travel: '✈️', Entertainment: '🎬',
    Shopping: '🛍️', Utilities: '💡', Other: '📦'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9fafb' }}>
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: '#16a34a', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f9fafb', fontFamily: "'Inter', sans-serif" }}>

      {/* NAVBAR */}
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-4"
        style={{ borderColor: '#e5e7eb' }}>
        <Link to="/dashboard" className="text-sm font-medium flex items-center gap-1"
          style={{ color: '#16a34a' }}>
          ← Back
        </Link>
        <span style={{ color: '#e5e7eb' }}>|</span>
        <span className="text-sm font-medium" style={{ color: '#111827' }}>
          {group?.name}
        </span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* GROUP HEADER */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>{group?.name}</h1>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                {group?.description || 'No description'}
              </p>
            </div>
            <button onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #166534, #16a34a)', flexShrink: 0 }}>
              + Add Expense
            </button>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-5" style={{ borderTop: '1px solid #f3f4f6' }}>
            <div className="flex" style={{ marginRight: '4px' }}>
              {group?.members?.slice(0, 5).map((m, i) => (
                <div key={m.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: ['#16a34a', '#15803d', '#166534', '#4ade80', '#22c55e'][i % 5],
                    border: '2px solid white',
                    marginLeft: i > 0 ? '-8px' : '0'
                  }}>
                  {getInitials(m.userName || m.userEmail)}
                </div>
              ))}
            </div>
            <span className="text-sm" style={{ color: '#6b7280' }}>
              {group?.members?.length} member{group?.members?.length !== 1 ? 's' : ''}
            </span>
            <button onClick={() => setShowMemberModal(true)}
              className="ml-auto text-sm font-medium px-3 py-1.5 rounded-lg"
              style={{ border: '1px solid #d1fae5', color: '#16a34a', background: '#f0fdf4' }}>
              + Add Member
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#e5e7eb' }}>
          {['expenses', 'balances'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={{
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#166534' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid #e5e7eb' }}>
                <div className="text-5xl mb-3">🧾</div>
                <p className="font-semibold" style={{ color: '#111827' }}>No expenses yet</p>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Add the first expense!</p>
              </div>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="bg-white rounded-2xl p-4 flex items-center gap-4"
                  style={{ border: '1px solid #e5e7eb' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: '#f0fdf4', flexShrink: 0 }}>
                    {categoryEmoji[exp.category] || '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-semibold text-sm" style={{ color: '#111827' }}>{exp.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                      Paid by {exp.paidByName} · {exp.date}
                    </p>
                  </div>
                  <div className="text-right" style={{ flexShrink: 0 }}>
                    <p className="font-bold" style={{ color: '#166534' }}>₹{exp.amount}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                      ₹{exp.splits?.[0]?.shareAmount?.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BALANCES TAB */}
        {activeTab === 'balances' && balances && (
          <div className="space-y-4">
            {balances.userBalances?.length > 0 && (
              <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
                <h3 className="font-semibold text-sm mb-4" style={{ color: '#374151' }}>
                  Individual Balances
                </h3>
                <div className="space-y-3">
                  {balances.userBalances.map((ub, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: '#16a34a' }}>
                          {getInitials(ub.userName)}
                        </div>
                        <span className="text-sm font-medium" style={{ color: '#111827' }}>
                          {ub.userName}
                        </span>
                      </div>
                      <span className="text-sm font-bold"
                        style={{ color: ub.netBalance >= 0 ? '#16a34a' : '#dc2626' }}>
                        {ub.netBalance >= 0 ? '+' : ''}₹{Math.abs(ub.netBalance).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <h3 className="font-semibold text-sm mb-4" style={{ color: '#374151' }}>
                Suggested Settlements
              </h3>
              {balances.transactions?.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-semibold text-sm" style={{ color: '#16a34a' }}>All settled up!</p>
                  <p className="text-xs mt-1" style={{ color: '#6b7280' }}>No pending payments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {balances.transactions?.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                      <div className="text-sm" style={{ color: '#374151' }}>
                        <span className="font-semibold">{t.fromName}</span>
                        <span style={{ color: '#9ca3af' }}> owes </span>
                        <span className="font-semibold">{t.toName}</span>
                        <span className="font-bold ml-2" style={{ color: '#dc2626' }}>
                          ₹{t.amount.toFixed(2)}
                        </span>
                      </div>
                      {t.fromName === user.name && (
                        <button
                          onClick={() => handleSettle(t.fromId, t.toId, t.amount)}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white ml-3"
                          style={{ background: '#16a34a', flexShrink: 0 }}>
                          Settle
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => e.target === e.currentTarget && setShowExpenseModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-1" style={{ color: '#111827' }}>Add Expense</h2>
            <p className="text-sm mb-5" style={{ color: '#6b7280' }}>Split equally among all members</p>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  What was it for?
                </label>
                <input type="text"
                  placeholder="e.g. Dinner at Barbeque Nation"
                  value={newExpense.title}
                  onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#d1fae5'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Amount (₹)
                </label>
                <input type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#d1fae5'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Category
                </label>
                <select
                  value={newExpense.category}
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#d1fae5'}>
                  <option value="">Select category</option>
                  {Object.keys(categoryEmoji).map(c => (
                    <option key={c} value={c}>{categoryEmoji[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Date <span style={{ color: '#9ca3af' }}>(optional)</span>
                </label>
                <input type="date"
                  value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#d1fae5'}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ border: '1.5px solid #e5e7eb', color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl font-semibold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #166534, #16a34a)' }}>
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {showMemberModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => e.target === e.currentTarget && setShowMemberModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-1" style={{ color: '#111827' }}>Add Member</h2>
            <p className="text-sm mb-5" style={{ color: '#6b7280' }}>
              They need a SplitEasy account already
            </p>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Email address
                </label>
                <input type="email"
                  placeholder="friend@example.com"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #d1fae5', background: '#f9fafb', color: '#111827' }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#d1fae5'}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowMemberModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ border: '1.5px solid #e5e7eb', color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl font-semibold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #166534, #16a34a)' }}>
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}