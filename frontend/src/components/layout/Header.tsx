import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="glass border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <img
                            src="/src/assets/citeon-logo.jpg"
                            alt="CITEON"
                            className="h-10 w-10 rounded-full ring-2 ring-primary-500/50 group-hover:ring-primary-500 transition-all"
                        />
                        <div>
                            <h1 className="text-xl font-bold gradient-text">CITEON</h1>
                            <p className="text-xs text-dark-400">AI Hiring Platform</p>
                        </div>
                    </Link>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-dark-50">{user?.full_name}</p>
                            <p className="text-xs text-dark-400">{user?.email}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link to="/profile">
                                <Button variant="ghost" size="sm" icon={<User className="w-4 h-4" />}>
                                    <span className="hidden sm:inline">Profile</span>
                                </Button>
                            </Link>

                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<LogOut className="w-4 h-4" />}
                                onClick={handleLogout}
                            >
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
