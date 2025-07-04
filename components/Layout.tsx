import React from 'react';
import MainMenu from './MainMenu';
import { Page } from '../types';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
          },
          success: {
            style: {
              background: '#ecfdf5',
              color: '#064e3b',
              border: '1px solid #d1fae5'
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fee2e2'
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <MainMenu activePage={activePage} onNavigate={onNavigate} />
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;