import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Landing Page
import LandingPage from './pages/LandingPage';

// Main Pages
import DashboardPage from './pages/DashboardPage';
import JobsListPage from './pages/jobs/JobsListPage';
import CreateJobPage from './pages/jobs/CreateJobPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import ResumesListPage from './pages/resumes/ResumesListPage';
import UploadResumePage from './pages/resumes/UploadResumePage';
import ApplicationsListPage from './pages/applications/ApplicationsListPage';
import ApplicationDetailPage from './pages/applications/ApplicationDetailPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import InterviewsListPage from './pages/interviews/InterviewsListPage';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <JobsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute>
                  <CreateJobPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resumes"
              element={
                <ProtectedRoute>
                  <ResumesListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resumes/upload"
              element={
                <ProtectedRoute>
                  <UploadResumePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <ApplicationsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/:id"
              element={
                <ProtectedRoute>
                  <ApplicationDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interviews"
              element={
                <ProtectedRoute>
                  <InterviewsListPage />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
