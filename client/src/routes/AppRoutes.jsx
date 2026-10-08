import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AvailabilitySearch from '../pages/AvailabilitySearch';
import DonorDashboard from '../pages/DonorDashboard';
import DonationForm from '../pages/DonationForm';
import DonationHistory from '../pages/DonationHistory';
import RecipientDashboard from '../pages/RecipientDashboard';
import BabyRegistration from '../pages/BabyRegistration';
import RequestForm from '../pages/RequestForm';
import RequestTracking from '../pages/RequestTracking';
import HospitalDashboard from '../pages/HospitalDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import HistoryPage from '../pages/HistoryPage';
import ProfilePage from '../pages/ProfilePage';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Register />} />
          <Route path="/availability" element={<AvailabilitySearch />} />

          {/* Donor Routes */}
          <Route path="/donor/*" element={<ProtectedRoute roles={['donor']} />}>
            <Route path="dashboard" element={<DonorDashboard />} />
            <Route path="donate" element={<DonationForm />} />
            <Route path="donations" element={<DonationHistory />} />
          </Route>

          {/* Recipient Routes */}
          <Route path="/recipient/*" element={<ProtectedRoute roles={['recipient']} />}>
            <Route path="dashboard" element={<RecipientDashboard />} />
            <Route path="babies" element={<BabyRegistration />} />
            <Route path="request" element={<RequestForm />} />
            <Route path="tracking" element={<RequestTracking />} />
          </Route>

          {/* Hospital Routes */}
          <Route path="/hospital/*" element={<ProtectedRoute roles={['hospital']} />}>
            <Route path="dashboard" element={<HospitalDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/*" element={<ProtectedRoute roles={['admin']} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Shared Protected Routes */}
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
};

export default AppRoutes;
