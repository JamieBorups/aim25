



import React, { useState, useMemo, useEffect, useRef } from 'react';
import { produce } from 'immer';
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
    { id: 'q11', label: 'This project created new opportunities for the community in which it took place', instructions: 'Consider, for instance: providing a voice to an underserved and/or marginalized communities; providing an artistic outlet to communities facing a barrier, creating a platform for meaningful community exchange and engagement, strengthening community bonds' },
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
  const { state, dispatch, notify } = useAppContext();
  const { projects, members, tasks, activities, directExpenses, reports, reportProjectIdToOpen, settings } = state;
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
        dispatch({ type: 'SET_REPORT_PROJECT_ID_TO_OPEN', payload: null }); // Reset after use
    }
  }, [reportProjectIdToOpen, dispatch]);

  useEffect(() => {
    if (!selectedProjectId) {
      setReportData(null);
      setIsEditing(false);
      setTempReportData(null);
      return;
    }
    
    const projectForReport = projects.find(p => p.id === selectedProjectId);
    if (!projectForReport) {
      // This can happen if projects are still loading or ID is invalid
      setReportData(null);
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
            projectResults: projectForReport.projectDescription || '',
        };
        setReportData(newReport);
    }
    setIsEditing(false);
    setTempReportData(null);
  }, [selectedProjectId, projects, reports]);
  
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
      const reportsPayload = state.reports.some(r => r.id === tempReportData.id)
        ? state.reports.map(r => r.id === tempReportData.id ? tempReportData : r)
        : [...state.reports, tempReportData];
      
      dispatch({ type: 'SET_REPORTS', payload: reportsPayload });
      
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
        }, settings);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        notify("An error occurred while generating the PDF. Please try again.", 'error');
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const projectOptions = useMemo(() => {
    return projects.map(p => ({
        value: p.id,
        label: `${p.projectTitle} [${p.status}]`
    }));
  }, [projects]);


  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <div className="w-full max-w-sm">
                <FormField label="Select a Project to View/Generate Report" htmlFor="report_project_select" className="mb-0">
                    <Select
                        id="report_project_select"
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        options={[
                            { value: '', label: 'Select a project...' },
                            ...projectOptions
                        ]}
                    />
                </FormField>
            </div>
        </div>

        {!selectedProject ? (
            <div className="text-center py-20">
                <i className="fa-solid fa-file-invoice text-7xl text-slate-300"></i>
                <h3 className="mt-6 text-xl font-medium text-slate-800">No Project Selected</h3>
                <p className="text-slate-500 mt-2 text-base">Please select a project from the dropdown above to view its report.</p>
            </div>
        ) : !reportData ? (
             <div className="text-center py-20">
                <i className="fa-solid fa-spinner fa-spin text-7xl text-slate-300"></i>
                <h3 className="mt-6 text-xl font-medium text-slate-800">Loading Report...</h3>
            </div>
        ) : (
            <div>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-teal-700">{selectedProject.projectTitle}</h2>
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save Report</button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                                    <i className="fa-solid fa-pencil mr-2"></i>Edit Report
                                </button>
                                <button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700 disabled:bg-slate-400">
                                    <i className={`fa-solid ${isGeneratingPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-2`}></i>
                                    {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div ref={reportContentRef}>
                    <ReportSection title="Project Description">
                        <ReportField label="Briefly describe the project and its results.">
                            <TextareaWithCounter wordLimit={750} rows={10} value={isEditing ? tempReportData?.projectResults : reportData.projectResults} onChange={e => handleTempReportChange('projectResults', e.target.value)} disabled={!isEditing} />
                        </ReportField>
                    </ReportSection>
                    
                    <ReportSection title="Financial Report">
                        <ReportField label="Briefly describe how you spent the grant.">
                             <TextareaWithCounter wordLimit={300} rows={5} value={isEditing ? tempReportData?.grantSpendingDescription : reportData.grantSpendingDescription} onChange={e => handleTempReportChange('grantSpendingDescription', e.target.value)} disabled={!isEditing} />
                        </ReportField>
                        <ReportBudgetView project={selectedProject} actuals={actuals} settings={settings} />
                    </ReportSection>

                    <ReportSection title="Workplan">
                         <ReportField label="Were any adjustments made to the workplan?">
                             <TextareaWithCounter wordLimit={200} rows={4} value={isEditing ? tempReportData?.workplanAdjustments : reportData.workplanAdjustments} onChange={e => handleTempReportChange('workplanAdjustments', e.target.value)} disabled={!isEditing} />
                        </ReportField>
                    </ReportSection>

                    <ReportSection title="Community Reach">
                        <ReportField label="My activities actively involved individuals who identify as:" instructions="Select all that apply.">
                            <CheckboxGroup name="involvedPeople" options={PEOPLE_INVOLVED_OPTIONS} selectedValues={isEditing ? tempReportData?.involvedPeople || [] : reportData.involvedPeople} onChange={value => handleTempReportChange('involvedPeople', value)} columns={2} />
                        </ReportField>
                         <ReportField label="The activities supported by this grant involved:" instructions="Select all that apply.">
                            <CheckboxGroup name="involvedActivities" options={GRANT_ACTIVITIES_OPTIONS} selectedValues={isEditing ? tempReportData?.involvedActivities || [] : reportData.involvedActivities} onChange={value => handleTempReportChange('involvedActivities', value)} columns={2} />
                        </ReportField>
                    </ReportSection>

                    <ReportSection title="Impact Assessment">
                        {IMPACT_QUESTIONS.map(q => (
                            <ReportField key={q.id} label={q.label} instructions={q.instructions}>
                                <RadioGroup
                                    name={q.id}
                                    options={IMPACT_OPTIONS}
                                    selectedValue={isEditing ? tempReportData?.impactStatements[q.id] || '' : reportData.impactStatements[q.id] || ''}
                                    onChange={value => handleImpactChange(q.id, value)}
                                />
                            </ReportField>
                        ))}
                    </ReportSection>
                    
                    <ReportSection title="Closing">
                        <ReportField label="Project Highlights" instructions="Provide links to documentation of your project (e.g., photos, videos, press).">
                           <div className="space-y-3">
                                {(isEditing ? tempReportData?.highlights : reportData.highlights)?.map(highlight => (
                                    <div key={highlight.id} className="grid grid-cols-12 gap-3 items-center">
                                        <Input className="col-span-5" placeholder="Title (e.g., Photo Gallery)" value={highlight.title} onChange={e => handleHighlightChange(highlight.id, 'title', e.target.value)} disabled={!isEditing} />
                                        <Input className="col-span-6" placeholder="URL (e.g., https://...)" value={highlight.url} onChange={e => handleHighlightChange(highlight.id, 'url', e.target.value)} disabled={!isEditing} />
                                        <button onClick={() => handleRemoveHighlight(highlight.id)} disabled={!isEditing} className="col-span-1 text-red-500 hover:text-red-700 disabled:text-slate-300"><i className="fa-solid fa-trash-alt"></i></button>
                                    </div>
                                ))}
                                {isEditing && <button type="button" onClick={handleAddHighlight} className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">+ Add Highlight</button>}
                           </div>
                        </ReportField>
                        
                        <ReportField label="What worked well with the grant program and what could be improved?">
                            <TextareaWithCounter wordLimit={250} rows={4} value={isEditing ? tempReportData?.feedback : reportData.feedback} onChange={e => handleTempReportChange('feedback', e.target.value)} disabled={!isEditing} />
                        </ReportField>
                        
                        <ReportField label="Is there anything else you would like to share?">
                            <TextareaWithCounter wordLimit={250} rows={4} value={isEditing ? tempReportData?.additionalFeedback : reportData.additionalFeedback} onChange={e => handleTempReportChange('additionalFeedback', e.target.value)} disabled={!isEditing} />
                        </ReportField>
                    </ReportSection>
                </div>
            </div>
        )}
    </div>
  );
};

export default ReportsPage;