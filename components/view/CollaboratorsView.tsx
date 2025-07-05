import React from 'react';
import { FormData } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface CollaboratorsViewProps {
    project: FormData;
}

const ViewField: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
        {value && <div className="mt-1 text-slate-900">{value}</div>}
        {children && <div className="mt-1 text-slate-900">{children}</div>}
    </div>
);


const CollaboratorsView: React.FC<CollaboratorsViewProps> = ({ project }) => {
    const { state: { members } } = useAppContext();
    
    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">Collaborators</h2>

            <ViewField label="Project Team Description">
                <p className="whitespace-pre-wrap">{project.whoWillWork || 'N/A'}</p>
            </ViewField>

            <ViewField label="Selection Process">
                <p className="whitespace-pre-wrap">{project.howSelectionDetermined || 'N/A'}</p>
            </ViewField>

            {project.collaboratorDetails.length > 0 && (
                <ViewField label="Assigned Collaborators & Biographies">
                    <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 mt-2">
                        {project.collaboratorDetails.map(c => {
                             const member = members.find(m => m.id === c.memberId);
                             if (!member) return (
                                <li key={c.memberId} className="px-4 py-4">
                                    <span className="font-semibold">Unknown Member</span> - <span className="text-slate-600">{c.role}</span>
                                </li>
                             );

                             return (
                                <li key={c.memberId} className="px-4 py-4">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-semibold text-lg text-slate-800">{member.firstName} {member.lastName}</span>
                                        <span className="text-slate-500 text-sm">{c.role}</span>
                                    </div>
                                    {member.shortBio && (
                                        <div className="mt-3">
                                            <h4 className="text-xs font-semibold uppercase text-slate-400">Short Bio</h4>
                                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{member.shortBio}</p>
                                        </div>
                                    )}
                                    {member.artistBio && (
                                        <div className="mt-3">
                                            <h4 className="text-xs font-semibold uppercase text-slate-400">Full Artist Bio</h4>
                                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{member.artistBio}</p>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </ViewField>
            )}

        </section>
    );
};

export default CollaboratorsView;