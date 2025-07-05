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
import { Page } from './types';

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
      </Layout>
    </AppProvider>
  );
};

export default App;