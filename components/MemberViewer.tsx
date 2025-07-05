

import React, { useMemo, useState } from 'react';
import { Member, Task, TaskStatus, Activity, WorkType, FormData as Project } from '../types';
import { useAppContext } from '../context/AppContext';

interface MemberViewerProps {
    member: Member;
    onBack: () => void;
}

// --- Helper Components & Types ---

type MemberViewTabId = 'profile' | 'activity';
type ActivityWithValue = Activity & { value: number; workType: WorkType };
type TaskWithDetails = Task & { activities: ActivityWithValue[]; loggedHours: number };
type ProjectWithDetails = {
    project: Project;
    role: string;
    tasks: TaskWithDetails[];
    completedTasks: number;
    totalPaidValue: number;
    totalInKindValue: number;
};

const ViewField: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode; className?: string }> = ({ label, value, children, className }) => (
    <div className={className}>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
        {value && <div className="mt-1 text-slate-900">{value}</div>}
        {children && <div className="mt-1 text-slate-900 prose prose-slate max-w-none prose-p:my-1 prose-ul:my-1 whitespace-pre-wrap">{children}</div>}
    </div>
);

const TaskStatusBadge: React.FC<{ status: TaskStatus | string }> = ({ status }) => {
    const statusMap: Record<string, string> = {
        'Backlog': "bg-slate-100 text-slate-800",
        'To Do': "bg-yellow-100 text-yellow-800",
        'In Progress': "bg-blue-100 text-blue-800",
        'Done': "bg-green-100 text-green-800",
    };
    return (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status] || statusMap['Backlog']}`}>
            {status}
        </span>
    );
};

const WorkTypeBadge: React.FC<{ type: WorkType }> = ({ type }) => {
    const typeMap: Record<WorkType, string> = {
        'Paid': "bg-blue-100 text-blue-800",
        'In-Kind': "bg-purple-100 text-purple-800",
        'Volunteer': "bg-orange-100 text-orange-800",
    };
     return (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${typeMap[type]}`}>
            {type}
        </span>
    );
};

