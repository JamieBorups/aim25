import React from 'react';
import { AiPersonaSettings } from '../../../types';
import FormField from '../../ui/FormField';
import { Select } from '../../ui/Select';
import { TextareaWithCounter } from '../../ui/TextareaWithCounter';

interface PersonaEditorProps {
    persona: AiPersonaSettings;
    onChange: (field: keyof AiPersonaSettings, value: any) => void;
}

const PersonaEditor: React.FC<PersonaEditorProps> = ({ persona, onChange }) => {
    
    const modelOptions = [
        { value: 'gemini-2.5-flash-preview-04-17', label: 'Gemini 2.5 Flash (Fast & Cost-Effective)' },
        // Add other models here as they become available and relevant
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="AI Model" htmlFor="ai-model" instructions="Choose the underlying AI model for this persona.">
                    <Select 
                        id="ai-model"
                        value={persona.model}
                        onChange={(e) => onChange('model', e.target.value)}
                        options={modelOptions}
                    />
                </FormField>
                <FormField label="Creativity vs. Precision (Temperature)" htmlFor="ai-temp" instructions="Lower values are more precise and factual. Higher values are more creative and varied.">
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500">Precise</span>
                        <input
                            id="ai-temp"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={persona.temperature}
                            onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                         <span className="text-xs text-slate-500">Creative</span>
                    </div>
                     <div className="text-center font-semibold text-teal-700 mt-1">{persona.temperature.toFixed(1)}</div>
                </FormField>
            </div>
            <FormField label="Instructions" htmlFor="persona-instructions" instructions="Define the specific personality, role, and guidelines for this AI persona.">
                <TextareaWithCounter
                    id="persona-instructions"
                    rows={8}
                    wordLimit={750}
                    value={persona.instructions}
                    onChange={(e) => onChange('instructions', e.target.value)}
                />
            </FormField>
        </div>
    );
};

export default PersonaEditor;
