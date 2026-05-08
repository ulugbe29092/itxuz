import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import LessonPage from './pages/LessonPage'
import QuizPage from './pages/QuizPage'
import Profile from './pages/Profile'
import Pricing from './pages/Pricing'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCourses from './pages/admin/AdminCourses'
import AdminLessons from './pages/admin/AdminLessons'
import AdminPayments from './pages/admin/AdminPayments'
import AdminQuiz from './pages/admin/AdminQuiz'
import AdminViolations from './pages/admin/AdminViolations'
import AdminRetakeRequests from './pages/admin/AdminRetakeRequests'

// Components
import Navbar from './components/Navbar'
import AiChat from './components/AiChat'
import Loader from './components/Loader'

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <Loader />
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <Loader />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { fetchMe } = useAuthStore()

  useEffect(() => {
    fetchMe()
  }, [])

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/pricing" element={<><Navbar /><Pricing /></>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Private */}
        <Route path="/dashboard" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute><Navbar /><Courses /></PrivateRoute>} />
        <Route path="/courses/:slug" element={<PrivateRoute><Navbar /><CourseDetail /></PrivateRoute>} />
        <Route path="/lessons/:id" element={<PrivateRoute><Navbar /><LessonPage /></PrivateRoute>} />
        <Route path="/quiz/:id" element={<PrivateRoute><Navbar /><QuizPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Navbar /><Profile /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="quiz" element={<AdminQuiz />} />
          <Route path="violations" element={<AdminViolations />} />
          <Route path="retake-requests" element={<AdminRetakeRequests />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AiChat />
    </>
  )
}