const ProgressBar: React.FC<{ value: number; max: number; color?: string; height?: string }> = ({ value, max, color = 'bg-teal-500', height = 'h-2' }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className={`w-full bg-slate-200 rounded-full ${height}`}>
            <div className={`${color} ${height} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
const isTaskOverdue = (task: Task) => !task.isComplete && task.dueDate && new Date(task.dueDate) < new Date();


// --- Main Component ---

const MemberViewer: React.FC<MemberViewerProps> = ({ member, onBack }) => {
    const { state: { projects, tasks, activities } } = useAppContext();
    const [activeTab, setActiveTab] = useState<MemberViewTabId>('profile');
    const [openProjects, setOpenProjects] = useState<Set<string>>(new Set());

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);
    const taskMapForMember = useMemo(() => {
        const memberTasks = tasks.filter(t => t.assignedMemberId === member.id);
        return new Map(memberTasks.map(t => [t.id, t]));
    }, [tasks, member.id]);

    const contributionSnapshot = useMemo(() => {
        const approvedActivities = activities.filter(a => a.memberId === member.id && a.status === 'Approved');
        const totalHoursAllTime = approvedActivities.reduce((sum, a) => sum + (a.hours || 0), 0);

        const memberProjectIds = new Set(projects.filter(p => p.collaboratorDetails.some(c => c.memberId === member.id)).map(p => p.id));
        
        const totalOngoingProjects = projects.filter(p => ['Pending', 'Active', 'On Hold'].includes(p.status) && memberProjectIds.has(p.id)).length;
        const totalCompletedProjects = projects.filter(p => ['Completed', 'Terminated'].includes(p.status) && memberProjectIds.has(p.id)).length;
        
        const totalCompletedTasks = tasks.filter(t => t.assignedMemberId === member.id && t.status === 'Done').length;

        const hoursByProject = new Map<string, number>();
        approvedActivities.forEach(activity => {
            const task = taskMapForMember.get(activity.taskId);
            if(task) {
                const currentHours = hoursByProject.get(task.projectId) || 0;
                hoursByProject.set(task.projectId, currentHours + (activity.hours || 0));
            }
        });
        
        return {
            totalHoursAllTime,
            totalOngoingProjects,
            totalCompletedProjects,
            totalCompletedTasks,
            hoursByProject: Array.from(hoursByProject.entries()).map(([projectId, hours]) => ({
                projectId,
                projectName: projectMap.get(projectId) || 'Unknown Project',
                hours
            })).sort((a,b) => b.hours - a.hours)
        };
    }, [member.id, activities, projects, tasks, projectMap, taskMapForMember]);


    const toggleProject = (projectId: string) => {
        setOpenProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const projectsWithDetails = useMemo((): ProjectWithDetails[] => {
        return projects
            .filter(p => p.collaboratorDetails.some(c => c.memberId === member.id))
            .map(p => {
                const role = p.collaboratorDetails.find(c => c.memberId === member.id)?.role || '';
                
                const memberTasksForProject = Array.from(taskMapForMember.values()).filter(t => t.projectId === p.id);
                
                let totalPaidValue = 0;
                let totalInKindValue = 0;

                const tasksWithDetails: TaskWithDetails[] = memberTasksForProject.map(task => {
                    const approvedActivities = activities.filter(a => a.taskId === task.id && a.memberId === member.id && a.status === 'Approved');
                    
                    const activitiesWithValue: ActivityWithValue[] = approvedActivities.map(activity => {
                        const value = (activity.hours || 0) * (task.hourlyRate || 0);
                        if(task.workType === 'Paid') {
                            totalPaidValue += value;
                        } else {
                            totalInKindValue += value;
                        }
                        return { ...activity, value, workType: task.workType };
                    });

                    const loggedHours = activitiesWithValue.reduce((sum, a) => sum + (a.hours || 0), 0);
                    
                    return { ...task, activities: activitiesWithValue, loggedHours };
                });

                const completedTasks = tasksWithDetails.filter(t => t.status === 'Done').length;

                return {
                    project: p,
                    role,
                    tasks: tasksWithDetails,
                    completedTasks,
                    totalPaidValue,
                    totalInKindValue,
                };
            });
    }, [projects, taskMapForMember, activities, member.id]);

    const maxHoursForChart = Math.max(...contributionSnapshot.hoursByProject.map(p => p.hours), 1);

    const TABS: { id: MemberViewTabId, label: string, icon: string }[] = [
        { id: 'profile', label: 'Profile Information', icon: 'fa-solid fa-user' },
        { id: 'activity', label: 'Activity Report', icon: 'fa-solid fa-chart-line' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                const activeProjects = projectsWithDetails.filter(p => ['Pending', 'Active', 'On Hold'].includes(p.project.status));
                const completedProjects = projectsWithDetails.filter(p => ['Completed', 'Terminated'].includes(p.project.status));

                const renderProjectList = (projectList: ProjectWithDetails[]) => (
                    <div className="mt-2 space-y-3">
                        {projectList.map(details => {
                            const isExpanded = openProjects.has(details.project.id);
                            return (
                                <div key={details.project.id} className="bg-slate-50 border border-slate-200 rounded-lg">
                                    <button
                                        onClick={() => toggleProject(details.project.id)}
                                        className="w-full text-left p-3 flex flex-col gap-3 hover:bg-slate-100 rounded-t-lg transition-colors duration-150"
                                        aria-expanded={isExpanded}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-semibold text-slate-800">{details.project.projectTitle}</span>
                                                {details.role && <span className="text-slate-500 text-sm"> as {details.role}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-100 rounded-full">{details.tasks.length} Task{details.tasks.length !== 1 ? 's' : ''}</span>
                                                <i className={`fa-solid fa-chevron-down text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="bg-white p-2 rounded-md border border-slate-200">
                                                <div className="text-xs text-slate-500 font-semibold">Task Progress</div>
                                                <div className="text-sm font-bold text-slate-700 mt-1">{details.completedTasks} / {details.tasks.length} Done</div>
                                            </div>
                                            <div className="bg-white p-2 rounded-md border border-slate-200">
                                                <div className="text-xs text-slate-500 font-semibold">Total Paid</div>
                                                <div className="text-sm font-bold text-blue-600 mt-1">{formatCurrency(details.totalPaidValue)}</div>
                                            </div>
                                            <div className="bg-white p-2 rounded-md border border-slate-200">
                                                <div className="text-xs text-slate-500 font-semibold">In-Kind Value</div>
                                                <div className="text-sm font-bold text-purple-600 mt-1">{formatCurrency(details.totalInKindValue)}</div>
                                            </div>
                                        </div>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="border-t border-slate-200 bg-white p-3 space-y-3">
                                            {details.tasks.length > 0 ? details.tasks.map(task => (
                                                <div key={task.id} className="bg-white border border-slate-200 rounded-md p-3">
                                                    {/* Task Header */}
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-bold text-slate-800">{task.title}</h4>
                                                        <div className="flex-shrink-0 flex items-center gap-2">
                                                            <TaskStatusBadge status={task.status} />
                                                            <span className="font-mono text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{task.taskCode}</span>
                                                        </div>
                                                    </div>
                                                    <p className={`text-xs mt-1 ${isTaskOverdue(task) ? 'text-red-500 font-bold' : 'text-slate-500'}`}>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                                                    <p className="text-sm text-slate-600 my-2">{task.description}</p>
                                                    
                                                    {/* Hours Progress */}
                                                    {task.taskType === 'Time-Based' && (
                                                        <div className="my-3">
                                                            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                                                                <span>Hours Logged</span>
                                                                <span>{task.loggedHours.toFixed(1)} / {task.estimatedHours}h</span>
                                                            </div>
                                                            <ProgressBar value={task.loggedHours} max={task.estimatedHours} />
                                                        </div>
                                                    )}
                                                    
                                                    {/* Activity Log */}
                                                    {task.activities.length > 0 && (
                                                        <div className="mt-3">
                                                            <h5 className="text-xs font-semibold text-slate-500 mb-1">Approved Activity Logs:</h5>
                                                            <table className="min-w-full text-xs">
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {task.activities.map(activity => (
                                                                        <tr key={activity.id}>
                                                                            <td className="py-1.5 pr-2 w-full">{activity.description}</td>
                                                                            <td className="py-1.5 px-2 whitespace-nowrap">{new Date(activity.endDate).toLocaleDateString()}</td>
                                                                            <td className="py-1.5 px-2 whitespace-nowrap font-bold">{activity.hours}h</td>
                                                                            <td className="py-1.5 pl-2 text-right"><WorkTypeBadge type={activity.workType} /></td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            )) : <p className="text-slate-500 italic text-center py-4">No tasks assigned for this project.</p>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );

                return (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1 flex flex-col items-center">
                                <img className="h-48 w-48 rounded-full object-cover shadow-lg border-4 border-white" src={member.imageUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random&size=256`} alt={`Profile of ${member.firstName} ${member.lastName}`} />
                                <div className="mt-6 w-full space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <ViewField label="Email" value={<a href={`mailto:${member.email}`} className="text-teal-600 hover:underline break-all">{member.email}</a>} />
                                    <ViewField label="Location" value={`${member.city || 'N/A'}, ${member.province}`} />
                                    <ViewField label="Availability" value={member.availability || 'N/A'} />
                                    <ViewField label="Member ID" value={member.memberId || 'N/A'} />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6">
                                <ViewField label="Short Bio" children={<p>{member.shortBio || 'No short bio provided.'}</p>} />
                                <ViewField label="Full Artist Bio" children={<p>{member.artistBio || 'No full artist bio provided.'}</p>} />
                            </div>
                        </div>

                        <div className="mt-12 space-y-8">
                             <ViewField label="Active & Ongoing Projects">
                                {activeProjects.length > 0 ? (
                                    renderProjectList(activeProjects)
                                ) : (
                                    <p className="text-slate-500 italic mt-2">No active project assignments.</p>
                                )}
                            </ViewField>

                            <ViewField label="Completed Projects">
                                {completedProjects.length > 0 ? (
                                    renderProjectList(completedProjects)
                                ) : (
                                    <p className="text-slate-500 italic mt-2">No completed project assignments.</p>
                                )}
                            </ViewField>
                        </div>
                    </div>
                );
            case 'activity':
                 return (
                    <div className="space-y-8">
                    <ViewField label="Contribution Snapshot">
                        <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                            <div className="border-r border-slate-200 pr-4">
                                <p className="text-4xl font-extrabold text-red-600">{contributionSnapshot.totalHoursAllTime.toFixed(1)}</p>
                                <p className="text-sm font-semibold text-slate-600">Total Hours Logged</p>
                            </div>
                            <div className="border-r border-slate-200 pr-4">
                                <p className="text-4xl font-extrabold text-teal-600">{contributionSnapshot.totalOngoingProjects}</p>
                                <p className="text-sm font-semibold text-slate-600">Active &amp; Ongoing Projects</p>
                            </div>
                            <div className="border-r border-slate-200 pr-4">
                                <p className="text-4xl font-extrabold text-green-600">{contributionSnapshot.totalCompletedProjects}</p>
                                <p className="text-sm font-semibold text-slate-600">Completed Projects</p>
                            </div>
                            <div>
                                <p className="text-4xl font-extrabold text-blue-600">{contributionSnapshot.totalCompletedTasks}</p>
                                <p className="text-sm font-semibold text-slate-600">Completed Tasks</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-slate-600 mb-2">Hours by Project</h4>
                             <div className="space-y-2">
                                {contributionSnapshot.hoursByProject.map(p => (
                                    <div key={p.projectId}>
                                        <div className="flex justify-between text-xs font-medium mb-1">
                                            <span className="text-slate-700">{p.projectName}</span>
                                            <span className="text-slate-500">{p.hours.toFixed(1)}h</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(p.hours / maxHoursForChart) * 100}%`}}></div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </ViewField>
                </div>
                );
            default:
                return null;
        }
    };


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
            
            <div className="border-b border-slate-200 mb-8">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            type="button"
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md flex items-center gap-2 ${
                            activeTab === tab.id
                                ? 'border-teal-500 text-teal-600 bg-slate-100'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            <i className={`${tab.icon} ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`}></i>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default MemberViewer;