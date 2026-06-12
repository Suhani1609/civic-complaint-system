import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = {
  citizen: [
    { path: '/dashboard',      label: 'Dashboard',       icon: '🏠' },
    { path: '/my-complaints',  label: 'My Complaints',   icon: '📋' },
    { path: '/new-complaint',  label: 'New Complaint',   icon: '➕' },
  ],
  ward_officer: [
    { path: '/officer',             label: 'Dashboard',           icon: '🏠' },
    { path: '/officer/complaints',  label: 'Assigned Complaints', icon: '📋' },
  ],
  admin: [
    { path: '/admin',           label: 'Dashboard',    icon: '🏠' },
    { path: '/admin/complaints',label: 'All Complaints',icon: '📋' },
    { path: '/admin/officers',  label: 'Officers',     icon: '👮' },
    { path: '/admin/wards',     label: 'Wards',        icon: '🗺️' },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const items = NAV_ITEMS[user?.role] || [];

  return (
    <aside className={`
      fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-30
      flex flex-col transition-transform duration-200
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    `}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-200 flex-shrink-0">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-base">
          🏛️
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">CivicApp</div>
          <div className="text-xs text-gray-400 capitalize">
            {user?.role?.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {items.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                   ${isActive
                     ? 'bg-primary-50 text-primary-700'
                     : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                   }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 capitalize">
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;