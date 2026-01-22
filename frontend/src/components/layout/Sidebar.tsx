import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Users,
    BarChart3,
    Calendar
} from 'lucide-react';

const Sidebar: React.FC = () => {
    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/jobs', icon: Briefcase, label: 'Jobs' },
        { to: '/resumes', icon: FileText, label: 'Resumes' },
        { to: '/applications', icon: Users, label: 'Applications' },
        { to: '/interviews', icon: Calendar, label: 'Interviews' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ];

    return (
        <aside className="w-64 glass border-r border-white/10 min-h-screen p-4 hidden lg:block">
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400 border border-primary-500/30'
                                : 'text-dark-300 hover:text-dark-50 hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
