
import React, { useState } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { AppSettings, CustomStatus } from '../../types';
import ListEditor from '../ui/ListEditor';

const ProjectSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<AppSettings['projects']>(state.settings.projects);
    const [isDirty, setIsDirty] = useState(false);

    const handleStatusesChange = (newStatuses: CustomStatus[]) => {
        setSettings(prev => ({ ...prev, statuses: newStatuses }));
        setIsDirty(true);
    };

    const handleSave = () => {
        const newSettings = produce(state.settings, draft => {
            draft.projects = settings;
        });
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        setIsDirty(false);
        notify('Project settings saved!', 'success');
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Project Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Customize options related to project management.</p>
            
            <div className="mt-8 space-y-8">
                 <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800">Custom Project Statuses</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Define the workflow stages for your projects. These will appear in the 'Project Status' dropdowns.</p>
                    <ListEditor 
                        items={settings.statuses}
                        onChange={handleStatusesChange}
                        itemLabel="Status"
                        withColor={true}
                    />
                 </div>

                 <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 opacity-60">
                    <h3 className="text-lg font-semibold text-slate-800">Custom Disciplines & Genres (Coming Soon)</h3>
                    <p className="text-sm text-slate-500 mt-1">Define your own artistic disciplines and genres to replace the hardcoded options.</p>
                 </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-200">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ProjectSettings;