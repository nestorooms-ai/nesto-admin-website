import React from 'react';
import { useAdminStore } from '../store';
import { User, Menu } from 'lucide-react';

const Navbar = ({ title }) => {
  const admin = useAdminStore((state) => state.admin);
  const toggleSidebar = useAdminStore((state) => state.toggleSidebar);

  return (
    <div className="h-16 bg-[#151c2c]/80 backdrop-blur-md border-b border-[#242f47] flex items-center justify-between px-4 md:px-8 text-gray-300 sticky top-0 z-10 transition-all duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#242f47]/50 transition"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base md:text-lg font-semibold text-white truncate">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">{admin?.firstName || 'Admin'} {admin?.lastName || 'User'}</p>
          <p className="text-xs text-gray-400">{admin?.email}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <User className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
