import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FormData, Member, Task, Activity, Report, DirectExpense, NotificationType, AppContextType } from '../types';

// Create the context with a default value (will be overridden by Provider)
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<FormData[]>(() => {
        try {
          const saved = localStorage.getItem('projects');
          return saved ? JSON.parse(saved) : [];
        } catch (e) {
          console.error("Failed to parse projects from localStorage", e);
          return [];
        }
    });

    const [members, setMembers] = useState<Member[]>(() => {
        try {
          const saved = localStorage.getItem('members');
          return saved ? JSON.parse(saved) : [];
        } catch (e) {
          console.error("Failed to parse members from localStorage", e);
          return [];
        }
    });
    
    const [tasks, setTasks] = useState<Task[]>(() => {
        try {
          const saved = localStorage.getItem('tasks');
          return saved ? JSON.parse(saved) : [];
        } catch (e) {
          console.error("Failed to parse tasks from localStorage", e);
          return [];
        }
    });

    const [activities, setActivities] = useState<Activity[]>(() => {
        try {
          const saved = localStorage.getItem('activities');
          return saved ? JSON.parse(saved) : [];
        } catch (e) {
          console.error("Failed to parse activities from localStorage", e);
          return [];
        }
    });

    const [directExpenses, setDirectExpenses] = useState<DirectExpense[]>(() => {
        try {
          const saved = localStorage.getItem('directExpenses');
          return saved ? JSON.parse(saved) : [];
        } catch (e) {
          console.error("Failed to parse directExpenses from localStorage", e);
          return [];
        }
    });

    const [reports, setReports] = useState<Report[]>(() => {
        try {
          const saved = localStorage.getItem('reports');
          return saved ? JSON.parse(saved) : [];
        } catch (e) {
          console.error("Failed to parse reports from localStorage", e);
          return [];
        }
    });

    const [reportProjectIdToOpen, setReportProjectIdToOpen] = useState<string | null>(null);

    useEffect(() => {
        try {
        localStorage.setItem('projects', JSON.stringify(projects));
        } catch (e) {
        console.error("Failed to save projects to localStorage", e);
        }
    }, [projects]);

    useEffect(() => {
        try {
        localStorage.setItem('members', JSON.stringify(members));
        } catch (e) {
        console.error("Failed to save members to localStorage", e);
        }
    }, [members]);
    
    useEffect(() => {
        try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (e) {
        console.error("Failed to save tasks to localStorage", e);
        }
    }, [tasks]);

    useEffect(() => {
        try {
        localStorage.setItem('activities', JSON.stringify(activities));
        } catch (e) {
        console.error("Failed to save activities to localStorage", e);
        }
    }, [activities]);

    useEffect(() => {
        try {
        localStorage.setItem('directExpenses', JSON.stringify(directExpenses));
        } catch (e) {
        console.error("Failed to save directExpenses to localStorage", e);
        }
    }, [directExpenses]);

    useEffect(() => {
        try {
        localStorage.setItem('reports', JSON.stringify(reports));
        } catch (e) {
        console.error("Failed to save reports to localStorage", e);
        }
    }, [reports]);

    const notify = useCallback((message: string, type: NotificationType) => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'info':
                toast(message, { icon: 'ℹ️' });
                break;
            case 'warning':
                toast(message, { icon: '⚠️' });
                break;
            default:
                toast(message);
        }
    }, []);
    
    const approveActivity = useCallback((activityId: string) => {
        setActivities(prevActivities => 
            prevActivities.map(a => 
                a.id === activityId ? { ...a, status: 'Approved', updatedAt: new Date().toISOString() } : a
            )
        );
        notify('Activity approved.', 'success');
    }, [setActivities, notify]);

    const clearAllData = useCallback(() => {
        setProjects([]);
        setMembers([]);
        setTasks([]);
        setActivities([]);
        setDirectExpenses([]);
        setReports([]);
        notify('All application data has been cleared.', 'success');
    }, [setProjects, setMembers, setTasks, setActivities, setDirectExpenses, setReports, notify]);

    const value: AppContextType = {
        projects, setProjects,
        members, setMembers,
        tasks, setTasks,
        activities, setActivities,
        directExpenses, setDirectExpenses,
        reports, setReports,
        notify,
        approveActivity,
        reportProjectIdToOpen,
        setReportProjectIdToOpen,
        clearAllData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Create a custom hook for easy consumption
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};