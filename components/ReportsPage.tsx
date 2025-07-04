import React, { useState, useMemo, useEffect, useRef } from 'react';
import { produce } from 'https://esm.sh/immer';
import { FormData, Member, Task, Report, ReportHighlight, Activity, DirectExpense } from '../types';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import FormField from './ui/FormField';
import ProjectInfoView from './view/ProjectInfoView';
import CollaboratorsView from './view/CollaboratorsView';
import ReportBudgetView from './view/ReportBudgetView';
import { initialReportData } from '../constants';
import { TextareaWithCounter } from './ui/TextareaWithCounter';
import { CheckboxGroup } from './ui/CheckboxGroup';
import { RadioGroup } from './ui/RadioGroup';
import { generateReportPdf } from '../utils/pdfGenerator';
import { useAppContext } from '../context/AppContext';

const PEOPLE_INVOLVED_OPTIONS = [
    { value: 'indigenous', label: '... Indigenous (First Nations, Metis, Inuit, or non-status)' },
    { value: 'disability', label: '... living with a disability or mental illness' },
    { value: 'francophone', label: '... Francophone' },
    { value: 'visibleMinority', label: '... a visible minority' },
    { value: 'deaf', label: '... Deaf' },
    { value: 'underserved', label: '... part of any other underserved community' },
];

const GRANT_ACTIVITIES_OPTIONS = [
    { value: 'collaborators', label: '... collaborators (artistic or cross-sectoral)' },
    { value: 'staff', label: '... staff members' },
    { value: 'teachers', label: '... teachers' },
    { value: 'audience', label: '... audience members' },
    { value: 'volunteers', label: '... volunteers' },
    { value: 'participants', label: '... active participants in any other role' },
    { value: 'elders', label: '... elders or Indigenous Knowledge Keepers' },
    { value: 'students', label: '... students' },
];

const IMPACT_QUESTIONS = [
    { id: 'q1', label: 'Without this grant, working on this project would not have been possible' },
    { id: 'q2', label: 'As a result of the activities funded by this grant, I am thinking more clearly about my artistic practice' },
    { id: 'q3', label: 'This grant has allowed me to (further) develop my artistic skills', instructions: 'This may include improving existing skills and learning new skills' },
    { id: 'q4', label: 'This grant provided an opportunity to experiment, explore, and take artistic risk' },
    { id: 'q5', label: 'My artistic career will benefit and/or has already benefited from this grant' },
    { id: 'q6', label: 'This grant provided an opportunity for artistic collaboration that would not have been possible otherwise' },
    { id: 'q7', label: 'This grant made it possible to deepen connections with past collaborators' },
    { id: 'q8', label: 'This grant made it possible to build relationships with new collaborators' },
    { id: 'q9', label: 'This grant created further artistic opportunities for me', instructions: 'Consider, for instance: Were any meaningful connections developed with other artists or organizations? Did you gain access to additional funding and/or other resources?' },
    { id: 'q10', label: 'This project created new opportunities for the participants involved', instructions: 'Consider, for instance: increased ability for creative self-expression, access to new skills' },
    { id: 'q11', label: 'This project created new opportunities for the community in which it took place', instructions: 'Consider, for instance: providing a voice to underserved and/or marginalized communities; providing an artistic outlet to communities facing a barrier, creating a platform for meaningful community exchange and engagement, strengthening community bonds' },
];

const IMPACT_OPTIONS = [
    { value: '1', label: '1 - Strongly Disagree' },
    { value: '2', label: '2 - Disagree' },
    { value: '3', label: '3 - Neutral' },
    { value: '4', label: '4 - Agree' },
    { value: '5', label: '5 - Strongly Agree' },
    { value: 'na', label: "Does not apply" },
];


const ReportSection: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className="" }) => (
    <div className={`mb-12 ${className}`}>
        <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">{title}</h2>
        <div className="space-y-6">{children}</div>
    </div>
);

