import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const NAV = {
  citizen: [
    { path: '/dashboard',     label: 'Home',          icon: '🏠' },
    { path: '/my-complaints', label: 'My Complaints',  icon: '📋' },
    { path: '/new-complaint', label: 'New Complaint',  icon: '➕' },
  ],
  ward_officer: [
    { path: '/officer',            label: 'Home',               icon: '🏠' },
    { path: '/officer/complaints', label: 'Assigned Complaints', icon: '📋' },
  ],
  admin: [
    { path: '/admin',             label: 'Home',          icon: '🏠' },
    { path: '/admin/complaints',  label: 'All Complaints', icon: '📋' },
    { path: '/admin/officers',    label: 'Officers',       icon: '👮' },
    { path: '/admin/wards',       label: 'Wards',          icon: '🗺️' },
  ],
};

const ROLE_LABEL = {
  citizen:      'Citizen',
  ward_officer: 'Ward Officer',
  admin:        'Administrator',
};

const ROLE_COLOR = {
  citizen:      'bg-blue-100 text-blue-700',
  ward_officer: 'bg-purple-100 text-purple-700',
  admin:        'bg-rose-100 text-rose-700',
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const items = NAV[user?.role] || [];

  return (
    <>
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white z-30
        flex flex-col border-r border-slate-200
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-lg shadow-sm">
            🏛️
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">CivicApp</div>
            <div className={`text-xs px-1.5 py-0.5 rounded-md font-medium w-fit mt-0.5 ${ROLE_COLOR[user?.role]}`}>
              {ROLE_LABEL[user?.role]}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-violet-50 text-violet-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User profile at bottom */}
        <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700 flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;