import React from 'react';

const StatCard = ({ title, value, icon: IconOrElement, color = 'blue', subtitle }) => {
  const colorMap = {
    blue: 'border-blue-500 text-blue-600 bg-blue-50',
    green: 'border-green-500 text-green-600 bg-green-50',
    red: 'border-red-500 text-red-600 bg-red-50',
    yellow: 'border-yellow-500 text-yellow-600 bg-yellow-50',
    purple: 'border-purple-500 text-purple-600 bg-purple-50',
    gray: 'border-gray-500 text-gray-600 bg-gray-50'
  };

  const selectedColor = colorMap[color] || colorMap.blue;
  const [borderColor, iconColor, bgColor] = selectedColor.split(' ');

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${borderColor} p-6 flex flex-col`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {IconOrElement && (
          <div className={`p-3 rounded-full ${bgColor}`}>
            {React.isValidElement(IconOrElement)
              ? React.cloneElement(IconOrElement, {
                  className: `${IconOrElement.props.className || ''} h-6 w-6 ${iconColor}`.trim()
                })
              : <IconOrElement className={`h-6 w-6 ${iconColor}`} />}
          </div>
        )}
      </div>
      {subtitle && (
        <div className="mt-4 text-sm text-gray-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
