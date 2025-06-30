import React from 'react';
import MainMenu from './MainMenu';
import { Page } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <MainMenu activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
};

export default Layout;
