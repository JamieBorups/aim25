import React, { useMemo, useState } from 'react';
import { Task, FormData, Member, BudgetItem, TaskStatus, Activity } from '../../types';
import { EXPENSE_FIELDS } from '../../constants';
import { useAppContext } from '../../context/AppContext';

interface WorkplanViewProps {
  selectedProjectId: string;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
const sumAmounts = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
const getStatusBadge = (status: TaskStatus | string) => {
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap: Record<string, string> = {
        'Done': "bg-green-100 text-green-800",
        'In Progress': "bg-blue-100 text-blue-800",
        'To Do': "bg-yellow-100 text-yellow-800",
        'Backlog': "bg-slate-100 text-slate-800",
    };
    return `${baseClasses} ${statusMap[status] || statusMap['Backlog']}`;
}

const CategorySection: React.FC<{
    title: string;
    tasks: Task[];
    members: Member[];
    budgeted: number;
    allActivities: Activity[];
}> = ({ title, tasks, members, budgeted, allActivities }) => {
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

    const toggleTaskExpansion = (taskId: string) => {
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    // DEFINITIVE FIX: Re-engineered calculation to be robust and correct.
    const { actualPaid, contributedValue } = useMemo(() => {
        let paid = 0;
        let contributed = 0;
    
        // `tasks` is the array of tasks for this specific category
        tasks.forEach(task => { 
            if (task.taskType === 'Milestone') return;
            // Find all approved activities for this specific task
            const relatedActivities = allActivities.filter(a => a.taskId === task.id && a.status === 'Approved');
    
            // Calculate and accumulate the value for each individual activity
            relatedActivities.forEach(activity => {
                const value = (activity.hours || 0) * (task.hourlyRate || 0);
                if (task.workType === 'Paid') {
                    paid += value;
                } else { // 'In-Kind' or 'Volunteer'
                    contributed += value;
                }
            });
        });
    
        return { actualPaid: paid, contributedValue: contributed };
    }, [tasks, allActivities]);


    const variance = budgeted - actualPaid;

    const getActualHoursForTask = (taskId: string) => {
        return allActivities
            .filter(a => a.taskId === taskId && a.status === 'Approved')
            .reduce((sum, a) => sum + (a.hours || 0), 0);
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-4">
            <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
            <div className="grid grid-cols-4 gap-4 text-center my-4 border-y border-slate-200 py-3">
                <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Budgeted</div>
                    <div className="text-xl font-bold text-slate-700">{formatCurrency(budgeted)}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
                        <span>Actual Paid</span>
                        <div className="relative group">
                            <i className="fa-solid fa-circle-info text-slate-400 cursor-help"></i>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-700 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                Actuals include the value of 'Approved' time logs for tasks in this category. Direct expenses are not included in this workplan view.
                            </span>
                        </div>
                    </div>
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(actualPaid)}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Contributed</div>
                    <div className="text-xl font-bold text-teal-600">{formatCurrency(contributedValue)}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Variance</div>
                    <div className={`text-xl font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(variance)}</div>
                </div>
            </div>
            {tasks.length > 0 ? (
                 <table className="min-w-full mt-3">
                    <thead className="sr-only">
                        <tr><th>Task</th><th>Assignee</th><th>Status</th><th>Hours</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {tasks.map(task => {
                            const member = members.find(m => m.id === task.assignedMemberId);
                            const actualHours = getActualHoursForTask(task.id);
                            const approvedActivities = allActivities.filter(a => a.taskId === task.id && a.status === 'Approved');
                            const isExpanded = expandedTasks.has(task.id);
                            const isMilestone = task.taskType === 'Milestone';

                            return (
                                <React.Fragment key={task.id}>
                                    <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => toggleTaskExpansion(task.id)}>
                                        <td className="py-2.5 pr-2">
                                          <div className="flex items-center">
                                              <i className={`fa-solid fa-chevron-right text-xs text-slate-400 mr-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}></i>
                                              <div>
                                                  <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                                    <span className="font-mono text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{task.taskCode}</span>
                                                    <span>{task.title}</span>
                                                  </div>
                                                  <div className="text-xs text-slate-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div>
                                              </div>
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-2 text-sm text-slate-600 whitespace-nowrap">
                                            {member ? `${member.firstName} ${member.lastName}` : 'Unassigned'}
                                        </td>
                                        <td className="py-2.5 px-2 whitespace-nowrap">
                                            {isMilestone ? (
                                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${task.isComplete ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                                                    {task.isComplete ? 'Milestone Complete' : 'Milestone'}
                                                </span>
                                            ) : (
                                                <span className={getStatusBadge(task.status)}>{task.status}</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 pl-2 text-right text-sm text-slate-600 whitespace-nowrap">
                                            {!isMilestone && (
                                                <><span title="Actual Hours" className="font-bold">{actualHours}h</span> / <span title="Estimated Hours">{task.estimatedHours}h</span></>
                                            )}
                                        </td>
                                    </tr>
                                    {isExpanded && !isMilestone && approvedActivities.length > 0 && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={4} className="p-0">
                                                <div className="px-6 py-3">
                                                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 ml-4">Approved Activities</h5>
                                                    <table className="min-w-full">
                                                        <tbody className="divide-y divide-slate-200">
                                                            {approvedActivities.map(activity => {
                                                                const activityMember = members.find(m => m.id === activity.memberId);
                                                                return (
                                                                    <tr key={activity.id}>
                                                                        <td className="py-2 pl-6 pr-2 text-sm text-slate-600 w-1/3">{activity.description}</td>
                                                                        <td className="py-2 px-2 text-sm text-slate-500 w-1/4">{activityMember ? `${activityMember.firstName} ${activityMember.lastName}` : 'Unknown'}</td>
                                                                        <td className="py-2 px-2 text-sm text-slate-500 w-1/4">{new Date(activity.endDate).toLocaleDateString()}</td>
                                                                        <td className="py-2 pl-2 pr-6 text-sm text-slate-600 text-right font-medium w-auto">{activity.hours}h</td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {isExpanded && !isMilestone && approvedActivities.length === 0 && (
                                         <tr className="bg-slate-50">
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500 italic">
                                                No approved time has been logged for this task.
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            ) : <p className="text-sm text-slate-400 italic text-center py-2">No tasks in this category.</p>}
        </div>
    )
}


const WorkplanView: React.FC<WorkplanViewProps> = ({ selectedProjectId }) => {
    const { state: { tasks, projects, members, activities } } = useAppContext();
    
    const expenseCategories = Object.entries(EXPENSE_FIELDS).map(([key, fields]) => {
        const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return {
            key: key as keyof FormData['budget']['expenses'],
            label: title,
            fields: fields
        };
    });

    const projectsToDisplay = useMemo(() => {
        const projectsWithTasks = projects.filter(p => tasks.some(t => t.projectId === p.id));
        if (selectedProjectId) {
            return projectsWithTasks.filter(p => p.id === selectedProjectId);
        }
        return projectsWithTasks;
    }, [projects, tasks, selectedProjectId]);
    
    if (projectsToDisplay.length === 0) {
        return (
             <div className="text-center py-20">
                <i className="fa-solid fa-file-signature text-7xl text-slate-300"></i>
                <h3 className="mt-6 text-xl font-medium text-slate-800">
                    {selectedProjectId ? 'No Tasks for This Project' : 'No Projects with Tasks'}
                </h3>
                <p className="text-slate-500 mt-2 text-base">
                    {selectedProjectId ? 'Create a task for this project to see it in the report.' : 'Assign tasks to a project to see the workplan report.'}
                </p>
            </div>
        )
    }

  return (
    <div className="space-y-12">
        {projectsToDisplay.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const unassignedTasks = projectTasks.filter(t => !t.budgetItemId);

            return (
                <div key={project.id} className="bg-slate-50 p-4 sm:p-6 rounded-lg">
                    <h3 className="text-2xl font-bold text-teal-700 border-b-2 border-teal-200 pb-3">{project.projectTitle}</h3>

                    {expenseCategories.map(category => {
                        const categoryBudgetItemIds = new Set(project.budget.expenses[category.key].map(item => item.id));
                        const tasksForCategory = projectTasks.filter(task => task.taskType === 'Time-Based' && categoryBudgetItemIds.has(task.budgetItemId));
                        const budgetedAmount = sumAmounts(project.budget.expenses[category.key]);

                        if(tasksForCategory.length === 0 && budgetedAmount === 0) return null;

                        return (
                            <CategorySection
                                key={category.key}
                                title={`Expenses: ${category.label}`}
                                tasks={tasksForCategory}
                                members={members}
                                budgeted={budgetedAmount}
                                allActivities={activities}
                            />
                        )
                    })}

                    {unassignedTasks.length > 0 && (
                        <CategorySection
                            title="Uncategorized Tasks"
                            tasks={unassignedTasks}
                            members={members}
                            budgeted={0}
                            allActivities={activities}
                        />
                    )}
                </div>
            )
        })}
    </div>
  );
};

export default WorkplanView;