import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import CandidateLayout from '../layouts/CandidateLayout';
import RecruiterLayout from '../layouts/RecruiterLayout';
import AdminLayout from '../layouts/AdminLayout';
import HomePage from '../pages/public/HomePage';
import NotFoundPage from '../pages/public/NotFoundPage';
import JobsBrowsePage from '../pages/public/JobsBrowsePage';
import JobDetailsPage from '../pages/public/JobDetailsPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import CandidateDashboardPage from '../pages/candidate/CandidateDashboardPage';
import CandidateProfilePage from '../pages/candidate/CandidateProfilePage';
import CandidateResumePage from '../pages/candidate/CandidateResumePage';
import CandidateApplicationsPage from '../pages/candidate/CandidateApplicationsPage';
import CandidateSavedJobsPage from '../pages/candidate/CandidateSavedJobsPage';
import CandidateResumeBuilderPage from '../pages/candidate/CandidateResumeBuilderPage';
import CandidateRecommendationsPage from '../pages/candidate/CandidateRecommendationsPage';
import CandidateCareerSuggestionsPage from '../pages/candidate/CandidateCareerSuggestionsPage';
import CandidateSkillVerificationPage from '../pages/candidate/CandidateSkillVerificationPage';
import CandidateReadinessPage from '../pages/candidate/CandidateReadinessPage';
import CandidateCareerAssistantPage from '../pages/candidate/CandidateCareerAssistantPage';
import RecruiterDashboardPage from '../pages/recruiter/RecruiterDashboardPage';
import RecruiterCompanyPage from '../pages/recruiter/RecruiterCompanyPage';
import RecruiterJobsPage from '../pages/recruiter/RecruiterJobsPage';
import RecruiterJobCreatePage from '../pages/recruiter/RecruiterJobCreatePage';
import RecruiterJobEditPage from '../pages/recruiter/RecruiterJobEditPage';
import RecruiterApplicantsPage from '../pages/recruiter/RecruiterApplicantsPage';
import RecruiterTalentSearchPage from '../pages/recruiter/RecruiterTalentSearchPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCompaniesPage from '../pages/admin/AdminCompaniesPage';
import AdminJobsPage from '../pages/admin/AdminJobsPage';
import NotificationsPage from '../components/common/NotificationsPage';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES, USER_ROLES } from '../constants';

/**
 * Route tree grows incrementally with each phase:
 *  - Phase 5 adds /jobs and /jobs/:jobId (public marketplace)
 *  - Phase 7 extends dashboard routing further
 *  - Phase 9 adds protected /admin routes
 * Only routes with real, implemented pages are registered here.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path={ROUTES.JOBS} element={<JobsBrowsePage />} />
        <Route path={ROUTES.JOB_DETAILS} element={<JobDetailsPage />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.CANDIDATE]} />}>
        <Route path={ROUTES.CANDIDATE_DASHBOARD} element={<CandidateLayout />}>
          <Route index element={<CandidateDashboardPage />} />
          <Route path="profile" element={<CandidateProfilePage />} />
          <Route path="resume" element={<CandidateResumePage />} />
          <Route path="applications" element={<CandidateApplicationsPage />} />
          <Route path="saved-jobs" element={<CandidateSavedJobsPage />} />
          <Route path="recommendations" element={<CandidateRecommendationsPage />} />
          <Route path="resume-builder" element={<CandidateResumeBuilderPage />} />
          <Route path="career-suggestions" element={<CandidateCareerSuggestionsPage />} />
          <Route path="skill-verification" element={<CandidateSkillVerificationPage />} />
          <Route path="readiness" element={<CandidateReadinessPage />} />
          <Route path="assistant" element={<CandidateCareerAssistantPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]} />}>
        <Route path={ROUTES.RECRUITER_DASHBOARD} element={<RecruiterLayout />}>
          <Route index element={<RecruiterDashboardPage />} />
          <Route path="company" element={<RecruiterCompanyPage />} />
          <Route path="jobs" element={<RecruiterJobsPage />} />
          <Route path="jobs/new" element={<RecruiterJobCreatePage />} />
          <Route path="jobs/:jobId/edit" element={<RecruiterJobEditPage />} />
          <Route path="jobs/:jobId/applicants" element={<RecruiterApplicantsPage />} />
          <Route path="talent-search" element={<RecruiterTalentSearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="companies" element={<AdminCompaniesPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
