import React from 'react';

export const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={20} />
          </div>
        )}
        <input
          className={`
            block w-full rounded-lg border-gray-300 bg-gray-50 border 
            focus:bg-white focus:ring-2 focus:ring-nature-500 focus:border-transparent 
            transition-colors duration-200 py-2.5
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
