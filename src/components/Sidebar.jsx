import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Home,
  CalendarDays,
  Wallet,
  MessageSquare,
  Compass,
  MapPin,
  Bell,
  LogOut
} from 'lucide-react';
import { useAdminStore } from '../store';

const Sidebar = () => {
  const logout = useAdminStore((state) => state.logout);
  const isSidebarOpen = useAdminStore((state) => state.isSidebarOpen);
  const closeSidebar = useAdminStore((state) => state.closeSidebar);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Itineraries', path: '/itineraries', icon: Compass },
    { name: 'City Places', path: '/city-places', icon: MapPin },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Hosts', path: '/hosts', icon: UserCheck },
    { name: 'Properties', path: '/properties', icon: Home },
    { name: 'Bookings', path: '/bookings', icon: CalendarDays },
    { name: 'Withdrawals', path: '/withdrawals', icon: Wallet },
    { name: 'Support Chat', path: '/chat', icon: MessageSquare },
  ];


  return (
    <div className={`w-64 bg-[#151c2c] border-r border-[#242f47] flex flex-col h-screen fixed left-0 top-0 text-gray-300 z-30 transition-transform duration-300 md:translate-x-0 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-6 border-b border-[#242f47] flex items-center justify-center">
        <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
          <span className="text-indigo-500 font-extrabold">NESTO</span> <span className="text-gray-300 font-normal">Rooms</span>
        </h1>
      </div>
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#242f47] hover:text-white ${
                  isActive ? 'bg-[#242f47] text-white border-l-4 border-indigo-500 pl-3' : ''
                }`
              }
            >
              <Icon className="w-5 h-5 text-indigo-400" />
              {item.name}
            </NavLink>
          );
        })}
      </div>
      <div className="p-4 border-t border-[#242f47]">
        <button
          onClick={() => {
            closeSidebar();
            logout();
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
