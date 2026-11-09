import React from 'react';
import type {Tab} from '../types.ts';

interface NavbarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'inicio', label: 'Inicio', icon: '🏠' },
        { id: 'temas', label: 'Temas', icon: '📚' },
        { id: 'stats', label: 'Stats', icon: '📊' },
        { id: 'sugerencias', label: 'Idea', icon: '💡' },
        { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
    ];

    return (
        <nav className="navbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};