


import React, { useState } from 'react';
import { produce } from 'https://esm.sh/immer';
import { FormData, BudgetItem, BudgetItemStatus } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { EXPENSE_FIELDS, REVENUE_FIELDS, BUDGET_ITEM_STATUS_OPTIONS } from '../../constants';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';

interface Props {
  formData: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const formatCurrency = (value: number | undefined | null) => {
    const num = value || 0;
    return num.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
};

interface BudgetCategoryManagerProps {
    items: BudgetItem[];
    options: { value: string; label: string }[];
    onChange: (items: BudgetItem[]) => void;
    isRevenue?: boolean;
}

const BudgetCategoryManager: React.FC<BudgetCategoryManagerProps> = ({ items, options, onChange, isRevenue = false }) => {
    const [newItemSource, setNewItemSource] = useState('');

    const handleAddItem = () => {
        if (!newItemSource) return;

        const option = options.find(o => o.value === newItemSource);
        if (!option) return;

        const newItem: BudgetItem = {
            id: `item_${Date.now()}_${Math.random()}`,
            source: option.value,
            description: '',
            amount: 0,
            ...(isRevenue && { status: 'Pending' })
        };
        onChange([...items, newItem]);
        setNewItemSource('');
    };

    const handleUpdateItem = (id: string, field: keyof BudgetItem, value: string | number | BudgetItemStatus) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });
        onChange(newItems);
    };

    const handleRemoveItem = (id: string) => {
        onChange(items.filter(item => item.id !== id));
    };

    const getLabelForSource = (source: string) => {
        return options.find(o => o.value === source)?.label || source;
    };
    
    const availableOptions = options;
    
    const gridCols = isRevenue ? 'grid-cols-12' : 'grid-cols-12';

    return (
        <div className="space-y-3">
            {items.length > 0 && (
                <div className="space-y-2 border-b border-slate-200 pb-3 mb-3">
                    <div className={`hidden md:grid ${gridCols} gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider`}>
                        <div className="md:col-span-4">Item</div>
                        {isRevenue && <div className="md:col-span-2">Status</div>}
                        <div className="md:col-span-4">Description</div>
                        <div className="md:col-span-2 text-right">Amount</div>
                        <div className="md:col-span-1"></div>
                    </div>
                    {items.map(item => (
                        <div key={item.id} className={`grid grid-cols-1 md:${gridCols} gap-2 items-center`}>
                            <div className="md:col-span-4 text-sm text-slate-800 font-medium">{getLabelForSource(item.source)}</div>
                            {isRevenue && (
                                <div className="md:col-span-2">
                                    <Select
                                        aria-label={`Status for ${getLabelForSource(item.source)}`}
                                        value={item.status || 'Pending'}
                                        onChange={e => handleUpdateItem(item.id, 'status', e.target.value as BudgetItemStatus)}
                                        options={BUDGET_ITEM_STATUS_OPTIONS}
                                        className="text-xs py-1"
                                    />
                                </div>
                            )}
                            <div className="md:col-span-4">
                                <Input
                                    aria-label={`Description for ${getLabelForSource(item.source)}`}
                                    type="text"
                                    placeholder="Description (e.g., 'Per diem for Elder 1')"
                                    value={item.description}
                                    onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    aria-label={`Amount for ${getLabelForSource(item.source)}`}
                                    type="number"
                                    placeholder="0.00"
                                    className="text-right"
                                    value={item.amount === 0 ? '' : item.amount}
                                    onChange={e => handleUpdateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                    step="0.01"
                                />
                            </div>
                            <div className="md:col-span-1 text-right">
                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label={`Remove ${getLabelForSource(item.source)}`}>
                                    <i className="fa-solid fa-trash-alt fa-fw"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                <Select
                    value={newItemSource}
                    onChange={e => setNewItemSource(e.target.value)}
                    options={[{ value: '', label: 'Select an item to add...' }, ...availableOptions]}
                />
                <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!newItemSource}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add to Budget
                </button>
            </div>
        </div>
    );
};

const BudgetSection: React.FC<{ title: string, children: React.ReactNode, instructions?: React.ReactNode, total?: number }> = ({ title, children, instructions, total }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">{title}</h3>
        {instructions && <div className="text-sm text-slate-600 mb-4 prose max-w-none prose-ul:list-disc prose-ul:list-inside prose-li:mb-1">{instructions}</div>}
        <div className="space-y-2">{children}</div>
        {total !== undefined && (
            <div className="text-right font-bold mt-4 pt-4 border-t-2 border-slate-200 text-slate-800 text-lg">
                Total: {formatCurrency(total)}
            </div>
        )}
    </div>
);


const BudgetTab: React.FC<Props> = ({ formData, onChange }) => {
    
    const handleBudgetChange = (path: (string | number)[], value: any) => {
        const newFormData = produce(formData, draft => {
            let current: any = draft;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
        });
        onChange('budget', newFormData.budget);
    };

     const handleBudgetCategoryChange = (categoryPath: string[], items: BudgetItem[]) => {
        const newFormData = produce(formData, draft => {
            let current: any = draft.budget;
            for(let i=0; i<categoryPath.length-1; i++) {
                current = current[categoryPath[i] as keyof typeof current];
            }
            current[categoryPath[categoryPath.length-1] as keyof typeof current] = items;
        });
        onChange('budget', newFormData.budget);
    };

    const budget = formData.budget;
    
    const {
        totalGrants,
        projectedAudience,
        totalTickets,
        totalSales,
        totalFundraising,
        totalContributions,
        totalRevenue,
        totalProfessionalFees,
        totalTravel,
        totalProduction,
        totalAdministration,
        totalResearch,
        totalProfessionalDevelopment,
        totalExpenses,
        balance
    } = useBudgetCalculations(budget);


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">Project Budget</h2>
            <p className="text-base text-slate-600">Enter your project budget below. Add revenue and expense items to each category. The form will automatically calculate totals for you.</p>

            <BudgetSection title="Revenue: Grants" total={totalGrants}>
                <BudgetCategoryManager
                    items={budget.revenues.grants}
                    options={REVENUE_FIELDS.grants.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['revenues', 'grants'], items)}
                    isRevenue={true}
                />
            </BudgetSection>

            <BudgetSection title="Revenue: Tickets and box office" total={totalTickets}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-center py-2">
                    <label className="text-sm font-medium text-slate-700">Venue Information</label>
                    <div className="grid grid-cols-3 gap-2">
                        <Input type="number" value={budget.revenues.tickets.numVenues || ''} onChange={e => handleBudgetChange(['budget', 'revenues', 'tickets', 'numVenues'], parseInt(e.target.value) || 0)} placeholder="# Venues" />
                        <Input type="number" value={budget.revenues.tickets.percentCapacity || ''} onChange={e => handleBudgetChange(['budget', 'revenues', 'tickets', 'percentCapacity'], parseInt(e.target.value) || 0)} placeholder="% Capacity" />
                        <Input type="number" value={budget.revenues.tickets.venueCapacity || ''} onChange={e => handleBudgetChange(['budget', 'revenues', 'tickets', 'venueCapacity'], parseInt(e.target.value) || 0)} placeholder="Venue Capacity" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-center py-2">
                    <label className="text-sm font-medium text-slate-700">Projected Total Audience</label>
                    <Input type="number" value={projectedAudience} readOnly disabled className="bg-slate-200 font-semibold"/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-center py-2">
                    <label className="text-sm font-medium text-slate-700">Ticket Prices</label>
                    <div className="grid grid-cols-5 gap-2">
                       <Input type="text" value={budget.revenues.tickets.description} onChange={(e) => handleBudgetChange(['budget', 'revenues', 'tickets', 'description'], e.target.value)} placeholder="Description" className="col-span-3"/>
                       <Input type="number" value={budget.revenues.tickets.avgTicketPrice === 0 ? '' : budget.revenues.tickets.avgTicketPrice} onChange={(e) => handleBudgetChange(['budget', 'revenues', 'tickets', 'avgTicketPrice'], parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-right col-span-2" step="0.01"/>
                    </div>
                </div>
            </BudgetSection>

            <BudgetSection title="Revenue: Sales" total={totalSales}>
                 <BudgetCategoryManager
                    items={budget.revenues.sales}
                    options={REVENUE_FIELDS.sales.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['revenues', 'sales'], items)}
                    isRevenue={true}
                />
            </BudgetSection>

            <BudgetSection title="Revenue: Fundraising" total={totalFundraising}>
                 <BudgetCategoryManager
                    items={budget.revenues.fundraising}
                    options={REVENUE_FIELDS.fundraising.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['revenues', 'fundraising'], items)}
                    isRevenue={true}
                />
            </BudgetSection>

            <BudgetSection title="Revenue: Contributions" total={totalContributions}>
                 <BudgetCategoryManager
                    items={budget.revenues.contributions}
                    options={REVENUE_FIELDS.contributions.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['revenues', 'contributions'], items)}
                    isRevenue={true}
                />
            </BudgetSection>
            
            <div className="bg-teal-600 text-white p-4 rounded-lg flex justify-between items-center font-bold text-xl shadow-md">
                <span>Total Revenue</span>
                <span>{formatCurrency(totalRevenue)}</span>
            </div>


            <BudgetSection title="Expenses: Professional fees/honorariums" total={totalProfessionalFees}>
                 <BudgetCategoryManager
                    items={budget.expenses.professionalFees}
                    options={EXPENSE_FIELDS.professionalFees.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'professionalFees'], items)}
                />
            </BudgetSection>
            
            <BudgetSection title="Expenses: Travel" total={totalTravel} instructions={
                <>
                <p>If traveling more than 20 kms to another community, applicants are eligible to include travel costs in their budget. This includes:</p>
                <ul>
                    <li>Roundtrip airfare (economy class), baggage and taxi to airport</li>
                    <li>Mileage for ground travel at a rate of 0.45 CAD per km</li>
                    <li>Accommodations, if traveling more than 100 kms to another community</li>
                    <li>Meal per diem (South of 53rd parallel or in Canada: 75.00 CAD per day, North of 53rd parallel or outside Canada: 90.00 CAD per day), if traveling more than 100 kms to another community</li>
                </ul>
                </>
            }>
                <BudgetCategoryManager
                    items={budget.expenses.travel}
                    options={EXPENSE_FIELDS.travel.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'travel'], items)}
                />
            </BudgetSection>

            <BudgetSection title="Expenses: Production and publication costs" total={totalProduction}>
                <BudgetCategoryManager
                    items={budget.expenses.production}
                    options={EXPENSE_FIELDS.production.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'production'], items)}
                />
            </BudgetSection>
            
            <BudgetSection title="Expenses: Administration" total={totalAdministration}>
                <BudgetCategoryManager
                    items={budget.expenses.administration}
                    options={EXPENSE_FIELDS.administration.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'administration'], items)}
                />
            </BudgetSection>
            
            <BudgetSection title="Expenses: Research" total={totalResearch}>
                 <BudgetCategoryManager
                    items={budget.expenses.research}
                    options={EXPENSE_FIELDS.research.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'research'], items)}
                />
            </BudgetSection>
            
            <BudgetSection title="Expenses: Professional development" total={totalProfessionalDevelopment}>
                <BudgetCategoryManager
                    items={budget.expenses.professionalDevelopment}
                    options={EXPENSE_FIELDS.professionalDevelopment.map(f => ({ value: f.key, label: f.label }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'professionalDevelopment'], items)}
                />
            </BudgetSection>

            <div className="bg-rose-600 text-white p-4 rounded-lg flex justify-between items-center font-bold text-xl shadow-md">
                <span>Total Expenses</span>
                <span>{formatCurrency(totalExpenses)}</span>
            </div>
            
            <div className={`p-5 rounded-lg flex justify-between items-center font-bold text-2xl text-white shadow-lg ${balance >= 0 ? 'bg-green-600' : 'bg-orange-500'}`}>
                <span>Balance (Revenue - Expenses)</span>
                <span>{formatCurrency(balance)}</span>
            </div>
        </div>
    );
};

export default BudgetTab;