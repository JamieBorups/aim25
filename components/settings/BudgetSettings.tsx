import React, { useState } from 'react';
import { produce } from 'https://esm.sh/immer';
import { useAppContext } from '../../context/AppContext';
import { AppSettings } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { REVENUE_FIELDS, EXPENSE_FIELDS } from '../../constants';

const BudgetSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<AppSettings['budget']>(state.settings.budget);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (type: 'revenue' | 'expense', key: string, value: string) => {
        const labelsKey = type === 'revenue' ? 'revenueLabels' : 'expenseLabels';
        setSettings(prev => 
            produce(prev, draft => {
                draft[labelsKey][key] = value;
            })
        );
        setIsDirty(true);
    };

    const handleSave = () => {
        const newSettings = produce(state.settings, draft => {
            draft.budget = settings;
        });
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        setIsDirty(false);
        notify('Budget settings saved!', 'success');
    };

    const renderCategoryFields = (title: string, fields: { key: string; label: string }[], type: 'revenue' | 'expense') => (
        <div key={title}>
            <h4 className="text-md font-semibold text-slate-700 mt-4 mb-2">{title}</h4>
            <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                {fields.map(field => {
                    const labels = type === 'revenue' ? settings.revenueLabels : settings.expenseLabels;
                    const currentValue = labels[field.key];
                    const originalLabel = field.label;

                    return (
                        <div key={field.key}>
                            <label className="text-sm text-slate-500">{originalLabel}</label>
                            <Input
                                type="text"
                                placeholder={originalLabel}
                                value={currentValue === undefined ? '' : currentValue}
                                onChange={e => handleChange(type, field.key, e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Budget Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Customize the display names for budget revenue sources and expense types. Leave an input blank to use the default name.</p>
            
            <div className="mt-8 space-y-6">
                <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800">Revenue Source Customization</h3>
                    {Object.entries(REVENUE_FIELDS).map(([category, fields]) =>
                        renderCategoryFields(category.charAt(0).toUpperCase() + category.slice(1), fields, 'revenue')
                    )}
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800">Expense Type Customization</h3>
                     {Object.entries(EXPENSE_FIELDS).map(([category, fields]) =>
                        renderCategoryFields(category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), fields, 'expense')
                    )}
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

export default BudgetSettings;
