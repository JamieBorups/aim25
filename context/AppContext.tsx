
import React, { createContext, useReducer, useEffect, useContext, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { produce } from 'https://esm.sh/immer';
import { AppState, Action, NotificationType, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return produce(state, draft => { draft.projects = action.payload; });
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
    case 'UPDATE_TASK':
      return produce(state, draft => {
        const index = draft.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) draft.tasks[index] = action.payload;
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
    case 'SET_REPORT_PROJECT_ID_TO_OPEN':
      return produce(state, draft => { draft.reportProjectIdToOpen = action.payload; });
    case 'CLEAR_ALL_DATA':
      return { ...initialState, reportProjectIdToOpen: null };
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
  reportProjectIdToOpen: null,
};

const initializer = (): AppState => {
    try {
        const savedState = localStorage.getItem('appState');
        return savedState ? JSON.parse(savedState) : initialState;
    } catch (e) {
        console.error("Failed to parse state from localStorage", e);
        return initialState;
    }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState, initializer);

    useEffect(() => {
        try {
            localStorage.setItem('appState', JSON.stringify(state));
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
