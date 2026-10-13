import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Landing from '@/pages/Landing';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import { SignInPage, SignUpPage } from '@/pages/AuthPages';
import Onboarding from '@/pages/Onboarding';
import CandidateDashboard from '@/pages/CandidateDashboard';
import RecruiterDashboard from '@/pages/RecruiterDashboard';
import Placeholder from '@/pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Landing />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="employers" element={<Placeholder title="For employers" />} />
        <Route path="candidates" element={<Placeholder title="For candidates" />} />
        <Route path="sign-in/*" element={<SignInPage />} />
        <Route path="sign-up/*" element={<SignUpPage />} />
        <Route path="onboarding" element={<ProtectedRoute allowWithoutProfile><Onboarding /></ProtectedRoute>} />
        <Route path="candidate" element={<ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>} />
        <Route path="recruiter" element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="post-job" element={<ProtectedRoute role="recruiter"><Placeholder title="Post a job" /></ProtectedRoute>} />
        <Route path="*" element={<Placeholder title="Page not found" body="That page doesn't exist." />} />
      </Route>
    </Routes>
  );
}
