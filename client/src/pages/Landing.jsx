import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiActivity, FiGlobe, FiShield, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold tracking-tight mb-6">
              Neonatal Milk Management System
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-10 text-blue-100">
              Connecting generous donors with babies in need. A secure, transparent, and efficient way to manage human milk banking across our hospital network.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-700 px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-50 transition flex items-center gap-2"
              >
                Get Started <FiArrowRight />
              </button>
              <Link
                to="/availability"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-700 transition"
              >
                Check Availability
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiHeart />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Donor Management</h3>
              <p className="text-gray-600">Secure registration and screening process for generous mothers willing to donate.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiShield />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Milk Banking</h3>
              <p className="text-gray-600">Safe processing, pasteurization, and storage tracking of donated milk.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiActivity />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Real-time Tracking</h3>
              <p className="text-gray-600">End-to-end traceability with unique QR codes for every donation and request.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiGlobe />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Hospital Network</h3>
              <p className="text-gray-600">Seamless communication between multiple hospitals and milk banks.</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-50 py-16 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Successful Donations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Partner Hospitals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2500+</div>
              <div className="text-gray-600 font-medium">Babies Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} Neonatal Milk Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
