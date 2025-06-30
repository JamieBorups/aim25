
import React, { useMemo } from 'react';
import { Member, FormData } from '../types';

interface MemberViewerProps {
    member: Member;
    projects: FormData[];
    onBack: () => void;
}

const ViewField: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode; className?: string }> = ({ label, value, children, className }) => (
    <div className={className}>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
        {value && <div className="mt-1 text-slate-900">{value}</div>}
        {children && <div className="mt-1 text-slate-900 prose prose-slate max-w-none">{children}</div>}
    </div>
);


const MemberViewer: React.FC<MemberViewerProps> = ({ member, projects, onBack }) => {

    const collaboratingProjects = useMemo(() => {
        return projects.filter(project => 
            project.collaboratorDetails.some(c => c.memberId === member.id)
        );
    }, [projects, member.id]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-5">
                <h1 className="text-3xl font-bold text-slate-900">{member.firstName} {member.lastName}</h1>
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                >
                    <i className="fa fa-arrow-left mr-2"></i>
                    Back to List
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                     <img className="h-48 w-48 rounded-full object-cover mx-auto shadow-lg border-4 border-white" src={member.imageUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random&size=256`} alt="" />
                     <div className="text-center mt-6 space-y-4 bg-slate-50 p-4 rounded-lg">
                        <ViewField label="Email" value={<a href={`mailto:${member.email}`} className="text-teal-600 hover:underline">{member.email}</a>} />
                        <ViewField label="Location" value={`${member.city}, ${member.province}`} />
                        <ViewField label="Availability" value={member.availability} />
                     </div>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <ViewField label="Short Bio">
                        <p className="whitespace-pre-wrap text-slate-700">{member.shortBio || 'N/A'}</p>
                    </ViewField>
                     <ViewField label="Full Artist Bio">
                        <p className="whitespace-pre-wrap text-slate-700">{member.artistBio || 'N/A'}</p>
                    </ViewField>

                     <ViewField label="Collaborating On">
                        {collaboratingProjects.length > 0 ? (
                            <ul className="mt-2 space-y-2">
                                {collaboratingProjects.map(p => {
                                    const role = p.collaboratorDetails.find(c => c.memberId === member.id)?.role;
                                    return (
                                        <li key={p.id} className="bg-slate-50 p-3 rounded-md border border-slate-200">
                                            <span className="font-semibold text-slate-800">{p.projectTitle}</span>
                                            {role && <span className="text-slate-500 text-sm"> as {role}</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-slate-500 italic">Not currently assigned to any projects.</p>
                        )}
                    </ViewField>
                </div>
            </div>

        </div>
    );
};

export default MemberViewer;
