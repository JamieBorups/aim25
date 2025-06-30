
import React from 'react';

export type Page = 'home' | 'projects' | 'members' | 'tasks' | 'reports' | 'reportsPrototype' | 'sampleData';
export type TabId = 'projectInfo' | 'collaborators' | 'budget';
export type TaskManagerView = 'workplan' | 'tasks' | 'activities';

export interface Tab {
  id: TabId;
  label: string;
}

export interface Member {
    id: string;
    memberId: string;
    firstName: string;
    lastName: string;
    email: string;
    province: string;
    city: string;
    postalCode: string;
    imageUrl: string;
    shortBio: string;
    artistBio: string;
    availability: string;
}

export interface FormData {
    id: string;
    projectTitle: string;
    artisticDisciplines: string[];
    craftGenres: string[];
    danceGenres: string[];
    literaryGenres: string[];
    mediaGenres: string[];
    musicGenres: string[];
    theatreGenres: string[];
    visualArtsGenres: string[];
    otherArtisticDisciplineSpecify: string;
    projectStartDate: string;
    projectEndDate: string;
    activityType: string;
    background: string;
    projectDescription: string;
    audience: string;
    paymentAndConditions: string;
    permissionConfirmationFiles: File[];
    schedule: string;
    culturalIntegrity: string;
    additionalInfo: string;
    whoWillWork: string;
    howSelectionDetermined: string;
    collaboratorDetails: Collaborator[];
    budget: DetailedBudget;
}

export interface Collaborator {
    memberId: string;
    role: string;
}

export interface BudgetItem {
    id: string;
    source: string;
    description: string;
    amount: number;
}

export interface DetailedBudget {
    revenues: {
        grants: BudgetItem[];
        tickets: {
            numVenues: number;
            percentCapacity: number;
            venueCapacity: number;
            avgTicketPrice: number;
            description: string;
        };
        sales: BudgetItem[];
        fundraising: BudgetItem[];
        contributions: BudgetItem[];
    };
    expenses: {
        professionalFees: BudgetItem[];
        travel: BudgetItem[];
        production: BudgetItem[];
        administration: BudgetItem[];
        research: BudgetItem[];
        professionalDevelopment: BudgetItem[];
    };
}

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Done';
export type WorkType = 'Paid' | 'In-Kind' | 'Volunteer';

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    assignedMemberId: string;
    status: TaskStatus;
    startDate: string;
    dueDate: string;
    estimatedHours: number;
    actualHours: number;
    budgetItemId: string; 
    workType: WorkType;
    hourlyRate: number;
    updatedAt: string;
}

export type ActivityStatus = 'Pending' | 'Approved';

export interface Activity {
    id: string;
    taskId: string;
    memberId: string;
    description: string;
    startDate: string;
    endDate: string;
    hours: number;
    status: ActivityStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ReportHighlight {
    id: string;
    title: string;
    url: string;
}

export interface Report {
    id: string;
    projectId: string;
    
    // Description Tab
    projectResults: string;
    grantSpendingDescription: string;
    workplanAdjustments: string;

    // Reach Tab - example fields
    involvedPeople: string[];
    involvedActivities: string[];

    // Impact Tab - example fields
    impactStatements: Record<string, string>; // e.g., { q1: '5-agree', q2: '4-agree' }

    // Closing Tab - example fields
    highlights: ReportHighlight[];
    feedback: string;
    additionalFeedback: string;
}


export interface FormFieldProps<T> {
  id: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  instructions?: React.ReactNode;
  placeholder?: string;
  options?: { value: string; label: string }[];
  wordLimit?: number;
  className?: string;
  ariaLabel?: string;
}
