import React, { useState, useMemo } from 'react';
import { Task, DetailedBudget, TaskType } from '../../types';
import { TASK_STATUSES, WORK_TYPES, TASK_TYPES } from '../../constants';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { useAppContext } from '../../context/AppContext';

interface TaskEditorProps {
  task: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

type ExpenseCategory = keyof DetailedBudget['expenses'];

const TaskEditor: React.FC<TaskEditorProps> = ({ task, onSave, onCancel }) => {
  const { state: { projects, members } } = useAppContext();
  const [formData, setFormData] = useState<Task>(task);

  const handleFormChange = <K extends keyof Task>(field: K, value: Task[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTaskTypeChange = (taskType: TaskType) => {
    const newFormData = {...formData, taskType};
    if(taskType === 'Milestone') {
      newFormData.budgetItemId = '';
      newFormData.estimatedHours = 0;
      newFormData.hourlyRate = 0;
      newFormData.workType = 'Paid';
    }
    setFormData(newFormData);
  };

  const handleProjectChange = (projectId: string) => {
    // Reset budget item when project changes
    setFormData(prev => ({...prev, projectId, budgetItemId: ''}));
  }

  const budgetItemOptions = useMemo(() => {
    if (!formData.projectId) return [{ value: '', label: 'Select a project first' }];

    const project = projects.find(p => p.id === formData.projectId);
    if (!project) return [{ value: '', label: 'Project not found' }];

    const allItems: { value: string, label: string }[] = [];
    const expenseCategories = Object.keys(project.budget.expenses) as ExpenseCategory[];

    const categoryLabels: Record<ExpenseCategory, string> = {
        professionalFees: "Professional Fees",
        travel: "Travel",
        production: "Production",
        administration: "Administration",
        research: "Research",
        professionalDevelopment: "Professional Development"
    };

    expenseCategories.forEach(category => {
        project.budget.expenses[category].forEach(item => {
            const sourceLabel = item.source.charAt(0).toUpperCase() + item.source.slice(1);
            allItems.push({
                value: item.id,
                label: `${categoryLabels[category]}: ${item.description || sourceLabel}`
            });
        });
    });
    
    return [{ value: '', label: 'Select a budget item (optional)' }, ...allItems];
  }, [formData.projectId, projects]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSave}>
          <div className="flex justify-between items-start mb-6 border-b pb-4 text-slate-800">
            <div>
              <h3 className="text-2xl font-bold">{formData.id ? 'Edit Task' : 'Add New Task'}</h3>
              {formData.taskCode && <p className="text-sm text-slate-500 font-mono mt-1">Task ID: {formData.taskCode}</p>}
            </div>
          </div>
          <div className="space-y-5">
            <FormField label="Task Title" htmlFor="title" required>
              <Input id="title" value={formData.title} onChange={e => handleFormChange('title', e.target.value)} />
            </FormField>
            
             <FormField label="Task Type" htmlFor="taskType" required>
                <Select id="taskType" value={formData.taskType} onChange={e => handleTaskTypeChange(e.target.value as TaskType)} options={TASK_TYPES} />
            </FormField>

            <FormField label="Description" htmlFor="description">
              <TextareaWithCounter id="description" rows={3} value={formData.description} onChange={e => handleFormChange('description', e.target.value)} wordLimit={150} />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Project" htmlFor="project" required>
                    <Select id="project" value={formData.projectId} onChange={e => handleProjectChange(e.target.value)} options={[{ value: '', label: 'Select a project' }, ...projects.map(p => ({ value: p.id, label: p.projectTitle }))]} />
                </FormField>
                <FormField label="Assigned To" htmlFor="member">
                    <Select id="member" value={formData.assignedMemberId} onChange={e => handleFormChange('assignedMemberId', e.target.value)} options={[{ value: '', label: 'Unassigned' }, ...members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))]} />
                </FormField>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormField label="Status" htmlFor="status">
                    <Select id="status" value={formData.status} onChange={e => handleFormChange('status', e.target.value as Task['status'])} options={TASK_STATUSES} />
                </FormField>
                 <FormField label="Start Date" htmlFor="startDate">
                    <Input type="date" id="startDate" value={formData.startDate} onChange={e => handleFormChange('startDate', e.target.value)} />
                </FormField>
                 <FormField label="Due Date" htmlFor="dueDate">
                    <Input type="date" id="dueDate" value={formData.dueDate} onChange={e => handleFormChange('dueDate', e.target.value)} />
                </FormField>
            </div>
            
            {formData.taskType === 'Time-Based' && (
                <div className="bg-slate-100 p-4 rounded-md border border-slate-200">
                    <h4 className="text-md font-semibold text-slate-700 mb-3">Time & Budget</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Estimated Hours" htmlFor="estimatedHours">
                            <Input type="number" id="estimatedHours" value={formData.estimatedHours || ''} onChange={e => handleFormChange('estimatedHours', parseFloat(e.target.value) || 0)} step="0.5" />
                        </FormField>
                    </div>
                    <FormField label="Budget Line Item" htmlFor="budgetItemId">
                        <Select id="budgetItemId" value={formData.budgetItemId} onChange={e => handleFormChange('budgetItemId', e.target.value)} options={budgetItemOptions} disabled={!formData.projectId} />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Work Type" htmlFor="workType">
                            <Select id="workType" value={formData.workType} onChange={e => handleFormChange('workType', e.target.value as Task['workType'])} options={WORK_TYPES} />
                        </FormField>
                        <FormField 
                            label={formData.workType === 'Paid' ? "Hourly Rate ($)" : "Hourly Value ($)"}
                            htmlFor="hourlyRate"
                            instructions={formData.workType !== 'Paid' && "Assign a monetary value for in-kind/volunteer contributions for reporting."}
                        >
                            <Input 
                                type="number" 
                                id="hourlyRate" 
                                value={formData.hourlyRate || ''} 
                                onChange={e => handleFormChange('hourlyRate', parseFloat(e.target.value) || 0)} 
                                step="0.01" 
                            />
                        </FormField>
                    </div>
                </div>
            )}

          </div>
          <div className="mt-8 flex justify-end space-x-3 border-t pt-5">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditor;