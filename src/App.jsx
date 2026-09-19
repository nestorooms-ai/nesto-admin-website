import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAdminStore } from './store';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Hosts from './pages/Hosts';
import Properties from './pages/Properties';
import Bookings from './pages/Bookings';
import Withdrawals from './pages/Withdrawals';
import SupportChat from './pages/SupportChat';
import Itineraries from './pages/Itineraries';
import CityPlaces from './pages/CityPlaces';
import Notifications from './pages/Notifications';

// Protected layout containing Sidebar, Navbar and subpages
const AdminLayout = ({ title }) => {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const isSidebarOpen = useAdminStore((state) => state.isSidebarOpen);
  const closeSidebar = useAdminStore((state) => state.closeSidebar);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] overflow-x-hidden">
      <Sidebar />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden animate-fadeIn"
          onClick={closeSidebar}
        />
      )}
      <div className="pl-0 md:pl-64 min-h-screen flex flex-col transition-all duration-300">
        <Navbar title={title} />
        <main className="flex-1 p-4 md:p-8 bg-[#0b0f19]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<AdminLayout title="Dashboard" />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
        <Route element={<AdminLayout title="Itinerary Management" />}>
          <Route path="/itineraries" element={<Itineraries />} />
        </Route>
        <Route element={<AdminLayout title="City Places & Guides" />}>
          <Route path="/city-places" element={<CityPlaces />} />
        </Route>
        <Route element={<AdminLayout title="Users Directory" />}>
          <Route path="/users" element={<Users />} />
        </Route>
        <Route element={<AdminLayout title="Hosts Directory" />}>
          <Route path="/hosts" element={<Hosts />} />
        </Route>
        <Route element={<AdminLayout title="Properties Listings" />}>
          <Route path="/properties" element={<Properties />} />
        </Route>
        <Route element={<AdminLayout title="Bookings Registry" />}>
          <Route path="/bookings" element={<Bookings />} />
        </Route>
        <Route element={<AdminLayout title="User Withdrawals" />}>
          <Route path="/withdrawals" element={<Withdrawals />} />
        </Route>
        <Route element={<AdminLayout title="Live Support Chat" />}>
          <Route path="/chat" element={<SupportChat />} />
        </Route>
        <Route element={<AdminLayout title="Push Notifications Broadcast" />}>
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
