import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'
import Dashboard from './Dashboard'
import DoctorDashboard from './DoctorDashboard'
import DoctorProfile from './DoctorProfile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<LoginPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignupPage />} />
        <Route path="/dashboard"       element={<Dashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />

      </Routes>
    </BrowserRouter>
  )
}
export default App