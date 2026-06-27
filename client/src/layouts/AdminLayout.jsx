import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Sprout, 
  BarChart3, 
  Bell, 
  LogOut, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Farms', path: '/admin/farms', icon: Sprout },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Alerts', path: '/admin/alerts', icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-mintBg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col z-10 shadow-xl">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 bg-primary-dark border-b border-primary-light">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌱</span>
            <div>
              <h1 className="font-bold text-lg font-outfit tracking-wide leading-none">MELEKAI</h1>
              <span className="text-xs text-secondary font-medium tracking-widest">SMART IRRIGATION</span>
            </div>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-secondary text-primary font-bold shadow-md shadow-secondary/10'
                    : 'text-gray-300 hover:bg-primary-light hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3 shrink-0 group-hover:scale-105 transition-transform" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-primary-light bg-primary-dark/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary-light p-2 rounded-full text-secondary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white leading-none truncate">{user?.name}</p>
              <span className="text-xs text-gray-400 capitalize">{user?.role} Portal</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 bg-danger-dark/30 border border-danger/35 hover:bg-danger text-white rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div>
            <h2 className="text-xl font-bold font-outfit text-textPrimary capitalize">
              System Administration
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-textMuted bg-mintBg px-3 py-1.5 rounded-full border border-secondary/20">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-emerald-800">API Link Secure</span>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
