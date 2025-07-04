

import { useMemo } from 'react';
import { DetailedBudget, BudgetItem } from '../types';

export const useBudgetCalculations = (budget: DetailedBudget) => {
    const sumAmounts = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const sumAmountsByStatus = (items: BudgetItem[] = [], status: 'Approved' | 'Pending') => 
        items.filter(item => item.status === status).reduce((sum, item) => sum + (item.amount || 0), 0);

    const filterAndSum = (items: BudgetItem[] = []) => 
        items.filter(item => item.status !== 'Denied').reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalGrants = useMemo(() => filterAndSum(budget.revenues.grants), [budget.revenues.grants]);
    
    const projectedAudience = useMemo(() => {
      const { numVenues, percentCapacity, venueCapacity } = budget.revenues.tickets;
      return numVenues * (percentCapacity / 100) * venueCapacity;
    }, [budget.revenues.tickets]);

    const totalTickets = useMemo(() => {
        return projectedAudience * budget.revenues.tickets.avgTicketPrice;
    }, [projectedAudience, budget.revenues.tickets.avgTicketPrice]);
    
    const totalSales = useMemo(() => filterAndSum(budget.revenues.sales), [budget.revenues.sales]);
    const totalFundraising = useMemo(() => filterAndSum(budget.revenues.fundraising), [budget.revenues.fundraising]);
    const totalContributions = useMemo(() => filterAndSum(budget.revenues.contributions), [budget.revenues.contributions]);

    const totalRevenue = useMemo(() => totalGrants + totalTickets + totalSales + totalFundraising + totalContributions, [totalGrants, totalTickets, totalSales, totalFundraising, totalContributions]);

    const totalActualRevenue = useMemo(() => {
        const grants = budget.revenues.grants.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
        const tickets = budget.revenues.tickets.actualTotalTickets || 0;
        const sales = budget.revenues.sales.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
        const fundraising = budget.revenues.fundraising.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
        const contributions = budget.revenues.contributions.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
        return grants + tickets + sales + fundraising + contributions;
    }, [budget.revenues]);
    
    const totalSecuredRevenue = useMemo(() => {
        return ['grants', 'sales', 'fundraising', 'contributions'].reduce((total, category) => {
            return total + sumAmountsByStatus(budget.revenues[category as keyof typeof budget.revenues] as BudgetItem[], 'Approved');
        }, 0);
    }, [budget.revenues]);

    const totalPendingRevenue = useMemo(() => {
        return ['grants', 'sales', 'fundraising', 'contributions'].reduce((total, category) => {
            return total + sumAmountsByStatus(budget.revenues[category as keyof typeof budget.revenues] as BudgetItem[], 'Pending');
        }, 0);
    }, [budget.revenues]);


    const totalProfessionalFees = useMemo(() => sumAmounts(budget.expenses.professionalFees), [budget.expenses.professionalFees]);
    const totalTravel = useMemo(() => sumAmounts(budget.expenses.travel), [budget.expenses.travel]);
    const totalProduction = useMemo(() => sumAmounts(budget.expenses.production), [budget.expenses.production]);
    const totalAdministration = useMemo(() => sumAmounts(budget.expenses.administration), [budget.expenses.administration]);
    const totalResearch = useMemo(() => sumAmounts(budget.expenses.research), [budget.expenses.research]);
    const totalProfessionalDevelopment = useMemo(() => sumAmounts(budget.expenses.professionalDevelopment), [budget.expenses.professionalDevelopment]);

    const totalExpenses = useMemo(() => totalProfessionalFees + totalTravel + totalProduction + totalAdministration + totalResearch + totalProfessionalDevelopment, 
      [totalProfessionalFees, totalTravel, totalProduction, totalAdministration, totalResearch, totalProfessionalDevelopment]
    );

    const balance = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

    return {
        totalGrants,
        projectedAudience,
        totalTickets,
        totalSales,
        totalFundraising,
        totalContributions,
        totalRevenue,
        totalActualRevenue,
        totalSecuredRevenue,
        totalPendingRevenue,
        totalProfessionalFees,
        totalTravel,
        totalProduction,
        totalAdministration,
        totalResearch,
        totalProfessionalDevelopment,
        totalExpenses,
        balance
    };
};