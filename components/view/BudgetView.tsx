
import React, { useMemo } from 'react';
import { DetailedBudget, BudgetItem, Task, Activity } from '../../types';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { REVENUE_FIELDS, EXPENSE_FIELDS } from '../../constants';

interface BudgetViewProps {
    budget: DetailedBudget;
    tasks: Task[];
    activities: Activity[];
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const RevenueViewField: React.FC<{ label: string; value?: React.ReactNode, description?: string, align?: 'left' | 'right' }> = ({ label, value, description, align = 'left' }) => (
    <div className="py-2.5 grid grid-cols-2 gap-4 border-b border-slate-200 last:border-b-0">
        <div className="text-sm text-slate-600">
            {label}
            {description && <p className="text-xs text-slate-400 italic mt-0.5">{description}</p>}
        </div>
        <div className={`text-sm text-slate-800 font-medium ${align === 'right' ? 'text-right' : ''}`}>{value}</div>
    </div>
);

const RevenueSection: React.FC<{ title: string, children: React.ReactNode, total: number}> = ({title, children, total}) => (
     <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6">
        <h3 className="text-base font-bold text-slate-700 border-b border-slate-200 pb-2 mb-3">{title}</h3>
        {children}
        <div className="text-right font-bold mt-3 pt-3 border-t-2 border-slate-200 text-slate-800 text-lg">
            Total: {formatCurrency(total)}
        </div>
    </div>
);


const BudgetView: React.FC<BudgetViewProps> = ({ budget, tasks, activities }) => {
    const {
        totalGrants, projectedAudience, totalTickets, totalSales, totalFundraising,
        totalContributions, totalRevenue, totalProfessionalFees, totalTravel, totalProduction,
        totalAdministration, totalResearch, totalProfessionalDevelopment, totalExpenses
    } = useBudgetCalculations(budget);
    
    const { actualsByBudgetItem, totalContributedValue, totalActualPaidExpenses } = useMemo(() => {
        const actuals = new Map<string, { cost: number, contributedValue: number, hours: number }>();
        const taskMap = new Map(tasks.map(t => [t.id, t]));

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

        const totalContributed = Array.from(actuals.values()).reduce((sum, item) => sum + item.contributedValue, 0);
        const totalActualPaid = Array.from(actuals.values()).reduce((sum, item) => sum + item.cost, 0);

        return { 
            actualsByBudgetItem: actuals, 
            totalContributedValue: totalContributed, 
            totalActualPaidExpenses: totalActualPaid 
        };
    }, [tasks, activities]);

    const renderRevenueCategoryItems = (items: BudgetItem[], fields: {key: string, label: string}[]) => {
         if (!items || items.length === 0) {
            return <p className="text-sm text-slate-400 italic py-2">No items in this category.</p>;
        }
        const fieldMap = new Map(fields.map(f => [f.key, f.label]));
        return items.map(item => {
            if (!item.amount) return null;
            const label = fieldMap.get(item.source) || item.source;
            return <RevenueViewField key={item.id} label={label} value={formatCurrency(item.amount)} description={item.description} align="right" />;
        });
    };
    
    const ExpenseCategoryView: React.FC<{title: string; items: BudgetItem[]; fields: {key: string, label: string}[]}> = ({ title, items, fields }) => {
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
                <h3 className="text-base font-bold text-slate-700 border-b border-slate-200 pb-2 mb-3">{title}</h3>
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2 text-right">Budgeted</div>
                    <div className="col-span-2 text-right">Actual</div>
                    <div className="col-span-3 text-right">Variance</div>
                </div>
                <div className="space-y-1">
                {items.map(item => {
                    const actual = actualsByBudgetItem.get(item.id) || { cost: 0, hours: 0 };
                    const variance = item.amount - actual.cost;
                    const label = fieldMap.get(item.source) || item.source;
                    return (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center py-1.5 border-b border-slate-100 last:border-b-0 px-2">
                            <div className="col-span-5 text-sm">
                                <p className="text-slate-800 font-medium">{label}</p>
                                <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                            <div className="col-span-2 text-right text-sm text-slate-600">{formatCurrency(item.amount)}</div>
                            <div className="col-span-2 text-right text-sm font-semibold text-blue-600">{formatCurrency(actual.cost)}</div>
                            <div className={`col-span-3 text-right text-sm font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(variance)}</div>
                        </div>
                    );
                })}
                </div>
                <div className="grid grid-cols-12 gap-2 mt-3 pt-3 border-t-2 border-slate-300 font-bold text-slate-800 text-base px-2">
                     <div className="col-span-5">Total</div>
                     <div className="col-span-2 text-right">{formatCurrency(categoryTotalBudgeted)}</div>
                     <div className="col-span-2 text-right">{formatCurrency(categoryTotalActual)}</div>
                     <div className={`col-span-3 text-right ${categoryVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(categoryVariance)}</div>
                </div>
            </div>
        );
    };

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">Budget vs. Actuals</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                {/* REVENUE COLUMN */}
                <div className="bg-slate-50/80 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-slate-700 mb-4">Revenues (Budgeted)</h3>
                    <RevenueSection title="Grants" total={totalGrants}>{renderRevenueCategoryItems(budget.revenues.grants, REVENUE_FIELDS.grants)}</RevenueSection>
                    <RevenueSection title="Tickets & Box Office" total={totalTickets}>
                        <RevenueViewField label="Projected Audience" value={projectedAudience.toFixed(0)} align="right" />
                        <RevenueViewField label="Average Ticket Price" value={formatCurrency(budget.revenues.tickets.avgTicketPrice)} description={budget.revenues.tickets.description} align="right" />
                    </RevenueSection>
                    <RevenueSection title="Sales" total={totalSales}>{renderRevenueCategoryItems(budget.revenues.sales, REVENUE_FIELDS.sales)}</RevenueSection>
                    <RevenueSection title="Fundraising" total={totalFundraising}>{renderRevenueCategoryItems(budget.revenues.fundraising, REVENUE_FIELDS.fundraising)}</RevenueSection>
                    <RevenueSection title="Contributions" total={totalContributions}>{renderRevenueCategoryItems(budget.revenues.contributions, REVENUE_FIELDS.contributions)}</RevenueSection>
                     <div className="bg-teal-600 text-white p-4 rounded-lg flex justify-between items-center font-bold text-lg mt-6 shadow-md">
                        <span>Total Revenue</span>
                        <span>{formatCurrency(totalRevenue)}</span>
                    </div>
                </div>

                {/* EXPENSE COLUMN */}
                <div className="bg-slate-50/80 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-slate-700 mb-4">Expenses</h3>
                    <ExpenseCategoryView title="Professional Fees" items={budget.expenses.professionalFees} fields={EXPENSE_FIELDS.professionalFees} />
                    <ExpenseCategoryView title="Travel" items={budget.expenses.travel} fields={EXPENSE_FIELDS.travel} />
                    <ExpenseCategoryView title="Production & Publication" items={budget.expenses.production} fields={EXPENSE_FIELDS.production} />
                    <ExpenseCategoryView title="Administration" items={budget.expenses.administration} fields={EXPENSE_FIELDS.administration} />
                    <ExpenseCategoryView title="Research" items={budget.expenses.research} fields={EXPENSE_FIELDS.research} />
                    <ExpenseCategoryView title="Professional Development" items={budget.expenses.professionalDevelopment} fields={EXPENSE_FIELDS.professionalDevelopment} />
                     <div className="bg-rose-600 text-white p-4 rounded-lg flex justify-between items-center font-bold text-lg mt-6 shadow-md">
                        <span>Total Expenses (Budgeted)</span>
                        <span>{formatCurrency(totalExpenses)}</span>
                    </div>
                </div>
            </div>

            {/* BALANCE & SUMMARY */}
            <div className="mt-12">
                 <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">Financial Summary</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 mb-3">Cash Flow Summary</h3>
                        <div className="space-y-2">
                             <RevenueViewField label="Total Budgeted Revenue" value={formatCurrency(totalRevenue)} />
                             <RevenueViewField label="Total Budgeted Expenses" value={formatCurrency(totalExpenses)} />
                             <RevenueViewField label="Total Actual Paid Expenses" value={<span className="font-bold text-blue-700">{formatCurrency(totalActualPaidExpenses)}</span>} />
                        </div>
                        <div className={`mt-4 pt-4 border-t-2 border-slate-300`}>
                            <RevenueViewField label="Budgeted Balance" value={<span className={`font-extrabold text-xl ${totalRevenue - totalExpenses >= 0 ? 'text-green-700' : 'text-orange-600'}`}>{formatCurrency(totalRevenue - totalExpenses)}</span>} />
                            <RevenueViewField label="Actual Balance" description="(vs Budgeted Revenue)" value={<span className={`font-extrabold text-xl ${totalRevenue - totalActualPaidExpenses >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(totalRevenue - totalActualPaidExpenses)}</span>} />
                        </div>
                     </div>
                      <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 mb-3">Contributed Value Summary</h3>
                        <div className="space-y-2">
                            <RevenueViewField label="Total Contributed Value" description="From In-Kind & Volunteer work" value={<span className="font-bold text-teal-700">{formatCurrency(totalContributedValue)}</span>} />
                            <RevenueViewField label="True Project Cost" description="Actual Paid Expenses + Contributed Value" value={<span className="font-bold text-black">{formatCurrency(totalActualPaidExpenses + totalContributedValue)}</span>} />
                        </div>
                     </div>
                 </div>
            </div>
        </section>
    );
};

export default BudgetView;