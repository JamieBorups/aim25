
import { useMemo } from 'react';
import { DetailedBudget, BudgetItem } from '../types';

export const useBudgetCalculations = (budget: DetailedBudget) => {
    const sumAmounts = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalGrants = useMemo(() => sumAmounts(budget.revenues.grants), [budget.revenues.grants]);
    
    const projectedAudience = useMemo(() => {
      const { numVenues, percentCapacity, venueCapacity } = budget.revenues.tickets;
      return numVenues * (percentCapacity / 100) * venueCapacity;
    }, [budget.revenues.tickets]);

    const totalTickets = useMemo(() => {
        return projectedAudience * budget.revenues.tickets.avgTicketPrice;
    }, [projectedAudience, budget.revenues.tickets.avgTicketPrice]);
    
    const totalSales = useMemo(() => sumAmounts(budget.revenues.sales), [budget.revenues.sales]);
    const totalFundraising = useMemo(() => sumAmounts(budget.revenues.fundraising), [budget.revenues.fundraising]);
    const totalContributions = useMemo(() => sumAmounts(budget.revenues.contributions), [budget.revenues.contributions]);

    const totalRevenue = useMemo(() => totalGrants + totalTickets + totalSales + totalFundraising + totalContributions, [totalGrants, totalTickets, totalSales, totalFundraising, totalContributions]);

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
