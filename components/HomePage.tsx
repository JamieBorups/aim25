import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useBudgetCalculations } from '../hooks/useBudgetCalculations';
import { Activity, BudgetItem, DetailedBudget, Page, Task } from '../types';

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const MetricCard: React.FC<{ icon: string; value: number | string; label: string; color: string; }> = ({ icon, value, label, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4 border-l-4" style={{ borderLeftColor: color }}>
        <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <i className={`${icon} text-2xl`} style={{ color }}></i>
        </div>
        <div>
            <div className="text-3xl font-bold text-slate-800">{value}</div>
            <div className="text-sm font-medium text-slate-500">{label}</div>
        </div>
    </div>
);

const DashboardWidget: React.FC<{ title: string; icon: string; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = "" }) => (
    <div className={`bg-white shadow-lg rounded-xl p-6 ${className}`}>
        <h2 className="text-xl font-bold text-slate-800 mb-4 pb-3 border-b border-slate-200 flex items-center gap-3">
            <i className={`${icon} text-teal-600`}></i>
            <span>{title}</span>
        </h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

const WelcomeScreen: React.FC<HomePageProps> = ({ onNavigate }) => {
    return (
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <i className="fa-solid fa-rocket text-7xl text-teal-500"></i>
            <h1 className="mt-6 text-4xl font-bold text-slate-800">Welcome to The Arts Incubator!</h1>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">This tool is designed to help you manage your artistic projects from concept to completion. Ready to get started?</p>
            <div className="mt-8 flex justify-center items-center gap-4">
                <button
                    onClick={() => onNavigate('projects')}
                    className="px-6 py-3 text-lg font-semibold text-white bg-teal-600 border border-transparent rounded-md shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform hover:scale-105"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Create Your First Project
                </button>
                <button
                    onClick={() => onNavigate('detailedSampleData')}
                    className="px-6 py-3 text-lg font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-transform hover:scale-105"
                >
                    <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                    Explore with Sample Data
                </button>
            </div>
        </div>
    );
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const { projects, members, tasks, activities, directExpenses, approveActivity } = useAppContext();

    const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);
    const memberMap = useMemo(() => new Map(members.map(m => [m.id, { name: `${m.firstName} ${m.lastName}`, imageUrl: m.imageUrl }])), [members]);

    const dashboardData = useMemo(() => {
        const approvedActivities = activities.filter(a => a.status === 'Approved');
        const activeProjects = projects.filter(p => p.status === 'Active');
        const activeProjectIds = new Set(activeProjects.map(p => p.id));
        const activeTasks = tasks.filter(t => activeProjectIds.has(t.projectId));
        const activeTaskIds = new Set(activeTasks.map(t => t.id));

        // Key Metrics
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const tasksDueThisWeek = activeTasks.filter(task => {
            if (task.isComplete || !task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate >= now && dueDate <= oneWeekFromNow;
        });

        const pendingActivities = activities.filter(a => a.status === 'Pending' && activeTaskIds.has(a.taskId));

        // Financial Snapshot
        const sumAmounts = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const calculateProjectRevenue = (budget: DetailedBudget): number => {
            const { grants, tickets, sales, fundraising, contributions } = budget.revenues;
            const totalGrants = sumAmounts(grants);
            const projectedAudience = (tickets.numVenues || 0) * ((tickets.percentCapacity || 0) / 100) * (tickets.venueCapacity || 0);
            const totalTickets = projectedAudience * (tickets.avgTicketPrice || 0);
            const totalSales = sumAmounts(sales);
            const totalFundraising = sumAmounts(fundraising);
            const totalContributions = sumAmounts(contributions);
            return totalGrants + totalTickets + totalSales + totalFundraising + totalContributions;
        };
        
        const totalBudgetedRevenue = activeProjects.reduce((total, p) => total + calculateProjectRevenue(p.budget), 0);
        
        const totalActualPaidExpenses = approvedActivities
            .filter(a => activeTaskIds.has(a.taskId))
            .reduce((total, activity) => {
                const task = taskMap.get(activity.taskId);
                if (task && task.workType === 'Paid') {
                    return total + (activity.hours || 0) * (task.hourlyRate || 0);
                }
                return total;
            }, 0) + directExpenses.filter(e => activeProjectIds.has(e.projectId)).reduce((total, expense) => total + expense.amount, 0);

        // Hours Metrics
        const totalHoursAllTime = approvedActivities.reduce((sum, a) => sum + (a.hours || 0), 0);

        const hoursByMember = new Map<string, number>();
        approvedActivities.forEach(a => {
            hoursByMember.set(a.memberId, (hoursByMember.get(a.memberId) || 0) + (a.hours || 0));
        });

        const topContributors = Array.from(hoursByMember.entries())
            .map(([memberId, hours]) => ({ memberId, hours }))
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 5);


        return {
            activeProjectsCount: activeProjects.length,
            tasksDueThisWeek,
            pendingActivities,
            totalBudgetedRevenue,
            totalActualPaidExpenses,
            totalHoursAllTime,
            topContributors,
        };
    }, [projects, tasks, activities, directExpenses, taskMap]);

    if (projects.length === 0) {
        return <WelcomeScreen onNavigate={onNavigate} />;
    }
    
    const topContributorMaxHours = dashboardData.topContributors.length > 0 ? dashboardData.topContributors[0].hours : 1;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Global Dashboard</h1>
                <p className="text-slate-500 mt-1">A high-level overview of all collective activity.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <MetricCard icon="fa-solid fa-briefcase" value={dashboardData.activeProjectsCount} label="Active Projects" color="#14b8a6" />
                <MetricCard icon="fa-solid fa-clock-rotate-left" value={dashboardData.pendingActivities.length} label="Pending Approvals" color="#f97316" />
                <MetricCard icon="fa-solid fa-list-check" value={dashboardData.tasksDueThisWeek.length} label="Tasks Due This Week" color="#3b82f6" />
                <MetricCard icon="fa-solid fa-users" value={members.length} label="Collective Members" color="#8b5cf6" />
                <MetricCard icon="fa-solid fa-hourglass-half" value={dashboardData.totalHoursAllTime.toFixed(1)} label="Total Hours Logged" color="#ef4444" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                     <DashboardWidget title="Global Financial Snapshot (Active Projects)" icon="fa-solid fa-chart-pie">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-slate-100 p-4 rounded-lg">
                                <div className="text-sm text-slate-500 font-semibold">Total Budgeted Revenue</div>
                                <div className="text-2xl font-bold text-slate-800">{formatCurrency(dashboardData.totalBudgetedRevenue)}</div>
                            </div>
                             <div className="bg-slate-100 p-4 rounded-lg">
                                <div className="text-sm text-slate-500 font-semibold">Total Actual Expenses</div>
                                <div className="text-2xl font-bold text-slate-800">{formatCurrency(dashboardData.totalActualPaidExpenses)}</div>
                            </div>
                            <div className="bg-slate-200 p-4 rounded-lg">
                                <div className="text-sm text-slate-600 font-bold">Net Balance</div>
                                <div className={`text-2xl font-extrabold ${dashboardData.totalBudgetedRevenue - dashboardData.totalActualPaidExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(dashboardData.totalBudgetedRevenue - dashboardData.totalActualPaidExpenses)}
                                </div>
                            </div>
                        </div>
                    </DashboardWidget>
                    <DashboardWidget title="Pending Approvals" icon="fa-solid fa-clock-rotate-left">
                        {dashboardData.pendingActivities.length > 0 ? (
                            <ul className="divide-y divide-slate-200 -mx-6">
                                {dashboardData.pendingActivities.slice(0, 5).map(activity => {
                                    const task = taskMap.get(activity.taskId);
                                    return (
                                        <li key={activity.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50">
                                            <div>
                                                <div className="font-semibold text-slate-800">{task?.title || "Untitled Task"}</div>
                                                <div className="text-sm text-slate-500">
                                                    {memberMap.get(activity.memberId)?.name || "Unknown"} logged {activity.hours}h on {new Date(activity.endDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => approveActivity(activity.id)}
                                                className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-full shadow-sm hover:bg-green-700 transition-colors"
                                            >
                                                <i className="fa-solid fa-check mr-1"></i> Approve
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-center text-slate-500 py-4">No activities are pending approval. Great job!</p>
                        )}
                        {dashboardData.pendingActivities.length > 5 && <p className="text-center text-sm text-slate-500 mt-2">...and {dashboardData.pendingActivities.length - 5} more.</p>}
                    </DashboardWidget>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                    <DashboardWidget title="Upcoming Deadlines (Active Projects)" icon="fa-solid fa-calendar-check">
                         {dashboardData.tasksDueThisWeek.length > 0 ? (
                            <ul className="divide-y divide-slate-200 -mx-6">
                                {dashboardData.tasksDueThisWeek.map(task => (
                                    <li key={task.id} className="px-6 py-3">
                                        <div className="font-semibold text-slate-800">{task.title}</div>
                                        <div className="text-sm text-slate-500">
                                            <span className="font-medium text-teal-700">{projectMap.get(task.projectId)}</span>
                                            <span className="mx-1">|</span>
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">Assigned to: {memberMap.get(task.assignedMemberId)?.name || "Unassigned"}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-slate-500 py-4">No tasks are due in the next 7 days.</p>
                        )}
                    </DashboardWidget>
                     <DashboardWidget title="Top Contributors (by Hours)" icon="fa-solid fa-award">
                        {dashboardData.topContributors.length > 0 ? (
                            <ul className="space-y-4">
                                {dashboardData.topContributors.map(({ memberId, hours }) => {
                                    const member = memberMap.get(memberId);
                                    const percentage = (hours / topContributorMaxHours) * 100;
                                    return (
                                        <li key={memberId}>
                                            <div className="flex items-center gap-3">
                                                <img className="h-9 w-9 rounded-full object-cover" src={member?.imageUrl || `https://ui-avatars.com/api/?name=${member?.name}&background=random`} alt="" />
                                                <div className="flex-grow">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-semibold text-slate-800">{member?.name || 'Unknown Member'}</span>
                                                        <span className="font-bold text-slate-600">{hours.toFixed(1)}h</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-center text-slate-500 py-4">No approved hours have been logged yet.</p>
                        )}
                    </DashboardWidget>
                </div>
            </div>
        </div>
    );
};

export default HomePage;