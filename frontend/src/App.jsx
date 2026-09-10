import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ProtectedRoute } from './components/guard/ProtectedRoute';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { CertificateVerifyPage } from './pages/public/CertificateVerifyPage';
import { Forbidden } from './pages/public/Forbidden';
import { NotFound } from './pages/public/NotFound';

// Student portal
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { SkillGapAnalyzer } from './pages/student/SkillGapAnalyzer';
import { CareerRoadmap } from './pages/student/CareerRoadmap';
import { StudentCertificates } from './pages/student/StudentCertificates';
import { StudentJobs } from './pages/student/StudentJobs';
import { StudentCourses } from './pages/student/StudentCourses';
import { AssessmentSelection } from './pages/student/AssessmentSelection';
import { AssessmentTest } from './pages/student/AssessmentTest';
import { AssessmentResults } from './pages/student/AssessmentResults';
import { ResumeBuilder } from './pages/student/ResumeBuilder';

// Company portal
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyProfile } from './pages/company/CompanyProfile';
import { ManageJobs } from './pages/company/ManageJobs';
import { PostJob } from './pages/company/PostJob';
import { ApplicantsReview } from './pages/company/ApplicantsReview';

// Academician portal
import { AcademicianDashboard } from './pages/academician/AcademicianDashboard';
import { IndustryTrends } from './pages/academician/IndustryTrends';
import { CurriculumGapAnalyzer } from './pages/academician/CurriculumGapAnalyzer';

// Admin portal
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CompanyVerifications } from './pages/admin/CompanyVerifications';
import { CertificateApprovals } from './pages/admin/CertificateApprovals';
import { JobModeration } from './pages/admin/JobModeration';
import { UserManagement } from './pages/admin/UserManagement';

// Layout manager
const AppLayout = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Check if current route is an authenticated workspace route
  const isWorkspace =
    isAuthenticated &&
    (location.pathname.startsWith('/student') ||
      location.pathname.startsWith('/company') ||
      location.pathname.startsWith('/academician') ||
      location.pathname.startsWith('/admin'));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      <Navbar />
      <div className="flex flex-1">
        {isWorkspace && <Sidebar />}
        <main className={`flex-1 ${isWorkspace ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-cert/:certId" element={<CertificateVerifyPage />} />
              <Route path="/courses" element={<StudentCourses />} />
              <Route path="/jobs" element={<StudentJobs />} />
              <Route path="/unauthorized" element={<Forbidden />} />

              {/* Student Portal Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/skill-gap"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <SkillGapAnalyzer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assessment"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <AssessmentSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assessment/:skillId/:level"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <AssessmentTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assessment/:skillId/results/:attemptId"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <AssessmentResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/resume"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <ResumeBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/roadmap"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <CareerRoadmap />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/certificates"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <StudentCertificates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/jobs"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <StudentJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/courses"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <StudentCourses />
                  </ProtectedRoute>
                }
              />

              {/* Company Portal Routes */}
              <Route
                path="/company/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Company']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/profile"
                element={
                  <ProtectedRoute allowedRoles={['Company']}>
                    <CompanyProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/jobs"
                element={
                  <ProtectedRoute allowedRoles={['Company']}>
                    <ManageJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/post-job"
                element={
                  <ProtectedRoute allowedRoles={['Company']}>
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/applicants/:jobId"
                element={
                  <ProtectedRoute allowedRoles={['Company']}>
                    <ApplicantsReview />
                  </ProtectedRoute>
                }
              />

              {/* Academician Portal Routes */}
              <Route
                path="/academician/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Academician']}>
                    <AcademicianDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academician/trends"
                element={
                  <ProtectedRoute allowedRoles={['Academician']}>
                    <IndustryTrends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academician/curriculum-gap"
                element={
                  <ProtectedRoute allowedRoles={['Academician']}>
                    <CurriculumGapAnalyzer />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/companies"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <CompanyVerifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/certificates"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <CertificateApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <JobModeration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
