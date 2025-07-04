import React, { useState, useMemo, useEffect } from 'react';
import { Activity } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import { useAppContext } from '../../context/AppContext';

interface ActivityEditorProps {
  activity: Activity;
  onSave: (activity: Activity & { memberIds?: string[] }) => void;
  onCancel: () => void;
  selectedProjectId: string;
}

const ActivityEditor: React.FC<ActivityEditorProps> = ({ activity, onSave, onCancel, selectedProjectId }) => {
  const { tasks, members, projects } = useAppContext();
  
  const getInitialProjectId = () => {
    if (activity.taskId) {
      const task = tasks.find(t => t.id === activity.taskId);
      return task?.projectId || selectedProjectId;
    }
    return selectedProjectId;
  };

  const [currentProjectId, setCurrentProjectId] = useState<string>(getInitialProjectId());
  const [taskOptions, setTaskOptions] = useState<{ value: string; label: string }[]>([]);

  const [formData, setFormData] = useState<Activity & { memberIds: string[] }>({
    ...activity,
    memberIds: activity.memberId ? [activity.memberId] : [],
  });

  const isEditing = !!activity.id;
  const areTimesSet = formData.startTime && formData.endTime;

  useEffect(() => {
    if (formData.startTime && formData.endTime) {
        const start = new Date(`1970-01-01T${formData.startTime}:00Z`);
        const end = new Date(`1970-01-01T${formData.endTime}:00Z`);

        if (end > start) {
            const diffMs = end.getTime() - start.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            // Round to nearest quarter hour
            const roundedHours = Math.round(diffHours * 4) / 4;
            setFormData(prev => ({...prev, hours: roundedHours}));
        } else {
            setFormData(prev => ({...prev, hours: 0}));
        }
    }
  }, [formData.startTime, formData.endTime]);

  // Update task options when project changes
  useEffect(() => {
    if (!currentProjectId) {
      setTaskOptions([{ value: '', label: 'Select a project first' }]);
      return;
    }
    
    // Only allow logging activities against Time-Based tasks
    const filteredTasks = tasks.filter(t => t.projectId === currentProjectId && t.taskType === 'Time-Based');
    
    if (filteredTasks.length === 0) {
      setTaskOptions([{ value: '', label: 'No time-based tasks in project' }]);
      return;
    }
    
    const options = [{ value: '', label: 'Select a task' }, ...filteredTasks.map(t => ({ value: t.id, label: `${t.taskCode}: ${t.title}` }))];
    setTaskOptions(options);
    
  }, [currentProjectId, tasks]);

  const handleFormChange = <K extends keyof Activity>(field: K, value: Activity[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (selectedIds: string[]) => {
    setFormData(prev => ({ ...prev, memberIds: selectedIds }));
  };
  
  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId);
    handleFormChange('taskId', ''); // Reset task when project changes
  };

  const projectOptions = useMemo(() => {
    return [{ value: '', label: 'Select a project' }, ...projects.map(p => ({ value: p.id, label: p.projectTitle }))];
  }, [projects]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskId) {
      alert('Please select a task.');
      return;
    }
    if (formData.memberIds.length === 0) {
      alert('Please select at least one member.');
      return;
    }

    const dataToSave = {
      ...formData,
      memberId: formData.memberIds[0], // Set primary memberId for type consistency
    };

    onSave(dataToSave);
  };

  const memberOptions = useMemo(() => members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` })), [members]);
  
  const singleMemberName = useMemo(() => {
    if (isEditing && formData.memberId) {
        const member = members.find(m => m.id === formData.memberId);
        return member ? `${member.firstName} ${member.lastName}` : 'Unknown Member';
    }
    return '';
  }, [isEditing, formData.memberId, members]);
  
  const showBulkSummary = !isEditing && formData.memberIds.length > 1;
  const totalHours = (formData.hours || 0) * formData.memberIds.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSave}>
          <h3 className="text-2xl font-bold mb-6 border-b pb-4 text-slate-800">{isEditing ? 'Edit Activity' : 'Add New Activity'}</h3>
          <div className="space-y-5">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Project" htmlFor="project" required>
                    <Select
                        id="project"
                        value={currentProjectId}
                        onChange={(e) => handleProjectChange(e.target.value)}
                        options={projectOptions}
                        disabled={isEditing}
                    />
                </FormField>
                <FormField label="Task" htmlFor="task" required>
                    <Select 
                        id="task" 
                        value={formData.taskId} 
                        onChange={e => handleFormChange('taskId', e.target.value)} 
                        options={taskOptions} 
                        disabled={isEditing || !currentProjectId}
                    />
                </FormField>
            </div>
            
            <FormField 
                label="Member(s)" 
                htmlFor="member"
                required
                instructions={isEditing ? "Each activity is a unique record. To change the member, please create a new activity." : null}
            >
              {isEditing ? (
                <Input value={singleMemberName} disabled />
              ) : (
                <div className="max-h-36 overflow-y-auto p-2 border border-slate-300 rounded-md bg-white">
                  <CheckboxGroup
                    name="members"
                    options={memberOptions}
                    selectedValues={formData.memberIds}
                    onChange={handleMemberChange}
                    columns={3}
                  />
                </div>
              )}
            </FormField>

            <FormField label="Description" htmlFor="description">
              <TextareaWithCounter id="description" rows={4} value={formData.description} onChange={e => handleFormChange('description', e.target.value)} wordLimit={200} />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Start Date" htmlFor="startDate" required>
                <Input type="date" id="startDate" value={formData.startDate} onChange={e => handleFormChange('startDate', e.target.value)} />
              </FormField>
              <FormField label="End Date" htmlFor="endDate" required>
                <Input type="date" id="endDate" value={formData.endDate} onChange={e => handleFormChange('endDate', e.target.value)} />
              </FormField>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormField label="Start Time" htmlFor="startTime" instructions="Optional">
                <Input type="time" id="startTime" value={formData.startTime || ''} onChange={e => handleFormChange('startTime', e.target.value)} />
              </FormField>
              <FormField label="End Time" htmlFor="endTime" instructions="Optional">
                <Input type="time" id="endTime" value={formData.endTime || ''} onChange={e => handleFormChange('endTime', e.target.value)} />
              </FormField>
              <FormField label={`Hours Spent ${!isEditing ? '(each)' : ''}`} htmlFor="hours" required>
                <Input type="number" id="hours" value={formData.hours || ''} onChange={e => handleFormChange('hours', parseFloat(e.target.value) || 0)} step="0.25" disabled={!!areTimesSet} title={areTimesSet ? "Hours are calculated automatically from start/end times" : "Enter hours spent"} />
              </FormField>
            </div>

            {showBulkSummary && (
                <div className="bg-teal-50 text-teal-800 p-3 rounded-md text-center text-sm border border-teal-200">
                    This will create <span className="font-bold">{formData.memberIds.length}</span> separate activity logs for a total of <span className="font-bold">{totalHours.toFixed(2)} hours</span>.
                </div>
            )}
          </div>

          {formData.createdAt && (
            <div className="mt-6 text-xs text-slate-400 text-center border-t pt-4">
              <span>Created: {new Date(formData.createdAt).toLocaleString()}</span>
              {formData.updatedAt && (
                <>
                  <span className="mx-2">|</span>
                  <span>Last Updated: {new Date(formData.updatedAt).toLocaleString()}</span>
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-3 border-t pt-5">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">Save Activity</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityEditor;