
import React, { useState, useRef, useEffect } from 'react';
import { FormData, ProjectStatus } from '../types';
import { PROJECT_STATUS_OPTIONS } from '../constants';

interface ProjectListProps {
  projects: FormData[];
  onAddProject: () => void;
  onEditProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onViewProject: (id: string) => void;
  onUpdateProjectStatus: (id: string, status: ProjectStatus) => void;
}

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
    const statusStyles: Record<ProjectStatus, string> = {
        'Active': 'bg-green-100 text-green-800',
        'On Hold': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-blue-100 text-blue-800',
        'Pending': 'bg-slate-100 text-slate-800',
        'Terminated': 'bg-rose-100 text-rose-800',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>
            {status}
        </span>
    );
};

const StatusDropdown: React.FC<{
  project: FormData;
  onUpdate: (id: string, status: ProjectStatus) => void;
}> = ({ project, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = (status: ProjectStatus) => {
    onUpdate(project.id, status);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700"
        aria-label="Change project status"
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {PROJECT_STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleUpdate(option.value)}
                disabled={project.status === option.value}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectList: React.FC<ProjectListProps> = ({ projects, onAddProject, onEditProject, onDeleteProject, onViewProject, onUpdateProjectStatus }) => {
  const activeAndOnHoldProjects = projects.filter(p => ['Pending', 'Active', 'On Hold'].includes(p.status));
  const finishedProjects = projects.filter(p => ['Completed', 'Terminated'].includes(p.status));

  const renderProjectItem = (project: FormData) => (
     <li key={project.id} className={`py-4 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 rounded-md -mx-2 transition-all duration-200 ${project.status === 'On Hold' ? 'opacity-70' : ''}`}>
        <div className="mb-3 sm:mb-0">
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-teal-700 hover:underline cursor-pointer" onClick={() => onViewProject(project.id)}>
              {project.projectTitle || 'Untitled Project'}
            </p>
            <StatusBadge status={project.status || 'Active'} />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : 'No start date'} - {project.projectEndDate ? new Date(project.projectEndDate).toLocaleDateString() : 'No end date'}
          </p>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
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
            <StatusDropdown project={project} onUpdate={onUpdateProjectStatus} />
        </div>
    </li>
  );

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
          <h3 className="mt-6 text-xl font-medium text-slate-800">You haven't created any projects yet.</h3>
          <p className="text-slate-500 mt-2 text-base">Click the "Add New Project" button above to get started!</p>
        </div>
      ) : (
        <div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Active & On Hold</h2>
            {activeAndOnHoldProjects.length > 0 ? (
                 <ul className="divide-y divide-slate-200">
                    {activeAndOnHoldProjects.map(renderProjectItem)}
                </ul>
            ) : (
                <p className="text-slate-500 italic py-4">No active projects.</p>
            )}

            {finishedProjects.length > 0 && (
                <details className="mt-8">
                    <summary className="text-xl font-bold text-slate-700 cursor-pointer list-none flex items-center gap-2">
                        <i className="fa-solid fa-chevron-right transition-transform duration-200"></i>
                        Finished Projects ({finishedProjects.length})
                    </summary>
                    <div className="mt-2 border-t pt-2">
                        <ul className="divide-y divide-slate-200">
                            {finishedProjects.map(renderProjectItem)}
                        </ul>
                    </div>
                </details>
            )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
