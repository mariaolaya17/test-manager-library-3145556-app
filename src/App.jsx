import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import BooksPage from './pages/BooksPage'
import MembersPage from './pages/MembersPage'
import NewLoanPage from './pages/NewLoanPage'
import LoansPage from './pages/LoansPage'
import OverduePage from './pages/OverduePage'
import ReportPage from './pages/ReportPage'
import UsersPage from './pages/UsersPage'

function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/books" replace />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="loans/new" element={<NewLoanPage />} />
        <Route path="loans" element={<LoansPage />} />
        <Route path="loans/overdue" element={<OverduePage />} />
        <Route path="reports/most-borrowed" element={<ProtectedRoute roles={['admin']}><ReportPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
