import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuClick, title }) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors text-lg"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* Right: notification + avatar + logout */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notification bell placeholder */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors relative">
          🔔
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="ml-1 text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50 font-medium"
        >
          Sign out
        </button>
      </div>
    </header>
  );
};

export default Navbar;