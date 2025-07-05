import React from 'react';
import { AiPersonaName, AiPersonaSettings } from '../../../types';
import FormField from '../../ui/FormField';
import ToggleSwitch from '../../ui/ToggleSwitch';
import PersonaEditor from './PersonaEditor';
import { Select } from '../../ui/Select';
import { AI_PERSONA_TEMPLATES } from '../../../constants/aiPersonaTemplates';


interface MainAiTabProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  plainTextMode: boolean;
  onPlainTextModeChange: (enabled: boolean) => void;
  persona: AiPersonaSettings;
  onPersonaChange: (field: keyof AiPersonaSettings, value: any) => void;
  onLoadTemplate: (instructions: string) => void;
  onTestPersona: () => void;
}

const MainAiTab: React.FC<MainAiTabProps> = ({ enabled, onEnabledChange, plainTextMode, onPlainTextModeChange, persona, onPersonaChange, onLoadTemplate, onTestPersona }) => {
  const isApiConfigured = true; // This will be true in a production environment with env vars.

  return (
    <div className="space-y-8">
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <FormField label="Master AI Switch" htmlFor="ai-enabled">
          <ToggleSwitch
            id="ai-enabled"
            label={enabled ? 'AI Features are Active' : 'AI Features are Inactive'}
            checked={enabled}
            onChange={onEnabledChange}
          />
          <p className="text-xs text-slate-500 mt-2">This switch globally enables or disables all AI-powered features.</p>
        </FormField>
         <FormField label="Plain Text Mode" htmlFor="plain-text-mode">
          <ToggleSwitch
            id="plain-text-mode"
            label={plainTextMode ? 'Plain Text Mode is On' : 'Plain Text Mode is Off'}
            checked={plainTextMode}
            onChange={onPlainTextModeChange}
          />
          <p className="text-xs text-slate-500 mt-2">Force AI responses to plain text, removing markdown (bold, lists, etc.) for easy copy-pasting.</p>
        </FormField>
      </div>

      <FormField label="API Key Status" htmlFor="api-status">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isApiConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`font-semibold ${isApiConfigured ? 'text-green-700' : 'text-red-700'}`}>
            {isApiConfigured ? 'API Key Configured & Ready' : 'API Key Not Configured'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">The API key is handled securely in the deployment environment and is not stored or displayed here.</p>
      </FormField>

      <hr className="my-6 border-slate-200" />
      
      <h3 className="text-lg font-bold text-slate-800">Main Persona Settings</h3>
      <p className="text-sm text-slate-600 -mt-6">This is the base persona that defines the AI's core personality and tone across the entire application.</p>

      <PersonaEditor persona={persona} onChange={onPersonaChange} />

       <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
            <Select 
                onChange={(e) => onLoadTemplate(e.target.value)}
                value={""}
                options={[
                    {value: "", label: "Load a template..."},
                    ...AI_PERSONA_TEMPLATES.main.map(t => ({ value: t.instructions, label: t.name }))
                ]}
                className="w-64"
            />
            <button
                type="button"
                onClick={onTestPersona}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <i className="fa-solid fa-flask-vial mr-2"></i>
                Test Persona
            </button>
        </div>

    </div>
  );
};

export default MainAiTab;