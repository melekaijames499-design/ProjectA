import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FarmContext } from '../context/FarmContext';
import { 
  LayoutDashboard, 
  FileInput, 
  Droplet, 
  Bell, 
  Calendar, 
  Sliders, 
  History, 
  LogOut,
  Warehouse,
  Tractor
} from 'lucide-react';

export const FarmerLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const { farm, summary } = useContext(FarmContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: 'Manual Input', path: '/farmer/input', icon: FileInput },
    { name: 'Pump Control', path: '/farmer/pump', icon: Droplet },
    { name: 'Alerts', path: '/farmer/alerts', icon: Bell },
    { name: 'Schedules', path: '/farmer/schedules', icon: Calendar },
    { name: 'Thresholds', path: '/farmer/thresholds', icon: Sliders },
    { name: 'History Logs', path: '/farmer/history', icon: History },
  ];

  const alertBadgeCount = summary?.activeAlertsCount || 0;

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
              <span className="flex-1">{item.name}</span>
              {item.name === 'Alerts' && alertBadgeCount > 0 && (
                <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {alertBadgeCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-primary-light bg-primary-dark/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary-light p-2 rounded-full text-secondary">
              <Tractor className="h-5 w-5" />
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
                {farm ? farm.name : 'Loading Farm...'}
              </h2>
              {farm && (
                <span className="text-xs text-textMuted font-medium">
                  {farm.location} • {farm.area} Acres • crop: {farm.cropType}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Real-time sync indicator */}
            <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/50 px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-semibold">Live Monitor Active</span>
            </div>

            {/* Notification Icon */}
            <div className="relative cursor-pointer" onClick={() => navigate('/farmer/alerts')}>
              <Bell className="h-6 w-6 text-gray-500 hover:text-primary transition-colors" />
              {alertBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                  {alertBadgeCount}
                </span>
              )}
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

export default FarmerLayout;
