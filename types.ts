

import React from 'react';

export type Page = 'home' | 'projects' | 'members' | 'tasks' | 'reports' | 'sampleData' | 'detailedSampleData' | 'settings' | 'importExport' | 'taskAssessor' | 'projectAssessor' | 'aiWorkshop';
export type TabId = 'projectInfo' | 'collaborators' | 'budget';
export type ProjectViewTabId = 'info' | 'collaborators' | 'budget' | 'workplan' | 'insights';
export type TaskManagerView = 'workplan' | 'tasks' | 'activities';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type ProjectStatus = 'Pending' | 'Active' | 'On Hold' | 'Completed' | 'Terminated';
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
    status: ProjectStatus | string; // Can be custom now
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
    status: TaskStatus | string; // Can be custom now
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


// --- Settings ---
export type SettingsCategory = 'general' | 'projects' | 'members' | 'tasks' | 'ai' | 'budget';
export interface CustomStatus { id: string; label: string; color: string; }
export interface CustomDiscipline { id: string; name: string; genres: { id: string; name: string }[]; }
export interface CustomRole { id: string; name: string; }
export interface CustomTaskStatus { id: string; name: string; color: string; }

export type AiPersonaName = 'main' | 'projects' | 'members' | 'tasks' | 'budget' | 'reports';

export interface AiPersonaSettings {
  instructions: string;
  model: string;
  temperature: number; // 0 (precise) to 1 (creative)
}

export interface AppSettings {
  general: {
    collectiveName: string;
    defaultCurrency: 'CAD' | 'USD' | 'EUR';
    dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  };
  projects: {
    statuses: CustomStatus[];
    disciplines: CustomDiscipline[];
  };
  members: {
    roles: CustomRole[];
    availability: CustomRole[];
  };
  tasks: {
    statuses: CustomTaskStatus[];
    defaultWorkTypes: {
      paidRate: number;
      inKindRate: number;
      volunteerRate: number;
    };
    workWeek: string[];
  };
  budget: {
    revenueLabels: Record<string, string>;
    expenseLabels: Record<string, string>;
  };
  ai: {
    enabled: boolean;
    plainTextMode: boolean;
    personas: Record<AiPersonaName, AiPersonaSettings>;
  };
}

// --- Import/Export ---
export interface ProjectExportData {
  project: FormData;
  tasks: Task[];
  activities: Activity[];
  directExpenses: DirectExpense[];
  members: Member[];
}

export interface ProjectExportFile {
  type: "ARTS_INCUBATOR_PROJECT_EXPORT";
  appVersion: string;
  exportDate: string;
  data: ProjectExportData;
}

export interface WorkspaceExportFile {
  type: "ARTS_INCUBATOR_WORKSPACE_BACKUP";
  appVersion: string;
  exportDate: string;
  data: Omit<AppState, 'reportProjectIdToOpen' | 'activeWorkshopItem'>;
}

export interface AiSettingsExportFile {
  type: "ARTS_INCUBATOR_AI_SETTINGS_EXPORT";
  appVersion: string;
  exportDate: string;
  data: AppSettings['ai'];
}


// --- Reducer State & Actions ---
export interface AppState {
    projects: FormData[];
    members: Member[];
    tasks: Task[];
    activities: Activity[];
    directExpenses: DirectExpense[];
    reports: Report[];
    settings: AppSettings;
    reportProjectIdToOpen: string | null;
    activeWorkshopItem: {
      type: 'task';
      itemId: string;
    } | {
      type: 'project';
      itemId: string;
      fieldKey: keyof FormData | 'artisticDisciplinesAndGenres';
      fieldLabel: string;
    } | null;
}

export type Action =
  | { type: 'SET_PROJECTS'; payload: FormData[] }
  | { type: 'UPDATE_PROJECT_PARTIAL'; payload: { projectId: string; data: Partial<FormData> } }
  | { type: 'UPDATE_PROJECT_STATUS'; payload: { projectId: string; status: ProjectStatus | string } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_MEMBERS'; payload: Member[] }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'ADD_TASKS'; payload: Task[] }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'UPDATE_TASK_PARTIAL'; payload: { taskId: string; data: Partial<Pick<Task, 'title' | 'description'>> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITIES'; payload: Activity[] }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity }
  | { type: 'APPROVE_ACTIVITY'; payload: string }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'SET_DIRECT_EXPENSES'; payload: DirectExpense[] }
  | { type: 'ADD_DIRECT_EXPENSE'; payload: DirectExpense }
  | { type: 'SET_REPORTS'; payload: Report[] }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'SET_REPORT_PROJECT_ID_TO_OPEN'; payload: string | null }
  | { type: 'SET_ACTIVE_WORKSHOP_ITEM'; payload: AppState['activeWorkshopItem'] }
  | { type: 'ADD_PROJECT_DATA', payload: ProjectExportData }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'LOAD_DATA'; payload: Omit<Partial<AppState>, 'reportProjectIdToOpen' | 'activeWorkshopItem'> };


// --- App Context Type ---
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  notify: (message: string, type: NotificationType) => void;
}