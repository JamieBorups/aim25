

import React, { useState } from 'react';
import TaskList from './components/task/TaskList';
import TaskEditor from './components/task/TaskEditor';
import WorkplanView from './components/task/WorkplanView';
import ActivityList from './components/task/ActivityList';
import ActivityEditor from './components/task/ActivityEditor';
import { initialTaskData, initialActivityData } from './constants';
import { Task, Member, FormData, TaskManagerView, Activity } from './types';
import { Select } from './components/ui/Select';
import FormField from './components/ui/FormField';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  projects: FormData[];
  members: Member[];
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, projects, members, activities, setActivities }) => {
  const [view, setView] = useState<TaskManagerView>('workplan');
  const [selectedProjectId, setSelectedProjectId] = useState(''); // '' for All Projects
  
  // State for Task Editor
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // State for Activity Editor
  const [isActivityEditorOpen, setIsActivityEditorOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);

  // State for ActivityList filters (lifted up)
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [activityFilterMember, setActivityFilterMember] = useState('');


  // --- Task Handlers ---
  const handleAddTask = () => {
    const newTask: Task = { ...initialTaskData, id: `task_${Date.now()}`, projectId: selectedProjectId };
    setCurrentTask(newTask);
    setIsTaskEditorOpen(true);
  };
  
  const handleEditTask = (id: string) => {
    const taskToEdit = tasks.find(t => t.id === id);
    if (taskToEdit) {
      setCurrentTask(taskToEdit);
      setIsTaskEditorOpen(true);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task? This will also delete all associated time tracking activities.')) {
      setTasks(tasks.filter(t => t.id !== id));
      setActivities(activities.filter(a => a.taskId !== id));
    }
  };

  const handleSaveTask = (taskToSave: Task) => {
    const now = new Date().toISOString();
    const taskWithTimestamp = { ...taskToSave, updatedAt: now };

    setTasks(prev => {
        const index = prev.findIndex(t => t.id === taskWithTimestamp.id);
        if (index > -1) {
            const updatedTasks = [...prev];
            updatedTasks[index] = taskWithTimestamp;
            return updatedTasks;
        } else {
            return [...prev, taskWithTimestamp];
        }
    });

    setIsTaskEditorOpen(false);
    setCurrentTask(null);
  };

  // --- Activity Handlers ---
  const handleAddActivity = () => {
    const newActivity: Activity = { ...initialActivityData, id: ``, createdAt: '' }; // Clear ID and timestamps for new entries
    setCurrentActivity(newActivity);
    setIsActivityEditorOpen(true);
  };

  const handleAddActivityForTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newActivity: Activity = {
      ...initialActivityData,
      taskId: task.id,
      description: ``,
    };
    setCurrentActivity(newActivity);
    setIsActivityEditorOpen(true);
  };


  const handleEditActivity = (id: string) => {
    const activityToEdit = activities.find(a => a.id === id);
    if (activityToEdit) {
      setCurrentActivity(activityToEdit);
      setIsActivityEditorOpen(true);
    }
  };

  const handleDeleteActivity = (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setActivities(activities.filter(a => a.id !== id));
    }
  };

  const handleApproveActivity = (id: string) => {
    setActivities(prevActivities => prevActivities.map(a => a.id === id ? { ...a, status: 'Approved', updatedAt: new Date().toISOString() } : a));
  };
  
  const handleSaveActivity = (activityToSave: Activity & { memberIds?: string[] }) => {
    const now = new Date().toISOString();

    // EDITING: The activity has an ID and createdAt timestamp.
    if (activityToSave.id && activityToSave.createdAt) {
        const updatedActivity = { 
            ...activityToSave, 
            updatedAt: now 
        };
        delete updatedActivity.memberIds;
        setActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
    } 
    // CREATING: No ID, but has a memberIds array.
    else if (activityToSave.memberIds && activityToSave.memberIds.length > 0) {
        const { memberIds, ...baseActivityData } = activityToSave;
        
        const newActivities: Activity[] = memberIds.map(memberId => ({
            ...baseActivityData,
            id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            memberId: memberId,
            status: 'Pending', // New activities are always pending
            createdAt: now,
            updatedAt: now,
        }));
        setActivities(prev => [...prev, ...newActivities]);
        
        // THE FIX: Reset filters to guarantee the new item is visible.
        setActivitySearchTerm('');
        setActivityFilterMember('');
    }

    setIsActivityEditorOpen(false);
    setCurrentActivity(null);
  };
  
  const handleProjectFilterChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Reset activity filters when project changes to avoid confusion
    setActivitySearchTerm('');
    setActivityFilterMember('');
  };

  const renderContent = () => {
    const projectOptions = [{ value: '', label: 'All Projects' }, ...projects.map(p => ({ value: p.id, label: p.projectTitle }))];

    const filteredTasks = tasks.filter(task => !selectedProjectId || task.projectId === selectedProjectId);

    return (
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Task &amp; Activity Management</h1>
            <p className="text-slate-500 mt-1">Select a project and view to manage your workplan.</p>
          </div>
          <div className="w-full md:w-64">
            <FormField label="Filter by Project" htmlFor="project_filter" className="mb-0">
               <Select id="project_filter" value={selectedProjectId} onChange={e => handleProjectFilterChange(e.target.value)} options={projectOptions} />
            </FormField>
          </div>
        </div>

        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {(['workplan', 'tasks', 'activities'] as TaskManagerView[]).map(tabName => (
              <button
                key={tabName}
                type="button"
                onClick={() => setView(tabName)}
                className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md capitalize ${
                  view === tabName
                    ? 'border-teal-500 text-teal-600 bg-slate-100'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tabName === 'workplan' ? 'Workplan Report' : tabName}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="py-2">
            {view === 'workplan' && <WorkplanView tasks={tasks} projects={projects} members={members} activities={activities} selectedProjectId={selectedProjectId} />}
            {view === 'tasks' && <TaskList tasks={filteredTasks} projects={projects} members={members} onAddTask={handleAddTask} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} selectedProjectId={selectedProjectId} />}
            {view === 'activities' && (
                <ActivityList
                    activities={activities}
                    tasks={tasks}
                    projects={projects}
                    members={members}
                    onAddActivity={handleAddActivity}
                    onEditActivity={handleEditActivity}
                    onDeleteActivity={handleDeleteActivity}
                    onApproveActivity={handleApproveActivity}
                    onAddActivityForTask={handleAddActivityForTask}
                    selectedProjectId={selectedProjectId}
                    searchTerm={activitySearchTerm}
                    setSearchTerm={setActivitySearchTerm}
                    filterMember={activityFilterMember}
                    setFilterMember={setActivityFilterMember}
                />
            )}
        </div>

        {isTaskEditorOpen && currentTask && (
            <TaskEditor 
                task={currentTask} 
                onSave={handleSaveTask} 
                onCancel={() => setIsTaskEditorOpen(false)} 
                projects={projects} 
                members={members} 
            />
        )}
        
        {isActivityEditorOpen && currentActivity && (
            <ActivityEditor
                activity={currentActivity}
                onSave={handleSaveActivity}
                onCancel={() => setIsActivityEditorOpen(false)}
                tasks={tasks}
                members={members}
                projects={projects}
                selectedProjectId={selectedProjectId}
            />
        )}
      </div>
    );
  };
  
  return (
    <div className="font-sans text-slate-800">
      <main className="w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default TaskManager;
