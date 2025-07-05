import React from 'react';
import { AiPersonaName, AiPersonaSettings } from '../../../types';
import PersonaEditor from './PersonaEditor';
import { Select } from '../../ui/Select';
import { AI_PERSONA_TEMPLATES } from '../../../constants/aiPersonaTemplates';

interface ModuleAiTabProps {
  personaName: AiPersonaName;
  persona: AiPersonaSettings;
  onPersonaChange: (field: keyof AiPersonaSettings, value: any) => void;
  onLoadTemplate: (instructions: string) => void;
  onTestPersona: () => void;
}

const ModuleAiTab: React.FC<ModuleAiTabProps> = ({ personaName, persona, onPersonaChange, onLoadTemplate, onTestPersona }) => {
    
    const instructionsMap: Record<AiPersonaName, string> = {
        main: '', // Not used here
        projects: "Define how the AI should assist with project planning, description writing, and goal setting.",
        budget: "Define how the AI should assist with budget creation, analysis, and financial suggestions.",
        members: "Define how the AI should help write or refine artist biographies and profiles.",
        tasks: "Define how the AI should help break down large goals into smaller, manageable tasks.",
        reports: "Define how the AI should assist in summarizing data and writing formal report narratives.",
    };

  return (
    <div>
        <h3 className="text-lg font-bold text-slate-800">{personaName.charAt(0).toUpperCase() + personaName.slice(1)} Persona Settings</h3>
        <p className="text-sm text-slate-600 mb-4">{instructionsMap[personaName]}</p>
      
        <PersonaEditor persona={persona} onChange={onPersonaChange} />

        <div className="flex items-center gap-4 pt-4 mt-6 border-t border-slate-200">
            <Select 
                onChange={(e) => onLoadTemplate(e.target.value)}
                value={""}
                options={[
                    {value: "", label: "Load a template..."},
                    ...AI_PERSONA_TEMPLATES[personaName].map(t => ({ value: t.instructions, label: t.name }))
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

export default ModuleAiTab;
