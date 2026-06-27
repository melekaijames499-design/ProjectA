import React, { useContext, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FarmContext } from '../context/FarmContext';
import { 
  LayoutDashboard, 
  History, 
  LogOut,
  Eye,
  Warehouse
} from 'lucide-react';

export const ViewerLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const { farm, summary, setActiveFarmId } = useContext(FarmContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/viewer/dashboard', icon: LayoutDashboard },
    { name: 'Sensor History', path: '/viewer/history', icon: History },
  ];

  // If viewer does not have an assigned farmId (e.g. is system wide viewer), we can let them inspect Farm 1 by default (Melekai Farm)
  useEffect(() => {
    if (user) {
      if (user.farmId) {
        setActiveFarmId(user.farmId);
      } else {
        // Fallback to demo farm ID from localstorage or hardcoded seed guess (we will manage this dynamically in dashboard)
        console.log('System viewer: farm context will be assigned on page load.');
      }
    }
  }, [user, setActiveFarmId]);

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
              <Eye className="h-5 w-5" />
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
          <div className="flex items-center space-x-3">
            <Warehouse className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-textPrimary leading-none">
                {farm ? farm.name : 'System-Wide Monitoring'}
              </h2>
              {farm && (
                <span className="text-xs text-textMuted font-medium">
                  {farm.location} • {farm.area} Acres • crop: {farm.cropType}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-amber-800 bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-semibold">Read-Only Session</span>
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

export default ViewerLayout;
