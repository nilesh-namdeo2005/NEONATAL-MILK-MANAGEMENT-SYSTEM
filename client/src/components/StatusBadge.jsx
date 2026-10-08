import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase();
  let colorClass = '';

  switch (normalizedStatus) {
    case 'pending':
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      break;
    case 'approved':
    case 'verified':
    case 'accepted':
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case 'collected':
    case 'completed':
    case 'normal':
      colorClass = 'bg-green-100 text-green-800 border-green-200';
      break;
    case 'rejected':
    case 'emergency':
      colorClass = 'bg-red-100 text-red-800 border-red-200';
      break;
    case 'expired':
      colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
      break;
    case 'processing':
      colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} capitalize`}>
      {status}
    </span>
  );
};

export default StatusBadge;
