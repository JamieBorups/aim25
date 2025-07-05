import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';
import { useAppContext } from '../context/AppContext';

interface MainMenuProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
}

const NavLink: React.FC<{
    page: Page;
    label: string;
    activePage: Page;
    onNavigate: (page: Page) => void;
}> = ({ page, label, activePage, onNavigate }) => {
    const isActive = activePage === page;
    const baseClasses = "px-3 py-4 text-sm font-semibold transition-colors duration-150 border-b-2";
    const activeClasses = "border-teal-400 text-white";
    const inactiveClasses = "border-transparent text-slate-300 hover:text-white hover:border-slate-500";

    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onNavigate(page);
            }}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {label}
        </a>
    );
};

const DropdownLink: React.FC<{
    page: Page;
    icon: string;
    label: string;
    activePage: Page;
    onNavigate: (page: Page) => void;
    onClick: () => void;
}> = ({ page, icon, label, activePage, onNavigate, onClick }) => {
    const isActive = activePage === page;
    const baseClasses = "group flex items-center w-full px-4 py-2 text-sm text-left";
    const activeClasses = "bg-slate-100 text-slate-900";
    const inactiveClasses = "text-slate-700 hover:bg-slate-100 hover:text-slate-900";

    return (
        <a
            href="#"
            role="menuitem"
            onClick={(e) => {
                e.preventDefault();
                onNavigate(page);
                onClick();
            }}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
             <i className={`${icon} mr-3 h-5 w-5 text-slate-400 group-hover:text-teal-500`} aria-hidden="true"></i>
            {label}
        </a>
    );
}

const MainMenu: React.FC<MainMenuProps> = ({ activePage, onNavigate }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { state } = useAppContext();
    const collectiveName = state.settings.general.collectiveName || 'The Arts Incubator';


     useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [dropdownRef]);


    return (
        <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-40">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold tracking-wider">{collectiveName}</h1>
                        </div>
                        <nav className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                               <NavLink page="home" label="Home" activePage={activePage} onNavigate={onNavigate} />
                               <NavLink page="projects" label="Projects" activePage={activePage} onNavigate={onNavigate} />
                               <NavLink page="members" label="Members" activePage={activePage} onNavigate={onNavigate} />
                               <NavLink page="tasks" label="Task Management" activePage={activePage} onNavigate={onNavigate} />
                               <NavLink page="reports" label="Reports" activePage={activePage} onNavigate={onNavigate} />
                               <NavLink page="settings" label="Settings" activePage={activePage} onNavigate={onNavigate} />
                            </div>
                        </nav>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                             <div className="relative" ref={dropdownRef}>
                                <div>
                                    <button 
                                        type="button" 
                                        className="inline-flex justify-center w-full rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-700/50 text-sm font-medium text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white" 
                                        id="options-menu" 
                                        aria-haspopup="true" 
                                        aria-expanded="true"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        Tools
                                        <i className="fa-solid fa-chevron-down -mr-1 ml-2 h-5 w-5" aria-hidden="true"></i>
                                    </button>
                                </div>
                                {isDropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <div className="py-1" role="none">
                                            <DropdownLink page="taskAssessor" icon="fa-solid fa-wand-magic-sparkles" label="AI Task Assessor" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsDropdownOpen(false)} />
                                            <DropdownLink page="projectAssessor" icon="fa-solid fa-diagram-project" label="Project AI Assistant" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsDropdownOpen(false)} />
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <DropdownLink page="importExport" icon="fa-solid fa-right-left" label="Import / Export Data" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsDropdownOpen(false)} />
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <DropdownLink page="sampleData" icon="fa-solid fa-flask-vial" label="Project Sample Data" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsDropdownOpen(false)} />
                                            <DropdownLink page="detailedSampleData" icon="fa-solid fa-database" label="Detailed Sample Data" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsDropdownOpen(false)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Mobile menu button could go here */}
                </div>
            </div>
        </header>
    );
};

export default MainMenu;