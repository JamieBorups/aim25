

import React from 'react';
import { FormData, BudgetItem } from '../../types';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { REVENUE_FIELDS, EXPENSE_FIELDS } from '../../constants';

const formatCurrency = (value: number | undefined | null) => {
    const num = value || 0;
    return num.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
};

interface ReportBudgetViewProps {
    project: FormData;
    actuals: Map<string, number>;
}

const ReportSection: React.FC<{title: string, className?: string}> = ({title, className=""}) => (
    <div className={`bg-slate-700 text-white font-semibold p-1.5 mt-4 text-sm ${className}`}>{title}</div>
);

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

const ReportBudgetView: React.FC<ReportBudgetViewProps> = ({ project, actuals }) => {
    const budget = project.budget;
    const { totalRevenue, totalExpenses, projectedAudience, totalTickets } = useBudgetCalculations(budget);
    const totalActualExpenses = Array.from(actuals.values()).reduce((sum, val) => sum + val, 0);
    const getActual = (id: string) => actuals.get(id) || 0;

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
    
    return (
      <section>
          <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">Budget Report</h2>
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
                
                <div className="mt-4">
                    <GenericTable headers={['', 'Projected', 'Actual']} rows={[['Total revenues', formatCurrency(totalRevenue), formatCurrency(totalRevenue)]]} isTotal />
                </div>

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

                <div className="mt-4">
                    <GenericTable headers={['', 'Projected', 'Actual']} rows={[['Total expenses', formatCurrency(totalExpenses), formatCurrency(totalActualExpenses)]]} isTotal/>
                </div>
          </div>
      </section>
    );
};

export default ReportBudgetView;