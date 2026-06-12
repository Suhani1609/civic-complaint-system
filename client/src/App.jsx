import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import api from './api/axios';

import LoginPage  from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

import Sidebar    from './components/layout/Sidebar';
import Navbar     from './components/layout/Navbar';
import BottomNav  from './components/layout/BottomNav';

import CitizenDashboard  from './pages/citizen/CitizenDashboard';
import MyComplaints      from './pages/citizen/MyComplaints';
import NewComplaint      from './pages/citizen/NewComplaint';
import ComplaintDetail   from './pages/citizen/ComplaintDetail';

import OfficerDashboard  from './pages/officer/OfficerDashboard';
import OfficerComplaints from './pages/officer/OfficerComplaints';

import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminComplaints  from './pages/admin/AdminComplaints';

// ── Placeholder for pages not built yet ───────────────────
const Placeholder = ({ name }) => (
  <div className="card p-8 max-w-sm">
    <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
    <p className="text-sm text-slate-400 mt-1">Coming in next phase</p>
  </div>
);

// ── Role → default dashboard path ─────────────────────────
const getDashboard = (role) => {
  if (role === 'admin')        return '/admin';
  if (role === 'ward_officer') return '/officer';
  return '/dashboard';
};

// ── Auth layout — centered card, gradient bg ───────────────
const AuthLayout = () => {
  const { user } = useAuthStore();
  if (user) return <Navigate to={getDashboard(user.role)} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-violet-600 rounded-2xl items-center justify-center text-3xl shadow-lg mb-4">
            🏛️
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CivicApp</h1>
          <p className="text-sm text-slate-500 mt-1">Municipal complaint management</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl p-8 shadow-lifted border border-slate-200">
          <Outlet />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} CivicApp · Built for better cities
        </p>
      </div>
    </div>
  );
};

// ── Dashboard layout — sidebar + top nav + main ────────────
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
};

// ── Private route — checks auth + role ────────────────────
const PrivateRoute = ({ children, role }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center text-3xl animate-pulse shadow-lg">
            🏛️
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={getDashboard(user.role)} replace />;
  }

  return children;
};

// ── Root App ───────────────────────────────────────────────
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

      {/* Citizen routes */}
      <Route element={
        <PrivateRoute role="citizen">
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route path="/dashboard"      element={<CitizenDashboard />} />
        <Route path="/my-complaints"  element={<MyComplaints />} />
        <Route path="/new-complaint"  element={<NewComplaint />} />
        <Route path="/complaints/:id" element={<ComplaintDetail />} />
      </Route>

      {/* Officer routes */}
      <Route element={
        <PrivateRoute role="ward_officer">
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route path="/officer"                element={<OfficerDashboard />} />
        <Route path="/officer/complaints"     element={<OfficerComplaints />} />
        <Route path="/officer/complaints/:id" element={<ComplaintDetail />} />
      </Route>

      {/* Admin routes */}
      <Route element={
        <PrivateRoute role="admin">
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route path="/admin"                element={<AdminDashboard />} />
        <Route path="/admin/complaints"     element={<AdminComplaints />} />
        <Route path="/admin/officers"       element={<Placeholder name="Officers" />} />
        <Route path="/admin/wards"          element={<Placeholder name="Wards" />} />
        <Route path="/admin/complaints/:id" element={<ComplaintDetail />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;