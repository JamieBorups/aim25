import React, { useState } from 'react';
import { SettingsCategory } from '../../types';
import GeneralSettings from './GeneralSettings';
import ProjectSettings from './ProjectSettings';
import MemberSettings from './MemberSettings';
import TaskSettings from './TaskSettings';
import AiSettings from './AiSettings';
import BudgetSettings from './BudgetSettings';

const SettingsManager: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');

    const menuItems: { id: SettingsCategory; label: string; icon: string; }[] = [
        { id: 'general', label: 'General', icon: 'fa-solid fa-sliders' },
        { id: 'projects', label: 'Projects', icon: 'fa-solid fa-briefcase' },
        { id: 'budget', label: 'Budget', icon: 'fa-solid fa-dollar-sign' },
        { id: 'members', label: 'Members', icon: 'fa-solid fa-users' },
        { id: 'tasks', label: 'Tasks', icon: 'fa-solid fa-list-check' },
        { id: 'ai', label: 'AI Settings', icon: 'fa-solid fa-wand-magic-sparkles' },
    ];
    
    const renderContent = () => {
        switch(activeCategory) {
            case 'general': return <GeneralSettings />;
            case 'projects': return <ProjectSettings />;
            case 'budget': return <BudgetSettings />;
            case 'members': return <MemberSettings />;
            case 'tasks': return <TaskSettings />;
            case 'ai': return <AiSettings />;
            default: return <GeneralSettings />;
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl">
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-10rem)]">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-slate-50 p-4 border-b md:border-b-0 md:border-r border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Settings</h2>
                    <nav className="flex flex-row md:flex-col gap-1">
                        {menuItems.map(item => (
                             <button
                                key={item.id}
                                onClick={() => setActiveCategory(item.id)}
                                className={`flex items-center w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                                    activeCategory === item.id 
                                    ? 'bg-teal-100 text-teal-800'
                                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                                }`}
                             >
                                <i className={`${item.icon} w-6 text-center mr-2`}></i>
                                <span>{item.label}</span>
                             </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 sm:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsManager;