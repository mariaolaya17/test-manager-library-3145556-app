import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Layout() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <nav className="nav">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link to="/books"><strong>Manager Library</strong></Link>
            <Link to="/books">Books</Link>
            <Link to="/members">Members</Link>
            <Link to="/loans">Loans</Link>
            <Link to="/loans/new">New Loan</Link>
            <Link to="/loans/overdue">Overdue</Link>
            {role === 'admin' && <Link to="/reports/most-borrowed">Report</Link>}
            {role === 'admin' && <Link to="/users">Users</Link>}
          </div>
          <div>
            <span style={{ marginRight: '1rem' }}>{user?.username} ({role})</span>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>
      <div className="container" style={{ paddingTop: '1rem' }}>
        <Outlet />
      </div>
    </div>
  )
}
