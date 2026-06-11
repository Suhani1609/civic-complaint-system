import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import api from './api/axios';
import NewComplaint from './pages/citizen/NewComplaint';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Placeholder dashboard pages (replaced in Phase 4)
const Placeholder = ({ name }) => (
  <div style={{ padding: 32 }}>
    <h2 style={{ fontSize: 20, fontWeight: 600 }}>{name}</h2>
    <p style={{ color: '#888', marginTop: 8 }}>Full implementation coming in Phase 4</p>
  </div>
);

// Auth layout — centered card, redirects if already logged in
const AuthLayout = () => {
  const { user } = useAuthStore();
  if (user) return <Navigate to={getDashboard(user.role)} replace />;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: 16,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32 }}>🏛️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>Civic Complaint System</div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

// Protected route — redirects to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const getDashboard = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'ward_officer') return '/officer';
  return '/dashboard';
};

function App() {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    api.post('/auth/refresh')
      .then(({ data }) => setAuth(data.user, data.accessToken))
      .catch(() => setLoading(false));
  }, []);

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route path="/new-complaint" element={<PrivateRoute><NewComplaint /></PrivateRoute>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<PrivateRoute><Placeholder name="Citizen Dashboard — Phase 4" /></PrivateRoute>} />
      <Route path="/officer"   element={<PrivateRoute><Placeholder name="Officer Dashboard — Phase 4" /></PrivateRoute>} />
      <Route path="/admin"     element={<PrivateRoute><Placeholder name="Admin Dashboard — Phase 4" /></PrivateRoute>} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;