
import React, { useState, useMemo } from 'react';
import { FormData, Task, Activity, TaskStatus, ActivityStatus, TaskSortOption, SortDirection, TaskStatusFilter } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { initialTaskData, initialActivityData, TASK_SORT_OPTIONS, TASK_STATUS_FILTER_OPTIONS } from '../../constants';
import TaskEditor from '../task/TaskEditor';
import ActivityEditor from '../task/ActivityEditor';
import ConfirmationModal from '../ui/ConfirmationModal';
import { Select } from '../ui/Select';

const getTaskStatusBadge = (status: TaskStatus) => {
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap = {
        'Done': "bg-green-100 text-green-800",
        'In Progress': "bg-blue-100 text-blue-800",
        'To Do': "bg-yellow-100 text-yellow-800",
        'Backlog': "bg-slate-100 text-slate-800",
    };
    return `${baseClasses} ${statusMap[status] || statusMap['Backlog']}`;
};

const getActivityStatusBadge = (status: ActivityStatus) => {
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap = {
        'Approved': "bg-green-100 text-green-800",
        'Pending': "bg-yellow-100 text-yellow-800",
    };
    return `${baseClasses} ${statusMap[status]}`;
}

const isTaskOverdue = (task: Task) => !task.isComplete && task.dueDate && new Date(task.dueDate) < new Date();

