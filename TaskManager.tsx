import React, { useState } from 'react';
import TaskList from './components/task/TaskList';
import TaskEditor from './components/task/TaskEditor';
import WorkplanView from './components/task/WorkplanView';
import ActivityList from './components/task/ActivityList';
import ActivityEditor from './components/task/ActivityEditor';
import ConfirmationModal from './components/ui/ConfirmationModal';
import { initialTaskData, initialActivityData } from './constants';
import { Task, TaskManagerView, Activity } from './types';
import { Select } from './components/ui/Select';
import FormField from './components/ui/FormField';
import { useAppContext } from './context/AppContext';

const TaskManager: React.FC = () => {
  const { tasks, setTasks, projects, members, activities, setActivities, notify } = useAppContext();
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

  // State for Task Delete Modal
  const [isTaskDeleteModalOpen, setIsTaskDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // --- Task Handlers ---
  const handleAddTask = () => {
    // 1. Generate Task Code
    const project = projects.find(p => p.id === selectedProjectId);
    let taskCode = '';
    if (project) {
        // Create prefix from project title
        const prefix = (project.projectTitle.match(/\b(\w)/g) || ['T']).join('').toUpperCase().substring(0, 4);

        // Find highest existing number for this project
        const projectTasks = tasks.filter(t => t.projectId === selectedProjectId && t.taskCode.startsWith(prefix));
        let maxNum = 0;
        projectTasks.forEach(t => {
            const numPart = t.taskCode.split('-')[1];
            if (numPart) {
                const num = parseInt(numPart, 10);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        });
        taskCode = `${prefix}-${maxNum + 1}`;
    } else {
        // Fallback if no project is selected
        taskCode = `TASK-${tasks.filter(t => !t.projectId).length + 1}`;
    }
    
    // 2. Create New Task
    const newTask: Task = { 
        ...initialTaskData, 
        id: `task_${Date.now()}`, 
        projectId: selectedProjectId,
        taskCode: taskCode, // Add the new code
    };
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
    setTaskToDelete(id);
    setIsTaskDeleteModalOpen(true);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;

    setTasks(tasks.filter(t => t.id !== taskToDelete));
    setActivities(activities.filter(a => a.taskId !== taskToDelete));

    notify('Task and related activities deleted.', 'success');
    
    setIsTaskDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleSaveTask = (taskToSave: Task) => {
    const isNew = !tasks.some(t => t.id === taskToSave.id);
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

    notify(isNew ? 'Task created successfully!' : 'Task updated successfully!', 'success');
    setIsTaskEditorOpen(false);
    setCurrentTask(null);
  };
  
  const handleToggleTaskComplete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        notify(task.isComplete ? `Task '${task.title}' marked as incomplete.` : `Task '${task.title}' marked as complete.`, 'success');
    }
    setTasks(prevTasks => 
        prevTasks.map(t => 
            t.id === id ? { ...t, isComplete: !t.isComplete, status: !t.isComplete ? 'Done' : 'To Do', updatedAt: new Date().toISOString() } : t
        )
    );
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
      notify('Activity deleted.', 'success');
    }
  };

  const handleApproveActivity = (id: string) => {
    setActivities(prevActivities => prevActivities.map(a => a.id === id ? { ...a, status: 'Approved', updatedAt: new Date().toISOString() } : a));
    notify('Activity approved.', 'success');
  };
  
  const handleSaveActivity = (activityToSave: Activity & { memberIds?: string[] }) => {
    const now = new Date().toISOString();
    const isEditing = activityToSave.id && activityToSave.createdAt;

    // EDITING: The activity has an ID and createdAt timestamp.
    if (isEditing) {
        const updatedActivity = { 
            ...activityToSave, 
            updatedAt: now 
        };
        delete updatedActivity.memberIds;
        setActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
        notify('Activity updated successfully!', 'success');
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
        notify(`${newActivities.length} new activity log(s) created!`, 'success');
        
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
            {view === 'workplan' && <WorkplanView selectedProjectId={selectedProjectId} />}
            {view === 'tasks' && <TaskList tasks={filteredTasks} onAddTask={handleAddTask} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onToggleTaskComplete={handleToggleTaskComplete} selectedProjectId={selectedProjectId} />}
            {view === 'activities' && (
                <ActivityList
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
            />
        )}
        
        {isActivityEditorOpen && currentActivity && (
            <ActivityEditor
                activity={currentActivity}
                onSave={handleSaveActivity}
                onCancel={() => setIsActivityEditorOpen(false)}
                selectedProjectId={selectedProjectId}
            />
        )}

        {isTaskDeleteModalOpen && (
          <ConfirmationModal
            isOpen={isTaskDeleteModalOpen}
            onClose={() => setIsTaskDeleteModalOpen(false)}
            onConfirm={confirmDeleteTask}
            title="Delete Task"
            message="Are you sure you want to delete this task? All associated time tracking activities will also be deleted. This cannot be undone."
            confirmButtonText="Delete Task"
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