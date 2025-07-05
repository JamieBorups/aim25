import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskSortOption, SortDirection, TaskStatusFilter } from '../../types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useAppContext } from '../../context/AppContext';
import { TASK_SORT_OPTIONS, TASK_STATUS_FILTER_OPTIONS } from '../../constants';

interface TaskListProps {
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleTaskComplete: (id: string) => void;
  selectedProjectId: string;
}

const getStatusBadge = (status: TaskStatus) => {
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap = {
        'Done': "bg-green-100 text-green-800",
        'In Progress': "bg-blue-100 text-blue-800",
        'To Do': "bg-yellow-100 text-yellow-800",
        'Backlog': "bg-slate-100 text-slate-800",
    };
    return `${baseClasses} ${statusMap[status] || statusMap['Backlog']}`;
}

const isTaskOverdue = (task: Task) => !task.isComplete && task.dueDate && new Date(task.dueDate) < new Date();

const TaskCard: React.FC<{
  task: Task;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  projectMap: Map<string, string>;
  assigneeName: string;
}> = ({ task, onEditTask, onDeleteTask, projectMap, assigneeName }) => (
    <div className={`bg-white p-4 rounded-lg border shadow-sm ${isTaskOverdue(task) ? 'border-red-300' : 'border-slate-200'}`}>
        <div className="flex justify-between items-start">
            <p className="font-bold text-slate-800 pr-2">{task.title}</p>
            <span className="font-mono text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex-shrink-0">{task.taskCode}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 mb-3">{projectMap.get(task.projectId) || 'N/A'}</p>
        <p className="text-sm text-slate-600 mb-4 h-10 overflow-hidden">{task.description}</p>
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Due: <span className={isTaskOverdue(task) ? "font-bold text-red-600" : "font-medium text-slate-700"}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span></span>
            <span className="text-slate-500">{assigneeName}</span>
        </div>
        <div className="flex justify-end items-center mt-4 pt-3 border-t border-slate-200 space-x-2">
            <button onClick={() => onEditTask(task.id)} className="px-2 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md">Edit</button>
            <button onClick={() => onDeleteTask(task.id)} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md">Delete</button>
        </div>
    </div>
);

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onEditTask, onDeleteTask, onToggleTaskComplete, selectedProjectId }) => {
  const { state: { projects, members } } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [filterMember, setFilterMember] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<TaskSortOption>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterStatus, setFilterStatus] = useState<TaskStatusFilter>('all');
  const [recentlyUpdatedTaskId, setRecentlyUpdatedTaskId] = useState<string | null>(null);

  const memberMap = useMemo(() => new Map(members.map(m => [m.id, `${m.firstName} ${m.lastName}`])), [members]);
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);

  const sortedAndFilteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
        const projectMatch = !selectedProjectId || task.projectId === selectedProjectId;
        const memberMatch = !filterMember || task.assignedMemberId === filterMember;
        const projectName = projectMap.get(task.projectId) || '';
        const searchMatch = !searchTerm || 
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.taskCode && task.taskCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
            projectName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const statusMatch = filterStatus === 'all' ||
            (filterStatus === 'overdue' && isTaskOverdue(task)) ||
            (filterStatus === 'dueThisWeek' && task.dueDate && new Date(task.dueDate) >= now && new Date(task.dueDate) <= oneWeekFromNow) ||
            (filterStatus === 'todo' && task.status === 'To Do') ||
            (filterStatus === 'inProgress' && task.status === 'In Progress') ||
            (filterStatus === 'done' && task.status === 'Done');

        return projectMatch && memberMatch && searchMatch && statusMatch;
    });

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
  }, [tasks, selectedProjectId, filterMember, searchTerm, projectMap, sortOption, sortDirection, filterStatus, memberMap]);

  const tasksByStatus = useMemo(() => {
    return sortedAndFilteredTasks.reduce((acc, task) => {
        if (!acc[task.status]) {
            acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [sortedAndFilteredTasks]);

  const handleCheckboxChange = (taskId: string) => {
    onToggleTaskComplete(taskId);
    setRecentlyUpdatedTaskId(taskId);
    setTimeout(() => {
        setRecentlyUpdatedTaskId(null);
    }, 1500);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 flex-grow">
            <Input 
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="lg:col-span-2"
            />
            <Select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as TaskStatusFilter)}
                options={TASK_STATUS_FILTER_OPTIONS}
            />
            <Select
                value={filterMember}
                onChange={e => setFilterMember(e.target.value)}
                options={[{ value: '', label: 'All Members' }, ...members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))]}
            />
            <div className="flex">
                <Select
                    className="rounded-r-none"
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value as TaskSortOption)}
                    options={TASK_SORT_OPTIONS}
                />
                <button
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="px-3 bg-slate-200 text-slate-600 rounded-r-md border-y border-r border-slate-400 hover:bg-slate-300"
                    title={`Sort direction: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                    <i className={`fa-solid ${sortDirection === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                </button>
            </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
            <div className="bg-slate-200 p-1 rounded-lg flex">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500'}`}>List</button>
                <button onClick={() => setViewMode('board')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'board' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500'}`}>Board</button>
            </div>
            <button
                onClick={onAddTask}
                disabled={!selectedProjectId}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                title={!selectedProjectId ? "Please select a project to add a task" : "Add New Task"}
            >
                <i className="fa fa-plus mr-2"></i>
                Add Task
            </button>
        </div>
      </div>
        
      {viewMode === 'list' && (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          {sortedAndFilteredTasks.length === 0 ? (
              <div className="text-center py-20">
              <i className="fa-solid fa-check-double text-7xl text-slate-300"></i>
              <h3 className="mt-6 text-xl font-medium text-slate-800">No tasks found</h3>
              <p className="text-slate-500 mt-2 text-base">Select a project and click "Add Task", or adjust your filters.</p>
              </div>
          ) : (
              <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                      <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Task</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Assignee</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Dates</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Updated</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                      {sortedAndFilteredTasks.map(task => {
                          const overdue = isTaskOverdue(task);
                          return (
                              <tr key={task.id} className={`transition-colors duration-500 ${recentlyUpdatedTaskId === task.id ? 'bg-teal-50' : ''} ${overdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}`}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-3">
                                          <div className="text-xs font-bold bg-slate-200 text-slate-600 rounded-md px-2 py-1">{task.taskCode || 'N/A'}</div>
                                          <div>
                                              <div className="text-sm font-medium text-slate-900">{task.title}</div>
                                              <div className="text-sm text-slate-500">{projectMap.get(task.projectId) || 'N/A'}</div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                          {task.assignedMemberId && memberMap.has(task.assignedMemberId) ? (
                                              <>
                                                  <div className="flex-shrink-0 h-8 w-8">
                                                      <img className="h-8 w-8 rounded-full object-cover" src={members.find(m=>m.id === task.assignedMemberId)?.imageUrl || `https://ui-avatars.com/api/?name=${memberMap.get(task.assignedMemberId)}&background=random`} alt="" />
                                                  </div>
                                                  <div className="ml-3">
                                                      <div className="text-sm font-medium text-slate-900">{memberMap.get(task.assignedMemberId) || 'Unassigned'}</div>
                                                  </div>
                                              </>
                                          ) : <div className="text-sm text-slate-500">Unassigned</div>}
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      {task.taskType === 'Milestone' ? (
                                          <div className="flex items-center">
                                              <input type="checkbox" id={`complete-${task.id}`} checked={task.isComplete} onChange={() => handleCheckboxChange(task.id)} className="h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"/>
                                              <label htmlFor={`complete-${task.id}`} className="ml-2 text-sm font-medium text-slate-700">{task.isComplete ? 'Complete' : 'Incomplete'}</label>
                                          </div>
                                      ) : (
                                          <span className={getStatusBadge(task.status)}>{task.status}</span>
                                      )}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button onClick={() => onEditTask(task.id)} className="text-teal-600 hover:text-teal-900 mr-4 font-semibold">Edit</button>
                                      <button onClick={() => onDeleteTask(task.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                                  </td>
                              </tr>
                          )
                      })}
                  </tbody>
              </table>
          )}
        </div>
      )}
      {viewMode === 'board' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['To Do', 'In Progress', 'Done', 'Backlog'] as TaskStatus[]).map(status => (
                <div key={status} className="bg-slate-100 rounded-lg p-3">
                    <h3 className="font-bold text-slate-700 mb-4 px-2">{status} <span className="text-sm font-normal text-slate-500">({(tasksByStatus[status] || []).length})</span></h3>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {(tasksByStatus[status] || []).map(task => (
                            <TaskCard 
                                key={task.id}
                                task={task}
                                onEditTask={onEditTask}
                                onDeleteTask={onDeleteTask}
                                projectMap={projectMap}
                                assigneeName={memberMap.get(task.assignedMemberId) || 'Unassigned'}
                            />
                        ))}
                         {(!tasksByStatus[status] || tasksByStatus[status].length === 0) && (
                            <div className="text-center text-sm text-slate-400 p-8 border-2 border-dashed border-slate-300 rounded-lg">Empty</div>
                         )}
                    </div>
                </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default TaskList;