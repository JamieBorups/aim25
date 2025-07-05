


import React, { createContext, useReducer, useEffect, useContext, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { produce } from 'immer';
import { AppState, Action, NotificationType, AppContextType, AppSettings, ProjectStatus, AiPersonaName, FormData } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const initialSettings: AppSettings = {
  general: {
    collectiveName: 'The Arts Incubator',
    defaultCurrency: 'CAD',
    dateFormat: 'YYYY-MM-DD',
  },
  projects: {
    statuses: [],
    disciplines: [],
  },
  members: {
    roles: [],
    availability: [],
  },
  tasks: {
    statuses: [],
    defaultWorkTypes: {
      paidRate: 25,
      inKindRate: 25,
      volunteerRate: 0,
    },
    workWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  },
  budget: {
    revenueLabels: {},
    expenseLabels: {},
  },
  ai: {
    enabled: false,
    plainTextMode: false,
    personas: {
      main: {
        model: 'gemini-2.5-flash-preview-04-17',
        temperature: 0.7,
        instructions: "You are an expert arts administrator and grant writer, acting as a supportive and encouraging assistant for a small, community-focused arts collective. Many of the users may be from under-resourced northern, rural, or Indigenous communities and may not have professional administrative experience. Your tone should be clear, professional, accessible, and empowering. Avoid jargon. Your goal is to help users manage their projects, budgets, and reporting efficiently and confidently, turning their artistic visions into well-structured, fundable projects. Always provide actionable advice.",
      },
      projects: {
        model: 'gemini-2.5-flash-preview-04-17',
        temperature: 0.8,
        instructions: "As the Project Specialist, your role is to help users flesh out their ideas into compelling project descriptions. Focus on asking clarifying questions that draw out the 'what, why, and how' of their project. Help them articulate their artistic vision, community impact, and feasibility. When asked to generate text, adopt a narrative and slightly formal tone suitable for a grant application. Emphasize clarity, structure, and impact.",
      },
      budget: {
        model: 'gemini-2.5-flash-preview-04-17',
        temperature: 0.4,
        instructions: "As the Budget Specialist, your persona is that of a meticulous, friendly bookkeeper. Your primary goal is accuracy and clarity. When asked to analyze or suggest budget items, be precise and reference standard practices (like CARFAC fees, per diems). Help users ensure their financial plans are realistic, comprehensive, and justifiable to funders. Use a very logical and straightforward tone.",
      },
      members: {
        model: 'gemini-2.5-flash-preview-04-17',
        temperature: 0.7,
        instructions: "As the Member Specialist, your role is to help artists articulate their skills and experience. When generating or refining bios, focus on highlighting their strengths, unique experiences, and contributions to the collective. Maintain a professional and respectful tone that celebrates their artistic identity.",
      },
      tasks: {
        model: 'gemini-2.5-flash-preview-04-17',
        temperature: 0.6,
        instructions: "As the Task Management Specialist, you are a pragmatic and organized project manager. When a user provides a large goal (e.g., 'put on a show'), your job is to break it down into small, concrete, and actionable tasks. For each task, suggest a clear title, a brief description, and potential dependencies. Your language should be direct and focused on getting things done.",
      },
      reports: {
        model: 'gemini-2.5-flash-preview-04-17',
        temperature: 0.5,
        instructions: "As the Reporting Specialist, you are an experienced grant writer with a data-driven approach. Your goal is to help users summarize their project outcomes in a way that is clear, compelling, and satisfying to funders. When analyzing data, focus on quantifiable achievements (e.g., 'Reached X audience members,' 'Employed Y artists'). When generating text, use a professional tone and structure answers logically to align with standard final report questions.",
      },
    }
  },
};

const appReducer = (state: AppState, action: Action): AppState => {
  console.log('%cDispatching Action:', 'color: #f59e0b; font-weight: bold;', action);
  switch (action.type) {
    case 'SET_PROJECTS':
      return produce(state, draft => { draft.projects = action.payload; });
    case 'UPDATE_PROJECT_PARTIAL':
      return produce(state, draft => {
        const project = draft.projects.find(p => p.id === action.payload.projectId);
        if (project) {
          Object.assign(project, action.payload.data);
        }
      });
    case 'UPDATE_PROJECT_STATUS':
      return produce(state, draft => {
        const project = draft.projects.find(p => p.id === action.payload.projectId);
        if (project) project.status = action.payload.status;
      });
    case 'DELETE_PROJECT':
      return produce(state, draft => {
        const tasksToDelete = draft.tasks.filter(t => t.projectId === action.payload);
        const taskIdsToDelete = new Set(tasksToDelete.map(t => t.id));
        draft.projects = draft.projects.filter(p => p.id !== action.payload);
        draft.tasks = draft.tasks.filter(t => t.projectId !== action.payload);
        draft.activities = draft.activities.filter(a => !taskIdsToDelete.has(a.taskId));
        draft.directExpenses = draft.directExpenses.filter(d => d.projectId !== action.payload);
        draft.reports = draft.reports.filter(r => r.projectId !== action.payload);
      });
    case 'SET_MEMBERS':
      return produce(state, draft => { draft.members = action.payload; });
    case 'DELETE_MEMBER':
      return produce(state, draft => {
        draft.members = draft.members.filter(m => m.id !== action.payload);
        draft.projects.forEach(project => {
            project.collaboratorDetails = project.collaboratorDetails.filter(c => c.memberId !== action.payload);
        });
        draft.tasks.forEach(task => {
            if (task.assignedMemberId === action.payload) task.assignedMemberId = '';
        });
      });
    case 'SET_TASKS':
      return produce(state, draft => { draft.tasks = action.payload; });
    case 'ADD_TASK':
      return produce(state, draft => { draft.tasks.push(action.payload); });
    case 'ADD_TASKS':
      return produce(state, draft => { draft.tasks.push(...action.payload); });
    case 'UPDATE_TASK':
      return produce(state, draft => {
        const index = draft.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
            draft.tasks[index] = { ...draft.tasks[index], ...action.payload };
        }
      });
    case 'UPDATE_TASK_PARTIAL':
      return produce(state, draft => {
        const task = draft.tasks.find(t => t.id === action.payload.taskId);
        if(task) {
          Object.assign(task, action.payload.data);
          task.updatedAt = new Date().toISOString();
        }
      });
    case 'DELETE_TASK':
      return produce(state, draft => {
        draft.tasks = draft.tasks.filter(t => t.id !== action.payload);
        draft.activities = draft.activities.filter(a => a.taskId !== action.payload);
      });
    case 'SET_ACTIVITIES':
      return produce(state, draft => { draft.activities = action.payload; });
    case 'ADD_ACTIVITIES':
      return produce(state, draft => { draft.activities.push(...action.payload); });
    case 'UPDATE_ACTIVITY':
        return produce(state, draft => {
            const index = draft.activities.findIndex(a => a.id === action.payload.id);
            if (index !== -1) draft.activities[index] = action.payload;
        });
    case 'APPROVE_ACTIVITY':
      return produce(state, draft => {
        const activity = draft.activities.find(a => a.id === action.payload);
        if (activity) {
          activity.status = 'Approved';
          activity.updatedAt = new Date().toISOString();
        }
      });
    case 'DELETE_ACTIVITY':
      return produce(state, draft => {
        draft.activities = draft.activities.filter(a => a.id !== action.payload);
      });
    case 'SET_DIRECT_EXPENSES':
      return produce(state, draft => { draft.directExpenses = action.payload; });
    case 'ADD_DIRECT_EXPENSE':
        return produce(state, draft => { draft.directExpenses.push(action.payload); });
    case 'SET_REPORTS':
      return produce(state, draft => { draft.reports = action.payload; });
    case 'UPDATE_SETTINGS':
      return produce(state, draft => { draft.settings = action.payload; });
    case 'SET_REPORT_PROJECT_ID_TO_OPEN':
      return produce(state, draft => { draft.reportProjectIdToOpen = action.payload; });
    case 'SET_ACTIVE_WORKSHOP_ITEM':
      return produce(state, draft => { draft.activeWorkshopItem = action.payload; });
    case 'ADD_PROJECT_DATA':
        return produce(state, draft => {
            const { project, tasks, activities, directExpenses, members } = action.payload;
            draft.projects.push(project);
            draft.tasks.push(...tasks);
            draft.activities.push(...activities);
            draft.directExpenses.push(...directExpenses);

            const existingMemberEmails = new Set(draft.members.map(m => m.email.toLowerCase()));
            const newMembers = members.filter(m => !existingMemberEmails.has(m.email.toLowerCase()));
            draft.members.push(...newMembers);
        });
    case 'CLEAR_ALL_DATA':
      const newState = { ...initialState, settings: { ...initialState.settings }};
      // when clearing data, we want to reset settings to default, but keep any custom labels the user has set up
      newState.settings.budget = state.settings.budget;
      newState.settings.projects = state.settings.projects;
      return newState;
    case 'LOAD_DATA':
        return { ...initialState, ...action.payload };
    default:
      return state;
  }
};

