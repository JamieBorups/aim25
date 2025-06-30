

import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'https://esm.sh/immer';
import { FormData, Task, Activity, BudgetItem, Report, ReportHighlight } from '../types';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import FormField from './ui/FormField';
import { useBudgetCalculations } from '../hooks/useBudgetCalculations';
import { REVENUE_FIELDS, EXPENSE_FIELDS } from '../constants';
import { initialReportData } from '../constants';
import { TextareaWithCounter } from './ui/TextareaWithCounter';
import { CheckboxGroup } from './ui/CheckboxGroup';
import { RadioGroup } from './ui/RadioGroup';

const formatCurrency = (value: number | undefined | null) => {
    const num = value || 0;
    return num.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
};

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


interface BudgetReportTablesProps {
    project: FormData;
    actuals: Map<string, number>;
}

const BudgetReportTables: React.FC<BudgetReportTablesProps> = ({ project, actuals }) => {
    const budget = project.budget;
    const { totalRevenue, totalExpenses, projectedAudience, totalTickets } = useBudgetCalculations(budget);
    const totalActualExpenses = Array.from(actuals.values()).reduce((sum, val) => sum + val, 0);
    const getActual = (id: string) => actuals.get(id) || 0;

    const ReportSection: React.FC<{title: string, className?: string}> = ({title, className=""}) => (
        <div className={`bg-slate-700 text-white font-semibold p-1.5 mt-4 text-sm ${className}`}>{title}</div>
    );

    const renderRows = (items: BudgetItem[], fields: { key: string, label: string }[], showDescription: boolean = true) => {
        const fieldMap = new Map(fields.map(f => [f.key, f.label]));
        return items.map(item => {
            const projectedAmount = item.amount || 0;
            const actualAmount = getActual(item.id);
            const rowData: (string|React.ReactNode)[] = [fieldMap.get(item.source) || item.source];
            
            if (showDescription) { // 4 column layout
                 rowData.push(formatCurrency(projectedAmount));
                 rowData.push(formatCurrency(actualAmount));
                 rowData.push(item.description);
            } else { // 3 column layout
                rowData.push(formatCurrency(projectedAmount));
                rowData.push(formatCurrency(actualAmount));
            }
            return rowData;
        });
    };
    
    const GenericTable: React.FC<{headers: string[], rows: (string|number|React.ReactNode)[][], isTotal?: boolean }> = ({headers, rows, isTotal=false}) => (
         <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse border border-slate-300">
                {!isTotal && (
                    <thead>
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className={`p-2 border border-slate-300 bg-slate-100 font-semibold text-slate-600 text-left ${h.toLowerCase().includes('projected') || h.toLowerCase().includes('actual') || h.toLowerCase().includes('requested') || h.toLowerCase().includes('awarded') || h.toLowerCase().includes('capacity') || h.toLowerCase().includes('price') || h.toLowerCase().includes('audience') ? 'text-right' : ''}`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-t border-slate-300 bg-white hover:bg-slate-50">
                            {row.map((cell, j) => (
                                <td key={j} className={`p-2 border-b border-slate-300 ${isTotal ? 'font-bold' : ''} ${typeof cell === 'number' || (typeof cell === 'string' && cell.startsWith('$')) ? 'text-right' : ''}`}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
      <div className="bg-slate-50 border p-4 rounded-md mt-6">
            <ReportSection title="Total budget" />
            <GenericTable
                headers={["", "Projected revenues", "Actual revenues", "Projected expenses", "Actual expenses"]}
                rows={[["Total budget", formatCurrency(totalRevenue), formatCurrency(totalRevenue), formatCurrency(totalExpenses), formatCurrency(totalActualExpenses)]]}
                isTotal
            />
            
            <ReportSection title="Revenue: Grants" />
            <GenericTable headers={["", "Requested", "Awarded", "Description"]} rows={renderRows(budget.revenues.grants, REVENUE_FIELDS.grants)} />
            
            <ReportSection title="Revenue: Tickets and box office" />
            <GenericTable
                headers={["", "Number of venues (projected)", "Number of venues (actual)", "% of venue sold out (projected)", "% of venue sold out (actual)", "Average venue capacity (projected)", "Average venue capacity (actual)", "Description"]}
                rows={[["Venue information", budget.revenues.tickets.numVenues, "N/A", `${budget.revenues.tickets.percentCapacity}%`, "N/A", budget.revenues.tickets.venueCapacity, "N/A", budget.revenues.tickets.description]]}
            />
            <div className="mt-[-1px]"><GenericTable headers={["", "Projected", "Actual", "Description"]} rows={[["Average ticket price", formatCurrency(budget.revenues.tickets.avgTicketPrice), "N/A", ""]]} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-[-1px]">
                <GenericTable headers={["", "Projected", "Actual"]} rows={[["Total audience", projectedAudience.toFixed(0), "N/A"]]} />
                <GenericTable headers={["", "Projected", "Actual"]} rows={[["Total tickets or box office", formatCurrency(totalTickets), "N/A"]]} />
            </div>

            <ReportSection title="Revenue: Sales" />
            <GenericTable headers={['Source', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.revenues.sales, REVENUE_FIELDS.sales)} />
            
            <ReportSection title="Revenue: Fundraising" />
            <GenericTable headers={['Source', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.revenues.fundraising, REVENUE_FIELDS.fundraising)} />

            <ReportSection title="Revenue: Contributions" />
            <GenericTable headers={['Source', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.revenues.contributions, REVENUE_FIELDS.contributions)} />
            
            <ReportSection title="Total revenue" />
            <GenericTable headers={['', 'Projected', 'Actual']} rows={[['Total revenues', formatCurrency(totalRevenue), formatCurrency(totalRevenue)]]} isTotal />

            <ReportSection title="Expenses: Professional fees and honorariums" />
            <GenericTable headers={['Expense Item', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.expenses.professionalFees, EXPENSE_FIELDS.professionalFees)} />
            
            <ReportSection title="Expenses: Travel" />
            <GenericTable headers={['Expense Item', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.expenses.travel, EXPENSE_FIELDS.travel)} />
            
            <ReportSection title="Expenses: Production and publication costs" />
            <GenericTable headers={['Expense Item', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.expenses.production, EXPENSE_FIELDS.production)} />

            <ReportSection title="Expenses: Administration" />
            <GenericTable headers={['Expense Item', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.expenses.administration, EXPENSE_FIELDS.administration)} />

            <ReportSection title="Expenses: Research" />
            <GenericTable headers={['Expense Item', 'Projected', 'Actual']} rows={renderRows(budget.expenses.research, EXPENSE_FIELDS.research, false)} />
            
            <ReportSection title="Expenses: Professional development" />
            <GenericTable headers={['Expense Item', 'Projected', 'Actual']} rows={renderRows(budget.expenses.professionalDevelopment, EXPENSE_FIELDS.professionalDevelopment, false)} />

            <ReportSection title="Total expenses" />
            <GenericTable headers={['', 'Projected', 'Actual']} rows={[['Total expenses', formatCurrency(totalExpenses), formatCurrency(totalActualExpenses)]]} isTotal/>
      </div>
    );
};


const SectionTitle: React.FC<{ title: string, children?: React.ReactNode }> = ({ title, children }) => (
    <details open className="mb-4">
        <summary className="text-xl font-bold text-slate-700 py-2 cursor-pointer list-none flex items-center gap-2 border-b">
            <i className="fa fa-angle-down"></i>
            {title}
        </summary>
        <div className="pt-4">
            {children}
        </div>
    </details>
);

const ReportField: React.FC<{ label?: string, instructions?: React.ReactNode, value?: React.ReactNode, children?: React.ReactNode; disabled?: boolean }> = ({ label, instructions, value, children, disabled = false }) => (
    <div className="mb-6">
        {label && <div className="text-md font-semibold text-slate-800">{label}</div>}
        {instructions && <div className="text-sm text-slate-500 my-1 prose-sm max-w-none">{instructions}</div>}
        <div className={`mt-1 ${disabled ? 'opacity-70' : ''}`}>
            {value}
            <div className={disabled ? 'pointer-events-none' : ''}>{children}</div>
        </div>
    </div>
);

interface ReportsPrototypePageProps {
  projects: FormData[];
  tasks: Task[];
  activities: Activity[];
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
}

const ReportsPrototypePage: React.FC<ReportsPrototypePageProps> = ({ projects, tasks, activities, reports, setReports }) => {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [activeTab, setActiveTab] = useState('description');
    
    const [isEditing, setIsEditing] = useState(false);
    const [reportData, setReportData] = useState<Report | null>(null);
    const [tempReportData, setTempReportData] = useState<Report | null>(null);
    
    const selectedProject = useMemo(() => {
        return projects.find(p => p.id === selectedProjectId);
    }, [selectedProjectId, projects]);
    
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

        setReportData(tempReportData); // Update live data

        setReports(prevReports => {
            const index = prevReports.findIndex(r => r.id === tempReportData.id);
            const newReports = [...prevReports];
            if (index > -1) {
                newReports[index] = tempReportData;
            } else {
                newReports.push(tempReportData);
            }
            return newReports;
        });

        setIsEditing(false);
        setTempReportData(null);
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


    const actuals = useMemo(() => {
        const map = new Map<string, number>();
        if (!selectedProject) return map;

        const taskMap = new Map(tasks.map(t => [t.id, t]));

        activities.forEach(activity => {
            const task = taskMap.get(activity.taskId);
            if (!task || task.projectId !== selectedProject.id || activity.status !== 'Approved' || !task.budgetItemId || task.workType !== 'Paid') {
                return;
            }
            const cost = (activity.hours || 0) * (task.hourlyRate || 0);
            map.set(task.budgetItemId, (map.get(task.budgetItemId) || 0) + cost);
        });
        return map;
    }, [selectedProject, tasks, activities]);

    const projectOptions = [{ value: '', label: 'Select a Project' }, ...projects.map(p => ({ value: p.id, label: p.projectTitle }))];
    const dataForDisplay = isEditing ? tempReportData : reportData;

    const TabButton: React.FC<{ tabId: string, label: string }> = ({ tabId, label }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-semibold text-sm rounded-t-md border-b-2 ${activeTab === tabId ? 'border-teal-500 text-teal-600 bg-slate-100' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            {label}
        </button>
    );
    
    const renderDescriptionTab = () => (
        <>
            <ReportField disabled={!isEditing}>
                <label className="text-md font-semibold text-slate-800 mb-2 block">Describe the project and its results</label>
                <div className="text-sm text-slate-500 my-1 prose prose-sm max-w-none">Consider discussing the following aspects, if applicable:
                    <ul className="list-disc list-inside">
                        <li>What were the highlights of the project?</li>
                        <li>Did the project take you in a surprising direction?</li>
                        <li>During the project, did you make significant changes to the initial concept and artistic vision?</li>
                        <li>Are you satisfied with the result of this project?</li>
                        <li>Which challenges (if any) did you face? Consider both practical and artistic obstacles.</li>
                    </ul>
                </div>
                <TextareaWithCounter
                    id="projectResults"
                    rows={8}
                    value={dataForDisplay?.projectResults || ''}
                    onChange={e => handleTempReportChange('projectResults', e.target.value)}
                    wordLimit={500}
                    disabled={!isEditing}
                />
            </ReportField>
            
            <SectionTitle title="Budget and workplan">
                <ReportField disabled={!isEditing}>
                    <label className="text-md font-semibold text-slate-800 mb-2 block">Describe how you spent the grant</label>
                    <div className="text-sm text-slate-500 my-1 prose prose-sm max-w-none">Consider, for instance:<ul><li>Did the grant adequately fund your project?</li><li>Were significant changes made to the budget?</li></ul>If the actual revenues and expenses in your budget are not balanced and you are posting a surplus or a deficit for this project, address it in the field below.</div>
                     <TextareaWithCounter
                        id="grantSpendingDescription"
                        rows={5}
                        value={dataForDisplay?.grantSpendingDescription || ''}
                        onChange={e => handleTempReportChange('grantSpendingDescription', e.target.value)}
                        wordLimit={300}
                        disabled={!isEditing}
                    />
                </ReportField>
                 <ReportField disabled={!isEditing}>
                    <label className="text-md font-semibold text-slate-800 mb-2 block">Were any adjustments made to the workplan?</label>
                    <TextareaWithCounter
                        id="workplanAdjustments"
                        rows={3}
                        value={dataForDisplay?.workplanAdjustments || ''}
                        onChange={e => handleTempReportChange('workplanAdjustments', e.target.value)}
                        wordLimit={150}
                        disabled={!isEditing}
                    />
                 </ReportField>
                 
                 {selectedProject ? (
                    <BudgetReportTables project={selectedProject} actuals={actuals} />
                 ) : (
                    <div className="p-8 text-center bg-slate-100 rounded-md">
                        <i className="fa-solid fa-file-invoice-dollar text-4xl text-slate-400 mb-3"></i>
                        <p className="text-slate-600 font-semibold">Please select a project to view the budget report.</p>
                    </div>
                 )}
            </SectionTitle>
        </>
    );

    const renderReachTab = () => (
        <>
            <p className="mb-4 text-slate-600">Creating broad access to artistic expression across the province of Manitoba is a key element of the mission of the Manitoba Arts Council. By answering the questions in this section, you can help us understand whether we are adequately serving the entire province in all its diversity.</p>
             <SectionTitle title="The people involved">
                 <ReportField label="Indicate whether the activities funded by this grant actively involved individuals (other than yourself) who identify as ..." disabled={!isEditing}>
                    <CheckboxGroup
                        name="involvedPeople"
                        options={PEOPLE_INVOLVED_OPTIONS}
                        selectedValues={dataForDisplay?.involvedPeople || []}
                        onChange={(values) => handleTempReportChange('involvedPeople', values)}
                        columns={2}
                    />
                 </ReportField>
                 <ReportField label="Indicate if the activities supported by this grant involved ..." disabled={!isEditing}>
                    <CheckboxGroup
                        name="involvedActivities"
                        options={GRANT_ACTIVITIES_OPTIONS}
                        selectedValues={dataForDisplay?.involvedActivities || []}
                        onChange={(values) => handleTempReportChange('involvedActivities', values)}
                        columns={2}
                    />
                 </ReportField>
             </SectionTitle>
        </>
    );
    
    const renderImpactTab = () => (
         <>
            <p className="mb-4 text-slate-600">In this section, we ask you to share with us how this grant has affected the artistic practice of yourself, your group or your organization, and how the activities supported by this grant have had an impact on others in the community. For each statement below, indicate your level of agreement, or select 'Does not apply'.</p>
            {IMPACT_QUESTIONS.map(q => (
                <ReportField key={q.id} label={q.label} instructions={q.instructions} disabled={!isEditing}>
                    <RadioGroup
                        name={q.id}
                        options={IMPACT_OPTIONS}
                        selectedValue={dataForDisplay?.impactStatements[q.id] || ''}
                        onChange={(value) => handleImpactChange(q.id, value)}
                    />
                </ReportField>
            ))}
        </>
    );

    const renderClosingTab = () => (
        <>
            <p className="mb-4 text-slate-600">In this final section, you are invited to offer feedback about this Manitoba Arts Council program and to share a highlight of your project by uploading photos or recordings</p>
            <SectionTitle title="Share a highlight of your project with MAC">
                 <ReportField label="The Manitoba Arts Council features the work of Manitoba artists on its website, on social media, and in printed and digital publications. Add links to any articles, blog posts, videos, or other media that capture highlights of the activities funded by this grant." disabled={!isEditing}>
                    <div className="space-y-2 border-b border-slate-200 pb-3 mb-3">
                         {tempReportData?.highlights.map(highlight => (
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
            </SectionTitle>
            
            {!isEditing && dataForDisplay?.highlights && dataForDisplay.highlights.length > 0 && (
                <SectionTitle title="View Highlights">
                    <ul className="list-disc list-inside space-y-2">
                        {dataForDisplay.highlights.map(h => (
                            <li key={h.id}>
                                <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline font-semibold">{h.title || h.url}</a>
                            </li>
                        ))}
                    </ul>
                </SectionTitle>
            )}
        </>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Final Report Prototype</h1>
                    <p className="text-slate-500 mt-1">This prototype shows projected vs. actual spending based on approved activities.</p>
                </div>
                <div className="w-full md:w-auto flex-shrink-0 flex items-center gap-4">
                    <div className="w-full md:w-64">
                         <FormField label="Filter by Project" htmlFor="project_filter" className="mb-0">
                            <Select id="project_filter" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} options={projectOptions} />
                        </FormField>
                    </div>
                    {reportData && (
                        <div className="mt-5">
                            {!isEditing ? (
                                <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                                    <i className="fa fa-pencil mr-2"></i>Edit Report
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Cancel</button>
                                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700">
                                        <i className="fa fa-save mr-2"></i>Save Report
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-sm">
                <h1 className="text-2xl font-bold mb-4">{selectedProject?.projectTitle || 'Select a project'} - Final Report</h1>

                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                        <TabButton tabId="description" label="Description" />
                        <TabButton tabId="reach" label="Reach" />
                        <TabButton tabId="impact" label="Impact" />
                        <TabButton tabId="closing" label="In closing" />
                    </nav>
                </div>

                <div className="py-6">
                    {!dataForDisplay && <div className="text-center py-10 text-slate-500">Please select a project to view or edit its report.</div>}
                    {dataForDisplay && activeTab === 'description' && renderDescriptionTab()}
                    {dataForDisplay && activeTab === 'reach' && renderReachTab()}
                    {dataForDisplay && activeTab === 'impact' && renderImpactTab()}
                    {dataForDisplay && activeTab === 'closing' && renderClosingTab()}
                </div>
            </div>
        </div>
    );
};

export default ReportsPrototypePage;
