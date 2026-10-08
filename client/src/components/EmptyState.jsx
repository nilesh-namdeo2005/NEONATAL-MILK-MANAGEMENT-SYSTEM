import React from 'react';
import { FaInbox } from 'react-icons/fa';

const EmptyState = ({ icon, title, message, actionText, onAction }) => {
  const Icon = icon || FaInbox;

  return (
    <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-50 rounded-full text-gray-400">
          <Icon className="h-10 w-10" />
        </div>
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
        {message}
      </p>
      {actionText && onAction && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-medical-DEFAULT hover:bg-medical-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-DEFAULT transition-colors"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
