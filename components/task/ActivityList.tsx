
import React, { useMemo, useState } from 'react';
import { Activity, Task, ActivityStatus, TaskStatus, ActivitySortOption, ActivityStatusFilter } from '../../types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useAppContext } from '../../context/AppContext';
import { ACTIVITY_SORT_OPTIONS, ACTIVITY_STATUS_FILTER_OPTIONS } from '../../constants';

interface ActivityListProps {
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
    const statusMap: Record<ActivityStatus, string> = {
        'Approved': "bg-green-100 text-green-800",
        'Pending': "bg-yellow-100 text-yellow-800",
    };
    return `${baseClasses} ${statusMap[status]}`;
}

const getTaskStatusBadge = (status: TaskStatus) => {
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap: Record<TaskStatus, string> = {
        'Done': "bg-green-100 text-green-800",
        'In Progress': "bg-blue-100 text-blue-800",
        'To Do': "bg-yellow-100 text-yellow-800",
        'Backlog': "bg-slate-100 text-slate-800",
    };
    return `${baseClasses} ${statusMap[status] || statusMap['Backlog']}`;
}

const PlaceholderRow: React.FC<{ task: Task; projectMap: Map<string, string>; memberMap: Map<string, string>; onAddActivityForTask: (taskId: string) => void; }> = ({ task, projectMap, memberMap, onAddActivityForTask }) => {
    const memberName = memberMap.get(task.assignedMemberId) || 'Unassigned';
    return (
        <tr className="bg-slate-50/70 hover:bg-slate-100 transition-colors">
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <span className="font-mono text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{task.taskCode}</span>
                    <span>{task.title}</span>
                </div>
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
};

const ActivityRow: React.FC<{ activity: Activity; taskMap: Map<string, Task>; projectMap: Map<string, string>; memberMap: Map<string, string>; onApproveActivity: (id: string) => void; onEditActivity: (id: string) => void; onDeleteActivity: (id: string) => void; }> = ({ activity, taskMap, projectMap, memberMap, onApproveActivity, onEditActivity, onDeleteActivity }) => {
    const task = taskMap.get(activity.taskId);
    const memberName = memberMap.get(activity.memberId) || 'Unknown';
    const projectName = task ? projectMap.get(task.projectId) : 'Unknown';

    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  {task?.taskCode && <span className="font-mono text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{task.taskCode}</span>}
                  <span>{task?.title || 'Task not found'}</span>
                </div>
                <div className="text-xs text-slate-500 mb-1">{projectName}</div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap max-w-sm">{activity.description}</p>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{memberName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                <div>{new Date(activity.startDate).toLocaleDateString()} - {new Date(activity.endDate).toLocaleDateString()}</div>
                {activity.startTime && activity.endTime && <div className="text-xs text-slate-500">({activity.startTime} - {activity.endTime})</div>}
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
    );
};

const ActivityList: React.FC<ActivityListProps> = ({ onAddActivity, onEditActivity, onDeleteActivity, onApproveActivity, onAddActivityForTask, selectedProjectId, searchTerm, setSearchTerm, filterMember, setFilterMember }) => {
  const { state: { activities, tasks, projects, members } } = useAppContext();
  const [sortOption, setSortOption] = useState<ActivitySortOption>('date-desc');
  const [filterStatus, setFilterStatus] = useState<ActivityStatusFilter>('all');
  const [showPlaceholders, setShowPlaceholders] = useState(true);

  const taskMap = useMemo<Map<string, Task>>(() => new Map(tasks.map(t => [t.id, t])), [tasks]);
  const projectMap = useMemo<Map<string, string>>(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);
  const memberMap = useMemo<Map<string, string>>(() => new Map(members.map(m => [m.id, `${m.firstName} ${m.lastName}`])), [members]);

  const { sortedActivities, placeholderTasks } = useMemo(() => {
    // 1. Filter activities
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = activities.filter(activity => {
      const task = taskMap.get(activity.taskId);
      if (!task) return false;

      const projectMatch = !selectedProjectId || task.projectId === selectedProjectId;
      if (!projectMatch) return false;

      const memberMatch = !filterMember || activity.memberId === filterMember;
      const statusMatch = filterStatus === 'all' || activity.status.toLowerCase() === filterStatus;
      
      const memberName = memberMap.get(activity.memberId)?.toLowerCase() || '';
      const taskTitle = task.title.toLowerCase();
      const searchMatch = !searchTerm ||
        activity.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        taskTitle.includes(lowerCaseSearchTerm) ||
        memberName.includes(lowerCaseSearchTerm);

      return memberMatch && statusMatch && searchMatch;
    });

    // 2. Sort activities
    const sorted = filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'updatedAt':
          return (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
        case 'date-desc':
        default:
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      }
    });

    // 3. Find tasks that have NO activities logged (for placeholders)
    const taskIdsWithActivities = new Set(filtered.map(a => a.taskId));
    const placeholders = tasks.filter(task => {
        // Must be in selected project
        const projectMatch = !selectedProjectId || task.projectId === selectedProjectId;
        if (!projectMatch) return false;
        
        // Must be assigned to filtered member
        const memberMatch = !filterMember || task.assignedMemberId === filterMember;
        if (!memberMatch) return false;
        
        // Must NOT have any logged activities
        return !taskIdsWithActivities.has(task.id) && task.taskType === 'Time-Based';
    });

    return { sortedActivities: sorted, placeholderTasks: placeholders };
  }, [activities, tasks, selectedProjectId, filterMember, filterStatus, searchTerm, sortOption, taskMap, memberMap]);

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow">
                <Input
                    placeholder="Search descriptions, tasks..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <Select
                    value={filterMember}
                    onChange={e => setFilterMember(e.target.value)}
                    options={[{ value: '', label: 'All Members' }, ...members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))]}
                />
                 <Select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as ActivityStatusFilter)}
                    options={ACTIVITY_STATUS_FILTER_OPTIONS}
                />
                 <Select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value as ActivitySortOption)}
                    options={ACTIVITY_SORT_OPTIONS}
                />
            </div>
            <button
                onClick={onAddActivity}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
                <i className="fa fa-plus mr-2"></i>
                Add New Activity
            </button>
        </div>
        
        <div className="flex justify-end mb-4">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="show-placeholders"
                    checked={showPlaceholders}
                    onChange={() => setShowPlaceholders(!showPlaceholders)}
                    className="h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="show-placeholders" className="ml-2 block text-sm text-slate-700">Show tasks awaiting activity logs</label>
            </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
            {(sortedActivities.length === 0 && (!showPlaceholders || placeholderTasks.length === 0)) ? (
                <div className="text-center py-20">
                    <i className="fa-solid fa-hourglass-end text-7xl text-slate-300"></i>
                    <h3 className="mt-6 text-xl font-medium text-slate-800">No Activities Found</h3>
                    <p className="text-slate-500 mt-2 text-base">Try adjusting your filters or add a new activity.</p>
                </div>
            ) : (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Task / Description</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Member</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Hours</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Updated</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {sortedActivities.map(activity => (
                            <ActivityRow 
                                key={activity.id}
                                activity={activity}
                                taskMap={taskMap}
                                projectMap={projectMap}
                                memberMap={memberMap}
                                onApproveActivity={onApproveActivity}
                                onEditActivity={onEditActivity}
                                onDeleteActivity={onDeleteActivity}
                            />
                        ))}
                         {showPlaceholders && placeholderTasks.map(task => (
                            <PlaceholderRow 
                                key={`ph-${task.id}`}
                                task={task}
                                projectMap={projectMap}
                                memberMap={memberMap}
                                onAddActivityForTask={onAddActivityForTask}
                            />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
  );
};

export default ActivityList;