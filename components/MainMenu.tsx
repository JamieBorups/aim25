
import React from 'react';
import { Page } from '../types';

interface MainMenuProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
}

const NavLink: React.FC<{
    page: Page;
    icon: string;
    label: string;
    activePage: Page;
    onNavigate: (page: Page) => void;
}> = ({ page, icon, label, activePage, onNavigate }) => {
    const isActive = activePage === page;
    const baseClasses = "group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-150";
    const activeClasses = "bg-slate-900 text-white shadow-inner";
    const inactiveClasses = "text-slate-300 hover:bg-slate-700/50 hover:text-white";

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
            <i className={`${icon} mr-3 h-5 w-5 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-400'}`} aria-hidden="true"></i>
            {label}
        </a>
    );
}

const MainMenu: React.FC<MainMenuProps> = ({ activePage, onNavigate }) => {
    return (
        <div className="w-64 bg-slate-800 text-white flex-shrink-0 flex flex-col">
            <div className="h-16 flex items-center justify-center bg-slate-900 shadow-md flex-shrink-0 border-b border-slate-700">
                <h1 className="text-xl font-bold tracking-wider">The Arts Incubator</h1>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                <NavLink
                    page="home"
                    icon="fa-solid fa-house"
                    label="Home"
                    activePage={activePage}
                    onNavigate={onNavigate}
                />
                <NavLink
                    page="projects"
                    icon="fa-solid fa-diagram-project"
                    label="Projects"
                    activePage={activePage}
                    onNavigate={onNavigate}
                />
                 <NavLink
                    page="members"
                    icon="fa-solid fa-users"
                    label="Members"
                    activePage={activePage}
                    onNavigate={onNavigate}
                />
                <NavLink
                    page="tasks"
                    icon="fa-solid fa-list-check"
                    label="Task Management"
                    activePage={activePage}
                    onNavigate={onNavigate}
                />
                <div>
                    <NavLink
                        page="reports"
                        icon="fa-solid fa-chart-pie"
                        label="Reports"
                        activePage={activePage}
                        onNavigate={onNavigate}
                    />
                     <div className="pl-6 mt-1">
                        <NavLink
                            page="reportsPrototype"
                            icon="fa-solid fa-flask"
                            label="Prototype"
                            activePage={activePage}
                            onNavigate={onNavigate}
                        />
                    </div>
                </div>

                 <div className="pt-4 mt-4 border-t border-slate-700/50">
                    <NavLink
                        page="sampleData"
                        icon="fa-solid fa-flask-vial"
                        label="Project Sample Data"
                        activePage={activePage}
                        onNavigate={onNavigate}
                    />
                </div>
            </nav>
        </div>
    );
};

export default MainMenu;
