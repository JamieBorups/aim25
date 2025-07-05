import React, { useMemo, useState } from 'react';
import { FormData, ProjectViewTabId } from '../types';
import ProjectInfoView from './view/ProjectInfoView';
import CollaboratorsView from './view/CollaboratorsView';
import BudgetView from './view/BudgetView';
import WorkplanTab from './view/WorkplanTab';
import ActivityInsightsTab from './view/ActivityInsightsTab';
import { useAppContext } from '../context/AppContext';

interface ProjectViewerProps {
    project: FormData;
    onBack: () => void;
    onSave: (project: FormData) => void;
}

const ProjectViewer: React.FC<ProjectViewerProps> = ({ project, onBack, onSave }) => {
    const { state: { tasks, activities, directExpenses } } = useAppContext();
    const [activeTab, setActiveTab] = useState<ProjectViewTabId>('info');

    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id), [tasks, project.id]);
    
    const projectActivities = useMemo(() => {
        const projectTaskIds = new Set(projectTasks.map(t => t.id));
        return activities.filter(a => projectTaskIds.has(a.taskId));
    }, [activities, projectTasks]);

    const projectDirectExpenses = useMemo(() => directExpenses.filter(d => d.projectId === project.id), [directExpenses, project.id]);

    const tabs: {id: ProjectViewTabId, label: string, icon: string}[] = [
        { id: 'info', label: 'Project Info', icon: 'fa-solid fa-circle-info' },
        { id: 'collaborators', label: 'Collaborators', icon: 'fa-solid fa-users' },
        { id: 'budget', label: 'Budget vs. Actuals', icon: 'fa-solid fa-chart-pie' },
        { id: 'workplan', label: 'Workplan & Tasks', icon: 'fa-solid fa-list-check' },
        { id: 'insights', label: 'Activity & Insights', icon: 'fa-solid fa-chart-line' },
    ];

    const renderTabContent = () => {
        switch(activeTab) {
            case 'info':
                return <ProjectInfoView project={project} />;
            case 'collaborators':
                return <CollaboratorsView project={project} />;
            case 'budget':
                return <BudgetView 
                    project={project}
                    onSave={onSave}
                    tasks={projectTasks} 
                    activities={projectActivities} 
                    directExpenses={projectDirectExpenses}
                />;
            case 'workplan':
                return <WorkplanTab project={project} />;
            case 'insights':
                return <ActivityInsightsTab project={project} />;
            default:
                return <ProjectInfoView project={project} />;
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-5">
                <h1 className="text-3xl font-bold text-slate-900">{project.projectTitle}</h1>
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                >
                    <i className="fa fa-arrow-left mr-2"></i>
                    Back to List
                </button>
            </div>
            
            <div className="border-b border-slate-200 mb-8">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        type="button"
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md flex items-center gap-2 ${
                        activeTab === tab.id
                            ? 'border-teal-500 text-teal-600 bg-slate-100'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        <i className={`${tab.icon} ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`}></i>
                        {tab.label}
                    </button>
                ))}
                </nav>
            </div>
            
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default ProjectViewer;