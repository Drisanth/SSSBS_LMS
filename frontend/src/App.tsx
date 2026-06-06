import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import PublicDashboard from './pages/PublicDashboard';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Materials from './pages/Materials';
import Teachers from './pages/Teachers';
import TeacherConnectDashboard from './pages/TeacherConnectDashboard';
import TeacherConnectSend from './pages/TeacherConnectSend';
import Profile from './pages/Profile';
import ForcePasswordChange from './pages/ForcePasswordChange';

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!user) return <Navigate to="/login" replace />;

  // Force password change on first login
  if (user.requiresPasswordChange && location.pathname !== '/force-password-change') {
    return <Navigate to="/force-password-change" replace />;
  }

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth & Public specific routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/teacher-connect/send" element={<TeacherConnectSend />} />

      {/* Forced Password Change Route - No Layout */}
      <Route path="/force-password-change" element={
        <ProtectedRoute>
          <ForcePasswordChange />
        </ProtectedRoute>
      } />

      {/* Main Application with Layout */}
      <Route path="/" element={<Layout />}>
        {/* Public Route */}
        <Route index element={
          user?.role === 'ADMIN' ? <Navigate to="/admin" /> :
          user?.role === 'TEACHER' ? <Navigate to="/teacher" /> :
          <PublicDashboard />
        } />
        
        {/* Protected Teacher Routes */}
        <Route path="teacher" element={<ProtectedRoute roles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="materials" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><Materials /></ProtectedRoute>} />
        <Route path="teacher-connect" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><TeacherConnectDashboard /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="teachers" element={<ProtectedRoute roles={['ADMIN']}><Teachers /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
