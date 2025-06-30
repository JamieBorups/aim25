
import React, { useState } from 'react';
import ProjectList from './components/ProjectList';
import ProjectEditor from './components/ProjectEditor';
import ProjectViewer from './components/ProjectViewer';
import { initialFormData as initialFormDataConstant } from './constants';
import { FormData as FormData_type, Member, Task, Activity } from './types';

type ViewMode = 'list' | 'edit' | 'view';

interface ProjectManagerProps {
  projects: FormData_type[];
  setProjects: React.Dispatch<React.SetStateAction<FormData_type[]>>;
  members: Member[];
  tasks: Task[];
  activities: Activity[];
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, setProjects, members, tasks, activities }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentProject, setCurrentProject] = useState<FormData_type | null>(null);

  const handleAddProject = () => {
    const newProject: FormData_type = {
      ...initialFormDataConstant,
      id: `proj_${Date.now()}`,
      projectTitle: 'New Project'
    };
    setCurrentProject(newProject);
    setViewMode('edit');
  };
  
  const handleViewProject = (id: string) => {
    const projectToView = projects.find(p => p.id === id);
    if (projectToView) {
      setCurrentProject(projectToView);
      setViewMode('view');
    }
  };

  const handleEditProject = (id: string) => {
    const projectToEdit = projects.find(p => p.id === id);
    if (projectToEdit) {
      setCurrentProject(projectToEdit);
      setViewMode('edit');
    }
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
      setViewMode('list');
      setCurrentProject(null);
    }
  };

  const handleSaveProject = (projectToSave: FormData_type) => {
    setProjects(prevProjects => {
      const index = prevProjects.findIndex(p => p.id === projectToSave.id);
      if (index > -1) {
        const updatedProjects = [...prevProjects];
        updatedProjects[index] = projectToSave;
        return updatedProjects;
      } else {
        return [...prevProjects, projectToSave];
      }
    });
    setViewMode('list');
    setCurrentProject(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentProject(null);
  };
  
  const renderContent = () => {
      switch(viewMode) {
          case 'edit':
              return currentProject && <ProjectEditor
                key={currentProject.id}
                project={currentProject}
                onSave={handleSaveProject}
                onCancel={handleBackToList}
                members={members}
              />;
          case 'view':
              return currentProject && <ProjectViewer project={currentProject} onBack={handleBackToList} members={members} tasks={tasks} activities={activities} />;
          case 'list':
          default:
            return <ProjectList
                projects={projects}
                onAddProject={handleAddProject}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onViewProject={handleViewProject}
              />;
      }
  }

  return (
    <div className="font-sans text-slate-800">
      <main className="w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default ProjectManager;