const WorkplanTab: React.FC<{ project: FormData }> = ({ project }) => {
    const { state, dispatch, notify } = useAppContext();
    const { tasks, activities, members } = state;

    const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [isActivityEditorOpen, setIsActivityEditorOpen] = useState(false);
    const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'task' | 'activity' } | null>(null);
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
    const [sortOption, setSortOption] = useState<TaskSortOption>('updatedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [filterStatus, setFilterStatus] = useState<TaskStatusFilter>('all');
    
    const memberMap = useMemo(() => new Map(members.map(m => [m.id, `${m.firstName} ${m.lastName}`])), [members]);

    const projectTasks = useMemo(() => {
        let filtered = tasks.filter(t => t.projectId === project.id);
        
        // Apply status filter
        if (filterStatus !== 'all') {
            const now = new Date();
            const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(task => {
                if (filterStatus === 'overdue') return isTaskOverdue(task);
                if (filterStatus === 'dueThisWeek') return task.dueDate && new Date(task.dueDate) >= now && new Date(task.dueDate) <= oneWeekFromNow;
                if (filterStatus === 'todo') return task.status === 'To Do';
                if (filterStatus === 'inProgress') return task.status === 'In Progress';
                if (filterStatus === 'done') return task.status === 'Done';
                return true;
            });
        }
        
        return filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortOption) {
                case 'dueDate':
                    comparison = (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity);
                    break;
                case 'assignee':
                    comparison = (memberMap.get(a.assignedMemberId) || 'Z').localeCompare(memberMap.get(b.assignedMemberId) || 'Z');
                    break;
                case 'updatedAt':
                default:
                    comparison = (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

    }, [tasks, project.id, sortOption, sortDirection, filterStatus, memberMap]);

    const projectTaskIds = useMemo(() => new Set(projectTasks.map(t => t.id)), [projectTasks]);
    const projectActivities = useMemo(() => activities.filter(a => projectTaskIds.has(a.taskId)), [activities, projectTaskIds]);

    const activitiesByTask = useMemo(() => {
        const map = new Map<string, Activity[]>();
        projectActivities.forEach(a => {
            const taskActivities = map.get(a.taskId) || [];
            taskActivities.push(a);
            map.set(a.taskId, taskActivities);
        });
        return map;
    }, [projectActivities]);
    
    const toggleTaskExpansion = (taskId: string) => {
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) newSet.delete(taskId);
            else newSet.add(taskId);
            return newSet;
        });
    };

    // --- Task Handlers ---
    const handleAddTask = () => {
        const prefix = (project.projectTitle.match(/\b(\w)/g) || ['T']).join('').toUpperCase().substring(0, 4);
        const tasksForProject = tasks.filter(t => t.projectId === project.id && t.taskCode.startsWith(prefix));
        let maxNum = 0;
        tasksForProject.forEach(t => {
            const numPart = t.taskCode.split('-')[1];
            if (numPart) {
                const num = parseInt(numPart, 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });
        const taskCode = `${prefix}-${maxNum + 1}`;
        
        const newTask: Task = { ...initialTaskData, id: `task_${Date.now()}`, projectId: project.id, taskCode };
        setCurrentTask(newTask);
        setIsTaskEditorOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setCurrentTask(task);
        setIsTaskEditorOpen(true);
    };

    const handleSaveTask = (taskToSave: Task) => {
        const isNew = !tasks.find(t => t.id === taskToSave.id);
        const now = new Date().toISOString();
        const finalTask = { ...taskToSave, updatedAt: now };

        dispatch({ type: isNew ? 'ADD_TASK' : 'UPDATE_TASK', payload: finalTask });
        notify(isNew ? 'Task created!' : 'Task updated!', 'success');
        setIsTaskEditorOpen(false);
        setCurrentTask(null);
    };

    const handleToggleTaskComplete = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const updatedTask = { ...task, isComplete: !task.isComplete, status: (!task.isComplete ? 'Done' : 'To Do') as TaskStatus, updatedAt: new Date().toISOString() };
            dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
            notify(task.isComplete ? `Task '${task.title}' marked as incomplete.` : `Task '${task.title}' marked as complete.`, 'success');
        }
      };

    // --- Activity Handlers ---
    const handleAddActivityForTask = (taskId: string) => {
        const newActivity: Activity = { ...initialActivityData, taskId };
        setCurrentActivity(newActivity);
        setIsActivityEditorOpen(true);
    };

    const handleEditActivity = (activity: Activity) => {
        setCurrentActivity(activity);
        setIsActivityEditorOpen(true);
    };

    const handleSaveActivity = (activityToSave: Activity & { memberIds?: string[] }) => {
        const now = new Date().toISOString();
        const isEditing = activityToSave.id && activityToSave.createdAt;
    
        if (isEditing) {
            const { memberIds, ...baseActivity } = activityToSave;
            const updatedActivity = { ...baseActivity, updatedAt: now };
            dispatch({ type: 'UPDATE_ACTIVITY', payload: updatedActivity });
            notify('Activity updated!', 'success');
        } else if (activityToSave.memberIds && activityToSave.memberIds.length > 0) {
            const { memberIds, ...baseActivityData } = activityToSave;
            const newActivities = memberIds.map(memberId => ({
                ...baseActivityData,
                id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                memberId: memberId,
                status: 'Pending' as ActivityStatus,
                createdAt: now,
                updatedAt: now,
            }));
            dispatch({ type: 'ADD_ACTIVITIES', payload: newActivities });
            notify(`${newActivities.length} new activity log(s) created!`, 'success');
        }
    
        setIsActivityEditorOpen(false);
        setCurrentActivity(null);
    };

    const handleApproveActivity = (activityId: string) => {
        dispatch({ type: 'APPROVE_ACTIVITY', payload: activityId });
        notify('Activity approved.', 'success');
    };
    
    // --- Delete Handlers ---
    const requestDelete = (id: string, type: 'task' | 'activity') => {
        setItemToDelete({ id, type });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'task') {
            dispatch({ type: 'DELETE_TASK', payload: itemToDelete.id });
            notify('Task and related activities deleted.', 'success');
        } else {
            dispatch({ type: 'DELETE_ACTIVITY', payload: itemToDelete.id });
            notify('Activity deleted.', 'success');
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const getMemberName = (id: string) => {
        const member = members.find(m => m.id === id);
        return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
    }

    const deleteModalMessage = useMemo(() => {
        if (!itemToDelete) return '';
        if (itemToDelete.type === 'task') {
            return 'Are you sure you want to delete this task? All associated time logs will also be permanently deleted. This cannot be undone.';
        }
        return 'Are you sure you want to delete this activity log?';
    }, [itemToDelete]);

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Project Workplan</h3>
                <div className="flex items-center gap-4">
                     <div className="w-48">
                         <Select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as TaskStatusFilter)}
                            options={TASK_STATUS_FILTER_OPTIONS}
                        />
                    </div>
                     <div className="flex items-center">
                        <Select
                            className="rounded-r-none"
                            value={sortOption}
                            onChange={e => setSortOption(e.target.value as TaskSortOption)}
                            options={TASK_SORT_OPTIONS}
                        />
                        <button
                            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 bg-slate-200 text-slate-600 rounded-r-md border-y border-r border-slate-400 hover:bg-slate-300 h-full"
                            title={`Sort direction: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
                        >
                            <i className={`fa-solid ${sortDirection === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                        </button>
                    </div>
                    <button onClick={handleAddTask} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <i className="fa-solid fa-plus mr-2"></i>Add Task
                    </button>
                </div>
            </div>

            {projectTasks.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-lg">
                    <i className="fa-solid fa-list-check text-6xl text-slate-300"></i>
                    <h3 className="mt-4 text-lg font-medium text-slate-800">No tasks for this project yet.</h3>
                    <p className="text-slate-500 mt-1">Click "Add Task" to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {projectTasks.map(task => {
                        const taskActivities = activitiesByTask.get(task.id) || [];
                        const isExpanded = expandedTasks.has(task.id);
                        const isMilestone = task.taskType === 'Milestone';
                        const overdue = isTaskOverdue(task);

                        return (
                            <div key={task.id} className={`bg-slate-50 rounded-lg border transition-shadow hover:shadow-md ${overdue ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                                <div className="flex items-center p-3">
                                    <button onClick={() => toggleTaskExpansion(task.id)} className="p-2 rounded-full hover:bg-slate-200">
                                        <i className={`fa-solid fa-chevron-right text-xs text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}></i>
                                    </button>
                                    <div className="flex-grow mx-3">
                                        <p className="font-semibold text-slate-800">{task.title}</p>
                                        <p className="text-sm text-slate-500">
                                            <span className="font-mono text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded mr-2">{task.taskCode}</span>
                                            {getMemberName(task.assignedMemberId)}
                                            {overdue && <span className="ml-2 text-red-600 font-bold text-xs">OVERDUE</span>}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">
                                        {isMilestone ? (
                                            <div className="flex items-center mr-4">
                                                <input 
                                                    type="checkbox"
                                                    id={`hub-complete-${task.id}`}
                                                    checked={task.isComplete}
                                                    onChange={() => handleToggleTaskComplete(task.id)}
                                                    className="h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                                                />
                                                <label htmlFor={`hub-complete-${task.id}`} className="ml-2 text-sm font-medium text-slate-700 cursor-pointer">{task.isComplete ? 'Complete' : 'Incomplete'}</label>
                                            </div>
                                        ) : (
                                            <span className={getTaskStatusBadge(task.status)}>{task.status}</span>
                                        )}
                                        <button onClick={() => handleAddActivityForTask(task.id)} className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">Log Time</button>
                                        <button onClick={() => handleEditTask(task)} className="p-2 text-slate-500 hover:text-teal-600"><i className="fa-solid fa-pencil"></i></button>
                                        <button onClick={() => requestDelete(task.id, 'task')} className="p-2 text-slate-500 hover:text-red-600"><i className="fa-solid fa-trash-alt"></i></button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-slate-200 bg-white">
                                        {taskActivities.length > 0 ? (
                                            <table className="min-w-full text-sm">
                                                <thead className="sr-only"><tr><th>Description</th><th>Member</th><th>Date</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {taskActivities.map(activity => (
                                                        <tr key={activity.id}>
                                                            <td className="p-3 w-1/3">{activity.description}</td>
                                                            <td className="p-3">{getMemberName(activity.memberId)}</td>
                                                            <td className="p-3">{new Date(activity.endDate).toLocaleDateString()}</td>
                                                            <td className="p-3 font-semibold">{activity.hours}h</td>
                                                            <td className="p-3"><span className={getActivityStatusBadge(activity.status)}>{activity.status}</span></td>
                                                            <td className="p-3 text-right space-x-3">
                                                                {activity.status === 'Pending' && <button onClick={() => handleApproveActivity(activity.id)} className="font-semibold text-green-600 hover:text-green-800">Approve</button>}
                                                                <button onClick={() => handleEditActivity(activity)} className="font-semibold text-teal-600 hover:text-teal-800">Edit</button>
                                                                <button onClick={() => requestDelete(activity.id, 'activity')} className="font-semibold text-red-600 hover:text-red-800">Delete</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="p-6 text-center text-slate-500 italic">No time has been logged for this task yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
            
            {isTaskEditorOpen && currentTask && <TaskEditor task={currentTask} onSave={handleSaveTask} onCancel={() => setIsTaskEditorOpen(false)} />}
            {isActivityEditorOpen && currentActivity && <ActivityEditor activity={currentActivity} onSave={handleSaveActivity} onCancel={() => setIsActivityEditorOpen(false)} selectedProjectId={project.id} />}
            {isDeleteModalOpen && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title={`Delete ${itemToDelete?.type}`} message={deleteModalMessage} confirmButtonText={`Delete ${itemToDelete?.type}`} />}
        </section>
    );
};

export default WorkplanTab;