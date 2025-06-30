
import React from 'react';

const ReportsPage: React.FC = () => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
      </div>

      <div className="text-center py-20">
        <i className="fa-solid fa-chart-pie text-7xl text-slate-300"></i>
        <h3 className="mt-6 text-xl font-medium text-slate-800">Reporting Module</h3>
        <p className="text-slate-500 mt-2 text-base">This section is under construction. Advanced reporting features will be available here soon.</p>
      </div>
    </div>
  );
};

export default ReportsPage;
