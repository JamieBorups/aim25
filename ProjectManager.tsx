
import React, { useState } from 'react';
import ProjectList from './components/ProjectList';
import ProjectEditor from './components/ProjectEditor';
import ProjectViewer from './components/ProjectViewer';
import ConfirmationModal from './components/ui/ConfirmationModal';
import { initialFormData as initialFormDataConstant } from './constants';
import { FormData as FormData_type, ProjectStatus, Page } from './types';
import { useAppContext } from './context/AppContext';

type ViewMode = 'list' | 'edit' | 'view';

interface ProjectManagerProps {
  onNavigate: (page: Page) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ onNavigate }) => {
  const { state, dispatch, notify } = useAppContext();
  const { projects } = state;
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentProject, setCurrentProject] = useState<FormData_type | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [projectToComplete, setProjectToComplete] = useState<string | null>(null);


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
    setProjectToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    
    dispatch({ type: 'DELETE_PROJECT', payload: projectToDelete });
    notify('Project and all associated data deleted.', 'success');

    // Reset state
    setViewMode('list');
    setCurrentProject(null);
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };


  const handleSaveProject = (projectToSave: FormData_type) => {
    const isNewProject = !projects.find(p => p.id === projectToSave.id);
    const originalProject = projects.find(p => p.id === projectToSave.id);

    const updatedProjects = isNewProject
      ? [...projects, projectToSave]
      : projects.map(p => p.id === projectToSave.id ? projectToSave : p);
      
    dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
    
    // Check for status change to 'Completed' from a different status
    if (originalProject && originalProject.status !== 'Completed' && projectToSave.status === 'Completed') {
        setProjectToComplete(projectToSave.id);
        setIsReportModalOpen(true);
    }

    if (viewMode === 'edit') {
        notify(isNewProject ? 'Project created successfully!' : 'Project saved successfully!', 'success');
        setViewMode('list');
        setCurrentProject(null);
    } else if (viewMode === 'view') {
        notify('Project updated successfully!', 'success');
        setCurrentProject(projectToSave);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentProject(null);
  };
  
  const handleUpdateProjectStatus = (projectId: string, status: ProjectStatus) => {
    const originalProject = projects.find(p => p.id === projectId);
    
    dispatch({ type: 'UPDATE_PROJECT_STATUS', payload: { projectId, status } });
    notify(`Project status updated to ${status}.`, 'success');

    if (originalProject && originalProject.status !== 'Completed' && status === 'Completed') {
      setProjectToComplete(projectId);
      setIsReportModalOpen(true);
    }
  };

  const confirmGenerateReport = () => {
    if (!projectToComplete) return;
    dispatch({ type: 'SET_REPORT_PROJECT_ID_TO_OPEN', payload: projectToComplete });
    onNavigate('reports');
    setIsReportModalOpen(false);
    setProjectToComplete(null);
  };

  const renderContent = () => {
      switch(viewMode) {
          case 'edit':
              return currentProject && <ProjectEditor
                key={currentProject.id}
                project={currentProject}
                onSave={handleSaveProject}
                onCancel={handleBackToList}
              />;
          case 'view':
              return currentProject && <ProjectViewer 
                project={currentProject} 
                onBack={handleBackToList} 
                onSave={handleSaveProject}
              />;
          case 'list':
          default:
            return <ProjectList
                projects={projects}
                onAddProject={handleAddProject}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onViewProject={handleViewProject}
                onUpdateProjectStatus={handleUpdateProjectStatus}
              />;
      }
  }

  return (
    <div className="font-sans text-slate-800">
      <main className="w-full">
        {renderContent()}
         {isDeleteModalOpen && (
            <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDeleteProject}
            title="Delete Project"
            message={
                <>
                Are you sure you want to delete this project? 
                <br />
                <strong className="font-bold text-red-700">This action cannot be undone.</strong> All associated tasks, activities, and expenses will also be permanently deleted.
                </>
            }
            confirmButtonText="Delete Project"
            />
        )}
        {isReportModalOpen && (
            <ConfirmationModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onConfirm={confirmGenerateReport}
                title="Project Complete"
                message="This project is now complete. Would you like to generate the final report now?"
                confirmButtonText="Generate Report"
                cancelButtonText="Later"
            />
        )}
      </main>
    </div>
  );
};

export default ProjectManager;
