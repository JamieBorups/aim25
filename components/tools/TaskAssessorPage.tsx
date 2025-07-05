


import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { Select } from '../ui/Select';
import { Task, Page } from '../../types';
import ToggleSwitch from '../ui/ToggleSwitch';
import { Input } from '../ui/Input';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';

interface TaskAssessorPageProps {
    onNavigate: (page: Page) => void;
}

const TaskAssessorPage: React.FC<TaskAssessorPageProps> = ({ onNavigate }) => {
    const { state, dispatch } = useAppContext();
    const { projects, tasks } = state;
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [mode, setMode] = useState<'basic' | 'advanced'>('basic');

    const projectOptions = useMemo(() => [
        { value: '', label: 'Select a project...' },
        ...projects.map(p => ({ value: p.id, label: p.projectTitle }))
    ], [projects]);

    const tasksForSelectedProject = useMemo(() => {
        if (!selectedProjectId) return [];
        return tasks.filter(t => t.projectId === selectedProjectId);
    }, [selectedProjectId, tasks]);
    
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    
    const handleTaskClick = (task: Task) => {
        dispatch({
            type: 'SET_ACTIVE_WORKSHOP_ITEM',
            payload: { type: 'task', itemId: task.id }
        });
        onNavigate('aiWorkshop');
    };
    
    const handleSuggestInitialTasks = () => {
        dispatch({
            type: 'SET_ACTIVE_WORKSHOP_ITEM',
            payload: { type: 'task', itemId: `new_${selectedProjectId}` }
        });
        onNavigate('aiWorkshop');
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">AI Task Assessor</h1>
                    <p className="text-slate-500 mt-1">Select a project to analyze its tasks with the help of your AI 'Task' persona.</p>
                </div>
                 <div className="flex-shrink-0">
                    <ToggleSwitch 
                        id="task-assessor-mode"
                        checked={mode === 'advanced'}
                        onChange={(isChecked) => setMode(isChecked ? 'advanced' : 'basic')}
                        label={mode === 'basic' ? 'Basic Mode' : 'Advanced Mode'}
                    />
                </div>
            </div>

            <div className="flex items-end gap-4">
                <div className="flex-grow max-w-md">
                    <Select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        options={projectOptions}
                    />
                </div>
                {selectedProjectId && tasksForSelectedProject.length === 0 && (
                    <button
                        onClick={handleSuggestInitialTasks}
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Suggest Initial Tasks
                    </button>
                )}
            </div>

            <div className="mt-8">
                {selectedProjectId ? (
                    tasksForSelectedProject.length > 0 ? (
                        <div className="space-y-3">
                            <h2 className="text-xl font-semibold text-slate-800">Tasks for: {selectedProject?.projectTitle}</h2>
                            <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                                {tasksForSelectedProject.map(task => (
                                    <li
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className="p-4 hover:bg-teal-50 cursor-pointer transition-colors flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-800">{task.title}</p>
                                            <p className="text-sm text-slate-500">{task.description.substring(0, 100)}...</p>
                                        </div>
                                        <span className="font-mono text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex-shrink-0">{task.taskCode}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-500">
                            <i className="fa-solid fa-check-double text-6xl text-slate-300"></i>
                            <h3 className="mt-4 text-lg font-medium">This project has no tasks yet.</h3>
                            <p className="mt-1">Click the "Suggest Initial Tasks" button to get started.</p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        <i className="fa-solid fa-arrow-up text-6xl text-slate-300"></i>
                        <h3 className="mt-4 text-lg font-medium">Please select a project to begin.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskAssessorPage;
