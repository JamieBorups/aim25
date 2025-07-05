

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../context/AppContext';
import { AppState, ProjectExportFile, WorkspaceExportFile, ProjectExportData, AiSettingsExportFile, FormData as ProjectData, Member, BudgetItem, Task, Activity, DirectExpense } from '../types';
import ConfirmationModal from './ui/ConfirmationModal';
import { Select } from './ui/Select';
import { Input } from './ui/Input';

const APP_NAME = "ARTS_INCUBATOR";
const CURRENT_APP_VERSION = "1.1.0";

const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const ImportExportPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
    const [isProjectSelectModalOpen, setIsProjectSelectModalOpen] = useState(false);
    const [isProjectImportModalOpen, setIsProjectImportModalOpen] = useState(false);
    const [isAiSettingsModalOpen, setIsAiSettingsModalOpen] = useState(false);

    const [fileToImport, setFileToImport] = useState<WorkspaceExportFile | null>(null);
    const [projectFileToImport, setProjectFileToImport] = useState<ProjectExportFile | null>(null);
    const [aiSettingsFileToImport, setAiSettingsFileToImport] = useState<AiSettingsExportFile | null>(null);

    const workspaceImportInputRef = useRef<HTMLInputElement>(null);
    const projectImportInputRef = useRef<HTMLInputElement>(null);
    const aiSettingsImportInputRef = useRef<HTMLInputElement>(null);

    // --- UTILITY FUNCTIONS ---
    const downloadFile = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --- WORKSPACE EXPORT/IMPORT ---

    const handleExportWorkspace = () => {
        const { reportProjectIdToOpen, ...dataToExport } = state;
        const exportData: WorkspaceExportFile = {
            type: `${APP_NAME}_WORKSPACE_BACKUP`,
            appVersion: CURRENT_APP_VERSION,
            exportDate: new Date().toISOString(),
            data: dataToExport,
        };
        const fileName = `${APP_NAME.toLowerCase()}-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), fileName);
        notify('Workspace backup exported successfully!', 'success');
    };

    const handleSelectWorkspaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string) as WorkspaceExportFile;
                if (parsed.type !== `${APP_NAME}_WORKSPACE_BACKUP`) {
                    throw new Error('Invalid file type. This is not a valid workspace backup file.');
                }
                if (parsed.appVersion !== CURRENT_APP_VERSION) {
                    throw new Error(`Version mismatch. File version: ${parsed.appVersion}, App version: ${CURRENT_APP_VERSION}.`);
                }
                setFileToImport(parsed);
                setIsWorkspaceModalOpen(true);
            } catch (error: any) {
                notify(error.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };
    
    const confirmImportWorkspace = () => {
        if (!fileToImport) return;
        dispatch({ type: 'LOAD_DATA', payload: fileToImport.data });
        notify('Workspace restored successfully!', 'success');
        setIsWorkspaceModalOpen(false);
        setFileToImport(null);
    };

    // --- PROJECT EXPORT/IMPORT ---
    
    const ProjectSelectModal = () => {
        const [selectedId, setSelectedId] = useState('');

        const handleExportProject = () => {
            if (!selectedId) {
                notify('Please select a project to export.', 'warning');
                return;
            }
            const project = state.projects.find(p => p.id === selectedId);
            if (!project) return;

            const projectTasks = state.tasks.filter(t => t.projectId === selectedId);
            const taskIds = new Set(projectTasks.map(t => t.id));
            const projectActivities = state.activities.filter(a => taskIds.has(a.taskId));
            const projectDirectExpenses = state.directExpenses.filter(d => d.projectId === selectedId);
            const memberIds = new Set(project.collaboratorDetails.map(c => c.memberId));
            projectTasks.forEach(t => memberIds.add(t.assignedMemberId));
            projectActivities.forEach(a => memberIds.add(a.memberId));
            const projectMembers = state.members.filter(m => memberIds.has(m.id));

            const exportData: ProjectExportFile = {
                type: `${APP_NAME}_PROJECT_EXPORT`,
                appVersion: CURRENT_APP_VERSION,
                exportDate: new Date().toISOString(),
                data: {
                    project: project,
                    tasks: projectTasks,
                    activities: projectActivities,
                    directExpenses: projectDirectExpenses,
                    members: projectMembers,
                },
            };
            const safeTitle = project.projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `${APP_NAME.toLowerCase()}-project-${safeTitle}.json`;
            downloadFile(JSON.stringify(exportData, null, 2), fileName);
            notify(`Project '${project.projectTitle}' exported successfully!`, 'success');
            setIsProjectSelectModalOpen(false);
        };
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Export a Single Project</h3>
                    <Select value={selectedId} onChange={e => setSelectedId(e.target.value)} options={[{value: '', label: 'Select a project...'}, ...state.projects.map(p => ({value: p.id, label: p.projectTitle}))]}/>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsProjectSelectModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                        <button type="button" onClick={handleExportProject} disabled={!selectedId} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">Export Project</button>
                    </div>
                </div>
            </div>
        );
    };
    
    const handleSelectProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string) as ProjectExportFile;
                if (parsed.type !== `${APP_NAME}_PROJECT_EXPORT`) {
                    throw new Error('Invalid file type. This is not a valid project export file.');
                }
                if (parsed.appVersion !== CURRENT_APP_VERSION) {
                     throw new Error(`Version mismatch. File version: ${parsed.appVersion}, App version: ${CURRENT_APP_VERSION}.`);
                }
                setProjectFileToImport(parsed);
                setIsProjectImportModalOpen(true);
            } catch (error: any) {
                notify(error.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };

    const ProjectImportModal = () => {
        const { data } = projectFileToImport!;
        const existingMemberEmails = new Set(state.members.map(m => m.email.toLowerCase()));

        const analysis = {
            newMembers: data.members.filter(m => !existingMemberEmails.has(m.email.toLowerCase())),
            matchedMembers: data.members.filter(m => existingMemberEmails.has(m.email.toLowerCase())),
        };

        const confirmImportProject = () => {
            const remappedData = regenerateAllIds(data, state.members);
            dispatch({ type: 'ADD_PROJECT_DATA', payload: remappedData });
            notify(`Project '${data.project.projectTitle}' imported successfully!`, 'success');
            setIsProjectImportModalOpen(false);
            setProjectFileToImport(null);
        };
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Import Project</h3>
                    <p className="text-slate-600 mb-4">Ready to import <span className="font-semibold">{data.project.projectTitle}</span>. Here's how collaborators will be handled:</p>
                    
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {analysis.matchedMembers.length > 0 && <div>
                            <h4 className="font-semibold text-green-700">Matched Members (Existing)</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600">
                                {analysis.matchedMembers.map(m => <li key={m.id}>{m.firstName} {m.lastName} ({m.email})</li>)}
                            </ul>
                        </div>}
                        {analysis.newMembers.length > 0 && <div>
                            <h4 className="font-semibold text-blue-700">New Members (Will be created)</h4>
                             <ul className="list-disc list-inside text-sm text-slate-600">
                                {analysis.newMembers.map(m => <li key={m.id}>{m.firstName} {m.lastName} ({m.email})</li>)}
                            </ul>
                        </div>}
                    </div>

                    <p className="text-xs text-slate-500 mt-4">This action is non-destructive. The project will be added to your current workspace. Existing data will not be affected.</p>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsProjectImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                        <button type="button" onClick={confirmImportProject} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Confirm and Import</button>
                    </div>
                </div>
            </div>
        )
    };
    
    // The core logic for safe, non-destructive import
    const regenerateAllIds = (importData: ProjectExportData, existingMembers: Member[]): ProjectExportData => {
        const idMap = new Map<string, string>();
        const existingMemberMap = new Map(existingMembers.map(m => [m.email.toLowerCase(), m.id]));

        // Generate new IDs for members, or map to existing ones
        const remappedMembers = importData.members.map(member => {
            const existingId = existingMemberMap.get(member.email.toLowerCase());
            if (existingId) {
                idMap.set(member.id, existingId); // Map old ID to existing ID
                return null; // This member won't be added to the new members array
            } else {
                const newMemberId = newId('mem');
                idMap.set(member.id, newMemberId);
                return { ...member, id: newMemberId };
            }
        }).filter((m): m is Member => m !== null);
        
        // --- Project ---
        const oldProject = importData.project;
        const newProjectId = newId('proj');
        idMap.set(oldProject.id, newProjectId);
        
        const newProject = produce(oldProject, (draft) => {
            draft.id = newProjectId;
            // Remap collaborator IDs
            draft.collaboratorDetails = draft.collaboratorDetails.map(c => ({...c, memberId: idMap.get(c.memberId) || c.memberId }));
            // Remap budget item IDs
            Object.keys(draft.budget.revenues).forEach(cat => {
                const category = cat as keyof typeof draft.budget.revenues;
                if(Array.isArray(draft.budget.revenues[category])){
                    (draft.budget.revenues[category] as BudgetItem[]).forEach(item => {
                        const newBudgetItemId = newId('bud');
                        idMap.set(item.id, newBudgetItemId);
                        item.id = newBudgetItemId;
                    });
                }
            });
            Object.keys(draft.budget.expenses).forEach(cat => {
                const category = cat as keyof typeof draft.budget.expenses;
                draft.budget.expenses[category].forEach(item => {
                    const newBudgetItemId = newId('bud');
                    idMap.set(item.id, newBudgetItemId);
                    item.id = newBudgetItemId;
                });
            });
        });

        // --- Tasks ---
        const newTasks = importData.tasks.map(task => {
            const newTaskId = newId('task');
            idMap.set(task.id, newTaskId);
            return {
                ...task,
                id: newTaskId,
                projectId: idMap.get(task.projectId) || task.projectId,
                assignedMemberId: idMap.get(task.assignedMemberId) || task.assignedMemberId,
                budgetItemId: idMap.get(task.budgetItemId) || '', // set to empty if not found
            };
        });

        // --- Activities ---
        const newActivities = importData.activities.map(activity => {
            return {
                ...activity,
                id: newId('act'),
                taskId: idMap.get(activity.taskId) || activity.taskId,
                memberId: idMap.get(activity.memberId) || activity.memberId,
            };
        });
        
        // --- Direct Expenses ---
        const newDirectExpenses = importData.directExpenses.map(expense => {
            return {
                ...expense,
                id: newId('dexp'),
                projectId: idMap.get(expense.projectId) || expense.projectId,
                budgetItemId: idMap.get(expense.budgetItemId) || expense.budgetItemId,
            }
        });

        return {
            project: newProject,
            tasks: newTasks,
            activities: newActivities,
            directExpenses: newDirectExpenses,
            members: remappedMembers,
        };
    };

    // --- AI SETTINGS EXPORT/IMPORT ---

    const handleExportAiSettings = () => {
        const exportData: AiSettingsExportFile = {
            type: `${APP_NAME}_AI_SETTINGS_EXPORT`,
            appVersion: CURRENT_APP_VERSION,
            exportDate: new Date().toISOString(),
            data: state.settings.ai,
        };
        const fileName = `${APP_NAME.toLowerCase()}-ai-settings-export-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), fileName);
        notify('AI settings exported successfully!', 'success');
    };

    const handleSelectAiSettingsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string) as AiSettingsExportFile;
                if (parsed.type !== `${APP_NAME}_AI_SETTINGS_EXPORT`) {
                    throw new Error('Invalid file type. This is not an AI settings export file.');
                }
                if (parsed.appVersion !== CURRENT_APP_VERSION) {
                    throw new Error(`Version mismatch. File version: ${parsed.appVersion}, App version: ${CURRENT_APP_VERSION}.`);
                }
                setAiSettingsFileToImport(parsed);
                setIsAiSettingsModalOpen(true);
            } catch (error: any) {
                notify(error.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const confirmImportAiSettings = () => {
        if (!aiSettingsFileToImport) return;

        const newSettings = produce(state.settings, draft => {
            draft.ai = aiSettingsFileToImport.data;
        });

        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        notify('AI settings imported successfully!', 'success');
        setIsAiSettingsModalOpen(false);
        setAiSettingsFileToImport(null);
    };


    return (
        <>
            {isWorkspaceModalOpen && fileToImport && <ConfirmationModal 
                isOpen={true} 
                onClose={() => setIsWorkspaceModalOpen(false)}
                onConfirm={confirmImportWorkspace}
                title="Restore Workspace"
                message={<>Are you sure you want to restore this workspace? <strong className="font-bold text-red-700">This will permanently delete all current data in the application and replace it with the data from this file.</strong> This action cannot be undone.</>}
                confirmButtonText="Yes, Restore Workspace"
            />}
            {isProjectSelectModalOpen && <ProjectSelectModal />}
            {isProjectImportModalOpen && projectFileToImport && <ProjectImportModal />}
            {isAiSettingsModalOpen && aiSettingsFileToImport && (
                <ConfirmationModal 
                    isOpen={true} 
                    onClose={() => setIsAiSettingsModalOpen(false)}
                    onConfirm={confirmImportAiSettings}
                    title="Import AI Settings"
                    message={<>Are you sure you want to import these AI settings? <strong className="font-bold text-red-700">This will overwrite all your current AI settings.</strong></>}
                    confirmButtonText="Yes, Import Settings"
                />
            )}
            
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-12">
                {/* --- Project Import/Export --- */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Project Import / Export</h2>
                    <p className="text-sm text-slate-600 mb-6">Move individual projects between workspaces. Importing a project is non-destructive and will add it to your existing data.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={() => setIsProjectSelectModalOpen(true)} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors">
                            <i className="fa-solid fa-file-export text-4xl text-teal-600"></i>
                            <h3 className="mt-4 text-lg font-semibold text-slate-700">Export a Project</h3>
                            <p className="text-sm text-slate-500">Select a project to save as a self-contained `.json` file.</p>
                        </button>
                        <button onClick={() => projectImportInputRef.current?.click()} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                            <i className="fa-solid fa-file-import text-4xl text-blue-600"></i>
                             <h3 className="mt-4 text-lg font-semibold text-slate-700">Import a Project</h3>
                            <p className="text-sm text-slate-500">Load a project from a `.json` file into your workspace.</p>
                            <input type="file" accept=".json" ref={projectImportInputRef} onChange={handleSelectProjectFile} className="hidden" />
                        </button>
                    </div>
                </div>

                {/* --- AI Settings Import/Export --- */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">AI Settings Import / Export</h2>
                    <p className="text-sm text-slate-600 mb-6">Move your AI configurations between workspaces or save them as backups.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={handleExportAiSettings} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors">
                            <i className="fa-solid fa-cloud-arrow-down text-4xl text-teal-600"></i>
                            <h3 className="mt-4 text-lg font-semibold text-slate-700">Export AI Settings</h3>
                            <p className="text-sm text-slate-500">Save your AI instructions and preferences to a `.json` file.</p>
                        </button>
                        <button onClick={() => aiSettingsImportInputRef.current?.click()} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                            <i className="fa-solid fa-cloud-arrow-up text-4xl text-blue-600"></i>
                             <h3 className="mt-4 text-lg font-semibold text-slate-700">Import AI Settings</h3>
                            <p className="text-sm text-slate-500">Overwrite current AI settings with a `.json` file.</p>
                             <input type="file" accept=".json" ref={aiSettingsImportInputRef} onChange={handleSelectAiSettingsFile} className="hidden" />
                        </button>
                    </div>
                </div>


                {/* --- Workspace Backup/Restore --- */}
                 <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i>Workspace Backup & Restore</h2>
                    <p className="text-sm text-red-700 mb-6">Create a full backup of all your data, or restore your workspace from a backup file. <strong className="font-bold">Restoring is a destructive action.</strong></p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={handleExportWorkspace} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors">
                            <i className="fa-solid fa-download text-4xl text-teal-600"></i>
                            <h3 className="mt-4 text-lg font-semibold text-slate-700">Backup Workspace</h3>
                            <p className="text-sm text-slate-500">Save your entire application state to a `.json` file.</p>
                        </button>
                        <button onClick={() => workspaceImportInputRef.current?.click()} className="w-full text-center p-6 bg-white border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-100 transition-colors">
                            <i className="fa-solid fa-upload text-4xl text-red-600"></i>
                             <h3 className="mt-4 text-lg font-semibold text-slate-700">Restore from Backup</h3>
                            <p className="text-sm text-slate-500">Overwrite all current data with a backup file.</p>
                             <input type="file" accept=".json" ref={workspaceImportInputRef} onChange={handleSelectWorkspaceFile} className="hidden" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImportExportPage;