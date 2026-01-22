import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
