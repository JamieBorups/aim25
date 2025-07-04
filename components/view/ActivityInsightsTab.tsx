import React, { useMemo, useState } from 'react';
import { FormData, Activity, DirectExpense, DateRangeFilter, Member, Task } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Select } from '../ui/Select';
import { DATE_RANGE_FILTER_OPTIONS } from '../../constants';

interface ActivityInsightsTabProps {
    project: FormData;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const StatCard: React.FC<{ icon: string; value: number | string; label: string; color: string }> = ({ icon, value, label, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 border-l-4" style={{ borderLeftColor: color }}>
        <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <i className={`${icon} text-xl`} style={{ color }}></i>
        </div>
        <div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-sm font-medium text-slate-500">{label}</div>
        </div>
    </div>
);

const ProgressBar: React.FC<{ value: number; max: number; color?: string; height?: string }> = ({ value, max, color = 'bg-teal-500', height = 'h-2' }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className={`w-full bg-slate-200 rounded-full ${height}`}>
            <div className={`${color} ${height} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const ActivityInsightsTab: React.FC<ActivityInsightsTabProps> = ({ project }) => {
    const { activities, directExpenses, members, tasks } = useAppContext();
    const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
    
    const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members]);
    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id), [tasks, project.id]);
    const taskMap = useMemo(() => new Map(projectTasks.map(t => [t.id, t])), [projectTasks]);

    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        switch (dateRange) {
            case 'last7days':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                break;
            case 'last30days':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
                break;
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'all':
            default:
                startDate = new Date(0); // A very old date to include everything
                break;
        }
        startDate.setHours(0,0,0,0);

        const projectTaskIds = new Set(projectTasks.map(t => t.id));

        const filteredActivities = activities.filter(a => {
            if (!projectTaskIds.has(a.taskId)) return false;
            const activityDate = new Date(a.endDate);
            return activityDate >= startDate;
        });

        const filteredExpenses = directExpenses.filter(e => {
            if (e.projectId !== project.id) return false;
            const expenseDate = new Date(e.date);
            return expenseDate >= startDate;
        });

        return { filteredActivities, filteredExpenses };

    }, [dateRange, activities, directExpenses, projectTasks, project.id]);

    const stats = useMemo(() => {
        let totalHours = 0;
        let totalPaidExpenses = 0;
        const activeMemberIds = new Set<string>();

        filteredData.filteredActivities.forEach(a => {
            if (a.status !== 'Approved') return;
            
            const task = taskMap.get(a.taskId);
            if (!task) return;
            
            totalHours += a.hours;
            activeMemberIds.add(a.memberId);
            
            if (task.workType === 'Paid') {
                totalPaidExpenses += a.hours * task.hourlyRate;
            }
        });

        filteredData.filteredExpenses.forEach(e => {
            totalPaidExpenses += e.amount;
        });
        
        return {
            totalHours,
            totalPaidExpenses,
            activeMembersCount: activeMemberIds.size
        };
    }, [filteredData, taskMap]);

    const contributorStats = useMemo(() => {
        return project.collaboratorDetails.map(collaborator => {
            const member = memberMap.get(collaborator.memberId);
            if (!member) return null;

            const memberTasks = projectTasks.filter(t => t.assignedMemberId === collaborator.memberId);
            const memberTaskIds = new Set(memberTasks.map(t => t.id));

            const totalEstimatedHours = memberTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

            let totalLoggedHours = 0;
            let paidHours = 0;
            let inKindHours = 0;

            const memberActivities = filteredData.filteredActivities.filter(a =>
                a.memberId === collaborator.memberId &&
                memberTaskIds.has(a.taskId) &&
                a.status === 'Approved'
            );

            memberActivities.forEach(activity => {
                const task = taskMap.get(activity.taskId);
                if (!task) return;

                totalLoggedHours += activity.hours;
                if (task.workType === 'Paid') {
                    paidHours += activity.hours;
                } else {
                    inKindHours += activity.hours;
                }
            });

            return {
                memberId: collaborator.memberId,
                name: `${member.firstName} ${member.lastName}`,
                imageUrl: member.imageUrl,
                totalLoggedHours,
                paidHours,
                inKindHours,
                totalEstimatedHours,
            };
        }).filter((c): c is NonNullable<typeof c> => c !== null);
    }, [project.collaboratorDetails, projectTasks, filteredData.filteredActivities, memberMap, taskMap]);

    const combinedFeed = useMemo(() => {
        const activityFeed = filteredData.filteredActivities
            .filter(a => a.status === 'Approved')
            .map(a => ({
                type: 'activity' as const,
                date: new Date(a.endDate),
                item: a
            }));

        const expenseFeed = filteredData.filteredExpenses.map(e => ({
            type: 'expense' as const,
            date: new Date(e.date),
            item: e
        }));

        return [...activityFeed, ...expenseFeed].sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [filteredData]);
    
    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Activity & Insights</h2>
                <div className="w-56">
                    <Select options={DATE_RANGE_FILTER_OPTIONS} value={dateRange} onChange={e => setDateRange(e.target.value as DateRangeFilter)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard icon="fa-solid fa-clock" value={stats.totalHours.toFixed(1) + 'h'} label="Hours Logged" color="#14b8a6" />
                <StatCard icon="fa-solid fa-hand-holding-dollar" value={formatCurrency(stats.totalPaidExpenses)} label="Paid Expenses" color="#3b82f6" />
                <StatCard icon="fa-solid fa-users" value={stats.activeMembersCount} label="Active Members" color="#8b5cf6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Left Column: Activity Feed */}
                <div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-4">Detailed Activity Feed</h3>
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm max-h-[600px] overflow-y-auto">
                        {combinedFeed.length === 0 ? (
                            <p className="text-center text-slate-500 py-12 italic">No approved activities or expenses in this period.</p>
                        ) : (
                            <ul className="divide-y divide-slate-200">
                            {combinedFeed.map((feedItem, index) => (
                                <li key={index} className="p-4 flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 text-center">
                                        <div className="text-lg font-bold text-slate-700">{feedItem.date.toLocaleDateString(undefined, { day: 'numeric'})}</div>
                                        <div className="text-xs text-slate-500 uppercase">{feedItem.date.toLocaleDateString(undefined, { month: 'short'})}</div>
                                    </div>
                                    <div className="flex-grow border-l border-slate-200 pl-4">
                                        {feedItem.type === 'activity' ? (() => {
                                            const task = taskMap.get(feedItem.item.taskId);
                                            const isPaid = task?.workType === 'Paid';
                                            const cost = isPaid ? feedItem.item.hours * (task?.hourlyRate || 0) : 0;
                                            return (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-semibold text-slate-800">{task?.title}</p>
                                                        <span className="text-lg font-bold text-teal-600">
                                                            {feedItem.item.hours}h
                                                            {isPaid && cost > 0 && <span className="text-sm font-normal text-slate-500 ml-2">({formatCurrency(cost)})</span>}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{feedItem.item.description}</p>
                                                    <p className="text-xs text-slate-400 mt-1">Logged by: {memberMap.get(feedItem.item.memberId)?.firstName}</p>
                                                </>
                                            )
                                        })() : (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-semibold text-slate-800">Direct Expense</p>
                                                        <span className="text-lg font-bold text-blue-600">{formatCurrency(feedItem.item.amount)}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{feedItem.item.description}</p>
                                                </>
                                        )}
                                    </div>
                                </li>
                            ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Column: Contributor Breakdown */}
                <div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-4">Contributor Breakdown</h3>
                     <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
                        {contributorStats.length === 0 ? (
                             <p className="text-center text-slate-500 py-12 italic">No collaborators found for this project.</p>
                        ) : (
                            contributorStats.map(stat => (
                                <div key={stat.memberId} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img className="h-10 w-10 rounded-full object-cover" src={stat.imageUrl || `https://ui-avatars.com/api/?name=${stat.name}&background=random`} alt="" />
                                        <div>
                                            <p className="font-bold text-slate-800">{stat.name}</p>
                                            <p className="text-xs text-slate-500 font-semibold">{stat.totalLoggedHours.toFixed(1)} Total Hours Logged</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-center text-xs mb-3">
                                        <div className="bg-blue-100 text-blue-800 p-1.5 rounded">
                                            <div className="font-bold">{stat.paidHours.toFixed(1)}h</div>
                                            <div>Paid</div>
                                        </div>
                                        <div className="bg-purple-100 text-purple-800 p-1.5 rounded">
                                            <div className="font-bold">{stat.inKindHours.toFixed(1)}h</div>
                                            <div>In-Kind</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                                            <span>Effort vs Estimate</span>
                                            <span>{stat.totalLoggedHours.toFixed(1)}h / {stat.totalEstimatedHours.toFixed(1)}h</span>
                                        </div>
                                        <ProgressBar value={stat.totalLoggedHours} max={stat.totalEstimatedHours} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ActivityInsightsTab;