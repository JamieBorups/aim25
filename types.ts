import React from 'react';

export type Page = 'home' | 'projects' | 'members' | 'tasks' | 'reports' | 'sampleData' | 'detailedSampleData';
export type TabId = 'projectInfo' | 'collaborators' | 'budget';
export type ProjectViewTabId = 'info' | 'collaborators' | 'budget' | 'workplan' | 'insights';
export type TaskManagerView = 'workplan' | 'tasks' | 'activities';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type ProjectStatus = 'Active' | 'On Hold' | 'Completed';
export type DateRangeFilter = 'all' | 'last7days' | 'last30days' | 'thisMonth';
export type BudgetItemStatus = 'Pending' | 'Approved' | 'Denied';

export type SortDirection = 'asc' | 'desc';
export type TaskSortOption = 'updatedAt' | 'dueDate' | 'assignee';
export type TaskStatusFilter = 'all' | 'overdue' | 'dueThisWeek' | 'todo' | 'inProgress' | 'done';

export type ActivitySortOption = 'date-desc' | 'date-asc' | 'updatedAt';
export type ActivityStatusFilter = 'all' | 'pending' | 'approved';

export interface Tab {
  id: TabId;
  label: string;
}

export interface Member {
    id: string;
    memberId: string;
    firstName: string;
    lastName:string;
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
    status: ProjectStatus;
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
    actualAmount?: number;
    status?: BudgetItemStatus;
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
            actualTotalTickets?: number;
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

export type ExpenseCategoryType = keyof DetailedBudget['expenses'];

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Done';
export type WorkType = 'Paid' | 'In-Kind' | 'Volunteer';
export type TaskType = 'Time-Based' | 'Milestone';

export interface Task {
    id: string;
    taskCode: string;
    projectId: string;
    title: string;
    description: string;
    assignedMemberId: string;
    status: TaskStatus;
    startDate: string;
    dueDate: string;
    taskType: TaskType;
    isComplete: boolean;
    // Time-based fields
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
    startTime?: string;
    endTime?: string;
    hours: number;
    status: ActivityStatus;
    createdAt: string;
    updatedAt: string;
}

export interface DirectExpense {
  id: string;
  projectId: string;
  budgetItemId: string;
  description: string;
  amount: number;
  date: string;
}

export interface ReportHighlight {
    id: string;
    title: string;
    url: string;
}

export interface Report {
    id:string;
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

// NOTE: This is defined in AppContext.tsx but placing here for broader type safety
export interface AppContextType {
  projects: FormData[];
  setProjects: React.Dispatch<React.SetStateAction<FormData[]>>;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  directExpenses: DirectExpense[];
  setDirectExpenses: React.Dispatch<React.SetStateAction<DirectExpense[]>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  notify: (message: string, type: NotificationType) => void;
  approveActivity: (activityId: string) => void;
  reportProjectIdToOpen: string | null;
  setReportProjectIdToOpen: React.Dispatch<React.SetStateAction<string | null>>;
  clearAllData: () => void;
}