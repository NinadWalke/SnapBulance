import { createRoot } from 'react-dom/client'
import './index.css'
import { useEffect } from 'react'

// react-router-dom
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

// --- Page Imports ---

// 1. Common
import LandingPage from './pages/common/LandingPage'
import LoginPage from './pages/common/LoginPage'
import RegisterPage from './pages/common/RegisterPage'
import NotFoundPage from './pages/common/NotFoundPage'
import UnauthorizedPage from './pages/common/UnauthorizedPage'

// 2. User
import UserHome from './pages/user/trip/UserHome'
import LookingForDriver from './pages/user/trip/LookingForDriver'
import LiveTripTracking from './pages/user/trip/LiveTripTracking'
import RideHistory from './pages/user/trip/RideHistory'
import UserProfile from './pages/user/profile/UserProfile'
import UserEditProfile from './pages/user/profile/UserEditProfile'

// 3. Driver
import DriverDashboard from './pages/driver/DriverDashboard'
import ActiveNavigation from './pages/driver/ActiveNavigation'
import PatientHandover from './pages/driver/PatientHandover'
import MissionSummary from './pages/driver/MissionSummary'

// 4. Hospital
import HospitalDashboard from './pages/hospital/HospitalDashboard'
import IncomingPatientDetail from './pages/hospital/IncomingPatientDetail'
import HospitalProfile from './pages/hospital/HospitalProfile'

// --- Helper Components ---
// You need to create these files in src/components/
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Zustand
import { useAuthStore } from './store/useAuthStore'

const Layout = () => {
  const location = useLocation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  // Fire auth check on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Optional: Hide Navbar on 404 or specific full-screen pages
  const hideNavbarOn = ['/404', '/unauthorized'];
  const showNavbar = !hideNavbarOn.includes(location.pathname);
  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* --- Protected USER Routes --- */}
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/user/home" element={<UserHome />} />
            <Route path="/user/searching" element={<LookingForDriver />} />
            <Route path="/user/track/:tripId" element={<LiveTripTracking />} />
            <Route path="/user/history" element={<RideHistory />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/profile/edit" element={<UserEditProfile />} />
          </Route>

          {/* --- Protected DRIVER Routes --- */}
          <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/mission/:tripId" element={<ActiveNavigation />} />
            <Route path="/driver/handover/:tripId" element={<PatientHandover />} />
            <Route path="/driver/summary/:tripId" element={<MissionSummary />} />
          </Route>

          {/* --- Protected HOSPITAL Routes --- */}
          <Route element={<ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']} />}>
            <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
            <Route path="/hospital/patient/:tripId" element={<IncomingPatientDetail />} />
            <Route path="/hospital/profile" element={<HospitalProfile />} />
          </Route>

          {/* --- Fallback Route --- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Layout />
  </BrowserRouter>,
)