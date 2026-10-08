import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTint, FaBars, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const getLinks = () => {
    if (!user) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Availability', path: '/availability' },
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' }
      ];
    }
    
    switch (user.role) {
      case 'donor':
        return [
          { name: 'Dashboard', path: '/donor/dashboard' },
          { name: 'Donate', path: '/donor/donate' },
          { name: 'My Donations', path: '/donor/donations' },
          { name: 'Availability', path: '/availability' }
        ];
      case 'recipient':
        return [
          { name: 'Dashboard', path: '/recipient/dashboard' },
          { name: 'My Babies', path: '/recipient/babies' },
          { name: 'Request Milk', path: '/recipient/request' },
          { name: 'My Requests', path: '/recipient/tracking' },
          { name: 'Availability', path: '/availability' }
        ];
      case 'hospital':
        return [
          { name: 'Dashboard', path: '/hospital/dashboard' },
          { name: 'Availability', path: '/availability' }
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard' },
          { name: 'History', path: '/history' }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-primary-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <FaTint className="h-8 w-8 text-white" />
              <span className="font-bold text-xl tracking-tight">NMM System</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path 
                    ? 'bg-primary-800 text-white' 
                    : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user && (
              <div className="flex items-center ml-4 space-x-4">
                <Link to="/profile" className="flex items-center space-x-1 text-primary-100 hover:text-white">
                  <FaUser />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-100 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-100 hover:text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path 
                    ? 'bg-primary-900 text-white' 
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-700 hover:text-white"
                >
                  Profile ({user.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-700 hover:text-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
