import React from 'react';

export const Switch = ({ label, checked, onChange, disabled }) => (
  <label className="flex items-center cursor-pointer group">
    <div className="relative">
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className={`block w-12 h-7 rounded-full transition-colors ${checked ? 'bg-nature-500' : 'bg-gray-300'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 transform ${checked ? 'translate-x-5' : ''}`}></div>
    </div>
    {label && <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>}
  </label>
);
