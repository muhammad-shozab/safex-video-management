import { useState } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Search from './pages/Search'
import Library from './pages/Library'
import Review from './pages/Review'
import Publish from './pages/Publish'
import Edit from './pages/Edit'
import Trash from './pages/Trash'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Recommendations from './pages/Recommendations'
import Users from './pages/Users'
import Kids from './pages/Kids'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { useAuth } from './context/AuthContext'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-wrap">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <div className="content">
          <Routes>
            <Route path="/" element={user.role === 'Kids' ? <Navigate to="/kids" replace /> : <Search />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/review/:id" element={<Review />} />
            <Route path="/publish/:id" element={<Publish />} />
            <Route path="/edit/:id" element={<Edit />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/users" element={<Users />} />
            <Route path="/kids" element={<Kids />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
