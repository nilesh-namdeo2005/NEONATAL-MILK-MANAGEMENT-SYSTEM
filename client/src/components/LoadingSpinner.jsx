import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
  const spinner = (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-medical-DEFAULT"></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 bg-opacity-75 fixed inset-0 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="p-4">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
