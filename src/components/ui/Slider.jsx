import React from 'react';

export const Slider = ({ label, min, max, value, onChange, unit = "" }) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <span className="text-sm font-bold text-nature-700">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-nature-600"
    />
  </div>
);
