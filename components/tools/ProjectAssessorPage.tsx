

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Select } from '../ui/Select';
import { FormData as Project, Page } from '../../types';
import { ARTISTIC_DISCIPLINES, PROJECT_ASSESSABLE_FIELDS } from '../../constants';

interface ProjectAssessorPageProps {
    onNavigate: (page: Page) => void;
}

const ProjectAssessorPage: React.FC<ProjectAssessorPageProps> = ({ onNavigate }) => {
    const { state, dispatch } = useAppContext();
    const { projects } = state;
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const projectOptions = useMemo(() => [
        { value: '', label: 'Select a project to analyze...' },
        ...projects.map(p => ({ value: p.id, label: p.projectTitle }))
    ], [projects]);

    const selectedProject = useMemo(() => {
        return projects.find(p => p.id === selectedProjectId);
    }, [selectedProjectId, projects]);
    
    const handleFieldClick = (field: { key: keyof Project | 'artisticDisciplinesAndGenres', label: string }) => {
        if (!selectedProject) return;
        dispatch({
            type: 'SET_ACTIVE_WORKSHOP_ITEM',
            payload: {
                type: 'project',
                itemId: selectedProject.id,
                fieldKey: field.key,
                fieldLabel: field.label
            }
        });
        onNavigate('aiWorkshop');
    };

    const getGenreSummary = (project: Project): string => {
        if (!project.artisticDisciplines || project.artisticDisciplines.length === 0) return 'No disciplines selected...';
        
        return project.artisticDisciplines.map(key => {
            return ARTISTIC_DISCIPLINES.find(d => d.value === key)?.label || key;
        }).join(', ');
    };
    
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-slate-900">Project AI Assistant</h1>
            <p className="text-slate-500 mt-1 mb-6">Select a project to get AI-powered feedback on its written components.</p>
            
            <div className="max-w-md">
                <Select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    options={projectOptions}
                />
            </div>
            
            <div className="mt-8">
                {selectedProject ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PROJECT_ASSESSABLE_FIELDS.map(field => {
                            if (field.key === 'artisticDisciplinesAndGenres') {
                                return (
                                    <button
                                        key={field.key}
                                        onClick={() => handleFieldClick(field)}
                                        className="p-4 border rounded-lg text-left transition-all duration-200 hover:shadow-md hover:-translate-y-1 border-slate-300 bg-white hover:border-teal-400"
                                    >
                                        <h3 className="font-semibold text-slate-800">{field.label}</h3>
                                        <p className="text-sm mt-1 h-12 overflow-hidden text-ellipsis text-slate-600">
                                            {getGenreSummary(selectedProject)}
                                        </p>
                                        <div className="mt-2 text-xs font-medium text-teal-600">
                                            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Analyze Section
                                        </div>
                                    </button>
                                );
                            }

                            const content = (selectedProject as any)[field.key] || '';
                            const hasContent = content.length > 0;
                            return (
                                <button
                                    key={field.key}
                                    onClick={() => handleFieldClick(field)}
                                    className={`p-4 border rounded-lg text-left transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                                        hasContent ? 'border-slate-300 bg-white hover:border-teal-400' : 'border-dashed border-slate-300 bg-slate-50 hover:border-blue-400'
                                    }`}
                                >
                                    <h3 className="font-semibold text-slate-800">{field.label}</h3>
                                    <p className={`text-sm mt-1 h-12 overflow-hidden text-ellipsis ${hasContent ? 'text-slate-600' : 'text-slate-400 italic'}`}>
                                        {content || 'Click to get AI feedback or generate content...'}
                                    </p>
                                    <div className={`mt-2 text-xs font-medium ${hasContent ? 'text-teal-600' : 'text-blue-600'}`}>
                                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Analyze Section
                                    </div>
                                </button>
                            );
                        })}
                    </div>
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

export default ProjectAssessorPage;