const initialState: AppState = {
  projects: [],
  members: [],
  tasks: [],
  activities: [],
  directExpenses: [],
  reports: [],
  settings: initialSettings,
  reportProjectIdToOpen: null,
  activeWorkshopItem: null,
};

const initializer = (): AppState => {
    console.log('Initializing state...');
    try {
        const savedStateString = localStorage.getItem('appState');
        if (!savedStateString) {
            console.log('No saved state found. Initializing with default state.');
            return initialState;
        }

        console.log('Found saved state in localStorage. Parsing...');
        const parsedState = JSON.parse(savedStateString);

        if (typeof parsedState !== 'object' || parsedState === null) {
            throw new Error("Stored state is not a valid object.");
        }

        // --- Settings Migration Logic (made more robust) ---
        // Start with a deep copy of initial settings to ensure all properties exist.
        const migratedSettings = produce(initialSettings, draft => {
            const savedSettings = parsedState.settings || {};
            
            // Shallow merge each settings category. This is safe for most categories.
            (Object.keys(draft) as Array<keyof AppSettings>).forEach(categoryKey => {
                const savedCategoryData = savedSettings[categoryKey];
                if (savedCategoryData && typeof savedCategoryData === 'object' && categoryKey !== 'ai') {
                    Object.assign((draft as any)[categoryKey], savedCategoryData);
                }
            });

            // Special, deeper merge for the 'ai' category due to nested personas.
            if (savedSettings.ai && typeof savedSettings.ai === 'object') {
                draft.ai.enabled = savedSettings.ai.enabled ?? draft.ai.enabled;
                draft.ai.plainTextMode = savedSettings.ai.plainTextMode ?? draft.ai.plainTextMode;
                
                if (savedSettings.ai.personas && typeof savedSettings.ai.personas === 'object') {
                    (Object.keys(draft.ai.personas) as AiPersonaName[]).forEach(personaKey => {
                        const savedPersonaData = savedSettings.ai.personas[personaKey];
                        if (savedPersonaData && typeof savedPersonaData === 'object') {
                            // Merge saved persona data into the default persona structure
                            Object.assign(draft.ai.personas[personaKey], savedPersonaData);
                        }
                    });
                }
            }
        });

        // --- Build Final State (Defensive Approach) ---
        // Ensure all top-level array properties are actually arrays.
        // This prevents crashes if localStorage has a corrupted value (e.g., `projects: null`).
        const finalState: AppState = {
            projects: Array.isArray(parsedState.projects) ? parsedState.projects : initialState.projects,
            members: Array.isArray(parsedState.members) ? parsedState.members : initialState.members,
            tasks: Array.isArray(parsedState.tasks) ? parsedState.tasks : initialState.tasks,
            activities: Array.isArray(parsedState.activities) ? parsedState.activities : initialState.activities,
            directExpenses: Array.isArray(parsedState.directExpenses) ? parsedState.directExpenses : initialState.directExpenses,
            reports: Array.isArray(parsedState.reports) ? parsedState.reports : initialState.reports,
            settings: migratedSettings,
            reportProjectIdToOpen: parsedState.reportProjectIdToOpen || initialState.reportProjectIdToOpen,
            activeWorkshopItem: null, // Always start with no workshop item active
        };
        
        console.log('State successfully initialized from localStorage:', finalState);
        return finalState;

    } catch (e) {
        console.error("Critical error initializing state from localStorage. Resetting application state.", e);
        // If anything goes wrong, clear the corrupted state to prevent crash loops and start fresh.
        try {
            localStorage.removeItem('appState');
        } catch (removeError) {
            console.error("Failed to remove corrupted state from localStorage.", removeError);
        }
        return initialState;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState, initializer);

    useEffect(() => {
        try {
            console.log('Saving state to localStorage...');
            const stateToSave = { ...state, activeWorkshopItem: null }; // Don't persist active workshop item
            localStorage.setItem('appState', JSON.stringify(stateToSave));
        } catch (e) {
            console.error("Failed to save state to localStorage", e);
        }
    }, [state]);

    const notify = useCallback((message: string, type: NotificationType) => {
        switch (type) {
            case 'success': toast.success(message); break;
            case 'error': toast.error(message); break;
            case 'info': toast(message, { icon: 'ℹ️' }); break;
            case 'warning': toast(message, { icon: '⚠️' }); break;
            default: toast(message);
        }
    }, []);

    const value: AppContextType = { state, dispatch, notify };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
