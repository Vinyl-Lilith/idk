import React from 'react';

export const SensorCard = ({ label, value, unit, icon: Icon, colorClass, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-bold text-gray-900">{value ?? '--'}</h3>
        <span className="text-gray-500 font-medium">{unit}</span>
      </div>
    </div>
  </div>
);
