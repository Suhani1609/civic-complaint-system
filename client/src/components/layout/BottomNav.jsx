import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const NAV = {
  citizen: [
    { path: '/dashboard',     icon: '🏠', label: 'Home'       },
    { path: '/my-complaints', icon: '📋', label: 'Complaints' },
    { path: '/new-complaint', icon: '➕', label: 'New'        },
  ],
  ward_officer: [
    { path: '/officer',            icon: '🏠', label: 'Home'       },
    { path: '/officer/complaints', icon: '📋', label: 'Complaints' },
  ],
  admin: [
    { path: '/admin',            icon: '🏠', label: 'Home'       },
    { path: '/admin/complaints', icon: '📋', label: 'Complaints' },
    { path: '/admin/officers',   icon: '👮', label: 'Officers'   },
  ],
};

const BottomNav = () => {
  const { user } = useAuthStore();
  const items = NAV[user?.role] || [];

  if (!user) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-slate-200 pb-safe">
      <div className="flex items-stretch">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center gap-1
              py-3 text-xs font-semibold transition-colors
              ${isActive
                ? 'text-violet-600 bg-violet-50/60'
                : 'text-slate-400 hover:text-slate-600'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-violet-600 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;