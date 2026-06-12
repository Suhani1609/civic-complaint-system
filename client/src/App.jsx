import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import api from './api/axios';

// Auth
import LoginPage  from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Layouts
import Sidebar  from './components/layout/Sidebar';
import Navbar   from './components/layout/Navbar';

// Citizen
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyComplaints     from './pages/citizen/MyComplaints';
import NewComplaint     from './pages/citizen/NewComplaint';
import ComplaintDetail  from './pages/citizen/ComplaintDetail';

// Officer
import OfficerDashboard  from './pages/officer/OfficerDashboard';
import OfficerComplaints from './pages/officer/OfficerComplaints';

// Admin
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminComplaints  from './pages/admin/AdminComplaints';

// Placeholder for pages not built yet
const Placeholder = ({ name }) => (
  <div className="p-8">
    <h2 className="text-xl font-semibold">{name}</h2>
    <p className="text-gray-400 mt-1 text-sm">Coming soon</p>
  </div>
);

const getDashboard = (role) => {
  if (role === 'admin')        return '/admin';
  if (role === 'ward_officer') return '/officer';
  return '/dashboard';
};

// Auth layout
const AuthLayout = () => {
  const { user } = useAuthStore();
  if (user) return <Navigate to={getDashboard(user.role)} replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏛️</div>
          <h1 className="text-xl font-bold text-gray-900">Civic Complaint System</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

// Dashboard layout
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Private route
const PrivateRoute = ({ children, role }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-pulse">🏛️</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={getDashboard(user.role)} replace />;
  return children;
};

// Need React for useState in DashboardLayout
import React from 'react';

function App() {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    api.post('/auth/refresh')
      .then(({ data }) => setAuth(data.user, data.accessToken))
      .catch(() => setLoading(false));
  }, []);

  return (
    <Routes>
      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Citizen */}
      <Route element={<PrivateRoute role="citizen"><DashboardLayout /></PrivateRoute>}>
        <Route path="/dashboard"        element={<CitizenDashboard />} />
        <Route path="/my-complaints"    element={<MyComplaints />} />
        <Route path="/new-complaint"    element={<NewComplaint />} />
        <Route path="/complaints/:id"   element={<ComplaintDetail />} />
      </Route>

      {/* Officer */}
      <Route element={<PrivateRoute role="ward_officer"><DashboardLayout /></PrivateRoute>}>
        <Route path="/officer"                    element={<OfficerDashboard />} />
        <Route path="/officer/complaints"         element={<OfficerComplaints />} />
        <Route path="/officer/complaints/:id"     element={<ComplaintDetail />} />
      </Route>

      {/* Admin */}
      <Route element={<PrivateRoute role="admin"><DashboardLayout /></PrivateRoute>}>
        <Route path="/admin"              element={<AdminDashboard />} />
        <Route path="/admin/complaints"   element={<AdminComplaints />} />
        <Route path="/admin/officers"     element={<Placeholder name="Officers — coming soon" />} />
        <Route path="/admin/wards"        element={<Placeholder name="Wards — coming soon" />} />
        <Route path="/admin/complaints/:id" element={<ComplaintDetail />} />
      </Route>

      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;