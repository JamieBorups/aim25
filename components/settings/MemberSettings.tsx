import React from 'react';

const MemberSettings: React.FC = () => {
    return (
        <div className="opacity-50">
            <h2 className="text-2xl font-bold text-slate-900">Member Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Customize options for your collective's members.</p>
            
             <div className="mt-8 p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-800">Coming Soon</h3>
                <p className="text-sm text-slate-500 mt-1">Configuration for custom member roles and availability options will be available here in a future update.</p>
             </div>
        </div>
    );
};

export default MemberSettings;