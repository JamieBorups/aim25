import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <h1 className="text-xl font-bold text-slate-800">Project Management Tool</h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* "View" button removed */}
          </div>
        </div>
      </div>
    </header>
  );
};