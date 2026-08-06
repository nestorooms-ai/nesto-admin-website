import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Users,
  UserCheck,
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/admin/dashboard-stats');
        setStats(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
        {error}
      </div>
    );
  }

  const cards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: 'from-green-500/20 to-emerald-500/10 text-green-400 border-green-500/20' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-indigo-500/20 to-blue-500/10 text-indigo-400 border-indigo-500/20' },
    { title: 'Total Hosts', value: stats.totalHosts, icon: UserCheck, color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/20' },
    { title: 'Total Properties', value: stats.totalProperties, icon: Home, color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/20' },
    { title: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/20' },
    { title: 'Active Bookings', value: stats.activeBookings, icon: TrendingUp, color: 'from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Overview</h1>
        <p className="text-sm text-gray-400">Real-time statistics and analytics for Nesto Rooms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={`glass-card p-6 rounded-xl border border-[#242f47] flex items-center justify-between transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl`}>
              <div className="space-y-2">
                <p className="text-sm text-gray-400 font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} border flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend Ledger */}
      <div className="glass-card rounded-xl p-6 border border-[#242f47]">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Monthly Revenue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#151c2c] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-l-lg">Month</th>
                <th className="px-6 py-4">Completed Bookings</th>
                <th className="px-6 py-4 rounded-r-lg">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242f47]">
              {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                stats.monthlyRevenue.map((row) => (
                  <tr key={row._id} className="hover:bg-[#151c2c]/40 transition duration-150">
                    <td className="px-6 py-4 text-white font-medium">{row._id}</td>
                    <td className="px-6 py-4">{row.count}</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">₹{row.revenue?.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    No monthly data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
