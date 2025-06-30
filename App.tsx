

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ProjectManager from './ProjectManager';
import HomePage from './components/HomePage';
import MemberManager from './MemberManager';
import TaskManager from './TaskManager';
import ReportsPage from './components/ReportsPage';
import ReportsPrototypePage from './components/ReportsPrototypePage';
import SampleData from './components/SampleData';
import { Page, FormData, Member, Task, Activity, Report } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('home');
  
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

  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const saved = localStorage.getItem('reports');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse reports from localStorage", e);
      return [];
    }
  });

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
      localStorage.setItem('reports', JSON.stringify(reports));
    } catch (e) {
      console.error("Failed to save reports to localStorage", e);
    }
  }, [reports]);

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'home' && <HomePage />}
      {activePage === 'projects' && <ProjectManager projects={projects} setProjects={setProjects} members={members} tasks={tasks} activities={activities} />}
      {activePage === 'members' && <MemberManager members={members} setMembers={setMembers} projects={projects}/>}
      {activePage === 'tasks' && <TaskManager tasks={tasks} setTasks={setTasks} projects={projects} members={members} activities={activities} setActivities={setActivities} />}
      {activePage === 'reports' && <ReportsPage />}
      {activePage === 'reportsPrototype' && <ReportsPrototypePage projects={projects} tasks={tasks} activities={activities} reports={reports} setReports={setReports} />}
      {activePage === 'sampleData' && <SampleData setProjects={setProjects} setMembers={setMembers} setTasks={setTasks} setActivities={setActivities} setReports={setReports} />}
    </Layout>
  );
};

export default App;