import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Users,
  UserCheck,
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2,
  Percent,
  ShieldAlert,
  CreditCard,
  CalendarDays,
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Financial Stats States
  const [activeTab, setActiveTab] = useState('overview');
  const [financeStats, setFinanceStats] = useState(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState('');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load overview stats on mount
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

  // Load financial stats when financial tab is selected or filters change
  useEffect(() => {
    if (activeTab !== 'finance') return;

    const fetchFinanceStats = async () => {
      setFinanceLoading(true);
      setFinanceError('');
      try {
        let url = `/api/admin/financial-stats?period=${period}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const response = await api.get(url);
        setFinanceStats(response.data.data);
      } catch (err) {
        setFinanceError(err.response?.data?.message || 'Failed to load financial statistics.');
      } finally {
        setFinanceLoading(false);
      }
    };

    fetchFinanceStats();
  }, [activeTab, period, startDate, endDate]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setPeriod('month');
  };

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

  const renderFinancialTab = () => {
    if (financeLoading) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      );
    }

    if (financeError) {
      return (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
          {financeError}
        </div>
      );
    }

    if (!financeStats) return null;

    const summary = financeStats.summary;
    const trend = financeStats.trend;

    const financeCards = [
      {
        title: 'Nesto Net Earnings',
        value: `₹${summary.nestoNetEarnings?.toLocaleString()}`,
        subtitle: 'Platform Fee + Host Comm. + Penalty',
        icon: DollarSign,
        color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/20'
      },
      {
        title: 'GST Collected',
        value: `₹${summary.totalGst?.toLocaleString()}`,
        subtitle: `Nesto: ₹${summary.gstWithNesto?.toLocaleString()} | Host: ₹${summary.gstWithHost?.toLocaleString()}`,
        icon: Percent,
        color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/20'
      },
      {
        title: 'Guest Platform Fees',
        value: `₹${summary.totalPlatformFee?.toLocaleString()}`,
        subtitle: 'Platform fee paid by guests',
        icon: CreditCard,
        color: 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/20'
      },
      {
        title: 'Host Payouts (Paid)',
        value: `₹${summary.totalPaidOut?.toLocaleString()}`,
        subtitle: 'Total processed host payouts',
        icon: TrendingUp,
        color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20'
      },
      {
        title: 'Booking Commission',
        value: `₹${summary.totalCommission?.toLocaleString()}`,
        subtitle: 'Commissions kept by Nesto',
        icon: DollarSign,
        color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/20'
      },
      {
        title: 'Host Penalties Applied',
        value: `₹${summary.totalPenalty?.toLocaleString()}`,
        subtitle: 'Penalties charged to hosts',
        icon: ShieldAlert,
        color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/20'
      }
    ];

    const maxVal = Math.max(...trend.map(t => Math.max(t.nestoEarnings, t.paidOut, t.gst, 1)));

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Finance Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="glass-card p-6 rounded-xl border border-[#242f47] flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400 font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-white">{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} border flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 border-t border-[#242f47]/50 pt-2">{card.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* Visual Trend Chart */}
        <div className="glass-card rounded-xl p-6 border border-[#242f47] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#242f47]/50 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Earning & Payout Trends</h3>
              <p className="text-xs text-gray-400">Visual trend overview based on selected period aggregation</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> Nesto Net Earnings
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Host Payouts
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500 inline-block" /> GST Collected
              </span>
            </div>
          </div>

          {trend.length > 0 ? (
            <div className="relative pt-6 px-4 border border-[#242f47]/60 rounded-xl bg-[#151c2c]/10">
              {/* Y-axis gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-6 text-[10px] text-gray-700">
                <div className="border-b border-[#242f47]/30 w-full pt-1" />
                <div className="border-b border-[#242f47]/30 w-full pt-1" />
                <div className="border-b border-[#242f47]/30 w-full pt-1" />
                <div className="border-b border-[#242f47]/30 w-full pt-1" />
                <div className="w-full pt-1" />
              </div>

              <div className="h-72 flex items-end justify-between gap-4 overflow-x-auto pb-4 scrollbar-thin">
                {trend.map((t, idx) => {
                  const earningsHeight = `${(t.nestoEarnings / maxVal) * 100}%`;
                  const payoutsHeight = `${(t.paidOut / maxVal) * 100}%`;
                  const gstHeight = `${(t.gst / maxVal) * 100}%`;

                  return (
                    <div key={idx} className="flex-1 min-w-[60px] flex flex-col items-center group relative z-10">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col bg-[#151c2c] border border-[#242f47] p-3 rounded-lg shadow-2xl text-[11px] text-gray-300 w-48 z-30 pointer-events-none transition-all">
                        <p className="font-semibold text-white mb-1.5 border-b border-[#242f47] pb-1">{t.period}</p>
                        <div className="space-y-1 text-left">
                          <div className="flex justify-between">
                            <span>GST:</span>
                            <span className="text-purple-400 font-semibold">₹{t.gst.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Plat Fee:</span>
                            <span>₹{t.platformFee.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Host Commission:</span>
                            <span>₹{t.commission.toLocaleString()}</span>
                          </div>
                          {t.penalty > 0 && (
                            <div className="flex justify-between text-amber-400">
                              <span>Host Penalty:</span>
                              <span>₹{t.penalty.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-[#242f47] pt-1 font-semibold text-indigo-400 mt-1">
                            <span>Nesto Net:</span>
                            <span>₹{t.nestoEarnings.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-emerald-400 font-semibold">
                            <span>Host Payouts:</span>
                            <span>₹{t.paidOut.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Bars Container */}
                      <div className="w-full flex items-end justify-center gap-1.5 h-48 mb-2">
                        {/* Nesto Earnings Bar */}
                        <div
                          style={{ height: earningsHeight }}
                          className="w-3.5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all duration-300 hover:brightness-125 cursor-pointer"
                        />
                        {/* Host Payouts Bar */}
                        <div
                          style={{ height: payoutsHeight }}
                          className="w-3.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-300 hover:brightness-125 cursor-pointer"
                        />
                        {/* GST Bar */}
                        <div
                          style={{ height: gstHeight }}
                          className="w-3.5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-300 hover:brightness-125 cursor-pointer"
                        />
                      </div>

                      {/* Period Label */}
                      <span className="text-[10px] text-gray-400 font-medium truncate max-w-full">{t.period}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 border border-dashed border-[#242f47] rounded-xl bg-[#151c2c]/5">
              No trend data available for this range.
            </div>
          )}
        </div>

        {/* Breakdown Ledger Table */}
        <div className="glass-card rounded-xl p-6 border border-[#242f47]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Periodical Breakdown</h3>
              <p className="text-xs text-gray-400">Detailed financial summary grouped by the current period filter</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#151c2c] text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-l-lg">Period</th>
                  <th className="px-6 py-4">GST Collected</th>
                  <th className="px-6 py-4">Platform Fees</th>
                  <th className="px-6 py-4">Host Commissions</th>
                  <th className="px-6 py-4">Host Penalty</th>
                  <th className="px-6 py-4">Nesto Net Earning</th>
                  <th className="px-6 py-4 rounded-r-lg">Host Payouts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242f47]">
                {trend.length > 0 ? (
                  trend.map((row) => (
                    <tr key={row.period} className="hover:bg-[#151c2c]/40 transition duration-150">
                      <td className="px-6 py-4 text-white font-medium">{row.period}</td>
                      <td className="px-6 py-4 text-purple-400">₹{row.gst.toLocaleString()}</td>
                      <td className="px-6 py-4">₹{row.platformFee.toLocaleString()}</td>
                      <td className="px-6 py-4">₹{row.commission.toLocaleString()}</td>
                      <td className="px-6 py-4 text-amber-500">₹{row.penalty.toLocaleString()}</td>
                      <td className="px-6 py-4 text-indigo-400 font-semibold">₹{row.nestoEarnings.toLocaleString()}</td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">₹{row.paidOut.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No transactional history found for selected filters.
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

  return (
    <div className="space-y-8">
      {/* Header and Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Overview & Finance</h1>
          <p className="text-sm text-gray-400">Real-time stats, bookings breakdown, and financial performance audits.</p>
        </div>

        <div className="flex border border-[#242f47] p-1 rounded-xl bg-[#151c2c]/80 backdrop-blur">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-[#242f47] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'finance'
                ? 'bg-[#242f47] text-white shadow-md border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Financial Performance
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Filters Row - Only visible when in Finance tab */}
      {activeTab === 'finance' && (
        <div className="glass-card rounded-xl p-6 border border-[#242f47] flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Period selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Group by Period</span>
              <div className="flex border border-[#242f47] rounded-lg overflow-hidden bg-[#0b0f19]/60">
                {['day', 'week', 'month', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      period === p
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:bg-[#242f47] hover:text-white'
                    }`}
                  >
                    {p}ly
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Dates */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-400 font-medium">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0b0f19]/60 border border-[#242f47] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-400 font-medium">End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0b0f19]/60 border border-[#242f47] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 border border-[#242f47] px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#242f47]/50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      )}

      {/* Main Panel Content Rendering */}
      {activeTab === 'overview' ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="glass-card p-6 rounded-xl border border-[#242f47] flex items-center justify-between transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl">
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
      ) : (
        renderFinancialTab()
      )}
    </div>
  );
};

export default Dashboard;
