

import React, { useState } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../../context/AppContext';
import { AppSettings, AiPersonaName, AiPersonaSettings } from '../../../types';
import { initialSettings } from '../../../context/AppContext';
import MainAiTab from './MainAiTab';
import ModuleAiTab from './ModuleAiTab';
import PersonaTestModal from './PersonaTestModal';
import ConfirmationModal from '../../ui/ConfirmationModal';

const AiSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<AppSettings['ai']>(state.settings.ai);
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState<AiPersonaName>('main');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [testModalContext, setTestModalContext] = useState<AiPersonaName | null>(null);

    const tabs: { id: AiPersonaName, label: string }[] = [
        { id: 'main', label: 'Main' },
        { id: 'projects', label: 'Projects' },
        { id: 'budget', label: 'Budget' },
        { id: 'members', label: 'Members' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'reports', label: 'Reports' },
    ];
    
    const handlePersonaChange = (personaName: AiPersonaName, field: keyof AiPersonaSettings, value: any) => {
        setSettings(prev => produce(prev, draft => {
            const persona = draft.personas[personaName];
            switch (field) {
                case 'instructions':
                    persona.instructions = value;
                    break;
                case 'model':
                    persona.model = value;
                    break;
                case 'temperature':
                    persona.temperature = value;
                    break;
            }
        }));
        setIsDirty(true);
    };

    const handleTemplateLoad = (personaName: AiPersonaName, instructions: string) => {
        setSettings(prev => produce(prev, draft => {
            draft.personas[personaName].instructions = instructions;
        }));
        setIsDirty(true);
        notify('Template loaded. Click "Save Changes" to apply.', 'info');
    };

    const handleSave = () => {
        const newSettings = produce(state.settings, draft => {
            draft.ai = settings;
        });
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        setIsDirty(false);
        notify('AI settings saved!', 'success');
    };

    const handleResetClick = () => {
        setIsResetModalOpen(true);
    };

    const confirmReset = () => {
        setSettings(initialSettings.ai);
        setIsDirty(true);
        setIsResetModalOpen(false);
        notify('AI settings have been reset to default. Click "Save Changes" to apply.', 'info');
    };

    const renderContent = () => {
        const persona = settings.personas[activeTab];
        
        if (activeTab === 'main') {
            return (
                <MainAiTab 
                    enabled={settings.enabled}
                    onEnabledChange={(value) => {
                        setSettings(prev => ({ ...prev, enabled: value }));
                        setIsDirty(true);
                    }}
                    plainTextMode={settings.plainTextMode}
                    onPlainTextModeChange={(value) => {
                        setSettings(prev => ({ ...prev, plainTextMode: value }));
                        setIsDirty(true);
                    }}
                    persona={persona}
                    onPersonaChange={(field, value) => handlePersonaChange('main', field, value)}
                    onLoadTemplate={(instructions) => handleTemplateLoad('main', instructions)}
                    onTestPersona={() => setTestModalContext('main')}
                />
            );
        }
        
        return (
            <ModuleAiTab
                personaName={activeTab}
                persona={persona}
                onPersonaChange={(field, value) => handlePersonaChange(activeTab, field, value)}
                onLoadTemplate={(instructions) => handleTemplateLoad(activeTab, instructions)}
                onTestPersona={() => setTestModalContext(activeTab)}
            />
        );
    };

    return (
        <div>
            {isResetModalOpen && (
                <ConfirmationModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirm={confirmReset}
                    title="Reset AI Settings"
                    message="Are you sure you want to reset all AI settings to their default values? This action cannot be undone."
                    confirmButtonText="Yes, Reset"
                />
            )}
            {testModalContext && (
                <PersonaTestModal
                    isOpen={true}
                    onClose={() => setTestModalContext(null)}
                    context={testModalContext}
                    settings={settings}
                />
            )}
            <h2 className="text-2xl font-bold text-slate-900">AI Personas & Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Configure the personality and behavior of specialized AI assistants for each part of the application.</p>
            
            <div className="mt-6 border-b border-slate-200">
              <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="mt-6">
                {renderContent()}
            </div>
            
            <div className="mt-8 pt-5 border-t border-slate-200 flex justify-between items-center">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
                 <button
                    type="button"
                    onClick={handleResetClick}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    );
};

export default AiSettings;