import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/users'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [error, setError] = useState('')

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(API_URL)
      const data = await res.json()
      setUsers(data)
      setError('')
    } catch (err) {
      setError('Failed to fetch users. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingUser ? `${API_URL}/${editingUser.id}` : API_URL
      const method = editingUser ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save user')
      }

      setFormData({ name: '', email: '', phone: '' })
      setShowForm(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle edit
  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: user.email, phone: user.phone || '' })
    setShowForm(true)
  }

  // Cancel form
  const handleCancel = () => {
    setShowForm(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', phone: '' })
    setError('')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📋 User Management</h1>
        <p>Simple CRUD Application</p>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <main className="main">
        {!showForm ? (
          <>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                + Add New User
              </button>
              <button className="btn btn-secondary" onClick={fetchUsers}>
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="empty">No users found. Add one to get started!</div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || '-'}</td>
                        <td className="actions-cell">
                          <button className="btn btn-edit" onClick={() => handleEdit(user)}>
                            ✏️ Edit
                          </button>
                          <button className="btn btn-delete" onClick={() => handleDelete(user.id)}>
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="form-container">
            <h2>{editingUser ? '✏️ Edit User' : '➕ Add New User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with React + Express + MySQL</p>
      </footer>
    </div>
  )
}

export default App
