import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-blue-100 mb-8">
        <FiAlertCircle className="w-32 h-32 mx-auto text-blue-500 opacity-20" />
      </div>
      <h1 className="text-8xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
        Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition"
      >
        <FiHome className="text-xl" /> Go Home
      </Link>
    </div>
  );
};

export default NotFound;
