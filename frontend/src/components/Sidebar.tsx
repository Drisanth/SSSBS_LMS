import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  BookOpen, 
  Users, 
  Search, 
  Settings, 
  LogOut, 
  LogIn 
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const publicLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/search', icon: Search, label: 'Search' },
  ];

  const teacherLinks = [
    { to: '/teacher', icon: Home, label: 'My Dashboard' },
    { to: '/materials', icon: BookOpen, label: 'My Materials' },
  ];

  const adminLinks = [
    { to: '/admin', icon: Home, label: 'Admin Dashboard' },
    { to: '/materials', icon: BookOpen, label: 'All Materials' },
    { to: '/teachers', icon: Users, label: 'Teachers' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : 
                user?.role === 'TEACHER' ? teacherLinks : 
                publicLinks;

  return (
    <div className="sidebar">
      <div className="flex items-center gap-2 mb-8 px-3">
        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold" style={{backgroundColor: 'var(--primary-color)'}}>
          S
        </div>
        <span className="font-bold text-lg">SSSBS LMS</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link 
              key={link.to} 
              to={link.to} 
              className={clsx('nav-item', isActive && 'active')}
              onClick={onClose}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        {user ? (
          <div className="flex flex-col gap-4">
            <div className="px-3">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-secondary">{user.role}</p>
            </div>
            <button onClick={logout} className="nav-item text-danger hover:text-danger w-full">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="nav-item text-primary">
            <LogIn size={18} />
            Teacher / Admin Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
