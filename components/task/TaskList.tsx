
import React, { useState, useMemo } from 'react';
import { Task, FormData, Member, TaskStatus } from '../../types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface TaskListProps {
  tasks: Task[];
  projects: FormData[];
  members: Member[];
  onAddTask: () => void;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
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

const TaskList: React.FC<TaskListProps> = ({ tasks, projects, members, onAddTask, onEditTask, onDeleteTask, selectedProjectId }) => {
  const [filterMember, setFilterMember] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getProjectTitle = useMemo(() => {
    const projectMap = new Map(projects.map(p => [p.id, p.projectTitle]));
    return (id: string) => projectMap.get(id) || 'N/A';
  }, [projects]);


  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const projectMatch = !selectedProjectId || task.projectId === selectedProjectId;
        const memberMatch = !filterMember || task.assignedMemberId === filterMember;
        const searchMatch = !searchTerm || 
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getProjectTitle(task.projectId).toLowerCase().includes(searchTerm.toLowerCase());
        return projectMatch && memberMatch && searchMatch;
    });
  }, [tasks, selectedProjectId, filterMember, searchTerm, getProjectTitle]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
            <Input 
                placeholder="Search tasks..."
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
                onClick={onAddTask}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                <i className="fa fa-plus mr-2"></i>
                Add New Task
            </button>
        </div>
      </div>
        
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        {filteredTasks.length === 0 ? (
            <div className="text-center py-20">
            <i className="fa-solid fa-check-double text-7xl text-slate-300"></i>
            <h3 className="mt-6 text-xl font-medium text-slate-800">No tasks found</h3>
            <p className="text-slate-500 mt-2 text-base">Create a new task or adjust your filters.</p>
            </div>
        ) : (
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Task</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Assignee</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Start Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Updated</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {filteredTasks.map(task => {
                        const member = members.find(m => m.id === task.assignedMemberId);
                        return (
                            <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{task.title}</div>
                                    <div className="text-sm text-slate-500">{getProjectTitle(task.projectId)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {member ? (
                                            <>
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <img className="h-8 w-8 rounded-full object-cover" src={member.imageUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`} alt="" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-slate-900">{member.firstName} {member.lastName}</div>
                                                </div>
                                            </>
                                        ) : <div className="text-sm text-slate-500">Unassigned</div>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getStatusBadge(task.status)}>{task.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
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
    </div>
  );
};

export default TaskList;
