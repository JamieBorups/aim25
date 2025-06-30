
import React from 'react';
import { FormData } from '../types';

interface ProjectListProps {
  projects: FormData[];
  onAddProject: () => void;
  onEditProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onViewProject: (id: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onAddProject, onEditProject, onDeleteProject, onViewProject }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Your Projects</h1>
        <button
          onClick={onAddProject}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          <i className="fa fa-plus mr-2"></i>
          Add New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-folder-open text-7xl text-slate-300"></i>
          <h3 className="mt-6 text-xl font-medium text-slate-800">No projects yet</h3>
          <p className="text-slate-500 mt-2 text-base">Click "Add New Project" to get started!</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200">
          {projects.map(project => (
            <li key={project.id} className="py-4 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 rounded-md -mx-2 transition-colors">
              <div className="mb-3 sm:mb-0">
                <p className="text-lg font-semibold text-teal-700 hover:underline cursor-pointer" onClick={() => onViewProject(project.id)}>
                  {project.projectTitle || 'Untitled Project'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : 'No start date'} - {project.projectEndDate ? new Date(project.projectEndDate).toLocaleDateString() : 'No end date'}
                </p>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                 <button
                  onClick={() => onViewProject(project.id)}
                  className="px-3 py-1.5 text-sm text-slate-700 bg-white hover:bg-slate-100 rounded-md border border-slate-300 shadow-sm transition-colors"
                  aria-label={`View ${project.projectTitle}`}
                >
                  <i className="fa fa-eye mr-2 text-slate-500"></i>
                  View
                </button>
                 <button
                  onClick={() => onEditProject(project.id)}
                  className="px-3 py-1.5 text-sm text-slate-700 bg-white hover:bg-slate-100 rounded-md border border-slate-300 shadow-sm transition-colors"
                  aria-label={`Edit ${project.projectTitle}`}
                >
                  <i className="fa fa-pencil mr-2 text-slate-500"></i>
                  Edit
                </button>
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="px-3 py-1.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 shadow-sm transition-colors"
                  aria-label={`Delete ${project.projectTitle}`}
                >
                  <i className="fa fa-trash-alt mr-2"></i>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectList;
