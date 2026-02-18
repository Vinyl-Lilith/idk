import React from 'react';

export const Table = ({ headers, children }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
    <table className="w-full text-left border-collapse bg-white">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {children}
      </tbody>
    </table>
  </div>
);
