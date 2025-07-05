import React from 'react';

const AiSettings: React.FC = () => {
    return (
        <div className="opacity-50">
            <h2 className="text-2xl font-bold text-slate-900">AI Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Configure AI-powered assistance features.</p>
            
             <div className="mt-8 p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-800">Coming Soon</h3>
                <p className="text-sm text-slate-500 mt-1">Configuration for enabling AI features, selecting models, and providing custom instructions will be available here in a future update.</p>
             </div>
        </div>
    );
};

export default AiSettings;