const ReportField: React.FC<{ label?: string, instructions?: React.ReactNode, children: React.ReactNode; disabled?: boolean }> = ({ label, instructions, children, disabled = false }) => (
    <div className={disabled ? 'pointer-events-none opacity-70' : ''}>
        {label && <div className="text-md font-semibold text-slate-800">{label}</div>}
        {instructions && <div className="text-sm text-slate-500 my-1 prose prose-slate max-w-none">{instructions}</div>}
        <div className="mt-2">
            {children}
        </div>
    </div>
);

const ReportsPage: React.FC = () => {
  const { projects, members, tasks, activities, directExpenses, reports, setReports, notify, reportProjectIdToOpen, setReportProjectIdToOpen } = useAppContext();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [reportData, setReportData] = useState<Report | null>(null);
  const [tempReportData, setTempReportData] = useState<Report | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const reportContentRef = useRef<HTMLDivElement>(null);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);
  
  const projectTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter(t => t.projectId === selectedProjectId);
  }, [selectedProjectId, tasks]);

  const actuals = useMemo(() => {
    const map = new Map<string, number>();
    if (!selectedProject) return map;

    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    // Process Activities
    activities.forEach(activity => {
        const task = taskMap.get(activity.taskId);
        if (!task || task.projectId !== selectedProject.id || activity.status !== 'Approved' || !task.budgetItemId || task.workType !== 'Paid') {
            return;
        }
        const cost = (activity.hours || 0) * (task.hourlyRate || 0);
        map.set(task.budgetItemId, (map.get(task.budgetItemId) || 0) + cost);
    });

    // Process Direct Expenses
    directExpenses.forEach(expense => {
        if (expense.projectId !== selectedProject.id) return;
        map.set(expense.budgetItemId, (map.get(expense.budgetItemId) || 0) + expense.amount);
    });

    return map;
  }, [selectedProject, tasks, activities, directExpenses]);

  useEffect(() => {
    if (reportProjectIdToOpen) {
        setSelectedProjectId(reportProjectIdToOpen);
        setReportProjectIdToOpen(null); // Reset after use
    }
  }, [reportProjectIdToOpen, setReportProjectIdToOpen]);

  useEffect(() => {
    if (!selectedProjectId || !selectedProject) {
        setReportData(null);
        setIsEditing(false);
        setTempReportData(null);
        return;
    }

    const existingReport = reports.find(r => r.projectId === selectedProjectId);
    if (existingReport) {
        setReportData(existingReport);
    } else {
        const newReport: Report = {
            ...initialReportData,
            id: `rep_${selectedProjectId}`,
            projectId: selectedProjectId,
            projectResults: selectedProject.projectDescription || '',
        };
        setReportData(newReport);
    }
    setIsEditing(false);
    setTempReportData(null);
  }, [selectedProjectId, selectedProject, reports]);
  
  const handleEdit = () => {
    setTempReportData(reportData);
    setIsEditing(true);
  };
  
  const handleCancel = () => {
      setTempReportData(null);
      setIsEditing(false);
  };

  const handleSave = () => {
      if (!tempReportData) return;
      setReportData(tempReportData);
      setReports(prevReports => {
          const index = prevReports.findIndex(r => r.id === tempReportData.id);
          if (index > -1) {
              const newReports = [...prevReports];
              newReports[index] = tempReportData;
              return newReports;
          } else {
              return [...prevReports, tempReportData];
          }
      });
      setIsEditing(false);
      setTempReportData(null);
      notify('Report saved successfully!', 'success');
  };

  const handleTempReportChange = (field: keyof Report, value: any) => {
    if (!tempReportData) return;
    setTempReportData(produce(tempReportData, draft => {
        (draft as any)[field] = value;
    }));
  };
  
  const handleImpactChange = (questionId: string, value: string) => {
    if (!tempReportData) return;
    setTempReportData(produce(tempReportData, draft => {
        draft.impactStatements[questionId] = value;
    }));
  };
    
  const handleHighlightChange = (id: string, field: 'title' | 'url', value: string) => {
      if (!tempReportData) return;
      setTempReportData(produce(tempReportData, draft => {
          const highlight = draft.highlights.find(h => h.id === id);
          if(highlight) {
              highlight[field] = value;
          }
      }));
  };
    
  const handleAddHighlight = () => {
      if (!tempReportData) return;
      setTempReportData(produce(tempReportData, draft => {
          draft.highlights.push({ id: `hl_${Date.now()}`, title: '', url: '' });
      }));
  };
    
  const handleRemoveHighlight = (id: string) => {
      if (!tempReportData) return;
      setTempReportData(produce(tempReportData, draft => {
          draft.highlights = draft.highlights.filter(h => h.id !== id);
      }));
  };
  
  const handleGeneratePdf = async () => {
    if (!selectedProject || !reportData) {
        notify("Please select a project with a report to generate a PDF.", 'warning');
        return;
    }
    setIsGeneratingPdf(true);
    notify('Generating PDF...', 'info');
    try {
        await generateReportPdf(selectedProject, reportData, members, projectTasks, actuals, {
            IMPACT_QUESTIONS,
            IMPACT_OPTIONS,
            PEOPLE_INVOLVED_OPTIONS,
            GRANT_ACTIVITIES_OPTIONS,
        });
        notify('PDF generation complete!', 'success');
    } catch (error) {
        console.error("PDF Generation failed:", error);
        notify('Failed to generate PDF. See console for details.', 'error');
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const dataForDisplay = isEditing ? tempReportData : reportData;

  const renderContent = () => {
    if (!selectedProject) {
      return <div className="text-center text-slate-500 py-10">Please select a project to view its report.</div>;
    }
    if (!dataForDisplay) {
      return <div className="text-center text-slate-500 py-10">Loading report data...</div>;
    }
    
    return (
        <div ref={reportContentRef} className="bg-white p-4 sm:p-6">
            <ReportSection title="Project Information">
                <ReportField label="Describe the project and its results" disabled={!isEditing}>
                    <TextareaWithCounter
                        id="projectResults"
                        rows={8}
                        value={dataForDisplay.projectResults || ''}
                        onChange={e => handleTempReportChange('projectResults', e.target.value)}
                        wordLimit={500}
                    />
                </ReportField>
                <div className="pl-4 border-l-4 border-slate-200">
                    <ProjectInfoView project={selectedProject} hideTitle={true} />
                </div>
            </ReportSection>
            
            <ReportSection title="Collaborators">
                 <CollaboratorsView project={selectedProject} />
            </ReportSection>
            
            <ReportSection title="Budget Report">
                <ReportField label="Describe how you spent the grant" disabled={!isEditing}>
                     <TextareaWithCounter
                        id="grantSpendingDescription"
                        rows={5}
                        value={dataForDisplay.grantSpendingDescription || ''}
                        onChange={e => handleTempReportChange('grantSpendingDescription', e.target.value)}
                        wordLimit={300}
                    />
                </ReportField>
                <ReportBudgetView project={selectedProject} actuals={actuals} />
            </ReportSection>

            <ReportSection title="Workplan">
                <ReportField label="Were any adjustments made to the workplan?" disabled={!isEditing}>
                    <TextareaWithCounter
                        id="workplanAdjustments"
                        rows={3}
                        value={dataForDisplay.workplanAdjustments || ''}
                        onChange={e => handleTempReportChange('workplanAdjustments', e.target.value)}
                        wordLimit={150}
                    />
                 </ReportField>
                 <div className="overflow-x-auto border border-slate-200 rounded-lg mt-4">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-100">
                             <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Task</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Assignee</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</th>
                             </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {projectTasks.map(task => (
                                <tr key={task.id}>
                                    <td className="px-4 py-2 text-sm font-medium text-slate-800">{task.title}</td>
                                    <td className="px-4 py-2 text-sm text-slate-600">{members.find(m=>m.id === task.assignedMemberId)?.firstName || 'Unassigned'}</td>
                                    <td className="px-4 py-2 text-sm text-slate-600">{task.status}</td>
                                    <td className="px-4 py-2 text-sm text-slate-600">{task.dueDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </ReportSection>

            <ReportSection title="Final Report: Reach">
                 <ReportField label="Indicate whether the activities funded by this grant actively involved individuals (other than yourself) who identify as ..." disabled={!isEditing}>
                    <CheckboxGroup
                        name="involvedPeople"
                        options={PEOPLE_INVOLVED_OPTIONS}
                        selectedValues={dataForDisplay.involvedPeople || []}
                        onChange={(values) => handleTempReportChange('involvedPeople', values)}
                        columns={2}
                    />
                 </ReportField>
                 <ReportField label="Indicate if the activities supported by this grant involved ..." disabled={!isEditing}>
                    <CheckboxGroup
                        name="involvedActivities"
                        options={GRANT_ACTIVITIES_OPTIONS}
                        selectedValues={dataForDisplay.involvedActivities || []}
                        onChange={(values) => handleTempReportChange('involvedActivities', values)}
                        columns={2}
                    />
                 </ReportField>
            </ReportSection>
            
            <ReportSection title="Final Report: Impact">
                {IMPACT_QUESTIONS.map(q => (
                    <ReportField key={q.id} label={q.label} instructions={q.instructions} disabled={!isEditing}>
                        <RadioGroup
                            name={q.id}
                            options={IMPACT_OPTIONS}
                            selectedValue={dataForDisplay.impactStatements[q.id] || ''}
                            onChange={(value) => handleImpactChange(q.id, value)}
                        />
                    </ReportField>
                ))}
            </ReportSection>

            <ReportSection title="Additional Information and Assets" className="mt-12">
                 <ReportField label="Share highlights of your project (articles, videos, etc.)" disabled={!isEditing}>
                    <div className="space-y-2 border-b border-slate-200 pb-3 mb-3">
                         {(dataForDisplay.highlights || []).map(highlight => (
                             <div key={highlight.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-5">
                                    <Input 
                                        type="text" 
                                        placeholder="Title"
                                        aria-label="Highlight Title"
                                        value={highlight.title}
                                        onChange={(e) => handleHighlightChange(highlight.id, 'title', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-6">
                                    <Input 
                                        type="url"
                                        placeholder="https://example.com"
                                        aria-label="Highlight URL"
                                        value={highlight.url}
                                        onChange={(e) => handleHighlightChange(highlight.id, 'url', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-1 text-right">
                                     <button type="button" onClick={() => handleRemoveHighlight(highlight.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label="Remove Highlight">
                                        <i className="fa-solid fa-trash-alt fa-fw"></i>
                                    </button>
                                </div>
                             </div>
                         ))}
                     </div>
                     <button type="button" onClick={handleAddHighlight} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">
                        <i className="fa fa-plus mr-2"></i>Add Link
                     </button>
                 </ReportField>
            </ReportSection>
        </div>
    );
  };
  
  return (
    <div className="bg-white shadow-lg rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4 p-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Final Report Generator</h1>
                <p className="text-slate-500 mt-1">Select a project to view, edit, or generate its final report.</p>
            </div>
            <div className="w-full md:w-auto flex-shrink-0 flex items-center gap-4">
                <div className="w-full md:w-64">
                     <FormField label="Select Project" htmlFor="project_filter" className="mb-0">
                        <Select id="project_filter" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} options={[{ value: '', label: 'Select a Project' }, ...projects.map(p => ({ value: p.id, label: p.projectTitle }))]} />
                    </FormField>
                </div>
                {reportData && (
                    <div className="mt-5 flex items-center gap-2">
                        {!isEditing ? (
                            <>
                            <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                                <i className="fa-solid fa-pencil mr-2"></i>Edit
                            </button>
                             <button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:bg-slate-400">
                                <i className={`mr-2 ${isGeneratingPdf ? 'fa fa-spinner fa-spin' : 'fa fa-file-pdf'}`}></i>
                                {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
                            </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Cancel</button>
                                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">
                                    <i className="fa fa-save mr-2"></i>Save
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
        
        {renderContent()}
    </div>
  );
};

export default ReportsPage;