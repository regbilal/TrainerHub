import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import CoachDashboard from './pages/coach/Dashboard';
import CoachClientDetail from './pages/coach/ClientDetail';
import CoachProgramForm from './pages/coach/ProgramForm';
import CoachPrograms from './pages/coach/Programs';
import CoachMealPrograms from './pages/coach/MealPrograms';
import CoachMealProgramForm from './pages/coach/MealProgramForm';
import CoachErrorLogs from './pages/coach/ErrorLogs';
import ClientDashboard from './pages/client/Dashboard';
import ClientProgramView from './pages/client/ProgramView';
import ClientMealProgramView from './pages/client/MealProgramView';
import ClientProgress from './pages/client/Progress';
import SearchCoaches from './pages/SearchCoaches';
import Layout from './components/Layout';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'Coach' | 'Client' }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'Coach' ? '/coach' : '/client'} />;
  return <>{children}</>;
}

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" /></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'Coach' ? '/coach' : '/client'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'Coach' ? '/coach' : '/client'} /> : <Register />} />
      <Route path="/onboarding/:token" element={<Onboarding />} />
      <Route path="/search" element={<SearchCoaches />} />

      <Route path="/coach" element={<ProtectedRoute role="Coach"><Layout /></ProtectedRoute>}>
        <Route index element={<CoachDashboard />} />
        <Route path="clients/:id" element={<CoachClientDetail />} />
        <Route path="programs" element={<CoachPrograms />} />
        <Route path="programs/new" element={<CoachProgramForm />} />
        <Route path="programs/:id/edit" element={<CoachProgramForm />} />
        <Route path="meals" element={<CoachMealPrograms />} />
        <Route path="meals/new" element={<CoachMealProgramForm />} />
        <Route path="meals/:id/edit" element={<CoachMealProgramForm />} />
        <Route path="errors" element={<CoachErrorLogs />} />
      </Route>

      <Route path="/client" element={<ProtectedRoute role="Client"><Layout /></ProtectedRoute>}>
        <Route index element={<ClientDashboard />} />
        <Route path="programs/:assignmentId" element={<ClientProgramView />} />
        <Route path="meals/:assignmentId" element={<ClientMealProgramView />} />
        <Route path="progress" element={<ClientProgress />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
