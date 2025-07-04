

import React, { useMemo, useState } from 'react';
import { produce } from 'https://esm.sh/immer';
import { DetailedBudget, BudgetItem, Task, Activity, DirectExpense, ExpenseCategoryType, FormData, BudgetItemStatus } from '../../types';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { REVENUE_FIELDS, EXPENSE_FIELDS } from '../../constants';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useAppContext } from '../../context/AppContext';


interface BudgetViewProps {
    project: FormData;
    tasks: Task[];
    activities: Activity[];
    directExpenses: DirectExpense[];
    onSave: (project: FormData) => void;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const StatusBadge: React.FC<{ status: BudgetItemStatus }> = ({ status }) => {
    const statusClasses: Record<BudgetItemStatus, string> = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Approved: 'bg-green-100 text-green-800',
        Denied: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const RevenueViewField: React.FC<{ label: string; value?: React.ReactNode; description?: string; align?: 'left' | 'right' }> = ({ label, value, description, align = 'left' }) => (
    <div className="py-2.5 grid grid-cols-2 gap-4 border-b border-slate-200 last:border-b-0">
        <div className="text-sm text-slate-600">
            {label}
            {description && <p className="text-xs text-slate-400 italic mt-0.5">{description}</p>}
        </div>
        <div className={`text-sm text-slate-800 font-medium ${align === 'right' ? 'text-right' : ''}`}>{value}</div>
    </div>
);

const RevenueSection: React.FC<{ 
    title: string; 
    children: React.ReactNode; 
    budgetTotal: number;
    actualTotal: number;
}> = ({title, children, budgetTotal, actualTotal}) => (
     <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6">
        <h3 className="text-base font-bold text-slate-700 border-b border-slate-200 pb-2 mb-3">{title}</h3>
        {children}
        <div className="grid grid-cols-2 gap-4 text-right font-bold mt-3 pt-3 border-t-2 border-slate-200 text-slate-800 text-base">
            <div>
                <span className="text-xs text-slate-500 font-semibold uppercase block">Budgeted</span>
                {formatCurrency(budgetTotal)}
            </div>
             <div>
                <span className="text-xs text-teal-600 font-semibold uppercase block">Actual</span>
                {formatCurrency(actualTotal)}
            </div>
        </div>
    </div>
);

const RevenueCategoryItemsView: React.FC<{ 
    items: BudgetItem[], 
    categoryPath: (string|number)[], 
    onUpdateRevenue: (path: (string | number)[], value: number) => void, 
    onSetEditingRevenueId: (id: string | null) => void, 
    editingRevenueId: string | null 
}> = ({ items, categoryPath, onUpdateRevenue, onSetEditingRevenueId, editingRevenueId }) => {
    if (!items || items.length === 0) {
        return <p className="text-sm text-slate-400 italic py-2">No items in this category.</p>;
    }
    const fieldMap = new Map(REVENUE_FIELDS[categoryPath[1] as keyof typeof REVENUE_FIELDS].map(f => [f.key, f.label]));
    
    return (
        <div className="space-y-1">
             <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-right">Budgeted</div>
                <div className="col-span-3 text-right">Actual</div>
            </div>
            {items.map((item, index) => {
                const label = fieldMap.get(item.source) || item.source;
                const isEditing = editingRevenueId === item.id;
                const isDenied = item.status === 'Denied';
                return (
                    <div key={item.id} className={`grid grid-cols-12 gap-2 items-center hover:bg-slate-100 rounded p-2 group ${isDenied ? 'opacity-50' : ''}`}>
                         <div className="col-span-6 text-sm">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={item.status || 'Pending'} />
                              <p className={`text-slate-800 font-medium ${isDenied ? 'line-through' : ''}`}>{label}</p>
                            </div>
                            <p className="text-xs text-slate-500 pl-8">{item.description}</p>
                        </div>
                        <div className={`col-span-3 text-right text-sm text-slate-600 ${isDenied ? 'line-through' : ''}`}>{formatCurrency(item.amount)}</div>
                        <div className="col-span-3 text-right text-sm font-semibold text-teal-700 cursor-pointer" onClick={() => onSetEditingRevenueId(item.id)}>
                            {isEditing ? (
                                <Input 
                                    type="number" 
                                    defaultValue={item.actualAmount || ''}
                                    onBlur={(e) => {
                                        onUpdateRevenue([...categoryPath, index, 'actualAmount'], parseFloat(e.target.value) || 0);
                                        onSetEditingRevenueId(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    autoFocus
                                    className="text-right py-1"
                                />
                            ) : (
                               <>
                                    {formatCurrency(item.actualAmount || 0)} <i className="fa-solid fa-pencil text-xs text-slate-300 ml-1 group-hover:text-teal-600 transition-colors"></i>
                               </>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


const BudgetView: React.FC<BudgetViewProps> = ({ project, onSave, tasks, activities, directExpenses }) => {
    const { setDirectExpenses, members } = useAppContext();
    const budget = project.budget;
    const [expenseModalState, setExpenseModalState] = useState<{isOpen: boolean, category?: ExpenseCategoryType}>({isOpen: false});
    const [editingRevenueId, setEditingRevenueId] = useState<string | null>(null);
    const [detailsModalItemId, setDetailsModalItemId] = useState<string | null>(null);

    const budgetCalculations = useBudgetCalculations(budget);
    
    const { actualsByBudgetItem, totalContributedValue, totalActualPaidExpenses } = useMemo(() => {
        const actuals = new Map<string, { cost: number, contributedValue: number, hours: number }>();
        const taskMap = new Map(tasks.map(t => [t.id, t]));

        // 1. Process time-based activities
        activities.forEach(activity => {
            if (activity.status !== 'Approved') return;

            const task = taskMap.get(activity.taskId);
            if (!task || !task.budgetItemId) return;

            const current = actuals.get(task.budgetItemId) || { cost: 0, contributedValue: 0, hours: 0 };
            const value = (activity.hours || 0) * (task.hourlyRate || 0);

            if (task.workType === 'Paid') {
                current.cost += value;
            } else { // 'In-Kind' or 'Volunteer'
                current.contributedValue += value;
            }
            current.hours += (activity.hours || 0);
            actuals.set(task.budgetItemId, current);
        });

        // 2. Process direct expenses
        directExpenses.forEach(expense => {
            const current = actuals.get(expense.budgetItemId) || { cost: 0, contributedValue: 0, hours: 0 };
            current.cost += expense.amount;
            actuals.set(expense.budgetItemId, current);
        });

        const totalContributed = Array.from(actuals.values()).reduce((sum, item) => sum + item.contributedValue, 0);
        const totalActualPaid = Array.from(actuals.values()).reduce((sum, item) => sum + item.cost, 0);

        return { 
            actualsByBudgetItem: actuals, 
            totalContributedValue: totalContributed, 
            totalActualPaidExpenses: totalActualPaid 
        };
    }, [tasks, activities, directExpenses]);

    const handleUpdateRevenue = (path: (string | number)[], value: number) => {
        const updatedProject = produce(project, draft => {
            let current: any = draft.budget;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
        });
        onSave(updatedProject);
    };

    const handleAddDirectExpense = (expense: DirectExpense) => {
        setDirectExpenses(prev => [...prev, expense]);
    };
    
    const ExpenseCategoryView: React.FC<{title: string; categoryKey: ExpenseCategoryType; items: BudgetItem[]; fields: {key: string, label: string}[]}> = ({ title, categoryKey, items, fields }) => {
        const categoryTotalBudgeted = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const categoryTotalActual = items.reduce((sum, item) => {
            const actual = actualsByBudgetItem.get(item.id);
            return sum + (actual ? actual.cost : 0);
        }, 0);
        const categoryVariance = categoryTotalBudgeted - categoryTotalActual;

        if (items.length === 0) return null;
        const fieldMap = new Map(fields.map(f => [f.key, f.label]));

        return (
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                    <h3 className="text-base font-bold text-slate-700">{title}</h3>
                    <button onClick={() => setExpenseModalState({isOpen: true, category: categoryKey})} className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600">
                        <i className="fa-solid fa-plus fa-xs mr-1"></i>Log
                    </button>
                </div>
                <div className="grid grid-cols-10 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                    <div className="col-span-4">Item</div>
                    <div className="col-span-2 text-right">Budgeted</div>
                    <div className="col-span-2 text-right">Actual</div>
                    <div className="col-span-2 text-right">Variance</div>
                </div>
                <div className="space-y-1">
                {items.map(item => {
                    const actual = actualsByBudgetItem.get(item.id) || { cost: 0, hours: 0 };
                    const variance = item.amount - actual.cost;
                    const label = fieldMap.get(item.source) || item.source;
                    return (
                        <div key={item.id} className="grid grid-cols-10 gap-4 items-center py-1.5 border-b border-slate-100 last:border-b-0 px-2 rounded group">
                            <div className="col-span-4 text-sm">
                                <p className="text-slate-800 font-medium">{label}</p>
                                <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                            <div className="col-span-2 text-right text-sm text-slate-600">{formatCurrency(item.amount)}</div>
                            <div className="col-span-2 text-right text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer" onClick={() => setDetailsModalItemId(item.id)}>
                                {formatCurrency(actual.cost)}
                            </div>
                            <div className={`col-span-2 text-right text-sm font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(variance)}</div>
                        </div>
                    );
                })}
                </div>
                <div className="grid grid-cols-10 gap-4 mt-3 pt-3 border-t-2 border-slate-300 font-bold text-slate-800 text-sm px-2">
                     <div className="col-span-4">Total</div>
                     <div className="col-span-2 text-right">{formatCurrency(categoryTotalBudgeted)}</div>
                     <div className="col-span-2 text-right">{formatCurrency(categoryTotalActual)}</div>
                     <div className={`col-span-2 text-right ${categoryVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(categoryVariance)}</div>
                </div>
            </div>
        );
    };

    const LogExpenseModal = () => {
        const [category, setCategory] = useState<ExpenseCategoryType | ''>(expenseModalState.category || '');
        const [budgetItemId, setBudgetItemId] = useState('');
        const [amount, setAmount] = useState<number>(0);
        const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
        const [description, setDescription] = useState('');

        const categoryOptions = Object.entries(EXPENSE_FIELDS).map(([key, _]) => ({
            value: key,
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        }));

        const budgetItemOptions = useMemo(() => {
            if (!category) return [];
            return budget.expenses[category].map(item => {
                const sourceLabel = EXPENSE_FIELDS[category].find(f => f.key === item.source)?.label || item.source;
                return {
                    value: item.id,
                    label: item.description ? `${sourceLabel}: ${item.description}` : sourceLabel
                };
            });
        }, [category]);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!category || !budgetItemId || amount <= 0) {
                alert("Please fill all required fields.");
                return;
            }
            handleAddDirectExpense({
                id: `dexp_${Date.now()}`,
                projectId: project.id,
                budgetItemId,
                amount,
                date,
                description
            });
            setExpenseModalState({isOpen: false});
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                    <form onSubmit={handleSubmit}>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Log Direct Expense</h3>
                        <div className="space-y-4">
                            <FormField label="Expense Category" htmlFor="exp_cat">
                                <Select options={[{value: '', label: 'Select category...'},...categoryOptions]} value={category} onChange={e => {setCategory(e.target.value as ExpenseCategoryType); setBudgetItemId('');}} />
                            </FormField>
                            <FormField label="Budget Line Item" htmlFor="exp_item">
                                <Select options={[{value: '', label: 'Select item...'},...budgetItemOptions]} value={budgetItemId} onChange={e => setBudgetItemId(e.target.value)} disabled={!category} />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Amount" htmlFor="exp_amount">
                                    <Input type="number" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value) || 0)} step="0.01" />
                                </FormField>
                                <FormField label="Date" htmlFor="exp_date">
                                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                                </FormField>
                            </div>
                            <FormField label="Description / Memo" htmlFor="exp_desc">
                                <Input type="text" value={description} onChange={e => setDescription(e.target.value)} />
                            </FormField>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={() => setExpenseModalState({isOpen: false})} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Log Expense</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const ActualsBreakdownModal = () => {
        if (!detailsModalItemId) return null;
        
        const budgetItem = Object.values(project.budget.expenses).flat().find(i => i.id === detailsModalItemId);
        const directExpensesForItem = directExpenses.filter(e => e.budgetItemId === detailsModalItemId);
        const activitiesForItem = activities.filter(a => {
            const task = tasks.find(t => t.id === a.taskId);
            return task?.budgetItemId === detailsModalItemId && a.status === 'Approved';
        });

        if (!budgetItem) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Actuals Breakdown</h3>
                    <p className="text-slate-600 mb-4">Line Item: <span className="font-semibold">{budgetItem.description || budgetItem.source}</span></p>

                    <div className="max-h-[60vh] overflow-y-auto space-y-4">
                        {directExpensesForItem.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-slate-700">Direct Expenses</h4>
                                <ul className="divide-y divide-slate-200 border border-slate-200 rounded-md mt-1">
                                    {directExpensesForItem.map(e => (
                                        <li key={e.id} className="flex justify-between p-2 text-sm">
                                            <span>{e.description || 'Direct expense'} on {new Date(e.date).toLocaleDateString()}</span>
                                            <span className="font-semibold">{formatCurrency(e.amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {activitiesForItem.length > 0 && (
                             <div>
                                <h4 className="font-semibold text-slate-700">From Time Tracking</h4>
                                <ul className="divide-y divide-slate-200 border border-slate-200 rounded-md mt-1">
                                    {activitiesForItem.map(a => {
                                        const task = tasks.find(t => t.id === a.taskId);
                                        const member = members.find(m => m.id === a.memberId);
                                        const cost = (a.hours || 0) * (task?.hourlyRate || 0);
                                        return (
                                            <li key={a.id} className="flex justify-between items-center p-2 text-sm">
                                               <div>
                                                    <p>{a.description || `Work on '${task?.title}'`}</p>
                                                    <p className="text-xs text-slate-500">{member?.firstName} logged {a.hours}h on {new Date(a.endDate).toLocaleDateString()}</p>
                                               </div>
                                                <span className="font-semibold">{formatCurrency(cost)}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        {(directExpensesForItem.length === 0 && activitiesForItem.length === 0) && (
                            <p className="text-center text-slate-500 py-6 italic">No actuals have been logged against this budget item.</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                         <button type="button" onClick={() => setDetailsModalItemId(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Close</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section>
            {expenseModalState.isOpen && <LogExpenseModal />}
            {detailsModalItemId && <ActualsBreakdownModal />}
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">Budget vs. Actuals</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                {/* REVENUE COLUMN */}
                <div className="bg-slate-50/80 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-slate-700 mb-4">Revenues</h3>
                    <RevenueSection title="Grants" budgetTotal={budgetCalculations.totalGrants} actualTotal={budget.revenues.grants.reduce((s,i)=>s+(i.actualAmount||0),0)}>
                        <RevenueCategoryItemsView 
                            items={budget.revenues.grants} 
                            categoryPath={['revenues', 'grants']} 
                            onUpdateRevenue={handleUpdateRevenue}
                            editingRevenueId={editingRevenueId}
                            onSetEditingRevenueId={setEditingRevenueId}
                        />
                    </RevenueSection>
                    
                    <RevenueSection title="Tickets & Box Office" budgetTotal={budgetCalculations.totalTickets} actualTotal={budget.revenues.tickets.actualTotalTickets || 0}>
                        <RevenueViewField label="Projected Audience" value={budgetCalculations.projectedAudience.toFixed(0)} align="right" />
                        <RevenueViewField label="Average Ticket Price" value={formatCurrency(budget.revenues.tickets.avgTicketPrice)} description={budget.revenues.tickets.description} align="right" />
                         <div className="py-2.5 grid grid-cols-2 gap-4 group">
                             <div className="text-sm text-slate-600 font-semibold">Actual Ticket Revenue</div>
                             <div className="text-sm text-right font-bold text-teal-700 cursor-pointer" onClick={()=>setEditingRevenueId('tickets')}>
                                {editingRevenueId === 'tickets' ? (
                                     <Input 
                                        type="number" 
                                        defaultValue={budget.revenues.tickets.actualTotalTickets || ''}
                                        onBlur={(e) => {
                                            handleUpdateRevenue(['revenues', 'tickets', 'actualTotalTickets'], parseFloat(e.target.value) || 0);
                                            setEditingRevenueId(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.currentTarget.blur();
                                        }}
                                        autoFocus
                                        className="text-right py-1"
                                    />
                                ) : (
                                     <>
                                        {formatCurrency(budget.revenues.tickets.actualTotalTickets || 0)} <i className="fa-solid fa-pencil text-xs text-slate-300 ml-1 group-hover:text-teal-600 transition-colors"></i>
                                   </>
                                )}
                             </div>
                         </div>
                    </RevenueSection>
                    <RevenueSection title="Sales" budgetTotal={budgetCalculations.totalSales} actualTotal={budget.revenues.sales.reduce((s,i)=>s+(i.actualAmount||0),0)}>
                        <RevenueCategoryItemsView 
                            items={budget.revenues.sales} 
                            categoryPath={['revenues', 'sales']} 
                            onUpdateRevenue={handleUpdateRevenue}
                            editingRevenueId={editingRevenueId}
                            onSetEditingRevenueId={setEditingRevenueId}
                        />
                    </RevenueSection>
                    <RevenueSection title="Fundraising" budgetTotal={budgetCalculations.totalFundraising} actualTotal={budget.revenues.fundraising.reduce((s,i)=>s+(i.actualAmount||0),0)}>
                        <RevenueCategoryItemsView 
                            items={budget.revenues.fundraising} 
                            categoryPath={['revenues', 'fundraising']} 
                            onUpdateRevenue={handleUpdateRevenue}
                            editingRevenueId={editingRevenueId}
                            onSetEditingRevenueId={setEditingRevenueId}
                        />
                    </RevenueSection>
                    <RevenueSection title="Contributions" budgetTotal={budgetCalculations.totalContributions} actualTotal={budget.revenues.contributions.reduce((s,i)=>s+(i.actualAmount||0),0)}>
                        <RevenueCategoryItemsView 
                            items={budget.revenues.contributions} 
                            categoryPath={['revenues', 'contributions']} 
                            onUpdateRevenue={handleUpdateRevenue}
                            editingRevenueId={editingRevenueId}
                            onSetEditingRevenueId={setEditingRevenueId}
                        />
                    </RevenueSection>
                     <div className="bg-teal-600 text-white p-4 rounded-lg flex justify-between items-center font-bold text-lg mt-6 shadow-md">
                        <span>Total Revenue (Budgeted)</span>
                        <span>{formatCurrency(budgetCalculations.totalRevenue)}</span>
                    </div>
                </div>

                {/* EXPENSE COLUMN */}
                <div className="bg-slate-50/80 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-slate-700">Expenses</h3>
                        <button onClick={() => setExpenseModalState({isOpen: true})} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                           <i className="fa-solid fa-plus mr-2"></i>Log Top-Level Expense
                        </button>
                    </div>
                    <ExpenseCategoryView title="Professional Fees" categoryKey="professionalFees" items={budget.expenses.professionalFees} fields={EXPENSE_FIELDS.professionalFees} />
                    <ExpenseCategoryView title="Travel" categoryKey="travel" items={budget.expenses.travel} fields={EXPENSE_FIELDS.travel} />
                    <ExpenseCategoryView title="Production & Publication" categoryKey="production" items={budget.expenses.production} fields={EXPENSE_FIELDS.production} />
                    <ExpenseCategoryView title="Administration" categoryKey="administration" items={budget.expenses.administration} fields={EXPENSE_FIELDS.administration} />
                    <ExpenseCategoryView title="Research" categoryKey="research" items={budget.expenses.research} fields={EXPENSE_FIELDS.research} />
                    <ExpenseCategoryView title="Professional Development" categoryKey="professionalDevelopment" items={budget.expenses.professionalDevelopment} fields={EXPENSE_FIELDS.professionalDevelopment} />
                     <div className="bg-rose-600 text-white p-4 rounded-lg flex justify-between items-center font-bold text-lg mt-6 shadow-md">
                        <span>Total Expenses (Budgeted)</span>
                        <span>{formatCurrency(budgetCalculations.totalExpenses)}</span>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">Financial Summary</h2>
                <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">

                    {/* The Plan */}
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-3">The Plan (Budget)</h3>
                        <div className="space-y-2">
                             <RevenueViewField label="Total Secured Revenue (Approved)" value={<span className="font-bold text-green-700">{formatCurrency(budgetCalculations.totalSecuredRevenue)}</span>} />
                             <RevenueViewField label="Total Potential Revenue (Pending)" value={<span className="font-bold text-yellow-700">{formatCurrency(budgetCalculations.totalPendingRevenue)}</span>} />
                            <RevenueViewField label="Total Projected Revenue (Secured + Pending)" value={formatCurrency(budgetCalculations.totalRevenue)} />
                            <RevenueViewField label="Total Planned Expenses (Cash)" value={formatCurrency(budgetCalculations.totalExpenses)} />
                            <RevenueViewField 
                                label="Planned Surplus / Deficit" 
                                value={<span className={`font-extrabold text-lg ${budgetCalculations.balance >= 0 ? 'text-green-700' : 'text-orange-600'}`}>{formatCurrency(budgetCalculations.balance)}</span>} 
                            />
                        </div>
                    </div>

                    {/* The Reality */}
                    <div className="mt-6 pt-4 border-t-2 border-slate-300">
                        <h3 className="font-bold text-lg text-slate-800 mb-3">The Reality (Actuals to Date)</h3>
                        <div className="space-y-2">
                             <RevenueViewField label="Actual Cash Received" value={<span className="font-bold text-green-700">{formatCurrency(budgetCalculations.totalActualRevenue)}</span>} />
                            <RevenueViewField label="Actual Cash Spent" value={<span className="font-bold text-blue-700">{formatCurrency(totalActualPaidExpenses)}</span>} />
                            <RevenueViewField 
                                label="Current Cash Balance" 
                                description="(Actual Revenue - Actual Spent)" 
                                value={<span className={`font-extrabold text-lg ${budgetCalculations.totalActualRevenue - totalActualPaidExpenses >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(budgetCalculations.totalActualRevenue - totalActualPaidExpenses)}</span>} 
                            />
                        </div>
                    </div>

                    {/* Full Picture */}
                    <div className="mt-6 pt-4 border-t-2 border-slate-300">
                        <h3 className="font-bold text-lg text-slate-800 mb-3">The Full Picture (Total Project Value)</h3>
                        <div className="space-y-2">
                            <RevenueViewField 
                                label="Contributed Value (In-Kind/Volunteer)" 
                                description="Non-cash contributions from time tracking" 
                                value={<span className="font-bold text-teal-700">{formatCurrency(totalContributedValue)}</span>} 
                            />
                            <RevenueViewField 
                                label="Total Value Delivered to Date" 
                                description="(Actual Cash Spent + Contributed Value)" 
                                value={<span className="font-bold text-black">{formatCurrency(totalActualPaidExpenses + totalContributedValue)}</span>} 
                            />
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default BudgetView;