import React, { useState } from 'react';
import { produce } from 'https://esm.sh/immer';
import { useAppContext } from '../../context/AppContext';
import { AppSettings } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const GeneralSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<AppSettings['general']>(state.settings.general);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = <K extends keyof AppSettings['general']>(field: K, value: AppSettings['general'][K]) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = () => {
        const newSettings = produce(state.settings, draft => {
            draft.general = settings;
        });
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        setIsDirty(false);
        notify('General settings saved!', 'success');
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900">General Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Configure application-wide settings for your collective.</p>
            
            <div className="mt-8 space-y-6 max-w-2xl">
                <FormField label="Collective Name" htmlFor="collectiveName" instructions="This name will appear in the application header.">
                    <Input 
                        id="collectiveName" 
                        value={settings.collectiveName} 
                        onChange={e => handleChange('collectiveName', e.target.value)} 
                    />
                </FormField>

                <FormField label="Default Currency" htmlFor="defaultCurrency" instructions="Select the primary currency for budgeting and reporting.">
                    <Select 
                        id="defaultCurrency"
                        value={settings.defaultCurrency}
                        onChange={e => handleChange('defaultCurrency', e.target.value as AppSettings['general']['defaultCurrency'])}
                        options={[
                            { value: 'CAD', label: 'CAD - Canadian Dollar' },
                            { value: 'USD', label: 'USD - US Dollar' },
                            { value: 'EUR', label: 'EUR - Euro' },
                        ]}
                    />
                </FormField>

                <FormField label="Date Format" htmlFor="dateFormat" instructions="Choose how dates are displayed throughout the application.">
                    <Select 
                        id="dateFormat"
                        value={settings.dateFormat}
                        onChange={e => handleChange('dateFormat', e.target.value as AppSettings['general']['dateFormat'])}
                        options={[
                            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g., 2025-07-21)' },
                            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g., 07/21/2025)' },
                            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g., 21/07/2025)' },
                        ]}
                    />
                </FormField>
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

export default GeneralSettings;