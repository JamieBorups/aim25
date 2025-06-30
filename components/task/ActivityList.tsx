

import React, { useMemo } from 'react';
import { Activity, Task, FormData, Member, ActivityStatus, TaskStatus } from '../../types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface ActivityListProps {
  activities: Activity[];
  tasks: Task[];
  projects: FormData[];
  members: Member[];
  onAddActivity: () => void;
  onEditActivity: (id: string) => void;
  onDeleteActivity: (id: string) => void;
  onApproveActivity: (id: string) => void;
  onAddActivityForTask: (taskId: string) => void;
  selectedProjectId: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterMember: string;
  setFilterMember: (value: string) => void;
}

const getActivityStatusBadge = (status: ActivityStatus) => {
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap = {
        'Approved': "bg-green-100 text-green-800",
        'Pending': "bg-yellow-100 text-yellow-800",
    };
    return `${baseClasses} ${statusMap[status]}`;
}

const getTaskStatusBadge = (status: TaskStatus) => {
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap = {
        'Done': "bg-green-100 text-green-800",
        'In Progress': "bg-blue-100 text-blue-800",
        'To Do': "bg-yellow-100 text-yellow-800",
        'Backlog': "bg-slate-100 text-slate-800",
    };
    return `${baseClasses} ${statusMap[status] || statusMap['Backlog']}`;
}


const ActivityList: React.FC<ActivityListProps> = ({ activities, tasks, projects, members, onAddActivity, onEditActivity, onDeleteActivity, onApproveActivity, onAddActivityForTask, selectedProjectId, searchTerm, setSearchTerm, filterMember, setFilterMember }) => {

  const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);
  const memberMap = useMemo(() => new Map(members.map(m => [m.id, `${m.firstName} ${m.lastName}`])), [members]);

  const itemsToRender = useMemo(() => {
    const projectTasks = selectedProjectId ? tasks.filter(t => t.projectId === selectedProjectId) : tasks;
    const activitiesForProject = activities.filter(a => taskMap.has(a.taskId) && (selectedProjectId ? taskMap.get(a.taskId)?.projectId === selectedProjectId : true));

    const activitiesByTask = new Map<string, Activity[]>();
    activitiesForProject.forEach(a => {
        if (!activitiesByTask.has(a.taskId)) {
            activitiesByTask.set(a.taskId, []);
        }
        activitiesByTask.get(a.taskId)!.push(a);
    });

    let displayItems: (Activity | { __isPlaceholder: true, task: Task })[] = [];

    projectTasks.forEach(task => {
        const relatedActivities = activitiesByTask.get(task.id);
        if (relatedActivities && relatedActivities.length > 0) {
            displayItems.push(...relatedActivities);
        } else {
            displayItems.push({ __isPlaceholder: true, task: task });
        }
    });
    
    const filtered = displayItems.filter(item => {
        const isPlaceholder = '__isPlaceholder' in item;
        const task = isPlaceholder ? item.task : taskMap.get(item.taskId);
        if (!task) return false;

        const memberMatch = !filterMember || (
            (!isPlaceholder && item.memberId === filterMember) ||
            (isPlaceholder && item.task.assignedMemberId === filterMember)
        );

        const searchMatch = !searchTerm ||
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (!isPlaceholder && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

        return memberMatch && searchMatch;
    });

    return filtered.sort((a, b) => {
        const dateA = new Date('__isPlaceholder' in a ? a.task.updatedAt : a.updatedAt || 0).getTime();
        const dateB = new Date('__isPlaceholder' in b ? b.task.updatedAt : b.updatedAt || 0).getTime();
        return dateB - dateA;
    });
  }, [tasks, activities, selectedProjectId, searchTerm, filterMember, taskMap]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
            <Input 
                placeholder="Search activities..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <Select
                value={filterMember}
                onChange={e => setFilterMember(e.target.value)}
                options={[{ value: '', label: 'All Members' }, ...members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))]}
            />
        </div>
        <div className="flex-shrink-0">
            <button
                onClick={onAddActivity}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                <i className="fa fa-plus mr-2"></i>
                Add New Activity
            </button>
        </div>
      </div>
        
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        {itemsToRender.length === 0 ? (
            <div className="text-center py-20">
            <i className="fa-solid fa-clock text-7xl text-slate-300"></i>
            <h3 className="mt-6 text-xl font-medium text-slate-800">No activities found</h3>
            <p className="text-slate-500 mt-2 text-base">Create a new task or adjust your filters.</p>
            </div>
        ) : (
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Task / Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Member</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Dates</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Hours</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Updated</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {itemsToRender.map((item, index) => {
                        const isPlaceholder = '__isPlaceholder' in item;

                        if (isPlaceholder) {
                            const { task } = item;
                            const memberName = memberMap.get(task.assignedMemberId) || 'Unassigned';
                            return (
                                <tr key={`placeholder-${task.id}`} className="bg-slate-50/70 hover:bg-slate-100 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{task.title}</div>
                                        <div className="text-xs text-slate-500 mb-1">{projectMap.get(task.projectId)}</div>
                                        <p className="text-sm text-slate-500 italic">No activity logged</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{memberName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">-</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">-</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={getTaskStatusBadge(task.status)}>{task.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onAddActivityForTask(task.id)}
                                            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                                        >
                                            <i className="fa fa-plus-circle mr-2"></i>
                                            Log Activity
                                        </button>
                                    </td>
                                </tr>
                            );
                        }
                        
                        const activity = item as Activity;
                        const task = taskMap.get(activity.taskId);
                        const memberName = memberMap.get(activity.memberId) || 'Unknown';
                        const projectName = task ? projectMap.get(task.projectId) : 'Unknown';
                        
                        return (
                            <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900">{task?.title}</div>
                                    <div className="text-xs text-slate-500 mb-1">{projectName}</div>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap max-w-sm">{activity.description}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{memberName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {new Date(activity.startDate).toLocaleDateString()} - {new Date(activity.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">{activity.hours}h</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{activity.updatedAt ? new Date(activity.updatedAt).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={getActivityStatusBadge(activity.status)}>{activity.status}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    {activity.status === 'Pending' && <button onClick={() => onApproveActivity(activity.id)} className="text-green-600 hover:text-green-900 font-semibold">Approve</button>}
                                    <button onClick={() => onEditActivity(activity.id)} className="text-teal-600 hover:text-teal-900 font-semibold">Edit</button>
                                    <button onClick={() => onDeleteActivity(activity.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default ActivityList;
