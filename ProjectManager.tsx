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
  const { projects, setProjects, notify, tasks, setTasks, activities, setActivities, directExpenses, setDirectExpenses, reports, setReports, setReportProjectIdToOpen } = useAppContext();
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
    
    // Cascading delete logic
    const tasksToDelete = tasks.filter(t => t.projectId === projectToDelete);
    const taskIdsToDelete = new Set(tasksToDelete.map(t => t.id));

    setProjects(prev => prev.filter(p => p.id !== projectToDelete));
    setTasks(prev => prev.filter(t => t.projectId !== projectToDelete));
    setActivities(prev => prev.filter(a => !taskIdsToDelete.has(a.taskId)));
    setDirectExpenses(prev => prev.filter(d => d.projectId !== projectToDelete));
    setReports(prev => prev.filter(r => r.projectId !== projectToDelete));

    notify('Project and all associated data deleted.', 'success');

    // Reset state
    setViewMode('list');
    setCurrentProject(null);
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };


  const handleSaveProject = (projectToSave: FormData_type) => {
    const isNewProject = !projects.find(p => p.id === projectToSave.id);
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
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: status } : p
    ));
    notify(`Project status updated to ${status}.`, 'success');

    if (status === 'Completed') {
      setProjectToComplete(projectId);
      setIsReportModalOpen(true);
    }
  };

  const confirmGenerateReport = () => {
    if (!projectToComplete) return;
    setReportProjectIdToOpen(projectToComplete);
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