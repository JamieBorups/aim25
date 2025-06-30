
import React, { useMemo } from 'react';
import { FormData, Member, Task, Activity } from '../types';
import ProjectInfoView from './view/ProjectInfoView';
import CollaboratorsView from './view/CollaboratorsView';
import BudgetView from './view/BudgetView';

interface ProjectViewerProps {
    project: FormData;
    onBack: () => void;
    members: Member[];
    tasks: Task[];
    activities: Activity[];
}

const ProjectViewer: React.FC<ProjectViewerProps> = ({ project, onBack, members, tasks, activities }) => {
    
    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id), [tasks, project.id]);
    
    const projectActivities = useMemo(() => {
        const projectTaskIds = new Set(projectTasks.map(t => t.id));
        return activities.filter(a => projectTaskIds.has(a.taskId));
    }, [activities, projectTasks]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-5">
                <h1 className="text-3xl font-bold text-slate-900">{project.projectTitle}</h1>
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                >
                    <i className="fa fa-arrow-left mr-2"></i>
                    Back to List
                </button>
            </div>
            
            <div className="space-y-16">
                <ProjectInfoView project={project} />
                <CollaboratorsView project={project} members={members} />
                <BudgetView budget={project.budget} tasks={projectTasks} activities={projectActivities} />
            </div>
        </div>
    );
};

export default ProjectViewer;