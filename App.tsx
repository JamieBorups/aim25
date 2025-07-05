
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProjectManager from './ProjectManager';
import HomePage from './components/HomePage';
import MemberManager from './MemberManager';
import TaskManager from './TaskManager';
import ReportsPage from './components/ReportsPage';
import SampleData from './components/SampleData';
import DetailedSampleData from './components/DetailedSampleData';
import SettingsManager from './components/settings/SettingsManager';
import ImportExportPage from './components/ImportExportPage';
import { Page } from './types';
import TaskAssessorPage from './components/tools/TaskAssessorPage';
import ProjectAssessorPage from './components/tools/ProjectAssessorPage';
import AiWorkshopPage from './components/pages/AiWorkshopPage';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('home');

  return (
    <AppProvider>
      <Layout activePage={activePage} onNavigate={setActivePage}>
        {activePage === 'home' && <HomePage onNavigate={setActivePage} />}
        {activePage === 'projects' && <ProjectManager onNavigate={setActivePage} />}
        {activePage === 'members' && <MemberManager />}
        {activePage === 'tasks' && <TaskManager />}
        {activePage === 'reports' && <ReportsPage />}
        {activePage === 'sampleData' && <SampleData />}
        {activePage === 'detailedSampleData' && <DetailedSampleData />}
        {activePage === 'settings' && <SettingsManager />}
        {activePage === 'importExport' && <ImportExportPage />}
        {activePage === 'taskAssessor' && <TaskAssessorPage onNavigate={setActivePage} />}
        {activePage === 'projectAssessor' && <ProjectAssessorPage onNavigate={setActivePage} />}
        {activePage === 'aiWorkshop' && <AiWorkshopPage onNavigate={setActivePage} />}
      </Layout>
    </AppProvider>
  );
};

export default App;
