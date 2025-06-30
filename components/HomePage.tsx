import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <div className="text-center">
        <i className="fa-solid fa-rocket text-6xl text-teal-500"></i>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Welcome to The Arts Incubator
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Manage all your creative projects from one central place.
        </p>
        <div className="mt-6 text-left max-w-2xl mx-auto text-slate-700 space-y-2">
            <p>
                Use the <span className="font-bold text-teal-600">Projects</span> link in the sidebar to view, create, edit, or delete your projects.
            </p>
            <p>
                This tool is designed to help you keep track of all the important details, from project information and collaborators to detailed budgets.
            </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;