import React, { useState, useCallback } from 'react';
import { TABS } from '../constants';
import { FormData, TabId } from '../types';
import ProjectInformationTab from './tabs/ProjectInformationTab';
import CollaboratorsTab from './tabs/CollaboratorsTab';
import BudgetTab from './tabs/BudgetTab';
import { useAppContext } from '../context/AppContext';

interface ProjectEditorProps {
  project: FormData;
  onSave: (project: FormData) => void;
  onCancel: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onSave, onCancel }) => {
  const { state: { members } } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabId>(TABS[0].id);
  const [formData, setFormData] = useState<FormData>(project);

  const handleFormChange = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projectInfo':
        return <ProjectInformationTab formData={formData} onChange={handleFormChange} />;
      case 'collaborators':
        return <CollaboratorsTab formData={formData} onChange={handleFormChange} />;
      case 'budget':
        return <BudgetTab formData={formData} onChange={handleFormChange} />;
      default:
        return <ProjectInformationTab formData={formData} onChange={handleFormChange} />;
    }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{formData.projectTitle || "Edit Project"}</h1>
        </div>
        
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600 bg-slate-100'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="py-8 bg-slate-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8">
          {renderTabContent()}
        </div>
        
        <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-8">
          <button type='button' className='px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed' onClick={() => activeTab !== TABS[0].id && setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) - 1].id)} disabled={activeTab === TABS[0].id}> Back</button>
          
          <div className="flex items-center space-x-4">
              <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                  Cancel
              </button>
              <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                  Save Project
              </button>
          </div>

          <button type='button' className='px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed' onClick={() => activeTab !== TABS[TABS.length-1].id && setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)} disabled={activeTab === TABS[TABS.length - 1].id}>Next </button>
        </div>
      </div>
    </form>
  );
};

export default ProjectEditor;