import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import { BarChart3 } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-dark-50 mb-2">Analytics</h1>
                    <p className="text-dark-400">View insights and trends</p>
                </div>

                <Card>
                    <div className="text-center py-12">
                        <BarChart3 className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                        <h3 className="text-xl font-semibold text-dark-300 mb-2">Analytics Dashboard</h3>
                        <p className="text-dark-500">Advanced analytics features coming soon</p>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AnalyticsPage;
