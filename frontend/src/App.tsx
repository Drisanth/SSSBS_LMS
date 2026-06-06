import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8"><div className="skeleton h-8 w-64 mb-4"></div><div className="skeleton h-64 w-full"></div></div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect if not authorized
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Route */}
        <Route index element={
          user?.role === 'ADMIN' ? <Navigate to="/admin" /> :
          user?.role === 'TEACHER' ? <Navigate to="/teacher" /> :
          <PublicDashboard />
        } />
        
        {/* Auth & Public specific routes */}
        <Route path="login" element={<Login />} />
        <Route path="teacher-connect/send" element={<TeacherConnectSend />} />

        {/* Protected Teacher Routes */}
        <Route path="teacher" element={<ProtectedRoute roles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="materials" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><Materials /></ProtectedRoute>} />
        <Route path="teacher-connect" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><TeacherConnectDashboard /></ProtectedRoute>} />

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
